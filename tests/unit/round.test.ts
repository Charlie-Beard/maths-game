import { describe, expect, it } from 'vitest';
import { ALL_CHAPTERS, findChapter } from '../../src/core/curriculum';
import { generate } from '../../src/core/generators';
import { newSkillState, DAY } from '../../src/core/mastery';
import { defaultProgress } from '../../src/core/progress';
import { makeRand } from '../../src/core/random';
import { buildPractice, buildRound, planRound, recentSkills, Round } from '../../src/core/round';

const now = 1_700_000_000_000;

describe('planRound', () => {
  it('makes the right number of problems for every chapter', () => {
    const p = defaultProgress();
    for (const c of ALL_CHAPTERS) expect(buildRound(c, p, makeRand(1), now)).toHaveLength(c.problems);
  });

  it('is mostly focus, with recent and review problems mixed in', () => {
    const p = defaultProgress();
    p.skills['count-10'] = { ...newSkillState(3), mastered: true, box: 2, due: now - DAY };
    const c = findChapter('l2c3')!.chapter;
    const plan = planRound(c, p, makeRand(5), now);
    expect(plan.filter((x) => x.role === 'focus')).toHaveLength(5);
    expect(plan.filter((x) => x.role === 'recent')).toHaveLength(2);
    expect(plan.filter((x) => x.role === 'review').map((x) => x.skill)).toEqual(['count-10']);
  });

  it('keeps focus tiers inside the chapter’s range', () => {
    const p = defaultProgress();
    p.skills['add-10'] = { ...newSkillState(5) };
    const c = findChapter('l1c6')!.chapter; // add-10 at tiers 1–3
    for (const x of planRound(c, p, makeRand(2), now).filter((x) => x.role === 'focus')) expect(x.tier).toBeLessThanOrEqual(3);
  });

  it('starts a land’s first chapter with its new skill', () => {
    const c = findChapter('l2c1')!.chapter;
    const plan = planRound(c, defaultProgress(), makeRand(3), now);
    expect(plan[0].skill).toBe('one-less');
    expect(plan[1].skill).toBe('one-less');
  });

  it('avoids the same skill twice in a row when it can', () => {
    const c = findChapter('l3c7')!.chapter;
    for (let seed = 1; seed < 30; seed++) {
      const plan = planRound(c, defaultProgress(), makeRand(seed), now);
      const repeats = plan.filter((x, i) => i > 0 && plan[i - 1].skill === x.skill).length;
      expect(repeats).toBeLessThanOrEqual(3);
    }
  });

  it('uses the previous land for a land’s first chapter’s recent problems', () => {
    expect(recentSkills(findChapter('l2c1')!.chapter).length).toBeGreaterThan(0);
    expect(recentSkills(findChapter('l1c1')!.chapter)).toEqual([]);
  });

  it('never repeats the same maths in one round', () => {
    for (const c of ALL_CHAPTERS.slice(0, 10)) {
      const ps = buildRound(c, defaultProgress(), makeRand(9), now);
      const keys = ps.filter((x) => !x.placeholder).map((x) => x.key);
      // Tiny skills (count to 5) can run out of variety; allow one repeat.
      expect(keys.length - new Set(keys).size).toBeLessThanOrEqual(1);
    }
  });

  it('builds practice even before anything is mastered', () => {
    expect(buildPractice(defaultProgress(), makeRand(1), now)).toHaveLength(8);
  });
});

describe('Round', () => {
  const problems = () => buildRound(findChapter('l1c6')!.chapter, defaultProgress(), makeRand(4), now);
  const regen = (seed: number) => (p: ReturnType<typeof problems>[number]) => generate(p.skill, Math.max(1, p.tier - 1), makeRand(seed));

  it('records first-try rights', () => {
    const round = new Round(problems(), regen(1));
    while (!round.done) {
      expect(round.answer(round.current.answer, now)).toBe('right');
      round.advance();
    }
    expect(round.perfect).toBe(8);
    expect(round.outcomes).toHaveLength(8);
  });

  it('raises the help level with each wrong answer, up to 3', () => {
    const round = new Round(problems(), regen(1));
    const wrong = typeof round.current.answer === 'number' ? -1 : 'nope';
    expect(round.help).toBe(0);
    for (const expected of [1, 2, 3, 3]) {
      expect(round.answer(wrong)).toBe('wrong');
      expect(round.help).toBe(expected);
    }
    round.answer(round.current.answer);
    expect(round.outcomes[0].wrong).toBe(4);
    round.advance();
    expect(round.help).toBe(0);
  });

  it('brings a problem Silky helped with back at the end, at most twice', () => {
    const round = new Round(problems(), regen(2));
    for (let k = 0; k < 4; k++) {
      for (let w = 0; w < 3; w++) round.answer(-1);
      round.answer(round.current.answer);
      round.advance();
    }
    expect(round.total).toBe(10);
  });

  it('asking Silky steps help up but is not a wrong answer', () => {
    const round = new Round(problems(), regen(1));
    round.askHelp();
    expect(round.help).toBe(1);
    round.askHelp();
    round.askHelp();
    expect(round.help).toBe(3);
    expect(round.answer(round.current.answer, now)).toBe('right');
    expect(round.outcomes[0].wrong).toBe(0);
    expect(round.perfect).toBe(1);
    // Not a "Silky helped" problem, so nothing is re-queued.
    expect(round.total).toBe(8);
    round.advance();
    expect(round.help).toBe(0);
  });

  it('counts only real wrong answers when he also asked for help', () => {
    const round = new Round(problems(), regen(1));
    round.askHelp();
    round.answer(-1);
    expect(round.help).toBe(2);
    round.answer(round.current.answer, now);
    expect(round.outcomes[0].wrong).toBe(1);
  });

  it('re-queues a different problem from the one just solved', () => {
    const first = problems();
    let n = 0;
    // Gives the same problem twice before a different one.
    const stubborn = (p: (typeof first)[number]) => (n++ < 2 ? p : generate(p.skill, p.tier, makeRand(100 + n)));
    const round = new Round(first, stubborn);
    const solved = round.current;
    for (let w = 0; w < 3; w++) round.answer(-1);
    round.answer(solved.answer);
    expect(round.total).toBe(9);
    expect(round.problems[8].key).not.toBe(solved.key);
  });
});
