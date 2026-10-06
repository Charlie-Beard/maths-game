/**
 * The family: Beth (about 12), Joe (about 10) and Fran (about 7), and Mum
 * and Dad. He chooses one of the three children to climb with, so each has
 * a silhouette that reads at a glance: Beth's high ponytail, Joe's spiky
 * tuft, Fran's two curly bunches.
 *
 * Common parts only (see parts.ts), plus `hair` on the children (a
 * ponytail or bunches that can swing).
 */
import { C } from '../palette';
import { band, circle, curve, dot, ellipse, group, ink, piece, poly, rect, type Node } from '../paper';
import { arm, CUT, cx, cy, FLAT, fluff, person, ring, torso } from './parts';

const SKIN = C.skin;

/** Arms hanging by the sides, hands just at the bottom edge. */
const sideArms = (sleeve: string, from = 66, cuff?: string, skin: string = SKIN): Node[] => [
  arm('armL', { from: [from, 266], via: [from - 18, 300], to: [from - 14, 336], sleeve, cuff, hand: skin }),
  arm('armR', { from: [300 - from, 266], via: [318 - from, 300], to: [314 - from, 336], sleeve, cuff, hand: skin }),
];

/** Beth, the eldest: a high dark ponytail, a plum cardigan, a book. */
export function beth(): string {
  const hair = C.hairBrown;
  const cardi = C.purple;
  return person({
    name: 'beth',
    label: 'Beth',
    skin: SKIN,
    face: [54, 64],
    behindHead: [
      piece(ellipse(cx, cy - 18, 62, 58), hair),
      group({ part: 'hair', origin: [176, 74] }, [
        piece(curve([[168, 76], [210, 40], [248, 70], [252, 150], [236, 210], [224, 150], [214, 96], [182, 92]], 2), hair),
        ink([[222, 70], [240, 130], [236, 190]], { width: 2, color: '#4f3220' }),
      ]),
    ],
    body: [
      torso(cardi, 4, 226),
      piece(poly([[118, 230], [150, 248], [182, 230], [176, 345], [124, 345]]), C.cream, { fibre: false }),
      ...[0, 1, 2, 3].map((i) => ink([[126, 262 + i * 22], [174, 262 + i * 22]], { width: 4, color: C.teal, opacity: 0.6 })),
      ink([[122, 240], [124, 345]], { width: 3, color: C.plum }),
      ink([[178, 240], [176, 345]], { width: 3, color: C.plum }),
      // a pendant
      ink([[136, 232], [150, 250], [164, 232]], { width: 1.5, color: C.gold }),
      piece(circle(150, 254, 5), C.goldLight, CUT),
    ],
    front: [
      // a sleek fringe swept to one side, and the band of the ponytail
      piece(curve([[94, 132], [96, 86], [138, 68], [196, 76], [206, 112], [178, 96], [140, 96], [110, 110], [100, 134]], 2), hair),
      piece(circle(178, 78, 8), C.teal, CUT),
    ],
    eyes: 'round',
    eyeCol: C.green,
    eyeDx: 24,
    eyeY: 2,
    browCol: '#4f3220',
    mouth: 'smile',
    mouthY: 40,
    arms: [
      arm('armL', { from: [70, 266], via: [56, 302], to: [92, 314], sleeve: cardi, hand: SKIN, behind: [] }),
      arm('armR', { from: [230, 266], via: [248, 300], to: [244, 336], sleeve: cardi, hand: SKIN }),
    ],
    extra: [
      group({ part: 'book', origin: [92, 310] }, [
        piece(rect(58, 286, 66, 50, 3), C.redDark),
        piece(rect(62, 290, 58, 6, 1), C.goldLight, FLAT),
        piece(circle(98, 314, 14), SKIN, CUT),
      ]),
    ],
  });
}

/** Joe, the middle one: a spiky sandy tuft, a stripy T-shirt, a big grin. */
export function joe(): string {
  const hair = C.hairSandy;
  const tee = C.blue;
  return person({
    name: 'joe',
    label: 'Joe',
    skin: SKIN,
    face: [56, 62],
    behindHead: [piece(ellipse(cx, cy - 22, 62, 52), hair)],
    body: [
      torso(tee, 2, 230),
      ...[262, 290, 318].map((y) => piece(band([[46, y], [254, y]], 10), C.sky, { ...FLAT, opacity: 0.85 })),
      piece(curve([[124, 228], [150, 244], [176, 228], [174, 236], [150, 252], [126, 236]], 1), C.blueDark, CUT),
    ],
    onHead: [
      // a sticking plaster from climbing trees
      piece(rect(170, 152, 22, 10, 3), C.sand, { ...CUT, attrs: 'transform="rotate(-24 181 157)"' }),
    ],
    front: [
      // spiky hair with a tuft that won't lie flat
      piece(
        poly([
          [92, 124], [90, 86], [104, 62], [118, 70], [126, 46], [144, 62], [154, 36], [168, 60], [186, 46], [192, 70], [208, 72],
          [210, 124], [198, 98], [184, 108], [176, 92], [162, 104], [150, 90], [136, 104], [124, 92], [112, 108], [102, 98],
        ]),
        hair,
      ),
      piece(poly([[150, 44], [158, 14], [168, 30], [164, 52]]), hair),
    ],
    eyes: 'round',
    eyeCol: C.brown,
    eyeDx: 25,
    eyeY: 2,
    browCol: C.hairBrown,
    mouth: 'grin',
    mouthY: 40,
    arms: sideArms(tee, 66, C.blueDark),
  });
}

/** Fran, the youngest: curly ginger bunches, freckles, yellow dungarees. */
export function fran(): string {
  const hair = C.ginger;
  const top = C.red;
  return person({
    name: 'fran',
    label: 'Fran',
    skin: SKIN,
    face: [58, 58],
    behindHead: [
      piece(ellipse(cx, cy - 18, 62, 54), hair),
      group({ part: 'hair', origin: [150, 120] }, [
        fluff([[98, 112], [68, 92], [44, 112], [46, 150], [72, 162], [98, 146]], hair, 10),
        fluff([[202, 112], [232, 92], [256, 112], [254, 150], [228, 162], [202, 146]], hair, 10),
        piece(circle(98, 124, 9), C.green, CUT),
        piece(circle(202, 124, 9), C.green, CUT),
      ]),
    ],
    body: [
      torso(top, -14, 240),
      ...[268, 292, 316].map((y) => piece(band([[52, y], [248, y]], 9), C.white, { ...FLAT, opacity: 0.7 })),
      // dungarees
      piece(poly([[104, 280], [196, 280], [206, 345], [94, 345]]), C.yellow),
      piece(band([[108, 284], [104, 240]], 12), C.yellow, { edge: 'cut' }),
      piece(band([[192, 284], [196, 240]], 12), C.yellow, { edge: 'cut' }),
      piece(circle(110, 286, 5), C.brownDark, CUT),
      piece(circle(190, 286, 5), C.brownDark, CUT),
      piece(rect(132, 300, 36, 26, 4), '#d9b24a', CUT),
      piece(curve([[150, 304], [144, 298], [138, 304], [150, 318], [162, 304], [156, 298]], 1), C.rose, FLAT),
    ],
    front: [
      // a curly fringe
      fluff([[96, 120], [100, 84], [130, 70], [170, 70], [200, 84], [204, 120], [180, 102], [150, 100], [120, 102]], hair, 8),
    ],
    eyes: 'big',
    eyeCol: C.brown,
    eyeDx: 25,
    eyeY: 4,
    browCol: C.ginger,
    browY: -22,
    mouth: 'beam',
    mouthY: 38,
    freckles: true,
    arms: sideArms(top, 76),
  });
}

/** Mum: wavy auburn hair, a green jumper, gold earrings. */
export function mum(): string {
  const hair = C.hairAuburn;
  const jumper = C.green;
  return person({
    name: 'mum',
    label: 'Mum',
    skin: SKIN,
    face: [54, 66],
    behindHead: [fluff([[cx, 60], [206, 78], [218, 140], [226, 196], [204, 212], [190, 186], [110, 186], [96, 212], [74, 196], [82, 140], [94, 78]], hair, 12)],
    body: [
      torso(jumper, 8, 228),
      piece(rect(122, 222, 56, 24, 10), C.greenDark),
      ...[0, 1, 2].map((i) => ink([[60 + i * 4, 280 + i * 20], [240 - i * 4, 280 + i * 20]], { width: 3, color: C.leafLight, opacity: 0.6 })),
    ],
    front: [
      fluff([[96, 130], [96, 88], [134, 66], [186, 70], [206, 104], [204, 128], [180, 96], [140, 92], [114, 104]], hair, 9),
      dot(cx - 54, cy + 24, 5, C.gold),
      dot(cx + 54, cy + 24, 5, C.gold),
    ],
    eyes: 'round',
    eyeCol: C.green,
    eyeDx: 24,
    eyeY: 2,
    browCol: '#7a3a20',
    mouth: 'smile',
    mouthY: 40,
    arms: sideArms(jumper, 62),
  });
}

/** Dad: short brown hair, a beard, round glasses, a checked shirt. */
export function dad(): string {
  const hair = C.hairBrown;
  const shirt = C.rust;
  return person({
    name: 'dad',
    label: 'Dad',
    skin: SKIN,
    face: [58, 66],
    behindHead: [piece(ellipse(cx, cy - 26, 62, 50), hair)],
    body: [
      torso(shirt, 14, 226),
      ...[70, 110, 150, 190, 230].map((x) => piece(band([[x, 240], [x, 345]], 10), C.redDark, { ...FLAT, opacity: 0.35 })),
      ...[270, 310].map((y) => piece(band([[30, y], [270, y]], 10), C.redDark, { ...FLAT, opacity: 0.35 })),
      piece(poly([[116, 226], [150, 258], [130, 268]]), C.cream, CUT),
      piece(poly([[184, 226], [150, 258], [170, 268]]), C.cream, CUT),
    ],
    neck: SKIN,
    onHead: [
      // a neat beard, round the mouth
      piece(curve([[92, 140], [100, 190], [130, 212], [150, 216], [170, 212], [200, 190], [208, 140], [196, 172], [176, 166], [150, 164], [124, 166], [104, 172]], 2), hair, { fibre: false }),
      piece(ellipse(cx, cy + 44, 20, 11), C.skin, FLAT),
    ],
    front: [
      // short hair and a neat beard
      piece(curve([[92, 120], [94, 82], [132, 64], [182, 66], [208, 90], [208, 120], [196, 96], [150, 88], [106, 98]], 2), hair),
      ink(ring(cx - 25, cy + 2, 18), { width: 3.5, color: C.ink, closed: true }),
      ink(ring(cx + 25, cy + 2, 18), { width: 3.5, color: C.ink, closed: true }),
      ink([[cx - 7, cy], [cx + 7, cy]], { width: 3.5, color: C.ink }),
    ],
    eyes: 'round',
    eyeCol: C.brown,
    eyeDx: 25,
    eyeY: 2,
    browCol: hair,
    browY: -24,
    mouth: 'smile',
    mouthY: 40,
    arms: sideArms(shirt, 58),
  });
}

export const family: Record<string, () => string> = { beth, joe, fran, mum, dad };
