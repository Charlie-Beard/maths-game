/**
 * Rules for land 11's generators (core/generators/l11.ts): `tally` and
 * `change`. The generic checks are in generators.test.ts.
 */
import { describe, expect, it } from 'vitest';
import { generate } from '../../src/core/generators';
import { L11 } from '../../src/core/generators/l11';
import { speechText, type Problem, type Visual } from '../../src/core/problem';
import { makeRand } from '../../src/core/random';
import { tierCount, type SkillId } from '../../src/core/skills';

const SEEDS = 1500;
const all = (skill: SkillId, tier: number): Problem[] => Array.from({ length: SEEDS }, (_, i) => generate(skill, tier, makeRand(i * 7919 + tier * 31 + 1)));
const fixedWords = (text: string): string => text.replace(/\{\w+\}/g, '');
const tallyVisual = (p: Problem) => {
  expect(p.visual.type).toBe('tally');
  return p.visual as Extract<Visual, { type: 'tally' }>;
};
const coinsVisual = (p: Problem) => {
  expect(p.visual.type).toBe('coins');
  return p.visual as Extract<Visual, { type: 'coins' }>;
};

describe('land 11 generators', () => {
  it('are real generators for both skills, at every tier', () => {
    expect(Object.keys(L11).sort()).toEqual(['change', 'tally']);
    for (const skill of ['tally', 'change'] as const) {
      for (let tier = 1; tier <= tierCount(skill); tier++) {
        for (const p of all(skill, tier)) {
          expect(p.placeholder).toBeUndefined();
          expect(p.skill).toBe(skill);
          expect(p.tier).toBe(tier);
          expect(p.key.startsWith(`${skill}:`)).toBe(true);
          expect(p.choices!.length, p.key).toBeGreaterThanOrEqual(3);
          expect(p.choices!.length, p.key).toBeLessThanOrEqual(4);
          expect(p.choices, p.key).toContain(p.answer);
          expect(new Set(p.choices).size, p.key).toBe(p.choices!.length);
          expect(fixedWords(p.say.text), p.key).not.toMatch(/\d/);
          expect(fixedWords(p.explain.text), p.key).not.toMatch(/\d/);
          for (const s of [p.say, p.explain]) expect(speechText(s), p.key).not.toMatch(/[{}]/);
        }
      }
    }
  });

  describe('tally', () => {
    it('tier 1 counts marks to 10, in one unlabelled row', () => {
      for (const p of all('tally', 1)) {
        const v = tallyVisual(p);
        expect(v.style).toBe('tally');
        expect(v.rows).toHaveLength(1);
        expect(v.rows[0].label).toBe('');
        expect(p.answer).toBe(v.rows[0].count);
        expect(v.rows[0].count).toBeGreaterThanOrEqual(1);
        expect(v.rows[0].count).toBeLessThanOrEqual(10);
      }
    });

    it('tier 2 counts tallies in fives, to 20', () => {
      let multi = 0;
      for (const p of all('tally', 2)) {
        const v = tallyVisual(p);
        expect(v.style).toBe('tally');
        expect(v.rows.some((r) => r.count === p.answer), p.key).toBe(true);
        for (const r of v.rows) expect(r.count).toBeLessThanOrEqual(20);
        expect(p.answer as number).toBeGreaterThanOrEqual(6);
        if (v.rows.length > 1) {
          multi++;
          const asked = v.rows.filter((r) => r.count === p.answer);
          expect(asked.length, p.key).toBe(1);
          expect(p.say.text.toLowerCase(), p.key).toContain(asked[0].label.toLowerCase());
        }
      }
      expect(multi).toBeGreaterThan(100);
    });

    it('tier 3 reads a pictogram where one picture is one', () => {
      for (const p of all('tally', 3)) {
        const v = tallyVisual(p);
        expect(v.style).toBe('pictogram');
        expect(v.per).toBeUndefined();
        expect(new Set(v.rows.map((r) => r.prop)).size).toBe(v.rows.length);
        for (const r of v.rows) {
          expect(r.prop).toBeDefined();
          expect(r.count).toBeGreaterThanOrEqual(1);
          expect(r.count).toBeLessThanOrEqual(8);
        }
        const named = v.rows.filter((r) => p.say.text.toLowerCase().includes(r.label.toLowerCase()));
        expect(p.answer, p.key).toBe(named.reduce((a, r) => a + r.count, 0));
      }
    });

    it('tier 4 has a key of 2, 5 or 10 and counts in that step', () => {
      const pers = new Set<number>();
      for (const p of all('tally', 4)) {
        const v = tallyVisual(p);
        expect(v.style).toBe('pictogram');
        expect([2, 5, 10]).toContain(v.per);
        pers.add(v.per!);
        for (const r of v.rows) {
          expect(r.count % v.per!).toBe(0);
          expect(r.count / v.per!).toBeLessThanOrEqual(8);
        }
        expect(v.rows.some((r) => r.count === p.answer)).toBe(true);
        expect(p.say.vals?.per).toBe(v.per);
      }
      expect([...pers].sort((a, b) => a - b)).toEqual([2, 5, 10]);
    });

    it('tier 5 asks how many more, and the answer is the difference', () => {
      const styles = new Set<string>();
      for (const p of all('tally', 5)) {
        const v = tallyVisual(p);
        styles.add(`${v.style}${v.per ?? 1}`);
        expect(v.rows).toHaveLength(2);
        const [x, y] = v.rows.map((r) => r.count);
        expect(x).not.toBe(y);
        expect(p.answer).toBe(Math.abs(x - y));
        // "How many more A than B": A is the bigger.
        const bigger = x > y ? v.rows[0] : v.rows[1];
        const smaller = x > y ? v.rows[1] : v.rows[0];
        const t = p.say.text.toLowerCase();
        expect(t.indexOf(bigger.label.toLowerCase()), p.key).toBeGreaterThan(-1);
        expect(t.indexOf(bigger.label.toLowerCase()), p.key).toBeLessThan(t.lastIndexOf(smaller.label.toLowerCase()));
        if (v.per) for (const r of v.rows) expect(r.count % v.per).toBe(0);
      }
      expect(styles.size).toBe(4);
    });
  });

  describe('change', () => {
    it('tier 1 adds two prices to 20p, and the coins on the table make the total', () => {
      for (const p of all('change', 1)) {
        const coins = coinsVisual(p).coins;
        expect(coins.reduce((a, c) => a + c, 0), p.key).toBe(p.answer);
        expect(p.answer as number).toBeLessThanOrEqual(20);
        const vals = Object.values(p.say.vals!) as number[];
        expect(vals.reduce((a, b) => a + b, 0), p.key).toBe(p.answer);
        expect(p.text).toMatch(/^\d+p \+ \d+p = \?$/);
      }
    });

    it('tiers 2 to 4 pay with one coin, and the change is never nought', () => {
      const wanted: Record<number, number[]> = { 2: [10], 3: [20], 4: [50, 100] };
      for (const tier of [2, 3, 4]) {
        const coinsSeen = new Set<number>();
        for (const p of all('change', tier)) {
          const v = coinsVisual(p);
          expect(v.coins).toHaveLength(1);
          const coin = v.coins[0];
          coinsSeen.add(coin);
          expect(wanted[tier]).toContain(coin);
          expect(v.target, p.key).toBeGreaterThan(0);
          expect(v.target!, p.key).toBeLessThan(coin);
          expect(p.answer, p.key).toBe(coin - v.target!);
          expect(p.answer as number).toBeGreaterThan(0);
          for (const c of p.choices as number[]) {
            expect(c).toBeGreaterThanOrEqual(1);
            expect(c).toBeLessThan(coin);
          }
        }
        expect([...coinsSeen].sort((a, b) => a - b)).toEqual(wanted[tier]);
      }
    });

    it('says pounds as pounds, and never "100p"', () => {
      for (const p of all('change', 4)) {
        const said = speechText(p.say) + ' ' + speechText(p.explain);
        expect(said).not.toMatch(/\b100p\b/);
        if (coinsVisual(p).coins[0] === 100) expect(p.say.text).toContain('£{');
      }
    });

    it('tier 4 keeps round prices with round choices', () => {
      for (const p of all('change', 4)) {
        const price = coinsVisual(p).target!;
        if (price % 5 === 0) for (const c of p.choices as number[]) expect(c % 5, p.key).toBe(0);
      }
    });
  });
});
