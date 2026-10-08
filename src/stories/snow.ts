/**
 * Shared pieces for the Land of Snow stories (l9c1 … l9c7).
 *
 * Not a story itself (it isn't in any registry). Across these seven stories
 * {name} and the Folk draw THE PLAN to rescue Silky as a map scratched in
 * the snow, one piece per chapter, so that it builds up as the land goes on:
 *
 *   1  A Land of Snow       the tree, and Silky in her cage
 *   2  Snowball Sharing     a key (laid out in snowballs)
 *   3  Sledges in Groups    a sledge: the quick way home
 *   4  Half an Ice-Pie      the gates (only half a gate need open)
 *   5  The Frozen Clock     six o'clock: the hour her land comes back
 *   6  Quarter Past Snow    quarter past six: when she is busy, they creep in
 *   7  Icicles to Count     icicle teeth for the key: the plan is ready
 *
 * Each story draws the map with the earlier pieces already on it (`mapBoard`)
 * and reveals its own new piece. The little glowing dewdrop is Silky's, the
 * one he kept when she was taken (it glows when the sums go right).
 *
 * Everything is torn paper or hand-drawn snow lines; nothing flashes.
 */
import { bell, band, C, circle, curve, dot, ellipse, group, ink, noiseBurst, now, piece, poly, raw, rect, svg, tone, NOTE, type Kit, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** A boot crunching in dry snow. */
export function crunch(times = 2): void {
  const t = now();
  for (let i = 0; i < times; i++) noiseBurst(t + i * 0.22, { freq: 3000, q: 1.2, peak: 0.07, attack: 0.004, decay: 0.09, sweepTo: 1800 });
}

/** A soft snowball landing: a muffled pat. */
export function pat(): void {
  const t = now();
  noiseBurst(t, { freq: 500, type: 'lowpass', peak: 0.12, attack: 0.004, decay: 0.12 });
  tone(140, t, { peak: 0.06, decay: 0.1, glideTo: 80 });
}

/** A stick scratching a line in the snow. */
export function scratch(seconds = 0.5): void {
  const t = now();
  noiseBurst(t, { freq: 4200, q: 0.8, peak: 0.06, attack: 0.05, decay: seconds, sweepTo: 2600 });
}

/** The dewdrop glowing: two soft bells. */
export function shimmer(): void {
  const t = now();
  bell(NOTE.E6, t, 0.06, 1.4);
  bell(NOTE.G6, t + 0.14, 0.05, 1.4);
}

/** One slow clock bell. */
export function bong(): void {
  const t = now();
  bell(262, t, 0.18, 2.2);
  tone(131, t, { peak: 0.08, attack: 0.01, decay: 1.8 });
}

/** A single drip. */
export function drip(): void {
  tone(1500, now(), { peak: 0.08, attack: 0.002, decay: 0.12, glideTo: 700 });
}

/** A sledge swishing over snow. */
export function swish(): void {
  const t = now();
  noiseBurst(t, { freq: 1600, q: 0.6, peak: 0.12, attack: 0.15, decay: 0.7, sweepTo: 3600 });
}

// ------------------------------------------------------------------- moves

/** Waves one arm of a twig-armed or ordinary character (a quick flourish). */
export async function flourish(k: Kit, el: HTMLElement, arm: 'armL' | 'armR' = 'armR'): Promise<void> {
  const parts = k.pivot(k.part(el, arm));
  if (!parts.length) return k.hop(el, 16, 1);
  const up = arm === 'armR' ? -1 : 1;
  await k.to(parts, 0.2, { rotation: up * 30 });
  await k.to(parts, 0.25, { rotation: up * 8 });
  await k.to(parts, 0.25, { rotation: up * 24 });
  await k.to(parts, 0.25, { rotation: 0 });
}

// ----------------------------------------------------------------- dewdrop

/** Silky's dewdrop: a little teardrop of light, with a soft glow. */
function dewdropArt(): string {
  return svg({ w: 60, h: 80, name: 'snow-dewdrop', boil: false }, [
    piece(curve([[30, 4], [50, 40], [52, 58], [30, 76], [8, 58], [10, 40]], 2), '#cfeaf7', { rough: 0.6 }),
    piece(curve([[30, 18], [42, 42], [42, 56], [30, 66], [20, 56], [22, 42]], 2), '#eef9ff', { edge: 'cut', fibre: false, shadow: false, opacity: 0.9 }),
    dot(22, 50, 4, C.white),
  ]);
}

export interface Dewdrop {
  el: HTMLElement;
  /** Makes it glow brighter for a moment (a sum went right). */
  glow(): Promise<void>;
}

/** The hero's dewdrop, resting by his feet, glowing a little. */
export function dewdrop(k: Kit, x = 950, y = 560): Dewdrop {
  const el = k.add(dewdropArt(), { x, y, w: 46, z: 22 });
  const halo = k.light(x + 23, y + 38, 70, { color: '#bfe8ff', strength: 0.25, flicker: true, z: 21 });
  k.float(el, 5, 2.6);
  return {
    el,
    async glow() {
      shimmer();
      k.sparkle(x + 23, y + 30, 8, 70);
      await k.to(halo, 0.5, { opacity: 0.6, ease: 'sine.out' });
      await k.to(halo, 0.9, { opacity: 0.25, ease: 'sine.inOut' });
    },
  };
}

// ----------------------------------------------------------------- the map

export type MapKind = 'tree' | 'cage' | 'key' | 'sledge' | 'gates' | 'six' | 'quarter' | 'teeth';

/** The pieces each chapter adds to the plan (chapter number → pieces). */
export const PLAN: Record<number, MapKind[]> = {
  1: ['tree', 'cage'],
  2: ['key'],
  3: ['sledge'],
  4: ['gates'],
  5: ['six'],
  6: ['quarter'],
  7: ['teeth'],
};

/** Where each piece sits on the 640 × 420 board: x, y, width. */
const SPOT: Record<MapKind, [number, number, number]> = {
  tree: [24, 120, 110],
  cage: [488, 20, 120],
  key: [190, 28, 150],
  sledge: [150, 322, 130],
  gates: [396, 176, 200],
  six: [316, 300, 96],
  quarter: [426, 312, 96],
  teeth: [190, 28, 150],
};

const LINE = '#3f6a9a';

/** A hand-drawn line in the snow. */
const draw = (pts: Pt[], width = 5, closed = false): Node => ink(pts, { width, color: LINE, wobble: 1.2, closed });

/** Points round a circle (for drawn rings). */
const ring = (cx: number, cy: number, r: number, n = 18): Pt[] => Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * r, cy + Math.sin((i / n) * Math.PI * 2) * r] as Pt);

/** A clock face line drawing with its hands at a time (96 × 96 on the map). */
function drawnClock(name: string, hour: number, minute: number, shadeQuarter = false): string {
  const hDeg = ((hour % 12) * 30 + minute * 0.5) * (Math.PI / 180);
  const mDeg = minute * 6 * (Math.PI / 180);
  const tip = (r: number, a: number): Pt => [48 + Math.sin(a) * r, 48 - Math.cos(a) * r];
  const wedge: Pt[] = [[48, 48], ...Array.from({ length: 8 }, (_, i) => tip(34, (i / 7) * (Math.PI / 2)))];
  return svg({ w: 96, h: 96, name, boil: false }, [
    piece(circle(48, 48, 44), C.snowShade, { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }),
    ...(shadeQuarter ? [piece(poly(wedge), C.ice, { edge: 'cut', fibre: false, shadow: false, opacity: 0.9 })] : []),
    draw(ring(48, 48, 42), 4, true),
    ...[0, 3, 6, 9].map((n) => draw([tip(34, (n / 12) * Math.PI * 2), tip(40, (n / 12) * Math.PI * 2)], 4)),
    draw([[48, 48], tip(24, hDeg)], 6),
    draw([[48, 48], tip(36, mDeg)], 4),
  ]);
}

/** The drawing for one piece of the plan. */
function mapPieceArt(kind: MapKind): string {
  switch (kind) {
    case 'tree':
      return svg({ w: 110, h: 220, name: 'snow-map-tree', boil: false }, [
        draw([[44, 218], [46, 120]], 6),
        draw([[66, 218], [64, 120]], 6),
        draw(ring(55, 76, 50, 20), 5, true),
        draw([[55, 120], [40, 96], [34, 80]], 4),
        draw([[55, 116], [72, 90], [80, 70]], 4),
        // a little lit window
        piece(rect(48, 164, 14, 22, 4), C.goldLight, { edge: 'cut', fibre: false, shadow: false }),
      ]);
    case 'cage':
      return svg({ w: 120, h: 150, name: 'snow-map-cage', boil: false }, [
        draw([[14, 140], [14, 56], [30, 22], [60, 10], [90, 22], [106, 56], [106, 140]], 5),
        ...[34, 60, 86].map((x) => draw([[x, 140], [x, 18 + Math.abs(x - 60) * 0.5]], 4)),
        draw([[10, 140], [110, 140]], 5),
        // Silky inside: a little star with wings
        piece(curve(starPoints(60, 84, 22), 1), C.goldLight, { edge: 'cut', fibre: false, shadow: false }),
        piece(ellipse(34, 80, 12, 6, -30), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.9 }),
        piece(ellipse(86, 80, 12, 6, 30), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.9 }),
      ]);
    case 'key':
      return svg({ w: 150, h: 64, name: 'snow-map-key', boil: false }, [
        draw(ring(28, 32, 22), 6, true),
        draw([[50, 32], [140, 32]], 6),
        draw([[112, 32], [112, 54]], 6),
        draw([[130, 32], [130, 50]], 6),
      ]);
    case 'teeth':
      // Icicle teeth fitted to the key's shaft.
      return svg({ w: 150, h: 64, name: 'snow-map-teeth', boil: false }, [
        ...[112, 130].map((x, i) => piece(poly([[x - 7, 32], [x + 7, 32], [x, 60 - i * 6]]), C.ice, { edge: 'cut', fibre: C.white })),
        ...[94].map((x) => piece(poly([[x - 7, 32], [x + 7, 32], [x, 58]]), C.ice, { edge: 'cut', fibre: C.white })),
      ]);
    case 'sledge':
      return svg({ w: 130, h: 70, name: 'snow-map-sledge', boil: false }, [
        draw([[14, 44], [96, 44], [112, 36], [122, 40]], 5),
        draw([[10, 60], [110, 60], [124, 50]], 5),
        draw([[36, 44], [36, 60]], 4),
        draw([[84, 44], [84, 60]], 4),
        draw([[22, 20], [100, 20]], 4),
      ]);
    case 'gates':
      return svg({ w: 200, h: 140, name: 'snow-map-gates', boil: false }, [
        // a shut half of the gate, and a half swung open
        draw([[10, 130], [10, 20]], 7),
        ...[30, 50, 70].map((x) => draw([[x, 126], [x, 24]], 4)),
        draw([[10, 24], [86, 24]], 5),
        draw([[10, 126], [86, 126]], 5),
        draw([[190, 130], [190, 20]], 7),
        draw([[96, 124], [150, 100], [168, 40], [112, 66], [96, 124]], 4),
        // the way through
        draw([[104, 110], [140, 120], [180, 110]], 4),
        piece(poly([[176, 100], [192, 112], [174, 124]]), LINE, { edge: 'clean', fibre: false, shadow: false }),
      ]);
    case 'six':
      return drawnClock('snow-map-six', 6, 0);
    case 'quarter':
      return drawnClock('snow-map-quarter', 6, 15, true);
  }
}

/** A five-pointed star outline (for Silky on the map). */
function starPoints(cx: number, cy: number, r: number): Pt[] {
  return Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
    const rr = i % 2 ? r * 0.45 : r;
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr] as Pt;
  });
}

/** A snow-coloured board for the plan (640 × 420). */
function boardArt(): string {
  return svg({ w: 640, h: 420, name: 'snow-map-board', boil: false }, [
    piece(rect(8, 8, 624, 404, 28), C.snowShade, { rough: 1.4 }),
    piece(rect(18, 16, 604, 388, 24), C.white, { edge: 'cut', fibre: false, shadow: false, opacity: 0.9 }),
    // The way: a dotted path from the tree to the cage.
    ...Array.from({ length: 12 }, (_, i) => dot(150 + i * 28, 250 - Math.sin(i / 3.2) * 40 - i * 4, 4, LINE, 0.45)),
  ]);
}

export interface MapBoard {
  board: HTMLElement;
  /** Every piece by kind. */
  pieces: Partial<Record<MapKind, HTMLElement>>;
  /** Draws in this chapter's own pieces, one by one, with a scratchy sound. */
  reveal(): Promise<void>;
}

/**
 * The plan so far. Adds the board at (x, y) with every piece from earlier
 * chapters on it, and this chapter's pieces ready (hidden) for `reveal()`.
 */
export function mapBoard(k: Kit, chapter: number, o: { x?: number; y?: number; z?: number } = {}): MapBoard {
  const bx = o.x ?? 270;
  const by = o.y ?? 80;
  const z = o.z ?? 30;
  const board = k.add(boardArt(), { x: bx, y: by, w: 640, h: 420, z });
  const pieces: Partial<Record<MapKind, HTMLElement>> = {};
  for (let c = 1; c <= chapter; c++) {
    for (const kind of PLAN[c]) {
      const [x, y, w] = SPOT[kind];
      const el = k.add(mapPieceArt(kind), { x: bx + x, y: by + y, w, z: z + 1 });
      if (c === chapter) k.set(el, { opacity: 0 });
      pieces[kind] = el;
    }
  }
  return {
    board,
    pieces,
    async reveal() {
      for (const kind of PLAN[chapter]) {
        const el = pieces[kind]!;
        scratch(0.45);
        await k.to(el, 0.6, { opacity: 1, ease: 'sine.out' });
        k.sparkle(parseFloat(el.style.left) + el.offsetWidth / 2, parseFloat(el.style.top) + el.offsetHeight / 2, 8, 70);
        await k.pop(el, 1.12);
      }
    },
  };
}

// ------------------------------------------------------------------- art

/** A little clock (200 × 200) with hands at a time. Hands are the parts hourHand and minHand. */
export function clockFace(name: string, hour = 12, minute = 0): string {
  const hDeg = (hour % 12) * 30 + minute * 0.5;
  const mDeg = minute * 6;
  /** The point `r` along a hand at `deg` clockwise from twelve. */
  const at = (deg: number, r: number): [number, number] => [100 + Math.sin((deg * Math.PI) / 180) * r, 100 - Math.cos((deg * Math.PI) / 180) * r];
  const tick = (i: number): Node => {
    const a = (i / 12) * Math.PI * 2;
    const r0 = i % 3 ? 70 : 62;
    return ink(
      [
        [100 + Math.sin(a) * r0, 100 - Math.cos(a) * r0],
        [100 + Math.sin(a) * 76, 100 - Math.cos(a) * 76],
      ],
      { width: i % 3 ? 3 : 6, color: C.blueDark, wobble: 0.3 },
    );
  };
  const numerals = [12, 3, 6, 9].map((n, i) => {
    const a = (i / 4) * Math.PI * 2;
    return raw(`<text x="${100 + Math.sin(a) * 50}" y="${100 - Math.cos(a) * 50 + 11}" text-anchor="middle" font-family="Andika, sans-serif" font-weight="700" font-size="30" fill="${C.ink}">${n}</text>`);
  });
  return svg({ w: 200, h: 200, name, boil: false }, [
    piece(circle(100, 100, 94), C.iceDark),
    piece(circle(100, 100, 80), C.cream, { edge: 'cut', fibre: false, shadow: false }),
    piece(circle(100, 100, 80), C.ice, { edge: 'cut', fibre: false, shadow: false, opacity: 0.25 }),
    ...Array.from({ length: 12 }, (_, i) => tick(i)),
    ...numerals,
    // Each hand is drawn already pointing at its time, not turned with a
    // transform: the group's CSS transform-origin would apply on top of an
    // SVG rotate's own centre and throw the hand off the clock.
    group({ part: 'hourHand', origin: [100, 100] }, [piece(band([at(hDeg, -4), at(hDeg, 40)], 11), C.ink, { edge: 'cut', shadow: false })]),
    group({ part: 'minHand', origin: [100, 100] }, [piece(band([at(mDeg, -6), at(mDeg, 66)], 7), C.ink, { edge: 'cut', shadow: false })]),
    piece(circle(100, 100, 8), C.ink, { edge: 'clean', shadow: false }),
  ]);
}

/**
 * A round ice-pie cut into equal wedges (200 × 200 each, all sharing one
 * centre, so they sit together as a whole pie and can slide apart).
 * Wedge 0 starts at the top and they run clockwise.
 */
export function pieWedges(parts: 2 | 4, name: string): string[] {
  const sector = (r: number, a0: number, a1: number): Pt[] => {
    const pts: Pt[] = [[100, 100]];
    const n = Math.max(6, Math.round(((a1 - a0) / 90) * 10));
    for (let i = 0; i <= n; i++) {
      const a = ((a0 + ((a1 - a0) * i) / n - 90) * Math.PI) / 180;
      pts.push([100 + Math.cos(a) * r, 100 + Math.sin(a) * r]);
    }
    return pts;
  };
  return Array.from({ length: parts }, (_, i) => {
    const a0 = (i * 360) / parts + 1.5;
    const a1 = ((i + 1) * 360) / parts - 1.5;
    const mid = (((a0 + a1) / 2 - 90) * Math.PI) / 180;
    const berries = [38, 58, 72].map((r, j) => {
      const a = mid + (j - 1) * 0.28 * (2 / parts);
      return dot(100 + Math.cos(a) * r, 100 + Math.sin(a) * r, 6, C.blue);
    });
    return svg({ w: 200, h: 200, name: `${name}-${i}`, boil: false }, [
      piece(poly(sector(92, a0, a1)), C.honey, { rough: 0.8 }),
      piece(poly(sector(76, a0, a1)), C.snow, { edge: 'cut', fibre: false, shadow: false }),
      ...berries,
    ]);
  });
}

/** A child on a sledge: coat, face and bobble hat (70 × 90). */
export function rider(coat: string, hat: string, name: string): string {
  return svg({ w: 70, h: 90, name, boil: false }, [
    piece(curve([[10, 88], [14, 50], [35, 40], [56, 50], [60, 88]], 2), coat),
    piece(circle(35, 30, 20), '#f2c9a0'),
    piece(curve([[14, 28], [18, 8], [35, 2], [52, 8], [56, 28], [35, 22]], 2), hat),
    piece(circle(35, 2, 7), C.white, { edge: 'cut', fibre: false }),
    dot(28, 32, 2.4, C.ink),
    dot(42, 32, 2.4, C.ink),
    ink([[29, 40], [35, 44], [41, 40]], { width: 2, color: C.ink }),
  ]);
}
