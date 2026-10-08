/**
 * The host of land 14, the Land of the Red Goblins: `redGoblin`.
 *
 * He is the villain of the second adventure: small and wiry, brick-red,
 * with long pointed ears, a tall floppy cap with a bell, narrow yellow
 * eyes with slit pupils and a sly, toothy grin. Cartoon-menacing, never
 * gory (PLAN.md §2): he sneaks, grabs and shouts, and he never hurts anyone.
 *
 * Extra parts, on top of the usual eyes / lids / brows / mouth / mouthOpen /
 * armL / armR / head / hat / figure: cap (the floppy tail of the cap: flop
 * it), bell (swing it), ears (twitch them), coin (the gold coin on his
 * chest), fingers inside each arm's hand.
 *
 * `goblinFigure()` draws the whole goblin, small, for crowds in stories and
 * the finale: the same head, with legs and a body, in a sneak or a run.
 */
import { C } from '../palette';
import { band, circle, curve, dot, ellipse, group, ink, piece, poly, rect, svg, type Node, type Pt } from '../paper';
import { CUT, FLAT, arm, cx, cy, floor, portrait } from './parts';

// Local colours: nothing here belongs in palette.ts.
const SKIN = '#c9573a';
const SKIN_DARK = '#9a3524';
const SKIN_LIGHT = '#dc7650';
const CAP = '#b02634';
const CAP_DARK = '#7c1a26';
const CAP_LIGHT = '#cf4a4a';
const EYE = '#f2d43a';
const BROW = '#3a1410';
const JERKIN = '#7a4e2c';
const JERKIN_DARK = '#573620';
const SHIRT = '#a8a06a';
const PATCH_A = '#b98a4c';
const PATCH_B = '#5d7c78';
const BOOT = '#4a2e1c';

const mirror = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [300 - x, y] as Pt);

/** A long, grabby hand: a palm and four bony fingers fanned out, pointing along `angle` (degrees, 0 = right). */
function hand(x: number, y: number, angle: number, s = 1): Node {
  const fingers: Node[] = [];
  for (let i = -2; i <= 1; i++) {
    const spread = (i + 0.5) * 17;
    const a = ((angle + spread) * Math.PI) / 180;
    const len = (i === -1 || i === 0 ? 30 : 25) * s;
    const bend = ((angle + spread + 22) * Math.PI) / 180;
    const mx = x + Math.cos(a) * len * 0.6;
    const my = y + Math.sin(a) * len * 0.6;
    const tx = mx + Math.cos(bend) * len * 0.5;
    const ty = my + Math.sin(bend) * len * 0.5;
    fingers.push(piece(band([[x, y], [mx, my], [tx, ty]], 6 * s), SKIN, { edge: 'cut', fibre: false }));
    fingers.push(piece(circle(tx, ty, 2.6 * s), BROW, { edge: 'clean', shadow: false }));
  }
  return group({ part: 'fingers', origin: [x, y] }, [...fingers, piece(circle(x, y, 9.5 * s), SKIN, CUT)]);
}

/** The head, centred on the portrait's face centre (150, 136), with its ears, cap and bell. */
function head(): Node[] {
  const [lx, rx] = [126, 174];
  const ey = 134;
  const almond = (x: number, side: number): Node[] => {
    // Outer corner high, inner corner low: a sly, slanted glare.
    const o = x + side * -22;
    const i = x + side * 21;
    return [
      piece(curve([[o, ey - 11], [x, ey - 14], [i, ey + 5], [x, ey + 9]], 2), EYE, FLAT),
      piece(ellipse(x + side * 1.5, ey - 1, 3.2, 9.5), BROW, { edge: 'clean', shadow: false }),
      dot(x + side * 0.4, ey - 4, 1.2, C.white, 0.8),
      ink([[o - side * 1, ey - 13], [x, ey - 15], [i + side * 3, ey + 5]], { width: 4.4, color: BROW }),
    ];
  };
  const lid = (x: number, side: number): Node[] => [
    piece(ellipse(x, ey - 2, 22, 13, side * 14), SKIN, FLAT),
    ink([[x - 18, ey - 6 + side * -2], [x, ey + 4], [x + 18, ey - 6 + side * 2]], { width: 3, color: BROW }),
  ];
  const browLine = (side: number): Pt[] => [[150 + side * 52, ey - 24], [150 + side * 30, ey - 22], [150 + side * 8, ey - 6]];

  // Teeth hang from the top edge of the grin, pointed but cartoon-small.
  const teeth = (y: number, open: boolean): Node[] => {
    const out: Node[] = [];
    for (let i = -2; i <= 2; i++) {
      const x = cx + i * 13.5;
      const top = y - Math.abs(i) * 3.2;
      out.push(piece(poly([[x - 6.2, top], [x + 6.2, top], [x + (i === 1 ? 1 : 0), top + 13 - Math.abs(i) * 1.6]]), i === 1 ? C.gold : C.white, { edge: 'clean', shadow: false }));
    }
    for (const s of [-1, 1]) {
      const x = cx + s * 20;
      const base = y + (open ? 21 : 13) - 2.5;
      out.push(piece(poly([[x - 4.5, base], [x + 4.5, base], [x, base - 8]]), C.white, { edge: 'clean', shadow: false }));
    }
    return out;
  };

  const grin = (open: boolean): Node[] => {
    const d = open ? 8 : 0;
    return [
      piece(curve([[cx - 40, 177], [cx - 20, 186], [cx, 188], [cx + 20, 186], [cx + 40, 177], [cx + 33, 193 + d], [cx, 203 + d], [cx - 33, 193 + d]], 2), BROW, { edge: 'clean', shadow: false }),
      ...(open ? [piece(ellipse(cx, 200 + d / 2, 17, 6), C.rose, { edge: 'clean', shadow: false })] : []),
      ...teeth(186, open),
      // cheek creases at the corners of the grin
      ink([[cx - 46, 172], [cx - 41, 180], [cx - 36, 183]], { width: 3, color: SKIN_DARK }),
      ink([[cx + 46, 172], [cx + 41, 180], [cx + 36, 183]], { width: 3, color: SKIN_DARK }),
    ];
  };

  const earL: Pt[] = [[100, 110], [62, 98], [6, 56], [20, 114], [54, 156], [102, 166]];
  const earInL: Pt[] = [[93, 124], [64, 110], [26, 80], [38, 120], [60, 146], [94, 152]];

  return [
    group({ part: 'ears', origin: [cx, 130] }, [
      piece(poly(earL), SKIN_DARK),
      piece(poly(earInL), SKIN_LIGHT, FLAT),
      piece(poly(mirror(earL)), SKIN_DARK),
      piece(poly(mirror(earInL)), SKIN_LIGHT, FLAT),
    ]),
    // the head: wide at the brow, narrowing to a sharp chin
    piece(curve([[150, 76], [200, 94], [212, 136], [198, 176], [170, 206], [150, 216], [130, 206], [102, 176], [88, 136], [100, 94]], 3), SKIN),
    // brow ridge and cheek shadows, printed on the head
    piece(curve([[92, 120], [150, 106], [208, 120], [200, 140], [150, 124], [100, 140]], 2), SKIN_DARK, { ...FLAT, opacity: 0.35 }),
    piece(ellipse(106, 168, 12, 8, -20), SKIN_DARK, { ...FLAT, opacity: 0.3 }),
    piece(ellipse(194, 168, 12, 8, 20), SKIN_DARK, { ...FLAT, opacity: 0.3 }),
    // warts
    dot(193, 150, 3.4, SKIN_DARK, 0.7),
    dot(112, 156, 2.6, SKIN_DARK, 0.7),
    group({ part: 'eyes', origin: [cx, ey] }, [...almond(lx, -1), ...almond(rx, 1)]),
    group({ part: 'lids', opacity: 0 }, [...lid(lx, -1), ...lid(rx, 1)]),
    group({ part: 'brows', origin: [cx, ey - 20] }, [
      ink(browLine(-1), { width: 7, color: BROW }),
      ink(browLine(1), { width: 7, color: BROW }),
    ]),
    // a long, hooked nose
    piece(poly([[143, 138], [157, 138], [172, 170], [166, 179], [149, 177], [140, 170]]), SKIN_LIGHT, CUT),
    ink([[146, 173], [157, 179], [168, 172]], { width: 2.6, color: SKIN_DARK }),
    group({ part: 'mouth', origin: [cx, 188] }, grin(false)),
    group({ part: 'mouthOpen', origin: [cx, 188], opacity: 0 }, grin(true)),
    // the cap: a band over the brow and a long floppy tail
    group({ part: 'hat', origin: [cx, 100] }, [
      group({ part: 'cap', origin: [150, 90] }, [
        piece(curve([[98, 110], [106, 68], [132, 28], [172, 8], [222, 16], [256, 50], [268, 108], [250, 84], [224, 60], [192, 62], [204, 110]], 2), CAP),
        piece(curve([[118, 100], [124, 64], [146, 34], [176, 20], [160, 52], [152, 96]], 2), CAP_LIGHT, { ...FLAT, opacity: 0.45 }),
        // a patch, with stitches
        piece(poly([[156, 40], [180, 36], [184, 58], [160, 62]]), PATCH_A, CUT),
        ink([[158, 42], [162, 41], [166, 41]], { width: 1.6, color: BROW }),
        ink([[160, 60], [166, 59], [172, 59]], { width: 1.6, color: BROW }),
        group({ part: 'bell', origin: [268, 112] }, [
          ink([[266, 100], [268, 112]], { width: 3, color: C.brassDark }),
          piece(circle(268, 122, 12), C.gold, CUT),
          piece(ellipse(268, 128, 5, 2.4), C.brassDark, { edge: 'clean', shadow: false }),
          dot(263, 117, 2.8, C.goldLight),
        ]),
      ]),
      piece(curve([[88, 114], [106, 98], [150, 90], [194, 98], [212, 114], [210, 130], [150, 118], [90, 130]], 2), CAP_DARK),
      ink([[104, 114], [150, 106], [196, 114]], { width: 2, color: CAP_LIGHT, opacity: 0.6 }),
    ]),
  ];
}

/** The patched brown jerkin, from the shoulders down. */
function jerkin(): Node[] {
  return [
    // his scrawny neck
    piece(poly([[134, 196], [166, 196], [170, 252], [130, 252]]), SKIN_DARK, { fibre: false }),
    piece(curve([[60, 345], [66, 286], [100, 252], [150, 244], [200, 252], [234, 286], [240, 345]], 2), JERKIN),
    // the shirt showing through the open front
    piece(poly([[122, 250], [178, 250], [150, 304]]), SHIRT, CUT),
    // lacing
    ...[262, 276, 290].flatMap((y) => [ink([[134 + (y - 262) * 0.3, y - 2], [166 - (y - 262) * 0.3, y + 6]], { width: 2.4, color: JERKIN_DARK }), ink([[166 - (y - 262) * 0.3, y - 2], [134 + (y - 262) * 0.3, y + 6]], { width: 2.4, color: JERKIN_DARK })]),
    // patches with stitches
    piece(poly([[82, 300], [112, 296], [116, 326], [86, 330]]), PATCH_A, CUT),
    ink([[85, 302], [92, 301], [99, 300], [106, 299]], { width: 1.8, color: JERKIN_DARK }),
    ink([[89, 326], [96, 325], [103, 325], [110, 324]], { width: 1.8, color: JERKIN_DARK }),
    piece(poly([[194, 284], [226, 290], [220, 318], [190, 314]]), PATCH_B, CUT),
    ink([[196, 288], [204, 289], [212, 291], [220, 292]], { width: 1.8, color: JERKIN_DARK }),
    ink([[193, 311], [200, 312], [208, 314], [216, 315]], { width: 1.8, color: JERKIN_DARK }),
    // shoulder seams
    ink([[102, 256], [88, 290]], { width: 2.4, color: JERKIN_DARK, opacity: 0.8 }),
    ink([[198, 256], [212, 290]], { width: 2.4, color: JERKIN_DARK, opacity: 0.8 }),
    // a stolen gold coin on a string
    group({ part: 'coin', origin: [150, 262] }, [
      ink([[132, 246], [150, 292], [168, 246]], { width: 1.6, color: JERKIN_DARK }),
      piece(circle(150, 296, 9), C.gold, CUT),
      piece(circle(150, 296, 5), C.goldLight, { ...FLAT, opacity: 0.8 }),
    ]),
  ];
}

export function redGoblin(): string {
  return portrait('redGoblin', 'The Red Goblin', [
    floor(100, 336),
    group({ part: 'figure', origin: [150, 340] }, [
      ...jerkin(),
      group({ part: 'head', origin: [cx, 210] }, head()),
      // skinny arms, hands up and grabby
      arm('armL', { from: [96, 270], via: [56, 270], to: [40, 226], sleeve: SKIN, width: 17, hand: false, holding: [hand(40, 226, -120)] }),
      arm('armR', { from: [204, 270], via: [244, 270], to: [260, 226], sleeve: SKIN, width: 17, hand: false, holding: [hand(260, 226, -60)] }),
    ]),
  ]);
}

export type GoblinPose = 'sneak' | 'run';

export interface GoblinFigureOpts {
  pose?: GoblinPose;
  /** Something he is carrying, in the figure's own 240 × 340 coordinates (a sack, a drum). */
  carry?: Node[];
  /** Face left instead of right. */
  flip?: boolean;
}

/** A curly-toed boot at (x, y) pointing along `dir` (1 = right, -1 = left). */
function boot(x: number, y: number, dir: number): Node {
  const p = (dx: number, dy: number): Pt => [x + dx * dir, y + dy];
  return piece(curve([p(-12, -14), p(8, -14), p(28, -4), p(40, -18), p(42, 0), p(30, 8), p(-14, 8)], 2), BOOT);
}

/**
 * The whole goblin, small (240 × 340, feet on y = 326), for crowds. Same head
 * as the portrait. Parts: figure, torso, head (and its eyes, mouth, cap …),
 * armL, armR, legL, legR.
 */
export function goblinFigure(name = 'goblinFigure', o: GoblinFigureOpts = {}): string {
  const run = o.pose === 'run';
  const lean = run ? 11 : 4;
  const leg = (part: 'legL' | 'legR', pts: Pt[], foot: Pt, dir: number): Node =>
    group({ part, origin: pts[0] }, [piece(band(pts, 15), SKIN_DARK, { edge: 'cut', fibre: false }), boot(foot[0], foot[1], dir)]);
  const legs = run
    ? [leg('legL', [[108, 214], [88, 262], [56, 290]], [56, 290], -1), leg('legR', [[132, 214], [162, 252], [170, 316]], [170, 318], 1)]
    : [leg('legL', [[108, 214], [88, 262], [102, 316]], [102, 318], -1), leg('legR', [[132, 214], [158, 258], [142, 316]], [142, 318], 1)];
  const arms = run
    ? [
        arm('armL', { from: [98, 152], via: [70, 160], to: [58, 128], sleeve: SKIN, width: 11, hand: false, holding: [hand(58, 128, -130, 0.62)] }),
        arm('armR', { from: [142, 152], via: [176, 158], to: [200, 134], sleeve: SKIN, width: 11, hand: false, holding: [hand(200, 134, -30, 0.62)] }),
      ]
    : [
        arm('armL', { from: [98, 152], via: [76, 184], to: [84, 222], sleeve: SKIN, width: 11, hand: false, holding: [hand(84, 222, 100, 0.62)] }),
        arm('armR', { from: [142, 152], via: [178, 160], to: [204, 142], sleeve: SKIN, width: 11, hand: false, holding: [hand(204, 142, -20, 0.62)] }),
      ];
  const body: Node[] = [
    piece(curve([[86, 220], [90, 164], [104, 140], [136, 140], [150, 164], [154, 220]], 2), JERKIN),
    piece(poly([[112, 140], [128, 140], [120, 168]]), SHIRT, CUT),
    piece(poly([[92, 192], [106, 190], [108, 206], [94, 208]]), PATCH_A, CUT),
    piece(rect(86, 206, 68, 9), JERKIN_DARK, { edge: 'cut', fibre: false }),
  ];
  return svg({ w: 240, h: 340, name, label: 'A red goblin', className: 'figure' }, [
    piece(ellipse(120, 328, 74, 9), 'rgba(40,25,10,0.18)', FLAT),
    group({ part: 'figure', origin: [120, 326], transform: o.flip ? 'translate(240 0) scale(-1 1)' : undefined }, [
      ...legs,
      group({ part: 'torso', origin: [120, 214], transform: `rotate(${lean})` }, [
        ...body,
        group({ part: 'headBox', transform: `translate(120 92) scale(0.56) translate(${-cx} ${-cy})` }, [group({ part: 'head', origin: [cx, 210] }, head())]),
        ...arms,
        ...(o.carry ?? []),
      ]),
    ]),
  ]);
}

export const L14_CHARACTERS: Record<string, () => string> = {
  redGoblin,
};
