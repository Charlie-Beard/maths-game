/**
 * Land 11: the Old Woman's Shoe. A buttercup meadow under a soft blue sky,
 * with a gigantic old lace-up boot for a house: windows and doors cut in
 * the leather, a chimney with its smoke held still, laces criss-crossing up
 * the front, a washing line of tiny socks, a vegetable patch and a handful
 * of small children playing round it.
 *
 * Everything sits still. The boot stands back and to the right, and the
 * middle of the lower stage is left open grass for the puppets to stand on.
 *
 * Reusable by the stories: `bootHouse(x, baseY, s)` (the whole boot, 600
 * wide and 440 tall at s = 1, toe on the left), `child(...)` (a small paper
 * child) and `sockLine(...)` (washing line with socks).
 */
import { C } from '../palette';
import { band, circle, curve, ellipse, group, ink, piece, poly, rect, rng, type Node, type Pt } from '../paper';
import { cloud, farBase, farSvg, flat, hills, roundTree, sceneSvg, sky } from './common';

// Colours for this land only (not in palette.ts).
const LEATHER = '#8c5a32';
const LEATHER_LIGHT = '#a8703f';
const LEATHER_DARK = '#6a4022';
const SOLE = '#43291a';
const BUTTERCUP = '#f2cf3b';
const SKY_BLUE = '#9cc7e6';
const SKY_PALE = '#cfe5f2';
const MEADOW = '#86b256';
const MEADOW_DARK = '#6a9946';
const MEADOW_FAR = '#9cc46e';
const LACE = '#f4ead0';
const BRICK = '#b5583b';
const SMOKE = '#eef0f0';

/** One flower: a stem, petals and a middle. */
function flower(x: number, y: number, s: number, petal: string, mid: string = BUTTERCUP): Node[] {
  const out: Node[] = [ink([[x, y], [x + s * 0.1, y - s * 1.4]], { width: 2, color: C.leafDark, wobble: 0.2 })];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    out.push(piece(circle(x + s * 0.1 + Math.cos(a) * s * 0.42, y - s * 1.4 + Math.sin(a) * s * 0.42, s * 0.3), petal, flat));
  }
  out.push(piece(circle(x + s * 0.1, y - s * 1.4, s * 0.26), mid, flat));
  return out;
}

/**
 * A small paper child: a round head, a body in a coloured top, legs and
 * two arms. Poses: stand, wave (one arm up), jump (both up, feet off the
 * ground), skip (one leg kicked out). `baseY` is the soles of the feet and
 * `h` the whole height.
 */
export function child(x: number, baseY: number, h: number, top: string, o: { hair?: string; skin?: string; pose?: 'stand' | 'wave' | 'jump' | 'skip'; legs?: string; skirt?: boolean } = {}): Node[] {
  const hair = o.hair ?? C.hairBrown;
  const skin = o.skin ?? C.skin;
  const legs = o.legs ?? C.blueDark;
  const pose = o.pose ?? 'stand';
  const lift = pose === 'jump' ? h * 0.12 : 0;
  const foot = baseY - lift;
  const hr = h * 0.17;
  const headY = foot - h + hr;
  const hip = foot - h * 0.38;
  const shoulder = headY + hr + h * 0.06;
  const w = h * 0.13;
  const out: Node[] = [];
  // legs
  const kick = pose === 'skip' ? h * 0.2 : 0;
  out.push(piece(band([[x - w * 0.5, hip], [x - w * 0.6, foot]], h * 0.1), legs, { rough: 0.6 }));
  out.push(piece(band([[x + w * 0.5, hip], [x + w * 0.6 + kick, foot - kick * 0.4]], h * 0.1), legs, { rough: 0.6 }));
  // arms
  const armUp = pose === 'wave' || pose === 'jump';
  out.push(piece(band([[x - w, shoulder + 2], [x - w * 1.9, armUp ? shoulder - h * 0.2 : hip - h * 0.06]], h * 0.08), top, { rough: 0.5 }));
  out.push(piece(band([[x + w, shoulder + 2], [x + w * 1.9, pose === 'jump' ? shoulder - h * 0.2 : hip - h * 0.06]], h * 0.08), top, { rough: 0.5 }));
  // body: a frock or a jumper
  out.push(
    piece(
      o.skirt
        ? poly([[x - w * 0.9, shoulder], [x + w * 0.9, shoulder], [x + w * 1.8, hip + h * 0.1], [x - w * 1.8, hip + h * 0.1]])
        : curve([[x - w, shoulder], [x + w, shoulder], [x + w * 1.05, hip], [x - w * 1.05, hip]], 1),
      top,
      { rough: 0.6 },
    ),
  );
  // head and hair
  out.push(piece(circle(x, headY, hr), skin, { rough: 0.5 }));
  out.push(piece(curve([[x - hr, headY + 1], [x - hr * 0.9, headY - hr * 0.9], [x, headY - hr * 1.15], [x + hr * 0.9, headY - hr * 0.9], [x + hr, headY + 1], [x, headY - hr * 0.35]], 2), hair, { rough: 0.5 }));
  return out;
}

/** A washing line from a to b with little socks pegged along it. */
export function sockLine(a: Pt, b: Pt, sag: number, colors: string[], count = 6, s = 1): Node[] {
  const at = (t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + Math.sin(t * Math.PI) * sag];
  const line: Pt[] = [];
  for (let i = 0; i <= 12; i++) line.push(at(i / 12));
  const out: Node[] = [ink(line, { width: 2.2 * s, color: C.brownDark, wobble: 0.2 })];
  for (let i = 0; i < count; i++) {
    const [px, py] = at((i + 0.5) / count);
    const c = colors[i % colors.length];
    const len = (20 + (i % 3) * 6) * s;
    const w = 8 * s;
    out.push(
      piece(curve([[px - w, py], [px + w, py], [px + w, py + len], [px + w * 2.1, py + len + w * 0.9], [px + w * 1.2, py + len + w * 2], [px - w, py + len + w * 0.8]], 1), c, { rough: 0.5 }),
      piece(rect(px - w, py, w * 2, 5 * s), C.cream, flat),
      piece(rect(px - 2 * s, py - 4 * s, 4 * s, 9 * s), C.brownDark, flat),
    );
  }
  return out;
}

/** Smoke held still: a curling chain of soft puffs rising from (x, y). */
function smoke(x: number, y: number, s: number): Node[] {
  const pts: [number, number, number][] = [[0, 0, 12], [8, -22, 15], [26, -46, 18], [52, -64, 21], [84, -76, 24]];
  return pts.map(([dx, dy, r], i) => piece(circle(x + dx * s, y + dy * s, r * s), SMOKE, { ...flat, opacity: 0.92 - i * 0.12 }));
}

/**
 * The great boot, toe to the left, standing on y = baseY with its toe at
 * x. At s = 1 it is 600 wide and about 440 tall.
 */
export function bootHouse(x: number, baseY: number, s = 1): Node {
  const glow = C.candle;
  const arch = (cx: number, top: number, w: number, h: number): Node[] => [
    piece(rect(cx - w / 2 - 6, top - 6, w + 12, h + 12, w / 2 + 4), LEATHER_DARK, { edge: 'cut' }),
    piece(rect(cx - w / 2, top, w, h, w / 2), glow, { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(cx - 2, top + 6, 4, h - 6), LEATHER_DARK, { edge: 'clean', shadow: false }),
    piece(rect(cx - w / 2, top + h * 0.5, w, 4), LEATHER_DARK, { edge: 'clean', shadow: false }),
    piece(rect(cx - w / 2 - 8, top + h + 4, w + 16, 7, 2), LEATHER_LIGHT, { edge: 'cut' }),
  ];
  // The eyelets run down the slanted front of the boot, and the laces zig-zag between them.
  const top: Pt = [388, -392];
  const bot: Pt = [196, -176];
  const p = (t: number, side: number): Pt => [top[0] + (bot[0] - top[0]) * t + side * 15, top[1] + (bot[1] - top[1]) * t + side * 13];
  const steps = 7;
  const laces: Node[] = [];
  for (let i = 0; i < steps; i++) {
    const t0 = i / steps;
    const t1 = (i + 1) / steps;
    laces.push(ink([p(t0, -1), p(t1, 1)], { width: 5, color: LACE, wobble: 0.5 }), ink([p(t0, 1), p(t1, -1)], { width: 5, color: LACE, wobble: 0.5 }));
  }
  const eyelets: Node[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    for (const side of [-1, 1]) {
      const [ex, ey] = p(t, side);
      eyelets.push(piece(circle(ex, ey, 5.5), C.brass, { edge: 'clean', shadow: false }), piece(circle(ex, ey, 2.4), LEATHER_DARK, { edge: 'clean', shadow: false }));
    }
  }
  const [bx, by] = p(0, 0);
  const bow: Node[] = [
    piece(curve([[bx, by - 4], [bx - 40, by - 50], [bx - 66, by - 30], [bx - 30, by + 4]], 2), LACE, { edge: 'cut' }),
    piece(curve([[bx, by - 4], [bx + 38, by - 56], [bx + 64, by - 34], [bx + 28, by + 6]], 2), LACE, { edge: 'cut' }),
    ink([[bx, by], [bx - 20, by + 40], [bx - 14, by + 72]], { width: 5, color: LACE }),
    ink([[bx, by], [bx + 24, by + 34], [bx + 40, by + 58]], { width: 5, color: LACE }),
    piece(circle(bx, by - 2, 8), LACE, { edge: 'cut' }),
  ];
  const stitches: Node[] = [];
  for (let i = 0; i < 16; i++) stitches.push(ink([[24 + i * 36, -22], [36 + i * 36, -22]], { width: 2, color: 'rgba(240,220,170,0.7)', wobble: 0.2 }));
  const nodes: Node[] = [
    // the boot itself
    piece(curve([[8, -2], [596, -2], [606, -42], [600, -300], [596, -424], [380, -428], [372, -380], [330, -300], [262, -214], [180, -158], [96, -146], [24, -118], [-8, -62]], 2), LEATHER),
    // a lighter belly and scuffs, to give it a worn, loved look
    piece(ellipse(300, -60, 240, 34, -3), LEATHER_LIGHT, { ...flat, opacity: 0.45 }),
    piece(ellipse(500, -310, 60, 90, 8), LEATHER_LIGHT, { ...flat, opacity: 0.35 }),
    piece(curve([[30, -100], [60, -140], [120, -148], [150, -100], [100, -64], [50, -70]], 2), LEATHER_DARK, { ...flat, opacity: 0.35 }),
    ink([[14, -92], [48, -134], [110, -144]], { width: 2.4, color: 'rgba(40,20,10,0.35)' }),
    // a patch
    piece(rect(536, -120, 46, 40, 3), BUTTERCUP, { edge: 'cut' }),
    ink([[541, -115], [577, -115], [577, -85], [541, -85], [541, -115]], { width: 1.6, color: 'rgba(90,50,20,0.55)', wobble: 0.3 }),
    // sole, heel and stitches
    piece(curve([[-12, -22], [610, -22], [616, 12], [-6, 12]], 1), SOLE),
    piece(rect(470, -34, 150, 54, 6), SOLE),
    ...stitches,
    // the cuff round the top, the dark opening and the tongue
    piece(ellipse(488, -428, 112, 20), SOLE, { rough: 0.8 }),
    piece(poly([[372, -420], [396, -470], [440, -462], [430, -412]]), LEATHER_LIGHT),
    piece(rect(372, -448, 234, 54, 8), LEATHER_LIGHT, { rough: 0.8 }),
    piece(ellipse(488, -446, 112, 18), '#2a1a10', { edge: 'cut', fibre: false }),
    ink([[380, -402], [600, -402]], { width: 2, color: 'rgba(40,20,10,0.3)' }),
    // the chimney on the toe, with its smoke
    group({ transform: 'rotate(-6 150 -150)' }, [
      piece(rect(122, -224, 56, 90), BRICK, { rough: 0.7 }),
      piece(rect(114, -234, 72, 18, 3), '#8f3f2b', { edge: 'cut' }),
      ...[-206, -186, -166].map((y) => ink([[122, y], [178, y]], { width: 2, color: 'rgba(40,10,5,0.35)' })),
      ...[[140, -206], [160, -186], [140, -166]].map(([bx2, by2]) => ink([[bx2, by2], [bx2, by2 - 20]], { width: 2, color: 'rgba(40,10,5,0.3)' })),
    ]),
    ...smoke(140, -260, 1.6),
    // doors and windows cut into the leather
    ...arch(92, -92, 56, 84),
    piece(circle(100, -48, 4), C.brass, { edge: 'clean', shadow: false }),
    piece(rect(56, -4, 80, 10, 2), C.stoneLight, { edge: 'cut' }),
    piece(circle(232, -98, 24), LEATHER_DARK, { edge: 'cut' }),
    piece(circle(232, -98, 18), glow, { edge: 'cut', fibre: false, shadow: false }),
    ink([[214, -98], [250, -98]], { width: 3, color: LEATHER_DARK }),
    ink([[232, -116], [232, -80]], { width: 3, color: LEATHER_DARK }),
    ...arch(452, -360, 42, 56),
    ...arch(540, -360, 42, 56),
    ...arch(496, -240, 46, 62),
    // flower boxes under the shaft windows
    piece(rect(432, -296, 128, 14, 3), LEATHER_DARK, { edge: 'cut' }),
    ...[438, 458, 478, 498, 518, 538].map((fx, i) => piece(circle(fx, -304, 7), i % 2 ? C.raspberry : BUTTERCUP, flat)),
    // the laces on top
    ...eyelets,
    ...laces,
    ...bow,
  ];
  return group({ transform: `translate(${x} ${baseY}) scale(${s})` }, nodes);
}

/** A little vegetable patch: soil rows with leafy tops, carrots and cabbages. */
function vegPatch(x: number, y: number, w: number, seed: number): Node[] {
  const r = rng(seed);
  const out: Node[] = [piece(ellipse(x, y, w / 2, w * 0.1), '#6a4a30', { rough: 1 })];
  for (let row = 0; row < 3; row++) {
    const yy = y - w * 0.04 + (row - 1) * w * 0.05;
    for (let i = 0; i < 6; i++) {
      const px = x - w * 0.4 + (i + 0.5) * (w * 0.8) / 6 + (r() - 0.5) * 6;
      if (row === 1 && i % 2 === 0) {
        out.push(piece(circle(px, yy - 6, 10), C.leaf, flat), piece(circle(px - 3, yy - 8, 6), C.leafLight, flat));
      } else {
        out.push(piece(poly([[px - 5, yy], [px, yy - 18], [px + 5, yy]]), C.leaf, flat), piece(poly([[px - 1, yy], [px + 6, yy - 14], [px + 7, yy]]), C.leafDark, flat));
        if (row === 2) out.push(piece(poly([[px - 3, yy], [px + 3, yy], [px, yy + 7]]), C.carrot, flat));
      }
    }
  }
  return out;
}

/** A short low fence of leaning stakes. */
function fence(x0: number, x1: number, y: number): Node[] {
  const out: Node[] = [];
  for (let x = x0; x < x1; x += 22) out.push(piece(poly([[x, y], [x + 11, y], [x + 11, y - 40], [x + 5, y - 48], [x, y - 40]]), C.cream, { rough: 0.5 }));
  out.push(piece(rect(x0 - 4, y - 30, x1 - x0 + 8, 5), C.sand, { edge: 'cut' }), piece(rect(x0 - 4, y - 14, x1 - x0 + 8, 5), C.sand, { edge: 'cut' }));
  return out;
}

export function farNodes(): Node[] {
  const base = farBase(MEADOW, 1101, { cloud: '#f4f0e6', shade: C.cloudShade });
  return [
    ...base.back,
    ...roundTree(60, 144, 56, 1111),
    ...roundTree(548, 144, 60, 1112),
    ...roundTree(470, 146, 44, 1113),
    ...sockLine([72, 104], [212, 122], 5, [C.red, BUTTERCUP, SKY_BLUE, C.pink, C.green], 5, 0.55),
    piece(rect(70, 100, 3, 46), C.brownDark, { edge: 'clean', shadow: false }),
    bootHouse(210, 141, 0.31),
    ...[[110, 144, C.red], [400, 146, BUTTERCUP], [430, 144, C.pink], [140, 146, SKY_BLUE], [510, 146, BUTTERCUP]].flatMap(([fx, fy, c]) => flower(fx as number, fy as number, 5, c as string)),
    ...child(118, 142, 15, C.red, { pose: 'wave' }),
    ...child(150, 144, 13, BUTTERCUP, { pose: 'jump', skirt: true }),
    ...child(180, 144, 14, C.teal, { pose: 'skip' }),
    ...child(360, 144, 13, C.pink, { skirt: true }),
    ...base.front,
  ];
}

export const landFar = (name: string): string => farSvg(name, farNodes(), 'The Old Woman’s Shoe');

export function landScene(name: string): string {
  const r = rng(1103);
  const daisies: Node[] = [];
  // flowers are kept to the edges so the middle stays calm
  for (let i = 0; i < 40; i++) {
    const x = r() < 0.5 ? 10 + r() * 300 : 880 + r() * 290;
    const y = 640 + r() * 170;
    daisies.push(...flower(x, y, 6 + r() * 5, i % 3 === 0 ? C.pink : i % 3 === 1 ? C.white : BUTTERCUP));
  }
  const buttercups: Node[] = [];
  for (let i = 0; i < 30; i++) buttercups.push(piece(circle(20 + r() * 1140, 600 + r() * 200, 4 + r() * 3), BUTTERCUP, { ...flat, opacity: 0.8 }));
  return sceneSvg(name, [
    ...sky([
      [SKY_BLUE, 0],
      [SKY_PALE, 250],
      ['#e8f1f4', 430],
    ]),
    cloud(240, 130, 320, 3, '#ffffff', 0.9),
    cloud(760, 80, 260, 4, '#ffffff', 0.85),
    cloud(1040, 190, 220, 5, '#ffffff', 0.8),
    piece(circle(110, 90, 44), '#fbe38a', { ...flat, opacity: 0.9 }),
    // far-off hills with round trees
    hills(520, 50, MEADOW_FAR, 1104, { step: 150 }),
    ...[[90, 540, 90], [200, 548, 70], [360, 540, 80], [1060, 520, 70]].flatMap(([tx, ty, th], i) => roundTree(tx, ty, th, 1120 + i)),
    hills(590, 30, MEADOW, 1105, { step: 120 }),
    // the Shoe
    piece(ellipse(870, 590, 360, 24), MEADOW_DARK, { ...flat, opacity: 0.7 }),
    bootHouse(560, 585, 0.98),
    // a garden fence and the vegetable patch, to the left of the boot
    ...fence(1010, 1170, 650),
    // the front meadow, rolling up to the bottom edge
    hills(680, 36, MEADOW_DARK, 1106, { step: 160 }),
    hills(730, 28, MEADOW, 1107, { step: 140 }),
    ...vegPatch(190, 700, 280, 1108),
    // washing line from a pole to the boot's toe
    piece(rect(40, 330, 8, 265), C.brownDark, { rough: 0.5 }),
    ...sockLine([44, 340], [540, 470], 34, [C.red, BUTTERCUP, SKY_BLUE, C.pink, C.green, C.orange], 9),
    ...buttercups,
    ...daisies,
    // the children
    ...child(150, 652, 70, C.red, { pose: 'wave' }),
    ...child(308, 660, 62, BUTTERCUP, { pose: 'skip', skirt: true, hair: C.hairAuburn }),
    ...child(1000, 700, 74, C.teal, { pose: 'jump', hair: C.hairBlack, skin: C.skinBrown }),
    ...child(1075, 706, 66, C.pink, { pose: 'wave', skirt: true, hair: C.hairSandy }),
    ...child(900, 760, 78, C.blue, { pose: 'stand', hair: C.hairBrown }),
    ...child(660, 590, 52, C.purple, { pose: 'stand', hair: C.hairAuburn, skirt: true }),
    ...child(706, 592, 48, C.orange, { pose: 'wave' }),
    ...child(1130, 640, 54, C.green, { pose: 'jump', skirt: true }),
  ]);
}
