/**
 * Saved progress: chapters, rewards, per-skill mastery and settings.
 *
 * Kept on the device (save/local.ts) and, later, synced to the cloud
 * (workstream W7). `restore` accepts anything and fills in defaults, so
 * old or partial saves always load.
 */
import { ALL_CHAPTERS, AVATARS, LANDS, type Avatar, type Chapter } from './curriculum';
import { BOX_DAYS, newSkillState, record, type Outcome, type SkillState } from './mastery';
import { DEFAULT_NAME } from './phrases';
import { SKILL_IDS, tierCount, type SkillId } from './skills';

export interface Settings {
  /** Master volume 0..1. */
  volume: number;
  /** Seconds of no activity before the question is said again. */
  idleHintSeconds: number;
  /** New chapters allowed per day (0 = no limit). Replays are always allowed. */
  newPerDay: number;
}

export interface ChapterRecord {
  plays: number;
  done: boolean;
  /** When it was first finished (ms). */
  firstDone?: number;
}

export interface Progress {
  v: 1;
  name: string;
  avatar: Avatar | null;
  /** The opening film has been seen. */
  seenOpening: boolean;
  chapters: Record<string, ChapterRecord>;
  skills: Partial<Record<SkillId, SkillState>>;
  /** Keepsake ids won. */
  keepsakes: string[];
  /** Character ids whose card has been won. */
  cards: string[];
  /** Land numbers whose finale is done. */
  seals: number[];
  /** Toffee shocks: one per right answer. */
  toffees: number;
  unlockAll: boolean;
  /** Index in ALL_CHAPTERS up to which a grown-up unlocked (-1: none). */
  unlockedTo: number;
  lastPlayed: number;
  settings: Settings;
}

export function defaultProgress(name = DEFAULT_NAME): Progress {
  return {
    v: 1,
    name,
    avatar: null,
    seenOpening: false,
    chapters: {},
    skills: {},
    keepsakes: [],
    cards: [],
    seals: [],
    toffees: 0,
    unlockAll: false,
    unlockedTo: -1,
    lastPlayed: 0,
    settings: { volume: 0.8, idleHintSeconds: 12, newPerDay: 2 },
  };
}

// A save can come back damaged: half-written, from an older game, or from
// a newer one. Each value is checked on the way in, because one bad number
// can stop a scene (a volume that isn't a number throws in Web Audio; a
// skill with no `recent` list throws on his next answer).

type Loose = Record<string, unknown>;
const isObj = (x: unknown): x is Loose => !!x && typeof x === 'object' && !Array.isArray(x);
/** A number in lo..hi, or `fallback` if it isn't a number at all. */
const num = (x: unknown, lo: number, hi: number, fallback: number): number =>
  typeof x === 'number' && Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : fallback;
const int = (x: unknown, lo: number, hi: number, fallback: number): number => Math.floor(num(x, lo, hi, fallback));
/** Each string once. */
const strings = (x: unknown): string[] => (Array.isArray(x) ? [...new Set(x.filter((s): s is string => typeof s === 'string'))] : []);

function restoreChapter(x: unknown): ChapterRecord | null {
  if (!isObj(x)) return null;
  const done = x.done === true;
  // A finished chapter was played at least once.
  const rec: ChapterRecord = { plays: Math.max(done ? 1 : 0, int(x.plays, 0, 1e6, 0)), done };
  if (typeof x.firstDone === 'number' && Number.isFinite(x.firstDone)) rec.firstDone = x.firstDone;
  return rec;
}

function restoreSkill(id: SkillId, x: Loose): SkillState {
  const d = newSkillState();
  const mastered = x.mastered === true;
  return {
    tier: int(x.tier, 1, tierCount(id), 1),
    score: num(x.score, 0, 1, d.score),
    seen: int(x.seen, 0, 1e6, 0),
    streak: int(x.streak, 0, 1e6, 0),
    recent: Array.isArray(x.recent) ? x.recent.filter((w): w is number => typeof w === 'number' && Number.isFinite(w)).map((w) => Math.min(3, Math.max(0, Math.floor(w)))).slice(-4) : [],
    mastered,
    box: mastered ? int(x.box, 1, BOX_DAYS.length, 1) : 0,
    last: num(x.last, 0, Infinity, 0),
    due: mastered ? num(x.due, 0, Infinity, 0) : 0,
  };
}

/**
 * Loads anything that looks like a save, filling gaps with defaults and
 * putting each value back in range. Never throws. Things the game doesn't
 * know (old settings like calm mode, fields from a newer game) are left out.
 */
export function restore(raw: unknown): Progress {
  const d = defaultProgress();
  if (!isObj(raw)) return d;
  const chapters: Progress['chapters'] = {};
  // Ids the game doesn't know are kept: they may be from a newer game, and harm nothing.
  for (const [id, c] of Object.entries(isObj(raw.chapters) ? raw.chapters : {})) {
    const rec = restoreChapter(c);
    if (rec) chapters[id] = rec;
  }
  const skills: Progress['skills'] = {};
  for (const [id, st] of Object.entries(isObj(raw.skills) ? raw.skills : {})) {
    if ((SKILL_IDS as readonly string[]).includes(id) && isObj(st)) skills[id as SkillId] = restoreSkill(id as SkillId, st);
  }
  const s = isObj(raw.settings) ? raw.settings : {};
  return {
    v: 1,
    name: typeof raw.name === 'string' ? raw.name : d.name,
    avatar: AVATARS.includes(raw.avatar as Avatar) ? (raw.avatar as Avatar) : null,
    seenOpening: raw.seenOpening === true,
    chapters,
    skills,
    keepsakes: strings(raw.keepsakes),
    cards: strings(raw.cards),
    seals: Array.isArray(raw.seals) ? [...new Set(raw.seals.filter((n): n is number => Number.isInteger(n) && n >= 1 && n <= LANDS.length))] : [],
    toffees: int(raw.toffees, 0, 1e9, 0),
    unlockAll: raw.unlockAll === true,
    unlockedTo: int(raw.unlockedTo, -1, ALL_CHAPTERS.length - 1, -1),
    lastPlayed: num(raw.lastPlayed, 0, Infinity, 0),
    settings: {
      volume: num(s.volume, 0, 1, d.settings.volume),
      idleHintSeconds: num(s.idleHintSeconds, 0, 60, d.settings.idleHintSeconds),
      newPerDay: int(s.newPerDay, 0, 1000, d.settings.newPerDay),
    },
  };
}

/** Index of the next chapter to play (the first not done), or the last one if all are done. */
export function currentIndex(p: Progress): number {
  const i = ALL_CHAPTERS.findIndex((c) => !p.chapters[c.id]?.done);
  return i < 0 ? ALL_CHAPTERS.length - 1 : i;
}

const sameDay = (a: number, b: number) => new Date(a).toDateString() === new Date(b).toDateString();

/** New chapters first finished today. */
export function newToday(p: Progress, now: number): number {
  return Object.values(p.chapters).filter((c) => c.firstDone && sameDay(c.firstDone, now)).length;
}

/** Whether a chapter can be opened now: done before, unlocked, or the next one (within today's limit). */
export function isOpen(p: Progress, chapterIndex: number, now: number): boolean {
  const c = ALL_CHAPTERS[chapterIndex];
  if (!c) return false;
  if (p.chapters[c.id]?.done || p.unlockAll || chapterIndex <= p.unlockedTo) return true;
  if (chapterIndex !== currentIndex(p)) return false;
  return !p.settings.newPerDay || newToday(p, now) < p.settings.newPerDay;
}

/** Applies one problem's outcome to the skill it practised. */
export function recordOutcome(p: Progress, o: Outcome, ceiling?: number): void {
  p.skills[o.skill] = record(p.skills[o.skill] ?? newSkillState(o.tier), o, ceiling);
  if (o.wrong < 3) p.toffees += 1;
}

/** Marks a chapter finished and hands out its rewards. Returns what was new. */
export function finishChapter(p: Progress, c: Chapter, now: number): { keepsake: boolean; card: boolean; seal: boolean } {
  const rec = p.chapters[c.id] ?? { plays: 0, done: false };
  const firstTime = !rec.done;
  p.chapters[c.id] = { plays: rec.plays + 1, done: true, firstDone: rec.firstDone ?? now };
  p.lastPlayed = now;
  const keepsake = !p.keepsakes.includes(c.keepsake);
  if (keepsake) p.keepsakes.push(c.keepsake);
  const card = !p.cards.includes(c.host);
  if (card) p.cards.push(c.host);
  const seal = c.kind === 'finale' && firstTime && !p.seals.includes(c.land);
  if (seal) p.seals.push(c.land);
  return { keepsake, card, seal };
}
