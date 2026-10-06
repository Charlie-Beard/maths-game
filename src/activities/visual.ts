/**
 * Draws a problem's picture (its `visual`) as plain, static paper art.
 *
 * Used by `choose` (the fallback activity that can show any problem) and
 * by the richer activities, which add interaction on top. Every Visual kind
 * has a drawing here, built in code from torn-paper pieces (art/paper.ts):
 * no images, no boil (the picture holds still while he thinks), and
 * everything big enough to count from across the sofa.
 *
 * The small drawing functions are exported so other activities can reuse
 * them: `drawClock`, `drawCoin`, `drawShape`, `drawTenFrame`, `drawDice`,
 * `drawRuler`, `propAt` and friends. Each returns either an SVG string
 * (a whole picture) or paper `Node`s to compose into a bigger picture.
 *
 * `objects` stays as HTML (`.obj` elements) because `count` lets him tap
 * each one; everything else is one SVG the size of the box.
 */
import { C } from '../art/palette';
import { prop } from '../art/props';
import { circle, curve, ellipse, hashString, ink, piece, poly, raw, rect, rng, svg, type Node, type Pt } from '../art/paper';
import type { PropId, ShapeId, Visual } from '../core/problem';
import { h } from '../ui/dom';
import { timeWords } from '../core/generators/more';

// ---------------------------------------------------------------------------
// Small shared helpers
// ---------------------------------------------------------------------------

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Andika text centred on (x, y). */
export function label(x: number, y: number, text: string, size: number, fill: string = C.ink, o: { weight?: number; anchor?: 'start' | 'middle' | 'end'; opacity?: number } = {}): Node {
  const op = o.opacity !== undefined ? ` opacity="${o.opacity}"` : '';
  return raw(
    `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${size.toFixed(1)}" font-weight="${o.weight ?? 700}" fill="${fill}" text-anchor="${o.anchor ?? 'middle'}" dominant-baseline="central" class="vt"${op}>${esc(text)}</text>`,
  );
}

/** A straight, crisp line (ticks, stems), not hand-wobbled. */
const line = (x1: number, y1: number, x2: number, y2: number, color: string, width: number, extra = ''): Node =>
  raw(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"${extra}/>`);

const rotatePts = (pts: Pt[], cx: number, cy: number, deg: number): Pt[] => {
  if (!deg) return pts;
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c] as Pt);
};

const propCache = new Map<PropId, string>();
const propSvg = (id: PropId): string => {
  let s = propCache.get(id);
  if (!s) propCache.set(id, (s = prop(id)));
  return s;
};

/** A counting prop placed into a bigger SVG at (x, y), size × size. */
export function propAt(id: PropId, x: number, y: number, size: number, extra = ''): Node {
  return raw(propSvg(id).replace('<svg ', `<svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${size.toFixed(1)}" height="${size.toFixed(1)}" ${extra} `));
}

/** Nests a whole SVG string into a bigger SVG at (x, y, w, h). */
export function nest(markup: string, x: number, y: number, w: number, hgt: number): Node {
  return raw(markup.replace('<svg ', `<svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${hgt.toFixed(1)}" `));
}

/** A big "?" in a dashed torn ring: the thing to find. */
function missing(cx: number, cy: number, r: number): Node[] {
  return [
    raw(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.white}" stroke="${C.red}" stroke-width="5" stroke-dasharray="14 10"/>`),
    label(cx, cy + 2, '?', r * 1.1, C.red),
  ];
}

const paper = (w: number, hgt: number, name: string, nodes: Node[], labelText?: string): string =>
  svg({ w, h: hgt, name, boil: false, label: labelText }, nodes);

// ---------------------------------------------------------------------------
// Dots: dice and ten-frame patterns
// ---------------------------------------------------------------------------

/** Where the pips go on a die, in a unit square. */
const PIPS: Record<number, Pt[]> = {
  1: [[0.5, 0.5]],
  2: [[0.25, 0.25], [0.75, 0.75]],
  3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
  4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
  5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
  6: [[0.27, 0.22], [0.73, 0.22], [0.27, 0.5], [0.73, 0.5], [0.27, 0.78], [0.73, 0.78]],
};

/** One die showing 1–6 pips, with its top-left at (x, y). */
export function drawDice(n: number, x: number, y: number, size: number): Node[] {
  const pr = size * 0.095;
  return [
    piece(rect(x, y, size, size, size * 0.16), C.cream, { edge: 'cut' }),
    ...(PIPS[Math.max(1, Math.min(6, n))] ?? []).map(([u, v]) => piece(circle(x + u * size, y + v * size, pr), C.ink, { edge: 'cut', shadow: false })),
  ];
}

/**
 * A ten frame, top-left at (x, y): 5 × 2 cells, filled along the top row
 * first. Counters are props or red paper circles; `add` shows dashed
 * places still to fill, `remove` fades and crosses out the last ones.
 */
export function drawTenFrame(filled: number, x: number, y: number, cell: number, o: { add?: number; remove?: number; prop?: PropId; dots?: boolean } = {}): Node[] {
  const pad = cell * 0.12;
  const nodes: Node[] = [piece(rect(x, y, cell * 5 + pad * 2, cell * 2 + pad * 2, 10), C.bark, { edge: 'cut' })];
  for (let i = 0; i < 10; i++) {
    const cx = x + pad + (i % 5) * cell;
    const cy = y + pad + Math.floor(i / 5) * cell;
    nodes.push(piece(rect(cx + 3, cy + 3, cell - 6, cell - 6, 6), C.cream, { edge: 'clean', shadow: false }));
    const mx = cx + cell / 2;
    const my = cy + cell / 2;
    const removing = o.remove !== undefined && i < filled && i >= filled - o.remove;
    if (i < filled) {
      const op = removing ? ' opacity="0.35"' : '';
      if (o.prop) nodes.push(propAt(o.prop, cx + cell * 0.1, cy + cell * 0.1, cell * 0.8, op));
      else if (o.dots) nodes.push(piece(circle(mx, my, cell * 0.28), C.ink, { edge: 'cut', shadow: false, opacity: removing ? 0.35 : undefined }));
      else nodes.push(piece(circle(mx, my, cell * 0.34), C.red, { edge: 'cut', opacity: removing ? 0.35 : undefined }));
      if (removing) nodes.push(line(mx - cell * 0.32, my + cell * 0.32, mx + cell * 0.32, my - cell * 0.32, C.redDark, 6));
    } else if (o.add !== undefined && i < filled + o.add) {
      nodes.push(raw(`<circle cx="${mx}" cy="${my}" r="${cell * 0.32}" fill="none" stroke="${C.gold}" stroke-width="4" stroke-dasharray="9 7"/>`));
    }
  }
  return nodes;
}

export const tenFrameSize = (cell: number): { w: number; h: number } => ({ w: cell * 5 + cell * 0.24, h: cell * 2 + cell * 0.24 });

// ---------------------------------------------------------------------------
// Clock
// ---------------------------------------------------------------------------

export interface ClockOpts {
  /** Shade the "past" half and the "to" half, with words (a help step). */
  pastTo?: boolean;
  /** Faint hands showing where the real ones should go (Silky's help). */
  ghost?: { hour: number; minute: number };
  /** Adds wide invisible hit strokes on the hands, for tapping them. */
  hit?: boolean;
  /** Leaves the hands off (to draw them separately). */
  noHands?: boolean;
  name?: string;
}

/** The angles of the hands, in degrees clockwise from 12. */
export const handAngles = (hour: number, minute: number): { hour: number; minute: number } => ({
  hour: ((hour % 12) + minute / 60) * 30,
  minute: (minute % 60) * 6,
});

function handShape(c: number, len: number, w: number): Pt[] {
  const tail = w * 1.6;
  return poly([
    [c - w / 2, c + tail],
    [c + w / 2, c + tail],
    [c + w * 0.42, c - len + w * 1.4],
    [c, c - len],
    [c - w * 0.42, c - len + w * 1.4],
  ]);
}

/**
 * The frozen clock tower's face: an icy stone ring with icicles, a cream
 * face, big numbers 1–12, minute ticks, a short brown hour hand and a long
 * blue minute hand. The hands are `<g class="clock-hand" data-hand=…>`
 * groups rotated about the centre, so an activity can turn them by
 * setting their `transform`.
 */
export function drawClock(hour: number, minute: number, size: number, o: ClockOpts = {}): string {
  const c = size / 2;
  const R = size * 0.45;
  const face = R * 0.84;
  const nodes: Node[] = [];
  // Icicles hang under the ring, drawn first so the ring sits over their roots.
  const r = rng(hashString('icicles' + size));
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (0.28 + (i / 6) * 0.44);
    const x = c + Math.cos(a) * R * 0.97;
    const y = c + Math.sin(a) * R * 0.97;
    const len = R * (0.1 + r() * 0.1);
    nodes.push(piece(poly([[x - R * 0.04, y - 6], [x + R * 0.04, y - 6], [x, y + len]]), '#c9dfee', { edge: 'cut' }));
  }
  nodes.push(piece(circle(c, c, R), '#8ea3b5', { rough: 1.2 }));
  // Frost on the top of the ring.
  nodes.push(piece(ellipse(c - R * 0.35, c - R * 0.86, R * 0.3, R * 0.1, -22), '#eef5fa', { shadow: false }));
  nodes.push(piece(ellipse(c + R * 0.42, c - R * 0.82, R * 0.22, R * 0.08, 26), '#eef5fa', { shadow: false }));
  nodes.push(piece(circle(c, c, face), C.cream, { edge: 'cut' }));
  if (o.pastTo) {
    const half = (from: number): Pt[] => {
      const pts: Pt[] = [[c, c]];
      for (let i = 0; i <= 24; i++) {
        const a = ((from + (i / 24) * 180 - 90) * Math.PI) / 180;
        pts.push([c + Math.cos(a) * face * 0.96, c + Math.sin(a) * face * 0.96]);
      }
      return pts;
    };
    nodes.push(piece(half(0), 'rgba(111,154,90,0.28)', { edge: 'clean', shadow: false }));
    nodes.push(piece(half(180), 'rgba(79,120,168,0.22)', { edge: 'clean', shadow: false }));
    nodes.push(label(c + face * 0.3, c + face * 0.36, 'past', face * 0.15, C.greenDeep, { opacity: 0.85 }));
    nodes.push(label(c - face * 0.3, c + face * 0.36, 'to', face * 0.15, C.blueDark, { opacity: 0.85 }));
  }
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 * Math.PI) / 180;
    const big = i % 5 === 0;
    const r1 = face * (big ? 0.86 : 0.91);
    const r2 = face * 0.96;
    nodes.push(line(c + Math.sin(a) * r1, c - Math.cos(a) * r1, c + Math.sin(a) * r2, c - Math.cos(a) * r2, C.ink, big ? face * 0.025 : face * 0.012));
  }
  for (let n = 1; n <= 12; n++) {
    const a = (n * 30 * Math.PI) / 180;
    nodes.push(label(c + Math.sin(a) * face * 0.69, c - Math.cos(a) * face * 0.69 + face * 0.01, String(n), face * 0.25, C.ink));
  }
  if (o.ghost) {
    const g = handAngles(o.ghost.hour, o.ghost.minute);
    const ghost = (len: number, w: number, deg: number, color: string) => {
      const pts = rotatePts(handShape(c, len, w), c, c, deg);
      const d = 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z';
      return raw(`<path class="clock-ghost" d="${d}" fill="${color}" fill-opacity="0.18" stroke="${color}" stroke-width="3" stroke-dasharray="8 6"/>`);
    };
    nodes.push(ghost(face * 0.84, face * 0.085, g.minute, C.blueDark), ghost(face * 0.55, face * 0.13, g.hour, C.barkDark));
  }
  if (!o.noHands) nodes.push(...clockHands(hour, minute, size, o.hit));
  nodes.push(piece(circle(c, c, face * 0.07), C.gold, { edge: 'cut' }));
  return paper(size, size, o.name ?? 'clock', nodes, `A clock`);
}

/** Just the two hands (and their hit strokes), for drawClock or a custom face. */
export function clockHands(hour: number, minute: number, size: number, hit = false): Node[] {
  const c = size / 2;
  const face = size * 0.45 * 0.84;
  const a = handAngles(hour, minute);
  const hand = (which: 'hour' | 'minute', len: number, w: number, color: string, deg: number): Node => {
    const hitLine = hit ? `<line class="hand-hit" x1="${c}" y1="${c - len * 0.3}" x2="${c}" y2="${c - len - 6}" stroke="transparent" stroke-width="${Math.max(72, w * 3)}" stroke-linecap="round" pointer-events="stroke"/>` : '';
    return (ctx) =>
      `<g class="clock-hand" data-hand="${which}" transform="rotate(${deg.toFixed(2)} ${c} ${c})">${piece(handShape(c, len, w), color, { edge: 'cut' })(ctx)}${hitLine}</g>`;
  };
  return [hand('minute', face * 0.84, face * 0.085, C.blueDark, a.minute), hand('hour', face * 0.55, face * 0.13, C.barkDark, a.hour)];
}

/** Turns a drawn clock's hands (from drawClock) to a new time. */
export function setClockHands(root: Element, hour: number, minute: number, size: number): void {
  const a = handAngles(hour, minute);
  const c = size / 2;
  root.querySelector('[data-hand="hour"]')?.setAttribute('transform', `rotate(${a.hour.toFixed(2)} ${c} ${c})`);
  root.querySelector('[data-hand="minute"]')?.setAttribute('transform', `rotate(${a.minute.toFixed(2)} ${c} ${c})`);
}

/** "3 o’clock", "half past 3", "quarter to 4": the same words the generators answer with. */
export { timeWords };

/**
 * A written fraction as stacked numerals (HTML), for when ½ ¼ ⅓ won't do:
 * the Andika latin subset has ½ and ¼ but no ⅓.
 */
export function stackedFraction(num: number, den: number, size = 64): string {
  return `<span class="c-frac" style="font-size:${size}px"><span>${num}</span><span>${den}</span></span>`;
}

// ---------------------------------------------------------------------------
// UK coins
// ---------------------------------------------------------------------------

export const COIN_VALUES = [1, 2, 5, 10, 20, 50, 100, 200] as const;

/** Real diameters in mm, so the coins keep their true sizes relative to each other. */
const COIN_MM: Record<number, number> = { 1: 20.3, 2: 25.9, 5: 18, 10: 24.5, 20: 21.4, 50: 27.3, 100: 23.4, 200: 28.4 };
export const coinMm = (value: number): number => COIN_MM[value] ?? 22;

const COPPER = { face: '#c27a4a', rim: '#94532f', text: '#5e3018' };
const SILVER = { face: '#cfd0cb', rim: '#9c9d98', text: '#4f504c' };
const GOLDEN = { face: '#dcb85a', rim: '#a8862f', text: '#5d4614' };

/** "7p", "50p", "£1", "£1.50". */
export function moneyText(pence: number): string {
  if (pence < 100) return `${pence}p`;
  const pounds = Math.floor(pence / 100);
  const p = pence % 100;
  return p ? `£${pounds}.${String(p).padStart(2, '0')}` : `£${pounds}`;
}

/** The outline of the 20p and 50p: a heptagon with curved sides. */
function heptagon(cx: number, cy: number, r: number): Pt[] {
  const v: Pt[] = [];
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 7;
    v.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  const pts: Pt[] = [];
  for (let i = 0; i < 7; i++) {
    const a = v[i];
    const b = v[(i + 1) % 7];
    const o = v[(i + 4) % 7];
    const rr = Math.hypot(a[0] - o[0], a[1] - o[1]);
    const a0 = Math.atan2(a[1] - o[1], a[0] - o[0]);
    let a1 = Math.atan2(b[1] - o[1], b[0] - o[0]);
    if (a1 < a0) a1 += Math.PI * 2;
    for (let k = 0; k < 8; k++) {
      const t = a0 + ((a1 - a0) * k) / 8;
      pts.push([o[0] + Math.cos(t) * rr, o[1] + Math.sin(t) * rr]);
    }
  }
  return pts;
}

function polygon(cx: number, cy: number, r: number, n: number, start = -Math.PI / 2): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = start + (i * 2 * Math.PI) / n;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

/**
 * One UK coin as paper nodes, centred on (cx, cy) with diameter d.
 * Copper 1p and 2p, silver 5p and 10p, silver seven-sided 20p and 50p,
 * the twelve-sided £1 and the round £2 (gold rim, silver middle).
 */
export function coinNodes(value: number, cx: number, cy: number, d: number): Node[] {
  const r = d / 2;
  const col = value <= 2 ? COPPER : value <= 50 ? SILVER : GOLDEN;
  const outline = value === 20 || value === 50 ? heptagon(cx, cy, r) : value === 100 ? polygon(cx, cy, r, 12, -Math.PI / 2 + Math.PI / 12) : circle(cx, cy, r);
  const nodes: Node[] = [piece(outline, col.rim, { edge: 'cut', rough: 0.6 })];
  const inner = value === 20 || value === 50 ? heptagon(cx, cy, r * 0.86) : value === 100 ? polygon(cx, cy, r * 0.88, 12, -Math.PI / 2 + Math.PI / 12) : circle(cx, cy, r * 0.88);
  nodes.push(piece(inner, col.face, { edge: 'clean', shadow: false }));
  if (value >= 100) {
    // Bimetal: the middle is silver.
    nodes.push(piece(circle(cx, cy, r * 0.62), SILVER.face, { edge: 'clean', shadow: false }));
    nodes.push(raw(`<circle cx="${cx}" cy="${cy}" r="${(r * 0.62).toFixed(1)}" fill="none" stroke="${GOLDEN.rim}" stroke-width="${Math.max(1.5, r * 0.04)}"/>`));
  }
  // A beaded ring just inside the edge, like the real thing.
  nodes.push(raw(`<circle cx="${cx}" cy="${cy}" r="${(r * 0.76).toFixed(1)}" fill="none" stroke="${col.rim}" stroke-opacity="0.55" stroke-width="${Math.max(1.2, r * 0.035)}" stroke-dasharray="${(r * 0.05).toFixed(1)} ${(r * 0.07).toFixed(1)}"/>`));
  // A soft shine at the top left.
  nodes.push(raw(`<ellipse cx="${cx - r * 0.32}" cy="${cy - r * 0.38}" rx="${r * 0.28}" ry="${r * 0.13}" transform="rotate(-30 ${cx - r * 0.32} ${cy - r * 0.38})" fill="#fff" fill-opacity="0.32"/>`));
  const text = value >= 100 ? `£${value / 100}` : `${value}p`;
  const size = r * (text.length >= 3 ? 0.62 : 0.78);
  nodes.push(label(cx, cy + r * 0.03, text, size, value >= 100 ? SILVER.text : col.text));
  return nodes;
}

/**
 * One coin as a square SVG. With `trueSize`, the coin is drawn at its real
 * size relative to the biggest coin (the £2 fills the box); without, it
 * fills the box.
 */
export function drawCoin(value: number, size: number, trueSize = true): string {
  const d = (trueSize ? (size * 0.94 * coinMm(value)) / COIN_MM[200] : size * 0.94);
  return paper(size, size, `coin-${value}-${size}`, coinNodes(value, size / 2, size / 2, d), moneyText(value));
}

// ---------------------------------------------------------------------------
// 2D shapes
// ---------------------------------------------------------------------------

export const SHAPE_NAMES: Record<ShapeId, string> = {
  circle: 'circle',
  square: 'square',
  triangle: 'triangle',
  rectangle: 'rectangle',
  pentagon: 'pentagon',
  hexagon: 'hexagon',
  oval: 'oval',
  star: 'star',
};

export const SHAPE_SIDES: Record<ShapeId, number> = { circle: 0, oval: 0, triangle: 3, square: 4, rectangle: 4, pentagon: 5, hexagon: 6, star: 10 };

/** The corners (or the outline, for round shapes) of a shape centred on (cx, cy), fitting radius r, turned by `turned` degrees. */
export function shapeOutline(shape: ShapeId, cx: number, cy: number, r: number, turned = 0): Pt[] {
  let pts: Pt[];
  switch (shape) {
    case 'circle':
      pts = circle(cx, cy, r * 0.9);
      break;
    case 'oval':
      pts = ellipse(cx, cy, r, r * 0.6);
      break;
    case 'square':
      pts = rect(cx - r * 0.68, cy - r * 0.68, r * 1.36, r * 1.36);
      break;
    case 'rectangle':
      pts = rect(cx - r, cy - r * 0.52, r * 2, r * 1.04);
      break;
    case 'triangle':
      pts = polygon(cx, cy + r * 0.14, r, 3);
      break;
    case 'pentagon':
      pts = polygon(cx, cy + r * 0.05, r * 0.95, 5);
      break;
    case 'hexagon':
      pts = polygon(cx, cy, r * 0.92, 6, 0);
      break;
    case 'star': {
      pts = [];
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rr = i % 2 ? r * 0.42 : r;
        pts.push([cx + Math.cos(a) * rr, cy + r * 0.08 + Math.sin(a) * rr]);
      }
      break;
    }
  }
  return rotatePts(pts, cx, cy, turned);
}

/** The straight sides of a shape (none for a circle or an oval), as point pairs. */
export function shapeSides(shape: ShapeId, cx: number, cy: number, r: number, turned = 0): [Pt, Pt][] {
  if (SHAPE_SIDES[shape] === 0) return [];
  const pts = shapeOutline(shape, cx, cy, r, turned);
  return pts.map((p, i) => [p, pts[(i + 1) % pts.length]] as [Pt, Pt]);
}

/** Fill colours for shapes; picked by name, so colour never gives away the shape. */
export const SHAPE_FILLS = [C.leaf, C.rose, C.blue, C.gold, C.purple, C.teal, C.orange];
export const shapeFill = (seed: string): string => SHAPE_FILLS[hashString(seed) % SHAPE_FILLS.length];

/** Paper nodes for one shape. */
export function shapeNodes(shape: ShapeId, cx: number, cy: number, r: number, o: { turned?: number; fill?: string } = {}): Node[] {
  // Cut cleanly (not torn), so the corners stay sharp enough to count.
  return [piece(shapeOutline(shape, cx, cy, r, o.turned ?? 0), o.fill ?? C.leaf, { edge: 'cut', rough: 0.5 })];
}

/** One shape as a square SVG. */
export function drawShape(shape: ShapeId, size: number, o: { turned?: number; fill?: string; name?: string } = {}): string {
  const name = o.name ?? `shape-${shape}-${o.turned ?? 0}`;
  return paper(size, size, name, shapeNodes(shape, size / 2, size / 2, size * 0.42, { turned: o.turned, fill: o.fill ?? shapeFill(name) }), 'A shape');
}

// ---------------------------------------------------------------------------
// Length: ribbons, giant footsteps and a cm ruler
// ---------------------------------------------------------------------------

const RIBBONS = [C.red, C.blue, C.leafDark, C.purple];

/** A wooden cm ruler from 0 to `cm`, with its 0 at x, its top at y. */
export function drawRuler(x: number, y: number, cm: number, unit: number, hgt = 54): Node[] {
  const nodes: Node[] = [piece(rect(x - 22, y, cm * unit + 44, hgt, 6), C.goldLight, { edge: 'cut', rough: 0.6 })];
  for (let i = 0; i <= cm * 2; i++) {
    const tx = x + (i * unit) / 2;
    const whole = i % 2 === 0;
    nodes.push(line(tx, y + 3, tx, y + (whole ? hgt * 0.42 : hgt * 0.24), C.ink, whole ? 3 : 2));
    if (whole) nodes.push(label(tx, y + hgt * 0.7, String(i / 2), Math.min(28, unit * 0.62), C.ink));
  }
  return nodes;
}

/** A giant's bare footprint walking right, heel at x, `len` long: a sole and five toes. */
export function footprint(x: number, cy: number, len: number, upper: boolean): Node[] {
  const w = len * 0.42;
  const y = cy + (upper ? -w * 0.32 : w * 0.32);
  // The sole, pointing right: narrow heel, wide ball, a curved instep on the inside.
  const side = upper ? -1 : 1;
  const sole: Pt[] = [
    [x, y],
    [x + len * 0.08, y - w * 0.28],
    [x + len * 0.35, y - w * 0.3 - side * w * 0.04],
    [x + len * 0.66, y - w * 0.42],
    [x + len * 0.74, y],
    [x + len * 0.66, y + w * 0.42],
    [x + len * 0.35, y + w * 0.3 - side * w * 0.04],
    [x + len * 0.08, y + w * 0.28],
  ];
  const nodes: Node[] = [piece(curve(sole, 3), C.barkLight, { edge: 'torn', rough: 0.5 })];
  // Toes in an arc, the big toe on the inside (towards the other foot).
  for (let t = 0; t < 5; t++) {
    const k = (t - 2) / 2;
    const big = upper ? t === 4 : t === 0;
    const tr = len * (big ? 0.085 : 0.06 - Math.abs(k) * 0.006);
    const ty = y + k * w * 0.46;
    const tx = x + len * (0.86 - Math.abs(k) * 0.07);
    nodes.push(piece(circle(tx, ty, tr), C.barkLight, { edge: 'cut', shadow: false }));
  }
  return nodes;
}

function drawLengths(lengths: number[], unit: 'footsteps' | 'cm', w: number, hgt: number): Node[] {
  const nodes: Node[] = [];
  const max = Math.max(1, ...lengths);
  const x0 = unit === 'cm' ? 60 : 50;
  const scale = (w - x0 - 50) / max;
  const rowH = hgt / lengths.length;
  if (unit === 'cm' && lengths.length > 1) nodes.push(line(x0 - 4, 10, x0 - 4, hgt - 10, C.ink, 5, ' stroke-dasharray="12 10"'));
  lengths.forEach((len, i) => {
    const top = i * rowH;
    const ribbonH = Math.min(46, rowH * 0.3);
    const ry = top + rowH * (unit === 'cm' ? 0.18 : 0.22);
    nodes.push(piece(rect(x0, ry, len * scale, ribbonH, 4), RIBBONS[i % RIBBONS.length], { rough: 0.8 }));
    nodes.push(piece(rect(x0 + 6, ry + ribbonH * 0.42, len * scale - 12, ribbonH * 0.12), 'rgba(255,255,255,0.28)', { edge: 'clean', shadow: false }));
    // One length gets a ruler to measure it; two or more are just compared,
    // lined up against a start line.
    if (unit === 'cm' && lengths.length === 1) nodes.push(...drawRuler(x0, ry + ribbonH + 6, max, scale, Math.min(56, rowH * 0.4)));
    else for (let s = 0; s < len; s++) nodes.push(...footprint(x0 + s * scale + scale * 0.05, ry + ribbonH + rowH * 0.28, scale * 0.9, s % 2 === 0));
  });
  return nodes;
}

// ---------------------------------------------------------------------------
// Fractions
// ---------------------------------------------------------------------------

/** Unequal splits: some parts big, some small, so "not halves" is plain. */
function weights(parts: number, equal: boolean): number[] {
  if (equal) return Array.from({ length: parts }, () => 1);
  const ws = [1.7, 0.6, 1.2, 0.8, 1.4, 0.5];
  return Array.from({ length: parts }, (_, i) => ws[i % ws.length]);
}

/** A circle or rectangle cut into parts, some shaded: ice-pie and cake. */
export function fractionNodes(shape: 'circle' | 'rect', parts: number, shaded: number, cx: number, cy: number, r: number, equal = true): Node[] {
  const ws = weights(Math.max(1, parts), equal);
  const total = ws.reduce((a, b) => a + b, 0);
  const nodes: Node[] = [];
  const shadeCol = C.rose;
  const bodyCol = C.cream;
  if (shape === 'circle') {
    nodes.push(piece(circle(cx, cy, r), C.tan, { edge: 'torn' }));
    nodes.push(piece(circle(cx, cy, r * 0.92), bodyCol, { edge: 'clean', shadow: false }));
    let a = -90;
    ws.forEach((wt, i) => {
      const span = (wt / total) * 360;
      if (i < shaded) {
        const pts: Pt[] = [[cx, cy]];
        for (let k = 0; k <= 20; k++) {
          const t = ((a + (span * k) / 20) * Math.PI) / 180;
          pts.push([cx + Math.cos(t) * r * 0.92, cy + Math.sin(t) * r * 0.92]);
        }
        nodes.push(piece(pts, shadeCol, { edge: 'clean', shadow: false }));
      }
      a += span;
    });
    if (parts > 1) {
      a = -90;
      ws.forEach((wt) => {
        const t = (a * Math.PI) / 180;
        nodes.push(line(cx, cy, cx + Math.cos(t) * r * 0.92, cy + Math.sin(t) * r * 0.92, C.ink, 5));
        a += (wt / total) * 360;
      });
    }
  } else {
    const w = r * 2.3;
    const hh = r * 1.5;
    const x = cx - w / 2;
    const y = cy - hh / 2;
    nodes.push(piece(rect(x - 8, y - 8, w + 16, hh + 16, 6), C.tan, { edge: 'torn' }));
    nodes.push(piece(rect(x, y, w, hh), bodyCol, { edge: 'clean', shadow: false }));
    let px = x;
    ws.forEach((wt, i) => {
      const pw = (wt / total) * w;
      if (i < shaded) nodes.push(piece(rect(px, y, pw, hh), shadeCol, { edge: 'clean', shadow: false }));
      if (i > 0) nodes.push(line(px, y, px, y + hh, C.ink, 5));
      px += pw;
    });
  }
  return nodes;
}

// ---------------------------------------------------------------------------
// Tens and ones: bundles of ten sticks tied with ribbon, and single sticks
// ---------------------------------------------------------------------------

export function stickNodes(x: number, y: number, len: number, w = 12): Node[] {
  return [piece(rect(x, y, w, len, 4), C.wood, { edge: 'cut' }), piece(rect(x + w * 0.3, y + 6, w * 0.22, len - 12), 'rgba(255,255,255,0.18)', { edge: 'clean', shadow: false })];
}

export function bundleNodes(x: number, y: number, len: number, w = 12): Node[] {
  const nodes: Node[] = [];
  for (let i = 0; i < 10; i++) nodes.push(piece(rect(x + i * w * 0.62, y + (i % 2) * 4, w, len, 4), i % 2 ? C.wood : C.barkLight, { edge: 'cut', shadow: i === 0 }));
  const bw = w * 0.62 * 9 + w;
  nodes.push(piece(rect(x - 4, y + len * 0.44, bw + 8, len * 0.12, 3), C.red, { edge: 'cut' }));
  nodes.push(piece(poly([[x + bw / 2, y + len * 0.5], [x + bw / 2 - 18, y + len * 0.36], [x + bw / 2 - 16, y + len * 0.64]]), C.redDark, { edge: 'cut', shadow: false }));
  nodes.push(piece(poly([[x + bw / 2, y + len * 0.5], [x + bw / 2 + 18, y + len * 0.36], [x + bw / 2 + 16, y + len * 0.64]]), C.redDark, { edge: 'cut', shadow: false }));
  return nodes;
}

export const bundleWidth = (w = 12): number => w * 0.62 * 9 + w;

/** Bundles then single sticks, centred in a box, shrunk to fit if need be. */
export function tensOnesNodes(tens: number, ones: number, bx: number, by: number, w: number, hgt: number): Node[] {
  const nodes: Node[] = [];
  const len0 = Math.min(240, hgt - 80);
  const sw = 13;
  const bw = bundleWidth(sw);
  const gapB = 22;
  const gapS = 16;
  const widthNeeded = tens * (bw + gapB) - (tens && !ones ? gapB : 0) + (tens && ones ? 50 : 0) + ones * (sw + gapS) - (ones ? gapS : 0);
  const k = Math.min(1, (w - 20) / Math.max(1, widthNeeded));
  const len = len0 * Math.max(0.6, k);
  let x = bx + (w - widthNeeded * k) / 2;
  const y = by + (hgt - len) / 2;
  const s = (n: number) => n * k;
  for (let i = 0; i < tens; i++) {
    nodes.push(...bundleNodes(x, y, len, s(sw)));
    x += s(bw + gapB);
  }
  if (tens && ones) x += s(50);
  for (let i = 0; i < ones; i++) {
    nodes.push(...stickNodes(x, y, len, s(sw)));
    x += s(sw + gapS);
  }
  return nodes;
}

/** An empty place-value mat ("build it"): a tens side and a ones side. */
export function emptyMat(w: number, hgt: number): Node[] {
  const mw = Math.min(760, w - 40);
  const mx = (w - mw) / 2;
  const my = 20;
  const mh = hgt - 40;
  const side = (x: number, ww: number, text: string): Node[] => [
    raw(`<rect x="${x}" y="${my + 50}" width="${ww}" height="${mh - 70}" rx="12" fill="none" stroke="${C.cream}" stroke-width="4" stroke-dasharray="14 10"/>`),
    label(x + ww / 2, my + 28, text, 32, C.cream),
  ];
  return [piece(rect(mx, my, mw, mh, 14), C.greenDark), ...side(mx + 24, mw * 0.6 - 36, 'tens'), ...side(mx + mw * 0.6, mw * 0.4 - 24, 'ones')];
}

// ---------------------------------------------------------------------------
// Objects (HTML, so count can make them tappable)
// ---------------------------------------------------------------------------

function objSize(total: number): number {
  if (total <= 6) return 96;
  if (total <= 10) return 84;
  if (total <= 15) return 72;
  if (total <= 20) return 62;
  return 52;
}

function renderObjects(el: HTMLElement, v: Extract<Visual, { type: 'objects' }>, w: number, hgt: number): void {
  const total = v.groups.reduce((s, g) => s + g.count, 0);
  const size = objSize(total);
  const scatter = v.layout === 'scatter';
  const groupW = (w - (v.groups.length - 1) * 90) / v.groups.length;
  const seed = hashString(JSON.stringify(v));
  v.groups.forEach((g, gi) => {
    if (gi) el.append(h('div', { class: 'obj-op' }, v.op === '-' ? '−' : '+'));
    const box = h('div', { class: `obj-group${scatter ? ' scatter' : ''}` });
    const objs: HTMLElement[] = [];
    for (let i = 0; i < g.count; i++) {
      const gone = i >= g.count - (g.gone ?? 0);
      const obj = h('div', { class: `obj${gone ? ' gone' : ''}`, 'data-group': String(gi), html: propSvg(g.prop), style: `width:${size}px;height:${size}px` });
      objs.push(obj);
      box.append(obj);
    }
    if (scatter) {
      // A jittered grid, shuffled: looks scattered but nothing overlaps.
      let cols = Math.max(1, Math.ceil(Math.sqrt(g.count * 2)));
      let rows = Math.max(1, Math.ceil((g.count * 1.5) / cols));
      const cellPx = size * 1.3;
      cols = Math.min(cols, Math.max(1, Math.floor(groupW / cellPx)));
      rows = Math.max(Math.ceil(g.count / cols), Math.min(rows, Math.floor((hgt - 10) / cellPx)));
      const bw = cols * cellPx;
      const bh = Math.min(hgt - 10, rows * cellPx);
      box.style.width = `${bw}px`;
      box.style.height = `${bh}px`;
      const r = rng(seed + gi * 977);
      const cells = Array.from({ length: cols * rows }, (_, k) => k);
      for (let k = cells.length - 1; k > 0; k--) {
        const j = Math.floor(r() * (k + 1));
        [cells[k], cells[j]] = [cells[j], cells[k]];
      }
      const cw = bw / cols;
      const ch = bh / rows;
      objs.forEach((obj, k) => {
        const cell = cells[k];
        const x = (cell % cols) * cw + (cw - size) / 2 + (r() - 0.5) * Math.max(0, cw - size) * 0.8;
        const y = Math.floor(cell / cols) * ch + (ch - size) / 2 + (r() - 0.5) * Math.max(0, ch - size) * 0.8;
        obj.style.left = `${x}px`;
        obj.style.top = `${y}px`;
        obj.style.transform = `rotate(${((r() - 0.5) * 24).toFixed(1)}deg)`;
      });
    } else {
      // Rows of five: easier to count and to see "5 and 2 more".
      box.style.maxWidth = `${Math.min(groupW, 5 * (size + 10))}px`;
    }
    el.append(box);
  });
}

// ---------------------------------------------------------------------------
// The renderer
// ---------------------------------------------------------------------------

/** Lays out n props in rows of `cols`, centred in a box. */
function propGrid(id: PropId, n: number, x: number, y: number, w: number, hgt: number, cols: number, maxSize = 84, fadeFrom = Infinity): Node[] {
  if (n <= 0) return [];
  const rows = Math.ceil(n / cols);
  const size = Math.min(maxSize, w / cols, hgt / rows);
  const gx = x + (w - Math.min(n, cols) * size) / 2;
  const gy = y + (hgt - rows * size) / 2;
  const nodes: Node[] = [];
  for (let i = 0; i < n; i++) nodes.push(propAt(id, gx + (i % cols) * size + size * 0.04, gy + Math.floor(i / cols) * size + size * 0.04, size * 0.92, i >= fadeFrom ? 'opacity="0.35"' : ''));
  return nodes;
}

function describe(v: Visual): string {
  switch (v.type) {
    case 'clock':
      return `A clock showing ${timeWords(v.hour, v.minute)}`;
    case 'coins':
      return `Coins: ${v.coins.map(moneyText).join(', ')}`;
    case 'shape':
      return 'A shape';
    default:
      return `A picture (${v.type})`;
  }
}

/** Renders a visual into a box of the given size. Returns the element. */
export function renderVisual(v: Visual, w: number, hgt: number): HTMLElement {
  const el = h('div', { class: `visual visual-${v.type}`, style: `width:${w}px;height:${hgt}px`, 'data-kind': v.type });
  const name = 'visual-' + JSON.stringify(v);
  const nodes: Node[] = [];
  switch (v.type) {
    case 'none':
      return el;
    case 'objects':
      renderObjects(el, v, w, hgt);
      return el;
    case 'dots': {
      if (v.pattern === 'dice') {
        const dice = v.count > 6 ? [6, v.count - 6] : [v.count];
        const size = Math.min(240, hgt - 60);
        const gap = 60;
        const x0 = (w - dice.length * size - (dice.length - 1) * gap) / 2;
        dice.forEach((n, i) => nodes.push(...drawDice(n, x0 + i * (size + gap), (hgt - size) / 2, size)));
      } else {
        const frames = v.count > 10 ? [10, v.count - 10] : [v.count];
        const cell = frames.length > 1 ? 72 : 86;
        const fs = tenFrameSize(cell);
        const gap = 40;
        const x0 = (w - frames.length * fs.w - (frames.length - 1) * gap) / 2;
        frames.forEach((n, i) => nodes.push(...drawTenFrame(n, x0 + i * (fs.w + gap), (hgt - fs.h) / 2, cell, { dots: true })));
      }
      break;
    }
    case 'tenFrame': {
      const n = v.frames.length;
      const cell = n > 1 ? Math.min(76, (w - 60) / (n * 5.24 + 0.6)) : 90;
      const fs = tenFrameSize(cell);
      const gap = 40;
      const x0 = (w - n * fs.w - (n - 1) * gap) / 2;
      // Adding fills the frames in order (finish the first ten, then the
      // next); taking away starts from the last filled cells.
      const adds = v.frames.map(() => 0);
      let toAdd = v.add ?? 0;
      v.frames.forEach((filled, i) => {
        const take = Math.min(toAdd, 10 - filled);
        adds[i] = take;
        toAdd -= take;
      });
      const removes = v.frames.map(() => 0);
      let toRemove = v.remove ?? 0;
      for (let i = n - 1; i >= 0; i--) {
        const take = Math.min(toRemove, v.frames[i]);
        removes[i] = take;
        toRemove -= take;
      }
      v.frames.forEach((filled, i) => {
        nodes.push(...drawTenFrame(filled, x0 + i * (fs.w + gap), (hgt - fs.h) / 2, cell, { prop: v.prop, add: adds[i] || undefined, remove: removes[i] || undefined }));
      });
      break;
    }
    case 'numberLine': {
      const step = v.step ?? 1;
      const ticks = Math.max(1, Math.round((v.to - v.from) / step));
      const x0 = 50;
      const x1 = w - 50;
      const y = hgt * 0.5;
      const dx = (x1 - x0) / ticks;
      const every = ticks <= 20 ? 1 : ticks <= 50 ? 5 : 10;
      // The ladder rail: a long strip of bark paper.
      nodes.push(piece(rect(x0 - 24, y - 9, x1 - x0 + 48, 18, 6), C.bark, { edge: 'torn', rough: 0.7 }));
      const marks = new Set(v.marks ?? []);
      for (let i = 0; i <= ticks; i++) {
        const value = v.from + i * step;
        const tx = x0 + i * dx;
        const labelled = i % every === 0 || value === v.start || marks.has(value);
        nodes.push(line(tx, y - (labelled ? 26 : 16), tx, y + (labelled ? 26 : 16), C.ink, labelled ? 5 : 3));
        if (marks.has(value)) nodes.push(piece(circle(tx, y + 62, 26), C.goldLight, { edge: 'cut' }));
        if (labelled) nodes.push(label(tx, y + 62, String(value), Math.min(34, Math.max(22, dx * 0.62 * every)), value === v.start ? C.red : C.ink));
      }
      const sx = x0 + ((v.start - v.from) / step) * dx;
      // Where he starts: a red marker above the line.
      nodes.push(piece(poly([[sx, y - 30], [sx - 18, y - 62], [sx + 18, y - 62]]), C.red, { edge: 'cut' }));
      nodes.push(piece(circle(sx, y - 74, 20), C.red, { edge: 'cut' }));
      break;
    }
    case 'partWhole': {
      const known = v.parts.filter((p): p is number => p !== null);
      const whole = v.whole ?? known.reduce((a, b) => a + b, 0);
      if (v.model === 'cherry') {
        const r = Math.min(72, hgt * 0.2);
        const wy = r + 16;
        const py = hgt - r - 16;
        const spread = v.parts.length > 2 ? 250 : 190;
        const pxs = v.parts.map((_, i) => w / 2 + (i - (v.parts.length - 1) / 2) * spread);
        pxs.forEach((px) => nodes.push(ink([[w / 2, wy + r * 0.8], [px, py - r * 0.8]], { width: 7, color: C.barkDark, wobble: 0 })));
        const ball = (cx: number, cy: number, value: number | null, fill: string) => (value === null ? missing(cx, cy, r) : [piece(circle(cx, cy, r), fill, { edge: 'cut' }), label(cx, cy + 2, String(value), r * 0.9, C.ink)]);
        nodes.push(...ball(w / 2, wy, v.whole, C.goldLight));
        v.parts.forEach((p, i) => nodes.push(...ball(pxs[i], py, p, C.cream)));
      } else {
        const bx = 90;
        const bw = w - 180;
        const bh = Math.min(100, hgt * 0.3);
        const y1 = (hgt - bh * 2 - 30) / 2;
        const y2 = y1 + bh + 30;
        const box = (x: number, y: number, ww: number, value: number | null, fill: string): Node[] =>
          value === null
            ? [raw(`<rect x="${x + 4}" y="${y}" width="${ww - 8}" height="${bh}" rx="8" fill="rgba(255,248,230,0.55)" stroke="${C.red}" stroke-width="5" stroke-dasharray="14 10"/>`), label(x + ww / 2, y + bh / 2, '?', bh * 0.7, C.red)]
            : [piece(rect(x + 4, y, ww - 8, bh, 6), fill, { edge: 'cut' }), label(x + ww / 2, y + bh / 2 + 2, String(value), bh * 0.62, C.ink)];
        nodes.push(...box(bx, y1, bw, v.whole, C.goldLight));
        const sumKnown = known.reduce((a, b) => a + b, 0);
        const nMissing = v.parts.length - known.length;
        const vals = v.parts.map((p) => p ?? Math.max(1, (whole - sumKnown) / Math.max(1, nMissing)));
        const tot = vals.reduce((a, b) => a + b, 0) || 1;
        const minShare = 0.2;
        const shares = vals.map((x) => Math.max(minShare, x / tot));
        const sTot = shares.reduce((a, b) => a + b, 0);
        let x = bx;
        v.parts.forEach((p, i) => {
          const ww = (shares[i] / sTot) * bw;
          nodes.push(...box(x, y2, ww, p, i % 2 ? C.sky : C.leafLight));
          x += ww;
        });
      }
      break;
    }
    case 'compare': {
      const half = w / 2;
      if (v.asObjects === 'stick') {
        // Bundles of ten and single sticks on each side.
        nodes.push(...tensOnesNodes(Math.floor(v.left / 10), v.left % 10, 10, 10, half - 70, hgt - 20));
        nodes.push(...tensOnesNodes(Math.floor(v.right / 10), v.right % 10, half + 60, 10, half - 70, hgt - 20));
      } else if (v.asObjects) {
        const cols = 5;
        const maxN = Math.max(v.left, v.right, 1);
        const rows = Math.ceil(maxN / cols);
        const size = Math.min(80, (hgt - 70) / rows, (half - 70) / cols);
        const tray = (x: number, n: number) => {
          const tw = cols * size + 30;
          const th = rows * size + 30;
          const tx = x + (half - tw) / 2;
          const ty = (hgt - th) / 2;
          const out: Node[] = [piece(rect(tx, ty, tw, th, 16), C.cream, { edge: 'torn' })];
          // Left-aligned rows, so the two sides line up one-to-one.
          for (let i = 0; i < n; i++) out.push(propAt(v.asObjects as PropId, tx + 15 + (i % cols) * size, ty + 15 + Math.floor(i / cols) * size, size * 0.94));
          return out;
        };
        nodes.push(...tray(0, v.left), ...tray(half, v.right));
      } else {
        const card = (cx: number, n: number) => [piece(rect(cx - 130, hgt / 2 - 110, 260, 220, 18), C.cream, { edge: 'torn' }), label(cx, hgt / 2 + 4, String(n), 130, C.ink)];
        nodes.push(...card(half / 2 + 40, v.left), ...card(half + half / 2 - 40, v.right));
      }
      nodes.push(piece(circle(half, hgt / 2, 36), C.goldLight, { edge: 'cut' }), label(half, hgt / 2 + 2, '?', 46, C.ink));
      break;
    }
    case 'tensOnes':
      nodes.push(...(v.tens || v.ones ? tensOnesNodes(v.tens, v.ones, 0, 0, w, hgt) : emptyMat(w, hgt)));
      break;
    case 'groups': {
      if (v.layout === 'array') {
        nodes.push(...propGrid(v.prop, v.groups * v.each, 40, 10, w - 80, hgt - 20, v.each, 80));
      } else {
        // Each group sits on its own torn paper plate.
        const n = v.groups;
        const perRow = n <= 5 ? n : Math.ceil(n / 2);
        const rowsG = Math.ceil(n / perRow);
        const gw = (w - 20) / perRow;
        const gh = hgt / rowsG;
        const cols = v.each <= 3 ? v.each : v.each <= 6 ? Math.ceil(v.each / 2) : Math.ceil(v.each / 3);
        for (let i = 0; i < n; i++) {
          const gx = 10 + (i % perRow) * gw;
          const gy = Math.floor(i / perRow) * gh;
          const rx = gw / 2 - 10;
          const ry = Math.min(gh / 2 - 8, rx * 0.8);
          nodes.push(piece(ellipse(gx + gw / 2, gy + gh / 2, rx, ry), C.cream, { edge: 'torn' }));
          nodes.push(...propGrid(v.prop, v.each, gx + gw / 2 - rx * 0.72, gy + gh / 2 - ry * 0.72, rx * 1.44, ry * 1.44, cols, 100));
        }
      }
      break;
    }
    case 'share': {
      // The things to share along the top; one empty plate each below.
      const topH = hgt * 0.5;
      const cols = v.total <= 8 ? v.total : Math.ceil(v.total / 2);
      nodes.push(...propGrid(v.prop, v.total, 30, 0, w - 60, topH, cols, 90));
      const pw = Math.min(200, (w - 40) / v.between - 20);
      const x0 = (w - v.between * (pw + 20) + 20) / 2;
      for (let i = 0; i < v.between; i++) {
        const cx = x0 + i * (pw + 20) + pw / 2;
        nodes.push(piece(ellipse(cx, topH + (hgt - topH) / 2 + 10, pw / 2, (hgt - topH) / 2 - 18), C.white, { edge: 'torn' }));
        nodes.push(raw(`<ellipse cx="${cx}" cy="${topH + (hgt - topH) / 2 + 10}" rx="${pw / 2 - 16}" ry="${(hgt - topH) / 2 - 34}" fill="none" stroke="${C.cloudShade}" stroke-width="4"/>`));
      }
      break;
    }
    case 'fraction': {
      const r = Math.min(150, hgt / 2 - 20);
      nodes.push(...fractionNodes(v.shape, v.parts, v.shaded, w / 2, hgt / 2, v.shape === 'circle' ? r : r * 0.95, v.equal !== false));
      break;
    }
    case 'clock': {
      const size = hgt;
      el.innerHTML = drawClock(v.hour, v.minute, size, { name }).replace('<svg ', `<svg style="width:${size}px;height:${size}px" `);
      el.setAttribute('aria-label', describe(v));
      return el;
    }
    case 'coins': {
      const priceW = v.target !== undefined ? 230 : 0;
      const area = w - priceW - 40;
      const n = Math.max(1, v.coins.length);
      const perRow = n <= 6 ? n : Math.ceil(n / 2);
      const rows = Math.ceil(n / perRow);
      const cellW = Math.min(200, area / perRow);
      const cellH = Math.min(200, (hgt - 20) / rows);
      const cell = Math.min(cellW, cellH);
      const x0 = 20 + (area - perRow * cell) / 2;
      const y0 = (hgt - rows * cell) / 2;
      v.coins.forEach((c, i) => {
        const d = (cell * 0.92 * coinMm(c)) / COIN_MM[200];
        nodes.push(...coinNodes(c, x0 + (i % perRow) * cell + cell / 2, y0 + Math.floor(i / perRow) * cell + cell / 2, d));
      });
      if (v.target !== undefined) nodes.push(...priceTag(w - priceW - 10, hgt / 2 - 80, priceW, 160, v.target));
      break;
    }
    case 'shape': {
      const r = hgt * 0.44;
      nodes.push(...shapeNodes(v.shape, w / 2, hgt / 2, r, { turned: v.turned, fill: shapeFill(name) }));
      break;
    }
    case 'length':
      nodes.push(...drawLengths(v.lengths, v.unit, w, hgt));
      break;
  }
  el.innerHTML = paper(w, hgt, name, nodes, describe(v));
  return el;
}

/** A toy-shop price tag on a string. */
export function priceTag(x: number, y: number, w: number, hgt: number, pence: number): Node[] {
  return [
    ink([[x + 30, y + 10], [x + 4, y - 30]], { width: 3, color: C.ink, wobble: 0 }),
    piece(poly([[x, y + hgt * 0.5], [x + 40, y], [x + w, y], [x + w, y + hgt], [x + 40, y + hgt]]), C.white, { edge: 'cut' }),
    raw(`<circle cx="${x + 30}" cy="${y + hgt * 0.5}" r="9" fill="${C.cloudShade}"/>`),
    label(x + 40 + (w - 40) / 2, y + hgt / 2 + 3, moneyText(pence), Math.min(80, hgt * 0.5), C.red),
  ];
}

