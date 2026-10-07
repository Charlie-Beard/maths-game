/** Shared pieces for problem generators. */
import type { Answer, PropId } from '../problem';
import type { Rand } from '../random';

export type Generator = (tier: number, r: Rand) => import('../problem').Problem;

/** Prop names for speech: singular and plural. */
export const PROP_WORDS: Record<PropId, [string, string]> = {
  popBiscuit: ['pop biscuit', 'pop biscuits'],
  toffee: ['toffee shock', 'toffee shocks'],
  acorn: ['acorn', 'acorns'],
  saucepan: ['saucepan', 'saucepans'],
  toadstool: ['toadstool', 'toadstools'],
  apple: ['apple', 'apples'],
  cushion: ['cushion', 'cushions'],
  teacup: ['teacup', 'teacups'],
  hat: ['hat', 'hats'],
  googleBun: ['Google Bun', 'Google Buns'],
  jelly: ['jelly', 'jellies'],
  candle: ['candle', 'candles'],
  present: ['present', 'presents'],
  balloon: ['balloon', 'balloons'],
  stick: ['stick', 'sticks'],
  button: ['button', 'buttons'],
  potion: ['potion', 'potions'],
  star: ['star', 'stars'],
  soldier: ['toy soldier', 'toy soldiers'],
  teddy: ['teddy', 'teddies'],
  snowball: ['snowball', 'snowballs'],
  sledge: ['sledge', 'sledges'],
  icicle: ['icicle', 'icicles'],
  key: ['key', 'keys'],
};

export const propWord = (p: PropId, n: number): string => PROP_WORDS[p][n === 1 ? 0 : 1];

/** Who appears in story-style questions. */
export const FOLK = ['Moon-Face', 'Silky', 'the Saucepan Man', 'Dame Washalot', 'Mr Watzisname', 'the Angry Pixie'] as const;

/** Props that suit early counting (familiar, easy to draw distinctly). */
export const COUNTING_PROPS: readonly PropId[] = ['popBiscuit', 'toffee', 'acorn', 'saucepan', 'toadstool', 'apple', 'cushion', 'teacup'];

/**
 * Answer choices: the answer plus up to `count - 1` distractors, preferring
 * the likely mistakes in `likely` (off by one, wrong operation …), then
 * near neighbours. All within [min, max], all different, shuffled.
 */
export function choicesFor(answer: number, r: Rand, o: { count?: number; min?: number; max?: number; likely?: number[] } = {}): number[] {
  const count = o.count ?? 4;
  const min = o.min ?? 0;
  const max = o.max ?? 100;
  const out = new Set<number>([answer]);
  const ok = (n: number) => Number.isInteger(n) && n >= min && n <= max && !out.has(n);
  for (const n of r.shuffle(o.likely ?? [])) if (out.size < count && ok(n)) out.add(n);
  for (let d = 1; out.size < count && d <= max - min; d++) {
    for (const n of r.shuffle([answer - d, answer + d])) if (out.size < count && ok(n)) out.add(n);
  }
  return r.shuffle([...out]);
}

/** Choices for non-numeric answers (shapes, odd/even, < > =). */
export function choicesFrom<T extends Answer>(answer: T, options: readonly T[], r: Rand, count = options.length): T[] {
  const rest = r.shuffle(options.filter((o) => o !== answer)).slice(0, count - 1);
  return r.shuffle([answer, ...rest]);
}
