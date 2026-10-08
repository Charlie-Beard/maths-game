/**
 * Generators for land 11, the Old Woman's Shoe: `tally`, `change`.
 * Each follows its skill's tiers in core/skills.ts (concrete → pictorial →
 * abstract) and the conventions in the header of generators/more.ts.
 *
 * Conventions the activities rely on:
 *
 * - `tally` visual: a row's `count` is the real number, even in a
 *   pictogram where one picture is 2, 5 or 10 (`per`). A row with an empty
 *   `label` is an unlabelled tally (tiers 1 and 2). Every answer is a
 *   number, so the choices are plain number cards.
 * - `change`: money is pence. Tier 1 shows the coins that pay for both
 *   things (so the coins on the table add up to the answer). Tiers 2–4
 *   show the one coin he pays with and the price tag (a `coins` visual with
 *   a `target`), and the answer is the change. The price is always under
 *   the coin, so the change is never 0 or negative. The `change` activity
 *   draws the choices as money ("35p", "£1").
 */
import type { Answer, Problem, PropId, Speech } from '../problem';
import type { Rand } from '../random';
import type { SkillId } from '../skills';
import { capital, choicesFor, propWord, type Generator } from './helpers';
import { money } from './more';

// ---------------------------------------------------------------------------
// Shared pieces

/** Joins speeches into one, keeping every slot name unique. */
function join(...parts: (string | Speech)[]): Speech {
  let text = '';
  const vals: Record<string, number | string> = {};
  parts.forEach((p, i) => {
    if (typeof p === 'string') {
      text += p;
      return;
    }
    text += p.text.replace(/\{(\w+)\}/g, (_, k: string) => `{${k}_${i}}`);
    for (const [k, v] of Object.entries(p.vals ?? {})) vals[`${k}_${i}`] = v;
  });
  return Object.keys(vals).length ? { text, vals } : { text };
}

/** Choices that keep to the answer's own steps ("every 5", "every 10"), likely mistakes first. */
function stepped(answer: number, step: number, likely: number[], min: number, max: number, r: Rand): number[] {
  const out = new Set<number>([answer]);
  const ok = (n: number) => Number.isInteger(n) && (n - answer) % step === 0 && n >= min && n <= max && !out.has(n);
  for (const n of r.shuffle(likely)) if (out.size < 4 && ok(n)) out.add(n);
  for (let d = step; out.size < 4 && d <= max - min; d += step) {
    for (const n of r.shuffle([answer - d, answer + d])) if (out.size < 4 && ok(n)) out.add(n);
  }
  return r.shuffle([...out]);
}

/** Counting in 5s (or any step) aloud: "{c0}, {c1}, {c2}". */
function countingIn(step: number, upTo: number): Speech {
  const vals: Record<string, number> = {};
  const bits: string[] = [];
  for (let n = step, i = 0; n <= upTo; n += step, i++) {
    vals[`c${i}`] = n;
    bits.push(`{c${i}}`);
  }
  return { text: bits.join(', '), vals };
}

// ---------------------------------------------------------------------------
// Tally charts and pictograms

/** What the children voted for. Labels are written on the chart, so they are real words he can match to the question. */
const VOTES: { intro: string; items: string[] }[] = [
  { intro: 'The children voted for their favourite pet.', items: ['Cats', 'Dogs', 'Rabbits', 'Fish', 'Birds'] },
  { intro: 'The children voted for their favourite colour.', items: ['Red', 'Blue', 'Green', 'Yellow', 'Pink'] },
  { intro: 'The children voted for their favourite snack.', items: ['Buns', 'Jellies', 'Toffees', 'Apples', 'Biscuits'] },
];

/** Pictures for a pictogram: clear, different from one another at a glance. */
const PICTURES: readonly PropId[] = ['apple', 'teacup', 'hat', 'balloon', 'star', 'present', 'acorn', 'button', 'popBiscuit', 'toffee'];

/** Distinct whole numbers from lo to hi. */
function distinct(r: Rand, n: number, lo: number, hi: number): number[] {
  const pool = r.shuffle(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i));
  return pool.slice(0, n);
}

interface Chart {
  rows: { label: string; count: number; prop?: PropId }[];
  /** The intro said before the question ("The children voted …"), if any. */
  intro: string;
}

function votesChart(r: Rand, counts: number[]): Chart {
  const topic = r.pick(VOTES);
  const items = r.shuffle(topic.items).slice(0, counts.length);
  return { rows: items.map((label, i) => ({ label, count: counts[i] })), intro: topic.intro };
}

function picturesChart(r: Rand, counts: number[]): Chart {
  const props = r.shuffle(PICTURES).slice(0, counts.length);
  return { rows: props.map((prop, i) => ({ label: capital(propWord(prop, 2)), count: counts[i], prop })), intro: '' };
}

const lower = (s: string): string => s.toLowerCase();

export function tally(tier: number, r: Rand): Problem {
  const base = { skill: 'tally', tier, activity: 'tally' } as const;

  if (tier === 1) {
    // One row of marks, to 10: a gate of five and then the rest.
    const n = r.int(2, 10);
    const gates = Math.floor(n / 5);
    const rest = n % 5;
    return {
      ...base,
      say: { text: 'The Old Woman makes a mark for each child who visits. Count the marks. How many are there?' },
      answer: n,
      choices: choicesFor(n, r, { min: 1, max: 12, likely: [n + 1, n - 1, n + 2, gates ? n - 1 : n + 3] }),
      visual: { type: 'tally', style: 'tally', rows: [{ label: '', count: n }] },
      explain: gates
        ? rest
          ? { text: 'A gate is {g}. Then {m} more. That’s {n}!', vals: { g: 5, m: rest, n } }
          : { text: 'A gate is {g}. That’s {n}!', vals: { g: 5, n } }
        : { text: '{n} marks!', vals: { n } },
      key: `tally:marks:${n}`,
    };
  }

  if (tier === 2) {
    // Gates of five, to 20: count in 5s, then the loose marks. Sometimes
    // two labelled rows, and he reads one.
    if (r.chance(0.5)) {
      const n = r.int(11, 20);
      return tallyFives(base, [{ label: '', count: n }], 0, '', 'How many marks are there? Count in {f}s.', n, r);
    }
    const [a, b] = distinct(r, 2, 6, 20);
    const chart = votesChart(r, [a, b]);
    const ask = r.int(0, 1);
    const n = chart.rows[ask].count;
    return tallyFives(base, chart.rows, ask, chart.intro, `How many children chose ${lower(chart.rows[ask].label)}? Count in {f}s.`, n, r);
  }

  if (tier === 3) {
    // A picture chart where one picture is one.
    const rowsN = r.int(2, 3);
    const chart = picturesChart(r, distinct(r, rowsN, 1, 8));
    const visual = { type: 'tally', style: 'pictogram', rows: chart.rows } as const;
    if (rowsN === 3 && r.chance(0.3)) {
      const [i, j] = r.shuffle([0, 1, 2]).slice(0, 2);
      const a = chart.rows[i];
      const b = chart.rows[j];
      const sum = a.count + b.count;
      return {
        ...base,
        say: { text: `Look at the picture chart. How many ${lower(a.label)} and ${lower(b.label)} are there altogether?` },
        answer: sum,
        choices: choicesFor(sum, r, { min: 2, max: 18, likely: [a.count, b.count, sum + 1, sum - 1] }),
        visual,
        explain: { text: `{a} ${propWord(a.prop!, a.count)} and {b} ${propWord(b.prop!, b.count)}. {a} and {b} make {s}!`, vals: { a: a.count, b: b.count, s: sum } },
        key: `tally:pics:${chart.rows.map((x) => `${x.prop}${x.count}`).join(',')}:sum${i}${j}`,
      };
    }
    const ask = r.int(0, rowsN - 1);
    const row = chart.rows[ask];
    return {
      ...base,
      say: { text: `Look at the picture chart. How many ${lower(row.label)} are there?` },
      answer: row.count,
      choices: choicesFor(row.count, r, { min: 0, max: 12, likely: [row.count + 1, row.count - 1, ...chart.rows.filter((_, k) => k !== ask).map((x) => x.count)] }),
      visual,
      explain: { text: `{n} ${propWord(row.prop!, row.count)}. One picture for each!`, vals: { n: row.count } },
      key: `tally:pics:${chart.rows.map((x) => `${x.prop}${x.count}`).join(',')}:row${ask}`,
    };
  }

  if (tier === 4) {
    // One picture is 2, 5 or 10, with the key shown.
    const per = r.pick([2, 5, 10]);
    const maxPics = per === 2 ? 8 : per === 5 ? 7 : 5;
    const rowsN = r.int(2, 3);
    const pics = distinct(r, rowsN, 2, maxPics);
    const chart = picturesChart(
      r,
      pics.map((n) => n * per),
    );
    const ask = r.int(0, rowsN - 1);
    const row = chart.rows[ask];
    const n = row.count / per;
    return {
      ...base,
      say: { text: `Each picture stands for {per}. How many ${lower(row.label)} are there?`, vals: { per } },
      answer: row.count,
      choices: stepped(row.count, per, [n, row.count + per, row.count - per, n * per + 1], per, per * (maxPics + 1), r),
      visual: { type: 'tally', style: 'pictogram', rows: chart.rows, per },
      explain: { text: `Count in {per}s: ${countingIn(per, row.count).text}. That’s {n}!`, vals: { per, ...countingIn(per, row.count).vals, n: row.count } },
      key: `tally:key${per}:${chart.rows.map((x) => `${x.prop}${x.count}`).join(',')}:row${ask}`,
    };
  }

  // Tier 5: how many more? Two rows, tallies or pictures, a key sometimes.
  const style = r.pick(['tally', 'pictures', 'pictures2'] as const);
  const per = style === 'pictures2' ? r.pick([2, 5]) : 1;
  const [small, big] = style === 'tally' ? distinct(r, 2, 3, 20).sort((x, y) => x - y) : distinct(r, 2, 2, per === 1 ? 10 : per === 2 ? 9 : 7).sort((x, y) => x - y).map((n) => n * per);
  const bigFirst = r.chance(0.5);
  const counts = bigFirst ? [big, small] : [small, big];
  const chart = style === 'tally' ? votesChart(r, counts) : picturesChart(r, counts);
  const bigRow = chart.rows[bigFirst ? 0 : 1];
  const smallRow = chart.rows[bigFirst ? 1 : 0];
  const diff = big - small;
  const who = style === 'tally' ? 'children chose ' : '';
  const keyed = per > 1 ? ' Each picture stands for {per}.' : '';
  const likely = [big + small, big, small, diff + per, diff - per, diff / per];
  return {
    ...base,
    say: { text: `${chart.intro ? chart.intro + ' ' : ''}How many more ${who}${lower(bigRow.label)} than ${lower(smallRow.label)}?${keyed}`, vals: per > 1 ? { per } : undefined },
    answer: diff,
    choices: per > 1 ? stepped(diff, per, likely, per, per * 10, r) : choicesFor(diff, r, { min: 1, max: 20, likely: [diff + 1, diff - 1, big, small, big + small].filter((n) => n <= 20) }),
    visual: { type: 'tally', style: style === 'tally' ? 'tally' : 'pictogram', rows: chart.rows, ...(per > 1 ? { per } : {}) },
    explain: { text: `${capital(lower(bigRow.label))}: {a}. ${capital(lower(smallRow.label))}: {b}. {a} take away {b} is {d}!`, vals: { a: big, b: small, d: diff } },
    key: `tally:more:${style}:${big}-${small}:${per}`,
  };
}

/** A tally in fives, with the choices a miscounted gate gives. */
function tallyFives(
  base: { skill: 'tally'; tier: number; activity: 'tally' },
  rows: { label: string; count: number }[],
  ask: number,
  intro: string,
  question: string,
  n: number,
  r: Rand,
): Problem {
  const loose = n % 5;
  const answer: Answer = n;
  return {
    ...base,
    say: { text: `${intro ? intro + ' ' : ''}${question}`, vals: { f: 5 } },
    answer,
    choices: choicesFor(n, r, { min: 1, max: 24, likely: [n + 5, n - 5, n - Math.floor(n / 5), n + 1, n - 1] }),
    visual: { type: 'tally', style: 'tally', rows },
    explain: loose
      ? { text: `Count in {f}s: ${countingIn(5, n - loose).text}. Then {m} more makes {n}!`, vals: { f: 5, ...countingIn(5, n - loose).vals, m: loose, n } }
      : { text: `Count in {f}s: ${countingIn(5, n).text}. That’s {n}!`, vals: { f: 5, ...countingIn(5, n).vals, n } },
    key: `tally:fives:${rows.map((x) => x.count).join(',')}:${ask}`,
  };
}

// ---------------------------------------------------------------------------
// Totals and change

const THINGS = ['a bun', 'a jelly', 'a sweet', 'a biscuit', 'an apple', 'a lolly', 'a bean cake', 'a ribbon'];
const WHO = ['Moon-Face', 'Silky', 'the Saucepan Man', 'Mr Watzisname', 'the Angry Pixie'];

/** The fewest of the 10p, 5p, 2p and 1p coins that make a price. */
function coinsFor(pence: number): number[] {
  const out: number[] = [];
  let left = pence;
  for (const c of [10, 5, 2, 1]) {
    while (c <= left) {
      out.push(c);
      left -= c;
    }
  }
  return out;
}

export function change(tier: number, r: Rand): Problem {
  const base = { skill: 'change', tier, activity: 'change' } as const;

  if (tier === 1) {
    // Two prices to 20p altogether: the coins that pay for both are on the table.
    const a = r.int(2, 12);
    const b = r.int(2, Math.min(12, 20 - a));
    const [x, y] = r.shuffle(THINGS).slice(0, 2);
    const sum = a + b;
    return {
      ...base,
      say: join(`${capital(x)} costs `, money(a, 'a'), `. ${capital(y)} costs `, money(b, 'b'), '. How much is that altogether?'),
      text: `${a}p + ${b}p = ?`,
      answer: sum,
      choices: choicesFor(sum, r, { min: 2, max: 24, likely: [sum + 1, sum - 1, Math.max(a, b), sum + 2, sum + 10] }),
      visual: { type: 'coins', coins: [...coinsFor(a), ...coinsFor(b)].sort((p, q) => q - p) },
      explain: join(money(a, 'a'), ' and ', money(b, 'b'), ' make ', money(sum, 's'), ' altogether!'),
      key: `change:add:${Math.min(a, b)}+${Math.max(a, b)}`,
    };
  }

  // Change: one coin, one price under it.
  const coin = tier === 2 ? 10 : tier === 3 ? 20 : r.pick([50, 100]);
  const roundPrice = tier === 4 && (coin === 100 || r.chance(0.5));
  const price = tier === 2 ? r.int(1, 9) : tier === 3 ? r.int(3, 19) : roundPrice ? 5 * r.int(1, coin / 5 - 1) : r.int(3, coin - 3);
  const left = coin - price;
  const step = coin >= 50 && price % 5 === 0 ? 5 : 1;
  const thing = r.pick(THINGS);
  const who = r.pick(WHO);
  const likely = [price, left + 1 * step, left - 1 * step, left + 10, left - 10, coin - price - (price % 10 ? 10 - (price % 10) : 0), left + 5, left - 5];
  return {
    ...base,
    say: join(`${capital(who)} pays with a `, money(coin, 'c'), ` coin for ${thing} that costs `, money(price, 'p'), `. How much change does ${who} get?`),
    ...(tier >= 3 ? { text: `${moneyWords(coin)} − ${moneyWords(price)} = ?` } : {}),
    answer: left,
    choices: stepped(left, step, likely, 1, coin - 1, r),
    visual: { type: 'coins', coins: [coin], target: price },
    explain: join(money(coin, 'c'), ' take away ', money(price, 'p'), ' is ', money(left, 'l'), '!'),
    key: `change:${coin}:${price}`,
  };
}

/** "65p" or "£1" as written in a sum. */
function moneyWords(pence: number): string {
  if (pence < 100) return `${pence}p`;
  return pence % 100 ? `£${Math.floor(pence / 100)}.${String(pence % 100).padStart(2, '0')}` : `£${pence / 100}`;
}

export const L11: Partial<Record<SkillId, Generator>> = { tally, change };
