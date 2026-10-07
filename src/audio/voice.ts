/**
 * The narrator and every character's voice.
 *
 *   lines     → audio/lines/<id>.mp3   (whole lines: phrases, story lines;
 *                                     the id includes the speaker, `voiceId`)
 *   pieces    → audio/pieces/<id>.mp3  (the fixed parts of question templates)
 *   numbers   → audio/numbers/<n>-mid.mp3 and <n>-end.mp3 (0–100, two intonations)
 *
 * Questions with numbers in them (`speech`) are played as pieces and
 * number clips back to back. Until the recordings exist (workstream W8,
 * ElevenLabs), everything falls back to the iPad's own British voice.
 * Only one voice clip plays at a time.
 */
import { generic, lineId, personalise, voiceId } from '../core/phrases';
import { speechParts, speechText, type Speech } from '../core/problem';
import { audio, buses } from './engine';

interface Manifest {
  lines: string[];
  pieces: string[];
  numbers: number[];
}

let manifest: Manifest = { lines: [], pieces: [], numbers: [] };
let manifestLoaded: Promise<void> | null = null;

let playerName = '';
/** The child's name, used in lines containing {name}. */
export function setPlayerName(name: string): void {
  playerName = name.trim();
}

const buffers = new Map<string, Promise<AudioBuffer | null>>();
let current: { stop: () => void } | null = null;

const base = (): string => new URL('./audio/', document.baseURI).href;

export function loadManifest(): Promise<void> {
  manifestLoaded ??= fetch(base() + 'manifest.json')
    .then((r) => (r.ok ? r.json() : manifest))
    .then((m: Partial<Manifest>) => {
      manifest = { lines: m.lines ?? [], pieces: m.pieces ?? [], numbers: m.numbers ?? [] };
    })
    .catch(() => {});
  return manifestLoaded;
}

function fetchBuffer(url: string): Promise<AudioBuffer | null> {
  let p = buffers.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then((data) => audio().decodeAudioData(data))
      .catch(() => null);
    buffers.set(url, p);
  }
  return p;
}

function playBuffer(buf: AudioBuffer, rate = 1): Promise<void> {
  stopClip();
  return new Promise((resolve) => {
    const src = audio().createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    src.connect(buses.voice);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      if (current?.stop === stopThis) current = null;
      resolve();
    };
    const stopThis = () => {
      try {
        src.stop();
      } catch {
        /* already stopped */
      }
      finish();
    };
    src.onended = finish;
    current = { stop: stopThis };
    src.start();
  });
}

let britishVoice: SpeechSynthesisVoice | null | undefined;
function pickVoice(): SpeechSynthesisVoice | null {
  if (britishVoice !== undefined) return britishVoice;
  const voices = window.speechSynthesis?.getVoices() ?? [];
  if (!voices.length) return null;
  const gb = voices.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith('en-gb'));
  britishVoice =
    gb.find((v) => /premium|enhanced/i.test(v.name)) ?? gb.find((v) => /serena|kate|stephanie|daniel/i.test(v.name)) ?? gb[0] ?? null;
  return britishVoice;
}

function speak(text: string, rate = 0.85): Promise<void> {
  stop();
  const synth = window.speechSynthesis;
  if (!synth) return Promise.resolve();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-GB';
    u.rate = rate;
    u.pitch = 1.05;
    const v = pickVoice();
    if (v) u.voice = v;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    u.onend = finish;
    u.onerror = finish;
    // Safety net: Safari occasionally never fires onend.
    setTimeout(finish, 1200 + text.length * 120);
    current = {
      stop: () => {
        synth.cancel();
        finish();
      },
    };
    synth.speak(u);
  });
}

/**
 * In development, once there are recordings, says in the console when
 * something falls back to the iPad's voice: a line scripts/voice/export.ts
 * missed, or one changed since it was recorded.
 */
function unrecorded(what: string): void {
  if (import.meta.env.DEV && manifest.lines.length) console.warn(`[voice] not recorded, the iPad says it: ${what}`);
}

/** The `speech` sequence playing now (a new one, or stop(), ends it). */
let speaking: object | null = null;

/** Stops the clip playing now (but not a `speech` sequence it belongs to). */
function stopClip(): void {
  const c = current;
  current = null;
  c?.stop();
}

/** Stops all speech. */
export function stop(): void {
  speaking = null;
  stopClip();
}

const lineUrl = (id: string) => `${base()}lines/${id}.mp3`;
const pieceUrl = (id: string) => `${base()}pieces/${id}.mp3`;
const numberUrl = (n: number, end: boolean) => `${base()}numbers/${n}-${end ? 'end' : 'mid'}.mp3`;
/**
 * A question piece's id: its words as written. (Not `personalise`d: with no
 * name that would capitalise "is" into "Is", a different clip. A bare
 * {name} slot is its own piece, the child's name.)
 */
const pieceId = (piece: string) => lineId(piece === '{name}' ? playerName : piece);

export const voice = {
  /**
   * Says a line in a speaker's voice (a character id, default the
   * narrator). "{name}" is filled in with the child's name: the recording
   * with his name is used if there is one, else the version without a name.
   */
  async say(template: string, who = 'narrator'): Promise<void> {
    stop();
    await loadManifest();
    const personal = personalise(template, playerName);
    for (const text of [personal, generic(template)]) {
      const id = voiceId(text, who);
      if (manifest.lines.includes(id)) {
        const buf = await fetchBuffer(lineUrl(id));
        if (buf) return playBuffer(buf);
      }
    }
    unrecorded(`${who}: “${generic(template)}”`);
    return speak(personal, 0.9);
  },

  /**
   * Says a question or explanation with numbers in it. Uses recorded
   * pieces and number clips when every one exists, else the iPad's voice.
   */
  async speech(s: Speech): Promise<void> {
    await loadManifest();
    const parts = speechParts(s);
    const recorded = parts.every((p) =>
      'piece' in p ? manifest.pieces.includes(pieceId(p.piece)) : typeof p.value === 'number' && manifest.numbers.includes(p.value),
    );
    stop();
    if (!recorded) {
      unrecorded(`question: “${s.text}” with ${JSON.stringify(s.vals ?? {})}`);
      return speak(personalise(speechText(s), playerName), 0.85);
    }
    const token = {};
    speaking = token;
    for (const p of parts) {
      if (speaking !== token) return;
      const url = 'piece' in p ? pieceUrl(pieceId(p.piece)) : numberUrl(p.value as number, p.end);
      const buf = await fetchBuffer(url);
      if (speaking !== token) return;
      if (buf) await playBuffer(buf);
    }
  },

  /** Warms the cache so the first tap answers instantly. Lines are the narrator's unless they say who. */
  async preload(o: { lines?: Array<string | { text: string; who?: string }> }): Promise<void> {
    await loadManifest();
    const jobs: Promise<unknown>[] = [];
    for (const l of o.lines ?? []) {
      const { text: t, who } = typeof l === 'string' ? { text: l, who: undefined } : l;
      const id = [personalise(t, playerName), generic(t)].map((x) => voiceId(x, who)).find((x) => manifest.lines.includes(x));
      if (id) jobs.push(fetchBuffer(lineUrl(id)));
    }
    await Promise.all(jobs);
  },

  stop,
};

// iOS loads speech voices lazily.
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    britishVoice = undefined;
  };
}
