/**
 * Hand-made example problems for land 14's skills and pictures, shown by
 * the dev page ?scene=fixtures&kind=<activity kind>.
 *
 * All use the `measure` activity, which shows a reading (one value) as a
 * plain picture with number cards, and lets him tap the things when there
 * are two or three (see the header of core/generators/l14.ts).
 */
import type { Answer, Problem, Visual } from '../core/problem';
import type { SkillId } from '../core/skills';

let n = 0;
const fx = (skill: SkillId, tier: number, say: string, answer: Answer, visual: Visual, extra: Partial<Problem> = {}): Problem => ({
  skill,
  tier,
  activity: 'measure',
  say: { text: say },
  answer,
  visual,
  explain: { text: 'That is right!' },
  key: `fixture-l14:${(n += 1)}`,
  ...extra,
});

const side = ['left', 'right'];

export const FIXTURES_L14: Problem[] = [
  // Tap the thing.
  fx('compare-measures', 1, 'Which sack is heavier? Tap it.', 'left', { type: 'measure', gauge: 'balance', values: [7, 3], max: 10, step: 1, unit: 'kg', labelEvery: 0 }, { choices: side }),
  fx('compare-measures', 1, 'Which sack is lighter? Tap it.', 'left', { type: 'measure', gauge: 'balance', values: [2, 6], max: 10, step: 1, unit: 'kg', labelEvery: 0 }, { choices: side }),
  fx('compare-measures', 2, 'Which jug is more full? Tap it.', 'right', { type: 'measure', gauge: 'jug', values: [3, 8], max: 10, step: 1, unit: 'l', labelEvery: 0 }, { choices: side }),
  fx('compare-measures', 3, 'Which cave is hotter? Tap it.', 'left', { type: 'measure', gauge: 'thermometer', values: [35, 10], max: 50, step: 5, unit: '°C', labelEvery: 0 }, { choices: side }),
  fx('compare-measures', 4, 'Tap the sacks from lightest to heaviest.', '2,0,1', { type: 'measure', gauge: 'balance', values: [4, 9, 2], max: 10, step: 1, unit: 'kg', labelEvery: 0 }),
  fx('compare-measures', 4, 'Tap the jugs from most full to least full.', '1,2,0', { type: 'measure', gauge: 'jug', values: [2, 9, 5], max: 10, step: 1, unit: 'l', labelEvery: 0 }),
  fx('compare-measures', 4, 'Tap the caves from coldest to hottest.', '0,2,1', { type: 'measure', gauge: 'thermometer', values: [5, 40, 20], max: 50, step: 5, unit: '°C', labelEvery: 0 }),
  // Read the scale.
  fx('read-scales', 1, 'The sack of gold is on the scale. How many kilograms?', 6, { type: 'measure', gauge: 'dial', values: [6], max: 10, step: 1, unit: 'kg', labelEvery: 1 }, { text: '? kg', choices: [5, 6, 7, 8] }),
  fx('read-scales', 2, 'The goblins made soup. How many litres of soup?', 6, { type: 'measure', gauge: 'jug', values: [6], max: 10, step: 2, unit: 'l', labelEvery: 1 }, { text: '? litres', choices: [4, 6, 8, 10] }),
  fx('read-scales', 3, 'This is the goblins’ cave. How many degrees?', 30, { type: 'measure', gauge: 'thermometer', values: [30], max: 50, step: 10, unit: '°C', labelEvery: 1 }, { text: '? °C', choices: [10, 20, 30, 40] }),
  fx('read-scales', 4, 'Not every mark has a number. How many litres?', 14, { type: 'measure', gauge: 'jug', values: [14], max: 20, step: 2, unit: 'l', labelEvery: 5 }, { text: '? litres', choices: [12, 14, 16, 10] }),
];
