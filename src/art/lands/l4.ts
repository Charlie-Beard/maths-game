/**
 * Land 4: Dame Snap's School. Properly ominous: a tall grey building under
 * a bruised sky, rows of narrow windows (one lit, with her shape in it),
 * a clock that has stopped at sums o'clock, spiked iron gates, rows of
 * little desks in the yard facing a blackboard of sums, and crows on the
 * railings. Ink-black, chalk-white and ruler-red.
 */
import { C } from '../palette';
import { band, circle, ellipse, ink, piece, poly, rect, rng, type Node, type Pt } from '../paper';
import { cloud, farBase, farSvg, flat, hills, sceneSvg, sky } from './common';

const STORM = '#4a4a58';
const STORM_LOW = '#6c6a74';
const YARD = '#8b877f';

/** The school: a tall grey block with a steep roof, a bell tower and narrow windows. */
function school(cx: number, baseY: number, s: number, o: { snap?: boolean } = {}): Node[] {
  const w = 520 * s;
  const h = 300 * s;
  const left = cx - w / 2;
  const top = baseY - h;
  const out: Node[] = [
    // Bell tower behind the roof.
    piece(rect(cx - 50 * s, top - 250 * s, 100 * s, 260 * s), C.schoolDark, { rough: 0.7 }),
    piece(poly([[cx - 66 * s, top - 246 * s], [cx, top - 350 * s], [cx + 66 * s, top - 246 * s]]), C.iron, { rough: 0.7 }),
    piece(rect(cx - 30 * s, top - 220 * s, 60 * s, 50 * s, 26 * s), C.iron, { edge: 'cut' }),
    piece(poly([[cx - 16 * s, top - 186 * s], [cx + 16 * s, top - 186 * s], [cx + 12 * s, top - 210 * s], [cx - 12 * s, top - 210 * s]]), C.stone, { edge: 'cut', fibre: false }),
    // Clock face, stopped.
    piece(circle(cx, top - 120 * s, 34 * s), C.chalk, { edge: 'cut' }),
    ink([[cx, top - 120 * s], [cx, top - 144 * s]], { width: 5 * s, color: C.snapInk }),
    ink([[cx, top - 120 * s], [cx + 16 * s, top - 110 * s]], { width: 5 * s, color: C.snapInk }),
    // The main building and its roof.
    piece(rect(left, top, w, h), C.schoolGrey, { rough: 0.7 }),
    piece(poly([[left - 30 * s, top + 6], [left + 60 * s, top - 110 * s], [left + w - 60 * s, top - 110 * s], [left + w + 30 * s, top + 6]]), C.iron, { rough: 0.7 }),
    // Chimneys.
    piece(rect(left + 70 * s, top - 160 * s, 34 * s, 80 * s), C.schoolDark, { edge: 'cut' }),
    piece(rect(left + w - 104 * s, top - 160 * s, 34 * s, 80 * s), C.schoolDark, { edge: 'cut' }),
    // Stone courses.
    ...[0.33, 0.66].map((k) => ink([[left, top + h * k], [left + w, top + h * k]], { width: 3 * s, color: C.schoolDark, opacity: 0.6 })),
  ];
  // Two floors of tall, narrow, dark windows.
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 6; i++) {
      if (row === 1 && (i === 2 || i === 3)) continue;
      const wx = left + 40 * s + i * 78 * s;
      const wy = top + 30 * s + row * 120 * s;
      const lit = o.snap && row === 0 && i === 4;
      out.push(piece(rect(wx, wy, 40 * s, 80 * s, 20 * s), lit ? C.candle : C.iron, { edge: 'cut' }));
      out.push(piece(rect(wx + 18 * s, wy, 4 * s, 80 * s), C.schoolDark, { edge: 'clean', shadow: false }));
      if (lit) {
        // Her silhouette: the bun and the pinched shoulders.
        out.push(piece(circle(wx + 20 * s, wy + 34 * s, 9 * s), C.snapInk, { edge: 'cut', fibre: false }));
        out.push(piece(circle(wx + 20 * s, wy + 22 * s, 6 * s), C.snapInk, { edge: 'cut', fibre: false }));
        out.push(piece(poly([[wx + 6 * s, wy + 80 * s], [wx + 12 * s, wy + 46 * s], [wx + 28 * s, wy + 46 * s], [wx + 34 * s, wy + 80 * s]]), C.snapInk, { edge: 'cut', fibre: false }));
      }
    }
  }
  // The big front door, arched and black, with steps.
  out.push(piece(rect(cx - 50 * s, baseY - 140 * s, 100 * s, 140 * s, 50 * s), C.snapInk, { edge: 'cut' }));
  out.push(ink([[cx, baseY - 136 * s], [cx, baseY]], { width: 3 * s, color: C.ironLight }));
  out.push(piece(rect(cx - 80 * s, baseY - 8 * s, 160 * s, 14 * s, 2), C.stone, { edge: 'cut' }));
  return out;
}

/** A row of spiked iron railings from x0 to x1 standing on baseY. */
function railings(x0: number, x1: number, baseY: number, h: number, gap: number): Node[] {
  const out: Node[] = [
    piece(rect(x0, baseY - h * 0.85, x1 - x0, h * 0.05), C.iron, { edge: 'cut' }),
    piece(rect(x0, baseY - h * 0.2, x1 - x0, h * 0.05), C.iron, { edge: 'cut' }),
  ];
  for (let x = x0; x <= x1; x += gap) {
    out.push(piece(rect(x - h * 0.02, baseY - h, h * 0.04, h), C.iron, { edge: 'cut', shadow: false }));
    out.push(piece(poly([[x - h * 0.05, baseY - h], [x, baseY - h * 1.12], [x + h * 0.05, baseY - h]]), C.iron, { edge: 'cut', fibre: false }));
  }
  return out;
}

/** A crow hunched on a rail. */
function crow(x: number, y: number, s: number, flip = 1): Node[] {
  return [
    piece(ellipse(x, y, 18 * s, 12 * s, -20 * flip), C.snapInk, { edge: 'cut' }),
    piece(circle(x + 14 * s * flip, y - 10 * s, 8 * s), C.snapInk, { edge: 'cut' }),
    piece(poly([[x + 20 * s * flip, y - 12 * s], [x + 32 * s * flip, y - 8 * s], [x + 20 * s * flip, y - 6 * s]]), C.greyDark, { edge: 'cut', fibre: false }),
    piece(poly([[x - 14 * s * flip, y + 2 * s], [x - 32 * s * flip, y + 14 * s], [x - 12 * s * flip, y + 10 * s]]), C.snapInk, { edge: 'cut', fibre: false }),
    piece(circle(x + 16 * s * flip, y - 12 * s, 2 * s), C.chalk, { edge: 'clean', shadow: false }),
  ];
}

/** A little wooden school desk with a lid and an inkwell, seen from behind. */
function desk(x: number, baseY: number, s: number): Node[] {
  return [
    piece(rect(x - 34 * s, baseY - 50 * s, 6 * s, 50 * s), C.brownDark, { edge: 'cut', shadow: false }),
    piece(rect(x + 28 * s, baseY - 50 * s, 6 * s, 50 * s), C.brownDark, { edge: 'cut', shadow: false }),
    piece(poly([[x - 40 * s, baseY - 56 * s], [x + 40 * s, baseY - 56 * s], [x + 44 * s, baseY - 44 * s], [x - 44 * s, baseY - 44 * s]]), C.wood, { edge: 'cut' }),
    piece(rect(x - 38 * s, baseY - 44 * s, 76 * s, 18 * s), C.brown, { edge: 'cut' }),
    piece(circle(x + 26 * s, baseY - 58 * s, 5 * s), C.snapInk, { edge: 'cut' }),
    // The little bench.
    piece(rect(x - 30 * s, baseY - 22 * s, 60 * s, 8 * s), C.brownDark, { edge: 'cut' }),
  ];
}

/** The blackboard on its easel, covered in chalk sums and a big red tick-less cross. */
function blackboard(cx: number, baseY: number, s: number): Node[] {
  const w = 260 * s;
  const h = 170 * s;
  const left = cx - w / 2;
  const top = baseY - h - 90 * s;
  const chalk = (pts: Pt[], o: { width?: number; color?: string } = {}) => ink(pts, { width: (o.width ?? 4) * s, color: o.color ?? C.chalk, wobble: 1 });
  return [
    piece(band([[cx - 90 * s, baseY], [cx - 60 * s, top - 10 * s]], 10 * s), C.wood, { edge: 'cut' }),
    piece(band([[cx + 90 * s, baseY], [cx + 60 * s, top - 10 * s]], 10 * s), C.wood, { edge: 'cut' }),
    piece(rect(left - 10 * s, top - 10 * s, w + 20 * s, h + 20 * s, 4), C.brownDark),
    piece(rect(left, top, w, h, 2), C.blackboard, { edge: 'cut', fibre: false }),
    // Chalk sums: "3 + 4 =" and "9 − 2 =" drawn as strokes.
    chalk([[left + 30 * s, top + 34 * s], [left + 44 * s, top + 26 * s], [left + 46 * s, top + 40 * s], [left + 32 * s, top + 44 * s], [left + 48 * s, top + 52 * s], [left + 30 * s, top + 62 * s]]),
    chalk([[left + 64 * s, top + 44 * s], [left + 84 * s, top + 44 * s]]),
    chalk([[left + 74 * s, top + 34 * s], [left + 74 * s, top + 54 * s]]),
    chalk([[left + 112 * s, top + 26 * s], [left + 100 * s, top + 50 * s], [left + 120 * s, top + 50 * s]]),
    chalk([[left + 114 * s, top + 36 * s], [left + 114 * s, top + 62 * s]]),
    chalk([[left + 140 * s, top + 40 * s], [left + 162 * s, top + 40 * s]]),
    chalk([[left + 140 * s, top + 50 * s], [left + 162 * s, top + 50 * s]]),
    chalk([[left + 46 * s, top + 96 * s], [left + 34 * s, top + 90 * s], [left + 32 * s, top + 104 * s], [left + 46 * s, top + 100 * s], [left + 44 * s, top + 128 * s]]),
    chalk([[left + 64 * s, top + 110 * s], [left + 84 * s, top + 110 * s]]),
    chalk([[left + 100 * s, top + 96 * s], [left + 114 * s, top + 92 * s], [left + 116 * s, top + 104 * s], [left + 100 * s, top + 126 * s], [left + 120 * s, top + 126 * s]]),
    chalk([[left + 140 * s, top + 106 * s], [left + 162 * s, top + 106 * s]]),
    chalk([[left + 140 * s, top + 116 * s], [left + 162 * s, top + 116 * s]]),
    // Her red lines underneath: RULES.
    chalk([[left + 190 * s, top + 30 * s], [left + 236 * s, top + 30 * s]], { color: C.ruler, width: 5 }),
    chalk([[left + 190 * s, top + 60 * s], [left + 236 * s, top + 60 * s]], { color: C.ruler, width: 5 }),
    chalk([[left + 190 * s, top + 90 * s], [left + 236 * s, top + 90 * s]], { color: C.ruler, width: 5 }),
    chalk([[left + 190 * s, top + 120 * s], [left + 236 * s, top + 120 * s]], { color: C.ruler, width: 5 }),
    // Chalk ledge and a ruler lying on it.
    piece(rect(left, top + h + 6 * s, w, 8 * s), C.brownDark, { edge: 'cut' }),
    piece(rect(left + 120 * s, top + h + 1 * s, 120 * s, 7 * s, 1), C.ruler, { edge: 'cut' }),
  ];
}

export function farNodes(): Node[] {
  const base = farBase('#6e6a66', 401, { cloud: '#cfcbc6', shade: '#9a958f' });
  return [
    // A dark cloud hanging over it.
    cloud(300, 46, 200, 4, STORM, 0.8),
    ...base.back,
    ...school(300, 140, 0.24, { snap: true }),
    ...railings(60, 230, 146, 34, 12),
    ...railings(370, 540, 146, 34, 12),
    ...base.front,
  ];
}

export const landFar = (name: string): string => farSvg(name, farNodes(), 'Dame Snap’s School');

export function landScene(name: string): string {
  const r = rng(41);
  const flagstones: Node[] = [];
  for (let row = 0; row < 4; row++) {
    const y = 640 + row * 48;
    for (let x = -40 + (row % 2) * 60; x < 1200; x += 120) {
      flagstones.push(piece(rect(x + r() * 6, y, 112, 42, 4), row % 2 ? '#97938a' : '#a29e95', { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }));
    }
  }
  const desks: Node[] = [];
  for (let row = 0; row < 3; row++) {
    const s = 0.8 + row * 0.22;
    const y = 640 + row * 60;
    for (let i = 0; i < 4; i++) desks.push(...desk(330 + i * 120 * s + (1 - s) * 160 + (row === 2 ? -40 : 0), y, s));
  }
  return sceneSvg(name, [
    ...sky([
      [C.snapInk, 0],
      [STORM, 160],
      [STORM_LOW, 380],
    ]),
    cloud(200, 120, 340, 1, '#2f2d38', 0.9),
    cloud(900, 160, 400, 2, '#3a3844', 0.9),
    cloud(560, 60, 300, 3, '#2a2832', 0.9),
    hills(520, 30, '#3f3d46', 42),
    // The school looming over the yard.
    ...school(600, 560, 0.8, { snap: true }),
    // Two dead trees either side.
    piece(band([[110, 560], [130, 380], [100, 260]], 26), C.iron, { rough: 0.8 }),
    piece(band([[124, 410], [180, 340], [220, 320]], 10), C.iron, { edge: 'cut' }),
    piece(band([[116, 330], [60, 270], [40, 240]], 8), C.iron, { edge: 'cut' }),
    piece(band([[1080, 560], [1060, 380], [1100, 280]], 24), C.iron, { rough: 0.8 }),
    piece(band([[1066, 420], [1000, 350], [980, 330]], 10), C.iron, { edge: 'cut' }),
    // The yard.
    piece(rect(-20, 540, 1220, 300), YARD, { rough: 1.2 }),
    ...flagstones,
    // The iron railings and the gates, standing open (for now).
    ...railings(-20, 380, 600, 200, 34),
    ...railings(820, 1200, 600, 200, 34),
    ...[0, 1, 2, 3, 4].map((i) => piece(rect(372 - i * 22, 390 + i * 6, 6, 210 - i * 6), C.iron, { edge: 'cut', shadow: false })),
    piece(band([[380, 420], [282, 440]], 8), C.iron, { edge: 'cut' }),
    piece(band([[380, 570], [282, 576]], 8), C.iron, { edge: 'cut' }),
    ...[0, 1, 2, 3, 4].map((i) => piece(rect(822 + i * 22, 390 + i * 6, 6, 210 - i * 6), C.iron, { edge: 'cut', shadow: false })),
    piece(band([[820, 420], [918, 440]], 8), C.iron, { edge: 'cut' }),
    piece(band([[820, 570], [918, 576]], 8), C.iron, { edge: 'cut' }),
    piece(rect(368, 360, 24, 250, 3), C.ironLight),
    piece(rect(808, 360, 24, 250, 3), C.ironLight),
    piece(circle(380, 352, 16), C.ironLight, { edge: 'cut' }),
    piece(circle(820, 352, 16), C.ironLight, { edge: 'cut' }),
    // Crows keeping watch.
    ...crow(120, 384, 1.2),
    ...crow(1000, 386, 1.1, -1),
    ...crow(380, 330, 1, -1),
    // Rows of desks facing the blackboard.
    ...blackboard(990, 790, 1),
    ...desks,
    // A pile of rule books and a hand bell by the door.
    piece(rect(160, 760, 90, 20, 2), C.ruler),
    piece(rect(168, 742, 80, 18, 2), C.snapInk),
    piece(rect(156, 726, 86, 16, 2), C.schoolDark),
    piece(poly([[60, 790], [100, 790], [92, 750], [68, 750]]), C.gold, { edge: 'cut' }),
    piece(rect(76, 722, 8, 30, 2), C.brownDark, { edge: 'cut' }),
    piece(ellipse(600, 812, 600, 30), C.snapInk, { ...flat, edge: 'torn', opacity: 0.25 }),
  ]);
}
