/**
 * Counting props: 120 × 120 paper cut-outs (pop biscuits, acorns,
 * saucepans …), used by problems and stories.
 *
 * Problems show up to twenty of these at once, so each one is drawn to be
 * counted, not admired:
 *
 *   - a strong, simple silhouette that still reads at 60 px
 *   - its own main colour AND its own outline, so no two props are
 *     mistaken for each other (round biscuit vs round button: honey with a
 *     pink middle vs teal with four holes)
 *   - no fiddly detail, and a small soft shadow so a row of ten sits on
 *     the page instead of floating
 *   - rendered without boil (`boil: false`): one frame, so a crowd is cheap
 *
 * Keepsakes (keepsakes.ts) reuse these drawings with `rich` set, which adds
 * a little more detail at the bigger keepsake size.
 */
import type { PropId } from '../core/problem';
import { C } from './palette';
import { band, circle, curve, dot, ellipse, group, ink, piece, poly, rect, svg, type Node, type Pt } from './paper';

// ---------------------------------------------------------------------------
// Small shared bits (also used by keepsakes.ts)
// ---------------------------------------------------------------------------

/** A soft ground shadow that sits a thing on the page. */
export const ground = (cx: number, cy: number, rx: number, ry = rx * 0.2): Node =>
  piece(ellipse(cx, cy, rx, ry), 'rgba(40,25,10,0.16)', { edge: 'cut', fibre: false, shadow: false });

/** A white highlight streak, for shiny things. */
export const shine = (pts: Pt[], opacity = 0.55): Node =>
  piece(curve(pts, 2), '#ffffff', { edge: 'cut', fibre: false, shadow: false, opacity });

/** A four-pointed twinkle. */
export const glint = (x: number, y: number, s = 1, fill: string = '#ffffff'): Node =>
  piece(
    poly([[x, y - 12 * s], [x + 2.5 * s, y - 2.5 * s], [x + 12 * s, y], [x + 2.5 * s, y + 2.5 * s], [x, y + 12 * s], [x - 2.5 * s, y + 2.5 * s], [x - 12 * s, y], [x - 2.5 * s, y - 2.5 * s]]),
    fill,
    { edge: 'cut', fibre: false, shadow: false, opacity: 0.9 },
  );

/** A flat detail laid on top of a piece (no fibre, no shadow). */
export const flat = (outline: Pt[], fill: string, opacity?: number): Node =>
  piece(outline, fill, { edge: 'cut', fibre: false, shadow: false, opacity });

/** A circle with a wavy edge (biscuits, rosettes, seals). */
export function scallop(cx: number, cy: number, r: number, amp: number, bumps: number, phase = 0): Pt[] {
  const n = bumps * 8;
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + phase;
    const rr = r + amp * Math.cos(a * bumps - phase * bumps);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return pts;
}

/** A star's outline with `n` points. */
export function starPts(cx: number, cy: number, outer: number, inner: number, n = 5, rot = -90): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = ((rot + (i * 180) / n) * Math.PI) / 180;
    const r = i % 2 ? inner : outer;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

// ---------------------------------------------------------------------------
// The 24 props, each drawn in a 120 × 120 box
// ---------------------------------------------------------------------------

type Draw = (rich: boolean) => Node[];

/** Silky's pop biscuit: a crimped honey biscuit with a pink iced middle. */
const popBiscuit: Draw = (rich) => [
  ground(60, 104, 44, 7),
  piece(scallop(60, 58, 46, 3.2, 12), C.honey),
  flat(circle(60, 58, 36), C.honeyDark, 0.35),
  flat(circle(60, 58, 33), C.honey),
  piece(scallop(60, 58, 21, 2, 7), C.sherbet, { edge: 'cut', fibre: false }),
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => dot(60 + Math.cos((i * Math.PI) / 4) * 28, 58 + Math.sin((i * Math.PI) / 4) * 28, 2.4, C.honeyDark)),
  ...(rich ? [dot(54, 54, 2.5, C.white), dot(66, 52, 2.5, C.white), dot(60, 64, 2.5, C.white), shine([[30, 40], [44, 26], [48, 30], [34, 44]], 0.4)] : []),
];

/** A toffee shock: a square of toffee in a gold wrapper twisted at both ends. */
const toffee: Draw = (rich) => [
  ground(60, 96, 46, 6),
  piece(poly([[40, 60], [8, 34], [16, 60], [8, 86]]), C.ribbon),
  piece(poly([[80, 60], [112, 34], [104, 60], [112, 86]]), C.ribbon),
  piece(rect(32, 34, 56, 52, 12), C.caramel),
  flat(rect(38, 40, 44, 40, 9), '#b56e34'),
  shine([[42, 46], [62, 44], [62, 49], [44, 52]], 0.5),
  ink([[16, 44], [24, 60], [16, 76]], { width: 2.5, color: C.starYellowDark }),
  ink([[104, 44], [96, 60], [104, 76]], { width: 2.5, color: C.starYellowDark }),
  ...(rich ? [ink([[46, 70], [74, 70]], { width: 2.5, color: C.caramel }), glint(92, 30, 0.7)] : []),
];

/** An acorn: an ochre nut in a dark brown cup, with a stalk. */
const acorn: Draw = (rich) => [
  ground(60, 110, 30, 5),
  piece(curve([[30, 48], [90, 48], [90, 80], [72, 104], [60, 112], [48, 104], [30, 80]], 2), C.ochre),
  shine([[38, 58], [44, 56], [46, 84], [40, 82]], 0.4),
  piece(band([[60, 30], [64, 14]], 8), C.brownDark, { edge: 'cut' }),
  piece(curve([[22, 54], [26, 32], [60, 22], [94, 32], [98, 54], [60, 60]], 2), C.brownDark),
  ...[[40, 38], [54, 33], [68, 33], [82, 38], [34, 48], [48, 44], [62, 44], [76, 44], [88, 48]].map(([x, y]) => dot(x, y, 2.4, C.bark)),
  ...(rich ? [ink([[60, 104], [60, 112]], { width: 2.5, color: C.brown })] : []),
];

/** A saucepan, side on: steel pan, light rim, long black handle. */
const saucepan: Draw = (rich) => [
  ground(52, 102, 44, 6),
  piece(band([[84, 54], [112, 42]], 11), C.hatBlack, { edge: 'cut' }),
  piece(rect(12, 52, 76, 46, 9), C.steel),
  piece(rect(6, 44, 88, 13, 6), C.steelLight),
  shine([[22, 62], [28, 62], [28, 90], [22, 88]], 0.45),
  ...(rich ? [dot(108, 44, 2.5, C.steelLight), ink([[40, 76], [56, 76]], { width: 2.5, color: C.steelDark, opacity: 0.6 })] : []),
];

/** A toadstool: red cap, white spots, cream stalk. */
const toadstool: Draw = (rich) => [
  ground(60, 108, 34, 6),
  piece(curve([[46, 60], [74, 60], [80, 106], [40, 106]], 1), C.cream),
  piece(curve([[8, 66], [18, 30], [60, 12], [102, 30], [112, 66], [60, 70]], 2), C.toadRed),
  flat(ellipse(60, 66, 40, 6), '#e9d6b0'),
  piece(circle(38, 42, 8), C.white, { edge: 'cut', fibre: false }),
  piece(circle(66, 28, 7), C.white, { edge: 'cut', fibre: false }),
  piece(circle(88, 50, 7), C.white, { edge: 'cut', fibre: false }),
  piece(circle(60, 52, 5), C.white, { edge: 'cut', fibre: false }),
  ...(rich ? [piece(circle(22, 58, 4), C.white, { edge: 'cut', fibre: false }), ink([[52, 80], [52, 98]], { width: 2, color: C.sand })] : []),
];

/** A green apple with a stalk and a leaf. */
const apple: Draw = (rich) => [
  ground(60, 110, 38, 6),
  piece(curve([[60, 34], [84, 24], [106, 44], [104, 82], [84, 108], [60, 102], [36, 108], [16, 82], [14, 44], [36, 24]], 2), C.appleGreen),
  shine([[30, 48], [38, 40], [42, 44], [34, 62]], 0.45),
  piece(band([[58, 38], [62, 14]], 6), C.brownDark, { edge: 'cut' }),
  piece(ellipse(78, 20, 15, 7, -25), C.appleDark, { edge: 'cut' }),
  ...(rich ? [ink([[66, 22], [90, 16]], { width: 1.8, color: C.leafLight }), flat(ellipse(80, 76, 12, 9), C.toadRed, 0.25)] : []),
];

/** A puffy purple cushion with gold tassels. */
const cushion: Draw = (rich) => [
  ground(60, 106, 46, 6),
  ...[[16, 22], [104, 22], [16, 96], [104, 96]].map(([x, y]) => piece(circle(x + (x < 60 ? -4 : 4), y + (y < 60 ? -4 : 4), 7), C.ribbon, { edge: 'cut' })),
  piece(curve([[16, 22], [60, 30], [104, 22], [96, 59], [104, 96], [60, 88], [16, 96], [24, 59]], 2), C.violet),
  ink([[30, 34], [56, 56]], { width: 2.5, color: C.violetDark }),
  ink([[90, 34], [64, 56]], { width: 2.5, color: C.violetDark }),
  ink([[30, 84], [56, 62]], { width: 2.5, color: C.violetDark }),
  ink([[90, 84], [64, 62]], { width: 2.5, color: C.violetDark }),
  piece(circle(60, 59, 6), C.ribbon, { edge: 'cut', fibre: false }),
  ...(rich ? [shine([[30, 30], [50, 34], [48, 38], [30, 36]], 0.35)] : []),
];

/** A china teacup on a blue saucer, full of tea. */
const teacup: Draw = (rich) => [
  ground(60, 106, 50, 6),
  piece(ellipse(60, 96, 52, 11), C.chinaBlue),
  ink(ellipse(98, 62, 11, 14), { width: 8, color: C.chinaBlue, closed: true }),
  piece(curve([[18, 42], [102, 42], [96, 72], [80, 94], [40, 94], [24, 72]], 1), C.china),
  flat(ellipse(60, 43, 41, 8), C.chinaBlue),
  flat(ellipse(60, 44, 36, 5.5), C.caramel),
  flat(curve([[22, 54], [98, 54], [96, 62], [24, 62]], 1), C.chinaBlue),
  ...(rich ? [dot(42, 76, 4, C.chinaBlue), dot(60, 80, 4, C.chinaBlue), dot(78, 76, 4, C.chinaBlue)] : [dot(60, 78, 4.5, C.chinaBlue)]),
];

/** A tall black top hat with a red band. */
const hat: Draw = (rich) => [
  ground(60, 106, 52, 6),
  piece(curve([[32, 16], [88, 16], [86, 92], [34, 92]], 1), C.hatBlack),
  piece(ellipse(60, 94, 54, 11), C.hatBlack),
  flat(rect(33, 70, 54, 14), C.toadRed),
  shine([[40, 22], [46, 22], [46, 64], [40, 64]], 0.18),
  ...(rich ? [piece(ellipse(80, 72, 8, 9), C.ribbon, { edge: 'cut', fibre: false })] : []),
];

/** A Google Bun: a round golden bun with white icing and a cherry. */
const googleBun: Draw = (rich) => [
  ground(60, 102, 50, 7),
  piece(curve([[10, 98], [14, 56], [60, 32], [106, 56], [110, 98]], 2), C.bun),
  flat(curve([[14, 88], [106, 88], [108, 98], [12, 98]], 1), C.bunDark, 0.6),
  piece(curve([[22, 62], [40, 44], [60, 38], [80, 44], [98, 62], [94, 74], [86, 66], [78, 80], [68, 68], [58, 82], [48, 68], [38, 78], [30, 66], [24, 72]], 1), C.white, { edge: 'cut', fibre: false }),
  ink([[60, 34], [68, 16]], { width: 3, color: C.appleDark }),
  piece(circle(58, 36, 10), C.cherry, { edge: 'cut' }),
  dot(55, 33, 2.5, C.white, 0.8),
  ...(rich ? [dot(36, 86, 2, C.sherbet), dot(84, 84, 2, C.lemon), dot(60, 90, 2, C.mint), dot(46, 92, 2, C.lilac)] : []),
];

/** A raspberry jelly from a tiered mould, on a plate. */
const jelly: Draw = (rich) => [
  ground(60, 108, 50, 6),
  piece(ellipse(60, 102, 52, 9), C.china),
  piece(curve(poly([[20, 100], [24, 74], [32, 72], [34, 48], [42, 46], [46, 22], [74, 22], [78, 46], [86, 48], [88, 72], [96, 74], [100, 100]]), 1), C.raspberry),
  ink([[32, 74], [88, 74]], { width: 2.5, color: C.raspberryDark }),
  ink([[42, 48], [78, 48]], { width: 2.5, color: C.raspberryDark }),
  shine([[30, 82], [36, 80], [36, 96], [30, 96]], 0.5),
  shine([[42, 56], [47, 55], [47, 68], [42, 68]], 0.5),
  ...(rich ? [shine([[52, 28], [56, 28], [56, 40], [52, 40]], 0.5), piece(circle(60, 18, 7), C.cherry, { edge: 'cut' })] : []),
];

/** A birthday candle: white with red stripes, and a yellow flame. */
const candle: Draw = (rich) => [
  ground(60, 112, 24, 4),
  piece(rect(44, 40, 32, 70, 5), C.china),
  ...[48, 66, 84].map((y) => flat(poly([[44, y + 8], [76, y - 6], [76, y + 4], [44, y + 18]]), C.toadRed)),
  ink([[60, 40], [60, 32]], { width: 2.5, color: C.ink }),
  piece(curve([[60, 2], [72, 20], [70, 32], [50, 32], [48, 20]], 2), C.flame, { edge: 'cut' }),
  flat(curve([[60, 14], [66, 24], [64, 31], [56, 31], [54, 24]], 2), C.lemon),
  ...(rich ? [flat(curve([[44, 40], [76, 40], [76, 46], [70, 54], [66, 46], [52, 46], [48, 52], [44, 46]], 1), C.white)] : []),
];

/** A present: blue box, yellow ribbon and bow. */
const present: Draw = (rich) => [
  ground(60, 108, 50, 6),
  piece(rect(16, 48, 88, 58, 4), C.giftBlue),
  piece(rect(10, 36, 100, 18, 4), C.giftBlueDark),
  flat(rect(52, 36, 16, 70), C.ribbon),
  piece(ellipse(44, 28, 16, 10, -25), C.ribbon, { edge: 'cut' }),
  piece(ellipse(76, 28, 16, 10, 25), C.ribbon, { edge: 'cut' }),
  piece(circle(60, 33, 7), C.starYellowDark, { edge: 'cut', fibre: false }),
  ...(rich ? [dot(30, 70, 4, C.white, 0.6), dot(86, 88, 4, C.white, 0.6), dot(34, 94, 3, C.white, 0.6), dot(84, 64, 3, C.white, 0.6)] : []),
];

/** A red party balloon on a string. */
const balloon: Draw = (rich) => [
  ink([[60, 92], [54, 102], [64, 110], [58, 118]], { width: 2.5, color: C.ink }),
  piece(curve([[60, 4], [92, 18], [98, 52], [76, 84], [60, 90], [44, 84], [22, 52], [28, 18]], 2), C.balloon),
  piece(poly([[54, 94], [60, 86], [66, 94]]), C.redDark, { edge: 'cut', fibre: false }),
  shine([[34, 28], [44, 18], [48, 22], [38, 40]], 0.55),
  ...(rich ? [dot(46, 44, 3, C.white, 0.5)] : []),
];

/** A stick: an upright twig with one side shoot and a leaf. */
const stick: Draw = (rich) => [
  ground(56, 112, 18, 4),
  piece(band([[58, 108], [60, 66], [64, 8]], 13), C.twig, { edge: 'cut', rough: 1.4 }),
  piece(band([[61, 52], [80, 38], [88, 30]], 6), C.twig, { edge: 'cut' }),
  piece(ellipse(94, 24, 12, 6, -40), C.leaf, { edge: 'cut' }),
  ink([[58, 84], [62, 80]], { width: 2.5, color: C.twigDark }),
  ink([[62, 28], [64, 24]], { width: 2.5, color: C.twigDark }),
  ...(rich ? [ink([[56, 100], [57, 90]], { width: 1.8, color: C.twigDark })] : []),
];

/** A big teal button with four holes and cross-stitched thread. */
const button: Draw = (rich) => [
  ground(60, 106, 42, 6),
  piece(circle(60, 58, 46), C.buttonTeal),
  ink(circle(60, 58, 35), { width: 4, color: C.buttonTealDark, closed: true }),
  ...[[-11, -11], [11, -11], [-11, 11], [11, 11]].map(([x, y]) => dot(60 + x, 58 + y, 6, C.ink)),
  ink([[49, 47], [71, 69]], { width: 3.5, color: C.cream }),
  ink([[71, 47], [49, 69]], { width: 3.5, color: C.cream }),
  ...(rich ? [shine([[28, 44], [38, 30], [42, 34], [32, 48]], 0.4)] : []),
];

/** A round potion bottle full of something magenta, with a cork. */
const potion: Draw = (rich) => [
  ground(60, 112, 34, 5),
  piece(rect(48, 22, 24, 30, 4), C.glass),
  piece(circle(60, 76, 36), C.glass),
  flat(curve([[28, 70], [44, 64], [60, 70], [76, 64], [92, 70], [92, 86], [78, 104], [42, 104], [28, 86]], 2), C.magenta),
  piece(rect(46, 8, 28, 18, 5), C.wood),
  shine([[36, 64], [42, 56], [46, 60], [40, 80]], 0.6),
  dot(70, 84, 3.5, C.white, 0.6),
  dot(58, 92, 2.5, C.white, 0.6),
  ...(rich ? [dot(76, 74, 2, C.white, 0.6), ink([[48, 26], [72, 26]], { width: 3, color: C.ribbon })] : []),
];

/** A bright yellow star. */
const star: Draw = (rich) => [
  piece(curve(starPts(60, 62, 54, 24), 1), C.starYellow),
  flat(curve(starPts(60, 62, 34, 15), 1), C.lemon, 0.7),
  ...(rich ? [glint(98, 18, 0.8)] : []),
];

/** A toy soldier: black busby, red coat, white belts, blue trousers. */
const soldier: Draw = (rich) => [
  ground(60, 114, 22, 4),
  piece(rect(46, 82, 28, 30, 3), C.trouserBlue),
  ink([[60, 86], [60, 112]], { width: 2.5, color: C.night }),
  piece(rect(44, 108, 14, 7, 2), C.ink, { edge: 'cut', fibre: false }),
  piece(rect(62, 108, 14, 7, 2), C.ink, { edge: 'cut', fibre: false }),
  piece(band([[42, 54], [38, 82]], 9), C.coatRed),
  piece(band([[78, 54], [82, 82]], 9), C.coatRed),
  piece(rect(42, 50, 36, 36, 6), C.coatRed),
  ink([[44, 54], [76, 82]], { width: 4, color: C.white }),
  flat(rect(43, 76, 34, 5), C.white),
  piece(circle(60, 42, 11), C.skin, { edge: 'cut' }),
  piece(rect(46, 4, 28, 34, 12), C.ink),
  dot(56, 43, 1.8, C.ink),
  dot(64, 43, 1.8, C.ink),
  flat(ellipse(52, 47, 3, 2), C.pink, 0.8),
  flat(ellipse(68, 47, 3, 2), C.pink, 0.8),
  ...(rich ? [dot(60, 60, 2, C.ribbon), dot(60, 68, 2, C.ribbon), ink([[50, 36], [70, 36]], { width: 2, color: C.ribbon })] : []),
];

/** A teddy bear, sitting. */
const teddy: Draw = (rich) => [
  ground(60, 112, 36, 5),
  piece(circle(34, 22, 12), C.teddy),
  piece(circle(86, 22, 12), C.teddy),
  flat(circle(34, 22, 6), C.teddyLight),
  flat(circle(86, 22, 6), C.teddyLight),
  piece(ellipse(60, 84, 30, 26), C.teddy),
  piece(ellipse(28, 76, 10, 16, 30), C.teddy),
  piece(ellipse(92, 76, 10, 16, -30), C.teddy),
  piece(ellipse(40, 104, 13, 10), C.teddy),
  piece(ellipse(80, 104, 13, 10), C.teddy),
  flat(circle(40, 104, 6), C.teddyLight),
  flat(circle(80, 104, 6), C.teddyLight),
  flat(ellipse(60, 86, 16, 14), C.teddyLight),
  piece(circle(60, 42, 26), C.teddy),
  flat(ellipse(60, 52, 12, 9), C.teddyLight),
  piece(ellipse(60, 48, 5, 3.5), C.ink, { edge: 'clean', shadow: false }),
  dot(50, 38, 3.2, C.ink),
  dot(70, 38, 3.2, C.ink),
  ink([[56, 56], [60, 58], [64, 56]], { width: 2, color: C.ink }),
  ...(rich ? [piece(poly([[48, 66], [60, 72], [72, 66], [72, 78], [60, 72], [48, 78]]), C.toadRed, { edge: 'cut', fibre: false })] : []),
];

/** A snowball: white, with a blue-grey shadow side. */
const snowball: Draw = (rich) => [
  ground(60, 104, 40, 6),
  piece(circle(60, 60, 42), C.snowShade, { rough: 1.6 }),
  flat(circle(54, 54, 34), C.snow),
  dot(40, 44, 3, C.white),
  dot(70, 36, 2.2, C.white),
  ...(rich ? [glint(84, 30, 0.6), dot(50, 76, 2, C.white)] : []),
];

/** A sledge, side on: green slatted seat on gold curly runners. */
const sledge: Draw = (rich) => [
  ground(58, 102, 52, 6),
  piece(rect(30, 72, 8, 22, 2), C.brass, { edge: 'cut' }),
  piece(rect(76, 72, 8, 22, 2), C.brass, { edge: 'cut' }),
  piece(band([[8, 96], [70, 96], [100, 94], [112, 82], [108, 70], [100, 72]], 8), C.brass, { edge: 'cut' }),
  piece(curve([[14, 56], [96, 56], [104, 62], [100, 76], [16, 76]], 1), C.sledgeGreen),
  ink([[22, 66], [94, 66]], { width: 2.5, color: C.sledgeGreenDark }),
  ink([[100, 60], [110, 40], [118, 44]], { width: 2.5, color: C.toadRed }),
  ...(rich ? [shine([[22, 59], [80, 59], [80, 62], [22, 62]], 0.3)] : []),
];

/** An icicle hanging from a lip of snow. */
const icicle: Draw = (rich) => [
  piece(curve(poly([[34, 22], [86, 22], [70, 56], [62, 114], [56, 112], [50, 56]]), 1), C.ice),
  flat(curve([[54, 30], [60, 30], [60, 90], [58, 90]], 1), C.white, 0.6),
  piece(curve([[16, 26], [24, 8], [60, 4], [96, 8], [104, 26], [80, 30], [60, 26], [40, 30]], 2), C.snow, { fibre: C.snowShade }),
  ...(rich ? [glint(76, 50, 0.6)] : []),
];

/** An old brass key. */
const key: Draw = (rich) => [
  group({ transform: 'rotate(-12 60 60)' }, [
    ground(62, 92, 48, 5),
    piece(rect(44, 52, 70, 15, 5), C.brass),
    piece(poly([[88, 62], [114, 62], [114, 84], [106, 84], [106, 76], [98, 76], [98, 86], [88, 86]]), C.brass),
    piece(curve([[30, 32], [44, 38], [52, 60], [44, 82], [30, 88], [16, 82], [8, 60], [16, 38]], 2), C.brass),
    piece(circle(30, 60, 11), C.brassDark, { edge: 'cut', fibre: false, shadow: false }),
    shine([[14, 52], [22, 40], [26, 42], [18, 56]], 0.45),
    ...(rich ? [ink([[52, 56], [86, 56]], { width: 2, color: C.goldLight })] : []),
  ]),
];

export const PROP_ART: Record<PropId, Draw> = {
  popBiscuit,
  toffee,
  acorn,
  saucepan,
  toadstool,
  apple,
  cushion,
  teacup,
  hat,
  googleBun,
  jelly,
  candle,
  present,
  balloon,
  stick,
  button,
  potion,
  star,
  soldier,
  teddy,
  snowball,
  sledge,
  icicle,
  key,
};

/** The drawing of a prop as paper nodes (keepsakes reuse it, `rich` for more detail). */
export function propNodes(id: PropId, rich = false): Node[] {
  return PROP_ART[id](rich);
}

export function prop(id: PropId): string {
  return svg({ w: 120, h: 120, name: 'prop-' + id, boil: false }, propNodes(id));
}
