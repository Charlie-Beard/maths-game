/**
 * Hand-made example problems for workstream W2c's activities, so they can
 * be built and tested before the generators exist. Shown by the dev page
 * ?scene=fixtures&kind=<activity kind>.
 *
 * Two sets: one problem per way of playing clock, coins and shape, and one
 * `choose` problem per Visual kind (so ?scene=fixtures&kind=choose, or no
 * kind at all, shows every picture visual.ts can draw).
 *
 * The answer conventions the activities understand (for the generators):
 *
 *   clock  read: `choices` are time strings ("half past 3" or "3:30");
 *               the answer is one of them. The visual is the time shown.
 *          set:  no `choices`. The answer is the time to set, as words
 *               ("quarter to 4") or "H:MM"; the visual is where the hands
 *               start (12 o'clock is fine).
 *   coins  count: `choices` are amounts in pence (numbers, shown as "12p")
 *               or money strings ("12p", "£1"); visual.coins are the coins.
 *          know: visual.coins is empty and every choice is a coin value:
 *               the choices are drawn as coins ("tap the 50p").
 *          pay:  visual.target is the price and there are no `choices`;
 *               visual.coins are the coins in the purse (one of each,
 *               unlimited). The answer is the amount (number or "15p").
 *   shape  name: visual is the shape; `choices` are ShapeIds.
 *          find: visual is not a shape (use 'none'); `choices` are ShapeIds,
 *               drawn as shapes; the answer is the one to tap.
 *          sides: visual is the shape and the answer is a number.
 */
import type { Answer, Problem, Visual } from '../core/problem';
import type { SkillId } from '../core/skills';

let n = 0;
const fx = (skill: SkillId, activity: Problem['activity'], say: string, answer: Answer, visual: Visual, extra: Partial<Problem> = {}): Problem => ({
  skill,
  tier: 1,
  activity,
  say: { text: say },
  answer,
  visual,
  explain: { text: `It is ${String(answer)}.` },
  key: `fixture-c:${(n += 1)}`,
  ...extra,
});

/** One per way of playing clock, coins and shape. */
const ACTIVITIES: Problem[] = [
  fx('time', 'clock', 'What time does the clock say?', '3 o’clock', { type: 'clock', hour: 3, minute: 0 }, { choices: ['3 o’clock', '12 o’clock', '9 o’clock'] }),
  fx('time', 'clock', 'What time does the clock say?', 'half past 7', { type: 'clock', hour: 7, minute: 30 }, { tier: 2, choices: ['half past 6', 'half past 7', '7 o’clock', 'half past 8'] }),
  fx('time', 'clock', 'What time is it?', 'quarter to 4', { type: 'clock', hour: 3, minute: 45 }, { tier: 4, choices: ['quarter past 4', 'quarter to 4', 'quarter to 3'] }),
  fx('time', 'clock', 'Set the clock to 4 o’clock.', '4 o’clock', { type: 'clock', hour: 12, minute: 0 }, { text: '4 o’clock' }),
  fx('time', 'clock', 'Set the clock to half past 2.', 'half past 2', { type: 'clock', hour: 12, minute: 0 }, { tier: 2, text: 'half past 2' }),
  fx('time', 'clock', 'Set the clock to quarter past 9.', '9:15', { type: 'clock', hour: 12, minute: 0 }, { tier: 3, text: 'quarter past 9' }),
  fx('time', 'clock', 'Set the clock to 20 past 5.', '20 past 5', { type: 'clock', hour: 12, minute: 0 }, { tier: 5, text: '20 past 5' }),

  fx('coins', 'coins', 'Which coin is the 50p?', 50, { type: 'coins', coins: [] }, { choices: [10, 50, 20, 2] }),
  fx('coins', 'coins', 'How much money is here?', 8, { type: 'coins', coins: [5, 2, 1] }, { tier: 2, choices: [3, 7, 8, 9] }),
  fx('coins', 'coins', 'How much money is here?', '60p', { type: 'coins', coins: [20, 20, 10, 10] }, { tier: 4, choices: ['40p', '50p', '60p', '70p'] }),
  fx('coins', 'coins', 'The toy soldier costs 13p. Pay for it.', 13, { type: 'coins', coins: [1, 2, 5, 10], target: 13 }, { tier: 3 }),
  fx('coins', 'coins', 'The teddy costs 80p. Pay for it.', '80p', { type: 'coins', coins: [10, 20, 50], target: 80 }, { tier: 4 }),
  fx('coins', 'coins', 'How much money is here?', '£3.50', { type: 'coins', coins: [200, 100, 50] }, { tier: 4, choices: ['£3', '£3.50', '£2.50'] }),

  fx('shapes-2d', 'shape', 'What shape is this?', 'triangle', { type: 'shape', shape: 'triangle' }, { choices: ['circle', 'triangle', 'square'] }),
  fx('shapes-2d', 'shape', 'What shape is this? It is upside down!', 'rectangle', { type: 'shape', shape: 'rectangle', turned: 160 }, { tier: 2, choices: ['square', 'rectangle', 'oval', 'triangle'] }),
  fx('shapes-2d', 'shape', 'Tap the square.', 'square', { type: 'none' }, { tier: 2, choices: ['triangle', 'square', 'circle', 'rectangle'] }),
  fx('shapes-2d', 'shape', 'Tap the hexagon.', 'hexagon', { type: 'none' }, { tier: 3, choices: ['pentagon', 'hexagon', 'star'] }),
  fx('shapes-2d', 'shape', 'How many sides does this shape have?', 5, { type: 'shape', shape: 'pentagon', turned: 20 }, { tier: 3, choices: [4, 5, 6] }),
];

/** One `choose` problem per Visual kind, to see every picture. */
const VISUALS: Problem[] = [
  fx('add-5', 'choose', 'How many altogether?', 7, { type: 'objects', groups: [{ prop: 'acorn', count: 4 }, { prop: 'acorn', count: 3 }], op: '+' }, { text: '4 + 3 = ?', choices: [6, 7, 8] }),
  fx('count-10', 'choose', 'How many toffees?', 9, { type: 'objects', groups: [{ prop: 'toffee', count: 9 }], layout: 'scatter' }, { choices: [8, 9, 10] }),
  fx('sub-10', 'choose', 'How many are left?', 5, { type: 'objects', groups: [{ prop: 'apple', count: 8, gone: 3 }], op: '-' }, { text: '8 − 3 = ?', choices: [4, 5, 6] }),
  fx('subitise', 'choose', 'How many dots?', 5, { type: 'dots', count: 5, pattern: 'dice' }, { choices: [4, 5, 6] }),
  fx('subitise', 'choose', 'How many dots?', 9, { type: 'dots', count: 9, pattern: 'dice' }, { choices: [8, 9, 10] }),
  fx('subitise', 'choose', 'How many dots?', 7, { type: 'dots', count: 7, pattern: 'frame' }, { choices: [6, 7, 8] }),
  fx('add-10', 'choose', 'How many now?', 8, { type: 'tenFrame', frames: [6], add: 2, prop: 'popBiscuit' }, { text: '6 + 2 = ?', choices: [7, 8, 9] }),
  fx('add-20', 'choose', 'How many?', 14, { type: 'tenFrame', frames: [10, 4] }, { choices: [13, 14, 15] }),
  fx('sub-10', 'choose', 'How many left?', 4, { type: 'tenFrame', frames: [7], remove: 3 }, { text: '7 − 3 = ?', choices: [3, 4, 5] }),
  fx('one-more', 'choose', 'One more than 6?', 7, { type: 'numberLine', from: 0, to: 10, start: 6, marks: [7] }, { choices: [5, 7, 8] }),
  fx('count-10s', 'choose', 'What comes after 40?', 50, { type: 'numberLine', from: 0, to: 100, start: 40, step: 10 }, { choices: [41, 50, 60] }),
  fx('part-whole-10', 'choose', 'What is the missing part?', 3, { type: 'partWhole', whole: 8, parts: [5, null], model: 'cherry' }, { choices: [2, 3, 4] }),
  fx('part-whole-10', 'choose', 'What is the missing part?', 6, { type: 'partWhole', whole: 10, parts: [null, 4], model: 'bar' }, { choices: [5, 6, 7] }),
  fx('part-whole-10', 'choose', 'What is the whole?', 9, { type: 'partWhole', whole: null, parts: [2, 3, 4], model: 'cherry' }, { choices: [8, 9, 10] }),
  fx('compare-10', 'choose', 'Which side has more?', 'left', { type: 'compare', left: 7, right: 4, asObjects: 'saucepan' }, { choices: ['left', 'right'] }),
  fx('compare-100', 'choose', 'Which sign goes in the middle?', '>', { type: 'compare', left: 42, right: 24 }, { choices: ['<', '>', '='] }),
  fx('tens-ones', 'choose', 'What number is this?', 34, { type: 'tensOnes', tens: 3, ones: 4 }, { choices: [34, 43, 7] }),
  fx('tens-ones', 'choose', 'What number is this?', 97, { type: 'tensOnes', tens: 9, ones: 7 }, { choices: [97, 79, 16] }),
  fx('groups', 'choose', 'How many soldiers?', 6, { type: 'groups', groups: 3, each: 2, layout: 'groups', prop: 'soldier' }, { text: '2 + 2 + 2 = ?', choices: [5, 6, 8] }),
  fx('arrays', 'choose', 'How many cushions?', 15, { type: 'groups', groups: 3, each: 5, layout: 'array', prop: 'cushion' }, { text: '3 × 5 = ?', choices: [12, 15, 18] }),
  fx('share', 'choose', 'Share the snowballs between 3. How many each?', 4, { type: 'share', total: 12, between: 3, prop: 'snowball' }, { choices: [3, 4, 6] }),
  fx('fractions', 'choose', 'Is half of the ice-pie shaded?', 'yes', { type: 'fraction', shape: 'circle', parts: 2, shaded: 1 }, { choices: ['yes', 'no'] }),
  fx('fractions', 'choose', 'Is a quarter shaded?', 'no', { type: 'fraction', shape: 'rect', parts: 4, shaded: 1, equal: false }, { choices: ['yes', 'no'] }),
  fx('fractions', 'choose', 'How many thirds are shaded?', 2, { type: 'fraction', shape: 'circle', parts: 3, shaded: 2 }, { choices: [1, 2, 3] }),
  fx('time', 'choose', 'What hour is it?', 5, { type: 'clock', hour: 5, minute: 0 }, { choices: [4, 5, 6] }),
  fx('coins', 'choose', 'How much?', 17, { type: 'coins', coins: [10, 5, 2] }, { choices: [15, 17, 19] }),
  fx('coins', 'choose', 'Which coins pay 7p?', 7, { type: 'coins', coins: [5, 2], target: 7 }, { choices: [6, 7] }),
  fx('shapes-2d', 'choose', 'How many sides?', 6, { type: 'shape', shape: 'hexagon', turned: 15 }, { choices: [5, 6, 8] }),
  fx('measure-length', 'choose', 'Which ribbon is longer?', 'red', { type: 'length', lengths: [7, 4], unit: 'footsteps' }, { choices: ['red', 'blue'] }),
  fx('measure-length', 'choose', 'How many footsteps long?', 5, { type: 'length', lengths: [5], unit: 'footsteps' }, { choices: [4, 5, 6] }),
  fx('measure-length', 'choose', 'How long is the ribbon?', 9, { type: 'length', lengths: [9], unit: 'cm' }, { choices: [8, 9, 10] }),
  fx('measure-length', 'choose', 'How much longer is red than blue?', 4, { type: 'length', lengths: [10, 6], unit: 'cm' }, { choices: [3, 4, 6] }),
];

export const FIXTURES_C: Problem[] = [...ACTIVITIES, ...VISUALS];
