/**
 * Generators owned by workstream W1c (docs/ROADMAP.md): shapes, length,
 * equal groups and arrays, the 2, 5 and 10 times tables, money, sharing and
 * grouping, fractions and telling the time. Each follows its skill's tiers
 * in core/skills.ts (concrete → pictorial → abstract).
 *
 * Conventions the activities can rely on:
 *
 * - **Non-numeric answers are strings.** Shapes are ShapeIds ('triangle').
 *   Yes/no questions answer 'yes' or 'no'. Fractions of shapes answer
 *   'half', 'quarter', 'third' or 'whole'. Longer/shorter answers
 *   'longer', 'shorter' or 'the same'. Times are `timeWords(hour, minute)`:
 *   '3 o’clock', 'half past 3', 'quarter past 3', 'quarter to 4',
 *   '20 past 3', '25 to 4'. Array sums answer like '3 × 4' (rows × each).
 * - **Money is in pence**, as numbers (£1 is 100). Speech says pounds
 *   properly ("£1", not "100p").
 * - `clock`: `hour` is the hour it is now (1–12), so quarter to 4 is
 *   `{ hour: 3, minute: 45 }`; the hour hand sits three quarters of the
 *   way from 3 to 4.
 * - `groups` visual: `groups` is the number of groups (or rows, in an
 *   array) and `each` how many in each. With the `groups` activity:
 *   `groups` tier 2 shows the groups to count altogether; `groups` tier 3
 *   and `arrays` tier 3 ask him to build them, then say the total;
 *   `times-*` tier 1 counts on group by group; `group-div` starts with the
 *   items loose and asks how many groups of `each` they make (the answer is
 *   `groups`).
 * - `length`: the first length is the top one. Tier 1 compares two lengths
 *   (no measuring); tier 2 is one length in giant footsteps; tier 3 one
 *   length against a cm ruler starting at 0.
 * - `coins`: `coins` are the coins on the table, biggest first. With a
 *   `target` (coins tier 3) he taps coins to pay exactly that much, and the
 *   answer is the target.
 * - `share`: always exact. Fractions of an amount use it too (half of 8 is
 *   8 shared between 2).
 *
 * Numbers in speech are always in {slots}, so the voice can record the
 * fixed words once.
 */
import type { Answer, Problem, PropId, ShapeId, Speech } from '../problem';
import type { Rand } from '../random';
import type { SkillId } from '../skills';
import { choicesFor, choicesFrom, FOLK, propWord, type Generator } from './helpers';

// ---------------------------------------------------------------------------
// Shared pieces

/** Choices from a priority list of likely mistakes (first ones win), shuffled. */
function pickChoices<T extends Answer>(answer: T, likely: readonly T[], r: Rand, count = 4): T[] {
  const out: T[] = [answer];
  for (const c of likely) if (out.length < count && !out.some((o) => String(o) === String(c))) out.push(c);
  return r.shuffle(out);
}

/** Like choicesFor, but every choice is a multiple of `step` (money in 10s). */
function stepChoices(answer: number, step: number, r: Rand, o: { min: number; max: number; likely: number[] }): number[] {
  const out = new Set<number>([answer]);
  const ok = (n: number) => n % step === 0 && n >= o.min && n <= o.max && !out.has(n);
  for (const n of r.shuffle(o.likely)) if (out.size < 4 && ok(n)) out.add(n);
  for (let d = step; out.size < 4 && d <= o.max; d += step) {
    for (const n of r.shuffle([answer - d, answer + d])) if (out.size < 4 && ok(n)) out.add(n);
  }
  return r.shuffle([...out]);
}

/** Joins pieces of speech into one, merging their slot values. */
function joinSpeech(...parts: (string | Speech)[]): Speech {
  let text = '';
  const vals: Record<string, number | string> = {};
  for (const p of parts) {
    if (typeof p === 'string') text += p;
    else {
      text += p.text;
      Object.assign(vals, p.vals);
    }
  }
  return Object.keys(vals).length ? { text, vals } : { text };
}

/** An amount of money, spoken properly: "20p", "£1", "£1.50". */
export function money(pence: number, slot = 'p'): Speech {
  if (pence < 100) return { text: `{${slot}}p`, vals: { [slot]: pence } };
  const pounds = Math.floor(pence / 100);
  if (pence % 100 === 0) return { text: `£{${slot}}`, vals: { [slot]: pounds } };
  return { text: `£{${slot}}.{${slot}p}`, vals: { [slot]: pounds, [`${slot}p`]: String(pence % 100).padStart(2, '0') } };
}

/** Running totals, said while counting on: "5p, 7p, 8p". */
function countOn(values: number[], say: (n: number, slot: string) => Speech): Speech {
  const parts: (string | Speech)[] = [];
  let run = 0;
  values.forEach((v, i) => {
    run += v;
    if (i) parts.push(', ');
    parts.push(say(run, `r${i}`));
  });
  return joinSpeech(...parts);
}

const nextHour = (h: number): number => (h % 12) + 1;
const prevHour = (h: number): number => ((h + 10) % 12) + 1;

/** The time in words, as the clock activity answers it: "quarter to 4". */
export function timeWords(hour: number, minute: number): string {
  const h = ((hour - 1) % 12 + 12) % 12 + 1;
  if (minute === 0) return `${h} o’clock`;
  if (minute === 30) return `half past ${h}`;
  if (minute === 15) return `quarter past ${h}`;
  if (minute === 45) return `quarter to ${nextHour(h)}`;
  if (minute < 30) return `${minute} past ${h}`;
  return `${60 - minute} to ${nextHour(h)}`;
}

/** Wraps an hour into 1–12. */
const hour12 = (h: number): number => ((h - 1) % 12 + 12) % 12 + 1;

const TOY_PROPS: readonly PropId[] = ['soldier', 'teddy', 'balloon', 'present', 'cushion', 'button'];
const SNOW_PROPS: readonly PropId[] = ['snowball', 'icicle', 'popBiscuit', 'toffee', 'googleBun', 'apple'];

// ---------------------------------------------------------------------------
// 2D shapes

const BASIC_SHAPES: readonly ShapeId[] = ['circle', 'square', 'triangle', 'rectangle'];
const SIDES: Partial<Record<ShapeId, number>> = { triangle: 3, square: 4, rectangle: 4, pentagon: 5, hexagon: 6 };

/** What makes each shape that shape, read back after he names it. */
const SHAPE_FACT: Record<ShapeId, Speech> = {
  circle: { text: 'It’s round, with no corners.' },
  square: { text: '{n} sides, all the same length.', vals: { n: 4 } },
  rectangle: { text: '{n} sides: two long and two short.', vals: { n: 4 } },
  triangle: { text: '{n} straight sides and {k} corners.', vals: { n: 3, k: 3 } },
  pentagon: { text: '{n} straight sides.', vals: { n: 5 } },
  hexagon: { text: '{n} straight sides.', vals: { n: 6 } },
  oval: { text: 'Like a stretched circle.' },
  star: { text: '{n} points.', vals: { n: 5 } },
};

/** The shapes he most often mixes each one up with. */
const SHAPE_MIXUPS: Record<ShapeId, ShapeId[]> = {
  circle: ['oval', 'square', 'triangle'],
  square: ['rectangle', 'triangle', 'circle'],
  rectangle: ['square', 'triangle', 'circle'],
  triangle: ['square', 'rectangle', 'circle'],
  pentagon: ['hexagon', 'square', 'triangle'],
  hexagon: ['pentagon', 'square', 'circle'],
  oval: ['circle', 'rectangle', 'square'],
  star: ['pentagon', 'triangle', 'circle'],
};

export function shapes2d(tier: number, r: Rand): Problem {
  const base = { skill: 'shapes-2d', tier } as const;
  if (tier === 3 && r.chance(0.5)) {
    // Counting sides.
    const shape = r.pick<ShapeId>(['triangle', 'square', 'rectangle', 'pentagon', 'hexagon', 'pentagon', 'hexagon']);
    const n = SIDES[shape]!;
    return {
      ...base,
      activity: 'choose',
      say: { text: 'How many sides does this shape have? Count them.' },
      answer: n,
      choices: choicesFor(n, r, { min: 3, max: 6, likely: [n - 1, n + 1] }),
      visual: { type: 'shape', shape, turned: r.pick([0, 0, 30, 90]) },
      explain: joinSpeech(`A ${shape} has `, { text: '{n} sides!', vals: { n } }),
      key: `shapes-2d:sides:${shape}`,
    };
  }
  const shape: ShapeId =
    tier === 1 ? r.pick(BASIC_SHAPES) : tier === 2 ? r.pick(BASIC_SHAPES) : r.pick<ShapeId>(['pentagon', 'hexagon', 'pentagon', 'hexagon', 'triangle', 'rectangle']);
  // Topsy-turvy: tilted or upside down. A square on its point still counts!
  const turned = tier === 1 ? 0 : shape === 'circle' ? 0 : r.pick(tier === 2 ? [30, 45, 90, 135, 180] : [0, 20, 90, 180]);
  const options = tier === 3 ? SHAPE_MIXUPS[shape] : BASIC_SHAPES.filter((s) => s !== shape);
  const say =
    tier === 1
      ? { text: 'What shape is this window?' }
      : tier === 2
        ? { text: 'This window has gone topsy-turvy! What shape is it?' }
        : { text: 'What is this shape called?' };
  const a = shape === 'oval' ? 'an' : 'a';
  return {
    ...base,
    activity: 'shape',
    say,
    answer: shape,
    choices: tier === 3 ? pickChoices<Answer>(shape, options, r) : choicesFrom<Answer>(shape, [shape, ...options], r, 4),
    visual: { type: 'shape', shape, turned },
    explain: joinSpeech(tier === 2 && turned ? `Topsy-turvy, but still ${a} ${shape}! ` : `It’s ${a} ${shape}! `, SHAPE_FACT[shape]),
    key: `shapes-2d:${shape}:${turned}`,
  };
}

// ---------------------------------------------------------------------------
// Measure length

export function measureLength(tier: number, r: Rand): Problem {
  const base = { skill: 'measure-length', tier } as const;
  if (tier === 1) {
    const thing = r.pick(['ribbon', 'pencil', 'snake', 'scarf', 'stick']);
    const a = r.int(3, 15);
    const same = r.chance(0.1);
    let b = a;
    if (!same) {
      do b = r.int(2, 15);
      while (Math.abs(a - b) < 3);
    }
    const answer = a === b ? 'the same' : a > b ? 'longer' : 'shorter';
    const explain =
      answer === 'the same'
        ? { text: `They are the same length! Neither ${thing} is longer.` }
        : { text: `The top ${thing} is ${answer} than the bottom one!` };
    return {
      ...base,
      activity: 'choose',
      say: { text: `Is the top ${thing} longer or shorter than the bottom ${thing}?` },
      answer,
      choices: r.shuffle(['longer', 'shorter', 'the same']),
      visual: { type: 'length', lengths: [a, b], unit: 'cm' },
      explain,
      key: `measure-length:compare:${a}:${b}`,
    };
  }
  if (tier === 2) {
    const thing = r.pick(['rug', 'table', 'bed', 'path', 'carpet']);
    const n = r.int(3, 12);
    return {
      ...base,
      activity: 'choose',
      say: { text: `How many giant footsteps long is the ${thing}?` },
      answer: n,
      choices: choicesFor(n, r, { min: 1, max: 14, likely: [n + 1, n - 1, n + 2] }),
      visual: { type: 'length', lengths: [n], unit: 'footsteps' },
      explain: { text: `The ${thing} is {n} giant footsteps long!`, vals: { n } },
      key: `measure-length:footsteps:${n}`,
    };
  }
  const thing = r.pick(['pencil', 'crayon', 'worm', 'key', 'ribbon', 'feather']);
  const n = r.int(2, 15);
  return {
    ...base,
    activity: 'choose',
    say: { text: `Use the ruler. How many centimetres long is the ${thing}?` },
    answer: n,
    // Counting the marks from 1 instead of the gaps from 0 gives one more.
    choices: choicesFor(n, r, { min: 1, max: 16, likely: [n + 1, n - 1] }),
    visual: { type: 'length', lengths: [n], unit: 'cm' },
    explain: { text: `It starts at {z} and ends at {n}. The ${thing} is {n} centimetres long!`, vals: { z: 0, n } },
    key: `measure-length:cm:${n}`,
  };
}

// ---------------------------------------------------------------------------
// Equal groups and arrays

export function groups(tier: number, r: Rand): Problem {
  const base = { skill: 'groups', tier } as const;
  const prop = r.pick(TOY_PROPS);
  if (tier === 1) {
    const g = r.int(2, 4);
    const each = r.int(2, 5);
    const counts = Array.from({ length: g }, () => each);
    const equal = r.chance(0.5);
    if (!equal) {
      const i = r.int(0, g - 1);
      counts[i] = each === 2 ? each + r.pick([1, 2]) : each + r.pick([-1, 1, 2]);
    }
    const odd = counts.find((c) => c !== each);
    return {
      ...base,
      activity: 'choose',
      say: { text: `Look at the groups of ${propWord(prop, 2)}. Are the groups equal?` },
      answer: equal ? 'yes' : 'no',
      choices: r.shuffle(['yes', 'no']),
      visual: { type: 'objects', groups: counts.map((count) => ({ prop, count })), layout: 'row' },
      explain: equal
        ? { text: 'Yes! Every group has {n}. They are equal.', vals: { n: each } }
        : { text: 'No! One group has {a}, but another has {n}. Not equal.', vals: { a: odd!, n: each } },
      key: `groups:equal:${counts.join(',')}`,
    };
  }
  const g = r.int(2, 5);
  const each = r.int(2, 5);
  const total = g * each;
  const likely = [g + each, total + each, total - each, total + 1, total - 1];
  const choices = choicesFor(total, r, { min: 1, max: 30, likely });
  const explain = { text: '{g} groups of {e} make {c}!', vals: { g, e: each, c: total } };
  if (tier === 2) {
    return {
      ...base,
      activity: 'groups',
      say: { text: `There are {g} groups. Each group has {e} ${propWord(prop, each)}. How many altogether?`, vals: { g, e: each } },
      text: `${Array.from({ length: g }, () => each).join(' + ')} = ?`,
      answer: total,
      choices,
      visual: { type: 'groups', groups: g, each, layout: 'groups', prop },
      explain,
      key: `groups:${g}x${each}`,
    };
  }
  return {
    ...base,
    activity: 'groups',
    say: { text: `Make {g} equal groups, with {e} ${propWord(prop, each)} in each. How many altogether?`, vals: { g, e: each } },
    answer: total,
    choices,
    visual: { type: 'groups', groups: g, each, layout: 'groups', prop },
    explain,
    key: `groups:make:${g}x${each}`,
  };
}

export function arrays(tier: number, r: Rand): Problem {
  const base = { skill: 'arrays', tier } as const;
  const prop = r.pick(TOY_PROPS);
  const rows = r.int(2, 5);
  let cols = r.int(2, 5);
  // Different rows and columns, so mixing them up is a visible mistake.
  while (cols === rows) cols = r.int(2, 5);
  const total = rows * cols;
  const visual = { type: 'groups', groups: rows, each: cols, layout: 'array', prop } as const;
  const sum = (a: number, b: number) => `${a} × ${b}`;
  if (tier === 1) {
    const ask = r.pick(['rows', 'columns', 'total'] as const);
    if (ask === 'rows') {
      return {
        ...base,
        activity: 'choose',
        say: { text: 'How many rows are there? Rows go across.' },
        answer: rows,
        choices: choicesFor(rows, r, { min: 1, max: 25, likely: [cols, total, rows + 1] }),
        visual,
        explain: { text: 'There are {r} rows, with {c} in each row!', vals: { r: rows, c: cols } },
        key: `arrays:rows:${rows}x${cols}`,
      };
    }
    if (ask === 'columns') {
      return {
        ...base,
        activity: 'choose',
        say: { text: 'How many columns are there? Columns go up and down.' },
        answer: cols,
        choices: choicesFor(cols, r, { min: 1, max: 25, likely: [rows, total, cols + 1] }),
        visual,
        explain: { text: 'There are {c} columns, with {r} in each column!', vals: { r: rows, c: cols } },
        key: `arrays:cols:${rows}x${cols}`,
      };
    }
    return {
      ...base,
      activity: 'choose',
      say: { text: `How many ${propWord(prop, 2)} are there altogether?` },
      answer: total,
      choices: choicesFor(total, r, { min: 1, max: 30, likely: [rows + cols, total + cols, total - cols, total + 1] }),
      visual,
      explain: { text: '{r} rows of {c} make {t}!', vals: { r: rows, c: cols, t: total } },
      key: `arrays:total:${rows}x${cols}`,
    };
  }
  const explain = { text: '{r} rows of {c}. {r} times {c} is {t}!', vals: { r: rows, c: cols, t: total } };
  if (tier === 2 && r.chance(0.5)) {
    // Which multiplication matches? (c × r is right too, so it's never a wrong choice.)
    const answer = sum(rows, cols);
    const likely = r.shuffle([`${rows} + ${cols}`, sum(rows, rows), sum(cols, cols), sum(rows, cols + 1), sum(rows + 1, cols)]);
    return {
      ...base,
      activity: 'choose',
      say: { text: 'Which times sum matches the array?' },
      answer,
      choices: pickChoices<Answer>(answer, likely.filter((s) => s !== sum(cols, rows)), r),
      visual,
      explain,
      key: `arrays:which:${rows}x${cols}`,
    };
  }
  const choices = choicesFor(total, r, { min: 1, max: 30, likely: [rows + cols, total + cols, total - rows, total + 1] });
  if (tier === 2) {
    return {
      ...base,
      activity: 'choose',
      say: { text: '{r} rows of {c}. What is {r} times {c}?', vals: { r: rows, c: cols } },
      text: `${sum(rows, cols)} = ?`,
      answer: total,
      choices,
      visual,
      explain,
      key: `arrays:${rows}x${cols}`,
    };
  }
  return {
    ...base,
    activity: 'groups',
    say: { text: `Build an array: {r} rows, with {c} ${propWord(prop, cols)} in each row. How many altogether?`, vals: { r: rows, c: cols } },
    text: `${sum(rows, cols)} = ?`,
    answer: total,
    choices,
    visual,
    explain,
    key: `arrays:build:${rows}x${cols}`,
  };
}

// ---------------------------------------------------------------------------
// Times tables

/** The 2, 5 and 10 times tables share one shape: n groups of m. */
function timesTable(skill: SkillId, m: 2 | 5 | 10, tier: number, r: Rand): Problem {
  const n = tier === 1 ? r.int(2, m === 2 ? 6 : 5) : r.int(1, 10);
  const c = n * m;
  const likely = [n + m, c + m, c - m, c + 1, c - 1];
  const choices = choicesFor(c, r, { min: 0, max: 10 * m + m, likely });
  if (tier === 1) {
    const prop: PropId = m === 10 ? 'stick' : r.pick(TOY_PROPS);
    const group = m === 10 ? 'bundles' : 'groups';
    return {
      skill,
      tier,
      activity: 'groups',
      say: {
        text: `There are {n} ${group} of {m} ${propWord(prop, 2)}. Count in {m}s. How many ${propWord(prop, 2)} altogether?`,
        vals: { n, m },
      },
      text: `${n} × ${m} = ?`,
      answer: c,
      choices,
      visual: { type: 'groups', groups: n, each: m, layout: 'groups', prop },
      explain: joinSpeech(countOn(Array.from({ length: n }, () => m), (v, s) => ({ text: `{${s}}`, vals: { [s]: v } })), {
        text: `. {n} ${group} of {m} make {c}!`,
        vals: { n, m, c },
      }),
      key: `${skill}:${n}x${m}`,
    };
  }
  const activity = tier >= 3 ? 'numberPad' : 'choose';
  const explain = { text: '{n} groups of {m} make {c}. {n} times {m} is {c}!', vals: { n, m, c } };
  if (tier === 2 && r.chance(0.25)) {
    return {
      skill,
      tier,
      activity,
      say: { text: 'How many {m}s make {c}?', vals: { m, c } },
      text: `? × ${m} = ${c}`,
      answer: n,
      choices: choicesFor(n, r, { min: 0, max: 12, likely: [n + 1, n - 1, c - m] }),
      visual: { type: 'none' },
      explain,
      key: `${skill}:?x${m}=${c}`,
    };
  }
  // Sometimes the other way round: 5 × 3 is the same as 3 × 5.
  const [a, b] = r.chance(0.3) ? [m, n] : [n, m];
  return {
    skill,
    tier,
    activity,
    say: { text: 'What is {a} times {b}?', vals: { a, b } },
    text: `${a} × ${b} = ?`,
    answer: c,
    choices,
    visual: { type: 'none' },
    explain,
    key: `${skill}:${n}x${m}`,
  };
}

export const times2 = (tier: number, r: Rand): Problem => timesTable('times-2', 2, tier, r);
export const times5 = (tier: number, r: Rand): Problem => timesTable('times-5', 5, tier, r);
export const times10 = (tier: number, r: Rand): Problem => timesTable('times-10', 10, tier, r);

// ---------------------------------------------------------------------------
// Money

export const UK_COINS = [1, 2, 5, 10, 20, 50, 100, 200] as const;

/** How to spot each coin, read back after he finds it. */
const COIN_LOOKS: Record<number, Speech> = {
  1: { text: 'It’s small and copper.' },
  2: { text: 'It’s big and copper.' },
  5: { text: 'It’s the smallest silver coin.' },
  10: { text: 'It’s big, round and silver.' },
  20: { text: 'It’s silver, with {s} sides.', vals: { s: 7 } },
  50: { text: 'It’s big and silver, with {s} sides.', vals: { s: 7 } },
  100: { text: 'It’s gold, with {s} sides.', vals: { s: 12 } },
  200: { text: 'It’s gold on the outside and silver in the middle.' },
};

/** Coins that look or sound alike: 2p, 20p and £2 … */
const COIN_MIXUPS: Record<number, number[]> = {
  1: [10, 100, 2],
  2: [20, 200, 1],
  5: [50, 10, 1],
  10: [1, 100, 20],
  20: [2, 200, 50],
  50: [5, 20, 100],
  100: [1, 10, 200],
  200: [2, 20, 100],
};

/** Coins adding up to `pence`, biggest first, from the coins allowed. */
function makeAmount(pence: number, allowed: readonly number[]): number[] {
  const out: number[] = [];
  let left = pence;
  for (const c of [...allowed].sort((a, b) => b - a)) {
    while (left >= c) {
      out.push(c);
      left -= c;
    }
  }
  return out;
}

const desc = (coins: number[]): number[] => [...coins].sort((a, b) => b - a);
const sumOf = (xs: number[]): number => xs.reduce((s, x) => s + x, 0);

export function coins(tier: number, r: Rand): Problem {
  const base = { skill: 'coins', tier } as const;
  if (tier === 1) {
    // Find one coin among coins that look or sound like it.
    const coin = r.pick(UK_COINS);
    const shown = desc([coin, ...r.shuffle(COIN_MIXUPS[coin]).slice(0, r.int(2, 3))]);
    return {
      ...base,
      activity: 'coins',
      say: joinSpeech('Can you find the ', money(coin), ' coin?'),
      answer: coin,
      choices: r.shuffle(shown),
      visual: { type: 'coins', coins: shown },
      explain: joinSpeech('That’s the ', money(coin), '! ', COIN_LOOKS[coin]),
      key: `coins:find:${coin}`,
    };
  }
  if (tier === 2) {
    // 1p, 2p and 5p coins to 20p, with at least one 2p or 5p (so counting
    // the coins isn't the same as counting the money).
    let set: number[];
    do set = Array.from({ length: r.int(2, 6) }, () => r.pick([1, 2, 2, 5, 5]));
    while (sumOf(set) > 20 || set.every((c) => c === 1));
    set = desc(set);
    const t = sumOf(set);
    return {
      ...base,
      activity: 'coins',
      say: { text: 'How much money is in the purse? Start with the biggest coin.' },
      answer: t,
      choices: choicesFor(t, r, { min: 1, max: 25, likely: [set.length, t + 1, t - 1, t - set[set.length - 1]] }),
      visual: { type: 'coins', coins: set },
      explain: joinSpeech(countOn(set, money), '. That’s ', money(t, 't'), ' altogether!'),
      key: `coins:count:${set.join('+')}`,
    };
  }
  if (tier === 3) {
    // Pay an exact amount from a purse with a few coins too many.
    const t = r.int(3, 20);
    const pay = makeAmount(t, t === 20 ? [20, 10, 5, 2, 1] : [10, 5, 2, 1]);
    const purse = desc([...pay, ...Array.from({ length: r.int(1, 2) }, () => r.pick([1, 2, 5, 10]))]);
    const toy = r.pick(['drum', 'kite', 'yo-yo', 'spinning top', 'ball', 'toy boat']);
    return {
      ...base,
      activity: 'coins',
      say: joinSpeech(`The ${toy} costs `, money(t), '. Tap the coins to pay exactly ', money(t), '.'),
      answer: t,
      choices: choicesFor(t, r, { min: 1, max: 25, likely: [t + 1, t - 1, t + 2] }),
      visual: { type: 'coins', coins: purse, target: t },
      explain: pay.length === 1 ? joinSpeech('That’s ', money(t, 't'), '. Just right!') : joinSpeech(countOn(pay, money), '. That’s ', money(t, 't'), '. Just right!'),
      key: `coins:pay:${t}`,
    };
  }
  // 10p and 20p coins up to £1.
  let set: number[];
  do set = Array.from({ length: r.int(2, 7) }, () => r.pick([10, 20]));
  while (sumOf(set) > 100 || sumOf(set) < 30 || set.every((c) => c === 10));
  set = desc(set);
  const t = sumOf(set);
  return {
    ...base,
    activity: 'coins',
    say: { text: 'How much money is there? Count on in {a}s, then {b}s.', vals: { a: 20, b: 10 } },
    answer: t,
    // Counting every coin as 10p is the likely mistake.
    choices: stepChoices(t, 10, r, { min: 10, max: 120, likely: [set.length * 10, t + 10, t - 10, t + 20] }),
    visual: { type: 'coins', coins: set },
    explain: joinSpeech(countOn(set, money), '. That’s ', money(t, 't'), t === 100 ? '! A whole pound!' : ' altogether!'),
    key: `coins:tens:${set.join('+')}`,
  };
}

// ---------------------------------------------------------------------------
// Sharing and grouping (÷)

export function share(tier: number, r: Rand): Problem {
  const base = { skill: 'share', tier } as const;
  const between = tier === 1 ? 2 : r.int(2, 5);
  const each = tier === 1 ? r.int(1, 5) : r.int(1, between === 2 ? 6 : 5);
  const total = between * each;
  const prop = r.pick(SNOW_PROPS);
  const choices = choicesFor(each, r, { min: 0, max: 20, likely: [each + 1, each - 1, total - between, between] });
  const explain = { text: '{t} shared between {n} is {c} each!', vals: { t: total, n: between, c: each } };
  if (tier === 1) {
    const [a, b] = r.shuffle(FOLK).slice(0, 2);
    return {
      ...base,
      activity: 'share',
      say: { text: `Share {t} ${propWord(prop, total)} fairly between ${a} and ${b}. How many does each one get?`, vals: { t: total } },
      answer: each,
      choices,
      visual: { type: 'share', total, between, prop },
      explain,
      key: `share:${total}/${between}`,
    };
  }
  if (tier === 2) {
    return {
      ...base,
      activity: 'share',
      say: { text: `Share {t} ${propWord(prop, total)} fairly between {n} friends. How many does each friend get?`, vals: { t: total, n: between } },
      answer: each,
      choices,
      visual: { type: 'share', total, between, prop },
      explain,
      key: `share:${total}/${between}`,
    };
  }
  return {
    ...base,
    activity: 'choose',
    say: { text: 'What is {t} divided by {n}? Share {t} between {n}.', vals: { t: total, n: between } },
    text: `${total} ÷ ${between} = ?`,
    answer: each,
    choices,
    visual: { type: 'none' },
    explain,
    key: `share:${total}/${between}`,
  };
}

export function groupDiv(tier: number, r: Rand): Problem {
  const base = { skill: 'group-div', tier } as const;
  const size = tier === 1 ? 2 : r.pick([2, 5, 10] as const);
  // Concrete tiers keep to 30 things or fewer, so the picture stays clear.
  const n = tier === 1 ? r.int(2, 6) : tier === 2 ? r.int(2, size === 2 ? 10 : size === 5 ? 6 : 3) : r.int(1, 10);
  const total = n * size;
  const prop = r.pick(SNOW_PROPS);
  const choices = choicesFor(n, r, { min: 0, max: 100, likely: [n + 1, n - 1, total - size, size] });
  const explain = { text: n === 1 ? 'There is {c} group of {s} in {t}!' : 'There are {c} groups of {s} in {t}!', vals: { t: total, c: n, s: size } };
  if (tier <= 2) {
    return {
      ...base,
      activity: 'groups',
      say: {
        text: `There are {t} ${propWord(prop, total)}. Put them in groups of {s}. How many groups can you make?`,
        vals: { t: total, s: size },
      },
      answer: n,
      choices,
      visual: { type: 'groups', groups: n, each: size, layout: 'groups', prop },
      explain,
      key: `group-div:${total}/${size}`,
    };
  }
  return {
    ...base,
    activity: 'choose',
    say: { text: 'What is {t} divided by {s}? How many groups of {s} make {t}?', vals: { t: total, s: size } },
    text: `${total} ÷ ${size} = ?`,
    answer: n,
    choices,
    visual: { type: 'none' },
    explain,
    key: `group-div:${total}/${size}`,
  };
}

// ---------------------------------------------------------------------------
// Fractions

const PART_NAME: Record<number, string> = { 1: 'whole', 2: 'half', 3: 'third', 4: 'quarter' };
const FRACTION_SIGN: Record<number, string> = { 2: '½', 3: '⅓', 4: '¼' };
const TREATS = ['ice-pie', 'birthday cake', 'pancake', 'jelly'] as const;

export function fractions(tier: number, r: Rand): Problem {
  const base = { skill: 'fractions', tier } as const;
  const shape = r.pick(['circle', 'rect'] as const);
  const treat = r.pick(TREATS);
  if (tier === 1) {
    // Is it a half? The "no" ones are two unequal parts, or more than two parts.
    const kind = r.pick(['half', 'half', 'half', 'unequal', 'unequal', 'more']);
    const parts = kind === 'more' ? r.pick([3, 4]) : 2;
    const equal = kind !== 'unequal';
    const yes = kind === 'half';
    return {
      ...base,
      activity: 'fraction',
      say: { text: `Silky cut the ${treat}. Is the shaded piece a half?` },
      answer: yes ? 'yes' : 'no',
      choices: r.shuffle(['yes', 'no']),
      visual: { type: 'fraction', shape, parts, shaded: 1, equal },
      explain: yes
        ? { text: 'Yes! {n} equal parts, so each part is a half.', vals: { n: 2 } }
        : kind === 'unequal'
          ? { text: 'No! The {n} parts are not the same size, so they are not halves.', vals: { n: 2 } }
          : { text: 'No! There are {n} parts, not {t}. A half is one of {t} equal parts.', vals: { n: parts, t: 2 } },
      key: `fractions:half?:${shape}:${parts}:${equal}`,
    };
  }
  // Shapes split into equal parts, one shaded: halves and quarters, then thirds.
  const nameIt = (parts: number): Problem => {
    const answer = PART_NAME[parts];
    const likely = parts === 3 ? ['half', 'quarter', 'whole'] : parts === 2 ? ['quarter', 'whole', 'third'] : ['half', 'whole', 'third'];
    return {
      ...base,
      activity: 'fraction',
      say: { text: `What fraction of the ${treat} is shaded?` },
      answer,
      choices: pickChoices<Answer>(answer, tier === 4 ? likely : likely.filter((c) => c !== 'third'), r),
      visual: { type: 'fraction', shape, parts, shaded: 1, equal: true },
      explain: { text: `{n} equal parts. One part is a ${answer}!`, vals: { n: parts } },
      key: `fractions:name:${shape}:${parts}`,
    };
  };
  // Half, quarter or third of an amount: share it into that many equal groups.
  const ofAmount = (parts: number): Problem => {
    const each = r.int(1, parts === 2 ? 10 : 5);
    const total = each * parts;
    const prop = r.pick(SNOW_PROPS);
    const a = parts === 2 ? 'half' : `a ${PART_NAME[parts]}`;
    // Halving when asked for a quarter (or the other way round) is the likely slip.
    const likely = [total % 2 === 0 ? total / 2 : -1, total % 4 === 0 ? total / 4 : -1, total % 3 === 0 ? total / 3 : -1, each + 1, each - 1, total];
    return {
      ...base,
      activity: 'share',
      say: { text: `What is ${a} of {t} ${propWord(prop, total)}?`, vals: { t: total } },
      text: `${FRACTION_SIGN[parts]} of ${total} = ?`,
      answer: each,
      choices: choicesFor(each, r, { min: 0, max: 20, likely }),
      visual: { type: 'share', total, between: parts, prop },
      explain: {
        text: `${a[0].toUpperCase()}${a.slice(1)} of {t} is {c}! {n} equal groups of {c}.`,
        vals: { t: total, c: each, n: parts },
      },
      key: `fractions:of:${total}/${parts}`,
    };
  };
  if (tier === 2) return nameIt(r.pick([2, 4]));
  if (tier === 3) return ofAmount(r.pick([2, 4]));
  return r.chance(0.5) ? nameIt(3) : ofAmount(3);
}

// ---------------------------------------------------------------------------
// Time

export function time(tier: number, r: Rand): Problem {
  const h = r.int(1, 12);
  const minute = tier === 1 ? 0 : tier === 2 ? 30 : tier === 3 ? 15 : tier === 4 ? 45 : r.pick([5, 10, 20, 25, 35, 40, 50, 55, 15, 30, 45]);
  const answer = timeWords(h, minute);
  const nx = nextHour(h);
  const pv = prevHour(h);
  // Likely mistakes as clock readings [hour, minute]: the hour one out,
  // past and to mixed up, or the big hand read as the hour.
  const likely: [number, number][] =
    minute === 0
      ? [[h === 12 ? 6 : 12, 0], [nx, 0], [pv, 0], [h, 30]]
      : minute === 30
        ? [[nx, 30], [h === 6 ? 12 : 6, 0], [h, 0], [pv, 30]]
        : minute === 15
          ? [[pv, 45], [h === 3 ? 9 : 3, 0], [nx, 15], [h, 30]]
          : minute === 45
            ? [[nx, 15], [h, 15], [pv, 45], [h === 9 ? 3 : 9, 0]]
            : minute < 30
              ? [[pv, 60 - minute], [h, minute / 5], [nx, minute]]
              : [[nx, 60 - minute], [h, minute / 5], [pv, minute]];
  const choices = pickChoices<Answer>(answer, likely.map(([lh, lm]) => timeWords(hour12(lh), lm)), r);
  const who = r.pick(['Moon-Face', 'Silky', 'the Saucepan Man', 'Dame Washalot']);
  const say =
    tier === 1
      ? { text: `${who[0].toUpperCase()}${who.slice(1)}’s clock has frozen! What time does it say?` }
      : { text: 'The clock tower has frozen! What time does it say?' };
  const big = minute / 5 || 12;
  const explain: Speech =
    minute === 0
      ? { text: 'The big hand is on {b}. The little hand is on {h}. It’s {h} o’clock!', vals: { b: big, h } }
      : minute === 30
        ? { text: 'The big hand is on {b}, half way round. It’s half past {h}!', vals: { b: big, h } }
        : minute === 15
          ? { text: 'The big hand is on {b}, a quarter of the way round. It’s quarter past {h}!', vals: { b: big, h } }
          : minute === 45
            ? { text: 'The big hand is on {b}. A quarter more to go until {n}. It’s quarter to {n}!', vals: { b: big, n: nx } }
            : minute < 30
              ? { text: 'The big hand is on {b}. That’s {m} minutes past {h}. It’s {m} past {h}!', vals: { b: big, m: minute, h } }
              : { text: 'The big hand is on {b}. That’s {m} minutes to {n}. It’s {m} to {n}!', vals: { b: big, m: 60 - minute, n: nx } };
  return {
    skill: 'time',
    tier,
    activity: 'clock',
    say,
    answer,
    choices,
    visual: { type: 'clock', hour: h, minute },
    explain,
    key: `time:${h}:${minute}`,
  };
}

export const MORE: Partial<Record<SkillId, Generator>> = {
  'shapes-2d': shapes2d,
  'measure-length': measureLength,
  groups,
  arrays,
  'times-2': times2,
  'times-5': times5,
  'times-10': times10,
  coins,
  share,
  'group-div': groupDiv,
  fractions,
  time,
};
