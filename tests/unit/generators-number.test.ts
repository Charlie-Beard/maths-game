import { describe, expect, it } from 'vitest';
import { generate, unbuiltSkills } from '../../src/core/generators';
import { NUMBER } from '../../src/core/generators/number';
import { speechText, type Problem } from '../../src/core/problem';
import { makeRand } from '../../src/core/random';
import { tierCount, type SkillId } from '../../src/core/skills';

const W1A: SkillId[] = ['subitise', 'one-more', 'one-less', 'compare-10', 'teens', 'count-20', 'count-10s', 'tens-ones', 'count-100', 'compare-100', 'odd-even', 'count-2s-5s'];

/** Many problems of one skill at one tier. */
const many = (skill: SkillId, tier: number, n = 300): Problem[] => Array.from({ length: n }, (_, i) => generate(skill, tier, makeRand(i * 31 + tier)));

/** The numbers in a written sequence, with null for the gap. */
const seqOf = (text: string): (number | null)[] => text.split(', ').map((x) => (x === '?' ? null : Number(x)));

describe('number generators (W1a)', () => {
  it('are all built', () => {
    for (const skill of W1A) {
      expect(NUMBER[skill], skill).toBeDefined();
      expect(unbuiltSkills()).not.toContain(skill);
    }
  });

  it('always give 2–4 choices, ask with words, and keep numbers in slots', () => {
    for (const skill of W1A) {
      for (let tier = 1; tier <= tierCount(skill); tier++) {
        for (const p of many(skill, tier, 100)) {
          expect(p.choices, `${skill} ${tier}`).toBeDefined();
          expect(p.placeholder).toBeUndefined();
          // No bare digits in the spoken template: numbers go in {slots} (10 and 5 as fixed words are fine).
          expect(p.say.text.replace(/\b(10|5|1)\b/g, ''), `${skill} ${tier}: ${p.say.text}`).not.toMatch(/\d/);
          expect(speechText(p.explain).length).toBeGreaterThan(0);
          expect(p.key.startsWith(skill)).toBe(true);
        }
      }
    }
  });

  it('subitise: dice to 4, then 6, then ten-frame patterns to 10', () => {
    for (const p of many('subitise', 1)) expect(p.answer as number).toBeLessThanOrEqual(4);
    for (const p of many('subitise', 2)) {
      expect(p.answer as number).toBeLessThanOrEqual(6);
      expect(p.visual).toMatchObject({ type: 'dots', pattern: 'dice' });
    }
    for (const p of many('subitise', 3)) {
      expect(p.visual).toMatchObject({ type: 'dots', pattern: 'frame', count: p.answer });
      expect(p.answer as number).toBeLessThanOrEqual(10);
    }
  });

  it('one more and one less are exactly one step, within range', () => {
    for (let tier = 1; tier <= 3; tier++) {
      for (const p of many('one-more', tier)) {
        const n = p.say.vals!.n as number;
        expect(p.answer).toBe(n + 1);
        expect(p.answer as number).toBeLessThanOrEqual(tier === 1 ? 6 : 10);
      }
      for (const p of many('one-less', tier)) {
        const n = p.say.vals!.n as number;
        expect(p.answer).toBe(n - 1);
        expect(p.answer as number).toBeGreaterThanOrEqual(1);
      }
    }
    for (const p of many('one-more', 1)) expect(p.visual.type).toBe('objects');
    for (const p of many('one-less', 2)) expect(p.visual).toMatchObject({ type: 'numberLine', step: -1 });
  });

  it('compare-10: groups are never equal when asking which is more; "the same" comes up at tier 2', () => {
    for (const tier of [1, 3]) {
      for (const p of many('compare-10', tier)) {
        if (p.visual.type !== 'compare') throw new Error('compare visual');
        const { left, right } = p.visual;
        expect(left).not.toBe(right);
        expect(p.choices!.slice().sort()).toEqual([left, right].sort());
      }
    }
    const t2 = many('compare-10', 2);
    expect(t2.some((p) => p.answer === 'the same')).toBe(true);
    for (const p of t2) {
      if (p.visual.type !== 'compare') throw new Error('compare visual');
      const { left, right } = p.visual;
      expect(p.answer).toBe(left > right ? 'more' : left < right ? 'fewer' : 'the same');
      expect(p.choices).toHaveLength(3);
    }
  });

  it('teens tier 1 always has one full ten frame and some more', () => {
    for (const p of many('teens', 1)) {
      if (p.visual.type !== 'tenFrame') throw new Error('ten frame');
      expect(p.visual.frames[0]).toBe(10);
      expect(p.visual.frames[1]).toBeGreaterThanOrEqual(1);
      expect(p.answer).toBe(10 + p.visual.frames[1]);
    }
    for (const tier of [2, 3]) {
      for (const p of many('teens', tier)) {
        expect(p.answer as number).toBeGreaterThanOrEqual(11);
        expect(p.answer as number).toBeLessThanOrEqual(19);
      }
    }
    // Tier 2 offers the digit-swap trap (14 / 41) at least sometimes.
    expect(many('teens', 2).some((p) => p.choices!.includes(((p.answer as number) % 10) * 10 + 1))).toBe(true);
  });

  it('count-20 stays within 0–20 and its sequences really are in order', () => {
    for (let tier = 1; tier <= 3; tier++) {
      for (const p of many('count-20', tier)) {
        expect(p.answer as number).toBeLessThanOrEqual(20);
        if (p.key.includes(':seq:')) {
          const seq = seqOf(p.text!);
          const full = seq.map((x) => x ?? (p.answer as number));
          const diffs = full.slice(1).map((x, i) => x - full[i]);
          expect(new Set(diffs).size).toBe(1);
          expect(Math.abs(diffs[0])).toBe(1);
        }
      }
    }
    for (const p of many('count-20', 1)) expect(p.visual).toMatchObject({ type: 'objects', groups: [{ count: p.answer }] });
  });

  it('count-10s: bundles to 50, then 100; gaps in a tens sequence', () => {
    for (const p of many('count-10s', 1)) {
      expect((p.answer as number) % 10).toBe(0);
      expect(p.answer as number).toBeLessThanOrEqual(50);
    }
    for (const p of many('count-10s', 2)) expect(p.answer as number).toBeLessThanOrEqual(100);
    for (const p of many('count-10s', 3)) {
      const full = seqOf(p.text!).map((x) => x ?? (p.answer as number));
      for (const x of full) expect(x % 10).toBe(0);
      expect(Math.abs(full[1] - full[0])).toBe(10);
      expect(seqOf(p.text!)[0]).not.toBeNull();
    }
  });

  it('tens-ones: build to 50, read to 99, and partitions add up', () => {
    for (const p of many('tens-ones', 1)) {
      expect(p.answer as number).toBeLessThan(50);
      expect(p.visual).toEqual({ type: 'tensOnes', tens: 0, ones: 0 });
    }
    for (const p of many('tens-ones', 2)) {
      if (p.visual.type !== 'tensOnes') throw new Error('tensOnes');
      expect(p.answer).toBe(p.visual.tens * 10 + p.visual.ones);
    }
    for (const tier of [3, 4]) {
      for (const p of many('tens-ones', tier)) {
        if (p.visual.type === 'tensOnes') expect(p.answer).toBe(p.visual.tens * 10 + p.visual.ones);
        else expect(p.text).toMatch(/^(\d+|\?) \+ (\d+|\?) = (\d+|\?)$/);
      }
    }
    for (const p of many('tens-ones', 4)) expect(p.activity).toBe('numberPad');
  });

  it('count-100: hops stay on the line; hundred-square rows never wrap', () => {
    for (const p of many('count-100', 2)) {
      if (p.visual.type !== 'numberLine') throw new Error('line');
      expect(p.answer as number).toBeGreaterThanOrEqual(p.visual.from);
      expect(p.answer as number).toBeLessThanOrEqual(p.visual.to);
      expect(p.visual.to - p.visual.from).toBe(10);
    }
    for (const p of many('count-100', 3)) {
      const full = seqOf(p.text!).map((x) => x ?? (p.answer as number));
      const step = full[1] - full[0];
      expect([1, 10]).toContain(step);
      if (step === 1) {
        // All in one row: 41–50, say.
        const row = (x: number) => Math.ceil(x / 10);
        expect(new Set(full.map(row)).size).toBe(1);
      }
      expect(Math.max(...full)).toBeLessThanOrEqual(100);
    }
    for (const p of many('count-100', 1)) expect(p.answer as number).toBeLessThanOrEqual(100);
  });

  it('compare-100 never asks about equal numbers unless "=" is a choice', () => {
    for (let tier = 1; tier <= 4; tier++) {
      for (const p of many('compare-100', tier)) {
        if (p.visual.type === 'compare' && p.visual.left === p.visual.right) {
          expect(p.choices).toContain('=');
          expect(p.answer).toBe('=');
        }
      }
    }
    const t3 = many('compare-100', 3);
    expect(t3.some((p) => p.answer === '=')).toBe(true);
    for (const p of t3) {
      if (p.visual.type !== 'compare') throw new Error('compare');
      const { left, right } = p.visual;
      expect(p.answer).toBe(left > right ? '>' : left < right ? '<' : '=');
      expect(p.choices!.slice().sort()).toEqual(['<', '=', '>']);
    }
    for (const p of many('compare-100', 4)) {
      expect(new Set(p.choices).size).toBe(3);
      const sorted = (p.choices as number[]).slice().sort((a, b) => a - b);
      expect(sorted).toContain(p.answer);
    }
    // Tier 2 sometimes swaps the digits, to make him look at the tens.
    expect(many('compare-100', 2).some((p) => p.visual.type === 'compare' && p.visual.left === (p.visual.right % 10) * 10 + Math.floor(p.visual.right / 10))).toBe(true);
  });

  it('odd-even answers match the number, to 10 then to 20', () => {
    for (let tier = 1; tier <= 3; tier++) {
      for (const p of many('odd-even', tier)) {
        const n = p.say.vals!.n as number;
        expect(p.answer).toBe(n % 2 ? 'odd' : 'even');
        expect(n).toBeLessThanOrEqual(tier === 3 ? 20 : 10);
        expect(p.choices!.slice().sort()).toEqual(['even', 'odd']);
      }
    }
    for (const p of many('odd-even', 1)) expect(p.visual).toMatchObject({ type: 'objects' });
    expect(many('odd-even', 3).some((p) => (p.say.vals!.n as number) > 10)).toBe(true);
  });

  it('count-2s-5s: pairs in 2s, hands in 5s, and gaps in a 2s or 5s sequence', () => {
    for (const p of many('count-2s-5s', 1)) {
      expect(p.visual).toMatchObject({ type: 'groups', each: 2 });
      if (p.visual.type === 'groups') expect(p.answer).toBe(p.visual.groups * 2);
    }
    for (const p of many('count-2s-5s', 2)) {
      expect(p.visual).toMatchObject({ type: 'groups', each: 5 });
      if (p.visual.type === 'groups') expect(p.answer).toBe(p.visual.groups * 5);
    }
    for (const p of many('count-2s-5s', 3)) {
      const full = seqOf(p.text!).map((x) => x ?? (p.answer as number));
      const step = full[1] - full[0];
      expect([2, 5]).toContain(step);
      for (const x of full) expect(x % step).toBe(0);
    }
  });
});
