/**
 * Per-skill mastery: the adaptive heart of the game (docs/PLAN.md §6).
 *
 * Every skill keeps a small record. After each problem, `record` updates
 * its rolling score, may move it up or down a tier, and, once mastered,
 * schedules spaced review in Leitner boxes. All pure: (state, outcome) →
 * new state.
 */
import { tierCount, type SkillId } from './skills';

export interface SkillState {
  /** Current tier, 1-based. */
  tier: number;
  /** Rolling score 0..1 (exponentially weighted). */
  score: number;
  /** Problems seen in total. */
  seen: number;
  /** First-try rights in a row at the current tier. */
  streak: number;
  /** The last few problems' help levels (0 none … 3 Silky helped), newest last. */
  recent: number[];
  /** Mastered (then reviewed with spaced repetition). */
  mastered: boolean;
  /** Leitner box 1..5 once mastered (0 before). */
  box: number;
  /** When it was last practised (ms). */
  last: number;
  /** When it's next due for review (ms; 0 if not mastered). */
  due: number;
}

/** How a problem went: how many wrong answers before the right one. */
export interface Outcome {
  skill: SkillId;
  tier: number;
  /** Wrong answers before getting it: 0, 1, 2, or 3+ (Silky helped). */
  wrong: number;
  /** When it was answered (ms). */
  at: number;
}

export const DAY = 24 * 60 * 60 * 1000;
/** Review gaps for Leitner boxes 1..5, in days. */
export const BOX_DAYS = [1, 3, 7, 14, 30] as const;

const WEIGHT = 0.25;
const STEP_UP_STREAK = 3;
const STEP_UP_SCORE = 0.8;
const MASTER_SCORE = 0.85;
const MASTER_SEEN = 8;

export function newSkillState(tier = 1): SkillState {
  return { tier, score: 0.5, seen: 0, streak: 0, recent: [], mastered: false, box: 0, last: 0, due: 0 };
}

/** The score one problem earns: right first time 1, then 0.6, 0.3, 0. */
export const outcomeScore = (wrong: number): number => [1, 0.6, 0.3][wrong] ?? 0;

/**
 * Updates a skill after a problem. `ceiling` is the highest tier the
 * current chapter allows: mastery means reaching it with a high score.
 */
export function record(prev: SkillState, o: Outcome, ceiling = tierCount(o.skill)): SkillState {
  const st: SkillState = { ...prev, recent: [...prev.recent, Math.min(3, o.wrong)].slice(-4) };
  const top = tierCount(o.skill);
  st.seen += 1;
  st.last = o.at;
  st.score = st.score * (1 - WEIGHT) + outcomeScore(o.wrong) * WEIGHT;
  st.streak = o.wrong === 0 ? st.streak + 1 : 0;

  // Up a tier: a run of first-try rights and a good score.
  if (st.streak >= STEP_UP_STREAK && st.score >= STEP_UP_SCORE && st.tier < Math.min(top, ceiling)) {
    st.tier += 1;
    st.streak = 0;
  }
  // Down a tier: Silky had to help twice in the last four.
  if (st.recent.filter((w) => w >= 3).length >= 2 && st.tier > 1) {
    st.tier -= 1;
    st.streak = 0;
    st.recent = [];
  }

  if (!st.mastered) {
    if (st.tier >= Math.min(top, ceiling) && st.score >= MASTER_SCORE && st.seen >= MASTER_SEEN) {
      st.mastered = true;
      st.box = 1;
      st.due = o.at + BOX_DAYS[0] * DAY;
    }
  } else if (o.wrong === 0) {
    // Reviewed and still sure: wait longer next time.
    st.box = Math.min(BOX_DAYS.length, st.box + 1);
    st.due = o.at + BOX_DAYS[st.box - 1] * DAY;
  } else {
    // Slipped: review again soon, a tier gentler.
    st.box = 1;
    st.due = o.at + BOX_DAYS[0] * DAY;
    st.tier = Math.max(1, st.tier - 1);
  }
  return st;
}

/** The tier to use for a skill in a chapter that allows tiers lo..hi. */
export function tierFor(st: SkillState | undefined, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, st?.tier ?? lo));
}

/** Mastered skills due for review, most overdue first. */
export function dueForReview(skills: Partial<Record<SkillId, SkillState>>, now: number): SkillId[] {
  return (Object.entries(skills) as [SkillId, SkillState][])
    .filter(([, st]) => st.mastered && st.due <= now)
    .sort((a, b) => a[1].due - b[1].due)
    .map(([id]) => id);
}

/** Mastered skills, most overdue (or soonest due) first: for practice when nothing is strictly due. */
export function reviewOrder(skills: Partial<Record<SkillId, SkillState>>): SkillId[] {
  return (Object.entries(skills) as [SkillId, SkillState][])
    .filter(([, st]) => st.mastered)
    .sort((a, b) => a[1].due - b[1].due)
    .map(([id]) => id);
}
