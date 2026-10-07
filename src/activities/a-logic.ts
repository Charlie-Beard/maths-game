/**
 * Pure layout and rules for workstream W2a's activities (count, tenFrame,
 * numberLine, partWhole, numberPad). No DOM here, so it can be unit-tested:
 * the activity modules turn these numbers into paper.
 */
import type { Answer, Problem } from '../core/problem';

// ---------------------------------------------------------------------------
// Answer choices
// ---------------------------------------------------------------------------

/**
 * The number cards to show: the problem's own choices, or (if a generator
 * gave none) the answer with its neighbours, so every activity can always
 * fall back to cards.
 */
export function cardValues(p: Problem): Answer[] {
  if (p.choices && p.choices.length > 1) return p.choices;
  const a = Number(p.answer);
  if (!Number.isFinite(a)) return [p.answer];
  const near = a <= 0 ? [a, a + 1, a + 2] : [a - 1, a, a + 1];
  return near;
}

/** The wrong card that goes at help level 2: the one furthest from the answer. */
export function cardToDrop(values: Answer[], answer: Answer): Answer | null {
  const wrong = values.filter((v) => String(v) !== String(answer));
  if (wrong.length < 2) return null;
  const a = Number(answer);
  if (!Number.isFinite(a)) return wrong[0];
  return wrong.reduce((far, v) => (Math.abs(Number(v) - a) > Math.abs(Number(far) - a) ? v : far));
}

// ---------------------------------------------------------------------------
// count: where the objects go
// ---------------------------------------------------------------------------

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Spot {
  x: number;
  y: number;
  /** A small tilt in degrees, so scattered things look dropped, not printed. */
  rot: number;
}

export interface ObjectLayout {
  /** Size of each object (square), at least 72 so each is a tap target. */
  size: number;
  /** One list of spots per group, in counting order. */
  spots: Spot[][];
  /** Centre x of the + or − between groups. */
  ops: number[];
  /** The middle of the layout, vertically (for the op sign). */
  midY: number;
}

const OP_W = 64;
const GAP = 10;

/** A tiny repeatable random (mulberry32), so scatter is the same each time. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Lays out groups of objects in the picture box.
 *
 *   row:     neat rows, as big as fit
 *   fives:   rows of five (the "show me" layout: easy to see and count)
 *   scatter: dropped about on a loose grid with gaps, tilted a little
 *
 * Objects are as big as possible (up to 100) but never under 72.
 */
export function layoutObjects(counts: number[], mode: 'row' | 'scatter' | 'fives', box: Box, seed = 1): ObjectLayout {
  const groups = counts.length;
  const opsW = (groups - 1) * OP_W;
  // For each number of rows, the biggest size that fits. Take the fewest
  // rows that still give big objects (84+), else the biggest objects.
  let best: { size: number; rows: number; cols: number[] } | null = null;
  for (let rows = 1; rows <= 6; rows++) {
    const cols = counts.map((c) => (mode === 'fives' ? Math.min(5, Math.max(1, c)) : Math.max(1, Math.ceil(c / rows))));
    const rowsNeeded = counts.map((c, i) => Math.ceil(Math.max(1, c) / cols[i]));
    for (let size = 100; size >= 72; size -= 4) {
      const height = Math.max(...rowsNeeded) * (size + GAP) - GAP;
      const width = cols.reduce((s, c) => s + c * (size + GAP) - GAP, 0) + opsW + (groups - 1) * GAP * 2;
      if (width <= box.w && height <= box.h) {
        if (!best || size > best.size) best = { size, rows: Math.max(...rowsNeeded), cols };
        break;
      }
    }
    if (best && best.size >= 84) break;
    if (mode === 'fives') break;
  }
  // Nothing fits at 72: squeeze (only for very big counts, which generators don't make).
  if (!best) {
    const cols = counts.map((c) => Math.max(1, Math.ceil(c / 3)));
    best = { size: 72, rows: 3, cols };
  }
  const { size, cols } = best;
  const rand = seeded(seed);

  // Share the spare width between groups, so scatter can spread out.
  const tight = cols.map((c) => c * (size + GAP) - GAP);
  const spare = box.w - tight.reduce((a, b) => a + b, 0) - opsW;
  const widths = mode === 'scatter' ? tight.map((t) => t + Math.max(0, spare - groups * GAP * 2) / groups) : tight;
  const total = widths.reduce((a, b) => a + b, 0) + opsW + (groups - 1) * GAP * 2;
  let x = box.x + (box.w - total) / 2;
  const midY = box.y + box.h / 2;
  const spots: Spot[][] = [];
  const ops: number[] = [];

  counts.forEach((count, gi) => {
    const gw = widths[gi];
    const c = cols[gi];
    const rows = Math.ceil(Math.max(1, count) / c);
    const list: Spot[] = [];
    if (mode === 'scatter') {
      // A looser grid with one more row (if it fits) and more cells than
      // objects; pick cells at random and nudge each one inside its cell.
      const sRows = Math.min(rows + 1, Math.max(rows, Math.floor((box.h + GAP) / (size + GAP))));
      const sCols = Math.max(c, Math.min(Math.ceil(count / sRows) + 1, Math.floor((gw + GAP) / (size + GAP))));
      const cw = gw / sCols;
      const ch = Math.max(size, Math.min(box.h / sRows, size * 1.5));
      const top = midY - (sRows * ch) / 2;
      const cells = Array.from({ length: sRows * sCols }, (_, i) => i);
      for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [cells[i], cells[j]] = [cells[j], cells[i]];
      }
      for (let k = 0; k < count; k++) {
        const cell = cells[k];
        const cx = cell % sCols;
        const cy = Math.floor(cell / sCols);
        const jx = Math.max(0, cw - size) * (rand() - 0.5) * 0.8;
        const jy = Math.max(0, ch - size) * (rand() - 0.5) * 0.8;
        list.push({ x: x + cx * cw + (cw - size) / 2 + jx, y: top + cy * ch + (ch - size) / 2 + jy, rot: Math.round((rand() - 0.5) * 24) });
      }
    } else {
      const top = midY - (rows * (size + GAP) - GAP) / 2;
      for (let k = 0; k < count; k++) {
        const r = Math.floor(k / c);
        const inRow = Math.min(c, count - r * c);
        // Centre a short last row.
        const rowX = x + (gw - (inRow * (size + GAP) - GAP)) / 2;
        list.push({ x: rowX + (k % c) * (size + GAP), y: top + r * (size + GAP), rot: 0 });
      }
    }
    spots.push(list);
    x += gw;
    if (gi < groups - 1) {
      ops.push(x + GAP + OP_W / 2);
      x += OP_W + GAP * 2;
    }
  });
  return { size, spots, ops, midY };
}

// ---------------------------------------------------------------------------
// tenFrame: what kind of ten-frame problem is it?
// ---------------------------------------------------------------------------

export type TenFrameMode = 'fill' | 'add' | 'remove' | 'read';

/**
 * fill:   "how many more to make 10 (or 20)?": he taps counters into the
 *         empty cells and says done; the answer is how many he put in.
 * add:    counters wait in a tray; he taps each into the frame, then
 *         chooses the total.
 * remove: the counters to take away are marked; he taps each out, then
 *         chooses what's left.
 * read:   how many are there? He can tap counters to count, then chooses.
 */
export function tenFrameMode(p: Problem): TenFrameMode | null {
  const v = p.visual;
  if (v.type !== 'tenFrame') return null;
  if (v.add) return 'add';
  if (v.remove) return 'remove';
  const filled = v.frames.reduce((a, b) => a + b, 0);
  const cap = v.frames.length * 10;
  const ans = Number(p.answer);
  if (ans === cap - filled && (ans !== filled || /more|fill|make/i.test(p.say.text))) return 'fill';
  return 'read';
}

/** How many frames are needed: enough for the start and everything added. */
export function frameCount(frames: number[], add = 0): number {
  const total = frames.reduce((a, b) => a + b, 0) + add;
  return Math.max(frames.length, Math.ceil(total / 10), 1);
}

/** Cell indices (frame * 10 + cell) filled at the start. */
export function startCells(frames: number[]): number[] {
  const out: number[] = [];
  frames.forEach((n, f) => {
    for (let i = 0; i < Math.min(10, n); i++) out.push(f * 10 + i);
  });
  return out;
}

// ---------------------------------------------------------------------------
// numberLine: which stretch of the line to show
// ---------------------------------------------------------------------------

export interface LineWindow {
  /** Values of the marks shown, left to right. */
  marks: number[];
  /** Size of one hop. */
  unit: number;
}

/**
 * The marks to draw: every `unit` from `from` to `to`, or, if that's too
 * many to tap (each number needs 75–125 px), a window around the start and
 * the answer. Null if the start and answer don't both fit or aren't on a
 * mark (then the activity falls back to number cards).
 */
export function lineWindow(from: number, to: number, start: number, answer: number, step?: number): LineWindow | null {
  const unit = Math.abs(step ?? 1) || 1;
  const lo0 = Math.min(from, to);
  const hi0 = Math.max(from, to);
  if (![start, answer].every((n) => Number.isFinite(n) && n >= lo0 && n <= hi0 && (n - lo0) % unit === 0)) return null;
  // Each number must be a 64 px tap target: fewer rungs for longer numbers.
  // Two-digit numbers get more room when the hops are short (9 rungs, not 11).
  const lo = Math.min(start, answer);
  const hi = Math.max(start, answer);
  const span = (hi - lo) / unit + 1;
  const maxMarks = hi0 >= 100 ? 7 : hi0 > 10 ? Math.min(11, Math.max(9, span + 2)) : 11;
  const all = Math.floor((hi0 - lo0) / unit) + 1;
  if (all <= maxMarks) return { marks: Array.from({ length: all }, (_, i) => lo0 + i * unit), unit };
  if (span > maxMarks) return null;
  // Centre the start-to-answer stretch, with room to hop past it either way.
  let first = lo - Math.floor((maxMarks - span) / 2) * unit;
  first = Math.max(lo0, Math.min(first, hi0 - (maxMarks - 1) * unit));
  return { marks: Array.from({ length: maxMarks }, (_, i) => first + i * unit), unit };
}

// ---------------------------------------------------------------------------
// partWhole
// ---------------------------------------------------------------------------

export interface PartWholeShape {
  whole: number;
  parts: number[];
  /** Which is missing: -1 for the whole, else the part's index. */
  missing: number;
}

/** Fills in the missing number from the answer; null if it doesn't add up. */
export function partWholeShape(whole: number | null, parts: (number | null)[], answer: Answer): PartWholeShape | null {
  const ans = Number(answer);
  if (!Number.isFinite(ans)) return null;
  const gaps = (whole === null ? 1 : 0) + parts.filter((p) => p === null).length;
  if (gaps !== 1 || parts.length < 2) return null;
  if (whole === null) {
    const ps = parts as number[];
    return ps.reduce((a, b) => a + b, 0) === ans ? { whole: ans, parts: ps, missing: -1 } : null;
  }
  const missing = parts.indexOf(null);
  const filled = parts.map((p) => (p === null ? ans : p));
  return filled.reduce((a, b) => a + b, 0) === whole ? { whole, parts: filled, missing } : null;
}

// ---------------------------------------------------------------------------
// numberPad
// ---------------------------------------------------------------------------

/** Splits "4 + 3 = ?" into the text before and after the answer box. */
export function splitSum(text: string | undefined): { before: string; after: string } {
  if (!text) return { before: '', after: '' };
  const i = text.indexOf('?');
  if (i < 0) return { before: text.trim() + ' =', after: '' };
  return { before: text.slice(0, i).trimEnd(), after: text.slice(i + 1).trimStart() };
}

/** Typing a digit: no leading zeros, and at most `max` digits. */
export function typeDigit(typed: string, d: string, max: number): string {
  if (typed === '0') return d;
  if (typed.length >= max) return typed;
  return typed + d;
}
