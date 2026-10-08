/**
 * Land 14: the Land of the Red Goblins. From the ladder it is a red rocky
 * hill-land with a dark goblin hole in it (a little red cap peeping out).
 * At ground level we are down in the goblin caves: dark reds and earthy
 * browns lit by warm lanterns and glowing mushrooms, heaps of goblin gold,
 * big goblin scales, jugs and a soup cauldron, tunnels leading off, and a
 * rope ladder climbing up to a patch of daylight.
 *
 * It is gloomy but never too dark to see the puppets: the back wall is a
 * mid brown-red, and the centre-lower stage is kept open and warm. Nothing
 * moves (backdrops never boil).
 */
import { C } from '../palette';
import { band, circle, curve, ellipse, ink, piece, poly, rect, rng, type Node, type Pt } from '../paper';
import { farBase, farSvg, flat, sceneSvg } from './common';

// Local colours (palette.ts is not edited by the land workstreams).
const ROCK_LIGHT = '#b0482f';
const ROCK = '#8c3626';
const ROCK_DARK = '#672619';
const WALL = '#4a2318';
const WALL_LIGHT = '#5e2d1f';
const CEILING = '#2c130f';
const FLOOR = '#6b3a24';
const FLOOR_LIGHT = '#82492c';
const HOLE = '#1a0a08';
const GLOW = '#f6b848';
const GLOW_PALE = '#fbdc8a';
const SHROOM = '#f4cf5a';
const SHROOM_GREEN = '#9fe0a4';
const GOBLIN_CAP = '#c42c3a';

/** A soft pool of lantern light: a few see-through discs, bigger and fainter outwards. */
function glow(x: number, y: number, r: number, color: string = GLOW, strength = 1): Node[] {
  return [1, 0.72, 0.46].map((k, i) => piece(circle(x, y, r * k), color, { ...flat, opacity: (0.07 + i * 0.05) * strength }));
}

/** A hanging lantern on a chain from (x, y) down by `drop`. */
function lantern(x: number, y: number, drop: number, s = 1): Node[] {
  const ly = y + drop;
  return [
    ...glow(x, ly + 24 * s, 120 * s),
    ink([[x, y], [x, ly]], { width: 2.4, color: C.iron }),
    piece(poly([[x - 11 * s, ly], [x + 11 * s, ly], [x + 15 * s, ly + 10 * s], [x - 15 * s, ly + 10 * s]]), C.iron, { edge: 'cut' }),
    piece(rect(x - 12 * s, ly + 10 * s, 24 * s, 30 * s, 3), GLOW, { edge: 'cut', fibre: false }),
    piece(ellipse(x, ly + 26 * s, 6 * s, 10 * s), GLOW_PALE, { ...flat }),
    piece(rect(x - 1.5 * s, ly + 10 * s, 3 * s, 30 * s), C.iron, { edge: 'clean', shadow: false }),
    piece(rect(x - 15 * s, ly + 40 * s, 30 * s, 7 * s), C.iron, { edge: 'cut' }),
  ];
}

/** A glowing mushroom with a pale cap and glowing spots. */
function glowShroom(x: number, baseY: number, s: number, color: string = SHROOM): Node[] {
  return [
    ...glow(x, baseY - s * 0.7, s * 1.5, color, 0.9),
    piece(curve([[x - s * 0.16, baseY], [x - s * 0.1, baseY - s * 0.55], [x + s * 0.1, baseY - s * 0.55], [x + s * 0.16, baseY]], 1), C.cream, { rough: 0.6 }),
    piece(curve([[x - s * 0.55, baseY - s * 0.5], [x - s * 0.4, baseY - s * 0.92], [x, baseY - s * 1.05], [x + s * 0.4, baseY - s * 0.92], [x + s * 0.55, baseY - s * 0.5]], 2), color, { rough: 0.7 }),
    piece(circle(x - s * 0.2, baseY - s * 0.76, s * 0.07), C.white, flat),
    piece(circle(x + s * 0.14, baseY - s * 0.86, s * 0.08), C.white, flat),
  ];
}

/** A little heap of gold coins, with a few on top catching the light. */
function coinHeap(x: number, baseY: number, w: number, h: number, seed: number): Node[] {
  const r = rng(seed);
  const out: Node[] = [piece(ellipse(x, baseY, w * 0.62, h * 0.16), 'rgba(30,12,6,0.3)', flat)];
  out.push(piece(curve([[x - w / 2, baseY], [x - w * 0.34, baseY - h * 0.55], [x - w * 0.1, baseY - h * 0.95], [x + w * 0.12, baseY - h], [x + w * 0.36, baseY - h * 0.5], [x + w / 2, baseY]], 2), C.brassDark, { rough: 1.1 }));
  for (let i = 0; i < 26; i++) {
    const t = r();
    const px = x - w * 0.42 + t * w * 0.84;
    const top = baseY - h * Math.max(0.12, 1 - Math.abs(t - 0.52) * 2.1);
    const py = top + r() * (baseY - top) * 0.8 + 2;
    out.push(piece(ellipse(px, py, 11 + r() * 4, 7 + r() * 2, (r() - 0.5) * 40), i % 3 ? C.gold : C.goldLight, { edge: 'cut', fibre: false }));
  }
  out.push(piece(ellipse(x + w * 0.1, baseY - h * 0.97, 12, 7), C.goldLight, { edge: 'cut' }));
  out.push(piece(ellipse(x - w * 0.12, baseY - h * 0.84, 9, 5, 18), C.white, { ...flat, opacity: 0.35 }));
  return out;
}

/** A fat round-bellied jug with a handle and a dark mouth. */
function jug(x: number, baseY: number, s: number, color: string): Node[] {
  return [
    piece(ellipse(x, baseY - 2 * s, 24 * s, 5 * s), 'rgba(30,12,6,0.28)', flat),
    piece(curve([[x - 10 * s, baseY - 52 * s], [x - 26 * s, baseY - 34 * s], [x - 24 * s, baseY - 8 * s], [x, baseY], [x + 24 * s, baseY - 8 * s], [x + 26 * s, baseY - 34 * s], [x + 10 * s, baseY - 52 * s]], 2), color),
    piece(ellipse(x, baseY - 54 * s, 11 * s, 4 * s), HOLE, flat),
    ink([[x + 22 * s, baseY - 40 * s], [x + 40 * s, baseY - 36 * s], [x + 36 * s, baseY - 14 * s], [x + 24 * s, baseY - 14 * s]], { width: 5 * s, color }),
    piece(ellipse(x - 12 * s, baseY - 30 * s, 4 * s, 10 * s, 12), C.white, { ...flat, opacity: 0.25 }),
    ink([[x - 22 * s, baseY - 24 * s], [x, baseY - 18 * s], [x + 22 * s, baseY - 24 * s]], { width: 2.4 * s, color: C.ink, opacity: 0.4 }),
  ];
}

/** A big black soup cauldron on a little fire, steaming (the steam is still). */
function cauldron(x: number, baseY: number, s: number): Node[] {
  const out: Node[] = [...glow(x, baseY - 20 * s, 150 * s, GLOW, 1.1)];
  // logs and flames
  out.push(piece(band([[x - 50 * s, baseY], [x + 40 * s, baseY - 12 * s]], 12 * s), C.barkDark));
  out.push(piece(band([[x + 50 * s, baseY], [x - 40 * s, baseY - 12 * s]], 12 * s), C.bark));
  out.push(piece(poly([[x - 34 * s, baseY - 8 * s], [x - 22 * s, baseY - 46 * s], [x - 10 * s, baseY - 14 * s], [x, baseY - 56 * s], [x + 12 * s, baseY - 14 * s], [x + 24 * s, baseY - 42 * s], [x + 34 * s, baseY - 8 * s]]), C.orange, { edge: 'cut', fibre: false }));
  out.push(piece(poly([[x - 18 * s, baseY - 8 * s], [x - 8 * s, baseY - 32 * s], [x, baseY - 10 * s], [x + 10 * s, baseY - 30 * s], [x + 18 * s, baseY - 8 * s]]), GLOW_PALE, flat));
  // the pot
  out.push(piece(curve([[x - 66 * s, baseY - 120 * s], [x - 82 * s, baseY - 80 * s], [x - 60 * s, baseY - 40 * s], [x, baseY - 30 * s], [x + 60 * s, baseY - 40 * s], [x + 82 * s, baseY - 80 * s], [x + 66 * s, baseY - 120 * s]], 2), '#2d2830'));
  out.push(piece(ellipse(x, baseY - 120 * s, 68 * s, 12 * s), '#3d3742', { edge: 'cut' }));
  out.push(piece(ellipse(x, baseY - 120 * s, 58 * s, 8 * s), '#b4562e', { ...flat }));
  out.push(piece(ellipse(x - 20 * s, baseY - 122 * s, 9 * s, 3 * s), '#e0805a', flat));
  out.push(piece(ellipse(x + 22 * s, baseY - 118 * s, 7 * s, 2.4 * s), '#e0805a', flat));
  out.push(piece(ellipse(x - 40 * s, baseY - 80 * s, 6 * s, 22 * s, 16), C.white, { ...flat, opacity: 0.14 }));
  out.push(piece(rect(x - 74 * s, baseY - 118 * s, 148 * s, 6 * s, 2), '#4a444e', { edge: 'cut', fibre: false }));
  // a ladle, and steam
  out.push(ink([[x + 30 * s, baseY - 122 * s], [x + 64 * s, baseY - 170 * s]], { width: 5 * s, color: C.wood }));
  for (const [dx, k] of [[-20, 0], [6, 1], [28, 2]] as const) {
    out.push(piece(curve([[x + dx * s, baseY - 140 * s], [x + (dx - 10) * s, baseY - 170 * s], [x + (dx + 8) * s, baseY - 200 * s], [x + (dx - 4) * s, baseY - 230 * s - k * 6], [x + (dx + 8) * s, baseY - 200 * s], [x + (dx + 2) * s, baseY - 168 * s]], 2), C.cloud, { ...flat, opacity: 0.2 }));
  }
  return out;
}

/** A big goblin balance: a post, a beam, and two pans (one heavier, with gold). */
function scales(x: number, baseY: number, s: number): Node[] {
  const top = baseY - 250 * s;
  const tilt = 14 * s;
  const lx = x - 100 * s;
  const rx = x + 100 * s;
  const ly = top + tilt + 8 * s;
  const ry = top - tilt + 8 * s;
  const pan = (px: number, py: number): Node[] => [
    ink([[px, py], [px - 34 * s, py + 74 * s]], { width: 2.2 * s, color: C.brassDark }),
    ink([[px, py], [px + 34 * s, py + 74 * s]], { width: 2.2 * s, color: C.brassDark }),
    piece(curve([[px - 44 * s, py + 74 * s], [px - 30 * s, py + 90 * s], [px + 30 * s, py + 90 * s], [px + 44 * s, py + 74 * s]], 2), C.brass),
    piece(ellipse(px, py + 74 * s, 44 * s, 5 * s), C.goldLight, { edge: 'cut', fibre: false }),
  ];
  return [
    piece(ellipse(x, baseY, 70 * s, 9 * s), 'rgba(30,12,6,0.3)', flat),
    piece(curve([[x - 56 * s, baseY], [x - 26 * s, baseY - 26 * s], [x - 8 * s, baseY - 40 * s], [x + 8 * s, baseY - 40 * s], [x + 26 * s, baseY - 26 * s], [x + 56 * s, baseY]], 1), C.iron),
    piece(rect(x - 8 * s, top, 16 * s, baseY - top - 20 * s, 3), C.ironLight, { edge: 'cut' }),
    piece(band([[lx, ly - 6 * s], [x, top + 2 * s], [rx, ry - 6 * s]], 10 * s), C.brass, { edge: 'cut' }),
    piece(circle(x, top + 2 * s, 11 * s), C.gold, { edge: 'cut' }),
    // a tick dial under the beam
    piece(circle(x, top + 40 * s, 20 * s), C.cream, { edge: 'cut' }),
    ink([[x, top + 40 * s], [x + 9 * s, top + 29 * s]], { width: 2.6 * s, color: C.ruler }),
    ...pan(lx, ly),
    ...pan(rx, ry),
    // gold in the low pan, and the other nearly empty
    piece(ellipse(lx - 10 * s, ly + 70 * s, 12 * s, 6 * s), C.gold, { edge: 'cut', fibre: false }),
    piece(ellipse(lx + 12 * s, ly + 68 * s, 12 * s, 6 * s), C.goldLight, { edge: 'cut', fibre: false }),
    piece(ellipse(lx, ly + 62 * s, 12 * s, 6 * s), C.gold, { edge: 'cut', fibre: false }),
    piece(ellipse(rx, ry + 70 * s, 10 * s, 5 * s), C.gold, { edge: 'cut', fibre: false }),
  ];
}

/** A rope ladder hanging from (x, y) down by len, with wooden rungs. */
function ropeLadder(x: number, y: number, len: number, sway = 0): Node[] {
  const out: Node[] = [];
  const side = (dx: number): Pt[] => [[x + dx, y], [x + dx + sway * 0.5, y + len * 0.5], [x + dx + sway, y + len]];
  out.push(piece(band(side(-22), 5), C.sand, { edge: 'cut', fibre: false }));
  out.push(piece(band(side(22), 5), C.sand, { edge: 'cut', fibre: false }));
  for (let d = 24; d < len; d += 36) {
    const k = d / len;
    const off = sway * (k < 0.5 ? k : k) * (k < 0.5 ? 1 : 1);
    out.push(piece(rect(x - 28 + off, y + d, 56, 8, 3), C.wood, { edge: 'cut' }));
  }
  return out;
}

/** A dark tunnel mouth in the wall, framed by wooden props, with a faint far glimmer. */
function tunnel(x: number, baseY: number, w: number, h: number, lamp = false): Node[] {
  const out: Node[] = [
    piece(curve([[x - w / 2, baseY], [x - w / 2, baseY - h * 0.6], [x - w * 0.3, baseY - h * 0.92], [x, baseY - h], [x + w * 0.3, baseY - h * 0.92], [x + w / 2, baseY - h * 0.6], [x + w / 2, baseY]], 2), HOLE),
    piece(curve([[x - w * 0.34, baseY], [x - w * 0.34, baseY - h * 0.55], [x, baseY - h * 0.8], [x + w * 0.34, baseY - h * 0.55], [x + w * 0.34, baseY]], 2), '#10070a', flat),
    piece(rect(x - w / 2 - 8, baseY - h * 0.62, 12, h * 0.62, 2), C.barkDark, { edge: 'cut' }),
    piece(rect(x + w / 2 - 4, baseY - h * 0.62, 12, h * 0.62, 2), C.barkDark, { edge: 'cut' }),
    piece(rect(x - w / 2 - 14, baseY - h * 0.66, w + 28, 12, 2), C.bark, { edge: 'cut' }),
  ];
  if (lamp) out.push(piece(circle(x, baseY - h * 0.28, 7), GLOW, { ...flat, opacity: 0.6 }), ...glow(x, baseY - h * 0.28, 40, GLOW, 0.7));
  return out;
}

/** A row of hanging stalactites along the cave roof. */
function stalactites(seed: number, y0: number, maxLen: number, step = 70): Node[] {
  const r = rng(seed);
  const out: Node[] = [];
  for (let x = -20; x < 1220; x += step * (0.7 + r() * 0.6)) {
    const wd = 26 + r() * 30;
    const len = maxLen * (0.35 + r() * 0.65);
    out.push(piece(poly([[x - wd / 2, y0 - 4], [x + wd / 2, y0 - 4], [x + (r() - 0.5) * 8, y0 + len]]), r() > 0.5 ? CEILING : '#38180f', { edge: 'cut', fibre: false }));
  }
  return out;
}

export function farNodes(): Node[] {
  const base = farBase(ROCK, 1401, { top: 78, cloud: '#e0c6be', shade: '#a07f78' });
  return [
    ...base.back,
    // craggy red rock peaks either side
    piece(poly([[34, 150], [82, 52], [108, 76], [152, 22], [204, 100], [238, 150]]), ROCK_DARK, { rough: 1.1 }),
    piece(poly([[370, 150], [412, 70], [446, 92], [498, 18], [548, 94], [572, 150]]), ROCK_DARK, { rough: 1.1 }),
    piece(poly([[152, 22], [176, 64], [160, 60], [148, 82], [134, 60]]), ROCK_LIGHT, flat),
    piece(poly([[498, 18], [522, 62], [506, 58], [492, 80], [478, 56]]), ROCK_LIGHT, flat),
    // the hillside the goblin hole is dug into
    piece(curve([[70, 156], [130, 96], [230, 66], [300, 58], [370, 66], [470, 96], [540, 156]], 2), ROCK_LIGHT, { rough: 1.2 }),
    piece(curve([[120, 156], [200, 112], [300, 98], [400, 112], [490, 156]], 2), ROCK, { rough: 1.2 }),
    // the goblin hole: a wide dark mouth with a wooden frame and a warm glow deep inside
    piece(curve([[236, 156], [238, 108], [258, 74], [300, 62], [342, 74], [362, 108], [364, 156]], 2), HOLE, { rough: 1.1 }),
    piece(ellipse(300, 126, 40, 26), GLOW, { ...flat, opacity: 0.2 }),
    piece(rect(226, 82, 12, 74, 2), C.barkDark, { edge: 'cut' }),
    piece(rect(362, 82, 12, 74, 2), C.barkDark, { edge: 'cut' }),
    piece(rect(220, 72, 160, 13, 2), C.bark, { edge: 'cut' }),
    // two yellow eyes in the dark, and a red cap peeping over the beam, bell and all
    piece(ellipse(284, 118, 8, 3.8, -14), '#f2d43a', flat),
    piece(ellipse(316, 118, 8, 3.8, 14), '#f2d43a', flat),
    piece(poly([[286, 134], [314, 134], [308, 142], [292, 142]]), '#f4efe0', flat),
    piece(curve([[268, 74], [274, 44], [302, 30], [338, 38], [332, 52], [312, 48], [304, 74]], 2), GOBLIN_CAP, { rough: 0.8 }),
    piece(circle(340, 52, 5), C.gold, { edge: 'cut' }),
    // a stovepipe with soup steam, a lantern on a stake, glowing mushrooms, gold at the doorstep
    piece(rect(432, 74, 14, 38, 2), C.iron, { edge: 'cut' }),
    piece(circle(440, 62, 8), C.cloud, { ...flat, opacity: 0.5 }),
    piece(circle(448, 46, 10), C.cloud, { ...flat, opacity: 0.38 }),
    piece(circle(442, 28, 12), C.cloud, { ...flat, opacity: 0.26 }),
    ink([[170, 150], [170, 108]], { width: 3.4, color: C.barkDark }),
    ...glow(170, 98, 34, GLOW, 0.9),
    piece(rect(161, 82, 18, 20, 2), GLOW, { edge: 'cut', fibre: false }),
    ...glowShroom(96, 150, 20, SHROOM),
    ...glowShroom(118, 152, 13, SHROOM_GREEN),
    ...glowShroom(520, 150, 18, SHROOM),
    ...coinHeap(210, 156, 50, 24, 14),
    ...base.front,
  ];
}

export const landFar = (name: string): string => farSvg(name, farNodes(), 'The Land of the Red Goblins');

export function landScene(name: string): string {
  const r = rng(1414);
  // Rock strata on the back wall: wide torn bands, a little lighter than the ceiling.
  const strata: Node[] = [];
  for (let i = 0; i < 7; i++) {
    const y = 110 + i * 86;
    const pts: Pt[] = [[-30, y + 80]];
    for (let x = -30; x <= 1230; x += 110) pts.push([x, y + (r() - 0.5) * 34]);
    pts.push([1230, y + 80]);
    strata.push(piece(curve(pts, 2), i % 2 ? WALL_LIGHT : WALL, { ...flat, opacity: 0.9 }));
  }
  // Rock texture: scattered flat chips.
  const chips: Node[] = [];
  for (let i = 0; i < 44; i++) {
    const x = r() * 1180;
    const y = 80 + r() * 560;
    chips.push(piece(ellipse(x, y, 10 + r() * 22, 5 + r() * 9, r() * 60), r() > 0.5 ? ROCK_DARK : ROCK, { ...flat, opacity: 0.18 + r() * 0.12 }));
  }
  // Wood posts and a beam holding up the roof at both edges.
  const timber: Node[] = [
    piece(rect(36, 40, 28, 640, 3), C.barkDark, { rough: 0.8 }),
    piece(rect(1118, 40, 28, 640, 3), C.barkDark, { rough: 0.8 }),
    piece(rect(20, 44, 160, 26, 3), C.bark, { rough: 0.8 }),
    piece(rect(1000, 44, 160, 26, 3), C.bark, { rough: 0.8 }),
  ];
  // The daylight shaft top-right, with the rope ladder climbing into it.
  const day: Node[] = [
    piece(poly([[858, 20], [1038, 20], [1100, 520], [820, 520]]), '#f4e6b4', { ...flat, opacity: 0.1 }),
    piece(poly([[890, 20], [1010, 20], [1050, 520], [880, 520]]), '#f4e6b4', { ...flat, opacity: 0.08 }),
    piece(curve([[880, 60], [892, 14], [950, 0], [1016, 14], [1030, 60], [980, 84], [920, 84]], 2), '#bcd8e6', { rough: 1.1 }),
    piece(curve([[900, 50], [940, 22], [990, 28], [1012, 54]], 2), C.white, { ...flat, opacity: 0.5 }),
    piece(circle(990, 42, 12), '#f8efb0', flat),
    // grass lip round the hole
    piece(curve([[868, 72], [884, 54], [900, 76], [920, 60], [944, 88], [990, 66], [1020, 88], [1040, 62], [1046, 80], [1000, 100], [920, 100]], 2), C.leafDark, { rough: 0.9 }),
    ...ropeLadder(950, 70, 470, 14),
  ];
  // The floor: warm, lighter in the middle where the puppets stand.
  const floor: Node[] = [
    piece(curve([[-30, 840], [-30, 640], [200, 610], [600, 596], [1000, 610], [1230, 640], [1230, 840]], 2), FLOOR, { rough: 1.2 }),
    piece(ellipse(590, 700, 440, 70), FLOOR_LIGHT, { ...flat, opacity: 0.6 }),
    ...[[300, 740, 30], [520, 780, 24], [820, 730, 34], [700, 790, 20], [160, 700, 22]].map(([x, y, w]) => piece(ellipse(x, y, w, w * 0.3), ROCK_DARK, { ...flat, opacity: 0.22 })),
  ];
  // Pebbles and bones of soup... just pebbles.
  const pebbles: Node[] = [];
  for (let i = 0; i < 14; i++) pebbles.push(piece(ellipse(60 + r() * 1060, 640 + r() * 170, 5 + r() * 7, 3 + r() * 4), ROCK, { edge: 'cut', fibre: false, opacity: 0.8 }));

  return sceneSvg(name, [
    piece(rect(-20, -20, 1220, 860), WALL, { edge: 'clean', shadow: false }),
    ...strata,
    ...chips,
    // the cave roof and its stalactites
    piece(curve([[-40, -30], [-40, 90], [160, 120], [380, 84], [600, 128], [840, 90], [1040, 124], [1220, 90], [1220, -30]], 2), CEILING, { rough: 1.3 }),
    ...stalactites(7, 100, 110),
    ...timber,
    // tunnels leading off the back wall
    ...tunnel(210, 540, 150, 190, true),
    ...tunnel(700, 440, 120, 150),
    // a shelf of jugs high on the left wall
    piece(rect(250, 250, 260, 14, 3), C.bark, { rough: 0.8 }),
    ...jug(290, 250, 0.7, '#a55a36'),
    ...jug(350, 250, 0.55, '#7a8a6a'),
    ...jug(412, 250, 0.7, '#c08a4a'),
    ...jug(470, 250, 0.5, '#a55a36'),
    // glowing mushrooms on the wall and along the floor edges
    ...glowShroom(560, 330, 24, SHROOM),
    ...glowShroom(588, 338, 15, SHROOM_GREEN),
    ...glowShroom(850, 380, 20, SHROOM),
    // daylight and the ladder
    ...day,
    // hanging lanterns
    ...lantern(400, 98, 60),
    ...lantern(790, 104, 40, 0.9),
    ...lantern(130, 100, 90, 0.8),
    ...floor,
    ...pebbles,
    // glowing mushrooms along the front edges of the floor
    ...glowShroom(300, 654, 26, SHROOM),
    ...glowShroom(334, 662, 16, SHROOM_GREEN),
    ...glowShroom(1080, 660, 26, SHROOM_GREEN),
    ...glowShroom(1046, 672, 16, SHROOM),
    // the right: soup cauldron, and a few jugs beside it
    ...cauldron(1000, 740, 0.9),
    ...jug(870, 770, 0.8, '#a55a36'),
    ...jug(920, 786, 0.6, '#7a8a6a'),
    // the left: heaps of goblin gold, and a split sack
    ...coinHeap(150, 780, 250, 130, 31),
    ...coinHeap(310, 790, 130, 60, 32),
    piece(curve([[40, 700], [70, 660], [110, 664], [120, 700], [100, 730], [50, 730]], 2), '#a98d5e', { rough: 1 }),
    ink([[66, 662], [82, 650], [100, 664]], { width: 4, color: '#8a7048' }),
    // the goblins' scales, in the back right
    ...scales(850, 600, 0.66),
  ]);
}
