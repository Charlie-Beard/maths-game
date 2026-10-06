/**
 * The paper pieces of the finale set pieces (scenes/finale.ts): the sky
 * and the top of the tree behind the ladder, the ladder itself, swirling
 * clouds, Moon-Face's door, Dame Snap's board and what's on it, and the
 * narrow strip at the right edge that shows how far he's got while he
 * works.
 *
 * Nothing here boils: the set piece sits behind the problem and must hold
 * perfectly still while he's thinking.
 */
import { cloudBank } from '../art/lands/common';
import { C } from '../art/palette';
import { band, circle, curve, ellipse, group, hashString, ink, piece, poly, rect, rng, svg, type Node, type Pt } from '../art/paper';

const still = { boil: false } as const;
const flat = { edge: 'cut' as const, fibre: false as const, shadow: false };

// ---------------------------------------------------------------------------
// Escape: sky, tree top, ladder, clouds
// ---------------------------------------------------------------------------

/** Where the ladder stands in the escape view (stage coordinates). */
export const LADDER = { x: 590, top: 186, rung0: 214, gap: 46 };
/** The branch they leap onto at the end. */
export const BRANCH: Pt = [300, 704];

/** A clump of leaves (the same recipe as the big tree's). */
function leaves(cx: number, cy: number, size: number, seed: number): Node[] {
  const r = rng(seed);
  const out: Node[] = [];
  const n = Math.round(size / 18);
  const shades = [C.greenDeep, C.leafDark, C.greenDark, C.woodShade];
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * size * 0.45;
    out.push(piece(circle(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.6, size * (0.16 + r() * 0.12)), shades[i % shades.length], { shadow: i < 2 }));
  }
  for (let i = 0; i < Math.round(n / 3); i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * size * 0.4;
    out.push(piece(circle(cx + Math.cos(a) * d, cy - size * 0.06 + Math.sin(a) * d * 0.5, size * (0.07 + r() * 0.06)), i % 2 ? C.moss : C.leaf, { shadow: false }));
  }
  return out;
}

/**
 * The escape backdrop, 1180 × 820: the land's sky, and at the bottom the
 * very top of the Faraway Tree (Moon-Face's round room and a branch to
 * leap onto). The land itself, the ladder and the clouds are separate
 * pieces so they can move.
 */
export function escapeBackdrop(name: string, skyCols: [string, string, string]): string {
  const [top, mid, low] = skyCols;
  const nodes: Node[] = [
    piece(rect(-20, -20, 1220, 320), top, { edge: 'clean', shadow: false }),
    piece(rect(-20, 260, 1220, 300), mid, { rough: 2, shadow: false, fibre: false }),
    piece(rect(-20, 500, 1220, 340), low, { rough: 2, shadow: false, fibre: false }),
    piece(ellipse(160, 420, 130, 14), C.cloud, { ...flat, opacity: 0.5 }),
    piece(ellipse(1030, 360, 150, 16), C.cloud, { ...flat, opacity: 0.5 }),
    // The top of the trunk and its branches.
    piece(band([[590, 840], [592, 720], [596, 650]], 150), C.bark),
    piece(band([[540, 720], [430, 706], [300, 712], [150, 740]], 34), C.bark),
    piece(band([[650, 730], [790, 716], [930, 726], [1080, 760]], 30), C.bark),
    piece(band([[578, 840], [584, 700]], 18), C.barkLight, { shadow: false, opacity: 0.5, edge: 'cut' }),
    ...leaves(130, 760, 240, 3),
    ...leaves(1060, 770, 250, 4),
    ...leaves(860, 800, 180, 6),
    ...leaves(340, 810, 170, 7),
    // Moon-Face's room: round, with a round door and round windows.
    piece(ellipse(596, 712, 96, 64), C.barkLight),
    piece(circle(596, 720, 36), C.barkDark, { edge: 'cut' }),
    piece(circle(596, 720, 29), C.goldLight, flat),
    piece(circle(530, 700, 12), C.candle, { edge: 'cut' }),
    piece(circle(662, 700, 12), C.candle, { edge: 'cut' }),
    // The branch they land on, with a cushion.
    piece(ellipse(BRANCH[0], BRANCH[1] + 22, 70, 12), C.rose, { edge: 'cut' }),
  ];
  return svg({ w: 1180, h: 820, name, ...still, className: 'backdrop' }, nodes);
}

/** The ladder down from the land's cloud to the tree, with `rungs` rungs. */
export function ladderArt(name: string, rungs: number): string {
  const h = LADDER.rung0 - LADDER.top + rungs * LADDER.gap + 40;
  const nodes: Node[] = [
    piece(band([[22, 0], [22, h]], 12), C.wood, { edge: 'cut' }),
    piece(band([[98, 0], [98, h]], 12), C.wood, { edge: 'cut' }),
  ];
  for (let k = 0; k <= rungs; k++) {
    const y = LADDER.rung0 - LADDER.top + k * LADDER.gap;
    nodes.push(piece(rect(18, y - 4, 84, 9, 3), C.tan, { edge: 'cut', fibre: false }));
  }
  return svg({ w: 120, h, name, ...still }, nodes);
}

/** A tall column of swirling cloud, 560 × 900, puffing out to one side. */
export function swirlCloud(name: string, color: string, side: 'l' | 'r'): string {
  const r = rng(side === 'l' ? 11 : 12);
  const nodes: Node[] = [];
  const edge = side === 'l' ? 470 : 90;
  for (let i = 0; i < 9; i++) {
    const y = 40 + i * 100 + r() * 30;
    const x = edge + (side === 'l' ? -1 : 1) * (r() * 60);
    nodes.push(piece(circle(x, y, 80 + r() * 40), C.cloudShade, { shadow: false, fibre: false, opacity: 0.9 }));
  }
  nodes.push(piece(rect(side === 'l' ? -40 : 110, -20, 450, 940), color, { rough: 2, shadow: false }));
  for (let i = 0; i < 9; i++) {
    const y = 20 + i * 100 + r() * 30;
    const x = edge - (side === 'l' ? 1 : -1) * (30 + r() * 50);
    nodes.push(piece(circle(x, y, 70 + r() * 40), color, { shadow: false }));
  }
  // A curl of wind on the cloud, so it reads as swirling.
  const sx = side === 'l' ? 300 : 260;
  const spiral: Pt[] = [];
  for (let i = 0; i <= 30; i++) {
    const a = (i / 30) * Math.PI * 3.2;
    const rr = 10 + (i / 30) * 56;
    spiral.push([sx + Math.cos(a) * rr * (side === 'l' ? 1 : -1), 420 + Math.sin(a) * rr]);
  }
  nodes.push(ink(spiral, { width: 5, color: C.cloudShade, opacity: 0.9 }));
  return svg({ w: 560, h: 900, name, ...still }, nodes);
}

/** A balloon on a string, 60 × 130. */
export function balloonArt(name: string, color: string): string {
  return svg({ w: 60, h: 130, name, ...still }, [
    ink([[30, 70], [26, 96], [34, 128]], { width: 2, color: C.ink, opacity: 0.6 }),
    piece(ellipse(30, 38, 26, 32), color, { edge: 'cut' }),
    piece(poly([[25, 70], [35, 70], [30, 62]]), color, flat),
    piece(ellipse(21, 26, 6, 10, -20), C.white, { ...flat, opacity: 0.5 }),
  ]);
}

/** A falling drip of melted snow, 24 × 36. */
export const dripArt = (name: string): string =>
  svg({ w: 24, h: 36, name, ...still }, [piece(poly([[12, 0], [20, 22], [12, 34], [4, 22]]), C.ice, { edge: 'cut', fibre: false })]);

// ---------------------------------------------------------------------------
// Climb: Moon-Face's door
// ---------------------------------------------------------------------------

/** Moon-Face's round door, 64 × 64 (it swings open at the end of the climb). */
export const doorArt = (name: string): string =>
  svg({ w: 64, h: 64, name, ...still }, [
    piece(circle(32, 32, 30), C.brown, { edge: 'cut' }),
    ...[-14, 0, 14].map((d) => ink([[32 + d, 6 + Math.abs(d) * 0.4], [32 + d, 58 - Math.abs(d) * 0.4]], { width: 2.5, color: C.brownDark, opacity: 0.6 })),
    piece(circle(50, 34, 4), C.gold, { edge: 'cut' }),
  ]);

// ---------------------------------------------------------------------------
// Snap: the board and what's on it
// ---------------------------------------------------------------------------

/** Dame Snap's board, w × h: a blackboard (rules, rulers) or a stone wall (cages). */
export function boardArt(name: string, w: number, h: number, kind: 'rules' | 'cages' | 'rulers'): string {
  const wall = kind === 'cages';
  const nodes: Node[] = wall
    ? [
        piece(rect(0, 0, w, h, 6), C.prisonWall, { rough: 1.4 }),
        ...Array.from({ length: Math.ceil(h / 60) * 4 }, (_, i) => {
          const row = Math.floor(i / 4);
          const col = i % 4;
          const bw = w / 4;
          return piece(rect(col * bw + (row % 2 ? bw / 2 : 0) - bw / 2 + 6, row * 60 + 6, bw - 12, 48, 4), C.prisonStone, { ...flat, opacity: 0.6 });
        }),
      ]
    : [
        piece(rect(0, 0, w, h, 6), C.wood, { rough: 1.2 }),
        piece(rect(16, 16, w - 32, h - 32, 4), C.blackboard, { edge: 'cut', fibre: false, shadow: false }),
        // Old chalk smudges.
        piece(ellipse(w * 0.3, h * 0.7, 80, 16, -8), C.chalk, { ...flat, opacity: 0.08 }),
        piece(ellipse(w * 0.75, h * 0.25, 70, 12, 6), C.chalk, { ...flat, opacity: 0.08 }),
        piece(rect(w * 0.6, h - 14, 60, 10, 3), C.chalk, { edge: 'cut', fibre: false }),
      ];
  return svg({ w, h, name, ...still }, nodes);
}

/** A jagged chalk crack across a rule, w × h. */
export function crackArt(name: string, w: number, h: number): string {
  const r = rng(hashString(name));
  const pts: Pt[] = [];
  // A lightning-bolt crack: uneven steps, sharp corners.
  let x = 0;
  for (let i = 0; x < w; i++) {
    pts.push([x, h / 2 + (i % 2 ? -1 : 1) * (h * 0.06 + r() * h * 0.26)]);
    x += w * (0.06 + r() * 0.1);
  }
  pts.push([w, h / 2 + (r() - 0.5) * h * 0.3]);
  // Two-point strokes keep the corners sharp (longer ink lines are smoothed).
  const seg = (dy: number, width: number, color: string, opacity?: number): Node[] =>
    pts.slice(1).map((p, i) => ink([[pts[i][0], pts[i][1] + dy], [p[0], p[1] + dy]], { width, color, opacity, wobble: 0.3 }));
  return svg({ w, h, name, ...still }, [...seg(3, 2, C.ink, 0.5), ...seg(0, 5, C.chalk)]);
}


/** Half a ruler, 36 × 96: the top half (`top`) or the bottom one. Two halves make a whole ruler. */
export function rulerHalf(name: string, top: boolean): string {
  const nodes: Node[] = [piece(rect(4, top ? 4 : 0, 28, 92, top ? 3 : 0), C.ruler, { edge: 'cut' })];
  for (let k = 0; k < 9; k++) nodes.push(ink([[4, 10 + k * 10], [k % 2 ? 12 : 18, 10 + k * 10]], { width: 1.6, color: C.cream, opacity: 0.9, wobble: 0.2 }));
  return svg({ w: 36, h: 96, name, ...still }, nodes);
}

/** Cage bars and a door frame, 120 × 140 (the captive sits behind). */
export const cageBars = (name: string): string =>
  svg({ w: 120, h: 140, name, ...still }, [
    piece(rect(0, 0, 120, 12, 4), C.iron, { edge: 'cut' }),
    piece(rect(0, 128, 120, 12, 4), C.iron, { edge: 'cut' }),
    ...[8, 30, 52, 74, 96].map((x) => piece(rect(x, 6, 8, 128, 3), C.ironLight, { edge: 'cut', fibre: false })),
  ]);

/** A padlock, 48 × 56; its shackle is the part `shackle`. */
export const padlockArt = (name: string): string =>
  svg({ w: 48, h: 56, name, ...still }, [
    group({ part: 'shackle' }, [piece(band([[12, 28], [12, 12], [24, 4], [36, 12], [36, 28]], 7), C.steel, { edge: 'cut', fibre: false })]),
    piece(rect(4, 24, 40, 30, 6), C.brass, { edge: 'cut' }),
    piece(circle(24, 36, 4), C.ink, flat),
    piece(rect(22, 38, 4, 9, 1), C.ink, flat),
  ]);

/** Dame Snap's detention cupboard, 170 × 330, with its door as a separate piece. */
export const cupboardArt = (name: string): string =>
  svg({ w: 170, h: 330, name, ...still }, [
    piece(rect(0, 0, 170, 330, 6), C.brownDark, { rough: 1.2 }),
    piece(rect(14, 14, 142, 310, 4), C.ink, flat),
    piece(rect(30, -22, 110, 30, 4), C.cream, { edge: 'cut' }),
  ]);

export const cupboardDoor = (name: string): string =>
  svg({ w: 142, h: 310, name, ...still }, [
    piece(rect(0, 0, 142, 310, 4), C.brown, { edge: 'cut' }),
    piece(rect(16, 20, 110, 120, 4), C.brownDark, { ...flat, opacity: 0.5 }),
    piece(rect(16, 166, 110, 120, 4), C.brownDark, { ...flat, opacity: 0.5 }),
    piece(circle(124, 160, 6), C.gold, { edge: 'cut' }),
  ]);

// ---------------------------------------------------------------------------
// The strip at the right edge (shown while he works)
// ---------------------------------------------------------------------------

/** The strip's box in stage coordinates (Silky floats over its middle). */
export const STRIP = { x: 1040, y: 90, w: 140, h: 730 };
/** Silky's band, which the strip's stops keep clear of (stage y). */
const SILKY_BAND: [number, number] = [292, 468];

/**
 * Stage y for `n + 1` stops, from stop 0 at the bottom to stop n at the
 * top, spaced evenly but skipping Silky's band (passing behind her).
 */
export function stripStops(n: number, bottom = 780, top = 120): number[] {
  const below = bottom - SILKY_BAND[1];
  const above = SILKY_BAND[0] - top;
  const total = below + above;
  return Array.from({ length: n + 1 }, (_, i) => {
    const d = (i / Math.max(1, n)) * total;
    return d <= below ? bottom - d : SILKY_BAND[0] - (d - below);
  });
}

/** The strip's picture, STRIP.w × STRIP.h: a trunk (climb) or the ladder (escape). */
export function stripArt(name: string, kind: 'trunk' | 'ladder'): string {
  const { w, h } = STRIP;
  const nodes: Node[] = [piece(rect(4, 0, w - 8, h + 20, 8), 'rgba(20,16,30,0.35)', { edge: 'torn', fibre: false, shadow: false })];
  if (kind === 'trunk') {
    nodes.push(piece(curve([[44, h + 20], [50, 400], [56, 100], [60, 30], [84, 30], [92, 100], [96, 400], [104, h + 20]], 2), C.bark));
    nodes.push(piece(band([[64, h], [66, 60]], 8), C.barkLight, { ...flat, opacity: 0.5 }));
    // Moon-Face's door at the top.
    nodes.push(piece(circle(72, 28, 22), C.barkDark, { edge: 'cut' }), piece(circle(72, 28, 17), C.goldLight, flat));
  } else {
    nodes.push(...cloudBank(70, 30, 130, 5));
    nodes.push(piece(band([[46, 40], [46, h + 20]], 7), C.wood, { edge: 'cut' }), piece(band([[96, 40], [96, h + 20]], 7), C.wood, { edge: 'cut' }));
    for (let y = 70; y < h; y += 32) nodes.push(piece(rect(44, y, 54, 6, 2), C.tan, { edge: 'cut', fibre: false }));
    nodes.push(...leaves(70, h - 10, 120, 9));
  }
  return svg({ w, h, name, ...still }, nodes);
}
