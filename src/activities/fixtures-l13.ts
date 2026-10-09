/**
 * Hand-made example problems for land 13's skills and pictures, shown by
 * the dev page ?scene=fixtures&kind=<activity kind>.
 *
 *   turn   answer 'up' | 'right' | 'down' | 'left' → arrow cards;
 *          'clockwise' | 'anticlockwise' → curved-arrow cards;
 *          a flag colour (visual has a grid) → tap the flag
 *   solid  answer a solid → "tap the cone" solid cards (visual none);
 *          a number → count on the big solid; a ShapeId → flat shape cards
 */
import type { Problem } from '../core/problem';

export const FIXTURES_L13: Problem[] = [
  // ---------------- turn ----------------
  {
    skill: 'turns',
    tier: 1,
    activity: 'turn',
    say: { text: 'The arrow points up. It turns a quarter turn, the way a clock goes. Which way does it point now?' },
    answer: 'right',
    choices: ['down', 'right', 'left'],
    visual: { type: 'turn', facing: 0, turn: 90, dir: 'cw' },
    explain: { text: 'The arrow turns a quarter turn clockwise. It points to the right!' },
    key: 'fx-turn:up:90:cw',
  },
  {
    skill: 'turns',
    tier: 2,
    activity: 'turn',
    say: { text: 'The arrow had a quarter turn. The faded arrow is where it started. Did it turn clockwise or anticlockwise?' },
    answer: 'anticlockwise',
    choices: ['clockwise', 'anticlockwise'],
    visual: { type: 'turn', facing: 0, turn: 90, dir: 'acw', show: 'before-after' },
    explain: { text: 'It went the other way to a clock’s hands. That is anticlockwise!' },
    key: 'fx-turn:which:up:acw',
  },
  {
    skill: 'turns',
    tier: 3,
    activity: 'turn',
    say: { text: 'The arrow points to the right. It turns three quarters of a turn anticlockwise. Which way does it point now?' },
    answer: 'down',
    choices: ['up', 'right', 'down', 'left'],
    visual: { type: 'turn', facing: 90, turn: 270, dir: 'acw' },
    explain: { text: 'The arrow turns three quarters of a turn anticlockwise. It points down!' },
    key: 'fx-turn:right:270:acw',
  },
  {
    skill: 'turns',
    tier: 4,
    activity: 'turn',
    say: { text: 'Start at the arrow. Follow the picture cards, one at a time. Which flag do you land on?' },
    answer: 'blue',
    choices: ['blue', 'gold', 'green', 'pink'],
    visual: {
      type: 'turn',
      facing: 0,
      moves: ['forward', 'right'],
      grid: {
        cols: 5,
        rows: 5,
        col: 2,
        row: 3,
        flags: [
          { id: 'blue', col: 3, row: 2 },
          { id: 'gold', col: 1, row: 2 },
          { id: 'green', col: 2, row: 1 },
          { id: 'pink', col: 4, row: 3 },
        ],
      },
    },
    explain: { text: 'Forwards is one step. Left and right are turns, not steps. You land on the blue flag!' },
    key: 'fx-turn:path:blue',
  },
  // ---------------- solid ----------------
  {
    skill: 'shapes-3d',
    tier: 1,
    activity: 'solid',
    say: { text: 'Tap the cone.' },
    answer: 'cone',
    choices: ['sphere', 'cone', 'cube'],
    visual: { type: 'none' },
    explain: { text: 'That is a cone, like a party hat!' },
    key: 'fx-solid:find:cone',
  },
  {
    skill: 'shapes-3d',
    tier: 2,
    activity: 'solid',
    say: { text: 'Tap the cuboid.' },
    answer: 'cuboid',
    choices: ['cube', 'pyramid', 'cuboid', 'cylinder'],
    visual: { type: 'none' },
    explain: { text: 'That is a cuboid, like a cereal box!' },
    key: 'fx-solid:find:cuboid',
  },
  {
    skill: 'shapes-3d',
    tier: 3,
    activity: 'solid',
    say: { text: 'How many flat faces does this cube have? Count them.' },
    answer: 6,
    choices: [4, 5, 6, 8],
    visual: { type: 'solid', solids: ['cube'], ask: 'faces' },
    explain: { text: 'A cube has {n} flat faces!', vals: { n: 6 } },
    key: 'fx-solid:faces:cube',
  },
  {
    skill: 'shapes-3d',
    tier: 4,
    activity: 'solid',
    say: { text: 'How many corners does this pyramid have? Corners are called vertices too.' },
    answer: 5,
    choices: [4, 5, 6, 8],
    visual: { type: 'solid', solids: ['pyramid'], ask: 'corners' },
    explain: { text: 'A pyramid has {n} corners, or vertices!', vals: { n: 5 } },
    key: 'fx-solid:corners:pyramid',
  },
  {
    skill: 'shapes-3d',
    tier: 5,
    activity: 'solid',
    say: { text: 'Look at the gold face of the cuboid. What flat shape is it?' },
    answer: 'rectangle',
    choices: ['square', 'rectangle', 'triangle', 'circle'],
    visual: { type: 'solid', solids: ['cuboid'], face: true },
    explain: { text: 'The gold face of the cuboid is a rectangle!' },
    key: 'fx-solid:face:cuboid',
  },
];
