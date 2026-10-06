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
  });

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
