/**
 * Keepsakes for land 12, the Land of Music: one per chapter (ids from curriculum.ts),
 * their names (read aloud in the Treasure Room), and the emblem in the
 * middle of the land's seal. Drawn in a 200 × 200 box with keepsake-kit.ts.
 */
import { C } from './palette';
import { band, circle, curve, ellipse, ink, piece, poly, rect, type Node, type Pt } from './paper';
import { ground, shine } from './props';
import { at, cut, cutFlat, text, type Draw } from './keepsake-kit';
import { bigDrum as stageDrum, L12 } from './lands/l12';

const rod = (a: Pt, b: Pt, w: number, color: string): Node => piece(band([a, b], w), color, { edge: 'cut', fibre: false });

/** A crotchet: a head and a stem (head centred on 0, 0). */
const crotchet = (x: number, y: number, s: number, color: string): Node =>
  at(x, y, s, [rod([12, 0], [12, -52], 6, color), piece(ellipse(0, 0, 15, 11, -22), color, cut)]);

/** A conductor's baton: a long white stick with a round cork handle. */
const baton: Draw = () => [
  ground(100, 176, 70, 8),
  rod([52, 150], [170, 38], 8, C.white),
  rod([52, 150], [168, 40], 3, C.cream),
  piece(ellipse(46, 156, 17, 14, -45), C.wood),
  shine([[62, 140], [96, 106], [100, 110], [66, 144]], 0.35),
  crotchet(60, 70, 1, L12.teal),
  crotchet(110, 150, 0.8, L12.brass),
];

/** A musical triangle hung on a loop of string, with its beater. */
const triangleBell: Draw = () => [
  ground(100, 178, 62, 7),
  ink([[88, 22], [100, 8], [112, 22], [100, 48]], { width: 3, color: C.brownDark }),
  rod([100, 50], [44, 150], 11, C.steel),
  rod([44, 150], [158, 150], 11, C.steel),
  rod([158, 150], [124, 90], 11, C.steel),
  shine([[100, 56], [60, 128], [66, 130], [104, 64]], 0.45),
  ink([[56, 146], [146, 146]], { width: 3, color: C.steelLight }),
  // the beater leaning across
  rod([188, 112], [114, 78], 8, L12.brass),
  piece(circle(112, 77, 9), L12.brassDark, cut),
];

/** A brass trumpet side on: mouthpiece, long tube, three valves, flared bell. */
const trumpet: Draw = () => [
  ground(100, 172, 80, 8),
  // the looped tube underneath
  piece(curve([[56, 112], [60, 142], [120, 146], [140, 120], [132, 112], [118, 128], [72, 128], [68, 112]], 1), L12.brassDark),
  // valves
  ...[78, 98, 118].flatMap((x) => [rod([x, 98], [x, 66], 9, L12.brassDark), piece(circle(x, 62, 8), L12.cream, cut)]),
  // the bell
  piece(poly([[134, 94], [184, 52], [184, 148], [134, 110]]), L12.brass),
  piece(ellipse(184, 100, 9, 48), L12.brassLight, cut),
  piece(ellipse(185, 100, 5, 36), L12.tealDeep, cutFlat),
  // main tube and mouthpiece
  rod([30, 102], [140, 102], 14, L12.brass),
  piece(ellipse(24, 102, 8, 14), L12.brassLight, cut),
  shine([[44, 96], [124, 94], [124, 98], [44, 100]], 0.5),
  shine([[150, 76], [168, 64], [170, 70], [154, 82]], 0.4),
];

/** A gold pocket watch with a chain, showing twenty past two. */
const pocketWatch: Draw = () => {
  const cx = 100;
  const cy = 112;
  const hand = (deg: number, len: number, w: number): Node => {
    const a = (deg * Math.PI) / 180;
    return ink([[cx, cy], [cx + Math.sin(a) * len, cy - Math.cos(a) * len]], { width: w, color: C.ink, wobble: 0.2 });
  };
  return [
    ground(100, 184, 56, 6),
    ink([[80, 22], [48, 8], [20, 20], [12, 52]], { width: 5, color: L12.brass }),
    ink(circle(94, 24, 14), { width: 5, color: L12.brassDark, closed: true }),
    piece(rect(90, 36, 20, 16, 4), L12.brassDark, cut),
    piece(circle(cx, cy, 68), L12.brass),
    piece(circle(cx, cy, 58), L12.cream, cutFlat),
    ...Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const big = i % 3 === 0;
      const r0 = big ? 41 : 46;
      return ink([[cx + Math.sin(a) * r0, cy - Math.cos(a) * r0], [cx + Math.sin(a) * 52, cy - Math.cos(a) * 52]], { width: big ? 5 : 3, color: C.ink, wobble: 0.2 });
    }),
    // twenty past two: the hour hand a third of the way from 2 to 3, the minute hand on the 4
    hand(70, 26, 7),
    hand(120, 40, 4),
    piece(circle(cx, cy, 6), L12.brassDark, { edge: 'clean', shadow: false }),
    shine([[52, 90], [68, 66], [74, 70], [58, 96]], 0.45),
  ];
};

/** A show ticket: red and cream, with notched sides and a star. */
const showTicket: Draw = () => [
  ground(100, 166, 80, 8),
  at(100, 100, 1, [
    piece(poly([[-80, -52], [80, -52], [80, -10], [72, 0], [80, 10], [80, 52], [-80, 52], [-80, 10], [-72, 0], [-80, -10]]), L12.drumRed),
    piece(rect(-70, -43, 108, 86, 4), L12.cream, cutFlat),
    ...[-34, -17, 0, 17, 34].map((y) => piece(circle(52, y, 3.5), L12.cream, { edge: 'clean', shadow: false })),
    piece(poly([[-16, -40], [-11, -29], [0, -28], [-9, -21], [-6, -10], [-16, -16], [-26, -10], [-23, -21], [-32, -28], [-21, -29]]), L12.brass, cut),
    text(-16, 8, 'SHOW', 28, L12.drumRed),
    text(-16, 30, 'ADMIT ONE', 13, L12.tealDark),
  ]),
];

/** A drumstick: a pair, crossed, with round wooden heads. */
const drumstick: Draw = () => [
  ground(100, 178, 72, 8),
  rod([40, 170], [150, 46], 12, L12.wood),
  piece(circle(154, 40, 19), C.sand),
  rod([160, 168], [52, 46], 12, L12.wood),
  piece(circle(48, 40, 19), C.sand),
  ink([[44, 164], [140, 56]], { width: 2.5, color: C.tan, opacity: 0.8 }),
  shine([[40, 32], [50, 26], [54, 34], [44, 40]], 0.5),
  shine([[146, 32], [156, 26], [160, 34], [150, 40]], 0.5),
];

/** A little red goblin footprint left in mud: a long heel, a pad and five pointed toes. */
const muddyPrint: Draw = () => [
  piece(curve([[22, 112], [30, 56], [90, 24], [160, 40], [184, 100], [160, 160], [90, 180], [34, 160]], 2), C.brown, { rough: 1.3 }),
  piece(curve([[40, 110], [46, 70], [92, 44], [150, 56], [166, 100], [148, 144], [92, 160], [50, 144]], 2), C.brownDark, { edge: 'cut', fibre: false, opacity: 0.55 }),
  at(100, 106, 1, [
    piece(curve([[-14, 18], [-20, 52], [0, 60], [20, 52], [14, 18]], 1), L12.drumRed, cut),
    piece(curve([[-30, -10], [-24, 22], [0, 28], [24, 22], [30, -10], [10, -22], [-10, -22]], 1), L12.drumRed, cut),
    ...[[-34, -22, -42, -48], [-17, -28, -20, -58], [0, -30, 2, -62], [17, -28, 22, -56], [32, -20, 44, -42]].map(([x0, y0, x1, y1]) =>
      piece(poly([[x0 - 8, y0 + 4], [x1, y1], [x0 + 8, y0 + 4]]), L12.drumRed, cut),
    ),
  ]),
  ...[[40, 150], [168, 52], [172, 142], [58, 40]].map(([x, y]) => piece(circle(x, y, 5), C.brownDark, { edge: 'clean', shadow: false, opacity: 0.6 })),
];

/** Mr Oom Boom Boom’s big drum, as it was before the goblins took it: a few sparkles round it. */
const bigDrum: Draw = () => [
  at(100, 150, 0.72, stageDrum(0, 0, 1)),
  ...[[26, 56, 1], [176, 50, 0.8], [166, 112, 0.6]].map(([x, y, s]) => piece(poly([[x, y - 12 * s], [x + 3 * s, y - 3 * s], [x + 12 * s, y], [x + 3 * s, y + 3 * s], [x, y + 12 * s], [x - 3 * s, y + 3 * s], [x - 12 * s, y], [x - 3 * s, y - 3 * s]]), L12.brassLight, cutFlat)),
  crotchet(100, 24, 0.6, L12.brass),
];

export const KEEPSAKES_L12: Record<string, Draw> = {
  baton,
  triangleBell,
  trumpet,
  pocketWatch,
  showTicket,
  drumstick,
  muddyPrint,
  bigDrum,
};

export const NAMES_L12: Record<string, string> = {
  baton: 'A conductor’s baton',
  triangleBell: 'A little triangle',
  trumpet: 'A shiny trumpet',
  pocketWatch: 'A gold pocket watch',
  showTicket: 'A ticket to the show',
  drumstick: 'A pair of drumsticks',
  muddyPrint: 'A little red footprint',
  bigDrum: 'Mr Oom Boom Boom’s big drum',
};

/** The seal's emblem: the big drum with its two sticks and a note. */
export const EMBLEM_L12: Draw = () => [
  at(100, 158, 0.6, stageDrum(0, 0, 1)),
  rod([40, 54], [92, 98], 9, L12.wood),
  piece(circle(36, 50, 13), C.sand),
  rod([160, 54], [108, 98], 9, L12.wood),
  piece(circle(164, 50, 13), C.sand),
  crotchet(100, 36, 0.7, L12.brass),
];
