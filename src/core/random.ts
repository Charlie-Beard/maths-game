/**
 * A seeded random source, so problems can be repeated exactly
 * (`?seed=…` in dev, and in tests).
 */
export interface Rand {
  /** 0 ≤ x < 1. */
  next(): number;
  /** A whole number from lo to hi inclusive. */
  int(lo: number, hi: number): number;
  /** One item from a non-empty list. */
  pick<T>(items: readonly T[]): T;
  /** A shuffled copy. */
  shuffle<T>(items: readonly T[]): T[];
  /** true with probability p. */
  chance(p: number): boolean;
}

/** mulberry32: small, fast and good enough for games. */
export function makeRand(seed: number): Rand {
  let s = seed >>> 0 || 0x9e3779b9;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r: Rand = {
    next,
    int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
    pick: (items) => items[Math.floor(next() * items.length)],
    shuffle: (items) => {
      const a = items.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    chance: (p) => next() < p,
  };
  return r;
}

/** A fresh seed from the clock (outside tests). */
export const randomSeed = (): number => (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
