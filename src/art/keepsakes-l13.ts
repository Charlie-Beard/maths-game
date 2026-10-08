/**
 * Keepsakes for land 13, the Land of Roundabouts: one per chapter (ids from curriculum.ts),
 * their names (read aloud in the Treasure Room), and the emblem in the
 * middle of the land's seal. Drawn in a 200 × 200 box with keepsake-kit.ts,
 * in the fair's red, cream, teal and brass.
 */
import { C } from './palette';
import { band, circle, curve, ellipse, group, ink, piece, poly, rect, type Node, type Pt } from './paper';
import { ground, shine } from './props';
import { at, cut, cutFlat, text, type Draw } from './keepsake-kit';
import { carousel, carouselHorse, signpost, FAIR_CREAM, FAIR_GOLD, FAIR_RED, FAIR_TEAL, FAIR_TEAL_DARK } from './lands/l13';

const BRASS_DARK = '#a97a28';
const FAIR_ORANGE_MAT = '#e0a25c';

/** Points round a circle, for ink rings. */
const ring = (x: number, y: number, r: number, n = 28): Pt[] => Array.from({ length: n + 1 }, (_, i) => [x + Math.cos((i / n) * Math.PI * 2) * r, y + Math.sin((i / n) * Math.PI * 2) * r] as Pt);

/** A beach-ball style ball: striped wedges seen from the side, tilted. */
function striped(cx: number, cy: number, R: number): Node[] {
  const cols = [FAIR_RED, FAIR_CREAM, FAIR_TEAL, C.yellow, FAIR_RED];
  const lons = [-90, -54, -18, 18, 54, 90].map((d) => (d * Math.PI) / 180);
  const wedges: Node[] = [];
  for (let i = 0; i < 5; i++) {
    const pts: Pt[] = [];
    for (let k = 0; k <= 10; k++) {
      const lat = -Math.PI / 2 + (k / 10) * Math.PI;
      pts.push([R * Math.cos(lat) * Math.sin(lons[i]), -R * Math.sin(lat)]);
    }
    for (let k = 10; k >= 0; k--) {
      const lat = -Math.PI / 2 + (k / 10) * Math.PI;
      pts.push([R * Math.cos(lat) * Math.sin(lons[i + 1]), -R * Math.sin(lat)]);
    }
    wedges.push(piece(pts, cols[i], { edge: 'cut', fibre: false, shadow: false }));
  }
  return [
    piece(circle(cx, cy, R), FAIR_CREAM),
    group({ transform: `translate(${cx} ${cy}) rotate(-24)` }, [...wedges, piece(circle(0, -R, 5), BRASS_DARK, cutFlat), piece(circle(0, R, 5), BRASS_DARK, cutFlat)]),
    shine([[cx - R * 0.6, cy - R * 0.2], [cx - R * 0.4, cy - R * 0.62], [cx - R * 0.14, cy - R * 0.78]], 0.5),
  ];
}

export const KEEPSAKES_L13: Record<string, Draw> = {
  carouselHorse: () => [
    ground(100, 168, 62, 9),
    piece(circle(100, 166, 30), FAIR_GOLD, { edge: 'cut' }),
    carouselHorse(96, 98, 1.3, FAIR_RED, false, -62, 56),
  ],

  // A brass compass: the needle points north-east.
  compass: () => [
    ground(100, 176, 62, 9),
    piece(circle(100, 24, 9), BRASS_DARK, cut),
    ink(ring(100, 24, 9), { width: 3.5, color: FAIR_GOLD }),
    piece(circle(100, 104, 72), FAIR_GOLD),
    piece(circle(100, 104, 62), BRASS_DARK, cutFlat),
    piece(circle(100, 104, 57), FAIR_CREAM, cutFlat),
    ...Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      const l = i % 4 === 0 ? 12 : 7;
      return ink([[100 + Math.sin(a) * 56, 104 - Math.cos(a) * 56], [100 + Math.sin(a) * (56 - l), 104 - Math.cos(a) * (56 - l)]], { width: i % 4 === 0 ? 3 : 2, color: C.ink });
    }),
    text(100, 62, 'N', 17, FAIR_RED),
    text(100, 156, 'S', 14, C.ink),
    text(148, 110, 'E', 14, C.ink),
    text(52, 110, 'W', 14, C.ink),
    group({ transform: 'rotate(42 100 104)' }, [
      piece(poly([[100, 50], [111, 104], [89, 104]]), FAIR_RED, cutFlat),
      piece(poly([[100, 158], [111, 104], [89, 104]]), FAIR_TEAL, cutFlat),
    ]),
    piece(circle(100, 104, 6), FAIR_GOLD, { edge: 'clean', shadow: false }),
    shine([[50, 70], [58, 54], [74, 42]], 0.5),
  ],

  // A fairground teacup ride car with a steering wheel in the middle.
  spinningCup: () => [
    ground(100, 172, 74, 10),
    piece(ellipse(100, 160, 74, 15), FAIR_CREAM),
    piece(ellipse(100, 157, 60, 10), FAIR_TEAL_DARK, cutFlat),
    ink([[146, 90], [178, 92], [182, 120], [150, 130]], { width: 11, color: FAIR_TEAL }),
    piece(curve([[28, 70], [172, 70], [158, 126], [100, 156], [42, 126]], 3), FAIR_TEAL),
    piece(ellipse(100, 70, 72, 16), FAIR_TEAL_DARK, cut),
    piece(curve([[36, 100], [164, 100], [158, 118], [42, 118]], 1), FAIR_CREAM, { ...cutFlat, opacity: 0.9 }),
    ...[56, 78, 100, 122, 144].map((x) => piece(circle(x, 109, 5), FAIR_RED, cutFlat)),
    // the wheel that spins the cup
    ink([[100, 70], [100, 38]], { width: 6, color: FAIR_GOLD }),
    ink(ring(100, 28, 20), { width: 6, color: FAIR_GOLD }),
    ink([[80, 28], [120, 28]], { width: 4, color: FAIR_GOLD }),
    ink([[100, 8], [100, 48]], { width: 4, color: FAIR_GOLD }),
    shine([[46, 90], [52, 80], [68, 76]], 0.5),
  ],

  rollingBall: () => [ground(100, 172, 66, 9), ...striped(100, 100, 66)],

  // A helter-skelter mat: a coconut-fibre mat with a handle, stripes and a curled front.
  helterMat: () => [
    ground(100, 172, 80, 9),
    piece(poly([[36, 66], [172, 44], [186, 130], [26, 154]]), FAIR_ORANGE_MAT),
    // stripes running along the mat
    ...[0, 1, 2, 3].map((i) =>
      piece(
        poly([[36 + i * 6 + (i % 2) * 1, 66 + i * 22 - i * 5], [172 + i * 4, 44 + i * 22 + i * 1], [172 + i * 4, 52 + i * 22 + i * 1], [36 + i * 6, 74 + i * 22 - i * 5]]),
        i % 2 ? FAIR_TEAL : FAIR_RED,
        cutFlat,
      ),
    ),
    // the curled-up front edge and a rope handle
    piece(curve([[26, 154], [186, 130], [190, 142], [28, 168]], 1), BRASS_DARK, cut),
    ink([[36, 66], [20, 58], [20, 82], [32, 90]], { width: 5, color: FAIR_CREAM }),
    ...[0, 1, 2, 3, 4, 5].map((i) => ink([[56 + i * 22, 52 - i * 3], [52 + i * 22, 66 - i * 3]], { width: 1.6, color: BRASS_DARK, opacity: 0.6 })),
    shine([[50, 74], [90, 66]], 0.35),
  ],

  signpost: () => [signpost(100, 184, 1.32)],

  // A coil of rope with a little red knot with pointed ears: a goblin's, and a clue.
  goblinRope: () => [
    ground(100, 176, 76, 9),
    ...[64, 52, 40, 28].map((rx, i) => piece(ellipse(100, 128 - i * 6, rx + 16, rx * 0.46 + 8), i % 2 ? '#d9b87c' : '#c49a6c', { rough: 0.5 })),
    ...[62, 50, 38].map((rx, i) => ink(Array.from({ length: 29 }, (_, k) => [100 + Math.cos((k / 28) * Math.PI * 2) * (rx + 12), 126 - i * 6 + Math.sin((k / 28) * Math.PI * 2) * (rx * 0.44 + 7)] as Pt), { width: 2, color: '#8a6446', opacity: 0.8 })),
    piece(ellipse(100, 108, 22, 9), '#6b4a32', cutFlat),
    // the rope's loose end hangs over the front
    piece(band([[150, 150], [168, 168], [150, 184], [128, 178]], 12), '#c49a6c'),
    ink([[158, 156], [162, 166]], { width: 2, color: '#8a6446' }),
    ink([[154, 172], [150, 180]], { width: 2, color: '#8a6446' }),
    // the goblin knot: a red knot with two pointy ears and a little cap
    piece(band([[100, 70], [92, 56], [78, 40]], 10), FAIR_RED, cut),
    piece(band([[100, 70], [110, 56], [126, 44]], 10), FAIR_RED, cut),
    piece(poly([[88, 46], [66, 22], [100, 40]]), FAIR_RED, cut),
    piece(poly([[112, 46], [136, 20], [104, 40]]), FAIR_RED, cut),
    piece(circle(100, 80, 24), FAIR_RED),
    piece(circle(100, 80, 11), '#8f2c20', cutFlat),
    ink([[82, 76], [96, 92]], { width: 3, color: '#8f2c20' }),
    ink([[116, 74], [104, 92]], { width: 3, color: '#8f2c20' }),
    shine([[86, 66], [92, 60], [102, 58]], 0.5),
  ],

  // A ticket with notched edges, a striped border and a perforated stub.
  roundaboutTicket: () => [
    ground(100, 170, 80, 8),
    group({ transform: 'rotate(-8 100 100)' }, [
      piece(rect(18, 54, 164, 92, 8), FAIR_RED),
      piece(poly([[26, 62], [174, 62], [174, 138], [26, 138]]), FAIR_CREAM, { ...cutFlat }),
      ...[0, 1, 2, 3, 4, 5, 6].map((i) => piece(rect(30 + i * 20, 66, 10, 7), FAIR_TEAL, cutFlat)),
      ...[0, 1, 2, 3, 4, 5, 6].map((i) => piece(rect(30 + i * 20, 127, 10, 7), FAIR_TEAL, cutFlat)),
      // the notches at each side
      piece(circle(18, 100, 11), C.cream, { edge: 'clean', shadow: false }),
      piece(circle(182, 100, 11), C.cream, { edge: 'clean', shadow: false }),
      ink([[134, 78], [134, 124]], { width: 2.4, color: FAIR_RED }),
      ...[0, 1, 2, 3, 4, 5].map((i) => piece(circle(134, 80 + i * 8.6, 1.8), FAIR_RED, { edge: 'clean', shadow: false })),
      text(78, 98, 'ONE', 22, FAIR_RED),
      text(78, 122, 'RIDE', 22, FAIR_TEAL_DARK),
      // a tiny gold star on the stub
      piece(poly(Array.from({ length: 10 }, (_, i) => [158 + Math.cos(((i * 36 - 90) * Math.PI) / 180) * (i % 2 ? 6 : 14), 101 + Math.sin(((i * 36 - 90) * Math.PI) / 180) * (i % 2 ? 6 : 14)] as Pt)), FAIR_GOLD, cutFlat),
    ]),
  ],
};

export const NAMES_L13: Record<string, string> = {
  carouselHorse: 'A carousel horse',
  compass: 'A brass compass',
  spinningCup: 'A spinning teacup',
  rollingBall: 'A rolling ball',
  helterMat: 'A helter-skelter mat',
  signpost: 'A signpost',
  goblinRope: 'A rope with a goblin knot',
  roundaboutTicket: 'A roundabout ticket',
};

/** The seal's emblem: a little carousel under its striped canopy. */
export const EMBLEM_L13: Draw = () => [at(100, 172, 0.6, [carousel(0, 0, 1)])];
