/**
 * Pieces shared by the adding and taking-away generators (workstream W1b):
 * written sums, the spoken question and read-back, and the Folk who appear
 * in story-style questions.
 *
 * Written sums keep one exact shape, `a + b = ?`, `a + ? = c` or
 * `? − b = c`, with spaces and a real minus sign (−), so the screen, the
 * voice and the tests all read them the same way.
 */
import type { Speech } from '../../problem';
import type { Rand } from '../../random';
import { FOLK } from '../helpers';
import type { PropId } from '../../problem';

export type Op = '+' | '−';

/** "8 + 5 = ?", "8 + ? = 13", "? − 5 = 8". Pass '?' for the missing number. */
export const sumText = (a: number | '?', op: Op, b: number | '?', c: number | '?'): string => `${a} ${op} ${b} = ${c}`;

/** The plain spoken question for a sum with nothing missing. */
export const askSum = (a: number, op: Op, b: number): Speech =>
  op === '+' ? { text: 'What is {a} add {b}?', vals: { a, b } } : { text: 'What is {a} take away {b}?', vals: { a, b } };

/** The read-back after a right answer: "4 add 3 makes 7!" / "9 take away 4 leaves 5!". */
export const explainSum = (a: number, op: Op, b: number, c: number): Speech =>
  op === '+' ? { text: '{a} add {b} makes {c}!', vals: { a, b, c } } : { text: '{a} take away {b} leaves {c}!', vals: { a, b, c } };

export const apply = (a: number, op: Op, b: number): number => (op === '+' ? a + b : a - b);

/** Tens and ones of a number. */
export const tensOf = (n: number): number => Math.floor(n / 10);
export const onesOf = (n: number): number => n % 10;

/** Does a + b, or a − b, go past a multiple of ten (into a new ten)? */
export const crossesTen = (a: number, op: Op, b: number): boolean =>
  op === '+' ? onesOf(a) + onesOf(b) >= 10 : onesOf(a) < onesOf(b);

/** A count split across ten frames: 13 → [10, 3]; 7 → [7]; `slots` pads with empty frames. */
export function framesFor(n: number, slots = 1): number[] {
  const out: number[] = [];
  let left = n;
  while (left > 0 || out.length < slots) {
    out.push(Math.min(10, left));
    left -= Math.min(10, left);
  }
  return out;
}

export type Folk = (typeof FOLK)[number];

/** How to talk about each of the Folk in a story. */
const PRONOUN: Record<Folk, 'he' | 'she'> = {
  'Moon-Face': 'he',
  Silky: 'she',
  'the Saucepan Man': 'he',
  'Dame Washalot': 'she',
  'Mr Watzisname': 'he',
  'the Angry Pixie': 'he',
};

export const he = (who: Folk): string => PRONOUN[who];
export const him = (who: Folk): string => (PRONOUN[who] === 'he' ? 'him' : 'her');
/** "the Saucepan Man" → "The Saucepan Man", for the start of a sentence. */
export const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** Two different Folk. */
export function twoFolk(r: Rand): [Folk, Folk] {
  const [a, b] = r.shuffle(FOLK);
  return [a, b];
}

/** Props that make sense in little stories (things you can have, give, eat or drop). */
export const STORY_PROPS: readonly PropId[] = ['popBiscuit', 'toffee', 'acorn', 'apple', 'googleBun', 'cushion', 'teacup', 'saucepan', 'balloon', 'present', 'star', 'button'];

/** Food, for stories about eating. */
export const FOOD_PROPS: readonly PropId[] = ['popBiscuit', 'toffee', 'apple', 'googleBun', 'jelly'];
