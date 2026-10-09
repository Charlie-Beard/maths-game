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
import { onPause, paused, whenPlaying } from '../ui/pause';
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

/**
 * A fetch that gives up after a while. The play scene waits for the voice
 * after every right answer, so a request stuck on a poor connection must
 * not hold the screen: giving up just means the iPad's own voice speaks.
 */
function fetchSoon(url: string, ms = 6000): Promise<Response> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  return fetch(url, { signal: ctl.signal }).finally(() => clearTimeout(t));
}

export function loadManifest(): Promise<void> {
  manifestLoaded ??= fetchSoon(base() + 'manifest.json')
    .then((r) => (r.ok ? r.json() : manifest))
    .then((m: Partial<Manifest>) => {
      manifest = { lines: m.lines ?? [], pieces: m.pieces ?? [], numbers: m.numbers ?? [] };
    })
    .catch(() => {});
  return manifestLoaded;
}

/**
 * Decoded clips are big (about 190 KB for every second of speech), and a
 * long session says thousands of different lines, so the cache keeps only
 * the most recently used couple of minutes. The pieces and numbers that
 * every question uses stay warm; a story line he heard ten chapters ago
 * is fetched again from the browser's own cache if it is ever needed.
 */
const MAX_CACHED_SECONDS = 120;
const cachedSeconds = new Map<string, number>();
let cachedTotal = 0;

function remember(url: string, buf: AudioBuffer): void {
  cachedSeconds.set(url, buf.duration);
  cachedTotal += buf.duration;
  // Oldest first (a Map keeps the order they were last used in); never the one just decoded.
  for (const old of buffers.keys()) {
    if (cachedTotal <= MAX_CACHED_SECONDS) break;
    const secs = cachedSeconds.get(old);
    if (old === url || secs === undefined) continue;
    cachedTotal -= secs;
    cachedSeconds.delete(old);
    buffers.delete(old);
  }
}

function fetchBuffer(url: string): Promise<AudioBuffer | null> {
  let p = buffers.get(url);
  if (p) {
    // Used again: move it to the back of the queue for going.
    buffers.delete(url);
    buffers.set(url, p);
    return p;
  }
  p = fetchSoon(url)
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
    .then((data) => audio().decodeAudioData(data))
    .then((buf) => {
      if (buffers.get(url) === p) remember(url, buf);
      return buf;
    })
    .catch(() => null);
  buffers.set(url, p);
  return p;
}

/** Resolves true when the clip played to its end, false when something stopped it. */
function playBuffer(buf: AudioBuffer, rate = 1): Promise<boolean> {
  stopClip();
  return new Promise((resolve) => {
    const src = audio().createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    src.connect(buses.voice);
    let done = false;
    const finish = (completed: boolean) => {
      if (done) return;
      done = true;
      if (current?.stop === stopThis) current = null;
      resolve(completed);
    };
    const stopThis = () => {
      try {
        src.stop();
      } catch {
        /* already stopped */
      }
      finish(false);
    };
    // Stopping a source also fires onended, so `stopThis` must get in first.
    src.onended = () => finish(true);
    // Safety net: when iOS suspends the audio (a call, Siri, coming back to
    // the app) the clip never plays and onended never fires. Carry on as if
    // it was said, and make sure it can't start late over the next line.
    setTimeout(() => {
      if (done) return;
      try {
        src.stop();
      } catch {
        /* never started */
      }
      finish(true);
    }, (buf.duration / rate) * 1000 + 1500);
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

/** Resolves true when the iPad finished saying it, false when it was cut off. */
function speak(text: string, rate = 0.85): Promise<boolean> {
  stopClip();
  const synth = window.speechSynthesis;
  if (!synth) return Promise.resolve(false);
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-GB';
    u.rate = rate;
    u.pitch = 1.05;
    const v = pickVoice();
    if (v) u.voice = v;
    let done = false;
    const finish = (completed: boolean) => {
      if (done) return;
      done = true;
      resolve(completed);
    };
    u.onend = () => finish(true);
    // Cancelling fires an error event too; the stop below has already said false.
    u.onerror = () => finish(false);
    // Safety net: Safari occasionally never fires onend.
    setTimeout(() => finish(true), 1200 + text.length * 120);
    current = {
      stop: () => {
        synth.cancel();
        finish(false);
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

/**
 * The line or `speech` sequence that owns the voice now. A new one, or
 * stop(), takes it away, so a line still loading when it is cancelled
 * stays silent instead of playing late.
 */
let speaking: object | null = null;

/** Stops the clip playing now (but not a `speech` sequence it belongs to). */
function stopClip(): void {
  const c = current;
  current = null;
  c?.stop();
}

/**
 * Plays a line for `token`, holding it while the game is paused (ui/pause.ts).
 * The pause cuts off the clip playing; once he's back the line is said
 * again from its start, so he never misses one and the caller just waits.
 */
async function held(token: object, play: () => Promise<boolean>): Promise<boolean> {
  for (;;) {
    await whenPlaying();
    if (speaking !== token) return false;
    const finished = await play();
    if (finished || speaking !== token || !paused()) return finished;
  }
}

// Nothing is said while the game is paused: cut off what's playing (`held` says it again).
onPause((p) => p && stopClip());

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
   *
   * Resolves true only if the line played to its end. False means it was
   * interrupted or stopped, so callers must not carry on as if it finished.
   */
  async say(template: string, who = 'narrator'): Promise<boolean> {
    stop();
    const token = {};
    speaking = token;
    await loadManifest();
    const personal = personalise(template, playerName);
    for (const text of [personal, generic(template)]) {
      const id = voiceId(text, who);
      if (manifest.lines.includes(id)) {
        const buf = await fetchBuffer(lineUrl(id));
        if (speaking !== token) return false;
        if (buf) return held(token, () => playBuffer(buf));
      }
    }
    if (speaking !== token) return false;
    unrecorded(`${who}: “${generic(template)}”`);
    return held(token, () => speak(personal, 0.9));
  },

  /**
   * Says a question or explanation with numbers in it. Uses recorded
   * pieces and number clips when every one exists, else the iPad's voice.
   * Resolves true only if it played to the end (see `say`).
   */
  async speech(s: Speech): Promise<boolean> {
    const early = {};
    speaking = early;
    await loadManifest();
    // A newer line or stop() arrived while the manifest loaded.
    if (speaking !== early) return false;
    const parts = speechParts(s);
    const recorded = parts.every((p) =>
      'piece' in p ? manifest.pieces.includes(pieceId(p.piece)) : typeof p.value === 'number' && manifest.numbers.includes(p.value),
    );
    stopClip();
    const token = early;
    if (!recorded) {
      unrecorded(`question: “${s.text}” with ${JSON.stringify(s.vals ?? {})}`);
      return held(token, () => speak(personalise(speechText(s), playerName), 0.85));
    }
    // Cut off by a pause, the whole question is said again from its start.
    return held(token, async () => {
      for (const p of parts) {
        if (speaking !== token) return false;
        const url = 'piece' in p ? pieceUrl(pieceId(p.piece)) : numberUrl(p.value as number, p.end);
        const buf = await fetchBuffer(url);
        if (speaking !== token) return false;
        if (buf && !(await playBuffer(buf))) return false;
      }
      return speaking === token;
    });
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
