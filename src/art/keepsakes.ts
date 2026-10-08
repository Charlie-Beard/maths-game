/**
 * Keepsakes and land seals.
 *
 * Every chapter gives a keepsake from its land (curriculum.ts `keepsake`),
 * shown in the Treasure Room: a small 200 × 200 paper illustration, themed
 * to the chapter. Where the keepsake is a counting prop (toffee, pop
 * biscuit, saucepan …) it reuses the prop's drawing at keepsake scale with
 * its extra detail turned on, so the thing he counted is the thing he wins.
 *
 * Each land finale gives a land seal (240 × 240): a big round wax-and-paper
 * seal in the land's colour with an emblem in the middle, hung on the tree
 * on the map.
 *
 * Lands 11–14 keep their keepsakes, names and seal emblem in their own
 * files (keepsakes-l11.ts …), drawn with the shared keepsake-kit.ts.
 */
import { LANDS } from '../core/curriculum';
import { C } from './palette';
import { band, circle, curve, dot, ellipse, group, ink, piece, poly, rect, svg, type Node, type Pt } from './paper';
import { flat, glint, ground, propNodes, scallop, shine, starPts } from './props';
import { at, big, bigKey, cut, cutFlat, grass, mix, snowLip, text, type Draw } from './keepsake-kit';
import { EMBLEM_L11, KEEPSAKES_L11, NAMES_L11 } from './keepsakes-l11';
import { EMBLEM_L12, KEEPSAKES_L12, NAMES_L12 } from './keepsakes-l12';
import { EMBLEM_L13, KEEPSAKES_L13, NAMES_L13 } from './keepsakes-l13';
import { EMBLEM_L14, KEEPSAKES_L14, NAMES_L14 } from './keepsakes-l14';

// ---------------------------------------------------------------------------
// Land 1: the Enchanted Wood
// ---------------------------------------------------------------------------

const L1: Record<string, Draw> = {
  toadstool: () => [
    ground(100, 176, 86, 10),
    big('toadstool', 1.35, 84, 96),
    at(124, 110, 0.6, propNodes('toadstool')),
    ...grass([[30, 178], [150, 180], [176, 174]]),
  ],
  leaf: () => [
    ground(100, 176, 60, 8),
    piece(band([[60, 172], [76, 150], [86, 136]], 7), C.leafDark, cut),
    piece(curve([[86, 140], [54, 112], [56, 62], [100, 28], [168, 18], [160, 82], [130, 126]], 2), C.leaf),
    ink([[88, 136], [112, 96], [136, 60], [158, 30]], { width: 3.5, color: C.leafLight }),
    ink([[104, 108], [76, 94]], { width: 2.5, color: C.leafLight }),
    ink([[120, 84], [90, 64]], { width: 2.5, color: C.leafLight }),
    ink([[112, 96], [146, 100]], { width: 2.5, color: C.leafLight }),
    ink([[130, 70], [156, 70]], { width: 2.5, color: C.leafLight }),
    // the whisper: wisha-wisha
    ink([[26, 70], [36, 60], [30, 50], [40, 40]], { width: 3, color: C.greenDark, opacity: 0.7 }),
    ink([[176, 120], [168, 130], [178, 140], [170, 150]], { width: 3, color: C.greenDark, opacity: 0.7 }),
  ],
  pixieCap: () => [
    ground(98, 172, 70, 8),
    piece(curve([[44, 150], [64, 96], [104, 48], [150, 22], [178, 36], [160, 52], [134, 70], [146, 150]], 2), C.leafDark),
    flat(curve([[70, 120], [100, 76], [130, 52], [136, 60], [108, 90], [84, 126]], 2), C.leaf, 0.6),
    piece(curve([[34, 152], [96, 136], [160, 150], [154, 168], [96, 158], [40, 170]], 2), C.toadRed),
    piece(circle(178, 44, 11), C.ribbon, cut),
    ink([[172, 48], [184, 48]], { width: 2.5, color: C.brassDark }),
    dot(178, 50, 2.5, C.brassDark),
  ],
  peg: () => [
    ink([[0, 46], [60, 54], [140, 54], [200, 44]], { width: 4, color: C.tan }),
    piece(curve([[76, 70], [124, 70], [124, 132], [150, 142], [154, 168], [104, 172], [78, 150]], 1), C.sky),
    flat(curve([[118, 136], [150, 144], [154, 168], [130, 170]], 1), C.white),
    flat(rect(76, 74, 48, 12), C.white),
    flat(rect(77, 100, 47, 8), C.blue),
    piece(rect(88, 26, 12, 70, 5), C.sand),
    piece(rect(102, 26, 12, 70, 5), C.sand),
    ink(circle(101, 48, 7), { width: 3, color: C.steelDark, closed: true }),
  ],
  nightcap: () => [
    ground(92, 174, 70, 8),
    piece(curve([[30, 156], [56, 96], [100, 60], [150, 58], [178, 92], [176, 130], [164, 130], [156, 98], [128, 92], [148, 158]], 2), C.sky),
    ink([[66, 98], [118, 150]], { width: 7, color: C.white }),
    ink([[96, 72], [140, 120]], { width: 7, color: C.white }),
    ink([[138, 64], [158, 108]], { width: 7, color: C.white }),
    piece(rect(24, 146, 132, 24, 10), C.white, { fibre: C.snowShade }),
    piece(scallop(172, 138, 14, 2, 8), C.white, { fibre: C.snowShade }),
    text(40, 60, 'z', 22, C.blueDark, -10),
    text(56, 40, 'z', 28, C.blueDark, -10),
    text(78, 22, 'Z', 32, C.blueDark, -10),
  ],
  saucepan: () => [
    big('saucepan', 1.45, 104, 108),
    ink([[70, 54], [64, 40], [72, 28]], { width: 3, color: C.steelDark, opacity: 0.5 }),
    ink([[94, 50], [88, 36], [96, 22]], { width: 3, color: C.steelDark, opacity: 0.5 }),
    glint(170, 54, 0.9, C.ribbon),
    glint(28, 70, 0.7, C.ribbon),
  ],
  popBiscuit: () => [at(6, 76, 0.9, propNodes('popBiscuit', true)), big('popBiscuit', 1.15, 124, 74), piece(curve([[60, 30], [66, 42], [62, 48], [56, 42]], 2), C.goldLight, cut)],
  moonLamp: () => [
    ground(100, 182, 52, 7),
    piece(curve([[64, 180], [72, 160], [128, 160], [136, 180]], 1), C.bark),
    piece(rect(94, 128, 12, 36, 3), C.barkLight),
    flat(circle(100, 82, 66), C.candle, 0.35),
    piece(circle(100, 82, 50), C.goldLight),
    flat(circle(112, 70, 30), C.candle, 0.7),
    ink([[78, 76], [84, 80], [90, 76]], { width: 3, color: C.brown }),
    ink([[110, 76], [116, 80], [122, 76]], { width: 3, color: C.brown }),
    ink([[84, 98], [100, 108], [116, 98]], { width: 3.5, color: C.brown }),
    flat(ellipse(76, 92, 7, 5), C.pink, 0.7),
    flat(ellipse(124, 92, 7, 5), C.pink, 0.7),
  ],
};

// ---------------------------------------------------------------------------
// Land 2: Topsy-Turvy
// ---------------------------------------------------------------------------

const boot = (fill: string, lace: string): Node[] => [
  piece(curve([[62, 30], [112, 30], [114, 110], [168, 124], [176, 160], [60, 160]], 1), fill),
  piece(rect(56, 152, 124, 16, 6), C.hatBlack),
  ...[56, 76, 96].map((y) => ink([[66, y], [106, y + 6]], { width: 4, color: lace })),
  flat(rect(60, 30, 54, 12), mix(fill, '#000000', 0.25)),
];

const L2: Record<string, Draw> = {
  upsideHat: () => [
    ground(100, 180, 54, 7),
    ink([[84, 60], [76, 26]], { width: 4, color: C.leafDark }),
    ink([[104, 58], [108, 18]], { width: 4, color: C.leafDark }),
    ink([[122, 60], [138, 32]], { width: 4, color: C.leafDark }),
    piece(scallop(76, 24, 12, 3, 6), C.topsyPink, cut),
    piece(scallop(108, 16, 13, 3, 6), C.lemon, cut),
    piece(scallop(140, 30, 12, 3, 6), C.topsyGreen, cut),
    dot(76, 24, 4, C.ribbon),
    dot(108, 16, 4, C.toadRed),
    dot(140, 30, 4, C.ribbon),
    piece(curve([[66, 66], [134, 66], [132, 176], [68, 176]], 1), C.hatBlack),
    piece(ellipse(100, 64, 74, 14), C.hatBlack),
    flat(ellipse(100, 62, 52, 7), '#171418'),
    flat(rect(67, 82, 66, 16), C.topsyPink),
  ],
  shoeHat: () => [
    ground(110, 172, 72, 8),
    at(0, 0, 1, boot(C.topsyPink, C.topsyGreen)),
    piece(curve([[44, 24], [94, 24], [92, 58], [46, 58]], 1), C.topsyGreen),
    piece(ellipse(70, 58, 38, 9), C.topsyGreen),
    flat(rect(45, 44, 48, 8), C.lemon),
  ],
  teacup: () => [
    big('teacup', 1.45, 100, 112),
    piece(curve([[86, 52], [92, 40], [98, 52], [92, 58]], 2), C.caramel, cut),
    piece(curve([[110, 34], [115, 24], [120, 34], [115, 39]], 2), C.caramel, cut),
    piece(curve([[96, 16], [100, 8], [104, 16], [100, 20]], 2), C.caramel, cut),
    ink([[60, 40], [64, 28]], { width: 3, color: C.topsyGreen }),
    ink([[140, 44], [136, 32]], { width: 3, color: C.topsyGreen }),
  ],
  bun: () => [
    ground(100, 166, 76, 10),
    piece(curve([[24, 160], [28, 104], [100, 64], [172, 104], [176, 160]], 2), C.bun),
    flat(curve([[46, 104], [100, 76], [154, 104], [150, 112], [100, 86], [50, 112]], 2), C.goldLight, 0.6),
    ink([[100, 72], [100, 158]], { width: 7, color: C.cream }),
    ink([[36, 124], [164, 124]], { width: 7, color: C.cream }),
    ink([[60, 54], [52, 38], [62, 26]], { width: 3, color: C.stone, opacity: 0.6 }),
    ink([[140, 54], [148, 38], [138, 26]], { width: 3, color: C.stone, opacity: 0.6 }),
  ],
  window: () => [
    group({ transform: 'rotate(-12 100 100)' }, [
      piece(rect(36, 30, 128, 136, 6), C.wood),
      piece(rect(48, 42, 104, 112, 3), C.sky, cutFlat),
      flat(poly([[48, 42], [80, 42], [56, 130], [48, 150]]), C.topsyPink),
      flat(poly([[152, 42], [120, 42], [144, 130], [152, 150]]), C.topsyPink),
      piece(rect(95, 42, 10, 112), C.wood, cut),
      piece(rect(48, 92, 104, 10), C.wood, cut),
      piece(rect(28, 160, 144, 14, 4), C.barkLight),
      shine([[108, 50], [140, 50], [112, 86]], 0.5),
    ]),
  ],
  upsideBoot: () => [ground(100, 180, 60, 7), group({ transform: 'rotate(180 110 100)' }, boot(C.topsyGreen, C.topsyPink)), glint(150, 160, 0.7, C.topsyPink)],
  teapot: () => [
    ground(98, 174, 70, 9),
    piece(band([[54, 120], [30, 104], [18, 72]], 14), C.topsyPink),
    ink(ellipse(160, 118, 18, 24), { width: 10, color: C.topsyPink, closed: true }),
    piece(curve([[44, 130], [52, 82], [98, 70], [146, 82], [154, 130], [130, 168], [68, 168]], 2), C.topsyPink),
    piece(ellipse(98, 76, 34, 9), C.topsyGreen),
    piece(circle(98, 62, 9), C.topsyGreen, cut),
    ...[[74, 110], [100, 130], [124, 106], [86, 150], [118, 150]].map(([x, y]) => dot(x, y, 6, C.topsyGreen)),
    piece(curve([[16, 52], [22, 40], [28, 52], [22, 58]], 2), C.caramel, cut),
    piece(curve([[24, 30], [28, 22], [32, 30], [28, 34]], 2), C.caramel, cut),
  ],
  spinningTop: () => [
    ground(100, 182, 40, 6),
    piece(rect(92, 18, 16, 36, 5), C.wood),
    piece(curve([[34, 84], [64, 54], [136, 54], [166, 84], [120, 150], [100, 178], [80, 150]], 2), C.topsyPink),
    flat(curve([[38, 82], [162, 82], [156, 96], [44, 96]], 1), C.lemon),
    flat(curve([[58, 116], [142, 116], [132, 128], [68, 128]], 1), C.topsyGreen),
    ink([[18, 70], [10, 96], [18, 122]], { width: 3, color: C.purple, opacity: 0.6 }),
    ink([[182, 70], [190, 96], [182, 122]], { width: 3, color: C.purple, opacity: 0.6 }),
  ],
};

// ---------------------------------------------------------------------------
// Land 3: Goodies
// ---------------------------------------------------------------------------

const L3: Record<string, Draw> = {
  toffee: () => [
    at(110, 22, 0.55, propNodes('toffee'), 20),
    big('toffee', 1.4, 94, 112),
    glint(40, 50, 0.9, C.ribbon),
    glint(168, 140, 0.7, C.ribbon),
    text(46, 182, 'POP!', 22, C.toadRed, -8),
  ],
  lemonade: () => [
    ground(96, 178, 64, 8),
    ink(ellipse(150, 108, 18, 30), { width: 10, color: C.glass, closed: true }),
    piece(curve([[44, 44], [148, 44], [150, 170], [42, 170]], 1), C.glass),
    flat(curve([[46, 80], [146, 80], [148, 168], [44, 168]], 1), C.lemon),
    piece(poly([[36, 34], [52, 44], [52, 52]]), C.glass, cutFlat),
    dot(70, 120, 4, C.white, 0.8),
    dot(110, 140, 3, C.white, 0.8),
    dot(92, 100, 3.5, C.white, 0.8),
    shine([[56, 54], [64, 54], [64, 150], [56, 150]], 0.5),
    piece(band([[110, 70], [124, 20], [140, 12]], 6), C.topsyPink, cut),
    piece(circle(156, 44, 20), C.lemon),
    ink(circle(156, 44, 14), { width: 2, color: C.white, closed: true }),
    ...[0, 1, 2].map((i) => ink([[156 - 14 * Math.cos(i), 44 - 14 * Math.sin(i * 2.1)], [156 + 14 * Math.cos(i), 44 + 14 * Math.sin(i * 2.1)]], { width: 2, color: C.white })),
  ],
  biscuitTin: () => [
    ground(100, 176, 76, 9),
    piece(ellipse(140, 70, 54, 16, -28), mix(C.teal, '#000000', 0.15)),
    flat(ellipse(140, 70, 44, 10, -28), C.ribbon, 0.8),
    at(54, 50, 0.55, propNodes('popBiscuit')),
    at(94, 40, 0.55, propNodes('popBiscuit')),
    piece(rect(28, 86, 144, 82, 12), C.teal),
    flat(rect(28, 98, 144, 10), C.ribbon),
    flat(rect(28, 148, 144, 8), C.ribbon),
    ...[52, 84, 116, 148].map((x) => dot(x, 128, 6, C.sherbet)),
    piece(ellipse(100, 86, 74, 10), mix(C.teal, '#000000', 0.25)),
  ],
  googleBun: () => [big('googleBun', 1.5, 100, 104), ...[[30, 40], [168, 52], [160, 24], [40, 160]].map(([x, y]) => glint(x, y, 0.6, C.sherbet))],
  jelly: () => [
    big('jelly', 1.45, 100, 102),
    ink([[22, 70], [14, 84], [22, 98]], { width: 3, color: C.raspberryDark, opacity: 0.6 }),
    ink([[178, 70], [186, 84], [178, 98]], { width: 3, color: C.raspberryDark, opacity: 0.6 }),
  ],
  sugarMouse: () => [
    ground(104, 162, 72, 8),
    ink([[44, 146], [22, 140], [16, 118], [30, 104], [42, 114]], { width: 3, color: C.ink }),
    piece(curve([[40, 150], [52, 106], [108, 86], [156, 112], [180, 146], [150, 156], [60, 156]], 2), C.sherbet),
    piece(circle(134, 96, 14), C.sherbet),
    flat(circle(134, 96, 7), C.raspberry, 0.8),
    flat(curve([[70, 116], [100, 100], [110, 106], [80, 124]], 2), C.white, 0.5),
    dot(152, 120, 3.5, C.ink),
    piece(circle(181, 142, 5), C.raspberry, cut),
    ink([[170, 136], [190, 128]], { width: 1.8, color: C.ink, opacity: 0.6 }),
    ink([[170, 142], [192, 142]], { width: 1.8, color: C.ink, opacity: 0.6 }),
  ],
  lolly: () => [
    ground(100, 186, 28, 5),
    piece(rect(94, 104, 12, 82, 4), C.china),
    piece(circle(100, 78, 58), C.raspberry),
    ink([[100, 78], [108, 70], [114, 82], [100, 94], [84, 80], [96, 56], [124, 62], [130, 92], [104, 112], [72, 100], [66, 64], [96, 34], [138, 42], [154, 82]], { width: 9, color: C.white }),
    piece(ellipse(84, 124, 14, 8, 30), C.topsyGreen, cut),
    piece(ellipse(116, 124, 14, 8, -30), C.topsyGreen, cut),
    shine([[62, 50], [74, 36], [78, 40], [66, 56]], 0.5),
  ],
  goblinSpoon: () => [
    ground(100, 180, 70, 7),
    piece(band([[34, 178], [80, 128], [116, 92]], 16), C.wood, { rough: 1.2 }),
    piece(ellipse(140, 66, 38, 30, -40), C.wood),
    flat(ellipse(142, 64, 28, 21, -40), C.barkLight),
    piece(curve([[118, 66], [130, 40], [156, 36], [166, 56], [160, 80], [138, 90]], 2), C.topsyGreen),
    shine([[132, 50], [140, 44], [142, 48], [134, 56]], 0.6),
    ink([[48, 162], [60, 150]], { width: 3, color: C.bark }),
  ],
};

// ---------------------------------------------------------------------------
// Land 4: Dame Snap's School (ink, chalk and ruler-red)
// ---------------------------------------------------------------------------

const L4: Record<string, Draw> = {
  chalk: () => [
    piece(ellipse(100, 120, 84, 50), C.charcoal),
    group({ transform: 'rotate(-18 100 110)' }, [
      piece(rect(40, 96, 110, 22, 8), C.chalk, { fibre: '#ffffff' }),
      flat(ellipse(146, 107, 6, 10), '#d8d6cc'),
    ]),
    group({ transform: 'rotate(10 110 140)' }, [piece(rect(70, 132, 66, 18, 7), C.sherbet)]),
    ...[[160, 80], [170, 92], [156, 96], [176, 74]].map(([x, y]) => dot(x, y, 3, C.chalk, 0.8)),
  ],
  gateKey: () => bigKey(C.charcoal, C.snapInk, true),
  inkwell: () => [
    ground(92, 176, 64, 8),
    piece(curve([[40, 168], [44, 112], [74, 96], [110, 96], [140, 112], [144, 168]], 1), C.snapInk),
    piece(rect(70, 78, 44, 24, 5), C.snapInk),
    flat(curve([[54, 132], [128, 132], [132, 160], [50, 160]], 1), C.blueDark, 0.9),
    shine([[54, 118], [60, 112], [62, 150], [56, 150]], 0.35),
    piece(band([[92, 84], [130, 40], [170, 10]], 4), C.chalk, cut),
    piece(curve([[110, 66], [128, 30], [168, 6], [176, 14], [150, 48], [120, 72]], 2), C.chalk, { fibre: '#ffffff' }),
    ink([[116, 64], [168, 12]], { width: 2.5, color: C.stone }),
  ],
  rulebook: () => [
    ground(100, 178, 72, 8),
    piece(rect(40, 26, 124, 146, 6), C.snapInk),
    piece(rect(40, 26, 20, 146, 4), C.ruler),
    flat(rect(166, 32, 8, 134), C.cream),
    piece(rect(78, 52, 70, 34, 4), C.chalk, cut),
    ink([[88, 64], [138, 64]], { width: 3, color: C.snapInk }),
    ink([[88, 74], [124, 74]], { width: 3, color: C.snapInk }),
    piece(poly([[132, 166], [146, 166], [146, 196], [139, 188], [132, 196]]), C.ruler, cut),
    text(112, 136, '!', 44, C.ruler),
  ],
  blackboard: () => [
    ground(100, 186, 70, 6),
    ink([[56, 150], [40, 186]], { width: 6, color: C.wood }),
    ink([[144, 150], [160, 186]], { width: 6, color: C.wood }),
    piece(rect(20, 30, 160, 120, 6), C.wood),
    piece(rect(30, 40, 140, 100, 3), C.greenDeep, cutFlat),
    text(92, 104, '1 + 1 = 2', 32, C.chalk),
    ink([[136, 120], [146, 130], [164, 108]], { width: 4, color: C.chalk }),
    piece(rect(50, 144, 30, 8, 3), C.chalk, cut),
  ],
  bell: () => [
    ground(100, 180, 56, 7),
    piece(rect(90, 12, 20, 50, 6), C.wood),
    piece(curve([[56, 150], [62, 84], [100, 56], [138, 84], [144, 150], [160, 162], [40, 162]], 2), C.brass),
    flat(curve([[64, 140], [70, 90], [86, 74], [80, 110], [78, 148]], 2), C.goldLight, 0.6),
    piece(circle(100, 168, 10), C.brassDark, cut),
    ink([[30, 110], [22, 100]], { width: 3, color: C.snapInk }),
    ink([[34, 128], [20, 128]], { width: 3, color: C.snapInk }),
    ink([[170, 110], [178, 100]], { width: 3, color: C.snapInk }),
    ink([[166, 128], [180, 128]], { width: 3, color: C.snapInk }),
  ],
  brassKey: () => [
    ...bigKey(C.brass, C.brassDark),
    ink([[48, 66], [64, 30], [86, 30]], { width: 2.5, color: C.toadRed }),
    piece(rect(84, 18, 40, 24, 4), C.cream),
    dot(90, 30, 3, C.toadRed),
    glint(170, 70, 0.9, C.ribbon),
  ],
  snappedRuler: () => [
    ground(100, 168, 82, 8),
    group({ transform: 'rotate(-24 60 110)' }, [
      piece(poly([[10, 96], [100, 96], [92, 104], [104, 112], [96, 124], [10, 124]]), C.ruler),
      ...[20, 32, 44, 56, 68, 80].map((x, i) => ink([[x, 96], [x, i % 2 ? 106 : 112]], { width: 2.5, color: C.chalk })),
    ]),
    group({ transform: 'rotate(20 140 110)' }, [
      piece(poly([[112, 96], [104, 104], [116, 112], [108, 124], [196, 124], [196, 96]]), C.ruler),
      ...[124, 136, 148, 160, 172, 184].map((x, i) => ink([[x, 96], [x, i % 2 ? 106 : 112]], { width: 2.5, color: C.chalk })),
    ]),
    piece(poly([[100, 70], [106, 60], [104, 74]]), C.wood, cutFlat),
    piece(poly([[92, 140], [100, 150], [90, 148]]), C.wood, cutFlat),
    glint(100, 40, 1, C.ribbon),
  ],
};

// ---------------------------------------------------------------------------
// Land 5: Birthdays
// ---------------------------------------------------------------------------

const L5: Record<string, Draw> = {
  partyHat: () => [
    ground(100, 180, 60, 7),
    piece(poly([[100, 26], [154, 168], [46, 168]]), C.raspberry),
    flat(poly([[86, 64], [114, 64], [124, 92], [76, 92]]), C.lemon),
    flat(poly([[66, 118], [134, 118], [144, 146], [56, 146]]), C.lemon),
    ...[[100, 50], [88, 106], [114, 104], [76, 160], [124, 160]].map(([x, y]) => dot(x, y, 4.5, C.giftBlue)),
    piece(scallop(100, 166, 56, 4, 9).map(([x, y]) => [x, 166 + (y - 166) * 0.18] as Pt), C.ribbon, cut),
    piece(scallop(100, 24, 16, 4, 8), C.ribbon, cut),
  ],
  candle: () => [
    big('candle', 1.45, 100, 96),
    at(40, 108, 0.45, propNodes('candle')),
    at(124, 108, 0.45, propNodes('candle')),
    glint(30, 40, 0.7, C.ribbon),
    glint(172, 30, 0.6, C.ribbon),
  ],
  parcel: () => [
    ground(100, 174, 78, 9),
    piece(rect(28, 56, 144, 112, 6), C.tan),
    flat(poly([[146, 56], [172, 56], [172, 92]]), C.giftBlue),
    flat(poly([[152, 56], [172, 56], [172, 78]]), C.raspberry),
    flat(poly([[160, 56], [172, 56], [172, 66]]), C.lemon),
    ink([[100, 58], [100, 166]], { width: 5, color: C.toadRed }),
    ink([[30, 110], [170, 110]], { width: 5, color: C.toadRed }),
    piece(ellipse(84, 44, 18, 11, -25), C.toadRed, cut),
    piece(ellipse(116, 44, 18, 11, 25), C.toadRed, cut),
    piece(circle(100, 52, 8), C.redDark, cutFlat),
    piece(curve(poly([[146, 56], [172, 92], [160, 98], [146, 70]]), 1), C.sand, cut),
  ],
  partyBag: () => [
    ground(100, 180, 64, 8),
    ink([[66, 70], [72, 34], [92, 34], [96, 70]], { width: 5, color: C.toadRed }),
    ink([[104, 70], [108, 34], [128, 34], [134, 70]], { width: 5, color: C.toadRed }),
    piece(circle(80, 62, 14), C.giftBlue, cut),
    piece(rect(108, 30, 6, 40), C.china, cut),
    piece(circle(111, 30, 14), C.topsyGreen, cut),
    piece(curve([[44, 66], [156, 66], [164, 174], [36, 174]], 1), C.china),
    ...[50, 78, 106, 134].map((x) => flat(poly([[x, 70], [x + 14, 70], [x + 16, 172], [x + 2, 172]]), C.raspberry)),
    piece(circle(100, 120, 22), C.ribbon, cut),
    piece(curve(starPts(100, 120, 16, 7), 1), C.white, cutFlat),
  ],
  chair: () => [
    ground(100, 186, 64, 7),
    piece(rect(54, 22, 92, 74, 14), C.gold),
    flat(rect(66, 34, 68, 50, 10), C.goldLight),
    piece(rect(56, 120, 10, 64, 3), C.gold),
    piece(rect(134, 120, 10, 64, 3), C.gold),
    piece(rect(46, 96, 108, 28, 10), C.toadRed),
    piece(ellipse(56, 30, 14, 8, -20), C.raspberry, cut),
    piece(ellipse(144, 30, 14, 8, 20), C.raspberry, cut),
    piece(rect(64, 150, 72, 7, 3), C.gold, cut),
  ],
  cakeSlice: () => [
    ground(100, 174, 76, 9),
    piece(poly([[24, 92], [176, 64], [176, 166], [24, 166]]), C.honey),
    flat(poly([[24, 120], [176, 104], [176, 116], [24, 132]]), C.raspberry),
    flat(poly([[24, 148], [176, 140], [176, 150], [24, 156]]), C.raspberry),
    piece(curve(poly([[20, 92], [178, 62], [180, 74], [164, 84], [150, 76], [130, 88], [110, 80], [90, 92], [70, 86], [50, 98], [30, 96]]), 1), C.china),
    piece(circle(120, 60, 13), C.cherry, cut),
    ink([[122, 48], [132, 30]], { width: 3, color: C.appleDark }),
    dot(116, 56, 3, C.white, 0.8),
  ],
  wishingStar: () => [
    ink([[24, 176], [52, 140], [86, 116]], { width: 7, color: C.ribbon, opacity: 0.6 }),
    ...[[30, 150], [56, 168], [70, 128], [40, 124]].map(([x, y]) => glint(x, y, 0.5, C.goldLight)),
    big('star', 1.25, 122, 78),
    dot(110, 76, 4, C.brown),
    dot(134, 76, 4, C.brown),
    ink([[112, 90], [122, 96], [132, 90]], { width: 3, color: C.brown }),
  ],
  birthdayBadge: () => [
    piece(poly([[78, 110], [58, 192], [80, 178], [94, 196], [104, 116]]), C.raspberry),
    piece(poly([[122, 110], [142, 192], [120, 178], [106, 196], [96, 116]]), C.giftBlue),
    piece(scallop(100, 86, 66, 6, 16), C.raspberry),
    piece(scallop(100, 86, 50, 3, 12), C.lemon, cutFlat),
    piece(circle(100, 86, 38), C.ribbon),
    at(70, 50, 0.5, propNodes('candle')),
  ],
};

// ---------------------------------------------------------------------------
// Land 6: Giants
// ---------------------------------------------------------------------------

const L6: Record<string, Draw> = {
  footprint: () => [
    piece(curve([[70, 186], [52, 150], [58, 100], [80, 66], [120, 60], [140, 86], [138, 130], [128, 170], [104, 192]], 2), C.bark),
    piece(ellipse(66, 52, 16, 20), C.bark),
    piece(ellipse(96, 34, 13, 16), C.bark),
    piece(ellipse(120, 30, 11, 13), C.bark),
    piece(ellipse(140, 38, 9, 11), C.bark),
    piece(ellipse(154, 52, 8, 10), C.bark),
    flat(curve([[80, 170], [70, 140], [84, 110], [100, 120], [96, 160]], 2), C.barkDark, 0.5),
    ink([[168, 178], [168, 160]], { width: 2.5, color: C.leafDark }),
    piece(scallop(168, 156, 7, 2, 6), C.white, cut),
    dot(168, 156, 2.5, C.ribbon),
  ],
  bundle: () => [
    ground(100, 182, 64, 8),
    ...Array.from({ length: 10 }, (_, i) => {
      const x = 46 + i * 12;
      return piece(band([[x + (i % 3) - 1, 178], [x + (i - 4.5) * 1.6, 100], [x + (i - 4.5) * 3.2, 18]], 11), i % 2 ? C.twig : C.wood, { edge: 'cut', rough: 1.3 });
    }),
    piece(rect(40, 92, 120, 16, 5), C.tan),
    ink([[44, 100], [156, 100]], { width: 2.5, color: C.brown }),
    piece(ellipse(100, 112, 10, 14), C.tan, cut),
  ],
  giantSpoon: () => [
    ground(100, 180, 80, 8),
    piece(band([[30, 176], [80, 120], [116, 84]], 18), C.steel),
    piece(ellipse(142, 58, 42, 32, -40), C.steel),
    flat(ellipse(144, 56, 32, 23, -40), C.steelLight),
    shine([[128, 48], [140, 36], [144, 40], [132, 54]], 0.6),
    at(118, 128, 0.45, propNodes('saucepan')),
  ],
  hundredSquare: () => [
    ground(100, 186, 80, 6),
    piece(rect(20, 20, 160, 160, 6), C.cream),
    ...Array.from({ length: 10 }, (_, i) => flat(rect(28 + i * 14.4, 28, 13, 13), i === 9 ? C.toadRed : C.ribbon)),
    ...Array.from({ length: 9 }, (_, r) => flat(rect(28 + 9 * 14.4, 28 + (r + 1) * 14.4, 13, 13), C.giftBlue)),
    ...Array.from({ length: 11 }, (_, i) => ink([[27 + i * 14.4, 27], [27 + i * 14.4, 172]], { width: 1.5, color: C.tan, wobble: 0.3 })),
    ...Array.from({ length: 11 }, (_, i) => ink([[27, 27 + i * 14.4], [172, 27 + i * 14.4]], { width: 1.5, color: C.tan, wobble: 0.3 })),
    flat(rect(28 + 9 * 14.4, 28 + 9 * 14.4, 13, 13), C.toadRed),
    text(92, 122, '100', 46, C.brownDark),
  ],
  shoelace: () => [
    ground(100, 176, 76, 8),
    ink([[20, 150], [60, 168], [120, 166], [170, 140], [168, 100], [120, 84], [70, 100], [62, 132], [100, 140], [134, 120], [126, 60], [90, 30], [50, 40]], { width: 12, color: C.ochre }),
    ink([[20, 150], [60, 168], [120, 166], [170, 140], [168, 100], [120, 84], [70, 100], [62, 132], [100, 140], [134, 120], [126, 60], [90, 30], [50, 40]], { width: 3, color: C.honeyDark, opacity: 0.6 }),
    piece(band([[22, 150], [6, 142]], 10), C.steelDark, cut),
    piece(band([[50, 40], [32, 46]], 10), C.steelDark, cut),
  ],
  scales: () => [
    ground(100, 186, 50, 6),
    piece(curve([[60, 184], [70, 166], [130, 166], [140, 184]], 1), C.brassDark),
    piece(rect(94, 40, 12, 132, 3), C.brass),
    piece(band([[22, 70], [100, 50], [178, 30]], 8), C.brass),
    piece(circle(100, 46, 9), C.brassDark, cut),
    ink([[22, 70], [8, 120]], { width: 2.5, color: C.brassDark }),
    ink([[22, 70], [42, 120]], { width: 2.5, color: C.brassDark }),
    ink([[178, 30], [158, 80]], { width: 2.5, color: C.brassDark }),
    ink([[178, 30], [196, 80]], { width: 2.5, color: C.brassDark }),
    piece(rect(10, 92, 30, 24, 4), C.charcoal),
    piece(curve([[2, 118], [48, 118], [40, 130], [10, 130]], 1), C.brass),
    piece(rect(166, 66, 18, 14, 3), C.charcoal),
    piece(curve([[152, 80], [198, 80], [190, 92], [160, 92]], 1), C.brass),
  ],
  giantButton: () => [
    piece(circle(96, 104, 76), C.brown),
    ink(circle(96, 104, 58), { width: 6, color: C.brownDark, closed: true }),
    ...[[-18, -18], [18, -18], [-18, 18], [18, 18]].map(([x, y]) => dot(96 + x, 104 + y, 9, C.ink)),
    ink([[78, 86], [114, 122]], { width: 5, color: C.toadRed }),
    ink([[114, 86], [78, 122]], { width: 5, color: C.toadRed }),
    ink([[114, 86], [150, 40], [176, 30]], { width: 4, color: C.toadRed }),
    piece(band([[160, 50], [196, 6]], 5), C.steelLight, cut),
    shine([[38, 80], [52, 56], [58, 60], [44, 86]], 0.35),
  ],
  giantTeacup: () => [
    big('teacup', 1.6, 100, 108),
    // two little people hiding inside, peeping over the rim
    piece(circle(78, 58, 11), C.skin, cut),
    piece(curve([[66, 56], [70, 44], [86, 44], [90, 56], [78, 50]], 2), C.brownDark, cut),
    piece(circle(112, 58, 11), C.skin, cut),
    piece(curve([[100, 56], [104, 44], [120, 44], [124, 56], [112, 50]], 2), C.gold, cut),
    dot(74, 58, 2, C.ink),
    dot(82, 58, 2, C.ink),
    dot(108, 58, 2, C.ink),
    dot(116, 58, 2, C.ink),
    flat(ellipse(100, 70, 60, 10), C.chinaBlue),
  ],
};

// ---------------------------------------------------------------------------
// Land 7: Spells
// ---------------------------------------------------------------------------

const L7: Record<string, Draw> = {
  wand: () => [
    ground(84, 178, 56, 6),
    piece(band([[34, 174], [130, 70]], 12), C.snapInk),
    piece(band([[34, 174], [54, 152]], 13), C.ribbon, cut),
    piece(curve(starPts(142, 56, 30, 13), 1), C.starYellow),
    glint(70, 40, 0.8, C.goldLight),
    glint(178, 104, 0.6, C.goldLight),
    glint(168, 18, 0.5, C.goldLight),
    dot(100, 30, 3, C.goldLight),
    dot(184, 70, 3, C.goldLight),
  ],
  halfMoon: () => [
    piece(curve([[110, 18], [56, 34], [36, 96], [62, 162], [124, 184], [84, 150], [70, 100], [80, 52]], 2), C.goldLight),
    ink([[66, 90], [74, 94], [80, 90]], { width: 3, color: C.brown }),
    ink([[70, 122], [80, 128], [88, 124]], { width: 3, color: C.brown }),
    flat(ellipse(62, 108, 6, 4), C.pink, 0.7),
    piece(curve(starPts(148, 70, 18, 8), 1), C.starYellow, cut),
    glint(160, 140, 0.6, C.goldLight),
  ],
  magicHat: () => [
    ground(100, 178, 84, 8),
    piece(curve([[100, 18], [120, 60], [144, 154], [56, 154], [80, 60]], 1), C.blueDark),
    piece(curve(poly([[94, 24], [130, 8], [162, 22], [126, 20], [106, 36]]), 1), C.blueDark),
    piece(ellipse(100, 158, 86, 16), C.blueDark),
    flat(rect(60, 136, 82, 12), C.ribbon),
    piece(curve(starPts(96, 96, 14, 6), 1), C.starYellow, cutFlat),
    piece(curve([[116, 60], [108, 66], [110, 78], [120, 82], [112, 72]], 1), C.goldLight, cutFlat),
    dot(86, 64, 3, C.goldLight),
    dot(118, 118, 3, C.goldLight),
  ],
  potion: () => [
    big('potion', 1.4, 100, 104),
    piece(circle(86, 22, 6), C.magenta, { ...cutFlat, opacity: 0.7 }),
    piece(circle(110, 10, 4), C.magenta, { ...cutFlat, opacity: 0.6 }),
    glint(160, 60, 0.7, C.lilac),
    glint(36, 132, 0.6, C.lilac),
  ],
  spellbook: () => [
    ground(100, 168, 86, 9),
    piece(curve(poly([[10, 150], [100, 166], [190, 150], [184, 82], [100, 96], [16, 82]]), 1), C.blueDark),
    piece(curve(poly([[20, 144], [98, 156], [98, 92], [24, 76]]), 1), C.cream),
    piece(curve(poly([[180, 144], [102, 156], [102, 92], [176, 76]]), 1), C.cream),
    ...[96, 108, 120, 132].map((y) => ink([[34, y - 8], [86, y + 2]], { width: 2.5, color: C.tan })),
    ...[96, 108, 120, 132].map((y) => ink([[114, y + 2], [166, y - 8]], { width: 2.5, color: C.tan })),
    ink([[100, 90], [88, 60], [112, 40], [92, 18]], { width: 4, color: C.lilac, opacity: 0.8 }),
    glint(118, 26, 0.7, C.goldLight),
    glint(76, 40, 0.5, C.goldLight),
  ],
  cauldron: () => [
    piece(curve([[72, 196], [80, 172], [100, 184], [120, 168], [130, 196]], 1), C.flame, cut),
    piece(band([[52, 150], [40, 184]], 9), C.snapInk),
    piece(band([[148, 150], [160, 184]], 9), C.snapInk),
    piece(curve([[26, 80], [174, 80], [168, 136], [130, 170], [70, 170], [32, 136]], 2), C.snapInk),
    piece(ellipse(100, 80, 80, 16), C.charcoal),
    piece(curve([[28, 82], [50, 66], [80, 72], [110, 62], [150, 70], [172, 82], [100, 92]], 2), C.topsyGreen),
    piece(circle(76, 50, 10), C.topsyGreen, cut),
    piece(circle(120, 36, 7), C.topsyGreen, cut),
    piece(circle(100, 16, 5), C.topsyGreen, cut),
    shine([[44, 104], [52, 98], [60, 130], [52, 132]], 0.2),
  ],
  quill: () => [
    piece(curve([[40, 178], [60, 120], [110, 50], [170, 14], [160, 60], [120, 120], [62, 166]], 2), C.china, { fibre: C.snowShade }),
    flat(curve([[66, 150], [100, 98], [150, 36], [156, 44], [116, 108], [74, 156]], 2), C.sky, 0.5),
    ink([[36, 186], [80, 130], [130, 70], [166, 20]], { width: 3, color: C.stone }),
    piece(poly([[30, 196], [34, 176], [46, 182]]), C.snapInk, cutFlat),
    piece(curve([[22, 186], [26, 196], [18, 196]], 1), C.blueDark, cutFlat),
  ],
  silkyRibbon: () => [
    piece(curve([[96, 96], [70, 130], [56, 186], [76, 176], [88, 188], [100, 110]], 2), C.goldLight),
    piece(curve([[104, 96], [134, 130], [150, 186], [130, 176], [118, 188], [100, 110]], 2), C.goldLight),
    piece(curve([[100, 96], [60, 50], [22, 64], [26, 108], [70, 112]], 2), C.goldLight),
    piece(curve([[100, 96], [140, 50], [178, 64], [174, 108], [130, 112]], 2), C.goldLight),
    flat(curve([[90, 92], [56, 62], [36, 74], [42, 96]], 2), C.candle, 0.8),
    flat(curve([[110, 92], [144, 62], [164, 74], [158, 96]], 2), C.candle, 0.8),
    piece(ellipse(100, 96, 16, 18), C.gold),
    glint(40, 30, 0.7, C.goldLight),
    glint(172, 150, 0.6, C.goldLight),
  ],
};

// ---------------------------------------------------------------------------
// Land 8: Toys
// ---------------------------------------------------------------------------

const L8: Record<string, Draw> = {
  windUpKey: () => [
    ground(100, 184, 40, 6),
    piece(rect(92, 110, 16, 74, 4), C.brass),
    piece(ellipse(62, 70, 46, 32, 20), C.brass),
    piece(ellipse(138, 70, 46, 32, -20), C.brass),
    flat(ellipse(62, 70, 22, 13, 20), C.brassDark),
    flat(ellipse(138, 70, 22, 13, -20), C.brassDark),
    piece(circle(100, 92, 16), C.brass),
    ...[128, 144, 160].map((y) => ink([[92, y], [108, y]], { width: 3, color: C.brassDark })),
    shine([[30, 60], [44, 46], [48, 50], [34, 64]], 0.5),
  ],
  soldier: () => [big('soldier', 1.6, 100, 96)],
  toyBox: () => [
    ground(100, 182, 84, 8),
    group({ transform: 'rotate(-20 40 80)' }, [piece(rect(26, 40, 140, 24, 4), C.rust)]),
    at(118, 20, 0.6, propNodes('soldier')),
    piece(circle(74, 82, 22), C.giftBlue),
    flat(rect(54, 78, 40, 8), C.ribbon),
    piece(circle(150, 82, 11), C.teddy),
    piece(rect(24, 92, 152, 86, 6), C.rust),
    flat(rect(24, 92, 152, 12), C.redDark),
    ...[[56, 140], [100, 130], [144, 146]].map(([x, y]) => piece(curve(starPts(x, y, 13, 6), 1), C.ribbon, cutFlat)),
  ],
  drum: () => [
    ground(100, 180, 72, 9),
    piece(rect(32, 70, 136, 96, 10), C.coatRed),
    ink([[34, 82], [56, 156], [78, 82], [100, 156], [122, 82], [144, 156], [166, 82]], { width: 4, color: C.ribbon }),
    piece(rect(28, 156, 144, 14, 6), C.china),
    piece(ellipse(100, 72, 70, 18), C.china),
    flat(ellipse(100, 72, 60, 12), C.cream),
    piece(band([[40, 18], [100, 66]], 8), C.wood, cut),
    piece(band([[160, 18], [104, 66]], 8), C.wood, cut),
    piece(circle(40, 18, 9), C.cream, cut),
    piece(circle(160, 18, 9), C.cream, cut),
  ],
  medal: () => [
    piece(poly([[60, 4], [90, 4], [116, 110], [96, 120]]), C.giftBlue),
    piece(poly([[140, 4], [110, 4], [84, 110], [104, 120]]), C.coatRed),
    flat(poly([[70, 4], [80, 4], [104, 106], [98, 110]]), C.white),
    flat(poly([[130, 4], [120, 4], [96, 106], [102, 110]]), C.white),
    piece(scallop(100, 140, 44, 3, 14), C.gold),
    piece(circle(100, 140, 32), C.starYellow),
    piece(curve(starPts(100, 140, 24, 10), 1), C.goldLight, cutFlat),
    shine([[74, 124], [84, 112], [88, 116], [78, 128]], 0.5),
  ],
  coinPurse: () => [
    ground(100, 180, 72, 8),
    piece(circle(78, 54, 16), C.steelLight),
    piece(circle(112, 46, 18), C.ribbon),
    flat(circle(112, 46, 11), C.starYellowDark, 0.6),
    piece(curve([[30, 76], [170, 76], [178, 140], [140, 176], [60, 176], [22, 140]], 2), C.violet),
    piece(rect(34, 66, 132, 14, 6), C.brass),
    piece(circle(92, 60, 8), C.brass, cut),
    piece(circle(108, 60, 8), C.brass, cut),
    ink([[44, 110], [56, 150]], { width: 3, color: C.violetDark }),
    ink([[156, 110], [144, 150]], { width: 3, color: C.violetDark }),
  ],
  pound: () => {
    const outer: Pt[] = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
      return [100 + Math.cos(a) * 78, 100 + Math.sin(a) * 78];
    });
    return [
      ground(100, 184, 70, 7),
      piece(outer, C.gold),
      piece(circle(100, 100, 52), C.steelLight, cut),
      ink(circle(100, 100, 66), { width: 2.5, color: C.starYellowDark, closed: true }),
      text(100, 120, '£1', 52, C.brownDark),
      shine([[42, 70], [56, 50], [60, 54], [46, 74]], 0.5),
    ];
  },
  trainTicket: () => [
    ground(100, 160, 84, 8),
    group({ transform: 'rotate(-8 100 100)' }, [
      piece(rect(16, 50, 168, 100, 8), C.cream),
      flat(rect(16, 62, 168, 16), C.rust),
      piece(rect(54, 98, 76, 30, 4), C.sledgeGreen, cutFlat),
      piece(rect(110, 84, 22, 44, 3), C.sledgeGreen, cutFlat),
      piece(rect(60, 90, 10, 10), C.hatBlack, cutFlat),
      piece(circle(68, 132, 9), C.hatBlack, cutFlat),
      piece(circle(96, 132, 9), C.hatBlack, cutFlat),
      piece(circle(122, 132, 9), C.hatBlack, cutFlat),
      piece(circle(162, 116, 9), C.tan, cutFlat),
      ink([[150, 92], [176, 92]], { width: 2.5, color: C.tan }),
    ]),
  ],
};

// ---------------------------------------------------------------------------
// Land 9: Snow
// ---------------------------------------------------------------------------

const L9: Record<string, Draw> = {
  snowflake: () => [
    ...[0, 1, 2, 3, 4, 5].flatMap((i) => {
      const a = (i * Math.PI) / 3 - Math.PI / 2;
      const p = (r: number, da = 0): Pt => [100 + Math.cos(a + da) * r, 100 + Math.sin(a + da) * r];
      return [
        ink([p(0), p(84)], { width: 9, color: C.iceDark }),
        ink([p(46), p(64, 0.36)], { width: 6, color: C.iceDark }),
        ink([p(46), p(64, -0.36)], { width: 6, color: C.iceDark }),
        ink([p(66), p(80, 0.22)], { width: 5, color: C.iceDark }),
        ink([p(66), p(80, -0.22)], { width: 5, color: C.iceDark }),
      ];
    }),
    piece(circle(100, 100, 16), C.ice),
    glint(150, 40, 0.6),
  ],
  snowball: () => [ground(100, 182, 82, 8), at(10, 90, 0.75, propNodes('snowball')), at(100, 90, 0.75, propNodes('snowball')), at(55, 30, 0.75, propNodes('snowball', true))],
  sledge: () => [
    piece(curve([[0, 170], [40, 150], [120, 146], [200, 160], [200, 200], [0, 200]], 2), C.snow, { fibre: C.snowShade }),
    big('sledge', 1.55, 100, 92),
  ],
  icePie: () => [
    ground(100, 168, 86, 10),
    group({ transform: 'translate(-8 4)' }, [
      piece(curve(poly([[94, 30], [94, 170], [60, 162], [30, 132], [22, 100], [30, 66], [60, 38]]), 2), C.honey),
      flat(curve(poly([[94, 44], [94, 156], [64, 148], [40, 124], [36, 100], [42, 74], [64, 52]]), 2), C.snow),
      ...[[60, 80], [76, 112], [56, 130], [80, 66]].map(([x, y]) => dot(x, y, 5, C.blue)),
    ]),
    group({ transform: 'translate(10 -4)' }, [
      piece(curve(poly([[106, 30], [106, 170], [140, 162], [170, 132], [178, 100], [170, 66], [140, 38]]), 2), C.honey),
      flat(curve(poly([[106, 44], [106, 156], [136, 148], [160, 124], [164, 100], [158, 74], [136, 52]]), 2), C.snow),
      ...[[140, 80], [124, 112], [144, 130], [120, 66]].map(([x, y]) => dot(x, y, 5, C.blue)),
    ]),
    glint(100, 20, 0.6, C.iceDark),
  ],
  clock: () => [
    ground(100, 186, 60, 6),
    piece(circle(100, 92, 76), C.iceDark),
    piece(circle(100, 92, 62), C.snow, cutFlat),
    ...Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const r0 = i % 3 ? 52 : 46;
      return ink([[100 + Math.sin(a) * r0, 92 - Math.cos(a) * r0], [100 + Math.sin(a) * 57, 92 - Math.cos(a) * 57]], { width: i % 3 ? 2.5 : 5, color: C.blueDark });
    }),
    ink([[100, 92], [100, 46]], { width: 6, color: C.ink }),
    ink([[100, 92], [134, 92]], { width: 7, color: C.ink }),
    dot(100, 92, 6, C.ink),
    snowLip(38, 162, 22),
    piece(poly([[64, 156], [74, 156], [69, 186]]), C.ice, cut),
    piece(poly([[126, 156], [138, 156], [132, 194]]), C.ice, cut),
  ],
  mittens: () => [
    ink([[56, 40], [80, 14], [120, 14], [144, 40]], { width: 3, color: C.ink }),
    ...[-1, 1].map((s) =>
      group({ transform: `rotate(${s * 10} ${100 + s * 44} 110)` }, [
        piece(rect(100 + s * 44 - 26, 40, 52, 22, 6), C.china, { fibre: C.snowShade }),
        piece(curve([[100 + s * 44 - 28, 60], [100 + s * 44 + 28, 60], [100 + s * 44 + 30, 150], [100 + s * 44, 176], [100 + s * 44 - 30, 150]], 2), C.coatRed),
        piece(ellipse(100 + s * 44 - s * 30, 108, 12, 20, s * 30), C.coatRed),
        piece(curve(starPts(100 + s * 44, 120, 12, 5, 6), 1), C.china, cutFlat),
      ]),
    ),
  ],
  icicle: () => [
    at(14, 34, 0.75, propNodes('icicle')),
    big('icicle', 1.3, 104, 92),
    at(130, 30, 0.6, propNodes('icicle', true)),
  ],
  snowGlobe: () => [
    ground(100, 184, 62, 7),
    piece(circle(100, 88, 70), C.glass),
    piece(curve([[40, 120], [100, 108], [160, 120], [150, 140], [50, 140]], 2), C.snow, cutFlat),
    piece(poly([[100, 44], [124, 84], [112, 84], [130, 112], [70, 112], [88, 84], [76, 84]]), C.sledgeGreen, cut),
    piece(rect(95, 112, 10, 12), C.bark, cut),
    ...[[60, 60], [80, 40], [130, 50], [146, 80], [56, 92], [120, 30], [142, 106]].map(([x, y]) => dot(x, y, 3, C.white)),
    shine([[50, 50], [70, 30], [76, 34], [56, 56]], 0.6),
    piece(curve([[42, 150], [50, 136], [150, 136], [158, 150], [166, 180], [34, 180]], 1), C.wood),
    flat(rect(46, 156, 108, 8), C.ribbon),
  ],
};

// ---------------------------------------------------------------------------
// Land 10: Dame Snap's Prison
// ---------------------------------------------------------------------------

const L10: Record<string, Draw> = {
  lantern: () => [
    ground(100, 186, 50, 6),
    flat(circle(100, 112, 70), C.candle, 0.3),
    ink(ellipse(100, 30, 22, 20), { width: 5, color: C.charcoal }),
    piece(poly([[64, 56], [136, 56], [124, 40], [76, 40]]), C.charcoal),
    piece(rect(62, 56, 76, 108, 4), C.candle),
    piece(curve([[100, 92], [110, 110], [108, 122], [92, 122], [90, 110]], 2), C.flame, cut),
    piece(rect(92, 122, 16, 30, 3), C.china, cut),
    piece(rect(58, 160, 84, 18, 4), C.charcoal),
    piece(rect(58, 56, 8, 108), C.charcoal, cut),
    piece(rect(134, 56, 8, 108), C.charcoal, cut),
  ],
  bar: () => [
    piece(rect(10, 16, 180, 18, 4), C.stone),
    piece(rect(10, 166, 180, 18, 4), C.stone),
    piece(band([[40, 32], [40, 168]], 14), C.charcoal),
    piece(band([[160, 32], [160, 168]], 14), C.charcoal),
    piece(band([[92, 32], [74, 100], [92, 168]], 14), C.charcoal),
    piece(band([[108, 32], [126, 100], [108, 168]], 14), C.charcoal),
    piece(rect(84, 88, 32, 22, 4), C.chalk, cut),
    text(100, 106, '57', 18, C.ruler),
  ],
  rule: () => [
    ground(100, 180, 80, 7),
    group({ transform: 'rotate(-10 60 100)' }, [
      piece(poly([[14, 40], [96, 40], [88, 70], [100, 96], [86, 130], [96, 166], [14, 166]]), C.chalk, { fibre: '#ffffff' }),
      flat(rect(24, 50, 64, 12), C.ruler),
      ...[84, 100, 116, 132, 148].map((y) => ink([[26, y], [80, y]], { width: 3, color: C.snapInk })),
    ]),
    group({ transform: 'rotate(10 140 100)' }, [
      piece(poly([[104, 40], [186, 40], [186, 166], [104, 166], [94, 130], [108, 96], [96, 70]]), C.chalk, { fibre: '#ffffff' }),
      flat(rect(110, 50, 64, 12), C.ruler),
      ...[84, 100, 116, 132, 148].map((y) => ink([[112, y], [172, y]], { width: 3, color: C.snapInk })),
    ]),
  ],
  padlock: () => [
    ground(100, 184, 60, 7),
    ink([[60, 96], [60, 52], [80, 22], [116, 22], [136, 46]], { width: 16, color: C.steel }),
    piece(rect(40, 88, 120, 92, 14), C.steelDark),
    piece(circle(100, 124, 12), C.brass, cut),
    piece(poly([[94, 128], [106, 128], [110, 156], [90, 156]]), C.brass, cut),
    shine([[50, 98], [58, 98], [58, 168], [50, 168]], 0.3),
    glint(160, 36, 0.8, C.ribbon),
  ],
  cageKey: () => {
    // three keys hanging from one iron ring
    const hang = (rot: number, nodes: Node[]): Node => group({ transform: `translate(100 36) rotate(${rot}) scale(0.68) translate(-18 -100)` }, nodes);
    return [
      ground(110, 184, 70, 7),
      hang(108, bigKey(C.charcoal, C.snapInk).slice(1)),
      hang(56, bigKey(C.steel, C.steelDark).slice(1)),
      hang(82, bigKey(C.brass, C.brassDark, true).slice(1)),
      ink(circle(100, 36, 24), { width: 7, color: C.steelDark, closed: true }),
    ];
  },
  goldStar: () => [
    piece(poly([[74, 120], [50, 196], [72, 184], [86, 198], [100, 130]]), C.ruler),
    piece(poly([[126, 120], [150, 196], [128, 184], [114, 198], [100, 130]]), C.ruler),
    big('star', 1.45, 100, 92),
    glint(170, 30, 0.8),
    glint(28, 60, 0.6),
  ],
  silkyWing: () => [
    piece(curve([[100, 110], [60, 30], [20, 20], [10, 70], [40, 120]], 2), C.lilac, { opacity: 0.85 }),
    piece(curve([[100, 112], [50, 130], [30, 170], [70, 186], [100, 140]], 2), C.lilac, { opacity: 0.85 }),
    piece(curve([[100, 110], [140, 30], [180, 20], [190, 70], [160, 120]], 2), C.lilac, { opacity: 0.85 }),
    piece(curve([[100, 112], [150, 130], [170, 170], [130, 186], [100, 140]], 2), C.lilac, { opacity: 0.85 }),
    ink([[100, 110], [60, 60], [24, 38]], { width: 2.5, color: C.white }),
    ink([[100, 110], [150, 60], [176, 38]], { width: 2.5, color: C.white }),
    ink([[100, 114], [64, 160]], { width: 2.5, color: C.white }),
    ink([[100, 114], [136, 160]], { width: 2.5, color: C.white }),
    piece(ellipse(100, 112, 6, 14), C.goldLight, cut),
    glint(30, 140, 0.6, C.goldLight),
    glint(170, 150, 0.6, C.goldLight),
  ],
  crown: () => [
    ground(100, 168, 76, 8),
    piece(poly([[30, 156], [24, 64], [64, 104], [100, 44], [136, 104], [176, 64], [170, 156]]), C.gold),
    piece(rect(28, 136, 144, 26, 6), C.starYellowDark),
    ...[[24, 60], [100, 40], [176, 60]].map(([x, y]) => piece(circle(x, y, 9), C.goldLight, cut)),
    piece(circle(64, 149, 8), C.cherry, cut),
    piece(circle(100, 149, 9), C.giftBlue, cut),
    piece(circle(136, 149, 8), C.sledgeGreen, cut),
    shine([[40, 120], [48, 96], [52, 98], [46, 124]], 0.5),
  ],
};

const DRAW: Record<string, Draw> = { ...L1, ...L2, ...L3, ...L4, ...L5, ...L6, ...L7, ...L8, ...L9, ...L10, ...KEEPSAKES_L11, ...KEEPSAKES_L12, ...KEEPSAKES_L13, ...KEEPSAKES_L14 };

// ---------------------------------------------------------------------------
// Names (read aloud and shown in the Treasure Room)
// ---------------------------------------------------------------------------

export const KEEPSAKE_NAMES: Record<string, string> = {
  // The Enchanted Wood
  toadstool: 'A spotty toadstool',
  leaf: 'A whispering leaf',
  pixieCap: 'The Angry Pixie’s cap',
  peg: 'Dame Washalot’s peg',
  nightcap: 'Mr Watzisname’s nightcap',
  saucepan: 'A shiny saucepan',
  popBiscuit: 'Pop biscuits',
  moonLamp: 'Moon-Face’s lamp',
  // Topsy-Turvy
  upsideHat: 'An upside-down hat',
  shoeHat: 'A hat for your feet',
  teacup: 'A topsy-turvy teacup',
  bun: 'A back-to-front bun',
  window: 'A wobbly window',
  upsideBoot: 'An upside-down boot',
  teapot: 'A topsy-turvy teapot',
  spinningTop: 'A spinning top',
  // Goodies
  toffee: 'A toffee shock',
  lemonade: 'A jug of lemonade',
  biscuitTin: 'A biscuit tin',
  googleBun: 'A Google Bun',
  jelly: 'A wobbly jelly',
  sugarMouse: 'A sugar mouse',
  lolly: 'A swirly lolly',
  goblinSpoon: 'The Jelly Goblin’s spoon',
  // Dame Snap's School
  chalk: 'Some chalk',
  gateKey: 'The school gate key',
  inkwell: 'An inkwell and quill',
  rulebook: 'Dame Snap’s rule book',
  blackboard: 'A little blackboard',
  bell: 'The school bell',
  brassKey: 'The secret key',
  snappedRuler: 'Dame Snap’s snapped ruler',
  // Birthdays
  partyHat: 'A party hat',
  candle: 'Birthday candles',
  parcel: 'Pass the parcel',
  partyBag: 'A party bag',
  chair: 'A musical chair',
  cakeSlice: 'A slice of cake',
  wishingStar: 'A wishing star',
  birthdayBadge: 'A birthday badge',
  // Giants
  footprint: 'A giant footprint',
  bundle: 'A bundle of ten sticks',
  giantSpoon: 'The giant’s spoon',
  hundredSquare: 'A hundred square',
  shoelace: 'A giant shoelace',
  scales: 'The giant’s scales',
  giantButton: 'A giant button',
  giantTeacup: 'The giant’s teacup',
  // Spells
  wand: 'A magic wand',
  halfMoon: 'A half moon',
  magicHat: 'A magic hat',
  potion: 'A potion bottle',
  spellbook: 'A spell book',
  cauldron: 'A bubbling cauldron',
  quill: 'A spell quill',
  silkyRibbon: 'Silky’s ribbon',
  // Toys
  windUpKey: 'A wind-up key',
  soldier: 'A toy soldier',
  toyBox: 'A toy box',
  drum: 'Oom Boom Boom’s drum',
  medal: 'A shiny medal',
  coinPurse: 'A coin purse',
  pound: 'A pound coin',
  trainTicket: 'A train ticket',
  // Snow
  snowflake: 'A snowflake',
  snowball: 'Snowballs',
  sledge: 'A sledge',
  icePie: 'Half an ice-pie',
  clock: 'The frozen clock',
  mittens: 'Warm mittens',
  icicle: 'Icicles',
  snowGlobe: 'A snow globe',
  // Dame Snap's Prison
  lantern: 'A lantern',
  bar: 'A bendy bar',
  rule: 'A broken rule',
  padlock: 'An open padlock',
  cageKey: 'The cage keys',
  goldStar: 'A gold star',
  silkyWing: 'Silky’s wings',
  crown: 'A champion’s crown',
  // The second adventure (lands 11–14): each land names its own.
  ...NAMES_L11,
  ...NAMES_L12,
  ...NAMES_L13,
  ...NAMES_L14,
};

/** Every keepsake id that has art. */
export const KEEPSAKE_IDS: string[] = Object.keys(DRAW);

/** A keepsake's picture, 200 × 200. Unknown ids get a plain gold star. */
export function keepsakeArt(id: string): string {
  const draw = DRAW[id] ?? L10.goldStar;
  return svg({ w: 200, h: 200, name: 'ks-' + id, label: KEEPSAKE_NAMES[id] ?? id, className: 'keepsake' }, draw());
}

// ---------------------------------------------------------------------------
// Land seals
// ---------------------------------------------------------------------------

/** A small tree for the Enchanted Wood's seal. */
const tree = (): Node[] => [
  ground(100, 184, 60, 7),
  piece(curve([[80, 186], [88, 140], [86, 100], [114, 100], [112, 140], [120, 186]], 1), C.bark),
  piece(circle(100, 70, 52), C.leafDark),
  piece(circle(70, 92, 30), C.leaf),
  piece(circle(130, 92, 30), C.leaf),
  piece(circle(100, 52, 32), C.leaf),
  piece(rect(92, 120, 16, 20, 7), C.barkDark, cutFlat),
  dot(80, 60, 5, C.toadRed),
  dot(126, 74, 5, C.toadRed),
  dot(98, 98, 5, C.toadRed),
];

/** Each land's emblem: a 200-box drawing set in the middle of its seal. */
const EMBLEMS: Draw[] = [tree, L2.upsideHat, L3.lolly, L4.snappedRuler, L5.cakeSlice, L6.footprint, L7.wand, () => [big('soldier', 1.6)], L9.snowflake, L10.padlock, EMBLEM_L11, EMBLEM_L12, EMBLEM_L13, EMBLEM_L14];

/** The big round seal for land n (1–14), 240 × 240. */
export function landSeal(n: number): string {
  const land = LANDS[Math.min(Math.max(n, 1), LANDS.length) - 1];
  const col = land.color;
  const dark = mix(col, '#000000', 0.3);
  const disc = mix(col, '#fbf6ea', 0.78);
  const emblem = EMBLEMS[land.n - 1];
  return svg({ w: 240, h: 240, name: 'seal-' + land.id, label: `${land.title} seal`, className: 'seal' }, [
    // ribbon tails hanging below
    piece(poly([[96, 150], [70, 236], [92, 222], [106, 238], [120, 160]]), dark),
    piece(poly([[144, 150], [170, 236], [148, 222], [134, 238], [120, 160]]), col),
    piece(scallop(120, 116, 106, 5, 22), col),
    ink(circle(120, 116, 92), { width: 3, color: disc, closed: true, opacity: 0.8 }),
    ...Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      return dot(120 + Math.cos(a) * 98, 116 + Math.sin(a) * 98, 2.6, disc, 0.8);
    }),
    piece(circle(120, 116, 82), disc, cut),
    at(42, 38, 0.78, emblem()),
  ]);
}
