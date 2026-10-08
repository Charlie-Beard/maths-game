/**
 * Land 13: the Land of Roundabouts. An old-fashioned fairground in warm
 * orange, cream, red and teal stripes: a carousel with painted horses, a
 * helter-skelter, a big wheel, spinning teacups, bunting and signposts
 * with arrows. Everything is held still (the land only spins in the
 * finale), and the middle of the ground is left bare for the puppets.
 *
 * The drawings are exported (carousel, carouselHorse, helterSkelter,
 * bigWheel, teacup, signpost) so stories and keepsakes can reuse them. Each
 * takes the spot on the ground it stands on and a scale.
 */
import { C } from '../palette';
import { band, circle, curve, ellipse, group, ink, piece, poly, rect, type Node, type Pt } from '../paper';
import { balloon, bunting, cloud, farBase, farSvg, flat, hills, sceneSvg, sky } from './common';

export const FAIR_ORANGE = '#e07b39';
export const FAIR_RED = '#c9402f';
export const FAIR_TEAL = '#3a9a9a';
export const FAIR_TEAL_DARK = '#287272';
export const FAIR_CREAM = C.cream;
export const FAIR_GOLD = C.gold;
const STRIPES = [FAIR_RED, FAIR_CREAM, FAIR_TEAL, FAIR_CREAM];

/** Moves and scales a drawing made round (0, 0) = the spot on the ground. */
const place = (x: number, y: number, s: number, nodes: Node[]): Node => group({ transform: `translate(${x} ${y}) scale(${s})` }, nodes);

/**
 * A painted carousel horse on its brass pole, centred on (x, y) (the middle
 * of its body, about 112 wide). `flip` turns it to face left.
 */
export function carouselHorse(x: number, y: number, s: number, color: string, flip = false, poleTop = -90, poleBottom = 50): Node {
  const mane = color === FAIR_RED ? FAIR_CREAM : color === FAIR_CREAM ? FAIR_RED : C.cream;
  const leg = (pts: Pt[]): Node => piece(band(pts, 11), color, { rough: 0.7 });
  const hoof = (px: number, py: number): Node => piece(circle(px, py, 6), C.brownDark, { edge: 'cut', shadow: false });
  return group({ transform: `translate(${x} ${y}) scale(${flip ? -s : s} ${s})` }, [
    // the pole goes behind the far legs and in front of the body
    leg([[-12, 12], [-22, 28], [-14, 40]]),
    leg([[-26, 8], [-40, 20], [-42, 32]]),
    piece(curve([[-30, -6], [-44, 4], [-54, 24], [-48, 30], [-40, 10], [-30, 6]], 2), mane, { rough: 0.8 }),
    piece(ellipse(0, 0, 36, 19), color),
    piece(curve([[16, -8], [22, -38], [34, -54], [50, -52], [64, -36], [58, -28], [44, -30], [38, -10]], 2), color),
    piece(poly([[34, -52], [38, -66], [44, -52]]), color, { edge: 'cut' }),
    // mane, bridle, eye, nostril
    piece(curve([[18, -42], [28, -58], [34, -52], [28, -34], [30, -12], [22, -8]], 1), mane, { rough: 0.7 }),
    ink([[56, -48], [52, -36], [44, -32]], { width: 2.4, color: C.brownDark }),
    piece(circle(46, -44, 3), C.ink, { edge: 'clean', shadow: false }),
    piece(circle(61, -35, 1.8), C.ink, { edge: 'clean', shadow: false }),
    // a patterned saddle blanket
    piece(rect(-12, -18, 28, 20, 4), FAIR_GOLD, { edge: 'cut' }),
    piece(rect(-8, -14, 20, 12, 3), mane, { edge: 'cut', fibre: false, shadow: false }),
    ink([[-30, -4], [-18, -12]], { width: 2, color: FAIR_GOLD }),
    leg([[16, 12], [26, 28], [20, 40]]),
    leg([[26, 8], [42, 20], [40, 32]]),
    hoof(20, 41),
    hoof(40, 33),
    hoof(-14, 41),
    hoof(-42, 33),
    ink([[0, poleTop], [0, poleBottom]], { width: 5, color: FAIR_GOLD }),
    ink([[-1.5, poleTop], [-1.5, poleBottom]], { width: 1.6, color: '#fff3c8', opacity: 0.8 }),
  ]);
}

/**
 * A carousel standing on (x, y): a striped canopy with scalloped edge on top
 * of four painted horses, about 300 wide and 280 high at scale 1.
 */
export function carousel(x: number, y: number, s: number): Node {
  const horses: [number, string][] = [[-104, FAIR_RED], [-34, FAIR_CREAM], [34, FAIR_TEAL], [104, C.yellow]];
  const nodes: Node[] = [
    piece(ellipse(0, 10, 170, 12), 'rgba(40,25,10,0.18)', { ...flat }),
    piece(rect(-152, -16, 304, 28, 6), FAIR_TEAL),
    piece(rect(-152, -16, 304, 9, 4), FAIR_CREAM, { edge: 'cut', fibre: false }),
    // the middle column, striped
    piece(rect(-16, -158, 32, 144, 3), FAIR_CREAM),
    ...[-140, -108, -76, -44].map((py) => piece(rect(-16, py, 32, 12), FAIR_RED, { ...flat })),
  ];
  for (const [hx, col] of horses) nodes.push(carouselHorse(hx, -62, 0.66, col, hx > 0, -134, 70));
  // the canopy: a striped cone, a scalloped edge and a rim of lights
  for (let i = 0; i < 10; i++) {
    const x0 = -150 + i * 30;
    nodes.push(piece(poly([[0, -246], [x0, -150], [x0 + 30, -150]]), STRIPES[i % 4], { edge: 'cut', fibre: false }));
  }
  nodes.push(
    ...Array.from({ length: 10 }, (_, i) => piece(ellipse(-135 + i * 30, -146, 15, 13), i % 2 ? FAIR_TEAL : FAIR_CREAM, { edge: 'cut', fibre: false })),
    piece(rect(-156, -160, 312, 14, 5), FAIR_GOLD),
    ...Array.from({ length: 11 }, (_, i) => piece(circle(-150 + i * 30, -153, 3.6), '#fff1b8', { ...flat })),
    piece(circle(0, -248, 7), FAIR_GOLD, { edge: 'cut' }),
    ink([[0, -250], [0, -282]], { width: 3, color: C.brownDark }),
    piece(poly([[0, -282], [26, -274], [0, -266]]), FAIR_RED, { edge: 'cut' }),
  );
  return place(x, y, s, nodes);
}

/** A helter-skelter tower with a spiral slide painted on it, about 150 wide and 330 high. */
export function helterSkelter(x: number, y: number, s: number): Node {
  const H = 300;
  const bw = 78;
  const tw = 30;
  const L = (yy: number): number => -(bw - ((bw - tw) * -yy) / H);
  const R = (yy: number): number => -L(yy);
  const nodes: Node[] = [
    piece(ellipse(0, 8, 96, 10), 'rgba(40,25,10,0.18)', flat),
    piece(poly([[L(0), 0], [R(0), 0], [R(-H), -H], [L(-H), -H]]), FAIR_CREAM, { rough: 0.7 }),
  ];
  // the spiral: stripes that climb from left to right
  for (let i = 0; i < 5; i++) {
    const ya = -18 - i * 56;
    const yb = ya - 40;
    const t = 30;
    nodes.push(piece(poly([[L(ya), ya], [R(yb), yb], [R(yb + t), yb + t], [L(ya + t), ya + t]]), i % 2 ? FAIR_TEAL : FAIR_RED, { edge: 'cut', fibre: false }));
  }
  nodes.push(
    // the door
    piece(rect(-18, -50, 36, 50, 18), C.brownDark, { edge: 'cut' }),
    // the platform at the top, a round window and a pointed cap with a flag
    piece(rect(-60, -H - 6, 120, 14, 5), FAIR_GOLD),
    piece(rect(-56, -H - 30, 112, 24, 4), FAIR_TEAL),
    ...[-40, -20, 0, 20, 40].map((px) => piece(rect(px - 4, -H - 26, 8, 16, 2), FAIR_CREAM, flat)),
    piece(curve([[-40, -H - 30], [-36, -H - 76], [0, -H - 110], [36, -H - 76], [40, -H - 30]], 3), FAIR_RED, { rough: 0.8 }),
    piece(curve([[-22, -H - 34], [-20, -H - 70], [-4, -H - 94], [-8, -H - 60], [-6, -H - 34]], 2), FAIR_CREAM, { ...flat, opacity: 0.5 }),
    ink([[0, -H - 108], [0, -H - 140]], { width: 3, color: C.brownDark }),
    piece(poly([[0, -H - 140], [28, -H - 132], [0, -H - 124]]), FAIR_TEAL, { edge: 'cut' }),
  );
  return place(x, y, s, nodes);
}

/** A big wheel standing on (x, y) with its hub high up: 2.2 × r wide. */
export function bigWheel(x: number, y: number, r: number, s = 1): Node {
  const hubY = -r - 30;
  const ringPts = (rr: number): Pt[] => Array.from({ length: 33 }, (_, i) => [Math.cos((i / 32) * Math.PI * 2) * rr, hubY + Math.sin((i / 32) * Math.PI * 2) * rr] as Pt);
  const nodes: Node[] = [piece(ellipse(0, 6, r * 0.8, 8), 'rgba(40,25,10,0.16)', flat)];
  // legs, two A-frames
  nodes.push(piece(band([[-r * 0.5, 0], [0, hubY]], 12), FAIR_TEAL_DARK, { rough: 0.6 }), piece(band([[r * 0.5, 0], [0, hubY]], 12), FAIR_TEAL_DARK, { rough: 0.6 }));
  nodes.push(ink(ringPts(r), { width: 7, color: FAIR_RED, wobble: 0.3 }), ink(ringPts(r * 0.62), { width: 4, color: FAIR_CREAM, wobble: 0.3 }));
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    nodes.push(ink([[0, hubY], [Math.cos(a) * r, hubY + Math.sin(a) * r]], { width: 3.2, color: i % 2 ? FAIR_CREAM : FAIR_GOLD, wobble: 0.2 }));
  }
  // gondolas hang straight down from the rim
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.26;
    const gx = Math.cos(a) * r;
    const gy = hubY + Math.sin(a) * r;
    const w = r * 0.2;
    nodes.push(
      ink([[gx, gy], [gx, gy + w * 0.7]], { width: 2.4, color: C.brownDark }),
      piece(rect(gx - w / 2, gy + w * 0.6, w, w * 0.8, 4), STRIPES[i % 4] === FAIR_CREAM ? C.yellow : STRIPES[i % 4], { edge: 'cut' }),
      piece(poly([[gx - w * 0.64, gy + w * 0.64], [gx, gy + w * 0.2], [gx + w * 0.64, gy + w * 0.64]]), i % 2 ? FAIR_RED : FAIR_TEAL, { edge: 'cut', fibre: false }),
    );
  }
  nodes.push(piece(circle(0, hubY, r * 0.1), FAIR_GOLD), piece(circle(0, hubY, r * 0.04), C.brownDark, { edge: 'clean', shadow: false }));
  return place(x, y, s, nodes);
}

/** A fairground teacup on a saucer standing on (x, y), about 70 wide. */
export function teacup(x: number, y: number, s: number, color: string): Node {
  return place(x, y, s, [
    piece(ellipse(0, 4, 46, 9), 'rgba(40,25,10,0.18)', flat),
    piece(ellipse(0, -2, 44, 10), FAIR_CREAM, { edge: 'cut' }),
    ink([[26, -34], [44, -34], [48, -18], [32, -14]], { width: 6, color }),
    piece(curve([[-34, -50], [34, -50], [28, -18], [0, -6], [-28, -18]], 2), color),
    piece(ellipse(0, -50, 34, 8), mixTint(color), { edge: 'cut', fibre: false }),
    piece(curve([[-30, -36], [30, -36], [28, -28], [-28, -28]], 1), FAIR_CREAM, { ...flat, opacity: 0.8 }),
    ...[-14, 0, 14].map((dx) => piece(circle(dx, -22, 2.8), FAIR_CREAM, flat)),
    // the wheel in the middle for steering
    ink([[0, -50], [0, -64]], { width: 3, color: FAIR_GOLD }),
    ink([[-10, -64], [10, -64]], { width: 4, color: FAIR_GOLD }),
  ]);
}

/** A lighter tint for the inside of a cup. */
function mixTint(c: string): string {
  return c === FAIR_RED ? '#8f2c20' : c === FAIR_TEAL ? FAIR_TEAL_DARK : '#c9a23a';
}

/** A signpost on (x, y), 130 high, with arrows pointing right, left and right. */
export function signpost(x: number, y: number, s: number): Node {
  const board = (by: number, dir: 1 | -1, color: string, mark: string): Node[] => {
    const f = (px: number): number => px * dir;
    return [
      piece(poly([[f(-34), by - 13], [f(28), by - 13], [f(48), by], [f(28), by + 13], [f(-34), by + 13]]), color, { edge: 'cut' }),
      ink([[f(-24), by], [f(26), by]], { width: 2.4, color: mark }),
      ink([[f(16), by - 6], [f(26), by], [f(16), by + 6]], { width: 2.4, color: mark }),
    ];
  };
  return place(x, y, s, [
    piece(ellipse(0, 4, 26, 5), 'rgba(40,25,10,0.18)', flat),
    piece(rect(-6, -132, 12, 134, 2), C.wood, { rough: 0.7 }),
    ...board(-112, 1, FAIR_RED, FAIR_CREAM),
    ...board(-82, -1, FAIR_CREAM, FAIR_RED),
    ...board(-52, 1, FAIR_TEAL, FAIR_CREAM),
    piece(circle(0, -136, 7), FAIR_GOLD, { edge: 'cut' }),
  ]);
}

/** Bunting in fair colours. */
const fairBunting = (a: Pt, b: Pt, sag: number, flagW = 26): Node[] => bunting(a, b, sag, [FAIR_RED, FAIR_CREAM, FAIR_TEAL, C.yellow], flagW);

export function farNodes(): Node[] {
  const base = farBase('#e8a45c', 1301, { cloud: '#f7eddc', shade: '#e0d4bc' });
  return [
    ...base.back,
    helterSkelter(110, 146, 0.4),
    bigWheel(450, 146, 44),
    carousel(285, 146, 0.4),
    teacup(536, 150, 0.5, FAIR_TEAL),
    teacup(196, 152, 0.4, FAIR_RED),
    ...fairBunting([30, 84], [285, 52], 8, 9),
    ...fairBunting([285, 52], [450, 40], 6, 9),
    piece(ellipse(300, 144, 250, 8), '#f0c486', { rough: 1, shadow: false }),
    ...base.front,
  ];
}

export const landFar = (name: string): string => farSvg(name, farNodes(), 'The Land of Roundabouts');

export function landScene(name: string): string {
  return sceneSvg(name, [
    ...sky([
      ['#f6cf98', 0],
      ['#f9dfb4', 230],
      ['#fcecce', 420],
    ]),
    cloud(240, 110, 320, 3, '#fff3dc', 0.9),
    cloud(1000, 150, 260, 4, '#fff3dc', 0.9),
    // far hills, pale teal
    hills(520, 36, '#a9cfc2', 1314),
    hills(590, 18, '#e8c58a', 1315, { step: 120 }),
    // the big wheel, behind the rides
    bigWheel(610, 620, 150),
    // the fairground
    helterSkelter(140, 612, 1.02),
    teacup(360, 618, 0.9, FAIR_TEAL),
    teacup(425, 630, 0.75, FAIR_RED),
    carousel(960, 618, 0.9),
    // bunting strung across the sky and the rides
    ...fairBunting([0, 150], [300, 118], 26),
    ...fairBunting([300, 118], [620, 160], 30),
    ...fairBunting([620, 160], [900, 112], 26),
    ...fairBunting([900, 112], [1180, 150], 24),
    ...balloon(560, 220, 22, FAIR_RED),
    ...balloon(600, 200, 24, FAIR_TEAL),
    ...balloon(642, 224, 20, C.yellow),
    // the trodden ground, left bare in the middle
    hills(650, 14, '#e1b06a', 1316, { step: 160 }),
    piece(ellipse(600, 740, 380, 56), '#efcf96', { rough: 1, shadow: false }),
    hills(790, 12, '#d79c58', 1317, { step: 200 }),
    // signposts at the edges
    signpost(60, 790, 1),
    signpost(1118, 780, 0.9),
  ]);
}
