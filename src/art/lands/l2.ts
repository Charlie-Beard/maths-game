/**
 * Land 2: the Land of Topsy-Turvy. Lurid green and pink, and everything
 * the wrong way up: houses balance on their roofs, trees grow with their
 * roots in the air, grass hangs from the sky and the clouds sit on the
 * ground. The sun is a green spiral.
 */
import { C } from '../palette';
import { band, circle, curve, ellipse, group, ink, piece, poly, rect, rng, type Node, type Pt } from '../paper';
import { cloud, farBase, farSvg, flat, hills, house, sceneSvg, sky } from './common';

/** A tree growing the wrong way: leafy crown on the ground, roots waving in the air. */
function rootsUpTree(x: number, baseY: number, h: number, seed: number, leaves: string[], trunk: string = C.bark): Node[] {
  const r = rng(seed);
  const crown = h * 0.32;
  const top = baseY - h;
  const roots: Node[] = [];
  for (let i = 0; i < 5; i++) {
    const a = ((-160 + i * 35 + (r() - 0.5) * 10) * Math.PI) / 180;
    const len = h * (0.22 + r() * 0.12);
    const mid: Pt = [x + Math.cos(a) * len * 0.5, top + Math.sin(a) * len * 0.3 - len * 0.2];
    roots.push(piece(band([[x, top + h * 0.06], mid, [x + Math.cos(a) * len, top + Math.sin(a) * len]], Math.max(3, h * 0.03)), trunk, { edge: 'cut' }));
  }
  return [
    ...roots,
    piece(band([[x, baseY - crown], [x + (r() - 0.5) * 10, top + h * 0.04]], Math.max(6, h * 0.09)), trunk, { rough: 0.8 }),
    ...leaves.map((c, i) => piece(circle(x + (r() - 0.5) * crown * 0.9, baseY - crown * 0.7 - i * 3, crown * (0.7 + r() * 0.2)), c, { shadow: i === 0 })),
  ];
}

/** The green spiral sun. */
function spiralSun(cx: number, cy: number, r: number): Node[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= 60; i++) {
    const a = (i / 60) * Math.PI * 5;
    const rr = (i / 60) * r;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return [piece(circle(cx, cy, r + 10), C.topsyGreen, { rough: 0.8 }), ink(pts, { width: 6, color: C.topsyPink })];
}

export function farNodes(): Node[] {
  const base = farBase(C.topsyGreen, 201);
  return [
    ...base.back,
    ...rootsUpTree(90, 144, 92, 1, [C.topsyPink, C.rose]),
    house(170, 138, 54, 40, { wall: C.topsyPink, roof: C.topsyGreen, flip: true, window: C.lemonade }),
    ...rootsUpTree(250, 136, 110, 2, [C.leafDark, C.topsyGreen]),
    house(330, 134, 70, 52, { wall: C.cream, roof: C.topsyPink, flip: true, window: C.lemonade }),
    house(420, 138, 50, 38, { wall: C.topsyGreen, roof: C.purple, flip: true, window: C.lemonade }),
    ...rootsUpTree(500, 142, 96, 3, [C.topsyPink, C.purple]),
    // A little cloud sitting on the ground.
    piece(ellipse(380, 140, 22, 10), C.white, { edge: 'cut' }),
    ...base.front,
  ];
}

export const landFar = (name: string): string => farSvg(name, farNodes(), 'The Land of Topsy-Turvy');

export function landScene(name: string): string {
  const r = rng(21);
  // Grass hanging down from the sky, with flowers dangling the wrong way.
  const ceiling: Pt[] = [[-30, -30], [1210, -30]];
  for (let x = 1210; x >= -30; x -= 40) ceiling.push([x, 60 + r() * 40 + Math.sin(x / 120) * 16]);
  const danglers: Node[] = [];
  for (let i = 0; i < 9; i++) {
    const x = 60 + i * 132 + r() * 30;
    const y = 90 + r() * 30;
    const len = 30 + r() * 40;
    danglers.push(ink([[x, y - 20], [x + 4, y + len]], { width: 3, color: C.leafDark }));
    danglers.push(piece(circle(x + 4, y + len + 10, 12), i % 2 ? C.topsyPink : C.lemonade, { edge: 'cut' }));
    danglers.push(piece(circle(x + 4, y + len + 10, 5), C.purple, flat));
  }
  // Teacups stuck to the sky, upside down.
  const cups: Node[] = [];
  for (const [x, y] of [[300, 150], [880, 170]] as const) {
    cups.push(piece(poly([[x - 24, y - 26], [x + 24, y - 26], [x + 16, y + 10], [x - 16, y + 10]]), C.white, { edge: 'cut' }));
    cups.push(piece(ellipse(x, y + 12, 30, 7), C.white, { edge: 'cut' }));
    cups.push(piece(circle(x + 28, y - 8, 9), C.white, { edge: 'cut' }));
    cups.push(piece(rect(x - 24, y - 16, 48, 6), C.topsyPink, { ...flat }));
  }
  // A path of tiles that wobbles up instead of along.
  const tiles: Node[] = [];
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const x = 520 + Math.sin(t * Math.PI * 1.5) * 60;
    const y = 800 - t * 190;
    const s = 70 - t * 40;
    tiles.push(piece(rect(x - s / 2, y - s * 0.3, s, s * 0.6, 4), i % 2 ? C.topsyPink : C.cream, { edge: 'cut' }));
  }

  return sceneSvg(name, [
    ...sky([
      [C.topsySky, 0],
      ['#f7e3ec', 300],
      ['#e8f2c8', 500],
    ]),
    // Pink and green swirls in the sky.
    ...[[200, 300, 50], [1000, 330, 40], [700, 250, 30]].map(([x, y, s]) =>
      ink(Array.from({ length: 30 }, (_, i) => [x + Math.cos(i / 4) * (i / 30) * s, y + Math.sin(i / 4) * (i / 30) * s] as Pt), { width: 4, color: C.topsyPink, opacity: 0.5 }),
    ),
    ...spiralSun(1020, 200, 60),
    piece(curve(ceiling, 1), C.topsyGreen, { rough: 1.4 }),
    piece(curve(ceiling.map(([x, y]) => [x, y - 24] as Pt), 1), C.leafDark, { ...flat, edge: 'torn', opacity: 0.4 }),
    ...danglers,
    ...cups,
    // Far hills, pink and green.
    hills(540, 40, '#d9a5c8', 22),
    hills(590, 30, '#b6d47a', 23),
    // Houses standing on their roofs, chimneys pointing at the grass.
    house(160, 600, 150, 120, { wall: C.topsyPink, roof: C.topsyGreen, flip: true, window: C.lemonade, chimney: true }),
    house(400, 590, 110, 90, { wall: C.lemonade, roof: C.purple, flip: true, window: C.topsyPink }),
    house(800, 600, 170, 130, { wall: C.cream, roof: C.topsyPink, flip: true, window: C.topsyGreen, chimney: true }),
    house(1060, 590, 120, 96, { wall: C.topsyGreen, roof: C.plum, flip: true, window: C.lemonade }),
    // Trees with their roots in the air.
    ...rootsUpTree(290, 640, 300, 4, [C.topsyPink, C.rose, C.candyPink]),
    ...rootsUpTree(630, 640, 360, 5, [C.leafDark, C.topsyGreen, C.leafLight]),
    ...rootsUpTree(960, 650, 280, 6, [C.purple, C.topsyPink]),
    // The ground, with clouds sitting on it.
    hills(650, 24, C.topsyGreen, 24, { step: 80 }),
    group({}, [cloud(120, 690, 200, 7, C.white), cloud(1080, 700, 220, 8, C.white)]),
    ...tiles,
    // Flowers growing out of the grass upside down: heads down, stalks up.
    ...[[80, 780], [240, 800], [880, 790], [1000, 770], [1130, 800], [380, 770]].flatMap(([x, y], i) => [
      piece(circle(x, y, 14), i % 2 ? C.lemonade : C.topsyPink, { edge: 'cut' }),
      piece(circle(x, y, 6), C.purple, flat),
      ink([[x, y - 12], [x - 2, y - 50]], { width: 3, color: C.leafDark }),
      piece(ellipse(x - 10, y - 50, 9, 5, 20), C.leafDark, { edge: 'cut', fibre: false }),
    ]),
  ]);
}
