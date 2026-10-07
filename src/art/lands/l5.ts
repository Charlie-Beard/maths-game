/**
 * Land 5: the Land of Birthdays. Warm gold light, bunting strung between
 * poles, balloons, a heap of presents, a long party table and a giant
 * three-tier cake with candles in tens.
 */
import { C } from '../palette';
import { circle, curve, ellipse, ink, piece, poly, rect, rng, type Node } from '../paper';
import { balloon, bunting, cloud, farBase, farSvg, flat, hills, sceneSvg, sky } from './common';

const FLAGS = [C.red, C.gold, C.blue, C.green, C.pink, C.purple];

/** A wrapped present with a ribbon and bow. */
function present(x: number, baseY: number, w: number, h: number, box: string, ribbon: string): Node[] {
  return [
    piece(rect(x - w / 2, baseY - h, w, h, 3), box, { rough: 0.6 }),
    piece(rect(x - w * 0.08, baseY - h, w * 0.16, h), ribbon, { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(x - w / 2, baseY - h * 0.6, w, h * 0.14), ribbon, { edge: 'cut', fibre: false, shadow: false }),
    piece(ellipse(x - w * 0.14, baseY - h - w * 0.06, w * 0.16, w * 0.09, -20), ribbon, { edge: 'cut' }),
    piece(ellipse(x + w * 0.14, baseY - h - w * 0.06, w * 0.16, w * 0.09, 20), ribbon, { edge: 'cut' }),
    piece(circle(x, baseY - h - w * 0.04, w * 0.06), ribbon, { edge: 'cut' }),
  ];
}

/** A candle with its flame. */
function candle(x: number, baseY: number, h: number, color: string): Node[] {
  return [
    piece(rect(x - h * 0.1, baseY - h, h * 0.2, h, 2), color, { edge: 'cut' }),
    piece(ellipse(x, baseY - h - h * 0.22, h * 0.1, h * 0.2), C.candle, { edge: 'cut', fibre: false }),
    piece(ellipse(x, baseY - h - h * 0.16, h * 0.05, h * 0.1), C.white, { edge: 'clean', shadow: false }),
  ];
}

/** The giant cake: three tiers of sponge and icing, drips, cherries and candles. */
function cake(cx: number, baseY: number, s: number): Node[] {
  const out: Node[] = [piece(ellipse(cx, baseY, 260 * s, 30 * s), C.white)];
  const tiers: [number, number][] = [
    [460, 140],
    [340, 120],
    [220, 100],
  ];
  let y = baseY - 6 * s;
  tiers.forEach(([w, h], i) => {
    const W = w * s;
    const H = h * s;
    out.push(piece(rect(cx - W / 2, y - H, W, H, 10 * s), C.cakeSponge, { rough: 0.7 }));
    out.push(piece(rect(cx - W / 2, y - H * 0.55, W, H * 0.1), C.pink, { edge: 'cut', fibre: false, shadow: false }));
    // Icing with drips.
    const drips: [number, number][] = [[cx - W / 2, y - H]];
    for (let k = 0; k <= 8; k++) {
      const dx = cx - W / 2 + (k / 8) * W;
      drips.push([dx, y - H + (k % 2 ? 26 : 12) * s]);
    }
    drips.push([cx + W / 2, y - H]);
    drips.push([cx + W / 2, y - H - 10 * s]);
    drips.push([cx - W / 2, y - H - 10 * s]);
    out.push(piece(curve(drips, 1), C.icing, { rough: 0.6 }));
    // Cherries round the top edge.
    for (let k = 0; k < 5 + i; k++) out.push(piece(circle(cx - W / 2 + 20 * s + (k / (4 + i)) * (W - 40 * s), y - H - 8 * s, 9 * s), C.red, { edge: 'cut' }));
    y -= H + 4 * s;
  });
  // Ten candles in a row on top (candles in tens).
  for (let k = 0; k < 10; k++) out.push(...candle(cx - 90 * s + k * 20 * s, y + 6 * s, 50 * s, k % 2 ? C.blue : C.white));
  return out;
}

export function farNodes(): Node[] {
  const base = farBase('#e8c987', 501);
  return [
    ...base.back,
    ...bunting([60, 70], [300, 50], 18, FLAGS, 10),
    ...bunting([300, 50], [540, 74], 18, FLAGS, 10),
    ...cake(300, 142, 0.24),
    ...present(150, 146, 40, 34, C.green, C.gold),
    ...present(196, 146, 30, 26, C.purple, C.pink),
    ...present(430, 146, 36, 30, C.red, C.white),
    ...balloon(100, 70, 16, C.red, 40),
    ...balloon(500, 60, 18, C.blue, 44),
    ...balloon(530, 84, 14, C.gold, 34),
    ...base.front,
  ];
}

export const landFar = (name: string): string => farSvg(name, farNodes(), 'The Land of Birthdays');

export function landScene(name: string): string {
  const r = rng(51);
  const confetti: Node[] = [];
  for (let i = 0; i < 60; i++) {
    const x = r() * 1180;
    const y = r() * 560;
    confetti.push(piece(rect(x, y, 8, 5, 1), FLAGS[i % FLAGS.length], { ...flat, opacity: 0.7 }));
  }
  const tableTop = 640;
  return sceneSvg(name, [
    ...sky([
      ['#f3d79a', 0],
      ['#f6e3b6', 280],
      ['#f8ead0', 460],
    ]),
    cloud(180, 150, 220, 1, C.white, 0.8),
    cloud(1000, 110, 260, 2, C.white, 0.8),
    ...confetti,
    hills(520, 40, '#e9c98a', 52),
    hills(570, 30, '#c9b06a', 53),
    // Bunting poles and the flags strung right across.
    piece(rect(40, 120, 16, 520, 4), C.wood, { edge: 'cut' }),
    piece(rect(1124, 120, 16, 520, 4), C.wood, { edge: 'cut' }),
    piece(circle(48, 116, 14), C.gold, { edge: 'cut' }),
    piece(circle(1132, 116, 14), C.gold, { edge: 'cut' }),
    ...bunting([48, 130], [590, 120], 80, FLAGS, 34),
    ...bunting([590, 120], [1132, 130], 80, FLAGS, 34),
    ...bunting([48, 220], [1132, 230], 120, [...FLAGS].reverse(), 28),
    // The lawn.
    hills(600, 20, '#9cbf6a', 54, { step: 80 }),
    // The long party table with its cloth.
    piece(rect(110, tableTop + 40, 18, 130), C.brownDark, { edge: 'cut' }),
    piece(rect(1050, tableTop + 40, 18, 130), C.brownDark, { edge: 'cut' }),
    piece(rect(80, tableTop, 1020, 60, 4), C.white),
    ...Array.from({ length: 12 }, (_, i) => piece(rect(80 + i * 85, tableTop, 42, 60), C.pink, { edge: 'cut', fibre: false, shadow: false, opacity: 0.7 })),
    piece(curve([[80, tableTop + 60], [140, tableTop + 72], [200, tableTop + 60], [260, tableTop + 72], [320, tableTop + 60], [380, tableTop + 72], [440, tableTop + 60], [440, tableTop + 50], [80, tableTop + 50]], 1), C.white, { edge: 'cut', fibre: false }),
    // The cake in the middle of the table.
    ...cake(590, tableTop + 4, 1),
    // Party food along the table.
    ...[200, 320, 860, 980].flatMap((x, i) => [
      piece(ellipse(x, tableTop + 4, 46, 10), C.white, { edge: 'cut' }),
      ...[0, 1, 2].map((k) => piece(circle(x - 20 + k * 20, tableTop - 6, 10), i % 2 ? C.pink : C.goldLight, { edge: 'cut' })),
    ]),
    // A jug of lemonade and party hats.
    piece(poly([[760, tableTop], [790, tableTop], [796, tableTop - 60], [754, tableTop - 60]]), C.lemonade, { edge: 'cut' }),
    piece(poly([[400, tableTop + 2], [432, tableTop + 2], [416, tableTop - 44]]), C.blue, { edge: 'cut' }),
    piece(circle(416, tableTop - 46, 5), C.gold, { edge: 'cut' }),
    piece(poly([[1000, tableTop + 2], [1034, tableTop + 2], [1017, tableTop - 46]]), C.red, { edge: 'cut' }),
    // Balloons tied at the table ends.
    ...balloon(140, 360, 44, C.red, 240),
    ...balloon(220, 410, 36, C.gold, 190),
    ...balloon(980, 370, 44, C.blue, 230),
    ...balloon(1060, 330, 38, C.green, 270),
    ...balloon(900, 420, 32, C.pink, 180),
    // Presents heaped on the grass.
    ...present(160, 800, 120, 90, C.green, C.gold),
    ...present(260, 810, 80, 60, C.purple, C.pink),
    ...present(220, 740, 70, 50, C.red, C.white),
    ...present(940, 806, 110, 80, C.blue, C.gold),
    ...present(1050, 810, 90, 100, C.gold, C.red),
    ink([[60, 800], [1120, 806]], { width: 2, color: C.greenDark, opacity: 0.2 }),
  ]);
}
