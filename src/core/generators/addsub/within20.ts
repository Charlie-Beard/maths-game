/**
 * Adding and taking away within 20 (lands 5 and 7): without crossing 10,
 * bonds to 20, doubles and halves, bridging 10 ("make ten first") and
 * missing numbers.
 *
 * The bridging and no-bridging rules are strict, and tested: add-20 and
 * sub-20 never go past a ten; bridge-add and bridge-sub always do.
 *
 * Ten frames: `frames` is what's there to start with (13 → [10, 3]), `add`
 * counters fill the frames in order (so for 8 + 5 they fill the first ten
 * before spilling into the second), and `remove` counters come off the
 * last-filled cells first (so for 13 − 5 the loose 3 go, then 2 from the
 * ten). On a number line, `marks: [10]` is the ten to hop to on the way.
 */
import type { Problem } from '../../problem';
import type { Rand } from '../../random';
import { choicesFor, COUNTING_PROPS } from '../helpers';
import { askSum, explainSum, framesFor, sumText } from './shared';

export function add20(tier: number, r: Rand): Problem {
  // A teen (or 10) and a 1-digit number whose ones stay under 10: 12 + 3.
  const x = r.int(0, 8);
  const a = 10 + x;
  const b = r.int(1, 9 - x);
  const c = a + b;
  const common = {
    skill: 'add-20',
    tier,
    text: sumText(a, '+', b, '?'),
    answer: c,
    // Slips: one out, took away instead, or lost the ten (2 + 3 = 5).
    choices: choicesFor(c, r, { min: 0, max: 20, likely: [c + 1, c - 1, a - b, x + b] }),
    explain: explainSum(a, '+', b, c),
    key: `add-20:${a}+${b}`,
  } as const;
  if (tier === 1) {
    return { ...common, activity: 'tenFrame', say: askSum(a, '+', b), visual: { type: 'tenFrame', frames: [10, x], add: b, prop: r.pick(COUNTING_PROPS) } };
  }
  if (tier === 2) {
    return {
      ...common,
      activity: 'numberLine',
      say: { text: 'Start at {a}. Jump on {b}. Where do you land?', vals: { a, b } },
      visual: { type: 'numberLine', from: 10, to: 20, start: a, step: 1 },
    };
  }
  return { ...common, activity: tier === 4 ? 'numberPad' : 'choose', say: askSum(a, '+', b), visual: { type: 'none' } };
}

export function sub20(tier: number, r: Rand): Problem {
  // A teen take away no more than its ones: 17 − 4.
  const x = r.int(1, 9);
  const a = 10 + x;
  const b = r.int(1, x);
  const c = a - b;
  const common = {
    skill: 'sub-20',
    tier,
    text: sumText(a, '−', b, '?'),
    answer: c,
    choices: choicesFor(c, r, { min: 0, max: 20, likely: [c + 1, c - 1, Math.min(a + b, 20), x - b] }),
    explain: explainSum(a, '−', b, c),
    key: `sub-20:${a}-${b}`,
  } as const;
  if (tier === 1) {
    return { ...common, activity: 'tenFrame', say: askSum(a, '−', b), visual: { type: 'tenFrame', frames: [10, x], remove: b, prop: r.pick(COUNTING_PROPS) } };
  }
  if (tier === 2) {
    return {
      ...common,
      activity: 'numberLine',
      say: { text: 'Start at {a}. Jump back {b}. Where do you land?', vals: { a, b } },
      visual: { type: 'numberLine', from: 10, to: 20, start: a, step: -1 },
    };
  }
  return { ...common, activity: tier === 4 ? 'numberPad' : 'choose', say: askSum(a, '−', b), visual: { type: 'none' } };
}

export function bonds20(tier: number, r: Rand): Problem {
  if (tier === 2) {
    // From a bond to 10: "3 and 7 make 10. So 13 and how many make 20?"
    const x = r.int(1, 9);
    const y = 10 - x;
    const teenFirst = r.chance(0.5);
    const a = teenFirst ? x + 10 : x;
    const b = 20 - a;
    return {
      skill: 'bonds-20',
      tier,
      activity: 'partWhole',
      say: { text: '{x} and {y} make 10. So {a} and how many make 20?', vals: { x, y, a } },
      text: sumText(a, '+', '?', 20),
      answer: b,
      // The trap is answering the bond to 10 (y instead of y + 10, or back).
      choices: choicesFor(b, r, { min: 0, max: 20, likely: [teenFirst ? y + 10 : y, b + 1, b - 1] }),
      visual: { type: 'partWhole', whole: 20, parts: [a, null], model: 'bar' },
      explain: { text: '{x} and {y} make 10, so {a} and {b} make 20!', vals: { x, y, a, b } },
      key: `bonds-20:${a}`,
    };
  }
  const a = r.int(tier === 1 ? 1 : 0, tier === 1 ? 19 : 20);
  const b = 20 - a;
  const ones = (10 - (a % 10)) % 10;
  const common = {
    skill: 'bonds-20',
    tier,
    answer: b,
    // Slips: one out, or only the bond to 10 (forgot the other ten).
    choices: choicesFor(b, r, { min: 0, max: 20, likely: [b + 1, b - 1, ones === b ? ones + 10 : ones] }),
    explain: { text: '{a} and {b} make 20!', vals: { a, b } },
    key: `bonds-20:${a}`,
  } as const;
  if (tier === 1) {
    return {
      ...common,
      activity: 'tenFrame',
      say: { text: 'Two tins hold 20 pop biscuits. They have {a}. How many more to fill them?', vals: { a } },
      visual: { type: 'tenFrame', frames: framesFor(a, 2), prop: 'popBiscuit' },
    };
  }
  return { ...common, activity: 'choose', say: { text: '{a} add what makes 20?', vals: { a } }, text: sumText(a, '+', '?', 20), visual: { type: 'none' } };
}

export function doubles20(tier: number, r: Rand): Problem {
  const n = r.int(1, 10);
  const c = n * 2;
  if (tier === 3) {
    // Halves of even numbers to 20.
    return {
      skill: 'doubles-20',
      tier,
      activity: 'choose',
      say: { text: 'What is half of {c}?', vals: { c } },
      text: `half of ${c} = ?`,
      answer: n,
      // Slips: one out, or didn't halve at all.
      choices: choicesFor(n, r, { min: 0, max: 20, likely: [n + 1, n - 1, c] }),
      visual: { type: 'none' },
      explain: { text: 'Half of {c} is {n}, because double {n} is {c}!', vals: { c, n } },
      key: `doubles-20:half:${c}`,
    };
  }
  const common = {
    skill: 'doubles-20',
    tier,
    text: sumText(n, '+', n, '?'),
    answer: c,
    choices: choicesFor(c, r, { min: 0, max: 22, likely: [n, c + 1, c - 1] }),
    explain: { text: 'Double {n} is {c}! {n} add {n} makes {c}.', vals: { n, c } },
    key: `doubles-20:${n}`,
  } as const;
  if (tier === 1) {
    const prop = r.pick(COUNTING_PROPS);
    return {
      ...common,
      activity: 'count',
      say: { text: 'Double {n}. How many altogether?', vals: { n } },
      visual: { type: 'objects', groups: [{ prop, count: n }, { prop, count: n }], op: '+' },
    };
  }
  return { ...common, activity: 'choose', say: { text: 'What is double {n}?', vals: { n } }, visual: { type: 'none' } };
}

/** a + b with a, b < 10 and a + b > 10: the sum always crosses 10. */
function bridgePair(r: Rand): { a: number; b: number } {
  const a = r.int(3, 9);
  const b = r.int(11 - a, 9);
  // Usually the bigger number first, as children are taught to start there.
  return a >= b || r.chance(0.3) ? { a, b } : { a: b, b: a };
}

export function bridgeAdd(tier: number, r: Rand): Problem {
  const { a, b } = bridgePair(r);
  const c = a + b;
  const k = 10 - a; // to make ten
  const rest = b - k; // and then on
  const common = {
    skill: 'bridge-add',
    tier,
    text: sumText(a, '+', b, '?'),
    answer: c,
    // Slips: one out (counted the start), stopped at ten, or lost the ten.
    choices: choicesFor(c, r, { min: 0, max: 20, likely: [c - 1, c + 1, c - 10, 10] }),
    explain: { text: '{a} add {k} makes 10, and {rest} more makes {c}!', vals: { a, k, rest, c } },
    key: `bridge-add:${a}+${b}`,
  } as const;
  if (tier === 1) {
    return {
      ...common,
      activity: 'tenFrame',
      say: { text: 'Fill the ten first! What is {a} add {b}?', vals: { a, b } },
      visual: { type: 'tenFrame', frames: [a, 0], add: b, prop: r.pick(COUNTING_PROPS) },
    };
  }
  if (tier === 2) {
    return {
      ...common,
      activity: 'numberLine',
      say: { text: 'Start at {a}. Jump to 10, then jump on. What is {a} add {b}?', vals: { a, b } },
      visual: { type: 'numberLine', from: 0, to: 20, start: a, step: 1, marks: [10] },
    };
  }
  return { ...common, activity: tier === 4 ? 'numberPad' : 'choose', say: askSum(a, '+', b), visual: { type: 'none' } };
}

export function bridgeSub(tier: number, r: Rand): Problem {
  // A teen take away more than its ones: 13 − 5 goes back past 10.
  const x = r.int(1, 8);
  const a = 10 + x;
  const b = r.int(x + 1, 9);
  const c = a - b;
  const rest = b - x;
  const common = {
    skill: 'bridge-sub',
    tier,
    text: sumText(a, '−', b, '?'),
    answer: c,
    // Slips: one out, stopped at ten, or took the small ones from the big
    // (13 − 5 → "5 − 3 = 2", so 12).
    choices: choicesFor(c, r, { min: 0, max: 20, likely: [c + 1, c - 1, 10 + rest, 10] }),
    explain: { text: '{a} take away {x} makes 10, then take away {rest} more. That leaves {c}!', vals: { a, x, rest, c } },
    key: `bridge-sub:${a}-${b}`,
  } as const;
  if (tier === 1) {
    return {
      ...common,
      activity: 'tenFrame',
      say: { text: 'Back to ten first! What is {a} take away {b}?', vals: { a, b } },
      visual: { type: 'tenFrame', frames: [10, x], remove: b, prop: r.pick(COUNTING_PROPS) },
    };
  }
  if (tier === 2) {
    return {
      ...common,
      activity: 'numberLine',
      say: { text: 'Start at {a}. Jump back to 10, then jump back again. What is {a} take away {b}?', vals: { a, b } },
      visual: { type: 'numberLine', from: 0, to: 20, start: a, step: -1, marks: [10] },
    };
  }
  return { ...common, activity: tier === 4 ? 'numberPad' : 'choose', say: askSum(a, '−', b), visual: { type: 'none' } };
}

export function missing20(tier: number, r: Rand): Problem {
  // a + ? = c within 20, usually crossing 10 (8 + ? = 15).
  // Mostly a 1-digit start that has to cross 10; sometimes a teen.
  const crossing = r.chance(0.75);
  const a = crossing ? r.int(2, 9) : r.int(10, 18);
  const c = crossing ? r.int(11, a + 9) : r.int(a + 1, 19);
  const b = c - a;
  if (tier >= 2 && r.chance(0.3)) {
    // c − ? = a: the same family, from the other end.
    return {
      skill: 'missing-20',
      tier,
      activity: tier === 3 ? 'numberPad' : 'choose',
      say: { text: '{c} take away what leaves {a}?', vals: { c, a } },
      text: sumText(c, '−', '?', a),
      answer: b,
      choices: choicesFor(b, r, { min: 0, max: 20, likely: [b + 1, b - 1, a] }),
      visual: { type: 'none' },
      explain: explainSum(c, '−', b, a),
      key: `missing-20:${c}-?=${a}`,
    };
  }
  const common = {
    skill: 'missing-20',
    tier,
    say: { text: '{a} add what makes {c}?', vals: { a, c } },
    text: sumText(a, '+', '?', c),
    answer: b,
    // Slips: one out, copied the total, or added the two numbers.
    choices: choicesFor(b, r, { min: 0, max: 20, likely: [b + 1, b - 1, c, a + c] }),
    explain: explainSum(a, '+', b, c),
    key: `missing-20:${a}+?=${c}`,
  } as const;
  if (tier === 1) {
    return { ...common, activity: 'tenFrame', visual: { type: 'tenFrame', frames: framesFor(a, 2), add: b, prop: r.pick(COUNTING_PROPS) } };
  }
  return { ...common, activity: tier === 3 ? 'numberPad' : 'choose', visual: { type: 'none' } };
}
