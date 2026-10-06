/**
 * Paper art for workstream W2b's activities: the crocodile symbols, sticks
 * and ribbon-tied bundles, plates, the Saucepan Man's scales, the place
 * value mat, and pies and cakes cut into parts.
 *
 * All of it is drawn still (no boil), because nothing on a problem screen
 * moves while he's thinking.
 */
import { C } from '../art/palette';
import { band, circle, ellipse, group, ink, piece, poly, rect, svg, type Node, type Pt } from '../art/paper';

// ---------------------------------------------------------------------------
// < > = as a friendly crocodile: its jaws are the symbol, and it always
// opens its mouth towards the bigger number. "=" is the crocodile with its
// mouth shut, because both sides are the same.
// ---------------------------------------------------------------------------

const symbolCache = new Map<string, string>();

export function crocSymbol(s: '<' | '>' | '='): string {
  const hit = symbolCache.get(s);
  if (hit) return hit;
  const green = C.green;
  const nodes: Node[] = [];
  if (s === '=') {
    nodes.push(
      piece(band([[16, 44], [104, 44]], 20), green, { edge: 'cut' }),
      piece(band([[16, 78], [104, 78]], 20), C.greenDark, { edge: 'cut' }),
      ...[30, 50, 70, 90].map((x) => piece(poly([[x - 6, 53], [x + 6, 53], [x, 63]]), C.white, { edge: 'clean', shadow: false })),
      piece(circle(30, 30, 9), C.white, { edge: 'cut', shadow: false }),
      piece(circle(32, 30, 4.5), C.ink, { edge: 'clean', shadow: false }),
    );
  } else {
    // Drawn as "<" (mouth open to the right); ">" is the mirror image.
    const tip: Pt = [20, 60];
    const teeth: Node[] = [];
    for (let i = 1; i <= 3; i++) {
      const t = i / 4;
      const ux = tip[0] + (100 - tip[0]) * t;
      const uy = tip[1] + (16 - tip[1]) * t + 8;
      const ly = tip[1] + (104 - tip[1]) * t - 8;
      teeth.push(piece(poly([[ux - 6, uy - 1], [ux + 6, uy + 2], [ux - 1, uy + 12]]), C.white, { edge: 'clean', shadow: false }));
      teeth.push(piece(poly([[ux - 6, ly + 1], [ux + 6, ly - 2], [ux - 1, ly - 12]]), C.white, { edge: 'clean', shadow: false }));
    }
    nodes.push(
      group({ transform: s === '>' ? 'translate(120 0) scale(-1 1)' : undefined }, [
        piece(band([[104, 16], tip], 20), green, { edge: 'cut' }),
        piece(band([tip, [104, 104]], 20), C.greenDark, { edge: 'cut' }),
        ...teeth,
        piece(circle(44, 34, 9), C.white, { edge: 'cut', shadow: false }),
        piece(circle(45, 33, 4.5), C.ink, { edge: 'clean', shadow: false }),
        piece(circle(100, 14, 4), C.greenDark, { edge: 'clean', shadow: false }),
      ]),
    );
  }
  const out = svg({ w: 120, h: 120, name: 'croc' + s, boil: false, label: s }, nodes);
  symbolCache.set(s, out);
  return out;
}

// ---------------------------------------------------------------------------
// Sticks and bundles of ten
// ---------------------------------------------------------------------------

let stickSvg = '';
/** One stick, 24 × 160. */
export function stickArt(): string {
  if (!stickSvg) {
    stickSvg = svg({ w: 24, h: 160, name: 'b-stick', boil: false }, [
      piece(rect(6, 6, 12, 148, 5), C.wood, { edge: 'cut' }),
      piece(rect(8, 6, 4, 148, 2), C.barkLight, { edge: 'clean', shadow: false, opacity: 0.6 }),
    ]);
  }
  return stickSvg;
}

let bundleSvg = '';
/** Ten sticks tied with a red ribbon, 64 × 160. */
export function bundleArt(): string {
  if (!bundleSvg) {
    const sticks: Node[] = [];
    for (let i = 0; i < 10; i++) {
      const x = 4 + i * 5.2;
      sticks.push(piece(rect(x, 6 + (i % 3), 9, 146, 4), i % 2 ? C.wood : C.tan, { edge: 'cut', shadow: i === 9 }));
    }
    bundleSvg = svg({ w: 64, h: 160, name: 'b-bundle', boil: false }, [
      ...sticks,
      piece(rect(0, 70, 64, 18, 3), C.red, { edge: 'cut' }),
      piece(poly([[32, 79], [14, 64], [16, 94]]), C.redDark, { edge: 'cut' }),
      piece(poly([[32, 79], [50, 64], [48, 94]]), C.redDark, { edge: 'cut' }),
      piece(circle(32, 79, 6), C.red, { edge: 'cut' }),
    ]);
  }
  return bundleSvg;
}

/** The green felt mat sticks are built on, split into tens and ones. */
export function matArt(w: number, hgt: number, split: number): string {
  return svg({ w, h: hgt, name: 'b-mat', boil: false }, [
    piece(rect(6, 6, w - 12, hgt - 12, 18), C.greenDark, { edge: 'torn', rough: 1.4 }),
    piece(rect(18, 18, split - 26, hgt - 36, 12), C.leafDark, { edge: 'cut', shadow: false }),
    piece(rect(split + 8, 18, w - split - 26, hgt - 36, 12), C.leafDark, { edge: 'cut', shadow: false }),
  ]);
}

// ---------------------------------------------------------------------------
// Plates and rows (equal groups) and the sharing mats
// ---------------------------------------------------------------------------

const plateCache = new Map<string, string>();
export function plateArt(w: number, hgt: number, color: string = C.cream): string {
  const key = `${w}x${hgt}${color}`;
  const hit = plateCache.get(key);
  if (hit) return hit;
  const out = svg({ w, h: hgt, name: 'b-plate' + key, boil: false }, [
    piece(ellipse(w / 2, hgt / 2, w / 2 - 6, hgt / 2 - 6), C.stoneLight, { edge: 'cut' }),
    piece(ellipse(w / 2, hgt / 2, w / 2 - 16, hgt / 2 - 14), color, { edge: 'cut', shadow: false }),
  ]);
  plateCache.set(key, out);
  return out;
}

/** A long wooden shelf for a row of an array. */
export function shelfArt(w: number, hgt: number): string {
  return svg({ w, h: hgt, name: 'b-shelf' + w, boil: false }, [piece(rect(4, hgt - 22, w - 8, 16, 4), C.wood, { edge: 'cut' })]);
}

// ---------------------------------------------------------------------------
// The Saucepan Man's scales
// ---------------------------------------------------------------------------

/** The post, base and pivot. Drawn in a 860 × 360 box whose pivot is at (430, 60). */
export function scalesStandArt(): string {
  return svg({ w: 860, h: 360, name: 'b-scales-stand', boil: false }, [
    piece(rect(416, 60, 28, 270, 6), C.wood, { edge: 'cut' }),
    piece(rect(330, 316, 200, 34, 10), C.brown, { edge: 'torn' }),
    // Two little saucepans hanging off the base, for the Saucepan Man.
    piece(ellipse(372, 300, 24, 16), C.stone, { edge: 'cut' }),
    piece(rect(340, 294, 14, 6, 2), C.greyDark, { edge: 'clean' }),
    piece(ellipse(490, 302, 20, 14), C.stoneLight, { edge: 'cut' }),
    piece(rect(506, 297, 14, 6, 2), C.greyDark, { edge: 'clean' }),
  ]);
}

/** The beam, 600 × 40, pivot in the middle. */
export function beamArt(): string {
  return svg({ w: 600, h: 40, name: 'b-beam', boil: false }, [
    piece(rect(20, 12, 560, 16, 6), C.brownDark, { edge: 'cut' }),
    piece(circle(300, 20, 18), C.gold, { edge: 'cut' }),
    piece(circle(300, 20, 7), C.brownDark, { edge: 'clean', shadow: false }),
    piece(circle(30, 20, 9), C.gold, { edge: 'cut' }),
    piece(circle(570, 20, 9), C.gold, { edge: 'cut' }),
  ]);
}

/** A hanging pan: strings from the top centre down to a dish, w × hgt. */
export function panArt(w: number, hgt: number): string {
  const dishY = hgt - 34;
  return svg({ w, h: hgt, name: 'b-pan' + w, boil: false }, [
    ink([[w / 2, 4], [16, dishY]], { width: 3, color: C.greyDark, wobble: 0.3 }),
    ink([[w / 2, 4], [w - 16, dishY]], { width: 3, color: C.greyDark, wobble: 0.3 }),
    piece(poly([[6, dishY], [w - 6, dishY], [w - 40, hgt - 6], [40, hgt - 6]]), C.stone, { edge: 'cut' }),
    piece(rect(4, dishY - 6, w - 8, 12, 6), C.stoneLight, { edge: 'cut' }),
  ]);
}

// ---------------------------------------------------------------------------
// Pies and cakes cut into parts
// ---------------------------------------------------------------------------

export type FracShape = 'circle' | 'rect';

const SHADE = { circle: C.red, rect: C.purple };
const BASE = { circle: '#f3e3bf', rect: C.white };

/** Unequal cuts, for "is this really a half?" pictures. */
const UNEQUAL: Record<number, number[]> = { 2: [0.33, 0.67], 3: [0.18, 0.32, 0.5], 4: [0.12, 0.2, 0.28, 0.4] };

function shares(parts: number, equal: boolean): number[] {
  if (!equal && UNEQUAL[parts]) return UNEQUAL[parts];
  return Array.from({ length: parts }, () => 1 / parts);
}

/**
 * A pie (circle) or cake (rectangle) cut into parts, `shaded` of them
 * coloured in. Each part is a <g class="b-part" data-part="i"> so it can be
 * tapped; its shade layer shows when the part has class "is-shaded".
 * Drawn in a size × size box (cakes are wider than tall inside it).
 */
export function fractionArt(shape: FracShape, parts: number, shaded: number, o: { size: number; equal?: boolean; name: string }): string {
  const s = o.size;
  const sh = shares(parts, o.equal !== false);
  const nodes: Node[] = [];
  const outlines: Pt[][] = [];
  if (shape === 'circle') {
    const cx = s / 2;
    const cy = s / 2;
    const r = s / 2 - 10;
    let a0 = -Math.PI / 2;
    for (let i = 0; i < parts; i++) {
      const a1 = a0 + sh[i] * Math.PI * 2;
      const pts: Pt[] = [[cx, cy]];
      const n = Math.max(6, Math.round(sh[i] * 64));
      for (let k = 0; k <= n; k++) {
        const a = a0 + ((a1 - a0) * k) / n;
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      outlines.push(pts);
      a0 = a1;
    }
    nodes.push(piece(circle(cx, cy, r + 6), C.tan, { edge: 'torn' }));
  } else {
    const w = s - 20;
    const hh = Math.round(s * 0.62);
    const x0 = 10;
    const y0 = (s - hh) / 2;
    let x = x0;
    for (let i = 0; i < parts; i++) {
      const pw = sh[i] * w;
      outlines.push(rect(x, y0, pw, hh));
      x += pw;
    }
    nodes.push(piece(rect(x0 - 6, y0 - 6, w + 12, hh + 12, 6), C.brown, { edge: 'torn' }));
  }
  outlines.forEach((pts, i) => {
    nodes.push(
      group({ className: `b-part${i < shaded ? ' is-shaded' : ''}`, part: String(i) }, [
        piece(pts, BASE[shape], { edge: 'clean', shadow: false }),
        group({ className: 'b-shade' }, [piece(pts, SHADE[shape], { edge: 'clean', shadow: false })]),
        ink([...pts, pts[0]], { width: 4, color: C.ink, wobble: 0.4 }),
      ]),
    );
  });
  return svg({ w: s, h: s, name: o.name, boil: false }, nodes);
}

/** The middle of each part (for counting tags), in the same size × size box as fractionArt. */
export function partCentres(shape: FracShape, parts: number, o: { size: number; equal?: boolean }): Pt[] {
  const s = o.size;
  const sh = shares(parts, o.equal !== false);
  const out: Pt[] = [];
  let acc = 0;
  for (let i = 0; i < parts; i++) {
    const mid = acc + sh[i] / 2;
    acc += sh[i];
    if (shape === 'circle') {
      const a = -Math.PI / 2 + mid * Math.PI * 2;
      const r = parts === 1 ? 0 : (s / 2 - 10) * 0.58;
      out.push([s / 2 + Math.cos(a) * r, s / 2 + Math.sin(a) * r]);
    } else {
      out.push([10 + mid * (s - 20), s / 2]);
    }
  }
  return out;
}

/** Fraction-picture answer codes: "circle:4:1" (a pie in 4, 1 shaded), "rect:2:1:u" (unequal). */
export function parsePictureCode(code: string): { shape: FracShape; parts: number; shaded: number; equal: boolean } | null {
  const m = /^(circle|rect):(\d+):(\d+)(:u)?$/.exec(code);
  if (!m) return null;
  return { shape: m[1] as FracShape, parts: Number(m[2]), shaded: Number(m[3]), equal: !m[4] };
}
