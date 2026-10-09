/**
 * Rules for W1c's generators (core/generators/more.ts): shapes, length,
 * groups and arrays, times tables, money, sharing and grouping, fractions
 * and time. The generic checks (valid choices, written sums that solve,
 * filled slots) are in generators.test.ts.
 */
import { describe, expect, it } from 'vitest';
import { generate } from '../../src/core/generators';
import { MORE, timeWords, UK_COINS } from '../../src/core/generators/more';
import type { Problem, Visual } from '../../src/core/problem';
import { makeRand } from '../../src/core/random';
import { tierCount, type SkillId } from '../../src/core/skills';

const SEEDS = 300;

/** Every problem of a skill at a tier, over many seeds. */
function all(skill: SkillId, tier: number): Problem[] {
  return Array.from({ length: SEEDS }, (_, i) => generate(skill, tier, makeRand(i * 104729 + tier * 13 + 1)));
}

function visual<T extends Visual['type']>(p: Problem, type: T): Extract<Visual, { type: T }> {
  expect(p.visual.type, p.key).toBe(type);
  return p.visual as Extract<Visual, { type: T }>;
}

/** The words that are always the same: the text without its {slots}. */
const fixedWords = (text: string): string => text.replace(/\{\w+\}/g, '');

const W1C: SkillId[] = ['shapes-2d', 'measure-length', 'groups', 'arrays', 'times-2', 'times-5', 'times-10', 'coins', 'share', 'group-div', 'fractions', 'time'];

describe('W1c generators', () => {
  it('cover all twelve skills, every tier, with real problems', () => {
    expect(Object.keys(MORE).sort()).toEqual([...W1C].sort());
    for (const skill of W1C) {
      for (let tier = 1; tier <= tierCount(skill); tier++) {
        for (const p of all(skill, tier)) {
          expect(p.placeholder).toBeUndefined();
          expect(p.choices?.length, p.key).toBeGreaterThanOrEqual(2);
          expect(p.key.startsWith(`${skill}:`)).toBe(true);
          // Numbers go in {slots}, never in the fixed words.
          expect(fixedWords(p.say.text), p.key).not.toMatch(/\d/);
          expect(fixedWords(p.explain.text), p.key).not.toMatch(/\d/);
        }
      }
    }
  });

  it('give more than two choices wherever it isn’t a yes/no question', () => {
    for (const skill of W1C) {
      for (let tier = 1; tier <= tierCount(skill); tier++) {
        for (const p of all(skill, tier)) {
          const yesNo = ['yes', 'no'].includes(String(p.answer));
          if (!yesNo) expect(p.choices!.length, p.key).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });

  describe('time', () => {
    const minutes: Record<number, (m: number) => boolean> = {
      1: (m) => m === 0,
      2: (m) => m === 30,
      3: (m) => m === 15,
      4: (m) => m === 45,
      5: (m) => m % 5 === 0 && m > 0 && m < 60,
    };
    const words: Record<number, RegExp> = {
      1: /^\d+ o’clock$/,
      2: /^half past \d+$/,
      3: /^quarter past \d+$/,
      4: /^quarter to \d+$/,
      5: /^(\d+|quarter|half) (past|to) \d+$/,
    };

    it('tier 1 is always o’clock, 2 half past, 3 quarter past, 4 quarter to, 5 in fives', () => {
      for (let tier = 1; tier <= 5; tier++) {
        for (const p of all('time', tier)) {
          const v = visual(p, 'clock');
          expect(minutes[tier](v.minute), p.key).toBe(true);
          expect(v.hour).toBeGreaterThanOrEqual(1);
          expect(v.hour).toBeLessThanOrEqual(12);
          expect(p.answer).toBe(timeWords(v.hour, v.minute));
          expect(String(p.answer)).toMatch(words[tier]);
          expect(p.activity).toBe('clock');
        }
      }
    });

    it('says times the way a child does', () => {
      expect(timeWords(3, 0)).toBe('3 o’clock');
      expect(timeWords(3, 30)).toBe('half past 3');
      expect(timeWords(3, 15)).toBe('quarter past 3');
      expect(timeWords(3, 45)).toBe('quarter to 4');
      expect(timeWords(12, 45)).toBe('quarter to 1');
      expect(timeWords(3, 20)).toBe('20 past 3');
      expect(timeWords(3, 35)).toBe('25 to 4');
    });

    it('offers wrong times that are real readings of a clock', () => {
      for (let tier = 1; tier <= 5; tier++) {
        for (const p of all('time', tier)) {
          for (const c of p.choices!) expect(String(c)).toMatch(/^(\d+ o’clock|(5|10|20|25|quarter|half) (past|to) ([1-9]|1[0-2]))$/);
          expect(p.choices!.length).toBeGreaterThanOrEqual(3);
        }
      }
    });
  });

  describe('fractions', () => {
    it('tier 1 asks "is it a half?" and the answer matches the picture', () => {
      const seen = new Set<string>();
      for (const p of all('fractions', 1)) {
        const v = visual(p, 'fraction');
        const half = v.parts === 2 && v.equal !== false && v.shaded === 1;
        expect(p.answer, p.key).toBe(half ? 'yes' : 'no');
        seen.add(`${v.parts}:${v.equal}`);
      }
      // Both kinds of "no": unequal halves, and too many parts.
      expect(seen.has('2:false')).toBe(true);
      expect([...seen].some((s) => s.startsWith('3') || s.startsWith('4'))).toBe(true);
    });

    it('tiers 2–4 only ever show equal parts', () => {
      for (let tier = 2; tier <= 4; tier++) {
        for (const p of all('fractions', tier)) {
          if (p.visual.type === 'fraction') expect(p.visual.equal, p.key).toBe(true);
        }
      }
    });

    it('names halves and quarters at tier 2, and thirds only at tier 4', () => {
      const name: Record<number, string> = { 2: 'half', 3: 'third', 4: 'quarter' };
      for (const p of all('fractions', 2)) {
        const v = visual(p, 'fraction');
        expect([2, 4]).toContain(v.parts);
        expect(p.answer).toBe(name[v.parts]);
        expect(p.choices).not.toContain('third');
      }
      for (const p of all('fractions', 4)) {
        if (p.visual.type === 'fraction') expect(p.answer).toBe('third');
        else expect(visual(p, 'share').between).toBe(3);
      }
    });

    it('takes exact halves and quarters of amounts at tier 3', () => {
      for (const p of all('fractions', 3)) {
        const v = visual(p, 'share');
        expect([2, 4]).toContain(v.between);
        expect(v.total % v.between).toBe(0);
        expect(p.answer).toBe(v.total / v.between);
      }
    });
  });

  describe('sharing and grouping', () => {
    it('shares are always exact, between 2 at tier 1', () => {
      for (let tier = 1; tier <= 3; tier++) {
        for (const p of all('share', tier)) {
          if (p.visual.type === 'share') {
            expect(p.visual.total % p.visual.between).toBe(0);
            expect(p.answer).toBe(p.visual.total / p.visual.between);
            if (tier === 1) expect(p.visual.between).toBe(2);
          } else {
            expect(p.text).toMatch(/^\d+ ÷ \d+ = \?$/);
          }
        }
      }
    });

    it('groups of 2 at tier 1, then 2, 5 or 10, always exact', () => {
      for (let tier = 1; tier <= 3; tier++) {
        for (const p of all('group-div', tier)) {
          if (p.visual.type === 'groups') {
            expect(tier === 1 ? [2] : [2, 5, 10]).toContain(p.visual.each);
            expect(p.answer).toBe(p.visual.groups);
            expect(p.visual.groups * p.visual.each).toBeLessThanOrEqual(30);
          } else {
            const [, t, s] = p.text!.match(/^(\d+) ÷ (\d+) = \?$/)!.map(Number);
            expect(t % s).toBe(0);
            expect([2, 5, 10]).toContain(s);
          }
        }
      }
    });
  });

  describe('money', () => {
    it('only uses real UK coins', () => {
      for (let tier = 1; tier <= 4; tier++) {
        for (const p of all('coins', tier)) {
          for (const c of visual(p, 'coins').coins) expect(UK_COINS).toContain(c);
        }
      }
    });

    it('tier 1 finds a coin that is on the table', () => {
      for (const p of all('coins', 1)) expect(visual(p, 'coins').coins).toContain(p.answer);
    });

    it('tier 2 counts 1p, 2p and 5p coins to 20p', () => {
      for (const p of all('coins', 2)) {
        const v = visual(p, 'coins');
        for (const c of v.coins) expect([1, 2, 5]).toContain(c);
        const sum = v.coins.reduce((a, b) => a + b, 0);
        expect(sum).toBeLessThanOrEqual(20);
        expect(p.answer).toBe(sum);
        // Counting the coins instead of the money is a different answer.
        expect(sum).not.toBe(v.coins.length);
      }
    });

    it('tier 3 pays an amount to 20p that the purse can make exactly', () => {
      for (const p of all('coins', 3)) {
        const v = visual(p, 'coins');
        expect(v.target).toBe(p.answer);
        expect(v.target!).toBeLessThanOrEqual(20);
        // Subset sum: can some of the coins make the target?
        let can = new Set([0]);
        for (const c of v.coins) can = new Set([...can, ...[...can].map((x) => x + c)]);
        expect(can.has(v.target!), p.key).toBe(true);
      }
    });

    it('tier 4 counts 10p and 20p coins up to £1', () => {
      for (const p of all('coins', 4)) {
        const v = visual(p, 'coins');
        for (const c of v.coins) expect([10, 20]).toContain(c);
        const sum = v.coins.reduce((a, b) => a + b, 0);
        expect(sum).toBeLessThanOrEqual(100);
        expect(p.answer).toBe(sum);
        for (const c of p.choices!) expect(Number(c) % 10).toBe(0);
      }
    });

    it('says pounds properly', () => {
      const p = all('coins', 1).find((q) => q.answer === 200)!;
      expect(p.say.text).toContain('£{p}');
      expect(p.say.vals!.p).toBe(2);
    });
  });

  describe('times tables', () => {
    const tables: [SkillId, number][] = [
      ['times-2', 2],
      ['times-5', 5],
      ['times-10', 10],
    ];

    it('tier 1 shows equal groups of the table number', () => {
      for (const [skill, m] of tables) {
        for (const p of all(skill, 1)) {
          const v = visual(p, 'groups');
          expect(v.each).toBe(m);
          expect(p.answer).toBe(v.groups * m);
        }
      }
    });

    it('keep to the table, and offer adding instead of multiplying as a choice', () => {
      for (const [skill, m] of tables) {
        for (let tier = 2; tier <= 3; tier++) {
          let sawAdd = false;
          for (const p of all(skill, tier)) {
            const nums = p.text!.match(/\d+/g)!.map(Number);
            expect(nums).toContain(m);
            const sum = p.text!.match(/^(\d+) × (\d+) = \?$/);
            if (sum && p.choices!.includes(Number(sum[1]) + Number(sum[2]))) sawAdd = true;
          }
          expect(sawAdd, skill).toBe(true);
          if (tier === 3) for (const p of all(skill, 3)) expect(p.activity).toBe('numberPad');
        }
      }
    });
  });

  describe('groups and arrays', () => {
    it('groups tier 1: "yes" exactly when every group is the same size', () => {
      for (const p of all('groups', 1)) {
        const v = visual(p, 'objects');
        const equal = v.groups.every((g) => g.count === v.groups[0].count);
        expect(p.answer).toBe(equal ? 'yes' : 'no');
      }
    });

    it('groups tiers 2–3 count g groups of e', () => {
      for (let tier = 2; tier <= 3; tier++) {
        for (const p of all('groups', tier)) {
          const v = visual(p, 'groups');
          expect(p.answer).toBe(v.groups * v.each);
        }
      }
    });

    it('arrays tier 1 offers rows and columns swapped', () => {
      for (const p of all('arrays', 1)) {
        const v = visual(p, 'groups');
        expect(v.layout).toBe('array');
        expect(v.groups).not.toBe(v.each);
        if (p.answer === v.groups && p.key.includes('rows')) expect(p.choices).toContain(v.each);
        if (p.answer === v.each && p.key.includes('cols')) expect(p.choices).toContain(v.groups);
      }
    });

    it('arrays tier 2: the matching sum is never also a wrong choice the other way round', () => {
      for (const p of all('arrays', 2)) {
        const v = visual(p, 'groups');
        if (typeof p.answer === 'string') {
          expect(p.answer).toBe(`${v.groups} × ${v.each}`);
          expect(p.choices).not.toContain(`${v.each} × ${v.groups}`);
        } else expect(p.answer).toBe(v.groups * v.each);
      }
    });
  });

  describe('shapes and length', () => {
    it('shapes tier 1 shows the four basic shapes the right way up', () => {
      for (const p of all('shapes-2d', 1)) {
        const v = visual(p, 'shape');
        expect(['circle', 'square', 'triangle', 'rectangle']).toContain(v.shape);
        expect(v.turned ?? 0).toBe(0);
        expect(p.answer).toBe(v.shape);
      }
    });

    it('shapes tier 2 never turns a shape so it looks upright again', () => {
      for (const p of all('shapes-2d', 2)) {
        const v = visual(p, 'shape');
        const t = v.turned ?? 0;
        if (v.shape === 'square') expect(t % 90).not.toBe(0);
        if (v.shape === 'rectangle') expect(t % 180).not.toBe(0);
      }
    });

    it('shapes tier 2 turns them topsy-turvy', () => {
      const turned = all('shapes-2d', 2).filter((p) => visual(p, 'shape').turned);
      expect(turned.length).toBeGreaterThan(SEEDS / 2);
    });

    it('shapes tier 3 has pentagons and hexagons, and sides that match', () => {
      const sides: Record<string, number> = { triangle: 3, square: 4, rectangle: 4, pentagon: 5, hexagon: 6 };
      const shapes = new Set<string>();
      for (const p of all('shapes-2d', 3)) {
        const v = visual(p, 'shape');
        shapes.add(v.shape);
        if (typeof p.answer === 'number') expect(p.answer).toBe(sides[v.shape]);
        else expect(p.answer).toBe(v.shape);
      }
      expect(shapes.has('pentagon') && shapes.has('hexagon')).toBe(true);
    });

    it('length: longer/shorter matches, then footsteps, then cm', () => {
      for (const p of all('measure-length', 1)) {
        const [a, b] = visual(p, 'length').lengths;
        expect(p.answer).toBe(a === b ? 'the same' : a > b ? 'longer' : 'shorter');
      }
      for (const p of all('measure-length', 2)) {
        const v = visual(p, 'length');
        expect(v.unit).toBe('footsteps');
        expect(p.answer).toBe(v.lengths[0]);
      }
      for (const p of all('measure-length', 3)) {
        const v = visual(p, 'length');
        expect(v.unit).toBe('cm');
        expect(p.answer).toBe(v.lengths[0]);
      }
    });
  });
});
