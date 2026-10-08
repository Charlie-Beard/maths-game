/**
 * Generators owned by workstream W1a (docs/ROADMAP.md): number and place
 * value. Seeing small amounts, one more and one less, comparing, the teens,
 * counting and ordering to 20 and to 100, tens and ones, odd and even, and
 * counting in 2s, 5s and 10s. generators/index.ts picks them up from NUMBER.
 *
 * Conventions shared with the activities (W2):
 *
 *   - "Which is more / bigger?" problems answer with the winning number, and
 *     their choices are the two numbers, so `compare` can tap a side and
 *     `choose` shows two number cards.
 *   - Words and signs ('more', 'fewer', 'the same', 'odd', 'even', '<', '>',
 *     '=') are string answers, with every option in `choices` in a fixed order.
 *   - A `tensOnes` visual of 0 tens and 0 ones is a build task: he makes the
 *     answer from bundles and sticks. Otherwise it is a number to read.
 *   - A `compare` visual with `asObjects: 'stick'` means two numbers built
 *     from bundles of ten and single sticks.
 *   - Sequences ("10, 20, ?, 40") are written in `text`, with `?` for the gap.
 */
import type { Answer, Problem, PropId, Speech } from '../problem';
import type { Rand } from '../random';
import type { SkillId } from '../skills';
import { capital, choicesFor, COUNTING_PROPS, FOLK, plural, propWord, type Generator } from './helpers';

/** "{c0}, {c1}, {c2}" with the values in slots: counting aloud in a read-back. */
function countAloud(values: number[], end = '!'): Speech {
  return {
    text: values.map((_, i) => `{c${i}}`).join(', ') + end,
    vals: Object.fromEntries(values.map((v, i) => [`c${i}`, v])),
  };
}

/** Joins speeches into one, keeping every slot name unique. */
function joinSpeech(...parts: Speech[]): Speech {
  let text = '';
  const vals: Record<string, number | string> = {};
  parts.forEach((p, i) => {
    text += (i ? ' ' : '') + p.text.replace(/\{(\w+)\}/g, (_, k: string) => `{${k}_${i}}`);
    for (const [k, v] of Object.entries(p.vals ?? {})) vals[`${k}_${i}`] = v;
  });
  return { text, vals };
}

/** "the Saucepan Man" → "The Saucepan Man", to start a sentence. */

/** "1 ten", "3 tens". */
const tensWord = (t: number): string => (t === 1 ? 'ten' : 'tens');

/** "4 tens and 7 ones make 47!" */
function placeSpeech(t: number, o: number): Speech {
  const n = t * 10 + o;
  if (o === 0) return { text: `{t} ${tensWord(t)} make${t === 1 ? 's' : ''} {n}!`, vals: { t, n } };
  return { text: `{t} ${tensWord(t)} and {o} ${o === 1 ? 'one' : 'ones'} make {n}!`, vals: { t, o, n } };
}

/** step, 2·step … n·step. */
const multiples = (step: number, n: number): number[] => Array.from({ length: n }, (_, i) => step * (i + 1));

/** Two different whole numbers from lo to hi. */
function twoDifferent(r: Rand, lo: number, hi: number): [number, number] {
  const a = r.int(lo, hi);
  let b = r.int(lo, hi - 1);
  if (b >= a) b++;
  return [a, b];
}

// ---------------------------------------------------------------- subitise

/** Dice patterns (tiers 1–2), then ten-frame patterns (tier 3): say how many at a glance. */
export function subitise(tier: number, r: Rand): Problem {
  const frame = tier >= 3;
  const n = frame ? r.int(1, 10) : r.int(1, tier === 1 ? 4 : 6);
  const likely = frame ? [n + 1, n - 1, 10 - n, n === 5 ? 6 : 5] : [n + 1, n - 1];
  let explain: Speech = { text: `{n} ${plural(n, 'dot', 'dots')}!`, vals: { n } };
  if (frame && n === 10) explain = { text: '10 dots. The frame is full!' };
  else if (frame && n > 5) explain = { text: '{n} dots. 5 and {m} more!', vals: { n, m: n - 5 } };
  return {
    skill: 'subitise',
    tier,
    activity: 'choose',
    say: { text: frame ? 'Quick look! How many dots in the frame?' : 'Quick look! How many dots?' },
    answer: n,
    choices: choicesFor(n, r, { min: 1, max: frame ? 10 : 6, likely }),
    visual: { type: 'dots', count: n, pattern: frame ? 'frame' : 'dice' },
    explain,
    key: `subitise:${frame ? 'frame' : 'dice'}:${n}`,
  };
}

// ---------------------------------------------------------- one more, less

/** One more (dir 1) or one less (dir −1): objects, then a number line, then numbers. */
function oneStep(skill: 'one-more' | 'one-less', dir: 1 | -1, tier: number, r: Rand): Problem {
  const word = dir === 1 ? 'more' : 'less';
  // n is the starting number. Answers stay within 1–6 (objects) or 0–10.
  const n = tier === 1 ? (dir === 1 ? r.int(1, 5) : r.int(2, 6)) : dir === 1 ? r.int(1, 9) : r.int(2, 10);
  const m = n + dir;
  const prop = r.pick(COUNTING_PROPS);
  const explain = { text: `One ${word} than {n} is {m}!`, vals: { n, m } };
  // Likely slips: no change, two steps, the wrong way.
  const choices = choicesFor(m, r, { min: 0, max: 10, likely: [n, m + dir, n - dir] });
  const base = { skill, tier, answer: m, choices, explain, key: `${skill}:${n}` } as const;
  if (tier === 1) {
    const who = capital(r.pick(FOLK));
    return {
      ...base,
      // Only five starting numbers at this tier, so the props count towards variety (as in count-10).
      key: `${skill}:${n}:${prop}`,
      activity: 'count',
      say:
        dir === 1
          ? { text: `${who} has {n} ${propWord(prop, n)}. One more comes. How many now?`, vals: { n } }
          : { text: `${who} has {n} ${propWord(prop, n)}. One rolls away. How many now?`, vals: { n } },
      visual:
        dir === 1
          ? { type: 'objects', groups: [{ prop, count: n }, { prop, count: 1 }], op: '+' }
          : { type: 'objects', groups: [{ prop, count: n, gone: 1 }], op: '-' },
    };
  }
  if (tier === 2) {
    return {
      ...base,
      activity: 'numberLine',
      say: { text: `Start at {n}. Hop one ${dir === 1 ? 'on' : 'back'}. Where do you land?`, vals: { n } },
      visual: { type: 'numberLine', from: 0, to: 10, start: n, step: dir },
    };
  }
  return {
    ...base,
    activity: 'choose',
    say: { text: `What is one ${word} than {n}?`, vals: { n } },
    text: `1 ${word} than ${n} = ?`,
    visual: { type: 'none' },
  };
}

export const oneMore = (tier: number, r: Rand): Problem => oneStep('one-more', 1, tier, r);
export const oneLess = (tier: number, r: Rand): Problem => oneStep('one-less', -1, tier, r);

// -------------------------------------------------------------- compare-10

export function compare10(tier: number, r: Rand): Problem {
  const prop = r.pick(COUNTING_PROPS);
  if (tier === 2) {
    // More, fewer or the same: about one in three is the same.
    const a = r.int(1, 10);
    const b = r.chance(0.3) ? a : r.pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((x) => x !== a));
    const answer = a > b ? 'more' : a < b ? 'fewer' : 'the same';
    const explain =
      answer === 'the same'
        ? { text: '{a} and {b}. They are the same!', vals: { a, b } }
        : { text: `The first group has {a}. That is ${answer} than {b}!`, vals: { a, b } };
    return {
      skill: 'compare-10',
      tier,
      activity: 'compare',
      say: { text: `Look at the first group of ${propWord(prop, 2)}. Has it got more, fewer, or the same as the second group?` },
      answer,
      choices: ['more', 'fewer', 'the same'],
      visual: { type: 'compare', left: a, right: b, asObjects: prop },
      explain,
      key: `compare-10:2:${a}:${b}`,
    };
  }
  // Tier 1 counts two groups; tier 3 compares two numerals. Never equal.
  const [a, b] = twoDifferent(r, 1, tier === 1 ? 8 : 10);
  const big = Math.max(a, b);
  const small = Math.min(a, b);
  const askBig = tier === 1 || r.chance(0.5);
  if (tier === 1) {
    return {
      skill: 'compare-10',
      tier,
      activity: 'compare',
      say: { text: `Which group has more ${propWord(prop, 2)}?` },
      answer: big,
      choices: r.shuffle([a, b]),
      visual: { type: 'compare', left: a, right: b, asObjects: prop },
      explain: { text: `{big} is more than {small}!`, vals: { big, small } },
      key: `compare-10:1:${a}:${b}`,
    };
  }
  return {
    skill: 'compare-10',
    tier,
    activity: 'compare',
    say: { text: `Which number is ${askBig ? 'bigger' : 'smaller'}, {a} or {b}?`, vals: { a, b } },
    answer: askBig ? big : small,
    choices: r.shuffle([a, b]),
    visual: { type: 'compare', left: a, right: b },
    explain: askBig ? { text: '{big} is bigger than {small}!', vals: { big, small } } : { text: '{small} is smaller than {big}!', vals: { big, small } },
    key: `compare-10:3:${askBig ? 'big' : 'small'}:${a}:${b}`,
  };
}

// ------------------------------------------------------------------- teens

export function teens(tier: number, r: Rand): Problem {
  const k = r.int(1, 9);
  const n = 10 + k;
  const explain = { text: '10 and {k} more make {n}!', vals: { k, n } };
  if (tier === 1) {
    return {
      skill: 'teens',
      tier,
      activity: 'tenFrame',
      say: { text: 'Silky has one full tin of 10 pop biscuits, and some more. How many pop biscuits altogether?' },
      answer: n,
      // Likely slips: forgetting the full ten, or one out.
      choices: choicesFor(n, r, { min: 1, max: 20, likely: [k, n + 1, n - 1] }),
      visual: { type: 'tenFrame', frames: [10, k], prop: 'popBiscuit' },
      explain,
      key: `teens:1:${k}`,
    };
  }
  if (tier === 2) {
    // Match a teen numeral. The classic mix-ups: 14 and 41, thirteen and thirty.
    const likely = [k * 10 + 1, k * 10, n + 1, n - 1].filter((x) => x !== n && x !== 10);
    const choices = choicesFor(n, r, { min: 11, max: 99, likely });
    if (r.chance(0.5)) {
      return {
        skill: 'teens',
        tier,
        activity: 'choose',
        say: { text: 'Which number is {n}?', vals: { n } },
        answer: n,
        choices,
        visual: { type: 'none' },
        explain: { text: `{n} is 1 ten and {k} ${k === 1 ? 'one' : 'ones'}!`, vals: { n, k } },
        key: `teens:2:say:${n}`,
      };
    }
    return {
      skill: 'teens',
      tier,
      activity: 'choose',
      say: { text: 'One bundle of ten sticks, and {k} more sticks. Which number is that?', vals: { k } },
      answer: n,
      choices,
      visual: { type: 'tensOnes', tens: 1, ones: k },
      explain,
      key: `teens:2:sticks:${n}`,
    };
  }
  return {
    skill: 'teens',
    tier,
    activity: 'numberLine',
    say: { text: 'Start at 10. Hop on {k} more. Where do you land?', vals: { k } },
    text: `10 + ${k} = ?`,
    answer: n,
    choices: choicesFor(n, r, { min: 1, max: 20, likely: [k, n + 1, n - 1] }),
    visual: { type: 'numberLine', from: 10, to: 20, start: 10, step: 1 },
    explain,
    key: `teens:3:${k}`,
  };
}

// -------------------------------------------------- before, after, between

/**
 * "What comes just after / before / between?" within lo–hi. Shared by
 * count-20 (tier 2) and count-100 (tier 1).
 */
function neighbour(skill: SkillId, tier: number, r: Rand, lo: number, hi: number, crossTens = false): Problem {
  const kind = r.pick(['after', 'before', 'between'] as const);
  // For count-100, half the time sit on a tens boundary (39 → 40, 40 → 39), the tricky ones.
  let n = r.int(lo + 1, hi - 1);
  if (crossTens && r.chance(0.5)) {
    const t = r.int(Math.ceil((lo + 1) / 10), Math.floor((hi - 1) / 10)) * 10;
    n = kind === 'after' ? t - 1 : kind === 'before' ? t + 1 : t;
    n = Math.min(hi - 1, Math.max(lo + 1, n));
  }
  const base = { skill, tier, activity: 'choose', visual: { type: 'none' } } as const;
  if (kind === 'after') {
    const a = n + 1;
    return {
      ...base,
      say: { text: 'What number comes just after {n}?', vals: { n } },
      text: `${n}, ?`,
      answer: a,
      choices: choicesFor(a, r, { min: 0, max: 100, likely: [n - 1, a + 1, n + 10] }),
      explain: { text: '{a} comes just after {n}!', vals: { a, n } },
      key: `${skill}:after:${n}`,
    };
  }
  if (kind === 'before') {
    const b = n - 1;
    return {
      ...base,
      say: { text: 'What number comes just before {n}?', vals: { n } },
      text: `?, ${n}`,
      answer: b,
      choices: choicesFor(b, r, { min: 0, max: 100, likely: [n + 1, b - 1, n - 10] }),
      explain: { text: '{b} comes just before {n}!', vals: { b, n } },
      key: `${skill}:before:${n}`,
    };
  }
  return {
    ...base,
    say: { text: 'What number comes between {a} and {c}?', vals: { a: n - 1, c: n + 1 } },
    text: `${n - 1}, ?, ${n + 1}`,
    answer: n,
    choices: choicesFor(n, r, { min: 0, max: 100, likely: [n - 2, n + 2, n + 10] }),
    explain: { text: '{a}, {n}, {c}. {n} comes between!', vals: { a: n - 1, n, c: n + 1 } },
    key: `${skill}:between:${n}`,
  };
}

/**
 * A run of numbers with one missing ("12, 13, ?, 15"): `step` apart,
 * `len` long, all within lo–hi. Sometimes counting back.
 */
function sequence(r: Rand, o: { step: number; len: number; lo: number; hi: number; back?: boolean; firstMultiple?: boolean }) {
  const span = o.step * (o.len - 1);
  let first = r.int(o.lo, o.hi - span);
  if (o.firstMultiple) first = Math.ceil(first / o.step) * o.step;
  if (first + span > o.hi) first -= o.step;
  let seq = Array.from({ length: o.len }, (_, i) => first + i * o.step);
  if (o.back) seq = seq.reverse();
  // The gap is never first, so he always has a number to start from.
  const gap = r.int(1, o.len - 1);
  const answer = seq[gap];
  const text = seq.map((v, i) => (i === gap ? '?' : String(v))).join(', ');
  return { seq, gap, answer, text };
}

// ---------------------------------------------------------------- count-20

export function count20(tier: number, r: Rand): Problem {
  if (tier === 1) {
    const n = r.int(8, 20);
    const prop = r.pick(COUNTING_PROPS);
    return {
      skill: 'count-20',
      tier,
      activity: 'count',
      say: { text: `How many ${propWord(prop, 2)} can you count?` },
      answer: n,
      choices: choicesFor(n, r, { min: 1, max: 20, likely: [n + 1, n - 1, n + 10 <= 20 ? n + 10 : n - 10] }),
      visual: { type: 'objects', groups: [{ prop, count: n }], layout: 'row' },
      explain: { text: `{n} ${propWord(prop, n)}!`, vals: { n } },
      key: `count-20:1:${n}:${prop}`,
    };
  }
  if (tier === 2) return neighbour('count-20', tier, r, 0, 20);
  // Tier 3: order to 20. Fill a gap in a run, or pick the smallest or biggest of three.
  if (r.chance(0.5)) {
    const back = r.chance(0.3);
    const s = sequence(r, { step: 1, len: 5, lo: 1, hi: 20, back });
    return {
      skill: 'count-20',
      tier,
      activity: 'choose',
      say: { text: back ? 'Counting back. Which number is missing?' : 'Which number is missing?' },
      text: s.text,
      answer: s.answer,
      choices: choicesFor(s.answer, r, { min: 0, max: 20, likely: [s.answer + 1, s.answer - 1, s.answer + 2] }),
      visual: { type: 'none' },
      explain: countAloud(s.seq),
      key: `count-20:3:seq:${s.seq.join('-')}`,
    };
  }
  return orderThree('count-20', tier, r, 1, 20, false);
}

/** Three different numbers: which is smallest, biggest (or, with middle, in the middle)? */
function orderThree(skill: SkillId, tier: number, r: Rand, lo: number, hi: number, middle: boolean): Problem {
  const set = new Set<number>();
  // Keep them fairly close, so he has to look properly.
  const centre = r.int(lo + 2, hi - 2);
  const spread = Math.max(5, Math.round((hi - lo) / 5));
  while (set.size < 3) set.add(Math.max(lo, Math.min(hi, centre + r.int(-spread, spread))));
  const nums = r.shuffle([...set]);
  const sorted = [...nums].sort((x, y) => x - y);
  const ask = r.pick(middle ? (['smallest', 'biggest', 'middle'] as const) : (['smallest', 'biggest'] as const));
  const answer = ask === 'smallest' ? sorted[0] : ask === 'biggest' ? sorted[2] : sorted[1];
  const [a, b, c] = nums;
  const say =
    ask === 'middle'
      ? { text: 'Put {a}, {b} and {c} in order, smallest first. Which number goes in the middle?', vals: { a, b, c } }
      : { text: `Which is the ${ask}: {a}, {b} or {c}?`, vals: { a, b, c } };
  return {
    skill,
    tier,
    activity: 'choose',
    say,
    text: nums.join(', '),
    answer,
    choices: nums,
    visual: { type: 'none' },
    explain: { text: 'In order: {x}, {y}, {z}!', vals: { x: sorted[0], y: sorted[1], z: sorted[2] } },
    key: `${skill}:order:${ask}:${sorted.join('-')}`,
  };
}

// --------------------------------------------------------------- count-10s

export function count10s(tier: number, r: Rand): Problem {
  if (tier <= 2) {
    const t = r.int(1, tier === 1 ? 5 : 10);
    const n = t * 10;
    return {
      skill: 'count-10s',
      tier,
      activity: 'tensOnes',
      say: { text: 'Each bundle has 10 sticks. Count in tens. How many sticks?' },
      answer: n,
      // Likely slips: counting bundles as ones, or one ten out.
      choices: choicesFor(n, r, { min: 1, max: 100, likely: [t, n + 10, n - 10, n + 1] }),
      visual: { type: 'tensOnes', tens: t, ones: 0 },
      explain: joinSpeech(countAloud(multiples(10, t), '.'), placeSpeech(t, 0)),
      key: `count-10s:${t}`,
    };
  }
  const back = r.chance(0.25);
  const s = sequence(r, { step: 10, len: 5, lo: 0, hi: 100, back, firstMultiple: true });
  const prev = s.seq[s.gap - 1];
  return {
    skill: 'count-10s',
    tier,
    activity: 'choose',
    say: { text: back ? 'Count back in tens. Which number is missing?' : 'Count in tens. Which number is missing?' },
    text: s.text,
    answer: s.answer,
    // Likely slips: one ten out, or counting on in ones.
    choices: choicesFor(s.answer, r, { min: 0, max: 100, likely: [s.answer + 10, s.answer - 10, prev + (back ? -1 : 1)] }),
    visual: { type: 'none' },
    explain: countAloud(s.seq),
    key: `count-10s:3:${s.seq.join('-')}`,
  };
}

// --------------------------------------------------------------- tens-ones

/** Likely slips reading tens and ones: the digits swapped, tens counted as ones, a ten or one out. */
const placeSlips = (t: number, o: number): number[] => [o * 10 + t, t + o, t * 10 + o + 10, t * 10 + o - 10, t * 10 + o + 1];

export function tensOnes(tier: number, r: Rand): Problem {
  if (tier === 1) {
    // Build: he makes the number from bundles and sticks.
    const t = r.int(1, 4);
    const o = r.int(t === 1 ? 1 : 0, 9);
    const n = t * 10 + o;
    return {
      skill: 'tens-ones',
      tier,
      activity: 'tensOnes',
      say: { text: 'Can you make {n}? Use bundles of ten, and single sticks.', vals: { n } },
      answer: n,
      choices: choicesFor(n, r, { min: 1, max: 99, likely: placeSlips(t, o) }),
      visual: { type: 'tensOnes', tens: 0, ones: 0 },
      explain: placeSpeech(t, o),
      key: `tens-ones:build:${n}`,
    };
  }
  const t = r.int(1, 9);
  const o = r.int(tier === 2 ? 0 : 1, 9);
  const n = t * 10 + o;
  const T = t * 10;
  const read: Problem = {
    skill: 'tens-ones',
    tier,
    activity: tier === 4 ? 'numberPad' : 'tensOnes',
    say: { text: 'Count the tens, then the ones. What number is it?' },
    answer: n,
    choices: choicesFor(n, r, { min: 1, max: 99, likely: placeSlips(t, o) }),
    visual: { type: 'tensOnes', tens: t, ones: o },
    explain: placeSpeech(t, o),
    key: `tens-ones:read:${n}`,
  };
  if (tier === 2) return read;
  // Partition: 47 = 40 + 7, with any one part missing.
  const form = r.pick(tier === 4 ? (['read', 'ones', 'tens', 'whole'] as const) : (['ones', 'tens', 'whole'] as const));
  if (form === 'read') return read;
  const explain = { text: '{n} is {T} and {o}!', vals: { n, T, o } };
  const activity = tier === 4 ? 'numberPad' : 'choose';
  const base = { skill: 'tens-ones', tier, activity, visual: { type: 'none' }, explain } as const;
  if (form === 'ones') {
    return {
      ...base,
      say: { text: '{n} is {T} and how many more?', vals: { n, T } },
      text: `${T} + ? = ${n}`,
      answer: o,
      choices: choicesFor(o, r, { min: 0, max: 99, likely: [t, o + 1, o - 1, n] }),
      key: `tens-ones:ones:${n}`,
    };
  }
  if (form === 'tens') {
    return {
      ...base,
      say: { text: 'What goes with {o} to make {n}?', vals: { o, n } },
      text: `? + ${o} = ${n}`,
      answer: T,
      // Likely slips: the number of tens (4 for 40), the ones as tens, a ten out.
      choices: choicesFor(T, r, { min: 1, max: 99, likely: [t, o * 10, T + 10, T - 10] }),
      key: `tens-ones:tens:${n}`,
    };
  }
  return {
    ...base,
    say: { text: 'What is {T} add {o}?', vals: { T, o } },
    text: `${T} + ${o} = ?`,
    answer: n,
    choices: choicesFor(n, r, { min: 1, max: 99, likely: placeSlips(t, o) }),
    key: `tens-ones:whole:${n}`,
  };
}

// --------------------------------------------------------------- count-100

export function count100(tier: number, r: Rand): Problem {
  if (tier === 1) return neighbour('count-100', tier, r, 20, 100, true);
  if (tier === 2) {
    // Hop along one stretch of ten on the number line (40 to 50, say).
    const from = r.int(1, 9) * 10;
    const to = from + 10;
    const step: 1 | -1 = r.chance(0.6) ? 1 : -1;
    const k = r.int(1, 4);
    const start = step === 1 ? r.int(from, to - k) : r.int(from + k, to);
    const answer = start + step * k;
    return {
      skill: 'count-100',
      tier,
      activity: 'numberLine',
      say: { text: `Start at {start}. Hop ${step === 1 ? 'on' : 'back'} {k}. Where do you land?`, vals: { start, k } },
      answer,
      choices: choicesFor(answer, r, { min: 0, max: 100, likely: [answer + step, answer - step, start - step * k] }),
      visual: { type: 'numberLine', from, to, start, step },
      explain: joinSpeech({ text: 'From {start}:', vals: { start } }, countAloud(Array.from({ length: k }, (_, i) => start + step * (i + 1)), '.'), { text: 'You land on {answer}!', vals: { answer } }),
      key: `count-100:line:${start}:${step * k}`,
    };
  }
  // Tier 3: a piece of the hundred square, a row (1 apart) or a column (10 apart).
  const column = r.chance(0.5);
  const s = column ? sequence(r, { step: 10, len: 4, lo: 1, hi: 100 }) : sequence(r, { step: 1, len: 5, lo: 1, hi: 100 });
  // A row of the hundred square never wraps past a tens number (…, 50 | 51, …).
  if (!column) {
    const rowEnd = Math.ceil(s.seq[0] / 10) * 10;
    if (s.seq[s.seq.length - 1] > rowEnd) {
      const shift = s.seq[s.seq.length - 1] - rowEnd;
      s.seq = s.seq.map((v) => v - shift);
      s.answer = s.seq[s.gap];
      s.text = s.seq.map((v, i) => (i === s.gap ? '?' : String(v))).join(', ');
    }
  }
  const other = column ? 1 : 10;
  return {
    skill: 'count-100',
    tier,
    activity: 'choose',
    say: column
      ? { text: 'These numbers go down the hundred square. Each one is 10 more. Which number is missing?' }
      : { text: 'These numbers go along the hundred square. Which number is missing?' },
    text: s.text,
    answer: s.answer,
    choices: choicesFor(s.answer, r, { min: 1, max: 100, likely: [s.answer + other, s.answer - other, s.answer + (column ? 10 : 1)] }),
    visual: { type: 'none' },
    explain: countAloud(s.seq),
    key: `count-100:square:${s.seq.join('-')}`,
  };
}

// ------------------------------------------------------------- compare-100

export function compare100(tier: number, r: Rand): Problem {
  if (tier === 4) return orderThree('compare-100', tier, r, 10, 99, true);
  if (tier === 3) {
    // Choose < > =. About one in five is equal, and '=' is always a choice.
    const a = r.int(10, 99);
    let b = a;
    if (!r.chance(0.2)) {
      // Half the time the tens match, so he has to look at the ones.
      const sameTens = r.chance(0.5);
      const lo = sameTens ? Math.floor(a / 10) * 10 : 10;
      const hi = sameTens ? lo + 9 : 99;
      b = r.int(lo, hi - 1);
      if (b >= a) b++;
    }
    const answer = a > b ? '>' : a < b ? '<' : '=';
    const explain =
      answer === '>'
        ? { text: '{a} is greater than {b}!', vals: { a, b } }
        : answer === '<'
          ? { text: '{a} is less than {b}!', vals: { a, b } }
          : { text: '{a} is equal to {b}!', vals: { a, b } };
    return {
      skill: 'compare-100',
      tier,
      activity: 'compare',
      say: { text: 'Is {a} greater than, less than, or equal to {b}? Choose the sign.', vals: { a, b } },
      text: `${a} ? ${b}`,
      answer,
      // Signs and words always sit in the same order, so he knows where to look.
      choices: ['<', '=', '>'],
      visual: { type: 'compare', left: a, right: b },
      explain,
      key: `compare-100:sign:${a}:${b}`,
    };
  }
  // Tiers 1–2: which is bigger (or smaller)? Never equal. Tier 2 sometimes swaps
  // the digits (34 and 43) or keeps the tens the same, to make him look at both.
  let a: number;
  let b: number;
  const trap = tier === 2 ? r.int(0, 2) : r.int(0, 3) === 0 ? 1 : 0;
  if (trap === 0) [a, b] = twoDifferent(r, 1, 9).map((t) => t * 10 + r.int(0, 9)) as [number, number];
  else if (trap === 1) {
    const t = r.int(1, 9);
    const [x, y] = twoDifferent(r, 0, 9);
    [a, b] = [t * 10 + x, t * 10 + y];
  } else {
    const [x, y] = twoDifferent(r, 1, 9);
    [a, b] = [x * 10 + y, y * 10 + x];
  }
  const big = Math.max(a, b);
  const small = Math.min(a, b);
  const askBig = tier === 1 || r.chance(0.6);
  return {
    skill: 'compare-100',
    tier,
    activity: 'compare',
    say: tier === 1 ? { text: 'Look at the bundles and sticks. Which is bigger, {a} or {b}?', vals: { a, b } } : { text: `Which number is ${askBig ? 'bigger' : 'smaller'}, {a} or {b}?`, vals: { a, b } },
    answer: askBig ? big : small,
    choices: r.shuffle([a, b]),
    visual: tier === 1 ? { type: 'compare', left: a, right: b, asObjects: 'stick' } : { type: 'compare', left: a, right: b },
    explain: askBig ? { text: '{big} is bigger than {small}!', vals: { big, small } } : { text: '{small} is smaller than {big}!', vals: { big, small } },
    key: `compare-100:${tier}:${askBig ? 'big' : 'small'}:${a}:${b}`,
  };
}

// ---------------------------------------------------------------- odd-even

export function oddEven(tier: number, r: Rand): Problem {
  const n = tier === 1 ? r.int(2, 10) : tier === 2 ? r.int(1, 10) : r.chance(0.7) ? r.int(11, 20) : r.int(1, 10);
  const odd = n % 2 === 1;
  const answer = odd ? 'odd' : 'even';
  const pairs = Math.floor(n / 2);
  const choices: Answer[] = ['odd', 'even'];
  if (tier === 1) {
    const prop = r.pick(COUNTING_PROPS);
    return {
      skill: 'odd-even',
      tier,
      activity: 'choose',
      say: { text: `Pair up the ${propWord(prop, 2)}. Is there one left over? Is {n} odd or even?`, vals: { n } },
      answer,
      choices,
      visual: { type: 'objects', groups: [{ prop, count: n }], layout: 'row' },
      explain: odd
        ? { text: `{p} ${plural(pairs, 'pair', 'pairs')} and one left over. {n} is odd!`, vals: { p: pairs, n } }
        : { text: `{p} ${plural(pairs, 'pair', 'pairs')} and none left over. {n} is even!`, vals: { p: pairs, n } },
      key: `odd-even:1:${n}`,
    };
  }
  const ones = n % 10;
  let explain: Speech;
  if (n >= 10) explain = { text: `{n} ends in {d}, so {n} is ${answer}!`, vals: { n, d: ones } };
  else explain = odd ? { text: '{n} is odd! Pairs leave one left over.', vals: { n } } : { text: '{n} is even! It makes pairs with none left over.', vals: { n } };
  return {
    skill: 'odd-even',
    tier,
    activity: 'choose',
    say: { text: 'Is {n} odd or even?', vals: { n } },
    text: String(n),
    answer,
    choices,
    visual: { type: 'none' },
    explain,
    key: `odd-even:${tier}:${n}`,
  };
}

// ------------------------------------------------------------- count-2s-5s

/** Props that come in pairs or fives without looking odd. */
const PAIR_PROPS: readonly PropId[] = ['hat', 'teacup', 'cushion', 'apple', 'acorn'];
const FIVE_PROPS: readonly PropId[] = ['popBiscuit', 'toffee', 'acorn', 'apple', 'googleBun'];

export function count2s5s(tier: number, r: Rand): Problem {
  if (tier <= 2) {
    const each = tier === 1 ? 2 : 5;
    const g = r.int(2, tier === 1 ? 10 : 8);
    const n = g * each;
    const prop = r.pick(tier === 1 ? PAIR_PROPS : FIVE_PROPS);
    const say =
      each === 2
        ? { text: `The ${propWord(prop, 2)} come in pairs. Count them in twos. How many altogether?` }
        : { text: `Each plate has 5 ${propWord(prop, 2)}. Count them in fives. How many altogether?` };
    return {
      skill: 'count-2s-5s',
      tier,
      activity: 'groups',
      say,
      answer: n,
      // Likely slips: counting the groups, or one group out.
      choices: choicesFor(n, r, { min: 1, max: 50, likely: [g, n + each, n - each, n + 1] }),
      visual: { type: 'groups', groups: g, each, layout: 'groups', prop },
      explain: joinSpeech(countAloud(multiples(each, g), '.'), { text: `{n} ${propWord(prop, n)}!`, vals: { n } }),
      key: `count-2s-5s:${each}:${g}`,
    };
  }
  const step = r.pick([2, 5] as const);
  const s = sequence(r, { step, len: 5, lo: step, hi: step === 2 ? 20 : 50, firstMultiple: true });
  const prev = s.seq[s.gap - 1];
  return {
    skill: 'count-2s-5s',
    tier,
    activity: 'choose',
    say: { text: `Count in ${step === 2 ? 'twos' : 'fives'}. Which number is missing?` },
    text: s.text,
    answer: s.answer,
    choices: choicesFor(s.answer, r, { min: 0, max: 50, likely: [prev + 1, s.answer + step, s.answer - step, s.answer + 1] }),
    visual: { type: 'none' },
    explain: countAloud(s.seq),
    key: `count-2s-5s:seq:${s.seq.join('-')}`,
  };
}

export const NUMBER: Partial<Record<SkillId, Generator>> = {
  subitise,
  'one-more': oneMore,
  'one-less': oneLess,
  'compare-10': compare10,
  teens,
  'count-20': count20,
  'count-10s': count10s,
  'tens-ones': tensOnes,
  'count-100': count100,
  'compare-100': compare100,
  'odd-even': oddEven,
  'count-2s-5s': count2s5s,
};
