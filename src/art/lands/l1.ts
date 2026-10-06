/**
 * Land 1: the Enchanted Wood. Deep green, gold light falling through the
 * leaves, toadstools, and old trees that whisper "wisha-wisha" (two of the
 * big trunks have sleepy knot-faces).
 */
import { C } from '../palette';
import { band, circle, curve, ellipse, ink, piece, poly, rect, rng, type Node, type Pt } from '../paper';
import { farBase, farSvg, firTree, flat, hills, roundTree, sceneSvg, sky, toadstool } from './common';

const LIGHT = '#e9e2a6';
const GLADE = '#c9d39a';
const HAZE = '#9fb486';
const BACK_TRUNK = '#7d8f6c';

export function farNodes(): Node[] {
  const base = farBase(C.greenDark, 101);
  const r = rng(102);
  const trees: Node[] = [];
  // A thick wood, darker and taller towards the middle.
  const xs = [70, 112, 150, 196, 236, 280, 318, 360, 398, 440, 480, 522];
  xs.forEach((x, i) => {
    const mid = 1 - Math.abs(x - 300) / 300;
    const h = 56 + mid * 60 + r() * 16;
    const by = 140 - mid * 10;
    if (i % 3 === 1) trees.push(...firTree(x, by, h, i % 2 ? C.greenDeep : C.woodShade));
    else trees.push(...roundTree(x, by, h * 0.9, 103 + i, i % 2 ? [C.greenDeep, C.leafDark, C.leaf] : [C.leafDark, C.moss, C.leafLight]));
  });
  return [
    ...base.back,
    ...trees,
    ...toadstool(130, 146, 18),
    ...toadstool(300, 142, 14, C.orange),
    ...toadstool(462, 146, 16),
    ...base.front,
  ];
}

export const landFar = (name: string): string => farSvg(name, farNodes(), 'The Enchanted Wood');

/** A big old trunk with roots, from the ground to off the top of the picture. */
function bigTrunk(x: number, w: number, color: string, dark: string, seed: number): Node[] {
  const r = rng(seed);
  const lean = (r() - 0.5) * 40;
  const out: Node[] = [
    piece(curve([[x - w * 1.1, 720], [x - w * 0.55, 640], [x - w * 0.5 + lean * 0.4, 300], [x - w * 0.45 + lean, -40], [x + w * 0.45 + lean, -40], [x + w * 0.5 + lean * 0.4, 300], [x + w * 0.55, 640], [x + w * 1.1, 720]], 2), color, { rough: 1.2 }),
    piece(band([[x - w * 0.4, 690], [x - w * 0.9, 724], [x - w * 1.5, 736]], w * 0.2), color),
    piece(band([[x + w * 0.4, 690], [x + w * 0.95, 722], [x + w * 1.4, 742]], w * 0.22), color),
  ];
  // Bark grooves.
  for (let i = 0; i < 4; i++) {
    const gx = x - w * 0.3 + i * w * 0.2;
    out.push(ink([[gx, 660], [gx + lean * 0.2 + (r() - 0.5) * 8, 420], [gx + lean * 0.6, 120]], { width: 3, color: dark, opacity: 0.45, wobble: 1.5 }));
  }
  return out;
}

/** Sleepy knot-eyes and an "O" mouth: the whispering trees. */
function treeFace(x: number, y: number, s: number): Node[] {
  return [
    piece(ellipse(x - s * 0.34, y, s * 0.2, s * 0.09, -8), C.barkDark, { edge: 'cut', fibre: false }),
    piece(ellipse(x + s * 0.34, y - 4, s * 0.2, s * 0.09, 8), C.barkDark, { edge: 'cut', fibre: false }),
    ink([[x - s * 0.5, y - s * 0.22], [x - s * 0.34, y - s * 0.3], [x - s * 0.16, y - s * 0.24]], { width: 3, color: C.barkDark, opacity: 0.7 }),
    ink([[x + s * 0.16, y - s * 0.28], [x + s * 0.34, y - s * 0.34], [x + s * 0.5, y - s * 0.26]], { width: 3, color: C.barkDark, opacity: 0.7 }),
    piece(ellipse(x, y + s * 0.42, s * 0.13, s * 0.18), C.barkDark, { edge: 'cut', fibre: false }),
    // The whisper drifting out: little curls of breath.
    ink([[x + s * 0.3, y + s * 0.4], [x + s * 0.6, y + s * 0.3], [x + s * 0.7, y + s * 0.46], [x + s * 0.95, y + s * 0.34]], { width: 2.5, color: LIGHT, opacity: 0.6 }),
    ink([[x + s * 0.4, y + s * 0.56], [x + s * 0.75, y + s * 0.6], [x + s * 1.1, y + s * 0.5]], { width: 2.5, color: LIGHT, opacity: 0.45 }),
  ];
}

/** A fern frond fanning up from (x, y). */
function fern(x: number, y: number, s: number, color: string, flip = 1): Node[] {
  const out: Node[] = [];
  for (let i = 0; i < 5; i++) {
    const a = ((-150 + i * 30) * Math.PI) / 180;
    const tip: Pt = [x + Math.cos(a) * s * flip, y + Math.sin(a) * s];
    const mid: Pt = [x + Math.cos(a) * s * 0.5 * flip, y + Math.sin(a) * s * 0.5 - s * 0.12];
    out.push(piece(band([[x, y], mid, tip], s * 0.16), color, { edge: 'cut' }));
  }
  return out;
}

/** Bluebells: a few nodding blue dots on stalks. */
function bluebells(x: number, y: number, seed: number): Node[] {
  const r = rng(seed);
  const out: Node[] = [];
  for (let i = 0; i < 5; i++) {
    const bx = x + i * 12 + r() * 6;
    const h = 26 + r() * 16;
    out.push(ink([[bx, y], [bx + 2, y - h], [bx + 8, y - h - 4]], { width: 2, color: C.greenDark }));
    out.push(piece(ellipse(bx + 9, y - h + 2, 4.5, 6), '#6f7fc4', flat));
  }
  return out;
}

export function landScene(name: string): string {
  const r = rng(11);
  const backTrunks: Node[] = [];
  for (let i = 0; i < 14; i++) {
    const x = 20 + i * 86 + r() * 30;
    const w = 14 + r() * 14;
    backTrunks.push(piece(rect(x, 80, w, 470), BACK_TRUNK, { rough: 0.7, shadow: false, fibre: false, opacity: 0.8 }));
  }
  const midTrunks: Node[] = [];
  for (const [x, w] of [[130, 46], [330, 38], [800, 42], [960, 50], [690, 30]] as const) {
    midTrunks.push(piece(curve([[x - w * 0.8, 600], [x - w / 2, 540], [x - w / 2, -20], [x + w / 2, -20], [x + w / 2, 540], [x + w * 0.8, 600]], 1), '#5d6b4c', { rough: 0.9 }));
  }
  // Shafts of light falling through the leaves.
  const shafts: Node[] = [[420, 120], [610, 90], [760, 140]].map(([x, w]) =>
    piece(poly([[x, -10], [x + w, -10], [x + w * 2.2, 640], [x + w * 0.6, 640]]), LIGHT, { ...flat, opacity: 0.18 }),
  );
  // The roof of leaves: lots of overlapping clumps in deep greens, ragged along the bottom.
  const canopy: Node[] = [];
  const shades = [C.woodShade, C.greenDeep, C.leafDark, C.greenDark];
  for (let i = 0; i < 26; i++) {
    const x = -30 + i * 48 + r() * 20;
    canopy.push(piece(circle(x, -10 + r() * 40, 70 + r() * 30), shades[i % 2], { rough: 1.4, shadow: i % 4 === 0 }));
  }
  for (let i = 0; i < 30; i++) {
    const x = r() * 1180;
    canopy.push(piece(circle(x, 70 + r() * 70, 26 + r() * 26), shades[2 + (i % 2)], { rough: 1.2, shadow: false }));
  }
  for (let i = 0; i < 14; i++) {
    const x = r() * 1180;
    canopy.push(piece(circle(x, 60 + r() * 90, 10 + r() * 12), i % 2 ? C.moss : C.leaf, { ...flat, edge: 'torn' }));
  }

  return sceneSvg(name, [
    ...sky([
      [LIGHT, 0],
      [GLADE, 260],
      [HAZE, 460],
    ]),
    ...backTrunks,
    hills(560, 40, '#86a074', 12),
    ...shafts,
    ...midTrunks,
    ...firTree(560, 590, 260, C.woodShade),
    ...firTree(240, 600, 220, C.greenDeep),
    ...firTree(1080, 600, 280, C.woodShade),
    hills(620, 30, C.green, 13),
    // The two whispering trees.
    ...bigTrunk(110, 150, C.bark, C.barkDark, 21),
    ...treeFace(115, 330, 92),
    ...bigTrunk(1060, 170, C.barkLight, C.bark, 22),
    ...treeFace(1050, 300, 100),
    ...canopy,
    // The forest floor: moss, ferns, bluebells and toadstools.
    hills(730, 26, C.greenDark, 14, { step: 70 }),
    // The winding path into the wood.
    piece(curve([[400, 860], [540, 740], [590, 664], [572, 636], [650, 628], [672, 660], [710, 740], [880, 860]], 2), C.sand, { rough: 1.4 }),
    piece(curve([[500, 860], [590, 760], [612, 670], [640, 668], [670, 760], [760, 860]], 2), '#e6d2a6', { ...flat, opacity: 0.6 }),
    ...fern(290, 760, 90, C.leafDark),
    ...fern(880, 770, 100, C.leafDark, -1),
    ...fern(980, 790, 70, C.leaf, -1),
    ...bluebells(370, 770, 31),
    ...bluebells(790, 800, 32),
    ...toadstool(230, 790, 80),
    ...toadstool(320, 800, 52, C.orange),
    ...toadstool(190, 812, 40),
    ...toadstool(930, 800, 90),
    ...toadstool(1020, 812, 50, C.orange),
    ...toadstool(470, 690, 30),
    ...toadstool(745, 700, 34),
    piece(ellipse(1000, 690, 6, 6), C.white, flat),
  ]);
}
