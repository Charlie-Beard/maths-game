/**
 * The grown-ups' gate: a times-table or division sum (6 × 8, 54 ÷ 6) that
 * a grown-up answers in a moment and a six-year-old can't, yet.
 */
import { makeRand, randomSeed, type Rand } from './random';

export interface Sum {
  text: string;
  answer: number;
}

/** Picks a sum. Without a `Rand`, one is seeded from the clock. */
export function makeSum(r: Rand = makeRand(randomSeed())): Sum {
  // No 1s, 2s, 5s or 10s: the game teaches those, so he might know them.
  const a = r.int(6, 9);
  const b = r.int(6, 9);
  return r.chance(0.5) ? { text: `${a} × ${b}`, answer: a * b } : { text: `${a * b} ÷ ${a}`, answer: b };
}
