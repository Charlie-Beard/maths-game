/**
 * Keepsakes for land 14, the Land of the Red Goblins: one per chapter (ids from curriculum.ts),
 * their names (read aloud in the Treasure Room), and the emblem in the
 * middle of the land's seal (a goblin cap with its bell). Drawn in a
 * 200 × 200 box with keepsake-kit.ts.
 */
import { C } from './palette';
import { band, circle, curve, dot, ellipse, ink, piece, poly, rect, type Node } from './paper';
import { glint, ground, shine } from './props';
import { at, cut, cutFlat, type Draw } from './keepsake-kit';

// Local colours: the goblins' reds and browns, and the glow of the caves.
const SACK = '#b8946a';
const SACK_DARK = '#8f6d46';
const CAP_RED = '#b82a38';
const CAP_DARK = '#7e1c28';
const CAP_LIGHT = '#d4505a';
const SOUP = '#c4642e';
const WORM = '#b6f08a';
const WORM_GLOW = '#e4ffb0';

/** A pile of gold coins in rows, bigger at the bottom. `n` rows high. */
function coinPile(cx: number, baseY: number, rows: number, coin = 17): Node[] {
  const out: Node[] = [];
  for (let row = 0; row < rows; row++) {
    const count = rows - row + 1;
    const y = baseY - row * (coin * 0.62);
    for (let k = 0; k < count; k++) {
      const x = cx + (k - (count - 1) / 2) * (coin * 1.7);
      out.push(piece(ellipse(x, y, coin, coin * 0.62), (k + row) % 2 ? C.gold : C.goldLight, cut));
      out.push(piece(ellipse(x, y - 1, coin * 0.55, coin * 0.32), C.brassDark, { ...cutFlat, shadow: false, opacity: 0.5 }));
    }
  }
  return out;
}

const goldSack: Draw = () => [
  ground(100, 182, 70, 9),
  // a few coins spilled in front
  piece(ellipse(54, 176, 15, 8, -10), C.gold, cut),
  piece(ellipse(150, 178, 14, 8, 12), C.goldLight, cut),
  piece(ellipse(132, 184, 12, 7, -6), C.gold, cut),
  // the sack: a lumpy body, a tied neck and a ruffled top
  piece(curve([[56, 176], [36, 138], [46, 100], [82, 78], [118, 78], [154, 100], [164, 138], [144, 176], [100, 184]], 2), SACK),
  piece(curve([[70, 76], [58, 46], [80, 34], [100, 44], [120, 34], [142, 46], [130, 76]], 2), SACK_DARK),
  piece(curve([[76, 74], [124, 74], [128, 88], [72, 88]], 1), '#7a5a38', cutFlat),
  ink([[74, 82], [100, 90], [126, 82]], { width: 4, color: C.sand }),
  ink([[120, 84], [134, 104]], { width: 3.4, color: C.sand }),
  ink([[80, 84], [66, 106]], { width: 3.4, color: C.sand }),
  // a gold coin on the front, and gold winking from the top
  piece(circle(100, 130, 26), C.gold, cut),
  piece(circle(100, 130, 18), C.goldLight, cutFlat),
  ink([[92, 130], [100, 120], [108, 130], [100, 140], [92, 130]], { width: 3, color: C.brassDark }),
  piece(ellipse(90, 40, 14, 7, -15), C.gold, cut),
  piece(ellipse(112, 42, 12, 6, 14), C.goldLight, cut),
  // patches and stitches, because goblins mend things badly
  piece(poly([[52, 120], [72, 114], [76, 138], [56, 144]]), '#5d7c78', cut),
  ink([[54, 124], [60, 122], [66, 120], [72, 118]], { width: 1.8, color: C.ink, opacity: 0.6 }),
  glint(150, 70, 0.8, C.goldLight),
  shine([[60, 110], [66, 96], [72, 100], [66, 114]], 0.3),
];

const goblinGold: Draw = () => [
  ground(100, 176, 82, 9),
  ...coinPile(100, 164, 4, 19),
  // one coin standing on its edge, leaning on the heap
  piece(ellipse(150, 124, 8, 24, 14), C.gold, cut),
  piece(ellipse(148, 124, 3.6, 18, 14), C.brassDark, { ...cutFlat, shadow: false, opacity: 0.6 }),
  // a few loose ones
  piece(ellipse(28, 178, 13, 7), C.goldLight, cut),
  piece(ellipse(172, 180, 12, 7), C.gold, cut),
  glint(70, 82, 1, C.white),
  glint(138, 62, 0.8, C.goldLight),
  glint(166, 150, 0.6, C.white),
  // a gem winking at the top
  piece(poly([[92, 70], [108, 70], [114, 80], [100, 94], [86, 80]]), '#e0485a', cut),
  piece(poly([[92, 70], [100, 80], [108, 70]]), '#f08a94', cutFlat),
];

const goblinJug: Draw = () => [
  ground(100, 184, 62, 8),
  // steam
  ink([[78, 38], [70, 26], [80, 14]], { width: 3.4, color: C.steelDark, opacity: 0.45 }),
  ink([[100, 34], [108, 22], [98, 10]], { width: 3.4, color: C.steelDark, opacity: 0.45 }),
  ink([[122, 38], [114, 26], [124, 14]], { width: 3.4, color: C.steelDark, opacity: 0.45 }),
  // the handle
  ink([[142, 76], [176, 84], [178, 128], [146, 140]], { width: 12, color: '#8f4a2c' }),
  // the fat belly and neck
  piece(curve([[78, 52], [58, 80], [40, 124], [52, 168], [100, 184], [148, 168], [160, 124], [142, 80], [122, 52]], 2), '#a85a34'),
  piece(ellipse(100, 52, 24, 9), '#7a3a22', cut),
  piece(ellipse(100, 54, 18, 5), SOUP, cutFlat),
  // litre marks down the side, and a goblin-scrawl label
  ...[88, 108, 128, 148].map((y, i) => ink([[56 + i * 0.4, y], [i % 2 ? 72 : 80, y]], { width: 3.4, color: C.cream })),
  piece(curve([[92, 98], [132, 96], [134, 140], [94, 142]], 1), C.cream, { edge: 'cut', fibre: false }),
  ink([[100, 114], [108, 106], [114, 118], [122, 108]], { width: 3, color: '#8a2a22' }),
  ink([[102, 132], [124, 130]], { width: 3, color: '#8a2a22' }),
  piece(ellipse(60, 120, 6, 24, 8), C.white, { ...cutFlat, shadow: false, opacity: 0.25 }),
  // a dripping splash of soup
  piece(curve([[104, 62], [112, 62], [114, 80], [108, 86], [102, 78]], 2), SOUP, cutFlat),
];

const thermometer: Draw = () => [
  ground(100, 184, 54, 7),
  // a wooden board behind
  piece(rect(60, 14, 80, 168, 8), C.wood),
  piece(rect(66, 20, 68, 156, 5), C.sand, cutFlat),
  // hanging hole
  piece(circle(100, 28, 4.5), C.barkDark, { edge: 'clean', shadow: false }),
  // the glass tube and bulb
  piece(rect(88, 44, 24, 112, 12), C.glass, cut),
  piece(circle(100, 156, 22), C.glass, cut),
  // red liquid up to the middle
  piece(rect(95, 92, 10, 66, 5), C.toadRed, { edge: 'clean', shadow: false }),
  piece(circle(100, 156, 15), C.toadRed, { edge: 'clean', shadow: false }),
  dot(95, 150, 3.4, C.white, 0.6),
  // ticks on both sides (a long mark every fifth)
  ...Array.from({ length: 12 }, (_, i) => {
    const y = 56 + i * 8.4;
    const long = i % 5 === 0;
    return ink([[long ? 72 : 78, y], [86, y]], { width: long ? 2.8 : 1.8, color: C.ink, opacity: 0.8 });
  }),
  ...Array.from({ length: 12 }, (_, i) => {
    const y = 56 + i * 8.4;
    const long = i % 5 === 0;
    return ink([[114, y], [long ? 128 : 122, y]], { width: long ? 2.8 : 1.8, color: C.ink, opacity: 0.8 });
  }),
  // a little flame for hot and an ice crystal for cold
  piece(poly([[148, 70], [156, 50], [162, 60], [166, 44], [176, 66], [170, 84], [154, 84]]), C.orange, cut),
  piece(poly([[158, 84], [160, 68], [166, 76], [170, 84]]), C.goldLight, cutFlat),
  piece(poly([[32, 130], [38, 112], [44, 130], [38, 148]]), C.ice, cut),
  piece(poly([[26, 130], [50, 130], [38, 124]]), C.iceDark, cutFlat),
  shine([[92, 52], [96, 50], [96, 120], [92, 120]], 0.5),
];

const goblinScales: Draw = () => {
  const lx = 44;
  const rx = 156;
  const ly = 82;
  const ry = 62;
  const pan = (px: number, py: number): Node[] => [
    ink([[px, py], [px - 24, py + 56]], { width: 2.4, color: C.brassDark }),
    ink([[px, py], [px + 24, py + 56]], { width: 2.4, color: C.brassDark }),
    piece(curve([[px - 32, py + 56], [px - 20, py + 72], [px + 20, py + 72], [px + 32, py + 56]], 2), C.brass),
    piece(ellipse(px, py + 56, 32, 5), C.goldLight, cutFlat),
  ];
  return [
    ground(100, 186, 52, 7),
    piece(curve([[56, 186], [74, 168], [90, 160], [110, 160], [126, 168], [144, 186]], 1), C.brassDark),
    piece(rect(92, 36, 16, 130, 4), C.brass, cut),
    ...pan(lx, ly),
    ...pan(rx, ry),
    piece(band([[lx, ly - 4], [100, 40], [rx, ry - 4]], 10), C.gold, cut),
    piece(circle(100, 40, 12), C.goldLight, cut),
    piece(circle(100, 40, 5), C.brassDark, { edge: 'clean', shadow: false }),
    // coins in the low pan
    piece(ellipse(lx - 10, ly + 52, 12, 6), C.gold, cut),
    piece(ellipse(lx + 12, ly + 50, 12, 6), C.goldLight, cut),
    piece(ellipse(lx, ly + 44, 12, 6), C.gold, cut),
    // a feather's worth in the high pan
    piece(ellipse(rx, ry + 52, 9, 5), C.goldLight, cut),
    glint(36, 52, 0.7, C.white),
    shine([[96, 50], [99, 48], [99, 150], [96, 150]], 0.45),
  ];
};

const glowWorm: Draw = () => [
  ground(100, 184, 56, 8),
  // the glow, soft and still
  piece(circle(100, 112, 78), WORM, { ...cutFlat, shadow: false, opacity: 0.16 }),
  piece(circle(100, 112, 58), WORM, { ...cutFlat, shadow: false, opacity: 0.2 }),
  // the jar
  piece(curve([[62, 56], [54, 76], [48, 120], [56, 168], [100, 178], [144, 168], [152, 120], [146, 76], [138, 56]], 2), C.glass, { ...cut, opacity: 0.85 }),
  piece(rect(60, 36, 80, 24, 5), C.steel, cut),
  ...[70, 84, 98, 112, 126].map((x) => ink([[x, 40], [x, 56]], { width: 2, color: C.steelDark, opacity: 0.6 })),
  // a twig and a leaf inside
  ink([[72, 168], [86, 130], [112, 110]], { width: 5, color: C.twig }),
  piece(curve([[120, 150], [136, 134], [142, 156], [130, 164]], 1), C.leaf, cutFlat),
  // the worm: a curl of glowing, plump segments with a tiny face
  ...[[78, 150], [84, 138], [96, 130], [110, 130], [120, 120], [118, 106], [108, 98], [96, 96]].map(([x, y], i) =>
    piece(circle(x, y, 10 - i * 0.2), i === 7 ? WORM_GLOW : WORM, cutFlat),
  ),
  piece(circle(104, 96, 2), C.ink, { edge: 'clean', shadow: false }),
  piece(circle(96, 92, 2), C.ink, { edge: 'clean', shadow: false }),
  ink([[96, 100], [101, 102], [104, 99]], { width: 1.6, color: C.ink }),
  shine([[62, 70], [66, 66], [64, 140], [60, 140]], 0.5),
  glint(40, 76, 0.8, WORM_GLOW),
  glint(164, 120, 0.7, WORM_GLOW),
];

const saucepanLid: Draw = () => [
  ground(100, 178, 76, 9),
  // the lid, a bit tilted
  piece(ellipse(100, 112, 78, 66, -6), C.tin),
  piece(ellipse(100, 112, 78, 66, -6), C.tinDark, { ...cutFlat, shadow: false, opacity: 0.25 }),
  piece(ellipse(100, 108, 62, 52, -6), C.tin, cutFlat),
  ink([[58, 128], [64, 138], [100, 150], [140, 142]], { width: 3, color: C.tinDark, opacity: 0.7 }),
  // a dent: a crumpled patch with fold lines
  piece(curve([[116, 70], [148, 78], [152, 104], [130, 118], [112, 98]], 2), C.tinDark, { ...cutFlat, shadow: false, opacity: 0.55 }),
  piece(curve([[122, 76], [142, 84], [144, 100], [128, 108]], 1), C.steelLight, { ...cutFlat, shadow: false, opacity: 0.7 }),
  ink([[118, 80], [136, 96], [132, 112]], { width: 2.4, color: C.steelDark }),
  ink([[132, 76], [142, 92]], { width: 2, color: C.steelDark }),
  // rivets and the knob
  ...[[46, 112], [154, 112], [100, 164]].map(([x, y]) => piece(circle(x, y, 3.4), C.steelDark, { edge: 'clean', shadow: false })),
  piece(rect(88, 60, 24, 14, 5), C.steelDark, cut),
  piece(circle(100, 52, 17), C.red, cut),
  piece(circle(100, 52, 9), CAP_LIGHT, cutFlat),
  shine([[58, 92], [66, 76], [78, 66], [84, 72], [72, 84], [64, 98]], 0.55),
  glint(168, 62, 0.7, C.white),
  // clink, clank
  ink([[22, 70], [14, 62]], { width: 3, color: C.steelDark, opacity: 0.7 }),
  ink([[20, 84], [10, 82]], { width: 3, color: C.steelDark, opacity: 0.7 }),
];

/** The red goblin cap: a floppy tail, a band, a patch and a golden bell. */
const goblinHat: Draw = () => [
  ground(100, 178, 76, 8),
  piece(curve([[40, 164], [46, 116], [64, 62], [96, 24], [136, 12], [172, 28], [188, 66], [190, 112], [176, 100], [158, 66], [132, 54], [128, 108], [150, 164]], 2), CAP_RED),
  piece(curve([[56, 130], [62, 92], [80, 54], [104, 32], [92, 66], [86, 110]], 2), CAP_LIGHT, { ...cutFlat, shadow: false, opacity: 0.5 }),
  // the turned-up band
  piece(curve([[28, 170], [34, 146], [96, 134], [158, 146], [166, 172], [96, 160]], 2), CAP_DARK),
  ink([[44, 152], [96, 142], [148, 152]], { width: 2.4, color: CAP_LIGHT, opacity: 0.6 }),
  // patch with stitches
  piece(poly([[84, 66], [108, 62], [112, 86], [88, 90]]), '#b98a4c', cut),
  ink([[86, 70], [92, 69], [98, 68], [104, 67]], { width: 1.8, color: C.ink, opacity: 0.7 }),
  ink([[88, 86], [94, 85], [100, 85], [108, 83]], { width: 1.8, color: C.ink, opacity: 0.7 }),
  // the bell on the end of the tail
  ink([[188, 104], [190, 118]], { width: 3, color: C.brassDark }),
  piece(circle(190, 130, 15), C.gold, cut),
  piece(ellipse(190, 138, 6.5, 3), C.brassDark, { edge: 'clean', shadow: false }),
  dot(184, 124, 3.4, C.goldLight),
  glint(24, 80, 0.7, C.goldLight),
];

export const KEEPSAKES_L14: Record<string, Draw> = {
  goldSack,
  goblinGold,
  goblinJug,
  thermometer,
  goblinScales,
  glowWorm,
  saucepanLid,
  goblinHat,
};

export const NAMES_L14: Record<string, string> = {
  goldSack: 'A sack of gold',
  goblinGold: 'Goblin gold',
  goblinJug: 'A jug of goblin soup',
  thermometer: 'A cave thermometer',
  goblinScales: 'The goblins’ scales',
  glowWorm: 'A glow-worm in a jar',
  saucepanLid: 'The Saucepan Man’s lid',
  goblinHat: 'A red goblin cap',
};

/** The land's seal emblem: the goblin cap, a little bigger. */
export const EMBLEM_L14: Draw = () => [at(-6, -8, 1.06, goblinHat())];

