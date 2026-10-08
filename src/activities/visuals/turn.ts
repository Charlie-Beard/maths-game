/**
 * The `turn` visual (land 13, Roundabouts): a big paper arrow on a round
 * carousel top. The arrow is the thing with a clear front (its point), so
 * "which way is it facing now?" has a picture.
 *
 * Three pictures, chosen by the Visual:
 *
 *   - `show: 'turn'` (default): the arrow, and a curved arrow round it for
 *     the turn it makes (clockwise or anticlockwise, a quarter, a half or
 *     three quarters), with a little pie showing how much of a circle.
 *   - `show: 'before-after'`: a faded arrow where it started and a bold one
 *     where it ended, with no curve (which way did it turn?).
 *   - a `grid`: a little paving path with the arrow on its start square,
 *     flags to land on, and the moves as picture cards (forwards, left,
 *     right). Left and right mean "turn a quarter that way, then step".
 *
 * Directions are degrees clockwise from up: 0 up, 90 right, 180 down,
 * 270 left. Exported helpers (`arrowAt`, `drawArrow`, `curveAt`,
 * `drawWayIcon`, `carouselAt`) can be reused by the land 13 stories.
 */
import { C } from '../../art/palette';
import { band, circle, piece, raw, rect, svg, type Node, type Pt } from '../../art/paper';
import type { TurnGrid, Visual } from '../../core/problem';
import { label } from '../visual';

type TurnVisual = Extract<Visual, { type: 'turn' }>;
type Move = 'forward' | 'left' | 'right';

export const DIR_NAMES = ['up', 'right', 'down', 'left'] as const;
export type DirName = (typeof DIR_NAMES)[number];

/** Degrees clockwise from up for a direction word. */
export const dirAngle = (d: string): number => Math.max(0, DIR_NAMES.indexOf(d as DirName)) * 90;

/** The direction word for an angle (any multiple of 90). */
export const dirName = (deg: number): DirName => DIR_NAMES[(((Math.round(deg / 90) % 4) + 4) % 4) as 0 | 1 | 2 | 3];

/** A point at `deg` (clockwise from up) and distance R from (cx, cy). */
const polar = (cx: number, cy: number, R: number, deg: number): Pt => {
  const a = (deg * Math.PI) / 180;
  return [cx + R * Math.sin(a), cy - R * Math.cos(a)];
};

const rotate = (pts: Pt[], cx: number, cy: number, deg: number): Pt[] => {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c] as Pt);
};

const pointsAttr = (pts: Pt[]): string => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

export interface TurnDrawOpts {
  /** Help: number the quarter turns along the curve / show the clock that goes clockwise. */
  steps?: boolean;
  clock?: boolean;
  /** Help (grid): the route as a dotted trail. */
  trail?: boolean;
  /** Drop these flags (help takes a wrong one away). */
  hideFlags?: string[];
}

// ---------------------------------------------------------------------------
// The arrow and the carousel top

/** A big paper arrow centred on (cx, cy), `size` long, pointing `deg` clockwise from up. */
export function arrowAt(cx: number, cy: number, size: number, deg: number, o: { fill?: string; ghost?: boolean } = {}): Node[] {
  const L = size;
  const base: Pt[] = (
    [
      [0, -0.5],
      [0.3, -0.06],
      [0.12, -0.06],
      [0.12, 0.5],
      [-0.12, 0.5],
      [-0.12, -0.06],
      [-0.3, -0.06],
    ] as Pt[]
  ).map(([x, y]) => [cx + x * L, cy + y * L] as Pt);
  const pts = rotate(base, cx, cy, deg);
  if (o.ghost) {
    return [raw(`<polygon points="${pointsAttr(pts)}" fill="${C.stoneLight}" fill-opacity="0.45" stroke="${C.greyDark}" stroke-width="4" stroke-dasharray="12 9" stroke-linejoin="round"/>`)];
  }
  return [
    piece(pts, o.fill ?? C.red, { edge: 'cut', rough: 0.4 }),
    raw(`<polygon points="${pointsAttr(pts)}" fill="none" stroke="${C.redDark}" stroke-width="3.5" stroke-linejoin="round"/>`),
  ];
}

/** One arrow as a square SVG (the answer cards). */
export function drawArrow(deg: number, size: number, o: { fill?: string } = {}): string {
  return svg({ w: size, h: size, name: `l13-arrow-${deg}`, label: 'An arrow' }, arrowAt(size / 2, size / 2, size * 0.82, deg, o));
}

/** A round carousel top seen from above: a gold rim and eight pale wedges. */
export function carouselAt(cx: number, cy: number, r: number): Node[] {
  const nodes: Node[] = [piece(circle(cx, cy, r), C.gold, { edge: 'cut', rough: 0.5 })];
  for (let i = 0; i < 8; i++) {
    const a0 = i * 45 - 22.5;
    const wedge: Pt[] = [[cx, cy]];
    for (let k = 0; k <= 6; k++) wedge.push(polar(cx, cy, r * 0.9, a0 + (k * 45) / 6));
    nodes.push(piece(wedge, i % 2 ? C.cream : C.sky, { edge: 'clean', shadow: false }));
  }
  return nodes;
}

// ---------------------------------------------------------------------------
// Curved arrows

/** A curved arrow round (cx, cy) at radius R, from `from` degrees sweeping `sweep` degrees (negative = anticlockwise). */
export function curveAt(cx: number, cy: number, R: number, from: number, sweep: number, o: { color?: string; width?: number } = {}): Node[] {
  const width = o.width ?? 16;
  const sign = sweep < 0 ? -1 : 1;
  const pts: Pt[] = [];
  const n = Math.max(6, Math.round(Math.abs(sweep) / 8));
  // Stop the shaft a little short, where the head begins.
  const headDeg = (34 / R) * (180 / Math.PI);
  const shaftSweep = sweep - sign * headDeg * 0.6;
  for (let i = 0; i <= n; i++) pts.push(polar(cx, cy, R, from + (shaftSweep * i) / n));
  const end = from + sweep;
  const [px, py] = polar(cx, cy, R, end - sign * headDeg * 0.6);
  const rx = Math.sin((end * Math.PI) / 180);
  const ry = -Math.cos((end * Math.PI) / 180);
  const tx = Math.cos((end * Math.PI) / 180) * sign;
  const ty = Math.sin((end * Math.PI) / 180) * sign;
  const head: Pt[] = [
    [px + rx * width * 1.5, py + ry * width * 1.5],
    [px + tx * 40, py + ty * 40],
    [px - rx * width * 1.5, py - ry * width * 1.5],
  ];
  const color = o.color ?? C.blue;
  return [piece(band(pts, width), color, { edge: 'clean', shadow: false }), piece(head, color, { edge: 'clean' })];
}

/** A little clock with the way its hands go: the picture for "clockwise" (sign 1) or "anticlockwise" (sign -1). */
export function wayIconAt(cx: number, cy: number, r: number, sign: 1 | -1): Node[] {
  const from = sign === 1 ? -140 : 140;
  const hands: Node[] = [
    piece(circle(cx, cy, r * 0.5), C.white, { edge: 'clean', shadow: false }),
    raw(`<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${(cy - r * 0.36).toFixed(1)}" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`),
    raw(`<line x1="${cx}" y1="${cy}" x2="${(cx + r * 0.24).toFixed(1)}" y2="${cy}" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`),
  ];
  return [...hands, ...curveAt(cx, cy, r * 0.82, from, sign * 255, { width: r * 0.17 })];
}

/** The clockwise / anticlockwise card picture. */
export function drawWayIcon(sign: 1 | -1, size: number): string {
  return svg({ w: size, h: size, name: `l13-way-${sign}`, label: sign === 1 ? 'Clockwise' : 'Anticlockwise' }, wayIconAt(size / 2, size / 2, size * 0.46, sign));
}

// ---------------------------------------------------------------------------
// The turning picture

const AMOUNT_TEXT: Record<number, string> = { 90: '¼ turn', 180: '½ turn', 270: '¾ turn' };

function pie(cx: number, cy: number, r: number, deg: number): Node[] {
  const wedge: Pt[] = [[cx, cy]];
  for (let k = 0; k <= 12; k++) wedge.push(polar(cx, cy, r, (deg * k) / 12));
  return [piece(circle(cx, cy, r), C.white, { edge: 'clean' }), piece(wedge, C.gold, { edge: 'clean', shadow: false }), raw(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.ink}" stroke-width="3"/>`)];
}

function turnPicture(v: TurnVisual, w: number, hgt: number, o: TurnDrawOpts): Node[] {
  const cx = w / 2;
  const cy = hgt / 2;
  const r = hgt * 0.36;
  const turn = v.turn ?? 0;
  const sign = v.dir === 'acw' ? -1 : 1;
  const nodes: Node[] = [...carouselAt(cx, cy, r)];
  const size = r * 1.5;
  if (v.show === 'arrow' || (!turn && v.show !== 'before-after')) {
    nodes.push(...arrowAt(cx, cy, size, v.facing));
    return nodes;
  }
  if (v.show === 'before-after') {
    nodes.push(...arrowAt(cx, cy, size, v.facing, { ghost: true }));
    nodes.push(...arrowAt(cx, cy, size, v.facing + sign * turn));
    if (o.clock) {
      const kx = w - 120;
      nodes.push(piece(circle(kx, cy, 78), C.cream, { edge: 'clean' }), ...wayIconAt(kx, cy, 70, 1));
      nodes.push(label(kx, cy + 108, 'the way a clock goes', 24, C.ink));
    }
    return nodes;
  }
  nodes.push(...arrowAt(cx, cy, size, v.facing));
  nodes.push(...curveAt(cx, cy, r * 1.3, v.facing, sign * turn));
  if (o.steps) {
    for (let i = 1; i <= turn / 90; i++) {
      const [x, y] = polar(cx, cy, r * 1.3, v.facing + sign * 90 * i);
      nodes.push(piece(circle(x, y, 22), C.goldLight, { edge: 'clean' }), raw(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="22" fill="none" stroke="${C.ink}" stroke-width="3"/>`), label(x, y + 1, String(i), 28, C.ink));
    }
  }
  const px = w - 120;
  nodes.push(...pie(px, cy - 30, 54, turn), label(px, cy + 58, AMOUNT_TEXT[turn] ?? '', 30, C.ink));
  return nodes;
}

// ---------------------------------------------------------------------------
// The grid path

export interface GridLayout {
  cell: number;
  x0: number;
  y0: number;
  /** The centre of a square. */
  at(col: number, row: number): Pt;
}

/** Where the grid sits in a box: the squares fill the left side, the move cards the right. */
export function gridLayout(g: TurnGrid, w: number, hgt: number): GridLayout {
  const cell = Math.floor(Math.min((w * 0.58) / g.cols, hgt / g.rows));
  const x0 = 10;
  const y0 = (hgt - cell * g.rows) / 2;
  return { cell, x0, y0, at: (col, row) => [x0 + (col + 0.5) * cell, y0 + (row + 0.5) * cell] };
}

export const FLAG_COLOURS: Record<string, string> = { blue: C.blue, gold: C.gold, green: C.green, pink: C.rose };

/** Where a path of moves ends (left and right turn a quarter, then step one square). */
export function walk(g: TurnGrid, facing: number, moves: Move[]): { col: number; row: number; facing: number; trail: [number, number][] } {
  let col = g.col;
  let row = g.row;
  let f = facing;
  const trail: [number, number][] = [[col, row]];
  for (const m of moves) {
    if (m === 'left') f -= 90;
    if (m === 'right') f += 90;
    const d = dirName(f);
    col += d === 'right' ? 1 : d === 'left' ? -1 : 0;
    row += d === 'down' ? 1 : d === 'up' ? -1 : 0;
    trail.push([col, row]);
  }
  return { col, row, facing: f, trail };
}

/** One move as a picture: a straight arrow, or one that bends left or right. */
export function moveIconAt(cx: number, cy: number, s: number, move: Move): Node[] {
  const sx = move === 'left' ? -1 : 1;
  const pts: Pt[] =
    move === 'forward'
      ? [[0, 0.42], [0, 0.2], [0, 0], [0, -0.2]]
      : [[0, 0.42], [0, 0.2], [0, 0.04], [sx * 0.04, -0.1], [sx * 0.2, -0.14], [sx * 0.34, -0.14]];
  const place = (p: Pt): Pt => [cx + p[0] * s, cy + p[1] * s];
  const shaft = pts.map(place);
  const tip: Pt[] =
    move === 'forward'
      ? [place([-0.22, -0.18]), place([0, -0.5]), place([0.22, -0.18])]
      : [place([sx * 0.3, -0.34]), place([sx * 0.6, -0.14]), place([sx * 0.3, 0.06])];
  return [piece(band(shaft, s * 0.2), C.blueDark, { edge: 'clean', shadow: false }), piece(tip, C.blueDark, { edge: 'clean', shadow: false })];
}

/** One move card as a square SVG. */
export function drawMoveIcon(move: Move, size: number): string {
  return svg({ w: size, h: size, name: `l13-move-${move}`, label: move === 'forward' ? 'Forwards' : move === 'left' ? 'Left' : 'Right' }, moveIconAt(size / 2, size / 2, size * 0.8, move));
}

function flagAt(cx: number, cy: number, s: number, colour: string): Node[] {
  const pole: Node = raw(`<line x1="${cx - s * 0.12}" y1="${cy + s * 0.34}" x2="${cx - s * 0.12}" y2="${cy - s * 0.36}" stroke="${C.brownDark}" stroke-width="${Math.max(4, s * 0.07)}" stroke-linecap="round"/>`);
  const cloth: Pt[] = [
    [cx - s * 0.12, cy - s * 0.36],
    [cx + s * 0.34, cy - s * 0.18],
    [cx - s * 0.12, cy + 0.0],
  ];
  return [pole, piece(cloth, colour, { edge: 'cut', rough: 0.4 })];
}

function gridPicture(v: TurnVisual, w: number, hgt: number, o: TurnDrawOpts): Node[] {
  const g = v.grid!;
  const L = gridLayout(g, w, hgt);
  const nodes: Node[] = [];
  for (let row = 0; row < g.rows; row++) {
    for (let col = 0; col < g.cols; col++) {
      nodes.push(piece(rect(L.x0 + col * L.cell + 3, L.y0 + row * L.cell + 3, L.cell - 6, L.cell - 6, 6), (col + row) % 2 ? C.cream : C.sand, { edge: 'clean', shadow: false }));
    }
  }
  const [sx, sy] = L.at(g.col, g.row);
  nodes.push(piece(circle(sx, sy, L.cell * 0.4), C.sky, { edge: 'clean', shadow: false }), ...arrowAt(sx, sy, L.cell * 0.66, v.facing));
  if (o.trail) {
    const trail = walk(g, v.facing, v.moves ?? []).trail.map(([c, r]) => L.at(c, r));
    nodes.push(raw(`<polyline points="${pointsAttr(trail)}" fill="none" stroke="${C.goldLight}" stroke-width="9" stroke-dasharray="4 14" stroke-linecap="round" stroke-linejoin="round"/>`));
    trail.slice(1).forEach(([x, y], i) => {
      nodes.push(piece(circle(x, y + L.cell * 0.28, 15), C.goldLight, { edge: 'clean', shadow: false }), label(x, y + L.cell * 0.28 + 1, String(i + 1), 20, C.ink));
    });
  }
  for (const f of g.flags) {
    if (o.hideFlags?.includes(f.id)) continue;
    const [x, y] = L.at(f.col, f.row);
    nodes.push(...flagAt(x, y, L.cell * 0.8, FLAG_COLOURS[f.id] ?? C.rose));
  }
  // The move cards, in order, on the right.
  const moves = v.moves ?? [];
  const iconW = 82;
  const gap = 8;
  const x1 = L.x0 + g.cols * L.cell + 28;
  const total = moves.length * iconW + (moves.length - 1) * gap;
  const startX = x1 + Math.max(0, (w - x1 - total) / 2);
  moves.forEach((m, i) => {
    const mx = startX + i * (iconW + gap);
    const my = hgt / 2 - iconW / 2;
    nodes.push(piece(rect(mx, my, iconW, iconW, 8), C.cream, { edge: 'cut', rough: 0.4 }), ...moveIconAt(mx + iconW / 2, my + iconW / 2 + 2, iconW * 0.8, m));
    nodes.push(piece(circle(mx + 14, my - 18, 15), C.gold, { edge: 'clean', shadow: false }), label(mx + 14, my - 17, String(i + 1), 20, C.ink));
  });
  return nodes;
}

/** The paper nodes for a `turn` visual (with optional help drawings). */
export function turnNodes(v: TurnVisual, w: number, hgt: number, o: TurnDrawOpts = {}): Node[] {
  return v.grid ? gridPicture(v, w, hgt, o) : turnPicture(v, w, hgt, o);
}

/** A whole `turn` picture as an SVG string (the activity redraws it for help). */
export function drawTurn(v: TurnVisual, w: number, hgt: number, o: TurnDrawOpts = {}): string {
  return svg({ w, h: hgt, name: 'turn-' + JSON.stringify(v), boil: false, label: v.grid ? 'A path to follow' : 'An arrow that turns' }, turnNodes(v, w, hgt, o));
}
