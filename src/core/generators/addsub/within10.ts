/**
 * Adding and taking away within 10, after bonds to 10 (lands 3 and 4):
 * part-whole, missing numbers, fact families, fluency and doubles to 5 + 5.
 *
 * Every tier follows its line in core/skills.ts: objects first, then a
 * picture model (part-whole, ten frames), then the sum alone, then typed.
 */
import type { Problem, Visual } from '../../problem';
import type { Rand } from '../../random';
import { choicesFor, choicesFrom, COUNTING_PROPS, FOLK, propWord } from '../helpers';
import { apply, askSum, cap, explainSum, he, sumText, type Op } from './shared';

/** A whole from `lo` to 10 split into two parts, each at least 1. */
function split10(r: Rand, lo = 3): { w: number; a: number; b: number } {
  const w = r.int(lo, 10);
  const a = r.int(1, w - 1);
  return { w, a, b: w - a };
}

export function partWhole10(tier: number, r: Rand): Problem {
  const { w, a, b } = split10(r);
  const base = { skill: 'part-whole-10', tier } as const;
  if (tier === 1) {
    // The whole as objects; the missing part has gone into Dame Washalot's
    // basket (drawn faded), so he can count them, or count on from a.
    const prop = r.pick(COUNTING_PROPS);
    return {
      ...base,
      activity: 'count',
      say: {
        text: `Dame Washalot has {w} ${propWord(prop, w)}. {a} ${a === 1 ? 'is' : 'are'} on the table. The rest are in her basket. How many are in the basket?`,
        vals: { w, a },
      },
      answer: b,
      choices: choicesFor(b, r, { min: 0, max: 10, likely: [b + 1, b - 1, w, a] }),
      visual: { type: 'objects', groups: [{ prop, count: w, gone: b }], op: '-' },
      explain: { text: '{a} and {b} make {w}!', vals: { a, b, w } },
      key: `part-whole-10:${w}:${a}`,
    };
  }
  // Tiers 2 and 3: the cherry, then the bar. Usually a part is missing;
  // sometimes the whole, so he sees the model both ways.
  const model = tier === 2 ? 'cherry' : 'bar';
  if (r.chance(0.25)) {
    return {
      ...base,
      activity: 'partWhole',
      say: { text: 'The parts are {a} and {b}. What is the whole?', vals: { a, b } },
      text: sumText(a, '+', b, '?'),
      answer: w,
      choices: choicesFor(w, r, { min: 0, max: 10, likely: [w + 1, w - 1, Math.abs(a - b)] }),
      visual: { type: 'partWhole', whole: null, parts: [a, b], model },
      explain: { text: '{a} and {b} make {w}!', vals: { a, b, w } },
      key: `part-whole-10:whole:${a}+${b}`,
    };
  }
  return {
    ...base,
    activity: 'partWhole',
    say: { text: 'The whole is {w}. One part is {a}. What is the other part?', vals: { w, a } },
    text: sumText(a, '+', '?', w),
    answer: b,
    choices: choicesFor(b, r, { min: 0, max: 10, likely: [b + 1, b - 1, w, Math.min(w + a, 10)] }),
    visual: { type: 'partWhole', whole: w, parts: [a, null], model },
    explain: { text: '{a} and {b} make {w}!', vals: { a, b, w } },
    key: `part-whole-10:${w}:${a}`,
  };
}

/** One missing-number sum within 10, in one of three shapes. */
type MissingForm = 'add' | 'subWhole' | 'subPart';

function missingSum(skill: 'missing-10' | 'fluency-10', tier: number, form: MissingForm, r: Rand): Omit<Problem, 'activity' | 'visual'> {
  const { w, a, b } = split10(r);
  if (form === 'add') {
    // a + ? = w
    return {
      skill,
      tier,
      say: { text: '{a} add what makes {w}?', vals: { a, w } },
      text: sumText(a, '+', '?', w),
      answer: b,
      choices: choicesFor(b, r, { min: 0, max: 10, likely: [b + 1, b - 1, w, Math.min(a + w, 10)] }),
      explain: explainSum(a, '+', b, w),
      key: `${skill}:${a}+?=${w}`,
    };
  }
  if (form === 'subWhole') {
    // ? − a = b: what did we start with?
    return {
      skill,
      tier,
      say: { text: 'What take away {a} leaves {b}?', vals: { a, b } },
      text: sumText('?', '−', a, b),
      answer: w,
      choices: choicesFor(w, r, { min: 0, max: 10, likely: [w + 1, w - 1, Math.abs(b - a)] }),
      explain: explainSum(w, '−', a, b),
      key: `${skill}:?-${a}=${b}`,
    };
  }
  // w − ? = b
  return {
    skill,
    tier,
    say: { text: '{w} take away what leaves {b}?', vals: { w, b } },
    text: sumText(w, '−', '?', b),
    answer: a,
    choices: choicesFor(a, r, { min: 0, max: 10, likely: [a + 1, a - 1, b, Math.min(w + b, 10)] }),
    explain: explainSum(w, '−', a, b),
    key: `${skill}:${w}-?=${b}`,
  };
}

export function missing10(tier: number, r: Rand): Problem {
  if (tier === 1) {
    // 3 + ? = 7 with objects: the ones he has, and faded ones still to come.
    const { w, a, b } = split10(r);
    const prop = r.pick(COUNTING_PROPS);
    const who = r.pick(FOLK);
    return {
      skill: 'missing-10',
      tier,
      activity: 'count',
      say: { text: `${cap(who)} has {a} ${propWord(prop, a)}. ${cap(he(who))} wants {w}. How many more are needed?`, vals: { a, w } },
      text: sumText(a, '+', '?', w),
      answer: b,
      choices: choicesFor(b, r, { min: 0, max: 10, likely: [b + 1, b - 1, w] }),
      visual: { type: 'objects', groups: [{ prop, count: a }, { prop, count: b, gone: b }], op: '+' },
      explain: explainSum(a, '+', b, w),
      key: `missing-10:${a}+?=${w}`,
    };
  }
  const form: MissingForm = tier === 2 ? 'add' : tier === 3 ? r.pick(['subWhole', 'subPart'] as const) : r.pick(['add', 'subWhole', 'subPart'] as const);
  return { ...missingSum('missing-10', tier, form, r), activity: tier === 4 ? 'numberPad' : 'choose', visual: { type: 'none' } };
}

export function factFamily10(tier: number, r: Rand): Problem {
  // Two different parts, so the family has four different facts.
  let { w, a, b } = split10(r);
  while (a === b) ({ w, a, b } = split10(r));
  const base = { skill: 'fact-family-10', tier } as const;
  const family = { text: '{a} and {b} make {w}. They are a family!', vals: { a, b, w } };

  if (tier === 1) {
    // Two sums from one picture: we know a + b; the same objects show the
    // turnaround, or the take away.
    const prop = r.pick(COUNTING_PROPS);
    const visual: Visual = { type: 'objects', groups: [{ prop, count: a }, { prop, count: b }], op: '+' };
    if (r.chance(0.5)) {
      return {
        ...base,
        activity: 'count',
        say: { text: '{a} add {b} makes {w}. So what is {b} add {a}?', vals: { a, b, w } },
        text: sumText(b, '+', a, '?'),
        answer: w,
        choices: choicesFor(w, r, { min: 0, max: 10, likely: [w + 1, w - 1, Math.abs(a - b)] }),
        visual,
        explain: explainSum(b, '+', a, w),
        key: `fact-family-10:${a}+${b}:turn`,
      };
    }
    return {
      ...base,
      activity: 'count',
      say: { text: '{a} add {b} makes {w}. So what is {w} take away {b}?', vals: { a, b, w } },
      text: sumText(w, '−', b, '?'),
      answer: a,
      choices: choicesFor(a, r, { min: 0, max: 10, likely: [b, a + 1, a - 1, w] }),
      visual,
      explain: explainSum(w, '−', b, a),
      key: `fact-family-10:${a}+${b}:back`,
    };
  }

  const facts = [sumText(a, '+', b, w), sumText(b, '+', a, w), sumText(w, '−', a, b), sumText(w, '−', b, a)];
  if (tier === 2) {
    // Which sum belongs to the family? The others are near misses: one
    // number out, or the right numbers in the wrong order.
    const answer: string = r.pick(facts);
    const wrong = r.shuffle([
      sumText(a, '+', b, w + 1),
      sumText(w, '−', a, b + 1),
      sumText(w, '−', b, a + 1),
      sumText(a, '+', w, b),
      sumText(w, '+', b, a),
    ]);
    return {
      ...base,
      activity: 'choose',
      say: { text: 'The family is {a}, {b} and {w}. Which sum belongs to the family?', vals: { a, b, w } },
      answer,
      choices: choicesFrom(answer, [answer, ...wrong.slice(0, 2)], r),
      visual: { type: 'partWhole', whole: w, parts: [a, b], model: 'cherry' },
      explain: family,
      key: `fact-family-10:pick:${a}+${b}`,
    };
  }

  // Tier 3: all four facts. The family is shown; one fact has a gap.
  const which = r.int(0, 3);
  const [x, op, y, z]: [number, Op, number, number] = ([[a, '+', b, w], [b, '+', a, w], [w, '−', a, b], [w, '−', b, a]] as const)[which] as [number, Op, number, number];
  const gapLast = r.chance(0.5);
  return {
    ...base,
    activity: 'choose',
    say: gapLast ? askSum(x, op, y) : op === '+' ? { text: '{x} add what makes {z}?', vals: { x, z } } : { text: '{x} take away what leaves {z}?', vals: { x, z } },
    text: gapLast ? sumText(x, op, y, '?') : sumText(x, op, '?', z),
    answer: gapLast ? z : y,
    choices: gapLast
      ? choicesFor(z, r, { min: 0, max: 10, likely: [z + 1, z - 1, op === '+' ? Math.abs(x - y) : Math.min(x + y, 10)] })
      : choicesFor(y, r, { min: 0, max: 10, likely: [y + 1, y - 1, z] }),
    visual: { type: 'partWhole', whole: w, parts: [a, b], model: 'bar' },
    explain: explainSum(x, op, y, apply(x, op, y)),
    key: `fact-family-10:${x}${op}${y}:${gapLast ? 'c' : 'b'}`,
  };
}

export function fluency10(tier: number, r: Rand): Problem {
  if (tier === 3 || (tier === 4 && r.chance(0.4))) {
    // Missing numbers, + and − mixed.
    const form = r.pick(['add', 'subPart'] as const);
    return { ...missingSum('fluency-10', tier, form, r), activity: tier === 4 ? 'numberPad' : 'choose', visual: { type: 'none' } };
  }
  const op: Op = r.chance(0.5) ? '+' : '−';
  const w = r.int(2, 10);
  const part = r.int(1, w - 1);
  // a + b = w, or w − b = a.
  const [x, y, c] = op === '+' ? [part, w - part, w] : [w, part, w - part];
  const prop = r.pick(COUNTING_PROPS);
  const likely = op === '+' ? [c + 1, c - 1, Math.abs(x - y)] : [c + 1, c - 1, Math.min(x + y, 10)];
  const common = {
    skill: 'fluency-10',
    tier,
    say: askSum(x, op, y),
    text: sumText(x, op, y, '?'),
    answer: c,
    choices: choicesFor(c, r, { min: 0, max: 10, likely }),
    explain: explainSum(x, op, y, c),
    key: `fluency-10:${x}${op}${y}`,
  } as const;
  if (tier === 1) {
    // With objects; the sign matters, so the sum is written too.
    return {
      ...common,
      activity: 'count',
      visual:
        op === '+'
          ? { type: 'objects', groups: [{ prop, count: x }, { prop, count: y }], op: '+' }
          : { type: 'objects', groups: [{ prop, count: x, gone: y }], op: '-' },
    };
  }
  return { ...common, activity: tier === 4 ? 'numberPad' : 'choose', visual: { type: 'none' } };
}

export function doubles5(tier: number, r: Rand): Problem {
  const n = r.int(1, 5);
  const c = n * 2;
  const common = {
    skill: 'doubles-5',
    tier,
    answer: c,
    // Likely slips: forgot to double (n), one out, or n + (n + 1).
    choices: choicesFor(c, r, { min: 0, max: 12, likely: [n, c + 1, c - 1] }),
    explain: { text: 'Double {n} is {c}! {n} add {n} makes {c}.', vals: { n, c } },
    key: `doubles-5:${n}`,
  } as const;
  if (tier === 1) {
    const prop = r.pick(COUNTING_PROPS);
    return {
      ...common,
      activity: 'count',
      say: { text: `Silky has {n} ${propWord(prop, n)} in each hand. How many altogether?`, vals: { n } },
      visual: { type: 'objects', groups: [{ prop, count: n }, { prop, count: n }], op: '+' },
    };
  }
  if (tier === 2) {
    // Two ten frames side by side, like a mirror.
    return {
      ...common,
      activity: 'tenFrame',
      say: { text: 'Double {n}. How many altogether?', vals: { n } },
      text: sumText(n, '+', n, '?'),
      visual: { type: 'tenFrame', frames: [n, n], prop: r.pick(COUNTING_PROPS) },
    };
  }
  return { ...common, activity: 'choose', say: { text: 'What is double {n}?', vals: { n } }, text: sumText(n, '+', n, '?'), visual: { type: 'none' } };
}
