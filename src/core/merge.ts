/**
 * Merging two copies of the same player's progress.
 *
 * A device keeps the copy it last agreed with the cloud (`base`). When its
 * own copy (`local`) and the cloud's (`remote`) have both moved on since
 * (say Jasper played offline while a grown-up changed a setting on a
 * phone) the two are merged so that nothing he earned is lost:
 *
 *   - chapters: the record with more plays, done if either side finished it
 *   - skills: the record that has seen more problems (it holds the newer
 *     tier, score and review box); on a tie, the one practised last
 *   - keepsakes, cards and seals: everything either side won
 *   - toffees: the larger count (both sides count up from the same start)
 *   - everything else (name, avatar, settings, unlocks) takes whichever
 *     side changed it, and this device's change if both did
 *
 * Earnings only ever grow here, so a "start again" made on one device
 * while another was playing offline keeps the offline play. That's the
 * kind side to err on.
 */
import type { SkillState } from './mastery';
import type { ChapterRecord, Progress, Settings } from './progress';
import type { SkillId } from './skills';

/** JSON with object keys sorted, so equal data always gives the same text. */
export function canonical(v: unknown): string {
  return JSON.stringify(v, (_k, x: unknown) =>
    x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) : x,
  );
}

export const same = (a: unknown, b: unknown): boolean => canonical(a) === canonical(b);

/** Whichever side changed the value; this device's if both did. */
const pick = <T>(base: T, local: T, remote: T): T => (same(local, base) ? remote : local);

/** Everything in either list, the cloud's order first. */
function union<T>(local: T[], remote: T[]): T[] {
  const out = [...remote];
  for (const x of local) if (!out.includes(x)) out.push(x);
  return out;
}

function keys(...objs: object[]): string[] {
  return [...new Set(objs.flatMap((o) => Object.keys(o)))];
}

function mergeChapter(l: ChapterRecord | undefined, r: ChapterRecord | undefined): ChapterRecord {
  if (!l || !r) return { ...(l ?? r)! };
  const more = l.plays > r.plays ? l : r;
  const firsts = [l.firstDone, r.firstDone].filter((t): t is number => typeof t === 'number');
  const rec: ChapterRecord = { plays: more.plays, done: l.done || r.done };
  if (firsts.length) rec.firstDone = Math.min(...firsts);
  return rec;
}

function mergeSkill(l: SkillState | undefined, r: SkillState | undefined): SkillState {
  if (!l || !r) return structuredClone((l ?? r)!);
  if (l.seen !== r.seen) return structuredClone(l.seen > r.seen ? l : r);
  return structuredClone(l.last > r.last ? l : r);
}

export function mergeProgress(base: Progress, local: Progress, remote: Progress): Progress {
  const chapters: Record<string, ChapterRecord> = {};
  for (const id of keys(local.chapters, remote.chapters)) chapters[id] = mergeChapter(local.chapters[id], remote.chapters[id]);

  const skills: Progress['skills'] = {};
  for (const id of keys(local.skills, remote.skills) as SkillId[]) skills[id] = mergeSkill(local.skills[id], remote.skills[id]);

  const settings = {} as Settings;
  for (const k of keys(base.settings, local.settings, remote.settings) as (keyof Settings)[]) {
    (settings as unknown as Record<string, unknown>)[k] = pick(base.settings[k], local.settings[k], remote.settings[k]);
  }

  return {
    v: 1,
    name: pick(base.name, local.name, remote.name),
    avatar: pick(base.avatar, local.avatar, remote.avatar),
    seenOpening: local.seenOpening || remote.seenOpening,
    chapters,
    skills,
    keepsakes: union(local.keepsakes, remote.keepsakes),
    cards: union(local.cards, remote.cards),
    seals: union(local.seals, remote.seals),
    toffees: Math.max(local.toffees, remote.toffees),
    unlockAll: pick(base.unlockAll, local.unlockAll, remote.unlockAll),
    unlockedTo: pick(base.unlockedTo, local.unlockedTo, remote.unlockedTo),
    lastPlayed: Math.max(local.lastPlayed, remote.lastPlayed),
    settings,
  };
}
