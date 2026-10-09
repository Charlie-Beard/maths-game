/**
 * Saved progress: chapters, rewards, per-skill mastery and settings.
 *
 * Kept on the device (save/local.ts) and, later, synced to the cloud
 * (workstream W7). `restore` accepts anything and fills in defaults, so
 * old or partial saves always load.
 */
import { ALL_CHAPTERS, AVATARS, type Avatar, type Chapter } from './curriculum';
import { newSkillState, record, type Outcome, type SkillState } from './mastery';
import { DEFAULT_NAME } from './phrases';
import { SKILL_IDS, type SkillId } from './skills';

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

/** Loads anything that looks like a save, filling gaps with defaults. */
/** Older saves carry a calm-mode setting, which the game no longer has. */
function withoutCalm(s: Settings & { calm?: unknown }): Settings {
  const { calm: _calm, ...rest } = s;
  return rest;
}

export function restore(raw: unknown): Progress {
  const d = defaultProgress();
  if (!raw || typeof raw !== 'object') return d;
  const r = raw as Partial<Progress>;
  const skills: Progress['skills'] = {};
  for (const [id, st] of Object.entries(r.skills ?? {})) {
    if ((SKILL_IDS as readonly string[]).includes(id) && st && typeof st === 'object') skills[id as SkillId] = { ...newSkillState(), ...st };
  }
  return {
    ...d,
    ...r,
    v: 1,
    name: typeof r.name === 'string' ? r.name : d.name,
    avatar: r.avatar && AVATARS.includes(r.avatar) ? r.avatar : null,
    chapters: { ...(r.chapters ?? {}) },
    skills,
    keepsakes: Array.isArray(r.keepsakes) ? r.keepsakes : [],
    cards: Array.isArray(r.cards) ? r.cards : [],
    seals: Array.isArray(r.seals) ? r.seals : [],
    settings: withoutCalm({ ...d.settings, ...(r.settings ?? {}) }),
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
