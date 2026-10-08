/**
 * Keepsakes for land 11, the Old Woman's Shoe: one per chapter (ids from curriculum.ts),
 * their names (read aloud in the Treasure Room), and the emblem in the
 * middle of the land's seal. Drawn in a 200 × 200 box with keepsake-kit.ts.
 *
 * Browns, buttercup yellow and a little sky blue, the colours of the
 * Shoe. Each is the very thing he found in that chapter, drawn big.
 */
import { C } from './palette';
import { band, circle, curve, dot, ellipse, group, ink, piece, poly, rect } from './paper';
import { bootHouse } from './lands/l11';
import { cut, cutFlat, mix, type Draw } from './keepsake-kit';
import { ground, shine } from './props';

const LEATHER = '#8c5a32';
const LEATHER_DARK = '#6a4022';
const BUTTERCUP = '#f2cf3b';
const LACE = '#f4ead0';
const CAP_RED = '#c8382f';

export const KEEPSAKES_L11: Record<string, Draw> = {
  // A long bootlace tied in a loose bow, brass tips on the ends.
  bootLace: () => [
    ground(100, 180, 78, 7),
    piece(band([[100, 100], [60, 52], [30, 66], [50, 108], [100, 100]], 12), LACE),
    piece(band([[100, 100], [142, 50], [172, 66], [152, 110], [100, 100]], 12), LACE),
    piece(band([[100, 100], [78, 138], [96, 166], [70, 184]], 12), LACE),
    piece(band([[100, 100], [128, 136], [112, 164], [138, 184]], 12), LACE),
    // brass tips (aglets) on both ends
    piece(band([[74, 178], [70, 186]], 12), C.brass, cutFlat),
    piece(band([[134, 178], [138, 186]], 12), C.brass, cutFlat),
    ...[[56, 56, 36, 84], [146, 56, 166, 84]].map(([x0, y0, x1, y1]) => ink([[x0, y0], [x1, y1]], { width: 2, color: 'rgba(120,90,50,0.45)' })),
    piece(circle(100, 100, 14), LACE, cut),
    piece(circle(100, 100, 6), mix(LACE, '#000000', 0.15), cutFlat),
    shine([[44, 62], [54, 52]], 0.5),
  ],

  // A stick notched with tally marks: a gate of five, then three more.
  tallyStick: () => [
    ground(100, 176, 76, 7),
    group({ transform: 'rotate(-8 100 100)' }, [
      piece(poly([[12, 62], [176, 56], [190, 70], [186, 124], [172, 140], [14, 138], [8, 100]]), C.tan, { rough: 1.1 }),
      piece(poly([[12, 62], [176, 56], [190, 70], [20, 78]]), C.sand, cutFlat),
      ink([[26, 124], [160, 126]], { width: 2, color: 'rgba(90,50,20,0.35)' }),
      ink([[30, 70], [70, 72]], { width: 2, color: 'rgba(90,50,20,0.3)' }),
      // the gate of five
      ...[36, 52, 68, 84].map((x) => ink([[x, 82], [x - 1, 120]], { width: 5.5, color: C.brownDark, wobble: 0.5 })),
      ink([[28, 114], [96, 88]], { width: 5.5, color: C.brownDark, wobble: 0.5 }),
      // three singles
      ...[112, 130, 148].map((x) => ink([[x, 82], [x - 1, 120]], { width: 5.5, color: C.brownDark, wobble: 0.5 })),
      // a loop of string through the end
      piece(circle(176, 98, 6), C.brownDark, cutFlat),
      ink([[176, 98], [194, 120], [186, 150]], { width: 3, color: C.cream }),
    ]),
  ],

  // A stripy sock with a darned patch on the heel.
  sock: () => [
    ground(100, 184, 66, 6),
    piece(curve([[56, 18], [128, 18], [130, 100], [176, 134], [180, 170], [136, 178], [92, 150], [56, 110]], 2), C.red),
    ...[34, 62, 90].map((y, i) => piece(poly([[52, y], [132, y], [132, y + 12], [54, y + 12]]), i % 2 ? BUTTERCUP : LACE, { ...cutFlat, shadow: false })),
    piece(rect(52, 10, 82, 18, 5), LACE, cut),
    ...[0, 1, 2, 3, 4].map((i) => ink([[60 + i * 15, 12], [60 + i * 15, 26]], { width: 2, color: 'rgba(120,90,50,0.4)' })),
    // heel and toe in a different wool
    piece(curve([[56, 112], [92, 150], [102, 132], [78, 100]], 2), BUTTERCUP, cutFlat),
    piece(curve([[150, 130], [180, 134], [180, 170], [150, 174]], 2), BUTTERCUP, cutFlat),
    piece(rect(70, 112, 22, 22, 2), C.sky, cutFlat),
    ink([[73, 117], [89, 117], [89, 131], [73, 131], [73, 117]], { width: 1.6, color: C.blueDark }),
    shine([[134, 30], [136, 80]], 0.3),
  ],

  // A bowl of hot broth, with a wooden spoon, steam held still.
  brothBowl: () => [
    ground(100, 182, 74, 7),
    piece(poly([[20, 100], [180, 100], [160, 164], [124, 176], [76, 176], [40, 164]]), C.china),
    piece(poly([[24, 112], [176, 112], [172, 126], [28, 126]]), C.chinaBlue, cutFlat),
    ...[44, 68, 92, 116, 140].map((x) => dot(x, 119, 3, C.china)),
    piece(rect(70, 172, 60, 10, 3), C.chinaBlue, cutFlat),
    piece(ellipse(100, 100, 80, 20), mix(C.china, '#000000', 0.12)),
    piece(ellipse(100, 102, 70, 14), '#c98a3a', cutFlat),
    // bits floating in the broth
    ...[[66, 100, C.carrot], [100, 106, C.leaf], [128, 98, C.carrot], [84, 96, C.leafLight], [112, 97, C.leaf]].map(([x, y, c]) => piece(ellipse(x as number, y as number, 6, 3.5), c as string, cutFlat)),
    // a wooden spoon leaning in the bowl
    piece(band([[110, 100], [148, 46], [164, 22]], 8), C.wood, cut),
    piece(ellipse(100, 98, 14, 8, -30), C.wood, cut),
    // steam
    ...[64, 100, 138].map((x, i) => ink([[x, 76], [x + 8, 62], [x - 6, 48 - i * 4], [x + 6, 34 - i * 4]], { width: 4, color: 'rgba(255,255,255,0.8)', wobble: 0.3 })),
    shine([[32, 134], [46, 160]], 0.4),
  ],

  // A crusty loaf with slashes across the top.
  loaf: () => [
    ground(100, 176, 82, 8),
    piece(curve([[14, 120], [22, 82], [70, 56], [130, 56], [178, 82], [186, 120], [172, 156], [100, 164], [28, 156]], 2), C.bun),
    piece(curve([[24, 128], [100, 118], [176, 128], [168, 154], [100, 160], [32, 154]], 2), C.bunDark, { ...cutFlat, shadow: false, opacity: 0.5 }),
    ...[52, 88, 124].map((x) => piece(curve([[x - 10, 106], [x + 4, 74], [x + 18, 70], [x + 8, 106], [x - 2, 112]], 2), C.honey, cutFlat)),
    ...[[40, 130], [150, 128], [70, 142], [128, 144]].map(([x, y]) => dot(x, y, 2.4, C.bunDark, 0.6)),
    ...[[96, 70], [110, 76], [84, 80]].map(([x, y]) => dot(x, y, 2, C.cream, 0.8)),
    shine([[50, 82], [82, 66]], 0.4),
  ],

  // A candle in a little holder with a ring handle.
  nightlight: () => [
    ground(100, 182, 70, 7),
    piece(ellipse(100, 62, 62, 56), C.candle, { ...cutFlat, shadow: false, opacity: 0.28 }),
    piece(rect(82, 70, 36, 78, 4), C.china),
    ink([[92, 76], [92, 140]], { width: 3, color: 'rgba(120,100,70,0.25)' }),
    piece(curve([[96, 36], [108, 56], [108, 68], [92, 68], [90, 56]], 2), C.flame, cut),
    piece(curve([[99, 50], [104, 60], [103, 66], [96, 66], [95, 60]], 1), C.candle, cutFlat),
    ink([[100, 70], [100, 62]], { width: 2.5, color: C.ink }),
    piece(curve([[104, 100], [116, 112], [108, 128], [112, 134], [100, 130]], 1), C.china, cutFlat),
    // the holder: a dish, a collar, and a ring handle
    piece(ellipse(100, 154, 64, 16), C.brass),
    piece(ellipse(100, 150, 56, 11), C.brassDark, cutFlat),
    piece(rect(74, 140, 52, 12, 3), C.brass, cut),
    ink(ellipse(168, 150, 20, 18), { width: 7, color: C.brass }),
    piece(poly([[46, 158], [154, 158], [140, 172], [60, 172]]), C.brass, cut),
    shine([[58, 152], [76, 158]], 0.5),
  ],

  // A small red goblin cap: a clue!
  redCap: () => [
    ground(100, 180, 66, 6),
    // a crumpled pointed cap flopping to one side
    piece(curve([[34, 150], [44, 110], [80, 70], [126, 40], [168, 24], [182, 40], [160, 62], [152, 100], [166, 150]], 2), CAP_RED),
    piece(curve([[44, 146], [60, 112], [94, 78], [130, 54], [152, 44], [130, 84], [110, 120], [100, 150]], 2), mix(CAP_RED, '#000000', 0.18), { ...cutFlat, shadow: false, opacity: 0.45 }),
    ink([[70, 110], [96, 96]], { width: 2, color: 'rgba(60,10,10,0.4)' }),
    ink([[104, 80], [126, 82]], { width: 2, color: 'rgba(60,10,10,0.4)' }),
    // a turned-up brim
    piece(curve([[24, 154], [30, 134], [100, 128], [176, 134], [180, 156], [100, 168]], 2), mix(CAP_RED, '#000000', 0.25)),
    ...[44, 70, 96, 122, 148].map((x) => ink([[x, 138], [x + 2, 160]], { width: 2, color: 'rgba(255,200,180,0.4)' })),
    // a tiny bobble on the tip
    piece(circle(180, 28, 9), LACE, cut),
    shine([[58, 126], [76, 98]], 0.35),
  ],

  // A brass shoe buckle on a strap of leather.
  shoeBuckle: () => [
    ground(100, 178, 76, 7),
    piece(rect(8, 76, 184, 46, 6), LEATHER),
    ...[22, 40, 58].map((x) => ink([[x, 82], [x, 116]], { width: 2, color: 'rgba(240,220,170,0.55)', wobble: 0.2 })),
    ...[150, 168, 184].map((x) => piece(circle(x, 99, 4), LEATHER_DARK, cutFlat)),
    ink([[12, 84], [188, 84]], { width: 2, color: 'rgba(240,220,170,0.6)', wobble: 0.3 }),
    // the buckle frame
    piece(rect(70, 52, 70, 94, 10), C.brass),
    piece(rect(82, 64, 46, 70, 6), LEATHER, cutFlat),
    piece(rect(82, 64, 46, 70, 6), 'rgba(0,0,0,0.12)', cutFlat),
    // the strap passes through, with the prong over it
    piece(rect(82, 82, 46, 34, 2), mix(LEATHER, '#ffffff', 0.12), cutFlat),
    piece(band([[104, 52], [106, 104]], 8), C.brassDark, cut),
    piece(circle(106, 104, 6), C.brassDark, cutFlat),
    shine([[74, 58], [74, 100]], 0.5),
    shine([[132, 142], [118, 142]], 0.25),
  ],
};

export const NAMES_L11: Record<string, string> = {
  bootLace: 'A long bootlace',
  tallyStick: 'A tally stick',
  sock: 'A stripy sock',
  brothBowl: 'A bowl of broth',
  loaf: 'A crusty loaf',
  nightlight: 'A bedtime candle',
  redCap: 'A little red cap',
  shoeBuckle: 'A shiny shoe buckle',
};

// The Shoe itself, toe to the left, filling the seal's middle.
export const EMBLEM_L11: Draw = () => [
  ground(100, 172, 88, 7),
  bootHouse(8, 168, 0.3),
];
