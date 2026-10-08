/**
 * Hand-made example problems for land 11's skills and pictures, shown by
 * the dev page ?scene=fixtures&kind=<activity kind>: one of every tier of
 * `tally` and `change`.
 */
import type { Problem } from '../core/problem';

const tally = (tier: number, say: string, answer: number, choices: number[], visual: Problem['visual'], key: string, vals?: Record<string, number>): Problem => ({
  skill: 'tally',
  tier,
  activity: 'tally',
  say: { text: say, vals },
  answer,
  choices,
  visual,
  explain: { text: '{n}!', vals: { n: answer } },
  key,
});

export const FIXTURES_L11: Problem[] = [
  tally(1, 'Count the tally marks. How many are there?', 7, [6, 7, 8, 9], { type: 'tally', style: 'tally', rows: [{ label: '', count: 7 }] }, 'fx:tally:1'),
  tally(2, 'How many children chose dogs?', 14, [9, 14, 12, 15], { type: 'tally', style: 'tally', rows: [{ label: 'Cats', count: 8 }, { label: 'Dogs', count: 14 }] }, 'fx:tally:2'),
  tally(3, 'How many apples are there?', 5, [4, 5, 3, 6], { type: 'tally', style: 'pictogram', rows: [{ label: 'Apples', count: 5, prop: 'apple' }, { label: 'Hats', count: 3, prop: 'hat' }, { label: 'Stars', count: 6, prop: 'star' }] }, 'fx:tally:3'),
  tally(4, 'Each picture stands for {per}. How many balloons are there?', 20, [4, 20, 15, 25], { type: 'tally', style: 'pictogram', rows: [{ label: 'Balloons', count: 20, prop: 'balloon' }, { label: 'Presents', count: 15, prop: 'present' }], per: 5 }, 'fx:tally:4', { per: 5 }),
  tally(5, 'How many more cats than dogs?', 6, [6, 5, 14, 8], { type: 'tally', style: 'tally', rows: [{ label: 'Cats', count: 14 }, { label: 'Dogs', count: 8 }] }, 'fx:tally:5'),
  {
    skill: 'change',
    tier: 1,
    activity: 'change',
    say: { text: 'A bun costs {a}p. A jelly costs {b}p. How much is that altogether?', vals: { a: 6, b: 7 } },
    text: '6p + 7p = ?',
    answer: 13,
    choices: [12, 13, 14, 7],
    visual: { type: 'coins', coins: [5, 5, 2, 1] },
    explain: { text: '{a}p and {b}p make {s}p altogether!', vals: { a: 6, b: 7, s: 13 } },
    key: 'fx:change:1',
  },
  {
    skill: 'change',
    tier: 2,
    activity: 'change',
    say: { text: 'Silky pays with a {c}p coin for a bun that costs {p}p. How much change does Silky get?', vals: { c: 10, p: 6 } },
    answer: 4,
    choices: [3, 4, 6, 5],
    visual: { type: 'coins', coins: [10], target: 6 },
    explain: { text: '{c}p take away {p}p is {l}p!', vals: { c: 10, p: 6, l: 4 } },
    key: 'fx:change:2',
  },
  {
    skill: 'change',
    tier: 3,
    activity: 'change',
    say: { text: 'Moon-Face pays with a {c}p coin for a lolly that costs {p}p. How much change does Moon-Face get?', vals: { c: 20, p: 13 } },
    text: '20p − 13p = ?',
    answer: 7,
    choices: [6, 7, 13, 17],
    visual: { type: 'coins', coins: [20], target: 13 },
    explain: { text: '{c}p take away {p}p is {l}p!', vals: { c: 20, p: 13, l: 7 } },
    key: 'fx:change:3',
  },
  {
    skill: 'change',
    tier: 4,
    activity: 'change',
    say: { text: 'Silky pays with a {c} pound coin for a ribbon that costs {p}p. How much change does Silky get?', vals: { c: 1, p: 65 } },
    text: '£1 − 65p = ?',
    answer: 35,
    choices: [25, 35, 45, 65],
    visual: { type: 'coins', coins: [100], target: 65 },
    explain: { text: '{c} pound take away {p}p is {l}p!', vals: { c: 1, p: 65, l: 35 } },
    key: 'fx:change:4',
  },
];
