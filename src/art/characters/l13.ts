/**
 * The host of land 13, the Land of Roundabouts: `whirligig`.
 *
 * Mr Whirligig is the cheery showman who keeps the roundabouts: a red and
 * cream striped waistcoat, a tall striped hat with a little pinwheel on
 * top, rosy cheeks and the biggest curly moustache at the fair. He rings a
 * brass handbell in one hand and keeps a roll of tickets in the other.
 *
 * Extra parts (on top of the usual ones in parts.ts): pinwheel (spin it),
 * bell (swing it, it lives in armR), tickets (the roll, in armL),
 * moustache (twitch it).
 */
import { C } from '../palette';
import { circle, curve, ellipse, group, ink, piece, poly, rect, type Node, type Pt } from '../paper';
import { arm, CUT, FLAT, cx, cy, floor, person, torso } from './parts';

const RED = '#c9402f';
const TEAL = '#2f8c8c';
const TEAL_DARK = '#226a6c';
const STACHE = '#7a3b22';
const STACHE_LIGHT = '#9a5230';
const BRASS = '#d8a43f';
const BRASS_DARK = '#a97a28';

/** The pinwheel on top of the hat: four blades, a pin and a stick. Draws round (cx, cy). */
function pinwheel(x: number, y: number): Node {
  const blades: Node[] = [];
  const cols = [RED, C.cream, TEAL, C.yellow];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 - Math.PI / 4;
    const p = (r: number, da: number): Pt => [x + Math.cos(a + da) * r, y + Math.sin(a + da) * r];
    blades.push(piece(curve([[x, y], p(16, -0.1), p(14, 0.9)], 1), cols[i], CUT));
  }
  return group({ part: 'pinwheel', origin: [x, y] }, [...blades, piece(circle(x, y, 3.4), BRASS, { edge: 'clean', shadow: false })]);
}

/** A tall striped top hat. */
function hat(): Node[] {
  const stripes: Node[] = [];
  for (let i = 0; i < 4; i++) stripes.push(piece(rect(112 + i * 19.5, 26, 9.75, 52), RED, FLAT));
  return [
    // stick for the pinwheel
    ink([[150, 28], [150, 14]], { width: 3, color: C.brownDark }),
    piece(rect(112, 24, 76, 56, 5), C.cream),
    ...stripes,
    piece(rect(112, 64, 76, 12, 2), TEAL, CUT),
    piece(ellipse(150, 80, 56, 11), TEAL_DARK),
    pinwheel(150, 13),
  ];
}

/** The curly moustache: two big curls that turn up at the ends. */
function moustache(): Node {
  const y = cy + 33;
  const half = (s: number): Node[] => {
    const X = (dx: number) => cx + s * dx;
    return [
      piece(curve([[X(0), y - 8], [X(22), y - 14], [X(54), y - 4], [X(76), y - 16], [X(80), y - 34], [X(66), y - 30], [X(70), y - 20], [X(54), y + 6], [X(24), y + 14], [X(0), y + 8]], 2), STACHE, { rough: 0.8 }),
      ink([[X(10), y - 4], [X(36), y - 6], [X(58), y - 2]], { width: 2, color: STACHE_LIGHT, opacity: 0.8 }),
      ink([[X(14), y + 4], [X(40), y + 4], [X(60), y - 8], [X(70), y - 22]], { width: 1.8, color: STACHE_LIGHT, opacity: 0.7 }),
    ];
  };
  return group({ part: 'moustache', origin: [cx, y] }, [...half(-1), ...half(1), piece(ellipse(cx, y - 2, 9, 9), STACHE, CUT)]);
}

/** A brass handbell, held by its handle at (x, y), mouth down. */
function handbell(x: number, y: number): Node[] {
  return [
    piece(rect(x - 5, y - 6, 10, 22, 4), C.brownDark, CUT),
    piece(curve([[x - 8, y + 12], [x - 18, y + 28], [x - 30, y + 46], [x + 30, y + 46], [x + 18, y + 28], [x + 8, y + 12]], 2), BRASS),
    piece(rect(x - 32, y + 42, 64, 8, 4), BRASS_DARK, CUT),
    ink([[x - 10, y + 20], [x - 17, y + 38]], { width: 3, color: '#fff3c8', opacity: 0.7 }),
    piece(circle(x, y + 54, 6), BRASS_DARK, CUT),
  ];
}

/** A roll of tickets with a strip curling off it, at (x, y). */
function ticketRoll(x: number, y: number): Node[] {
  return [
    piece(curve([[x - 8, y + 6], [x + 14, y + 22], [x + 38, y + 18], [x + 56, y + 30], [x + 50, y + 42], [x + 30, y + 32], [x + 8, y + 36], [x - 10, y + 22]], 2), C.cream, CUT),
    ...[0, 1, 2].map((i) => ink([[x + 24 + i * 11, y + 22 + i * 3], [x + 26 + i * 11, y + 32 + i * 3]], { width: 1.8, color: RED })),
    piece(circle(x, y, 20), RED, CUT),
    piece(circle(x, y, 13), C.cream, CUT),
    piece(circle(x, y, 6), RED, CUT),
    piece(circle(x, y, 2.4), C.cream, { edge: 'clean', shadow: false }),
  ];
}

/** The waistcoat: red and cream stripes, gold buttons and a bow tie. */
function waistcoat(): Node[] {
  const stripes: Node[] = [];
  for (let i = 0; i < 7; i++) {
    const x = 108 + i * 14;
    stripes.push(piece(poly([[x, 238], [x + 7, 238], [x + 7 + (x < 150 ? 1 : -1) * 0, 345], [x, 345]]), RED, FLAT));
  }
  return [
    // the teal coat
    torso(TEAL, 6),
    piece(curve([[104, 232], [150, 300], [196, 232], [210, 345], [90, 345]], 1), C.cream, { rough: 0.7 }),
    ...stripes,
    ...[272, 304].map((y) => piece(circle(150, y, 6), BRASS, CUT)),
    // coat lapels
    piece(poly([[98, 232], [128, 232], [150, 290], [112, 345], [92, 345]]), TEAL_DARK, { rough: 0.6 }),
    piece(poly([[202, 232], [172, 232], [150, 290], [188, 345], [208, 345]]), TEAL_DARK, { rough: 0.6 }),
    // bow tie
    piece(poly([[150, 238], [122, 224], [122, 252]]), RED, CUT),
    piece(poly([[150, 238], [178, 224], [178, 252]]), RED, CUT),
    piece(circle(150, 238, 7), C.redDark, CUT),
  ];
}

/** Mr Whirligig. Extra parts: pinwheel, moustache, bell (in armR), tickets (in armL). */
export function whirligig(): string {
  return person({
    name: 'whirligig',
    label: 'Mr Whirligig',
    skin: '#f0c4a0',
    face: [56, 62],
    eyes: 'big',
    eyeCol: C.brownDark,
    brows: 'raised',
    browCol: STACHE,
    nose: 'round',
    mouth: 'beam',
    mouthY: 50,
    cheeks: '#e68a82',
    back: [floor()],
    body: waistcoat(),
    behindHead: [
      // curly hair tufts poking out under the hat
      piece(circle(cx - 54, cy - 24, 15), STACHE, { rough: 1.3 }),
      piece(circle(cx - 60, cy - 6, 12), STACHE, { rough: 1.3 }),
      piece(circle(cx + 54, cy - 24, 15), STACHE, { rough: 1.3 }),
      piece(circle(cx + 60, cy - 6, 12), STACHE, { rough: 1.3 }),
    ],
    front: [moustache()],
    hat: hat(),
    arms: [
      arm('armL', { from: [74, 262], via: [40, 300], to: [70, 322], sleeve: TEAL, width: 30, cuff: C.cream, hand: '#f0c4a0', holding: ticketRoll(54, 318) }),
      arm('armR', {
        from: [226, 262],
        via: [268, 222],
        to: [254, 160],
        sleeve: TEAL,
        width: 30,
        cuff: C.cream,
        hand: '#f0c4a0',
        holding: [group({ part: 'bell', origin: [254, 160] }, handbell(254, 160))],
      }),
    ],
  });
}

export const L13_CHARACTERS: Record<string, () => string> = {
  whirligig,
};
