/**
 * Building a chapter's problems, and playing through them (docs/PLAN.md §5–6).
 *
 * buildRound: 8 problems = 5 focus + 2 recent + 1 spaced review, with the
 * focus tiers chosen per skill inside the chapter's range.
 *
 * Round: the state of play. Wrong answers (and asking Silky) raise the help
 * level (1 say it again, 2 show me, 3 Silky); a problem Silky had to help with
 * comes back once at the end, a tier gentler, with new numbers.
 */
import { ALL_CHAPTERS, LANDS, type Chapter } from './curriculum';
import { generate } from './generators';
import { dueForReview, needsPractice, reviewOrder, tierFor, type Outcome } from './mastery';
import type { Answer, Problem } from './problem';
import type { Progress } from './progress';
import type { Rand } from './random';
import { tierCount, type SkillId } from './skills';

export interface RoundPlan {
  skill: SkillId;
  tier: number;
  role: 'focus' | 'recent' | 'review';
}

/** Skills from earlier chapters of the same land (or the previous land, for a land's first chapter). */
export function recentSkills(c: Chapter): SkillId[] {
  const land = LANDS[c.land - 1];
  let earlier = land.chapters.filter((x) => x.n < c.n).flatMap((x) => x.skills);
  if (!earlier.length && c.land > 1) earlier = LANDS[c.land - 2].chapters.slice(-4).flatMap((x) => x.skills);
  return [...new Set(earlier)].filter((s) => !c.skills.includes(s));
}

/** Decides which skills and tiers a chapter's problems use. */
export function planRound(c: Chapter, p: Progress, r: Rand, now: number): RoundPlan[] {
  const total = c.problems;
  const recent = recentSkills(c);
  const review = reviewQueue(p, now).filter((s) => !c.skills.includes(s) && !recent.includes(s));
  const nRecent = recent.length ? (c.kind === 'finale' ? Math.round(total * 0.2) : 2) : 0;
  const nReview = review.length && c.kind !== 'finale' ? 1 : 0;
  const nFocus = total - nRecent - nReview;
  const [lo, hi] = c.tiers;

  const focus: RoundPlan[] = [];
  for (let i = 0; i < nFocus; i++) {
    const skill = c.skills[i % c.skills.length];
    focus.push({ skill, tier: tierFor(p.skills[skill], lo, Math.min(hi, tierCount(skill))), role: 'focus' });
  }
  const rec: RoundPlan[] = r
    .shuffle(recent)
    .slice(0, nRecent)
    .map((skill) => ({ skill, tier: tierFor(p.skills[skill], 1, tierCount(skill)), role: 'recent' }));
  while (rec.length < nRecent) rec.push({ ...rec[0] });
  const rev: RoundPlan[] = review.slice(0, nReview).map((skill) => ({ skill, tier: p.skills[skill]?.tier ?? 1, role: 'review' }));

  return arrange([...focus, ...rec, ...rev], c.n === 1, r);
}

/**
 * Orders problems so the same skill never comes twice in a row where that
 * can be helped. A land's first chapter starts with its new skill, twice, to
 * introduce it gently.
 */
function arrange(plans: RoundPlan[], introduce: boolean, r: Rand): RoundPlan[] {
  const pool = r.shuffle(plans);
  const out: RoundPlan[] = [];
  if (introduce) {
    for (let k = 0; k < 2; k++) {
      const i = pool.findIndex((x) => x.role === 'focus');
      if (i >= 0) out.push(...pool.splice(i, 1));
    }
  }
  while (pool.length) {
    const last = out[out.length - 1]?.skill;
    let i = pool.findIndex((x) => x.skill !== last);
    if (i < 0 || (introduce && out.length < 2)) i = 0;
    out.push(...pool.splice(i, 1));
  }
  return out;
}

/** Makes the problems for a plan, never repeating the same maths in one round. */
export function makeProblems(plans: RoundPlan[], r: Rand): Problem[] {
  const seen = new Set<string>();
  return plans.map((pl) => {
    let pr = generate(pl.skill, pl.tier, r);
    for (let tries = 0; seen.has(pr.key) && tries < 8; tries++) pr = generate(pl.skill, pl.tier, r);
    seen.add(pr.key);
    return pr;
  });
}

export function buildRound(c: Chapter, p: Progress, r: Rand, now: number): Problem[] {
  return makeProblems(planRound(c, p, r, now), r);
}

/**
 * Skills for review, in order: mastered ones that are due, then ones he has
 * played but not mastered (from any earlier land), then the other mastered
 * ones.
 */
function reviewQueue(p: Progress, now: number): SkillId[] {
  return [...new Set([...dueForReview(p.skills, now), ...needsPractice(p.skills), ...reviewOrder(p.skills)])];
}

/** "Practice with Silky": 8 review problems from the review queue (anything he has played). */
export function buildPractice(p: Progress, r: Rand, now: number, count = 8): Problem[] {
  let skills = reviewQueue(p, now);
  if (!skills.length) skills = ALL_CHAPTERS[0].skills;
  const plans: RoundPlan[] = [];
  for (let i = 0; i < count; i++) {
    const skill = skills[i % skills.length];
    plans.push({ skill, tier: p.skills[skill]?.tier ?? 1, role: 'review' });
  }
  return makeProblems(arrange(plans, false, r), r);
}

export type HelpLevel = 0 | 1 | 2 | 3;

/** Most extra problems a round adds for ones Silky helped with. */
const MAX_REQUEUE = 2;

/** Playing through a round's problems. */
export class Round {
  readonly problems: Problem[];
  readonly outcomes: Outcome[] = [];
  private i = 0;
  private wrong = 0;
  /** Times he asked Silky for help on this problem (not wrong answers). */
  private asked = 0;
  private requeued = 0;
  private regen: (p: Problem) => Problem;

  /**
   * `regen` makes a fresh problem like the one given (for the retry at the
   * end). `start` carries on from a problem part way through (a chapter he
   * left and came back to).
   */
  constructor(problems: Problem[], regen: (p: Problem) => Problem, start = 0) {
    this.problems = problems.slice();
    this.regen = regen;
    this.i = Math.max(0, Math.min(start, this.problems.length - 1));
  }

  get current(): Problem {
    return this.problems[this.i];
  }

  get index(): number {
    return this.i;
  }

  get total(): number {
    return this.problems.length;
  }

  /**
   * Help level for the current problem, up to 3: wrong answers plus times he
   * asked Silky. Both step the help up; only wrong answers cost credit.
   */
  get help(): HelpLevel {
    return Math.min(3, this.wrong + this.asked) as HelpLevel;
  }

  get done(): boolean {
    return this.i >= this.problems.length;
  }

  /** First-try rights so far. */
  get perfect(): number {
    return this.outcomes.filter((o) => o.wrong === 0).length;
  }

  /** Checks an answer. A right answer records the outcome; call `advance` to move on. */
  answer(value: Answer, now = Date.now()): 'right' | 'wrong' {
    const p = this.current;
    if (!p) return 'wrong';
    if (String(value) !== String(p.answer)) {
      this.wrong += 1;
      return 'wrong';
    }
    this.outcomes.push({ skill: p.skill, tier: p.tier, wrong: this.wrong, at: now });
    if (this.wrong >= 3 && this.requeued < MAX_REQUEUE) {
      this.requeued += 1;
      this.problems.push(this.fresh(p));
    }
    return 'right';
  }

  /**
   * He asked Silky for help. Help steps up just as after a wrong answer, but
   * it isn't one: asking is a good thing to do, so the toffee and the score
   * (which follow `wrong` only) are untouched, and Silky showing the answer
   * because he asked doesn't cost him anything.
   */
  askHelp(): void {
    if (!this.done) this.asked += 1;
  }

  /** A fresh problem like `p`, but not the same maths as the one just solved. */
  private fresh(p: Problem): Problem {
    let q = this.regen(p);
    for (let tries = 0; q.key === p.key && tries < 8; tries++) q = this.regen(p);
    return q;
  }

  /** Moves to the next problem. Returns false when the round is over. */
  advance(): boolean {
    this.i += 1;
    this.wrong = 0;
    this.asked = 0;
    return !this.done;
  }
}
