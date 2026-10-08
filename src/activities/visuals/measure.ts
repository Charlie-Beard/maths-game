/**
 * The `measure` visual (land 14, the Red Goblins): a balance of gold sacks,
 * a kitchen scale dial (kg), a jug of goblin soup (litres) or a thermometer
 * (°C), drawn in torn paper with big marks and numbers.
 *
 * How the fields are used (the generators in core/generators/l14.ts follow
 * this, and so can a story that wants one of these on stage):
 *
 * - **One value** is a reading: the pointer, the liquid or the mercury sits
 *   exactly on a mark. `step` is the gap between marks, `max` the top, and
 *   `labelEvery` how many marks there are for each written number (1 = every
 *   mark has its number; 2 = a number on every other mark). A reading is
 *   always drawn on a cream panel, so the numbers stay clear of the backdrop.
 * - **Two or three values** are things to compare, and he taps one of them
 *   (see activities/measure.ts). `labelEvery: 0` draws no marks and no
 *   numbers at all, so only the levels tell the story. A balance with two
 *   values is a real balance: the heavier sack hangs lower. A balance with
 *   three values is three sacks on a shelf, each with its weight on a tag.
 *
 * Everything holds still. `measureItems` says where each comparable thing is
 * (in the same box), so an activity can lay tap targets over them.
 */
import { C } from '../../art/palette';
import { circle, curve, ellipse, piece, poly, raw, rect, type Node, type Pt } from '../../art/paper';
import type { Visual } from '../../core/problem';
import { label } from '../visual';

export type MeasureVisual = Extract<Visual, { type: 'measure' }>;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const line = (x1: number, y1: number, x2: number, y2: number, color: string, width: number): Node =>
  raw(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`);

/** The point at distance r from (cx, cy), at `deg` clockwise from 12 o'clock. */
const polar = (cx: number, cy: number, r: number, deg: number): Pt => {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
};

/** The marks of a gauge: each value, and whether it carries a number. */
export function marksOf(v: MeasureVisual): { value: number; numbered: boolean }[] {
  const every = v.labelEvery ?? 1;
  if (every <= 0 || v.step <= 0) return [];
  const out: { value: number; numbered: boolean }[] = [];
  for (let i = 0; i * v.step <= v.max + 1e-9; i++) out.push({ value: i * v.step, numbered: i % every === 0 });
  return out;
}

/** The unit as it is written on the gauge. */
export const unitLabel = (u: MeasureVisual['unit']): string => (u === 'l' ? 'litres' : u);

// ---------------------------------------------------------------------------
// A sack of gold
// ---------------------------------------------------------------------------

/** How big a sack is drawn. Not tied to its weight, so size is no clue to heaviness. */
export const sackScale = (value: number, i: number): number => 0.92 + ((value * 7 + i * 5) % 4) * 0.06;

/** A sack of gold standing on y = baseY, centred on cx. About 100 × 120 at scale 1. */
export function sackNodes(cx: number, baseY: number, s: number): Node[] {
  const P = (x: number, y: number): Pt => [cx + x * s, baseY + y * s];
  const body = curve(
    [P(-16, -84), P(-36, -60), P(-54, -24), P(-52, -2), P(-30, 8), P(30, 8), P(52, -2), P(54, -24), P(36, -60), P(16, -84)],
    3,
  );
  return [
    piece(body, C.tan, { edge: 'torn', rough: 0.6 }),
    piece(poly([P(-16, -84), P(-34, -112), P(-10, -98), P(0, -116), P(10, -98), P(34, -112), P(16, -84)]), C.tan, { edge: 'cut', shadow: false }),
    piece(rect(cx - 22 * s, baseY - 92 * s, 44 * s, 12 * s, 5 * s), C.red, { edge: 'cut' }),
    piece(circle(cx, baseY - 38 * s, 21 * s), C.gold, { edge: 'cut' }),
    piece(circle(cx, baseY - 38 * s, 13 * s), C.goldLight, { edge: 'clean', shadow: false }),
  ];
}

// ---------------------------------------------------------------------------
// Balance
// ---------------------------------------------------------------------------

const PIVOT_Y = 60;
const ARM = 250;
const HANG = 175;

/** How far the beam tilts (degrees; positive = right side down) for these two weights. */
export function balanceTilt(a: number, b: number): number {
  const d = Math.min(10, 5 + Math.abs(b - a) * 0.8);
  return b > a ? d : b < a ? -d : 0;
}

function balancePans(v: MeasureVisual, w: number): { tilt: number; pans: { x: number; y: number }[] } {
  const tilt = balanceTilt(v.values[0], v.values[1]);
  const a = (tilt * Math.PI) / 180;
  const cx = w / 2;
  return {
    tilt,
    pans: [
      { x: cx - ARM * Math.cos(a), y: PIVOT_Y - ARM * Math.sin(a) + HANG },
      { x: cx + ARM * Math.cos(a), y: PIVOT_Y + ARM * Math.sin(a) + HANG },
    ],
  };
}

function balanceNodes(v: MeasureVisual, w: number): Node[] {
  const cx = w / 2;
  const { pans } = balancePans(v, w);
  const nodes: Node[] = [
    piece(rect(cx - 9, PIVOT_Y, 18, 280, 4), C.barkLight, { edge: 'cut' }),
    piece(rect(cx - 105, 332, 210, 22, 8), C.barkDark, { edge: 'cut' }),
  ];
  const ends = [
    [pans[0].x, pans[0].y - HANG],
    [pans[1].x, pans[1].y - HANG],
  ];
  nodes.push(piece(poly([[ends[0][0], ends[0][1] - 8], [ends[1][0], ends[1][1] - 8], [ends[1][0], ends[1][1] + 8], [ends[0][0], ends[0][1] + 8]]), C.wood, { edge: 'cut' }));
  pans.forEach((p, i) => {
    const [ex, ey] = ends[i];
    nodes.push(line(ex, ey, p.x - 100, p.y, C.greyDark, 4), line(ex, ey, p.x + 100, p.y, C.greyDark, 4));
    nodes.push(...sackNodes(p.x, p.y, sackScale(v.values[i], i)));
    nodes.push(piece(poly([[p.x - 115, p.y - 2], [p.x + 115, p.y - 2], [p.x + 82, p.y + 24], [p.x - 82, p.y + 24]]), C.stone, { edge: 'cut' }));
    nodes.push(piece(rect(p.x - 115, p.y - 6, 230, 8, 3), C.stoneLight, { edge: 'clean', shadow: false }));
  });
  nodes.push(piece(circle(cx, PIVOT_Y, 17), C.gold, { edge: 'cut' }), piece(circle(cx, PIVOT_Y, 8), C.goldLight, { edge: 'clean', shadow: false }));
  return nodes;
}

/** Three sacks on a shelf, each with its weight on a tag. */
function sacksOnShelf(v: MeasureVisual, w: number): Node[] {
  const n = v.values.length;
  const nodes: Node[] = [piece(rect(30, 262, w - 60, 20, 6), C.wood, { edge: 'cut' }), piece(rect(30, 282, w - 60, 8, 3), C.barkDark, { edge: 'clean', shadow: false })];
  v.values.forEach((val, i) => {
    const cx = (w * (i + 0.5)) / n;
    nodes.push(...sackNodes(cx, 266, sackScale(val, i) * 1.25));
    nodes.push(piece(rect(cx - 62, 296, 124, 52, 12), C.cream, { edge: 'cut' }), label(cx, 323, `${val} kg`, 36));
  });
  return nodes;
}

// ---------------------------------------------------------------------------
// Jug of goblin soup
// ---------------------------------------------------------------------------

const JUG_TOP = 26;
const JUG_BOTTOM = 338;
const JUG_FLOOR = 326;
const JUG_CEIL = 46;

/** One jug, its glass centred on cx, filled to `level` (in the gauge's own units). */
function jugNodes(v: MeasureVisual, cx: number, width: number, level: number, marked: boolean): Node[] {
  const left = cx - width / 2;
  const yOf = (val: number) => JUG_FLOOR - (val / v.max) * (JUG_FLOOR - JUG_CEIL);
  const yl = yOf(level);
  const nodes: Node[] = [
    // The handle first, so the glass sits over its ends.
    piece(
      [
        [cx + width / 2 - 6, JUG_TOP + 40],
        [cx + width / 2 + 46, JUG_TOP + 62],
        [cx + width / 2 + 48, JUG_TOP + 150],
        [cx + width / 2 - 6, JUG_TOP + 190],
        [cx + width / 2 - 6, JUG_TOP + 168],
        [cx + width / 2 + 24, JUG_TOP + 140],
        [cx + width / 2 + 24, JUG_TOP + 76],
        [cx + width / 2 - 6, JUG_TOP + 62],
      ],
      C.stoneLight,
      { edge: 'cut' },
    ),
    piece(rect(left, JUG_TOP, width, JUG_BOTTOM - JUG_TOP, 16), C.white, { edge: 'cut' }),
    piece(rect(left + 8, yl, width - 16, JUG_FLOOR + 6 - yl, 8), C.moss, { edge: 'clean', shadow: false }),
    piece(rect(left + 8, yl, width - 16, 7, 3), C.leafLight, { edge: 'clean', shadow: false }),
    piece(rect(left - 8, JUG_TOP - 8, width + 16, 16, 6), C.stoneLight, { edge: 'cut' }),
  ];
  if (marked) {
    for (const m of marksOf(v)) {
      const y = yOf(m.value);
      nodes.push(line(left + 4, y, left + 4 + (m.numbered ? 34 : 20), y, C.ink, m.numbered ? 5 : 3.5));
      if (m.numbered) nodes.push(label(left - 14, y, String(m.value), 32, C.ink, { anchor: 'end' }));
    }
  }
  return nodes;
}

// ---------------------------------------------------------------------------
// Thermometer
// ---------------------------------------------------------------------------

const T_TOP = 24;
const T_BULB_Y = 308;
const T_ZERO = 270;
const T_MAX = 52;

/** One thermometer, its tube centred on cx, with the mercury at `level`. */
function thermNodes(v: MeasureVisual, cx: number, level: number, marked: boolean): Node[] {
  const yOf = (val: number) => T_ZERO - (val / v.max) * (T_ZERO - T_MAX);
  const yl = yOf(level);
  const nodes: Node[] = [
    piece(circle(cx, T_BULB_Y, 37), C.cream, { edge: 'cut' }),
    piece(rect(cx - 27, T_TOP, 54, T_BULB_Y - T_TOP, 27), C.cream, { edge: 'cut', shadow: false }),
    piece(rect(cx - 14, T_TOP + 14, 28, T_BULB_Y - T_TOP - 14, 14), C.white, { edge: 'clean', shadow: false }),
    piece(circle(cx, T_BULB_Y, 27), C.redDark, { edge: 'clean', shadow: false }),
    piece(rect(cx - 9, yl, 18, T_BULB_Y - yl, 4), C.red, { edge: 'clean', shadow: false }),
    piece(circle(cx, T_BULB_Y, 24), C.red, { edge: 'clean', shadow: false }),
    piece(circle(cx - 8, T_BULB_Y - 8, 6), C.pink, { edge: 'clean', shadow: false, opacity: 0.7 }),
  ];
  if (marked) {
    for (const m of marksOf(v)) {
      const y = yOf(m.value);
      nodes.push(line(cx + 31, y, cx + 31 + (m.numbered ? 36 : 22), y, C.ink, m.numbered ? 5 : 3.5));
      if (m.numbered) nodes.push(label(cx + 31 + 36 + 10, y, String(m.value), 32, C.ink, { anchor: 'start' }));
    }
  }
  return nodes;
}

// ---------------------------------------------------------------------------
// Kitchen scale dial
// ---------------------------------------------------------------------------

const DIAL = { cx: 500, cy: 182, bezel: 170, face: 163, tickOut: 128, longIn: 108, shortIn: 117, numbers: 151, needle: 124 };
const SWEEP = 135;

/** The angle (degrees from 12 o'clock) of a value: 0 at lower left, max at lower right. */
export const dialAngle = (val: number, max: number): number => -SWEEP + (val / max) * 2 * SWEEP;

function dialNodes(v: MeasureVisual): Node[] {
  const { cx, cy } = DIAL;
  const val = v.values[0];
  const nodes: Node[] = [
    // The tray and its sack, on a stand.
    piece(rect(176, 270, 24, 70, 4), C.stone, { edge: 'cut' }),
    piece(rect(70, 332, 236, 18, 6), C.greyDark, { edge: 'cut' }),
    ...sackNodes(138, 266, 1.25),
    piece(ellipse(138, 276, 110, 16), C.stone, { edge: 'cut' }),
    // The scale: body, bezel and face.
    piece(rect(cx - 205, 8, 410, 344, 40), C.teal, { edge: 'torn', rough: 0.7 }),
    piece(circle(cx, cy, DIAL.bezel), C.stoneLight, { edge: 'cut' }),
    piece(circle(cx, cy, DIAL.face), C.white, { edge: 'clean', shadow: false }),
  ];
  for (const m of marksOf(v)) {
    const deg = dialAngle(m.value, v.max);
    const [x1, y1] = polar(cx, cy, m.numbered ? DIAL.longIn : DIAL.shortIn, deg);
    const [x2, y2] = polar(cx, cy, DIAL.tickOut, deg);
    nodes.push(line(x1, y1, x2, y2, C.ink, m.numbered ? 5 : 3.5));
    if (m.numbered) {
      const [lx, ly] = polar(cx, cy, DIAL.numbers, deg);
      nodes.push(label(lx, ly, String(m.value), 32));
    }
  }
  nodes.push(label(cx, cy + 66, unitLabel(v.unit), 34, C.slate));
  // The pointer: a long red wedge with a short tail.
  const deg = dialAngle(val, v.max);
  const tip = polar(cx, cy, DIAL.needle, deg);
  const tail = polar(cx, cy, -26, deg);
  const l = polar(cx, cy, 9, deg - 90);
  const r = polar(cx, cy, 9, deg + 90);
  nodes.push(piece(poly([tip, l, tail, r]), C.red, { edge: 'clean' }), piece(circle(cx, cy, 15), C.redDark, { edge: 'cut' }), piece(circle(cx, cy, 6), C.goldLight, { edge: 'clean', shadow: false }));
  return nodes;
}

// ---------------------------------------------------------------------------
// The whole picture
// ---------------------------------------------------------------------------

const isReading = (v: MeasureVisual): boolean => v.values.length === 1;

/** Where each of the things to compare is (same box as the drawing), left to right. Empty for a reading. */
export function measureItems(v: MeasureVisual, w: number, _hgt: number): Box[] {
  const n = v.values.length;
  if (n < 2) return [];
  if (v.gauge === 'balance' && n === 2) {
    return balancePans(v, w).pans.map((p) => ({ x: p.x - 120, y: p.y - 140, w: 240, h: 175 }));
  }
  return v.values.map((_, i) => {
    const cx = (w * (i + 0.5)) / n;
    if (v.gauge === 'balance') return { x: cx - 92, y: 130, w: 184, h: 225 };
    if (v.gauge === 'jug') return { x: cx - 105, y: 10, w: 210, h: 340 };
    return { x: cx - 90, y: 10, w: 140, h: 340 };
  });
}

export function measureNodes(v: MeasureVisual, w: number, _hgt: number): Node[] {
  const n = v.values.length;
  if (isReading(v)) {
    if (v.gauge === 'dial') return dialNodes(v);
    const nodes: Node[] = [piece(rect(w / 2 - 230, 4, 460, 352, 24), C.cream, { edge: 'torn', rough: 0.7 })];
    if (v.gauge === 'jug') {
      nodes.push(...jugNodes(v, w / 2 - 10, 200, v.values[0], true));
      nodes.push(label(w / 2 + 112, 300, 'litres', 34, C.slate, { anchor: 'start' }));
    } else {
      nodes.push(...thermNodes(v, w / 2 - 60, v.values[0], true));
      nodes.push(label(w / 2 - 60 - 40, T_MAX, '°C', 40, C.slate, { anchor: 'end' }));
    }
    return nodes;
  }
  if (v.gauge === 'balance') return n === 2 ? balanceNodes(v, w) : sacksOnShelf(v, w);
  const nodes: Node[] = [];
  v.values.forEach((val, i) => {
    const cx = (w * (i + 0.5)) / n;
    if (v.gauge === 'jug') nodes.push(...jugNodes(v, cx, n === 2 ? 190 : 150, val, (v.labelEvery ?? 1) > 0));
    else nodes.push(...thermNodes(v, cx - 20, val, (v.labelEvery ?? 1) > 0));
  });
  return nodes;
}
