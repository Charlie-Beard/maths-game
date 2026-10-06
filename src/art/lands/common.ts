/**
 * Shared pieces for the land backdrops: skies, hills, clouds, little
 * houses, bunting and stars. Each land file (l1.ts … l10.ts) builds two
 * pictures from these and its own details:
 *
 *   - far:   the land as seen from the top of the ladder, 600 × 180,
 *            sitting on its cloud (the map puts it at the top of the tree)
 *   - scene: a 1180 × 820 ground-level backdrop for stories and finales
 *
 * Backdrops never boil: they sit behind everything and must never compete
 * for his attention.
 */
import { C } from '../palette';
import { band, circle, curve, ellipse, group, piece, poly, rect, rng, svg, type Node, type Pt } from '../paper';

export const FAR_W = 600;
export const FAR_H = 180;
export const SCENE_W = 1180;
export const SCENE_H = 820;

/** Flat, quiet pieces (background details that shouldn't cast shadows). */
export const flat = { edge: 'cut' as const, fibre: false as const, shadow: false };

/** Renders a land's far view (600 × 180). */
export const farSvg = (name: string, nodes: Node[], label?: string): string =>
  svg({ w: FAR_W, h: FAR_H, name, boil: false, className: 'land-far', label }, nodes);

/** Renders a land's ground-level scene (1180 × 820). */
export const sceneSvg = (name: string, nodes: Node[]): string =>
  svg({ w: SCENE_W, h: SCENE_H, name, boil: false, className: 'backdrop' }, nodes);

/** Horizontal sky bands, top to bottom: [colour, top y]. Each runs to the next. */
export function sky(bands: [string, number][], w = SCENE_W, h = SCENE_H): Node[] {
  return bands.map(([color, y], i) => {
    const next = i + 1 < bands.length ? bands[i + 1][1] + 30 : h + 20;
    return piece(rect(-20, y - (i ? 10 : 20), w + 40, next - y + 10), color, { edge: i ? 'torn' : 'clean', rough: 2, fibre: false, shadow: false });
  });
}

/** A torn strip of rolling hills whose top wanders around y. */
export function hills(y: number, amp: number, color: string, seed: number, o: { w?: number; step?: number; bottom?: number } = {}): Node {
  const r = rng(seed);
  const w = o.w ?? SCENE_W;
  const step = o.step ?? 90;
  const bottom = o.bottom ?? SCENE_H + 40;
  const pts: Pt[] = [[-40, bottom]];
  for (let x = -40; x <= w + 40; x += step) pts.push([x, y - r() * amp]);
  pts.push([w + 40, bottom]);
  return piece(curve(pts, 2), color, { rough: 1.4 });
}

/** Little cut-paper stars scattered over the top of the sky. */
export function stars(count: number, seed: number, w: number, maxY: number, colors: string[] = [C.cream, C.goldLight], minY = 0): Node[] {
  const r = rng(seed);
  const out: Node[] = [];
  for (let i = 0; i < count; i++) {
    const x = r() * w;
    const y = minY + r() * (maxY - minY);
    const s = 2 + r() * 5;
    out.push(piece(star(x, y, s, s * 0.4, 4), colors[i % colors.length], { ...flat, opacity: 0.55 + r() * 0.4 }));
  }
  return out;
}

/** A pointy star outline. */
export function star(cx: number, cy: number, r: number, inner = r * 0.45, points = 5, rot = -90): Pt[] {
  const pts: Pt[] = [];
  for (let k = 0; k < points * 2; k++) {
    const a = ((rot + (k * 180) / points) * Math.PI) / 180;
    const rr = k % 2 ? inner : r;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return pts;
}

/** A crescent moon: a pale disc with the sky colour bitten out of it. */
export function crescent(cx: number, cy: number, r: number, color: string, skyColor: string): Node[] {
  return [piece(circle(cx, cy, r), color, { rough: 0.8 }), piece(circle(cx + r * 0.42, cy - r * 0.16, r * 0.86), skyColor, { ...flat, edge: 'cut' })];
}

/** A lumpy cloud bank centred on (cx, cy). */
export function cloudBank(cx: number, cy: number, w: number, seed: number, color: string = C.cloud, shade: string = C.cloudShade): Node[] {
  const r = rng(seed);
  const out: Node[] = [];
  const n = Math.max(3, Math.round(w / 70));
  out.push(piece(ellipse(cx, cy + 22, w / 2 + 6, 26), shade, { shadow: false, fibre: false }));
  for (let i = 0; i < n; i++) {
    const x = cx - w / 2 + (i + 0.5) * (w / n);
    const rr = Math.min(40 + r() * 26, w / n);
    out.push(piece(circle(x, cy - r() * 22, rr), color, { shadow: i === 0 || i === n - 1 }));
  }
  out.push(piece(ellipse(cx, cy + 14, w / 2, 26), color, { shadow: false }));
  return out;
}

/** A single soft cloud for a sky. */
export function cloud(cx: number, cy: number, w: number, seed: number, color: string = C.cloud, opacity = 1): Node {
  const r = rng(seed);
  const parts: Node[] = [];
  const n = 3 + Math.round(w / 90);
  for (let i = 0; i < n; i++) {
    const x = cx - w / 2 + (i + 0.5) * (w / n);
    parts.push(piece(circle(x, cy - Math.sin((i / (n - 1)) * Math.PI) * w * 0.12 - r() * 6, w / n / 1.3 + r() * 8), color, { shadow: false, fibre: false }));
  }
  parts.push(piece(ellipse(cx, cy + 4, w / 2, w * 0.09), color, { shadow: false, fibre: false }));
  return group({ opacity }, parts);
}

/**
 * The cloud the far view sits on: a ground blob in the land's colour with
 * the cloud wrapping round its base. Every far view starts with this.
 */
export function farBase(ground: string, seed: number, o: { top?: number; cloud?: string; shade?: string } = {}): { back: Node[]; front: Node[] } {
  const top = o.top ?? 128;
  const color = o.cloud ?? C.cloud;
  const r = rng(seed);
  const front: Node[] = [piece(ellipse(300, 170, 292, 10), o.shade ?? C.cloudShade, { shadow: false, fibre: false })];
  // Small puffs along the rim, bigger at the ends, so the land's edge sinks into the cloud.
  for (let i = 0; i < 15; i++) {
    const x = 20 + i * 40 + (r() - 0.5) * 10;
    const end = Math.abs(i - 7) / 7;
    front.push(piece(circle(x, 164 - r() * 3 - end * 8, 11 + end * 16 + r() * 4), color, { shadow: i === 0 || i === 14, rough: 0.8 }));
  }
  front.push(piece(ellipse(300, 167, 288, 9), color, { shadow: false, rough: 0.8 }));
  return {
    back: [piece(curve([[30, 168], [60, top + 4], [180, top - 6], [300, top], [430, top - 8], [540, top + 2], [572, 168]], 2), ground, { rough: 1.3 })],
    front,
  };
}

/** A round leafy tree. */
export function roundTree(x: number, baseY: number, h: number, seed: number, leaves: string[] = [C.leafDark, C.leaf, C.moss], trunk: string = C.bark): Node[] {
  const r = rng(seed);
  const crown = h * 0.42;
  return [
    piece(band([[x, baseY], [x + (r() - 0.5) * 6, baseY - h * 0.55]], Math.max(6, h * 0.1)), trunk, { rough: 0.8 }),
    ...leaves.map((c, i) => piece(circle(x + (r() - 0.5) * crown * 0.7, baseY - h + crown + (r() - 0.5) * crown * 0.4 + i * 4, crown * (0.62 + r() * 0.2)), c, { shadow: i === 0 })),
  ];
}

/** A pointy fir tree (Enchanted Wood, Snow). */
export function firTree(x: number, baseY: number, h: number, color: string, trunk: string = C.barkDark, snow?: string): Node[] {
  const w = h * 0.42;
  const out: Node[] = [piece(rect(x - h * 0.04, baseY - h * 0.18, h * 0.08, h * 0.2), trunk, { edge: 'cut' })];
  for (let i = 0; i < 3; i++) {
    const top = baseY - h + i * h * 0.24;
    const bot = baseY - h * 0.12 - (2 - i) * h * 0.16;
    const ww = w * (0.6 + i * 0.2);
    out.push(piece(poly([[x, top], [x + ww, bot], [x - ww, bot]]), color, { rough: 0.9 }));
    if (snow) out.push(piece(poly([[x, top + 2], [x + ww * 0.34, top + (bot - top) * 0.36], [x, top + (bot - top) * 0.3], [x - ww * 0.34, top + (bot - top) * 0.36]]), snow, { edge: 'cut', shadow: false }));
  }
  return out;
}

/** A toadstool with white spots. */
export function toadstool(x: number, baseY: number, s: number, cap: string = C.toadCap): Node[] {
  return [
    piece(curve([[x - s * 0.18, baseY], [x - s * 0.13, baseY - s * 0.6], [x + s * 0.13, baseY - s * 0.6], [x + s * 0.18, baseY]], 1), C.cream, { rough: 0.6 }),
    piece(curve([[x - s * 0.55, baseY - s * 0.52], [x - s * 0.4, baseY - s * 0.92], [x, baseY - s * 1.05], [x + s * 0.4, baseY - s * 0.92], [x + s * 0.55, baseY - s * 0.52]], 2), cap, { rough: 0.7 }),
    piece(circle(x - s * 0.22, baseY - s * 0.78, s * 0.07), C.white, flat),
    piece(circle(x + s * 0.12, baseY - s * 0.88, s * 0.09), C.white, flat),
    piece(circle(x + s * 0.34, baseY - s * 0.66, s * 0.06), C.white, flat),
    piece(circle(x - s * 0.02, baseY - s * 0.64, s * 0.05), C.white, flat),
  ];
}

export interface HouseOpts {
  wall: string;
  roof: string;
  door?: string;
  window?: string;
  /** Turns the whole house upside down (Topsy-Turvy). */
  flip?: boolean;
  chimney?: boolean;
}

/** A little crooked cottage standing on baseY (centre x). */
export function house(x: number, baseY: number, w: number, h: number, o: HouseOpts): Node {
  const left = x - w / 2;
  const top = baseY - h;
  const roofH = h * 0.55;
  const nodes: Node[] = [
    ...(o.chimney ? [piece(rect(left + w * 0.66, top - roofH * 0.8, w * 0.14, roofH * 0.7), C.brownDark, { edge: 'cut' })] : []),
    piece(rect(left, top, w, h, 3), o.wall, { rough: 0.8 }),
    piece(poly([[left - w * 0.1, top + 4], [x + (o.flip ? 4 : -4), top - roofH], [left + w * 1.1, top + 4]]), o.roof, { rough: 0.8 }),
    piece(rect(x - w * 0.12, baseY - h * 0.5, w * 0.24, h * 0.5, w * 0.1), o.door ?? C.brownDark, { edge: 'cut' }),
    piece(rect(left + w * 0.1, top + h * 0.18, w * 0.22, h * 0.24, 2), o.window ?? C.candle, { edge: 'cut', fibre: false }),
    piece(rect(left + w * 0.68, top + h * 0.18, w * 0.22, h * 0.24, 2), o.window ?? C.candle, { edge: 'cut', fibre: false }),
  ];
  if (!o.flip) return group({}, nodes);
  // Upside down: mirror about the middle of the house body, so it balances on its roof.
  const cy = baseY - h - roofH;
  return group({ transform: `translate(0 ${cy + baseY}) scale(1 -1)` }, nodes);
}

/** A string of bunting flags hanging between two points. */
export function bunting(a: Pt, b: Pt, sag: number, colors: string[], flagW = 26): Node[] {
  const out: Node[] = [];
  const n = Math.max(2, Math.floor(Math.hypot(b[0] - a[0], b[1] - a[1]) / (flagW * 1.3)));
  const at = (t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + Math.sin(t * Math.PI) * sag];
  const line: Pt[] = [];
  for (let i = 0; i <= 12; i++) line.push(at(i / 12));
  out.push(piece(band(line, 3), C.brownDark, { edge: 'clean', shadow: false }));
  for (let i = 0; i < n; i++) {
    const t0 = (i + 0.2) / n;
    const t1 = (i + 0.8) / n;
    const p0 = at(t0);
    const p1 = at(t1);
    const mid = at((t0 + t1) / 2);
    out.push(piece(poly([p0, p1, [mid[0], mid[1] + flagW * 1.1]]), colors[i % colors.length], { edge: 'cut', fibre: false }));
  }
  return out;
}

/** A balloon on a string. */
export function balloon(x: number, y: number, r: number, color: string, stringLen = r * 2.4): Node[] {
  return [
    piece(band([[x, y + r * 1.15], [x + r * 0.3, y + r * 1.15 + stringLen * 0.5], [x - r * 0.1, y + r * 1.15 + stringLen]], 2), C.ink, { edge: 'clean', shadow: false, opacity: 0.7 }),
    piece(ellipse(x, y, r * 0.86, r), color, { rough: 0.7 }),
    piece(poly([[x - r * 0.14, y + r * 1.12], [x + r * 0.14, y + r * 1.12], [x, y + r * 0.96]]), color, flat),
    piece(ellipse(x - r * 0.32, y - r * 0.36, r * 0.14, r * 0.24, 20), C.white, { ...flat, opacity: 0.5 }),
  ];
}

/** A rounded window pane with a cross frame. */
export function pane(x: number, y: number, w: number, h: number, glass: string, frame: string): Node[] {
  return [
    piece(rect(x - 4, y - 4, w + 8, h + 8, 4), frame, { edge: 'cut' }),
    piece(rect(x, y, w, h, 3), glass, { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(x + w / 2 - 2, y, 4, h), frame, { edge: 'clean', shadow: false }),
    piece(rect(x, y + h / 2 - 2, w, 4), frame, { edge: 'clean', shadow: false }),
  ];
}
