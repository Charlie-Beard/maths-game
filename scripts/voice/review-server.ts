/**
 * Dev-server endpoints behind /review.html, where a grown-up listens to
 * every recorded clip and marks the wrong ones. Verdicts are saved to
 * scripts/voice/review.json with the clip's hash, so a re-recorded clip
 * shows up as needing another listen, and generate.py --redo re-records
 * only the clips marked wrong. Ported from Wizard Words.
 */
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { join } from 'node:path';
import type { Plugin } from 'vite';

const AUDIO = 'public/audio';
const VOICE = 'scripts/voice';
const TAKES = join(VOICE, 'takes');
const KINDS = ['lines', 'pieces', 'numbers'] as const;

export interface Verdict {
  verdict: 'ok' | 'bad';
  note?: string;
  /** Hash of the clip that was judged. */
  hash: string;
  at: string;
}

interface Exported {
  lines: { id: string; text: string; speaker: string; where: string; risky?: string }[];
  pieces: { id: string; text: string; example: string; speech?: { text: string; vals?: Record<string, number | string> } }[];
  numbers: number[];
}

const hash = (path: string) => createHash('sha1').update(readFileSync(path)).digest('hex').slice(0, 10);
const readJson = <T>(path: string, fallback: T): T => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : fallback);
const mp3s = (dir: string) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)) : []);
const clipPath = (kind: string, id: string, take?: string) =>
  take ? join(TAKES, kind, id, `${take}.mp3`) : join(AUDIO, kind, `${id}.mp3`);
const safe = (s: unknown): s is string => typeof s === 'string' && /^[\w.-]+$/.test(s);

function parseKey(key: unknown): { kind: string; id: string } | null {
  if (typeof key !== 'string') return null;
  const [kind, id] = key.split('/');
  return (KINDS as readonly string[]).includes(kind) && safe(id) && existsSync(clipPath(kind, id)) ? { kind, id } : null;
}

function state() {
  const data = readJson<Exported>(join(VOICE, 'lines.json'), { lines: [], pieces: [], numbers: [] });
  const manifest = readJson<{ lines?: string[]; pieces?: string[]; numbers?: number[] }>(join(AUDIO, 'manifest.json'), {});
  const numberIds = (ns: number[]) => ns.flatMap((n) => [`${n}-mid`, `${n}-end`]);
  const ids: Record<(typeof KINDS)[number], string[]> = {
    lines: manifest.lines ?? [],
    pieces: manifest.pieces ?? [],
    numbers: numberIds(manifest.numbers ?? []),
  };
  const clips: Record<string, { id: string; hash: string; takes: { label: string; hash: string }[] }[]> = {};
  for (const kind of KINDS) {
    clips[kind] = ids[kind].map((id) => ({
      id,
      hash: hash(clipPath(kind, id)),
      takes: mp3s(join(TAKES, kind, id)).map((label) => ({ label, hash: hash(clipPath(kind, id, label)) })),
    }));
  }
  return {
    clips,
    // The order the game says them in.
    order: { lines: data.lines.map((l) => l.id), pieces: data.pieces.map((p) => p.id), numbers: numberIds(data.numbers) },
    lines: Object.fromEntries(data.lines.map((l) => [l.id, { text: l.text, speaker: l.speaker, where: l.where, risky: l.risky }])),
    pieces: Object.fromEntries(data.pieces.map((p) => [p.id, { text: p.text, example: p.example, speech: p.speech }])),
    // Which clips exist, so the page can stitch a whole question together.
    manifest: { pieces: ids.pieces, numbers: manifest.numbers ?? [] },
    qa: readJson<{ clips: Record<string, unknown> }>(join(VOICE, 'qa.json'), { clips: {} }).clips,
    review: readJson<Record<string, Verdict>>(join(VOICE, 'review.json'), {}),
  };
}

function body(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch (e) {
        reject(e);
      }
    });
  });
}

function send(res: ServerResponse, status: number, payload: unknown, type = 'application/json') {
  res.statusCode = status;
  res.setHeader('Content-Type', type);
  res.setHeader('Cache-Control', 'no-store');
  res.end(type === 'application/json' ? JSON.stringify(payload) : (payload as Buffer));
}

/** Keeps the current clip as a take (unless an identical one exists), then puts the take in its place. */
function useTake(kind: string, id: string, take: string) {
  const cur = clipPath(kind, id);
  const dir = join(TAKES, kind, id);
  mkdirSync(dir, { recursive: true });
  const h = hash(cur);
  if (!mp3s(dir).some((t) => hash(clipPath(kind, id, t)) === h)) {
    const keep = existsSync(clipPath(kind, id, 'previous')) ? `previous-${h.slice(0, 6)}` : 'previous';
    copyFileSync(cur, clipPath(kind, id, keep));
  }
  copyFileSync(clipPath(kind, id, take), cur);
}

export function voiceReview(): Plugin {
  return {
    name: 'voice-review',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__voice', async (req, res) => {
        try {
          const url = new URL(req.url ?? '/', 'http://x');
          if (req.method === 'GET' && url.pathname === '/state') return send(res, 200, state());

          // /audio/<kind>/<id>.mp3 or /audio/<kind>/<id>/<take>.mp3
          const m = url.pathname.match(/^\/audio\/(\w+)\/([\w.-]+?)(?:\/([\w.-]+))?\.mp3$/);
          if (req.method === 'GET' && m) {
            const key = parseKey(`${m[1]}/${m[2]}`);
            const path = key && clipPath(key.kind, key.id, m[3]);
            if (!path || !existsSync(path)) return send(res, 404, { error: 'no such clip' });
            return send(res, 200, readFileSync(path), 'audio/mpeg');
          }

          if (req.method === 'POST' && url.pathname === '/review') {
            const b = await body(req);
            const key = parseKey(b.key);
            if (!key) return send(res, 400, { error: 'bad key' });
            const file = join(VOICE, 'review.json');
            const review = readJson<Record<string, Verdict>>(file, {});
            const k = `${key.kind}/${key.id}`;
            if (b.verdict === 'ok' || b.verdict === 'bad') {
              const note = typeof b.note === 'string' ? b.note.trim().slice(0, 500) : '';
              review[k] = { verdict: b.verdict, ...(note ? { note } : {}), hash: hash(clipPath(key.kind, key.id)), at: new Date().toISOString() };
            } else delete review[k];
            const sorted = Object.fromEntries(Object.entries(review).sort(([a], [b2]) => a.localeCompare(b2)));
            writeFileSync(file, JSON.stringify(sorted, null, 1) + '\n');
            return send(res, 200, review[k] ?? null);
          }

          if (req.method === 'POST' && url.pathname === '/use') {
            const b = await body(req);
            const key = parseKey(b.key);
            if (!key || !safe(b.take) || !existsSync(clipPath(key.kind, key.id, b.take))) return send(res, 400, { error: 'bad take' });
            useTake(key.kind, key.id, b.take);
            return send(res, 200, state());
          }

          send(res, 404, { error: 'not found' });
        } catch (e) {
          send(res, 500, { error: String(e) });
        }
      });
    },
  };
}
