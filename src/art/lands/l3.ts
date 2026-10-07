/**
 * Land 3: the Land of Goodies. A sugary pink-and-mint land: toffee-shock
 * trees hung with wrapped toffees, a lemonade fountain, a wobbly jelly
 * hill, lollipop flowers and a candy-striped path.
 */
import { C } from '../palette';
import { band, circle, curve, ellipse, ink, piece, poly, rect, rng, type Node, type Pt } from '../paper';
import { cloud, farBase, farSvg, flat, hills, sceneSvg, sky } from './common';

/** A wrapped toffee (twist ends). */
function toffee(x: number, y: number, s: number, color: string = C.toffee, rot = 0): Node[] {
  const c = Math.cos((rot * Math.PI) / 180);
  const sn = Math.sin((rot * Math.PI) / 180);
  const at = (dx: number, dy: number): Pt => [x + dx * c - dy * sn, y + dx * sn + dy * c];
  return [
    piece(poly([at(-s * 0.5, 0), at(-s, -s * 0.4), at(-s, s * 0.4)]), C.goldLight, { edge: 'cut', fibre: false }),
    piece(poly([at(s * 0.5, 0), at(s, -s * 0.4), at(s, s * 0.4)]), C.goldLight, { edge: 'cut', fibre: false }),
    piece(ellipse(x, y, s * 0.6, s * 0.4, rot), color, { edge: 'cut' }),
  ];
}

/** A toffee-shock tree: a twisty barley-sugar trunk and a canopy hung with toffees. */
function toffeeTree(x: number, baseY: number, h: number, seed: number): Node[] {
  const r = rng(seed);
  const crownY = baseY - h * 0.72;
  const out: Node[] = [piece(band([[x, baseY], [x + 8, baseY - h * 0.4], [x - 4, crownY]], h * 0.08), C.toffee, { rough: 0.7 })];
  for (let i = 0; i < 5; i++) {
    const yy = baseY - h * 0.08 - i * h * 0.12;
    out.push(ink([[x - h * 0.04, yy], [x + h * 0.04, yy - h * 0.05]], { width: 4, color: C.cream, opacity: 0.7 }));
  }
  const greens = [C.mint, '#7fc0a0', C.candyPink];
  for (let i = 0; i < 5; i++) out.push(piece(circle(x + (r() - 0.5) * h * 0.4, crownY + (r() - 0.5) * h * 0.18, h * (0.16 + r() * 0.08)), greens[i % 3], { shadow: i === 0 }));
  for (let i = 0; i < 6; i++) {
    const tx = x + (r() - 0.5) * h * 0.5;
    const ty = crownY + h * 0.06 + r() * h * 0.16;
    out.push(ink([[tx, ty - 14], [tx, ty]], { width: 2, color: C.brownDark }));
    out.push(...toffee(tx, ty + 6, h * 0.05, i % 2 ? C.toffee : C.jellyRed, (r() - 0.5) * 40));
  }
  return out;
}

/** A lollipop flower. */
function lolly(x: number, baseY: number, h: number, color: string): Node[] {
  return [
    piece(rect(x - 3, baseY - h, 6, h), C.white, { edge: 'cut' }),
    piece(circle(x, baseY - h, h * 0.24), color, { edge: 'cut' }),
    ink(Array.from({ length: 18 }, (_, i) => [x + Math.cos(i / 2.2) * (i / 18) * h * 0.2, baseY - h + Math.sin(i / 2.2) * (i / 18) * h * 0.2] as Pt), { width: 3, color: C.white, opacity: 0.8 }),
  ];
}

/**
 * The jelly hill: a giant red jelly turned out of its mould, in three
 * fluted tiers, shiny on one side, with a blob of cream and a cherry.
 */
function jellyHill(cx: number, baseY: number, w: number, h: number): Node[] {
  const tier = (y0: number, y1: number, w0: number, w1: number, color: string): Node =>
    piece(curve([[cx - w0 / 2, y0], [cx - w1 / 2 - w * 0.02, y1 + h * 0.04], [cx - w1 / 2 + w * 0.03, y1], [cx + w1 / 2 - w * 0.03, y1], [cx + w1 / 2 + w * 0.02, y1 + h * 0.04], [cx + w0 / 2, y0]], 2), color, { rough: 0.8 });
  const flutes = (y0: number, y1: number, w0: number, w1: number): Node[] =>
    [-0.3, -0.1, 0.1, 0.3].map((k) => piece(band([[cx + w0 * k, y0 - 4], [cx + w1 * k, y1 + 6]], w * 0.035), '#e5707f', { edge: 'cut', fibre: false, shadow: false }));
  const t1 = baseY - h * 0.42;
  const t2 = baseY - h * 0.74;
  const t3 = baseY - h;
  return [
    piece(ellipse(cx, baseY + 2, w * 0.6, h * 0.08), C.white),
    tier(baseY, t1, w, w * 0.84, C.jellyRed),
    ...flutes(baseY, t1, w, w * 0.84),
    tier(t1 + h * 0.03, t2, w * 0.74, w * 0.6, C.jellyRed),
    ...flutes(t1, t2, w * 0.74, w * 0.6),
    tier(t2 + h * 0.03, t3, w * 0.5, w * 0.34, C.jellyRed),
    ...flutes(t2, t3, w * 0.5, w * 0.34),
    // The shine down the left side.
    piece(ellipse(cx - w * 0.3, baseY - h * 0.22, w * 0.03, h * 0.12, 8), C.white, { ...flat, opacity: 0.6 }),
    piece(ellipse(cx - w * 0.22, baseY - h * 0.6, w * 0.025, h * 0.08, 8), C.white, { ...flat, opacity: 0.6 }),
    piece(ellipse(cx - w * 0.12, baseY - h * 0.88, w * 0.02, h * 0.05, 8), C.white, { ...flat, opacity: 0.6 }),
    // Cream and a cherry.
    piece(curve([[cx - w * 0.14, t3 + 6], [cx - w * 0.1, t3 - h * 0.08], [cx, t3 - h * 0.14], [cx + w * 0.1, t3 - h * 0.08], [cx + w * 0.14, t3 + 6]], 2), C.white),
    piece(circle(cx + w * 0.02, t3 - h * 0.18, w * 0.04), C.red, { edge: 'cut' }),
    ink([[cx + w * 0.02, t3 - h * 0.2], [cx + w * 0.06, t3 - h * 0.3]], { width: 3, color: C.greenDark }),
  ];
}

/** The lemonade fountain: tiered bowls with lemonade arcing and frothing over. */
function fountain(cx: number, baseY: number, s: number): Node[] {
  const arc = (dir: number, top: number, w: number, drop: number): Node =>
    piece(band([[cx + dir * 6, top], [cx + dir * w * 0.6, top - 20 * s], [cx + dir * w, top + drop]], 8 * s), C.lemonade, { edge: 'cut', fibre: C.white });
  return [
    piece(ellipse(cx, baseY - 30 * s, 160 * s, 34 * s), C.stoneLight),
    piece(ellipse(cx, baseY - 36 * s, 146 * s, 24 * s), C.lemonade, { edge: 'cut', fibre: false }),
    piece(rect(cx - 16 * s, baseY - 150 * s, 32 * s, 120 * s, 6), C.stoneLight),
    piece(ellipse(cx, baseY - 150 * s, 90 * s, 20 * s), C.stoneLight),
    piece(ellipse(cx, baseY - 154 * s, 80 * s, 12 * s), C.lemonade, { edge: 'cut', fibre: false }),
    piece(rect(cx - 10 * s, baseY - 230 * s, 20 * s, 80 * s, 5), C.stoneLight),
    piece(ellipse(cx, baseY - 230 * s, 50 * s, 12 * s), C.stoneLight),
    arc(-1, baseY - 236 * s, 70 * s, 70 * s),
    arc(1, baseY - 236 * s, 70 * s, 70 * s),
    arc(-1, baseY - 158 * s, 130 * s, 110 * s),
    arc(1, baseY - 158 * s, 130 * s, 110 * s),
    piece(band([[cx, baseY - 230 * s], [cx, baseY - 290 * s]], 10 * s), C.lemonade, { edge: 'cut', fibre: C.white }),
    // Fizz.
    ...[[-30, -300], [20, -310], [-10, -330], [40, -280], [-50, -270]].map(([dx, dy]) => piece(circle(cx + dx * s, baseY + dy * s, 6 * s), C.white, { edge: 'cut', fibre: false, opacity: 0.85 })),
    // A lemon on the top.
    piece(ellipse(cx, baseY - 300 * s, 18 * s, 13 * s), C.yellow, { edge: 'cut' }),
  ];
}

export function farNodes(): Node[] {
  const base = farBase(C.candyPink, 301);
  return [
    ...base.back,
    ...jellyHill(140, 146, 160, 80),
    ...toffeeTree(270, 140, 110, 1),
    ...fountain(380, 146, 0.32),
    ...toffeeTree(480, 142, 96, 2),
    ...lolly(222, 144, 40, C.mint),
    ...lolly(540, 146, 36, C.yellow),
    ...base.front,
  ];
}

export const landFar = (name: string): string => farSvg(name, farNodes(), 'The Land of Goodies');

export function landScene(name: string): string {
  const r = rng(31);
  // A candy-striped path, wide at the front.
  const stripes: Node[] = [];
  for (let i = 0; i < 9; i++) {
    const t0 = i / 9;
    const t1 = (i + 1) / 9;
    const y0 = 830 - t0 * 220;
    const y1 = 830 - t1 * 220;
    const w0 = 260 - t0 * 200;
    const w1 = 260 - t1 * 200;
    const cx0 = 600 - t0 * 40;
    const cx1 = 600 - t1 * 40;
    stripes.push(piece(poly([[cx0 - w0, y0], [cx0 + w0, y0], [cx1 + w1, y1], [cx1 - w1, y1]]), i % 2 ? C.white : C.candyPink, { edge: 'cut', fibre: false, shadow: false }));
  }
  const sprinkles: Node[] = [];
  const cols = [C.jellyRed, C.mint, C.yellow, C.blue, C.white];
  for (let i = 0; i < 40; i++) {
    const x = r() * 1180;
    const y = 680 + r() * 140;
    if (x > 360 && x < 840 && y > 640) continue;
    sprinkles.push(piece(rect(x, y, 14, 5, 2), cols[i % cols.length], { ...flat }));
  }
  return sceneSvg(name, [
    ...sky([
      ['#d9eee4', 0],
      ['#f6e6e6', 300],
      ['#fbefd8', 480],
    ]),
    cloud(220, 120, 260, 1, C.white, 0.9),
    cloud(860, 90, 220, 2, C.candyPink, 0.8),
    cloud(560, 190, 160, 3, C.white, 0.7),
    // Far hills of ice-cream: mint, strawberry and vanilla.
    hills(470, 50, '#c4e4d2', 32, { step: 120 }),
    hills(520, 40, '#f2c6cf', 33, { step: 110 }),
    ...jellyHill(250, 620, 420, 300),
    ...fountain(860, 640, 1),
    ...toffeeTree(80, 660, 380, 4),
    ...toffeeTree(500, 620, 280, 5),
    ...toffeeTree(1110, 680, 400, 6),
    // The pink sugar ground and the path.
    hills(640, 20, '#f3d2d8', 34, { step: 70 }),
    ...stripes,
    ...sprinkles,
    ...lolly(400, 780, 120, C.mint),
    ...lolly(340, 800, 80, C.jellyRed),
    ...lolly(800, 790, 110, C.yellow),
    ...lolly(900, 810, 70, C.blue),
    ...toffee(200, 780, 26),
    ...toffee(1000, 790, 30, C.jellyRed, 20),
    ...toffee(680, 760, 20, C.purple, -15),
  ]);
}
