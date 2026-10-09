import { describe, expect, it } from 'vitest';
import { generate, unbuiltSkills } from '../../src/core/generators';
import { speechText, type Problem } from '../../src/core/problem';
import { makeRand } from '../../src/core/random';
import { SKILL_IDS, tierCount } from '../../src/core/skills';

/** Works out the answer from the written sum, where there is one. */
function solveText(text: string): number | null {
  const m = text.replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/').match(/^(\d+) ([-+*/]) (\d+|\?) = (\?|\d+)$/);
  if (!m) return null;
  const [, a, op, b, c] = m;
  const x = Number(a);
  if (b === '?') {
    const total = Number(c);
    return op === '+' ? total - x : op === '-' ? x - total : op === '*' ? total / x : x / total;
  }
  const y = Number(b);
  return op === '+' ? x + y : op === '-' ? x - y : op === '*' ? x * y : x / y;
}

function check(p: Problem): void {
  expect(p.say.text.length).toBeGreaterThan(0);
  expect(speechText(p.say)).not.toMatch(/\{(?!name\})\w+\}/);
  expect(speechText(p.explain)).not.toMatch(/\{(?!name\})\w+\}/);
  if (p.choices) {
    expect(p.choices).toContain(p.answer);
    expect(new Set(p.choices.map(String)).size).toBe(p.choices.length);
    expect(p.choices.length).toBeGreaterThanOrEqual(2);
    expect(p.choices.length).toBeLessThanOrEqual(4);
  }
  if (typeof p.answer === 'number') {
    expect(Number.isInteger(p.answer)).toBe(true);
    expect(p.answer).toBeGreaterThanOrEqual(0);
  }
  if (p.text) {
    const solved = solveText(p.text);
    if (solved !== null) expect(solved, p.text).toBe(p.answer);
  }
  if (p.visual.type === 'objects') {
    for (const g of p.visual.groups) expect(g.count).toBeGreaterThanOrEqual((g.gone ?? 0));
  }
}

describe('generators', () => {
  it('make valid problems for every skill at every tier', () => {
    for (const skill of SKILL_IDS) {
      for (let tier = 1; tier <= tierCount(skill); tier++) {
        for (let seed = 1; seed <= 200; seed++) {
          const p = generate(skill, tier, makeRand(seed * 7919 + tier));
          expect(p.skill).toBe(skill);
          expect(p.tier).toBe(tier);
          check(p);
        }
      }
    }
  }, 60_000);

  it('are repeatable from a seed', () => {
    for (const skill of SKILL_IDS) expect(generate(skill, 1, makeRand(42))).toEqual(generate(skill, 1, makeRand(42)));
  });

  it('give variety', () => {
    for (const skill of SKILL_IDS) {
      const keys = new Set(Array.from({ length: 60 }, (_, i) => generate(skill, 2, makeRand(i + 1)).key));
      expect(keys.size, skill).toBeGreaterThanOrEqual(3);
    }
  });

  it('keep add-10 totals within 10 and sub-10 answers non-negative', () => {
    for (let seed = 1; seed < 500; seed++) {
      const r = makeRand(seed);
      expect(generate('add-10', 2, r).answer as number).toBeLessThanOrEqual(10);
      expect(generate('add-10', 1, r).answer as number).toBeLessThanOrEqual(5);
      expect(generate('sub-10', 3, r).answer as number).toBeGreaterThanOrEqual(0);
    }
  });

  // Workstream W1 (docs/ROADMAP.md) writes these. Remove from here as they land.
  for (const skill of unbuiltSkills()) it.todo(`generator for ${skill}`);
});

// Problems that teach little ("1 + 1", "how many more to fill a full tin?",
// a story that ends where it started) may come up, but only now and then.
describe('generators: no one dull problem crowds out the rest', () => {
  const share = (skill: (typeof SKILL_IDS)[number], tier: number, dull: (p: Problem) => boolean) => {
    let n = 0;
    for (let i = 0; i < 2000; i++) if (dull(generate(skill, tier, makeRand(i + 1)))) n++;
    return n / 2000;
  };

  it('add-5 and sub-10 spread their sums evenly', () => {
    expect(share('add-5', 1, (p) => p.key === 'add-5:1+1')).toBeLessThan(0.15);
    expect(share('sub-10', 1, (p) => p.answer === 1 && speechText(p.say).includes(' has 2 '))).toBeLessThan(0.15);
  });

  it('bonds-10 rarely starts from 0 or 10', () => {
    for (let tier = 1; tier <= tierCount('bonds-10'); tier++) {
      expect(share('bonds-10', tier, (p) => p.answer === 0 || p.answer === 10)).toBeLessThan(0.1);
    }
  });

  it('two-step word problems rarely give back what came', () => {
    expect(share('word-problems', 4, (p) => {
      const n = speechText(p.say).match(/\d+/g)?.map(Number) ?? [];
      return n.length >= 3 && n[1] === n[2];
    })).toBeLessThan(0.02);
  });
});
