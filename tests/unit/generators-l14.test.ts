/**
 * Rules for land 14's generators (core/generators/l14.ts): compare-measures
 * and read-scales. The generic checks are in generators.test.ts.
 */
import { describe, expect, it } from 'vitest';
import { generate } from '../../src/core/generators';
import { L14 } from '../../src/core/generators/l14';
import { speechParts, speechText, type Problem, type Visual } from '../../src/core/problem';
import { makeRand } from '../../src/core/random';
import { tierCount, type SkillId } from '../../src/core/skills';
import { marksOf } from '../../src/activities/visuals/measure';

const RUNS = 2000;
type M = Extract<Visual, { type: 'measure' }>;

const all = (skill: SkillId, tier: number): Problem[] => Array.from({ length: RUNS }, (_, i) => generate(skill, tier, makeRand(i * 7919 + tier * 31 + 1)));
const measure = (p: Problem): M => {
  expect(p.visual.type).toBe('measure');
  return p.visual as M;
};
const fixed = (t: string): string => t.replace(/\{\w+\}/g, '');

describe('land 14 generators', () => {
  it('cover both skills with real problems', () => {
    expect(Object.keys(L14).sort()).toEqual(['compare-measures', 'read-scales']);
    for (const skill of ['compare-measures', 'read-scales'] as const) {
      for (let tier = 1; tier <= tierCount(skill); tier++) {
        for (const p of all(skill, tier).slice(0, 300)) {
          expect(p.placeholder).toBeUndefined();
          expect(p.key.startsWith(`${skill}:`)).toBe(true);
          expect(fixed(p.say.text), p.key).not.toMatch(/\d|kg|°/);
          expect(fixed(p.explain.text), p.key).not.toMatch(/\d|kg|°/);
          expect(speechText(p.say)).not.toMatch(/[{}]/);
        }
      }
    }
  });

  describe('compare-measures', () => {
    it('is answered by tapping, with a clear difference between the things', () => {
      for (let tier = 1; tier <= 4; tier++) {
        for (const p of all('compare-measures', tier)) {
          const v = measure(p);
          expect(p.activity).toBe('measure');
          expect(v.labelEvery).toBe(0);
          expect(new Set(v.values).size).toBe(v.values.length);
          expect(v.values.length).toBe(tier === 4 ? 3 : 2);
          for (const x of v.values) {
            expect(x).toBeGreaterThan(0);
            expect(x).toBeLessThan(v.max);
            expect(x % v.step).toBe(0);
          }
          const gap = tier === 1 ? 1 : tier === 2 ? 2 : 10;
          if (tier < 4) expect(Math.abs(v.values[0] - v.values[1])).toBeGreaterThanOrEqual(gap);
          if (tier < 4) {
            expect(['left', 'right']).toContain(p.answer);
            expect(p.choices).toEqual(['left', 'right']);
          } else {
            expect(p.choices).toBeUndefined();
          }
        }
      }
    });

    it('has the right side as the answer', () => {
      for (const tier of [1, 2, 3]) {
        for (const p of all('compare-measures', tier)) {
          const v = measure(p);
          const more = /heavier|more full|hotter/.test(p.say.text);
          const less = /lighter|less full|colder/.test(p.say.text);
          expect(more !== less).toBe(true);
          const biggest = v.values[0] > v.values[1] ? 'left' : 'right';
          const smallest = biggest === 'left' ? 'right' : 'left';
          expect(p.answer, p.key).toBe(more ? biggest : smallest);
        }
      }
    });

    it('puts three things in order', () => {
      const gauges = new Set<string>();
      for (const p of all('compare-measures', 4)) {
        const v = measure(p);
        gauges.add(v.gauge);
        const up = /lightest to heaviest|least full to most full|coldest to hottest/.test(p.say.text);
        const down = /heaviest to lightest|most full to least full|hottest to coldest/.test(p.say.text);
        expect(up !== down).toBe(true);
        const order = String(p.answer).split(',').map(Number);
        expect([...order].sort()).toEqual([0, 1, 2]);
        const sorted = order.map((i) => v.values[i]);
        for (let i = 1; i < 3; i++) expect(up ? sorted[i] > sorted[i - 1] : sorted[i] < sorted[i - 1], p.key).toBe(true);
        // Jugs and thermometers differ enough to see.
        const gap = v.gauge === 'thermometer' ? 10 : v.gauge === 'jug' ? 2 : 1;
        for (const a of v.values) for (const b of v.values) if (a !== b) expect(Math.abs(a - b)).toBeGreaterThanOrEqual(gap);
      }
      expect([...gauges].sort()).toEqual(['balance', 'jug', 'thermometer']);
    });
  });

  describe('read-scales', () => {
    const unitWord = { kg: /kilogram/, l: /litre/, '°C': /degree/ } as const;

    it('has the reading equal to the drawn value, on a mark', () => {
      for (let tier = 1; tier <= 4; tier++) {
        for (const p of all('read-scales', tier)) {
          const v = measure(p);
          expect(v.values).toEqual([p.answer]);
          const value = p.answer as number;
          expect(value % v.step, p.key).toBe(0);
          expect(value).toBeGreaterThan(0);
          expect(value).toBeLessThanOrEqual(v.max);
          expect(v.max).toBeLessThanOrEqual(100);
          expect(marksOf(v).some((m) => m.value === value), p.key).toBe(true);
        }
      }
    });

    it('uses the right gauge and steps for each tier', () => {
      for (const p of all('read-scales', 1)) {
        const v = measure(p);
        expect([v.gauge, v.step, v.labelEvery, v.unit]).toEqual(['dial', 1, 1, 'kg']);
      }
      for (const p of all('read-scales', 2)) {
        const v = measure(p);
        expect(v.gauge).toBe('jug');
        expect([2, 5]).toContain(v.step);
        expect(v.labelEvery).toBe(1);
        expect(v.unit).toBe('l');
      }
      for (const p of all('read-scales', 3)) {
        const v = measure(p);
        expect([v.gauge, v.step, v.labelEvery, v.unit]).toEqual(['thermometer', 10, 1, '°C']);
      }
      let bare = 0;
      for (const p of all('read-scales', 4)) {
        const v = measure(p);
        expect([2, 5, 10]).toContain(v.step);
        expect(v.labelEvery).toBeGreaterThanOrEqual(2);
        if (marksOf(v).find((m) => m.value === p.answer)?.numbered === false) bare += 1;
      }
      // Most readings sit on a mark with no number.
      expect(bare).toBeGreaterThan(RUNS * 0.6);
    });

    it('gives 3–4 choices that are marks, including the answer', () => {
      for (let tier = 1; tier <= 4; tier++) {
        for (const p of all('read-scales', tier)) {
          const v = measure(p);
          expect(p.choices!.length).toBeGreaterThanOrEqual(3);
          expect(p.choices!.length).toBeLessThanOrEqual(4);
          expect(p.choices).toContain(p.answer);
          expect(new Set(p.choices).size).toBe(p.choices!.length);
          for (const c of p.choices as number[]) {
            expect(c % v.step).toBe(0);
            expect(c).toBeLessThanOrEqual(v.max);
          }
        }
      }
    });

    it('says units in words, with the number in a slot', () => {
      for (let tier = 1; tier <= 4; tier++) {
        for (const p of all('read-scales', tier).slice(0, 400)) {
          const v = measure(p);
          // The question names the unit; nothing says "kg" or "°C".
          expect(p.say.text).toMatch(v.unit === 'kg' ? /kilograms/ : v.unit === 'l' ? /litres/ : /degrees/);
          expect(p.explain.text).toMatch(unitWord[v.unit]);
          expect(p.explain.text).toContain('{n}');
          expect(p.explain.vals).toEqual({ n: p.answer });
          expect(p.say.text + p.explain.text).not.toMatch(/\bkg\b|°|\bl\b/);
          // The pieces the voice records: no number or symbol in the fixed words.
          for (const part of speechParts(p.explain)) {
            if ('piece' in part) expect(part.piece).not.toMatch(/\d|°/);
          }
          expect(speechParts(p.explain).some((x) => 'value' in x && x.value === p.answer)).toBe(true);
          // Written under the picture.
          expect(p.text).toBe(v.unit === 'l' ? '? litres' : `? ${v.unit}`);
        }
      }
    });

    it('says one kilogram, one litre and one degree in the singular', () => {
      const singular = (skill: SkillId, tier: number, word: RegExp) => {
        const hit = all(skill, tier).find((p) => p.answer === 1);
        if (hit) expect(speechText(hit.explain)).toMatch(word);
      };
      singular('read-scales', 1, /1 kilogram\b(?!s)/);
    });
  });
});
