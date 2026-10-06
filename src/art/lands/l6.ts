/**
 * Land 6: the Land of Giants. Everything is enormous: we stand at the foot
 * of a giant's table (its leg like a tree trunk, its cloth hanging over us
 * like a curtain), a giant teacup on its saucer lies on the grass (big
 * enough to hide in), buttons as big as tables are scattered about, and
 * far off on the hills stand a pair of giant boots. Tiny trees show the
 * size of it all.
 */
import { C } from '../palette';
import { circle, curve, ellipse, ink, piece, poly, rect, rng, type Node } from '../paper';
import { cloud, farBase, farSvg, flat, hills, roundTree, sceneSvg, sky } from './common';

/** A giant button with four holes. */
function giantButton(cx: number, cy: number, r: number, color: string, tilt = 0.35): Node[] {
  const ry = r * tilt;
  return [
    piece(ellipse(cx, cy + ry * 0.3, r, ry), C.brownDark, { rough: 0.6 }),
    piece(ellipse(cx, cy, r, ry), color, { rough: 0.6 }),
    piece(ellipse(cx, cy, r * 0.78, ry * 0.78), color, { edge: 'cut', fibre: false, shadow: true }),
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dy]) => piece(ellipse(cx + dx * r * 0.2, cy + dy * ry * 0.22, r * 0.09, ry * 0.12), C.ink, { edge: 'cut', fibre: false, shadow: false })),
  ];
}

/** A giant boot, standing (seen far off). */
function boot(x: number, baseY: number, h: number, color: string, flip = 1): Node[] {
  const w = h * 0.7;
  return [
    piece(curve([[x - w * 0.3 * flip, baseY], [x - w * 0.32 * flip, baseY - h], [x + w * 0.18 * flip, baseY - h], [x + w * 0.2 * flip, baseY - h * 0.35], [x + w * 0.62 * flip, baseY - h * 0.25], [x + w * 0.7 * flip, baseY]], 1), color, { rough: 1 }),
    piece(rect(Math.min(x - w * 0.36 * flip, x + w * 0.24 * flip), baseY - h - h * 0.06, w * 0.6, h * 0.1, 3), C.brownDark, { edge: 'cut' }),
    piece(rect(Math.min(x - w * 0.3 * flip, x + w * 0.7 * flip), baseY - h * 0.06, w, h * 0.06), C.ink, { edge: 'cut', fibre: false }),
    // Laces.
    ...[0.3, 0.45, 0.6, 0.75].map((k) => ink([[x - w * 0.12 * flip, baseY - h * k], [x + w * 0.1 * flip, baseY - h * k + h * 0.04]], { width: Math.max(1.5, h * 0.015), color: C.cream })),
  ];
}

/** The giant teacup lying on its saucer. */
function teacup(cx: number, baseY: number, s: number): Node[] {
  return [
    piece(ellipse(cx, baseY, 260 * s, 50 * s), C.white),
    piece(ellipse(cx, baseY - 6 * s, 190 * s, 32 * s), '#e8e2d4', { edge: 'cut', fibre: false, shadow: false }),
    piece(curve([[cx - 170 * s, baseY - 240 * s], [cx - 160 * s, baseY - 60 * s], [cx - 90 * s, baseY - 16 * s], [cx + 90 * s, baseY - 16 * s], [cx + 160 * s, baseY - 60 * s], [cx + 170 * s, baseY - 240 * s]], 2), C.white, { rough: 0.8 }),
    // Handle.
    piece(ellipse(cx + 190 * s, baseY - 150 * s, 50 * s, 66 * s), C.white),
    piece(ellipse(cx + 190 * s, baseY - 150 * s, 26 * s, 40 * s), C.giantSky, { edge: 'cut', fibre: false, shadow: false }),
    // Rim and the tea inside.
    piece(ellipse(cx, baseY - 240 * s, 170 * s, 32 * s), '#ece6d8'),
    piece(ellipse(cx, baseY - 236 * s, 152 * s, 24 * s), C.toffee, { edge: 'cut', fibre: false, shadow: false }),
    // A band of blue flowers.
    ...[-120, -60, 0, 60, 120].map((dx) => piece(circle(cx + dx * s, baseY - 150 * s + Math.abs(dx) * 0.2 * s, 16 * s), C.blue, { edge: 'cut', fibre: false })),
    ...[-120, -60, 0, 60, 120].map((dx) => piece(circle(cx + dx * s, baseY - 150 * s + Math.abs(dx) * 0.2 * s, 6 * s), C.goldLight, { edge: 'clean', shadow: false })),
    piece(rect(cx - 170 * s, baseY - 214 * s, 340 * s, 8 * s), C.blue, { ...flat, opacity: 0.8 }),
  ];
}

export function farNodes(): Node[] {
  const base = farBase('#9a8a62', 601);
  return [
    ...base.back,
    // The giant's table and a teacup on it, tiny trees underneath.
    piece(rect(150, 70, 300, 14, 3), C.wood),
    piece(rect(165, 84, 14, 60), C.brownDark, { edge: 'cut' }),
    piece(rect(420, 84, 14, 60), C.brownDark, { edge: 'cut' }),
    piece(poly([[150, 80], [450, 80], [450, 110], [420, 100], [380, 112], [330, 100], [280, 114], [230, 100], [180, 112], [150, 100]]), C.giantCloth, { edge: 'cut' }),
    ...teacup(250, 70, 0.12),
    piece(rect(330, 46, 26, 26, 3), C.goldLight, { edge: 'cut' }),
    ...boot(80, 150, 96, C.brown),
    ...boot(520, 150, 96, C.brown, -1),
    ...roundTree(230, 146, 26, 1),
    ...roundTree(330, 146, 22, 2),
    ...giantButton(380, 140, 22, C.teal),
    ...base.front,
  ];
}

export const landFar = (name: string): string => farSvg(name, farNodes(), 'The Land of Giants');

export function landScene(name: string): string {
  const r = rng(61);
  const tiny: Node[] = [];
  for (let i = 0; i < 9; i++) tiny.push(...roundTree(480 + i * 70 + r() * 20, 560 + r() * 10, 40 + r() * 20, 600 + i));
  const grass: Node[] = [];
  for (let i = 0; i < 30; i++) {
    const x = r() * 1180;
    const y = 620 + r() * 200;
    grass.push(ink([[x, y], [x + 3, y - 14 - r() * 10]], { width: 2.5, color: C.leafDark, opacity: 0.7 }));
  }
  return sceneSvg(name, [
    ...sky([
      [C.giantSky, 0],
      ['#cfdfe6', 300],
      ['#e2e8dc', 480],
    ]),
    cloud(700, 120, 300, 1, C.white, 0.9),
    cloud(1020, 220, 200, 2, C.white, 0.8),
    // The far hills with a pair of giant boots standing on them (their owner is somewhere above).
    hills(500, 40, '#a9bf9a', 62),
    // His trouser legs go up and up, out of the sky.
    piece(poly([[770, 300], [850, 300], [870, -20], [760, -20]]), '#6d7d94', { rough: 1 }),
    piece(poly([[960, 304], [1040, 304], [1056, -20], [946, -20]]), '#6d7d94', { rough: 1 }),
    ink([[812, 290], [814, -10]], { width: 3, color: '#566479', opacity: 0.6 }),
    ink([[1000, 294], [1000, -10]], { width: 3, color: '#566479', opacity: 0.6 }),
    ...boot(820, 520, 230, C.brown),
    ...boot(1010, 524, 230, C.brown, -1),
    cloud(900, 150, 340, 9, C.white, 0.95),
    hills(560, 26, '#8faa7a', 63),
    ...tiny,
    // The ground.
    hills(600, 18, C.green, 64, { step: 80 }),
    ...grass,
    // The giant's table leg and the tabletop overhead, with its cloth hanging down.
    piece(rect(40, 60, 120, 700, 10), C.wood, { rough: 1 }),
    ink([[80, 80], [84, 740]], { width: 4, color: C.brownDark, opacity: 0.4 }),
    ink([[120, 100], [118, 700]], { width: 3, color: C.brownDark, opacity: 0.3 }),
    piece(rect(10, 720, 180, 60, 10), C.brown),
    piece(rect(-20, -20, 640, 90), C.brownDark),
    piece(curve([[-20, 60], [640, 60], [640, 160], [600, 140], [560, 210], [500, 170], [430, 240], [360, 180], [300, 250], [230, 190], [160, 260], [90, 200], [-20, 260]], 1), C.giantCloth, { rough: 1.2 }),
    ...[60, 200, 340, 480].map((x) => piece(rect(x, 70, 40, 140), C.cream, { edge: 'cut', fibre: false, shadow: false, opacity: 0.35 })),
    piece(rect(-20, 70, 660, 30), C.cream, { edge: 'cut', fibre: false, shadow: false, opacity: 0.35 }),
    // A crumb as big as a boulder that has fallen off the table.
    piece(curve([[280, 700], [300, 640], [370, 630], [400, 690], [360, 712]], 2), C.goldLight),
    piece(circle(330, 670, 6), C.tan, flat),
    piece(circle(360, 660, 5), C.tan, flat),
    // The teacup (big enough to hide in) and giant buttons.
    ...teacup(740, 760, 1),
    ...giantButton(320, 790, 150, C.teal),
    ...giantButton(1080, 650, 100, C.red),
    ...giantButton(1110, 790, 80, C.gold),
  ]);
}
