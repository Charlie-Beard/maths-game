/**
 * Adding and taking away to 100 (lands 9 and 10): a 2-digit number and a
 * 1-digit number, adding and taking away tens, two 2-digit numbers, and
 * missing numbers to 100.
 *
 * The "no crossing" tiers never make a new ten (34 + 5, 57 − 23); the
 * "crossing a ten" tiers always do (36 + 7, 52 − 27); the typed tiers mix
 * both. Tested in tests/unit/generators-addsub.test.ts.
 *
 * Bundles: a `tensOnes` picture shows the first number as bundles of ten
 * sticks and single sticks; he adds or takes away from there and gives the
 * total. On a number line, `marks` is the ten to hop to on the way.
 */
import type { Problem } from '../../problem';
import type { Rand } from '../../random';
import { choicesFor } from '../helpers';
import { askSum, explainSum, onesOf, sumText, tensOf, type Op } from './shared';

/**
 * Likely slips for a 2-digit sum. Crossing: the lost (or extra) ten comes
 * first, then `special`, then one out. Not crossing: one out, then
 * `special` (or ten out).
 */
function slips(c: number, op: Op, crossed: boolean, special?: number): number[] {
  const s = special !== undefined && special !== c ? special : c + 10;
  return crossed ? [op === '+' ? c - 10 : c + 10, s, c - 1] : [c + 1, c - 1, s];
}

/** a ± b where a is 2-digit and b is 1-digit; `cross` says whether it goes past a ten. */
function pair2d1d(op: Op, cross: boolean, r: Rand): { a: number; b: number } {
  if (op === '+') {
    if (cross) {
      // Ones 2–9, and b big enough to go past the next ten; stays under 100.
      // b goes at least one past the ten, so the "and then on" hop is real.
      const a = r.int(1, 8) * 10 + r.int(2, 9);
      return { a, b: r.int(11 - onesOf(a), 9) };
    }
    const a = r.int(1, 9) * 10 + r.int(0, 8);
    return { a, b: r.int(1, 9 - onesOf(a)) };
  }
  if (cross) {
    // Ones 1–8, take away more than the ones; from 20 up, so it stays positive.
    const a = r.int(2, 9) * 10 + r.int(1, 8);
    return { a, b: r.int(onesOf(a) + 1, 9) };
  }
  const a = r.int(1, 9) * 10 + r.int(1, 9);
  return { a, b: r.int(1, onesOf(a)) };
}

function twoDigitOneDigit(skill: 'add-2d1d' | 'sub-2d1d', op: Op, tier: number, r: Rand): Problem {
  const cross = tier === 3 || (tier === 4 && r.chance(0.5));
  const { a, b } = pair2d1d(op, cross, r);
  const c = op === '+' ? a + b : a - b;
  // Place-value slips: the ones added to the tens (34 + 5 → 84), or
  // the small ones taken from the big (43 − 7 → 44).
  const pv = op === '+' ? a + b * 10 : tensOf(a) * 10 + Math.abs(onesOf(a) - b);
  const common = {
    skill,
    tier,
    say: askSum(a, op, b),
    text: sumText(a, op, b, '?'),
    answer: c,
    choices: choicesFor(c, r, { min: 0, max: 99, likely: slips(c, op, cross, pv) }),
    explain: explainSum(a, op, b, c),
    key: `${skill}:${a}${op}${b}`,
  } as const;
  if (tier === 1) {
    return { ...common, activity: 'tensOnes', visual: { type: 'tensOnes', tens: tensOf(a), ones: onesOf(a) } };
  }
  if (tier === 3) {
    // A short number line across the ten he crosses, in two hops.
    const ten = op === '+' ? (tensOf(a) + 1) * 10 : tensOf(a) * 10;
    const from = op === '+' ? tensOf(a) * 10 : ten - 10;
    const k = op === '+' ? ten - a : a - ten;
    return {
      ...common,
      activity: 'numberLine',
      say: op === '+' ? { text: 'Jump to the next ten first. What is {a} add {b}?', vals: { a, b } } : { text: 'Jump back to the ten first. What is {a} take away {b}?', vals: { a, b } },
      visual: { type: 'numberLine', from, to: from + 20, start: a, step: op === '+' ? 1 : -1, marks: [ten] },
      explain:
        op === '+'
          ? { text: '{a} add {k} makes {ten}, and {rest} more makes {c}!', vals: { a, k, ten, rest: b - k, c } }
          : { text: '{a} take away {k} makes {ten}, then take away {rest} more. That leaves {c}!', vals: { a, k, ten, rest: b - k, c } },
    };
  }
  return { ...common, activity: tier === 4 ? 'numberPad' : 'choose', visual: { type: 'none' } };
}

export const add2d1d = (tier: number, r: Rand): Problem => twoDigitOneDigit('add-2d1d', '+', tier, r);
export const sub2d1d = (tier: number, r: Rand): Problem => twoDigitOneDigit('sub-2d1d', '−', tier, r);

export function addTens(tier: number, r: Rand): Problem {
  let a: number, b: number;
  const op: Op = tier === 3 ? '−' : '+';
  if (op === '+') {
    // 34 + 20: the total stays under 100.
    a = r.int(1, 8) * 10 + r.int(0, 9);
    b = r.int(1, 9 - tensOf(a)) * 10;
  } else {
    // 54 − 30: leaves at least one ten.
    a = r.int(2, 9) * 10 + r.int(0, 9);
    b = r.int(1, tensOf(a) - 1) * 10;
  }
  const c = op === '+' ? a + b : a - b;
  // Slips: ten out, one out, or moved the ones instead of the tens (34 + 2).
  const wrongPlace = op === '+' ? a + b / 10 : a - b / 10;
  const common = {
    skill: 'add-tens',
    tier,
    say: askSum(a, op, b),
    text: sumText(a, op, b, '?'),
    answer: c,
    choices: choicesFor(c, r, { min: 0, max: 99, likely: [c + 10, c - 10, wrongPlace, c + 1] }),
    explain: { text: `{a} ${op === '+' ? 'add' : 'take away'} {t} ${b === 10 ? 'ten' : 'tens'} ${op === '+' ? 'makes' : 'leaves'} {c}!`, vals: { a, t: b / 10, c } },
    key: `add-tens:${a}${op}${b}`,
  } as const;
  if (tier === 1) {
    return {
      ...common,
      activity: 'tensOnes',
      say: { text: `Here is {a}. Add {t} more ${b === 10 ? 'bundle' : 'bundles'} of ten. What is {a} add {b}?`, vals: { a, t: b / 10, b } },
      visual: { type: 'tensOnes', tens: tensOf(a), ones: onesOf(a) },
    };
  }
  return { ...common, activity: 'choose', visual: { type: 'none' } };
}

/** a ± b, both 2-digit; `cross` says whether the ones go past a ten. */
function pair2d2d(op: Op, cross: boolean, r: Rand): { a: number; b: number } {
  if (op === '+') {
    if (cross) {
      // Ones add to 10 or more; tens leave room for the carried ten.
      const ua = r.int(1, 9);
      const ub = r.int(Math.max(1, 10 - ua), 9);
      const ta = r.int(1, 7);
      const tb = r.int(1, 8 - ta);
      return { a: ta * 10 + ua, b: tb * 10 + ub };
    }
    const ua = r.int(0, 8);
    const ub = r.int(1, 9 - ua);
    const ta = r.int(1, 8);
    const tb = r.int(1, 9 - ta);
    return { a: ta * 10 + ua, b: tb * 10 + ub };
  }
  if (cross) {
    // Ones of a smaller than ones of b; a has at least one more ten than b.
    const ua = r.int(0, 8);
    const ub = r.int(ua + 1, 9);
    const tb = r.int(1, 7);
    const ta = r.int(tb + 1, 9);
    return { a: ta * 10 + ua, b: tb * 10 + ub };
  }
  const ub = r.int(1, 9);
  const ua = r.int(ub, 9);
  const tb = r.int(1, 8);
  const ta = r.int(tb + 1, 9);
  return { a: ta * 10 + ua, b: tb * 10 + ub };
}

function twoDigitTwoDigit(skill: 'add-2d2d' | 'sub-2d2d', op: Op, tier: number, r: Rand): Problem {
  const cross = tier === 3 || (tier === 4 && r.chance(0.5));
  const { a, b } = pair2d2d(op, cross, r);
  const c = op === '+' ? a + b : a - b;
  // Taking the small ones from the big: 52 − 27 → 35 (5 − 2 tens, 7 − 2 ones).
  const flipped = op === '−' ? (tensOf(a) - tensOf(b)) * 10 + Math.abs(onesOf(a) - onesOf(b)) : c;
  const common = {
    skill,
    tier,
    say: askSum(a, op, b),
    text: sumText(a, op, b, '?'),
    answer: c,
    choices: choicesFor(c, r, { min: 0, max: 99, likely: slips(c, op, cross, op === '−' && cross ? flipped : undefined) }),
    // Tens first, then ones, the way he builds it with bundles.
    explain:
      op === '+'
        ? { text: '{a} add {t} makes {mid}, and {u} more makes {c}!', vals: { a, t: tensOf(b) * 10, mid: a + tensOf(b) * 10, u: onesOf(b), c } }
        : { text: '{a} take away {t} leaves {mid}, then take away {u} more. That leaves {c}!', vals: { a, t: tensOf(b) * 10, mid: a - tensOf(b) * 10, u: onesOf(b), c } },
    key: `${skill}:${a}${op}${b}`,
  } as const;
  if (tier === 1) {
    return { ...common, activity: 'tensOnes', visual: { type: 'tensOnes', tens: tensOf(a), ones: onesOf(a) } };
  }
  return { ...common, activity: tier === 4 ? 'numberPad' : 'choose', visual: { type: 'none' } };
}

export const add2d2d = (tier: number, r: Rand): Problem => twoDigitTwoDigit('add-2d2d', '+', tier, r);
export const sub2d2d = (tier: number, r: Rand): Problem => twoDigitTwoDigit('sub-2d2d', '−', tier, r);

export function missing100(tier: number, r: Rand): Problem {
  const form = tier === 4 ? r.int(1, 3) : tier;
  const base = { skill: 'missing-100', tier, activity: tier === 4 ? 'numberPad' : 'choose' } as const;
  if (form === 1) {
    // 30 + ? = 100, in tens, with the bundles shown.
    const a = r.int(1, 9) * 10;
    const b = 100 - a;
    return {
      ...base,
      say: { text: '{a} add what makes 100?', vals: { a } },
      text: sumText(a, '+', '?', 100),
      answer: b,
      choices: choicesFor(b, r, { min: 0, max: 100, likely: [b + 10, b - 10, a, b / 10] }),
      visual: tier === 1 ? { type: 'tensOnes', tens: a / 10, ones: 0 } : { type: 'none' },
      explain: explainSum(a, '+', b, 100),
      key: `missing-100:${a}+?=100`,
    };
  }
  if (form === 2) {
    // 45 + ? = 50: up to the next ten.
    const a = r.int(1, 9) * 10 + r.int(1, 9);
    const c = (tensOf(a) + 1) * 10;
    const b = c - a;
    return {
      ...base,
      say: { text: '{a} add what makes {c}?', vals: { a, c } },
      text: sumText(a, '+', '?', c),
      answer: b,
      // Slips: one out, or the ones digit itself (45 → 5 is right; 43 → 3).
      choices: choicesFor(b, r, { min: 0, max: 99, likely: [b + 1, b - 1, onesOf(a), 10 + b] }),
      visual: { type: 'none' },
      explain: explainSum(a, '+', b, c),
      key: `missing-100:${a}+?=${c}`,
    };
  }
  // ? − 20 = 35: what did we start with?
  const b = r.int(1, 6) * 10;
  const c = r.int(1, 9 - b / 10) * 10 + r.int(0, 9);
  const a = b + c;
  return {
    ...base,
    say: { text: 'What take away {b} leaves {c}?', vals: { b, c } },
    text: sumText('?', '−', b, c),
    answer: a,
    // Slips: took away instead of adding back, or ten out.
    choices: choicesFor(a, r, { min: 0, max: 99, likely: [c - b, a + 10, a - 10, a + 1] }),
    visual: { type: 'none' },
    explain: explainSum(a, '−', b, c),
    key: `missing-100:?-${b}=${c}`,
  };
}
