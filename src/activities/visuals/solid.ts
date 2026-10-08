/**
 * The `solid` visual (land 13, Roundabouts): 3D shapes cut from paper and
 * drawn the way a child draws a box: the front face square-on, the top
 * and the right-hand side sloping back. Each solid has a light side (top),
 * a middle side (front) and a dark side (right), so faces read as faces.
 *
 *   cube, cuboid, pyramid: flat faces, with every edge drawn as a crisp line
 *   cylinder, cone:        a curved side with flat round ends
 *   sphere:                a ball with a dark crescent and a shine
 *
 * Options: `seeThrough` fades the faces and draws the hidden edges dashed;
 * `marks` numbers the corners or the edges (counting help); `face` colours
 * the front face gold; `lying` rests a cylinder or cone on its side so a
 * round end faces him (and shows as a true circle).
 *
 * Exported for the stories too: `drawSolid` (a square SVG), `solidAt` (paper
 * nodes to compose into a bigger picture), `SOLID_NAMES`, `SOLID_FILL`.
 */
import { C } from '../../art/palette';
import { circle, ellipse, piece, raw, svg, type Node, type Pt } from '../../art/paper';
import type { SolidId, Visual } from '../../core/problem';
import { label } from '../visual';

export const SOLID_NAMES: Record<SolidId, string> = {
  cube: 'cube',
  cuboid: 'cuboid',
  sphere: 'sphere',
  cylinder: 'cylinder',
  cone: 'cone',
  pyramid: 'pyramid',
};

/** Each solid's usual colour (the activity may swap them, so colour never gives the shape away). */
export const SOLID_FILL: Record<SolidId, string> = {
  cube: C.red,
  cuboid: C.blue,
  sphere: C.orange,
  cylinder: C.green,
  cone: C.purple,
  pyramid: C.teal,
};

export interface SolidOpts {
  fill?: string;
  seeThrough?: boolean;
  face?: boolean;
  lying?: boolean;
  marks?: 'edges' | 'corners';
}

// ---------------------------------------------------------------------------
// Colour

const hex = (c: string): [number, number, number] => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const mix = (a: string, b: string, t: number): string => {
  const x = hex(a);
  const y = hex(b);
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
const lighten = (c: string, t = 0.32): string => mix(c, '#ffffff', t);
const darken = (c: string, t = 0.3): string => mix(c, '#1e1710', t);

const GOLD_FACE = '#f7dc7e';

// ---------------------------------------------------------------------------
// Flat-faced solids: corners, edges and faces

interface Poly {
  verts: Pt[];
  /** [from, to, hidden]: hidden edges are behind the solid. */
  edges: [number, number, boolean][];
  faces: { v: number[]; shade: 'light' | 'mid' | 'dark'; front?: boolean }[];
  /** The outline, for a shadow. */
  hull: number[];
}

function box(cx: number, cy: number, S: number, kind: 'cube' | 'cuboid'): Poly {
  // Front width w, height h; the back is pushed up and right by (d, -e).
  const k = kind === 'cube' ? 0.676 * S : S / 2.45;
  const w = kind === 'cube' ? k : 1.9 * k;
  const h = k;
  const d = kind === 'cube' ? 0.42 * k : 0.55 * k;
  const e = d * 0.9;
  const x0 = cx - (w + d) / 2;
  const y0 = cy - (h + e) / 2 + e;
  const f: Pt[] = [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]];
  const b: Pt[] = f.map(([x, y]) => [x + d, y - e] as Pt);
  return {
    verts: [...f, ...b],
    edges: [[0, 1, false], [1, 2, false], [2, 3, false], [3, 0, false], [4, 5, false], [5, 6, false], [6, 7, true], [7, 4, true], [0, 4, false], [1, 5, false], [2, 6, false], [3, 7, true]],
    faces: [
      { v: [0, 1, 5, 4], shade: 'light' },
      { v: [1, 2, 6, 5], shade: 'dark' },
      { v: [0, 1, 2, 3], shade: 'mid', front: true },
    ],
    hull: [0, 3, 2, 6, 5, 4],
  };
}

function pyramid(cx: number, cy: number, S: number): Poly {
  const raw4: Pt[] = [[0, 0], [1, 0], [1.45, -0.4], [0.45, -0.4], [0.725, -1.2]];
  const s = S / 1.45;
  const verts = raw4.map(([x, y]) => [cx + (x - 0.725) * s, cy + (y + 0.6) * s] as Pt);
  return {
    verts,
    edges: [[0, 1, false], [1, 2, false], [2, 3, true], [3, 0, true], [0, 4, false], [1, 4, false], [2, 4, false], [3, 4, true]],
    faces: [
      { v: [1, 2, 4], shade: 'dark' },
      { v: [0, 1, 4], shade: 'mid', front: true },
    ],
    hull: [0, 1, 2, 4],
  };
}

function polyOf(id: SolidId, cx: number, cy: number, S: number): Poly | null {
  if (id === 'cube' || id === 'cuboid') return box(cx, cy, S, id);
  if (id === 'pyramid') return pyramid(cx, cy, S);
  return null;
}

/** The corners and edges of a flat-faced solid, for counting help and tests: count = verts.length / edges.length. */
export function solidCounts(id: SolidId): { corners: number; edges: number } | null {
  const p = polyOf(id, 0, 0, 100);
  return p ? { corners: p.verts.length, edges: p.edges.length } : null;
}

const path = (pts: Pt[]): string => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('') + 'Z';
const SHADOW = 'rgba(28,18,8,0.24)';

function numberDot(x: number, y: number, n: number): Node[] {
  return [piece(circle(x, y, 17), C.goldLight, { edge: 'clean', shadow: false }), raw(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="17" fill="none" stroke="${C.ink}" stroke-width="2.5"/>`), label(x, y + 1, String(n), 22, C.ink)];
}

function drawPoly(p: Poly, fill: string, o: SolidOpts): Node[] {
  const nodes: Node[] = [raw(`<path d="${path(p.hull.map((i) => p.verts[i]))}" fill="${SHADOW}" transform="translate(4 7)"/>`)];
  const through = o.seeThrough || !!o.marks;
  const shade = { light: lighten(fill), mid: fill, dark: darken(fill, 0.26) };
  const line = darken(fill, 0.55);
  for (const f of p.faces) {
    const col = o.face && f.front ? GOLD_FACE : shade[f.shade];
    nodes.push(piece(f.v.map((i) => p.verts[i]), col, { edge: 'clean', shadow: false, opacity: through ? 0.62 : undefined }));
  }
  const ln = (a: Pt, b: Pt, extra: string): Node => raw(`<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${line}" stroke-linecap="round" ${extra}/>`);
  for (const [a, b, hidden] of p.edges) {
    if (hidden) {
      if (through) nodes.push(ln(p.verts[a], p.verts[b], 'stroke-width="3" stroke-dasharray="9 8" opacity="0.8"'));
    } else nodes.push(ln(p.verts[a], p.verts[b], `stroke-width="${o.face ? 3 : 4}"`));
  }
  if (o.face) {
    const front = p.faces.find((f) => f.front);
    if (front) nodes.push(raw(`<path d="${path(front.v.map((i) => p.verts[i]))}" fill="none" stroke="${C.gold}" stroke-width="7" stroke-linejoin="round"/>`));
  }
  if (o.marks === 'corners') p.verts.forEach(([x, y], i) => nodes.push(...numberDot(x, y, i + 1)));
  if (o.marks === 'edges') p.edges.forEach(([a, b], i) => nodes.push(...numberDot((p.verts[a][0] + p.verts[b][0]) / 2, (p.verts[a][1] + p.verts[b][1]) / 2, i + 1)));
  return nodes;
}

// ---------------------------------------------------------------------------
// Curved solids

const arcPts = (cx: number, cy: number, rx: number, ry: number, t0: number, t1: number, n = 18): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = t0 + ((t1 - t0) * i) / n;
    return [cx + rx * Math.cos(t), cy + ry * Math.sin(t)] as Pt;
  });

function sphere(cx: number, cy: number, S: number, fill: string): Node[] {
  const R = S * 0.46;
  return [
    raw(`<ellipse cx="${cx}" cy="${(cy + R * 0.98).toFixed(1)}" rx="${(R * 0.7).toFixed(1)}" ry="${(R * 0.09).toFixed(1)}" fill="${SHADOW}"/>`),
    piece(circle(cx, cy, R), darken(fill, 0.3), { edge: 'clean', shadow: false }),
    piece(circle(cx - R * 0.07, cy - R * 0.07, R * 0.93), fill, { edge: 'clean', shadow: false }),
    piece(ellipse(cx - R * 0.36, cy - R * 0.4, R * 0.26, R * 0.17, -0.7), lighten(fill, 0.55), { edge: 'clean', shadow: false, opacity: 0.85 }),
    raw(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${darken(fill, 0.55)}" stroke-width="3.5"/>`),
  ];
}

function cylinder(cx: number, cy: number, S: number, fill: string, o: SolidOpts): Node[] {
  const line = darken(fill, 0.55);
  if (o.lying) return lyingCylinder(cx, cy, S, fill, o);
  const rx = S * 0.35;
  const ry = S * 0.15;
  const hh = S * 0.3;
  const body: Pt[] = [[cx - rx, cy - hh], ...arcPts(cx, cy + hh, rx, ry, Math.PI, 0), [cx + rx, cy - hh]];
  const k = 0.35;
  return [
    raw(`<path d="${path(body)}" fill="${SHADOW}" transform="translate(4 7)"/>`),
    piece(body, fill, { edge: 'clean', shadow: false }),
    piece([[cx + k * rx, cy - hh], [cx + rx, cy - hh], [cx + rx, cy + hh], ...arcPts(cx, cy + hh, rx, ry, 0, Math.acos(k))], darken(fill, 0.26), { edge: 'clean', shadow: false }),
    raw(`<path d="${path(body)}" fill="none" stroke="${line}" stroke-width="4" stroke-linejoin="round"/>`),
    piece(ellipse(cx, cy - hh, rx, ry), lighten(fill), { edge: 'clean', shadow: false }),
    raw(`<ellipse cx="${cx}" cy="${(cy - hh).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="none" stroke="${line}" stroke-width="4"/>`),
  ];
}

function lyingCylinder(cx: number, cy: number, S: number, fill: string, o: SolidOpts): Node[] {
  const r = S * 0.28;
  const dx = S * 0.34;
  const dy = S * 0.2;
  const fx = cx - dx / 2;
  const fy = cy + dy / 2;
  const bx = fx + dx;
  const by = fy - dy;
  const len = Math.hypot(dx, dy);
  const nx = dy / len;
  const ny = dx / len;
  const quad: Pt[] = [[fx + nx * r, fy + ny * r], [bx + nx * r, by + ny * r], [bx - nx * r, by - ny * r], [fx - nx * r, fy - ny * r]];
  const line = darken(fill, 0.55);
  return [
    raw(`<path d="${path(quad)}" fill="${SHADOW}" transform="translate(4 7)"/>`),
    piece(circle(bx, by, r), fill, { edge: 'clean', shadow: false }),
    piece(quad, fill, { edge: 'clean', shadow: false }),
    raw(`<line x1="${(fx - nx * r).toFixed(1)}" y1="${(fy - ny * r).toFixed(1)}" x2="${(bx - nx * r).toFixed(1)}" y2="${(by - ny * r).toFixed(1)}" stroke="${line}" stroke-width="4" stroke-linecap="round"/>`),
    raw(`<line x1="${(fx + nx * r).toFixed(1)}" y1="${(fy + ny * r).toFixed(1)}" x2="${(bx + nx * r).toFixed(1)}" y2="${(by + ny * r).toFixed(1)}" stroke="${line}" stroke-width="4" stroke-linecap="round"/>`),
    raw(`<path d="M${(bx - nx * r).toFixed(1)} ${(by - ny * r).toFixed(1)}A${r} ${r} 0 0 1 ${(bx + nx * r).toFixed(1)} ${(by + ny * r).toFixed(1)}" fill="none" stroke="${line}" stroke-width="4"/>`),
    piece(circle(fx, fy, r), o.face ? GOLD_FACE : lighten(fill), { edge: 'clean', shadow: false }),
    raw(`<circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="${r}" fill="none" stroke="${o.face ? C.gold : line}" stroke-width="${o.face ? 7 : 4}"/>`),
  ];
}

function cone(cx: number, cy: number, S: number, fill: string, o: SolidOpts): Node[] {
  if (o.lying) return lyingCone(cx, cy, S, fill, o);
  const line = darken(fill, 0.55);
  const apex: Pt = [cx, cy - S * 0.46];
  const by = cy + S * 0.3;
  const rx = S * 0.36;
  const ry = S * 0.14;
  const body: Pt[] = [apex, [cx - rx, by], ...arcPts(cx, by, rx, ry, Math.PI, 0), [cx + rx, by]];
  const k = 0.3;
  const dark: Pt[] = [apex, ...arcPts(cx, by, rx, ry, Math.acos(k), 0)];
  return [
    raw(`<path d="${path(body)}" fill="${SHADOW}" transform="translate(4 7)"/>`),
    piece(body, fill, { edge: 'clean', shadow: false }),
    piece(dark, darken(fill, 0.26), { edge: 'clean', shadow: false }),
    raw(`<path d="${path(body)}" fill="none" stroke="${line}" stroke-width="4" stroke-linejoin="round"/>`),
  ];
}

function lyingCone(cx: number, cy: number, S: number, fill: string, o: SolidOpts): Node[] {
  const r = S * 0.3;
  const fx = cx - S * 0.08;
  const fy = cy + S * 0.05;
  const ax = fx + S * 0.5;
  const ay = fy - S * 0.3;
  const vx = ax - fx;
  const vy = ay - fy;
  const d = Math.hypot(vx, vy);
  const phi = Math.acos(r / d);
  const turn = (ang: number): Pt => {
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    return [fx + ((vx / d) * c - (vy / d) * s) * r, fy + ((vx / d) * s + (vy / d) * c) * r];
  };
  const t1 = turn(phi);
  const t2 = turn(-phi);
  const low = t1[1] > t2[1] ? t1 : t2;
  const high = low === t1 ? t2 : t1;
  const line = darken(fill, 0.55);
  const body: Pt[] = [high, [ax, ay], low];
  return [
    raw(`<path d="${path([...body, [fx, fy]])}" fill="${SHADOW}" transform="translate(4 7)"/>`),
    piece(body, fill, { edge: 'clean', shadow: false }),
    piece([low, [ax, ay], [fx, fy]], darken(fill, 0.26), { edge: 'clean', shadow: false }),
    raw(`<polyline points="${high[0].toFixed(1)},${high[1].toFixed(1)} ${ax.toFixed(1)},${ay.toFixed(1)} ${low[0].toFixed(1)},${low[1].toFixed(1)}" fill="none" stroke="${line}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`),
    piece(circle(fx, fy, r), o.face ? GOLD_FACE : lighten(fill), { edge: 'clean', shadow: false }),
    raw(`<circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="${r}" fill="none" stroke="${o.face ? C.gold : line}" stroke-width="${o.face ? 7 : 4}"/>`),
  ];
}

// ---------------------------------------------------------------------------
// Public

/** One solid centred on (cx, cy), fitting a `size` × `size` box. */
export function solidAt(id: SolidId, cx: number, cy: number, size: number, o: SolidOpts = {}): Node[] {
  const fill = o.fill ?? SOLID_FILL[id];
  const poly = polyOf(id, cx, cy, size);
  if (poly) return drawPoly(poly, fill, o);
  if (id === 'sphere') return sphere(cx, cy, size, fill);
  if (id === 'cylinder') return cylinder(cx, cy, size, fill, o);
  return cone(cx, cy, size, fill, o);
}

/** One solid as a square SVG (cards, stories). */
export function drawSolid(id: SolidId, size: number, o: SolidOpts = {}): string {
  return svg({ w: size, h: size, name: `l13-solid-${id}-${o.fill ?? ''}-${o.lying ? 'l' : ''}`, label: `A ${SOLID_NAMES[id]}` }, solidAt(id, size / 2, size / 2, size * 0.94, o));
}

/** The `solid` visual: one big solid, or a row of them. */
export function solidNodes(v: Extract<Visual, { type: 'solid' }>, w: number, hgt: number, o: SolidOpts = {}): Node[] {
  const n = Math.max(1, v.solids.length);
  const size = Math.min(hgt * 0.94, (w / n) * 0.9, 400);
  const nodes: Node[] = [];
  v.solids.forEach((id, i) => {
    const cx = (w * (i + 0.5)) / n;
    nodes.push(...solidAt(id, cx, hgt / 2, size, { face: v.face, lying: v.lying, ...o }));
  });
  return nodes;
}
