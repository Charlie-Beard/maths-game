/**
 * Land 8: the Land of Toys. A toy town on a nursery floor: houses built
 * from wooden blocks, a toy fort, a wind-up train on its track, stacks of
 * building blocks, a spinning top and a jack-in-the-box. Bright primaries,
 * softened to paper.
 */
import { C } from '../palette';
import { circle, ellipse, ink, piece, poly, rect, rng, type Node } from '../paper';
import { cloud, farBase, farSvg, flat, sceneSvg, sky, star } from './common';

/** A wooden building block with a shape painted on its face. */
function block(x: number, y: number, s: number, color: string, mark: 'star' | 'circle' | 'triangle' | 'square' = 'circle'): Node[] {
  const out: Node[] = [
    piece(poly([[x, y], [x + s, y], [x + s * 1.18, y - s * 0.18], [x + s * 0.18, y - s * 0.18]]), C.sand, { edge: 'cut' }),
    piece(poly([[x + s, y], [x + s * 1.18, y - s * 0.18], [x + s * 1.18, y + s * 0.82], [x + s, y + s]]), C.tan, { edge: 'cut' }),
    piece(rect(x, y, s, s, 3), color, { edge: 'cut' }),
  ];
  const cx = x + s / 2;
  const cy = y + s / 2;
  const m = s * 0.28;
  if (mark === 'star') out.push(piece(star(cx, cy, m * 1.2), C.cream, flat));
  if (mark === 'circle') out.push(piece(circle(cx, cy, m), C.cream, flat));
  if (mark === 'triangle') out.push(piece(poly([[cx, cy - m], [cx + m, cy + m * 0.8], [cx - m, cy + m * 0.8]]), C.cream, flat));
  if (mark === 'square') out.push(piece(rect(cx - m, cy - m, m * 2, m * 2), C.cream, flat));
  return out;
}

/** A toy-block house: a cube with a triangular roof block. */
function blockHouse(x: number, baseY: number, s: number, wall: string, roof: string): Node[] {
  return [
    piece(rect(x, baseY - s, s, s, 3), wall, { rough: 0.6 }),
    piece(poly([[x - s * 0.08, baseY - s], [x + s / 2, baseY - s * 1.6], [x + s * 1.08, baseY - s]]), roof, { rough: 0.6 }),
    piece(rect(x + s * 0.38, baseY - s * 0.5, s * 0.24, s * 0.5, s * 0.12), C.cream, { edge: 'cut' }),
    piece(rect(x + s * 0.12, baseY - s * 0.82, s * 0.2, s * 0.2, 2), C.cream, { edge: 'cut', fibre: false }),
    piece(rect(x + s * 0.68, baseY - s * 0.82, s * 0.2, s * 0.2, 2), C.cream, { edge: 'cut', fibre: false }),
  ];
}

/** The wind-up train: engine and carriages on a wooden track. */
function train(x: number, baseY: number, s: number): Node[] {
  const out: Node[] = [];
  const wheel = (wx: number, r: number) => [piece(circle(wx, baseY - r, r), C.ink, { edge: 'cut' }), piece(circle(wx, baseY - r, r * 0.4), C.toyYellow, { edge: 'clean', shadow: false })];
  // Engine.
  out.push(piece(rect(x, baseY - 120 * s, 70 * s, 90 * s, 4), C.toyRed, { rough: 0.6 }));
  out.push(piece(rect(x + 8 * s, baseY - 108 * s, 54 * s, 36 * s, 4), C.cream, { edge: 'cut', fibre: false }));
  out.push(piece(rect(x - 8 * s, baseY - 130 * s, 86 * s, 14 * s, 3), C.ink, { edge: 'cut' }));
  out.push(piece(rect(x + 70 * s, baseY - 80 * s, 110 * s, 50 * s, 20 * s), C.toyGreen, { rough: 0.6 }));
  out.push(piece(rect(x + 140 * s, baseY - 120 * s, 22 * s, 42 * s, 3), C.ink, { edge: 'cut' }));
  out.push(piece(rect(x + 134 * s, baseY - 128 * s, 34 * s, 12 * s, 3), C.toyRed, { edge: 'cut' }));
  out.push(piece(poly([[x + 180 * s, baseY - 30 * s], [x + 210 * s, baseY - 10 * s], [x + 180 * s, baseY - 10 * s]]), C.toyYellow, { edge: 'cut' }));
  // Puffs of steam, still as cotton wool.
  out.push(piece(circle(x + 156 * s, baseY - 150 * s, 16 * s), C.white, { edge: 'torn' }));
  out.push(piece(circle(x + 180 * s, baseY - 176 * s, 22 * s), C.white, { edge: 'torn' }));
  out.push(piece(circle(x + 214 * s, baseY - 200 * s, 26 * s), C.white, { edge: 'torn' }));
  out.push(...wheel(x + 24 * s, 22 * s), ...wheel(x + 100 * s, 18 * s), ...wheel(x + 150 * s, 18 * s));
  // The key on its side for winding.
  out.push(piece(rect(x - 30 * s, baseY - 80 * s, 30 * s, 8 * s), C.gold, { edge: 'cut' }));
  out.push(piece(ellipse(x - 40 * s, baseY - 76 * s, 12 * s, 20 * s), C.gold, { edge: 'cut' }));
  // Carriages trailing behind (to the left).
  for (let i = 0; i < 2; i++) {
    const cx = x - 60 * s - (i + 1) * 150 * s;
    out.push(piece(rect(cx, baseY - 90 * s, 130 * s, 60 * s, 4), i ? C.toyYellow : C.toyBlue, { rough: 0.6 }));
    out.push(piece(rect(cx - 6 * s, baseY - 100 * s, 142 * s, 12 * s, 3), C.ink, { edge: 'cut' }));
    out.push(piece(rect(cx + 14 * s, baseY - 80 * s, 36 * s, 26 * s, 3), C.cream, { edge: 'cut', fibre: false }));
    out.push(piece(rect(cx + 76 * s, baseY - 80 * s, 36 * s, 26 * s, 3), C.cream, { edge: 'cut', fibre: false }));
    out.push(...wheel(cx + 30 * s, 16 * s), ...wheel(cx + 100 * s, 16 * s));
    out.push(piece(rect(cx + 130 * s, baseY - 50 * s, 30 * s, 6 * s), C.ink, { edge: 'cut', fibre: false }));
  }
  return out;
}

/** A spinning top. */
function spinningTop(x: number, baseY: number, s: number): Node[] {
  return [
    piece(poly([[x, baseY], [x - 60 * s, baseY - 60 * s], [x + 60 * s, baseY - 60 * s]]), C.toyBlue, { rough: 0.6 }),
    piece(ellipse(x, baseY - 64 * s, 62 * s, 24 * s), C.toyRed),
    piece(ellipse(x, baseY - 68 * s, 40 * s, 14 * s), C.toyYellow, { edge: 'cut', fibre: false }),
    piece(rect(x - 5 * s, baseY - 110 * s, 10 * s, 44 * s, 3), C.wood, { edge: 'cut' }),
  ];
}

/** A jack-in-the-box, sprung. */
function jackInTheBox(x: number, baseY: number, s: number): Node[] {
  return [
    piece(rect(x - 50 * s, baseY - 90 * s, 100 * s, 90 * s, 4), C.toyBlue),
    piece(star(x, baseY - 46 * s, 22 * s), C.toyYellow, flat),
    piece(poly([[x - 50 * s, baseY - 90 * s], [x - 110 * s, baseY - 120 * s], [x - 104 * s, baseY - 134 * s], [x - 50 * s, baseY - 100 * s]]), C.toyRed, { edge: 'cut' }),
    ink([[x, baseY - 90 * s], [x - 12 * s, baseY - 110 * s], [x + 12 * s, baseY - 126 * s], [x - 12 * s, baseY - 142 * s], [x + 6 * s, baseY - 158 * s]], { width: 5 * s, color: C.stone }),
    piece(circle(x + 6 * s, baseY - 180 * s, 26 * s), C.skin),
    piece(poly([[x - 20 * s, baseY - 196 * s], [x + 6 * s, baseY - 250 * s], [x + 32 * s, baseY - 196 * s]]), C.toyRed, { edge: 'cut' }),
    piece(circle(x + 6 * s, baseY - 252 * s, 7 * s), C.toyYellow, { edge: 'cut' }),
    piece(circle(x + 6 * s, baseY - 176 * s, 6 * s), C.toyRed, { edge: 'cut', fibre: false }),
    piece(circle(x - 4 * s, baseY - 186 * s, 3 * s), C.ink, { edge: 'clean', shadow: false }),
    piece(circle(x + 16 * s, baseY - 186 * s, 3 * s), C.ink, { edge: 'clean', shadow: false }),
    ink([[x - 6 * s, baseY - 166 * s], [x + 6 * s, baseY - 160 * s], [x + 18 * s, baseY - 166 * s]], { width: 2.5 * s, color: C.ink }),
  ];
}

export function farNodes(): Node[] {
  const base = farBase('#d9b98a', 801);
  return [
    ...base.back,
    ...blockHouse(90, 140, 40, C.toyRed, C.toyBlue),
    ...blockHouse(150, 136, 50, C.toyYellow, C.toyRed),
    // A little toy fort with flags.
    piece(rect(250, 74, 110, 66), C.toyBlue),
    ...[0, 1, 2, 3, 4].map((i) => piece(rect(250 + i * 24, 64, 14, 14), C.toyBlue, { edge: 'cut' })),
    piece(rect(290, 104, 30, 36, 15), C.ink, { edge: 'cut' }),
    piece(rect(302, 36, 3, 30), C.ink, { edge: 'clean', shadow: false }),
    piece(poly([[305, 36], [328, 44], [305, 52]]), C.toyRed, { edge: 'cut' }),
    ...blockHouse(390, 138, 44, C.toyGreen, C.toyYellow),
    ...block(460, 112, 26, C.toyRed, 'star'),
    ...block(490, 120, 22, C.toyBlue, 'triangle'),
    ...block(468, 86, 22, C.toyYellow, 'circle'),
    ...train(250, 146, 0.2),
    ...base.front,
  ];
}

export const landFar = (name: string): string => farSvg(name, farNodes(), 'The Land of Toys');

export function landScene(name: string): string {
  const r = rng(81);
  const boards: Node[] = [];
  for (let y = 620; y < 840; y += 46) boards.push(ink([[-10, y], [1190, y + 2]], { width: 2.5, color: C.brownDark, opacity: 0.3 }));
  for (let i = 0; i < 14; i++) {
    const y = 620 + Math.floor(r() * 5) * 46;
    const x = r() * 1180;
    boards.push(ink([[x, y], [x, y + 44]], { width: 2, color: C.brownDark, opacity: 0.25 }));
  }
  // The wooden track: sleepers and two rails.
  const track: Node[] = [];
  for (let x = -20; x < 1200; x += 40) track.push(piece(rect(x, 724, 26, 30, 2), C.wood, { edge: 'cut', shadow: false }));
  track.push(piece(rect(-20, 728, 1220, 6), C.greyDark, { edge: 'cut', fibre: false }));
  track.push(piece(rect(-20, 746, 1220, 6), C.greyDark, { edge: 'cut', fibre: false }));
  // Wallpaper stripes behind the town (it's all on a nursery floor).
  const paper: Node[] = [];
  for (let x = 0; x < 1180; x += 90) paper.push(piece(rect(x, -20, 40, 640), '#d6e4ee', { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 }));
  return sceneSvg(name, [
    ...sky([
      ['#bcd6ea', 0],
      ['#cfe2ef', 400],
    ]),
    ...paper,
    cloud(240, 110, 240, 1, C.white),
    cloud(900, 150, 280, 2, C.white),
    // A painted rainbow on the wall.
    ...['#e3a9a2', '#efc495', '#f1dd96', '#b3d3a2', '#a7c3e0'].map((c, i) =>
      piece(ellipse(600, 480, 420 - i * 30, 300 - i * 30), c, { edge: 'cut', fibre: false, shadow: false }),
    ),
    piece(ellipse(600, 480, 270, 150), '#cfe2ef', { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(-20, 480, 1220, 160), '#cfe2ef', { edge: 'clean', shadow: false }),
    // The skirting board and the floor.
    piece(rect(-20, 560, 1220, 70), C.cream, { rough: 0.8 }),
    piece(rect(-20, 610, 1220, 230), C.tan, { rough: 1 }),
    ...boards,
    // The toy town.
    ...blockHouse(60, 620, 130, C.toyRed, C.toyBlue),
    ...blockHouse(220, 620, 100, C.toyYellow, C.toyRed),
    // The fort.
    piece(rect(360, 400, 260, 220), C.toyBlue, { rough: 0.6 }),
    ...[0, 1, 2, 3, 4, 5].map((i) => piece(rect(360 + i * 46, 370, 30, 34), C.toyBlue, { edge: 'cut' })),
    piece(rect(450, 520, 80, 100, 40), C.ink, { edge: 'cut' }),
    piece(rect(400, 440, 40, 50, 20), C.ink, { edge: 'cut' }),
    piece(rect(540, 440, 40, 50, 20), C.ink, { edge: 'cut' }),
    piece(rect(488, 290, 5, 82), C.ink, { edge: 'clean', shadow: false }),
    piece(poly([[493, 290], [552, 306], [493, 322]]), C.toyRed, { edge: 'cut' }),
    ...blockHouse(660, 620, 110, C.toyGreen, C.toyYellow),
    ...blockHouse(800, 620, 90, C.toyRed, C.toyGreen),
    // Stacks of blocks.
    ...block(940, 540, 70, C.toyRed, 'star'),
    ...block(1020, 540, 70, C.toyBlue, 'circle'),
    ...block(980, 470, 70, C.toyYellow, 'triangle'),
    ...block(1100, 560, 60, C.toyGreen, 'square'),
    // The train on its track.
    ...track,
    ...train(760, 760, 1),
    // Toys on the floor in front.
    ...spinningTop(140, 820, 1),
    ...jackInTheBox(1040, 820, 0.9),
    ...block(300, 770, 50, C.toyYellow, 'star'),
    ...block(360, 784, 40, C.toyRed, 'triangle'),
    piece(circle(640, 800, 26), C.toyRed),
    piece(ellipse(632, 792, 8, 5), C.white, { ...flat, opacity: 0.6 }),
  ]);
}
