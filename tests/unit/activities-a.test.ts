import { describe, expect, it } from 'vitest';
import { cardToDrop, cardValues, frameCount, layoutObjects, lineWindow, partWholeShape, splitSum, startCells, tenFrameMode, typeDigit } from '../../src/activities/a-logic';
import type { Problem } from '../../src/core/problem';

const base: Problem = { skill: 'bonds-10', tier: 1, activity: 'tenFrame', say: { text: '' }, answer: 4, visual: { type: 'none' }, explain: { text: '' }, key: 'k' };

describe('cards', () => {
  it('uses the problem’s choices, or makes neighbours', () => {
    expect(cardValues({ ...base, choices: [1, 4, 5] })).toEqual([1, 4, 5]);
    expect(cardValues({ ...base, answer: 0 })).toEqual([0, 1, 2]);
    expect(cardValues({ ...base, answer: 7 })).toContain(7);
  });
  it('drops the furthest wrong card, never the answer, and keeps two', () => {
    expect(cardToDrop([3, 4, 5, 9], 4)).toBe(9);
    expect(cardToDrop([4, 5], 4)).toBeNull();
  });
});

describe('layoutObjects', () => {
  const box = { x: 170, y: 112, w: 840, h: 350 };
  const inside = (l: ReturnType<typeof layoutObjects>) =>
    l.spots.flat().every((s) => s.x >= box.x - 1 && s.y >= box.y - 1 && s.x + l.size <= box.x + box.w + 1 && s.y + l.size <= box.y + box.h + 1);
  const overlaps = (l: ReturnType<typeof layoutObjects>) => {
    const all = l.spots.flat();
    return all.some((a, i) => all.some((b, j) => j > i && Math.abs(a.x - b.x) < l.size - 1 && Math.abs(a.y - b.y) < l.size - 1));
  };
  for (const mode of ['row', 'scatter', 'fives'] as const) {
    for (const counts of [[1], [5], [10], [16], [20], [5, 3], [10, 10], [4, 4]]) {
      it(`${mode} ${counts.join('+')}: tappable, inside the box, not overlapping`, () => {
        const l = layoutObjects(counts, mode, box, 42);
        expect(l.size).toBeGreaterThanOrEqual(72);
        expect(l.spots.map((g) => g.length)).toEqual(counts);
        expect(inside(l)).toBe(true);
        expect(overlaps(l)).toBe(false);
        expect(l.ops).toHaveLength(counts.length - 1);
      });
    }
  }
  it('keeps small counts in one row', () => {
    const l = layoutObjects([5, 3], 'row', box);
    expect(new Set(l.spots.flat().map((s) => s.y)).size).toBe(1);
  });
  it('scatters the same way each time', () => {
    expect(layoutObjects([7], 'scatter', box, 9)).toEqual(layoutObjects([7], 'scatter', box, 9));
  });
});

describe('tenFrameMode', () => {
  const tf = (frames: number[], answer: number, extra: object = {}, say = '') => ({ ...base, answer, say: { text: say }, visual: { type: 'tenFrame' as const, frames, ...extra } });
  it('works out what kind of ten-frame problem it is', () => {
    expect(tenFrameMode(tf([6], 4, {}, 'How many more to fill it?'))).toBe('fill');
    expect(tenFrameMode(tf([5], 5, {}, 'How many more to fill it?'))).toBe('fill');
    expect(tenFrameMode(tf([5], 5, {}, 'How many?'))).toBe('read');
    expect(tenFrameMode(tf([7], 7))).toBe('read');
    expect(tenFrameMode(tf([10, 4], 6))).toBe('fill');
    expect(tenFrameMode(tf([4], 7, { add: 3 }))).toBe('add');
    expect(tenFrameMode(tf([9], 5, { remove: 4 }))).toBe('remove');
  });
  it('adds a second frame when adding spills over ten', () => {
    expect(frameCount([8], 5)).toBe(2);
    expect(frameCount([8, 0], 5)).toBe(2);
    expect(frameCount([4], 3)).toBe(1);
    expect(startCells([10, 3])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
});

describe('lineWindow', () => {
  it('shows a short line whole', () => {
    expect(lineWindow(0, 10, 7, 4, -1)?.marks).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    // Up to 100 the numbers are wider, so fewer rungs show (a window).
    expect(lineWindow(0, 100, 20, 50, 10)?.marks).toEqual([10, 20, 30, 40, 50, 60, 70]);
  });
  it('windows a long line around the start and the answer', () => {
    for (const [s, a] of [[8, 13], [18, 9], [4, 13], [19, 10]]) {
      const w = lineWindow(0, 20, s, a, 1)!;
      expect(w.marks.length).toBeLessThanOrEqual(11);
      expect(w.marks).toContain(s);
      expect(w.marks).toContain(a);
    }
    const w = lineWindow(40, 60, 47, 52, 1)!;
    expect(w.marks.length).toBeLessThanOrEqual(11);
    expect(lineWindow(90, 100, 93, 97, 1)!.marks.length).toBeLessThanOrEqual(7);
  });
  it('gives up (null) when start and answer can’t both be shown', () => {
    expect(lineWindow(0, 100, 5, 60, 1)).toBeNull();
    expect(lineWindow(0, 10, 3, 12, 1)).toBeNull();
  });
});

describe('partWholeShape', () => {
  it('fills in the missing number', () => {
    expect(partWholeShape(10, [3, null], 7)).toEqual({ whole: 10, parts: [3, 7], missing: 1 });
    expect(partWholeShape(null, [4, 2], 6)).toEqual({ whole: 6, parts: [4, 2], missing: -1 });
  });
  it('refuses problems that don’t add up or have no gap', () => {
    expect(partWholeShape(10, [3, null], 6)).toBeNull();
    expect(partWholeShape(10, [3, 7], 7)).toBeNull();
  });
});

describe('numberPad', () => {
  it('splits the sum at the gap', () => {
    expect(splitSum('4 + 3 = ?')).toEqual({ before: '4 + 3 =', after: '' });
    expect(splitSum('2 + ? = 10')).toEqual({ before: '2 +', after: '= 10' });
  });
  it('types digits without leading zeros, up to a limit', () => {
    expect(typeDigit('', '0', 2)).toBe('0');
    expect(typeDigit('0', '7', 2)).toBe('7');
    expect(typeDigit('4', '3', 2)).toBe('43');
    expect(typeDigit('43', '1', 2)).toBe('43');
  });
});
