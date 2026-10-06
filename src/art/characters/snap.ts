/**
 * Dame Snap, the villain: a towering headmistress, all angles. A black gown
 * with sharp shoulders and a stiff chalk-white collar, a bun like a
 * doorknob (with a pencil stuck through it), eyebrows like snapped twigs, a
 * pinched mouth and a long red ruler.
 *
 * Properly menacing, but a paper cut-out: she looms, points, shrieks and
 * stomps, and she never touches anyone (PLAN.md §2). The ruler is for
 * snapping on desks.
 *
 * `dameSnap()` is her everyday portrait; `dameSnapPose(pose)` gives the
 * finale poses. All are 300 × 340 with her face in the chip box.
 *
 * Parts (every pose): figure, head, bun, eyes, brows, mouth, armL, armR,
 * ruler (inside the arm holding it). The everyday portrait also has lids
 * and mouthOpen. Pose extras: shadow (loom), shriek (the lines round her
 * head), dust (stomp), rulerBits (defeated: the two halves).
 */
import { C } from '../palette';
import { band, circle, curve, dot, ellipse, group, ink, piece, poly, rect, type Node, type Pt } from '../paper';
import { CUT, cx, eyes, FLAT, mouthShape, portrait, talkShape } from './parts';

export type SnapPose = 'loom' | 'point' | 'shriek' | 'stomp' | 'defeated';

const SKIN = C.snapSkin;
const GOWN = C.snapInk;
const HAIR = C.hairBlack;
const TWIG = C.snapTwig;
const EYE = '#6f8c86';

/** Mirror a point about the centre line. */
const mx = ([x, y]: Pt): Pt => [300 - x, y];

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

type BrowMood = 'cross' | 'fury' | 'droop';

/**
 * Eyebrows like snapped twigs: each is two stiff pieces with a kink where
 * it broke, plus a little spur sticking out.
 */
function twigBrows(mood: BrowMood, y = 112): Node {
  const one = (mirror: boolean): Node[] => {
    const f = mirror ? mx : (p: Pt) => p;
    let a: Pt[];
    let b: Pt[];
    let spur: Pt[];
    if (mood === 'droop') {
      a = [[98, y + 6], [114, y - 2]];
      b = [[117, y - 2], [134, y - 6]];
      spur = [[110, y], [104, y + 10]];
    } else if (mood === 'fury') {
      a = [[96, y - 16], [116, y - 6]];
      b = [[118, y - 9], [138, y + 8]];
      spur = [[108, y - 10], [102, y - 22]];
    } else {
      a = [[98, y - 10], [116, y - 4]];
      b = [[118, y - 7], [136, y + 4]];
      spur = [[108, y - 7], [103, y - 17]];
    }
    return [
      ink(a.map(f), { width: 6, color: TWIG, wobble: 0.3 }),
      ink(b.map(f), { width: 5.5, color: TWIG, wobble: 0.3 }),
      ink(spur.map(f), { width: 3, color: TWIG, wobble: 0.3 }),
    ];
  };
  return group({ part: 'brows', origin: [cx, y] }, [...one(false), ...one(true)]);
}

/** Her long, angular head (and pointed chin). */
const headShape = (): Pt[] =>
  curve([[110, 86], [150, 70], [190, 86], [202, 128], [194, 172], [172, 204], [150, 216], [128, 204], [106, 172], [98, 128]], 1);

/** Hair scraped tight back from a centre parting. Loose: wisps escaping (defeated). */
function hairCap(loose = false): Node[] {
  const out: Node[] = [piece(curve([[98, 134], [100, 92], [150, 66], [200, 92], [202, 134], [190, 104], [150, 88], [110, 104]], 2), HAIR)];
  out.push(ink([[150, 70], [150, 88]], { width: 2, color: C.slate }));
  if (loose) {
    out.push(ink([[104, 100], [84, 92], [76, 104]], { width: 3, color: HAIR }));
    out.push(ink([[196, 96], [216, 82], [226, 92]], { width: 3, color: HAIR }));
    out.push(ink([[130, 74], [122, 54], [130, 44]], { width: 3, color: HAIR }));
    out.push(ink([[172, 76], [184, 58]], { width: 3, color: HAIR }));
  }
  return out;
}

/** The bun: a round knob on a short neck, with a shine, and a pencil through it. */
function bun(tilt = 0, undone = false): Node {
  const nodes: Node[] = undone
    ? [
        // unravelled: a sad loose coil flopping to one side
        piece(curve([[140, 72], [160, 72], [206, 58], [236, 80], [232, 120], [214, 104], [196, 84], [166, 82]], 2), HAIR),
        ink([[208, 74], [222, 90], [220, 104]], { width: 2, color: C.slate }),
        piece(band([[236, 128], [276, 150]], 6), C.yellow, { edge: 'cut' }),
        piece(poly([[276, 147], [286, 153], [274, 154]]), C.sand, FLAT),
      ]
    : [
        piece(rect(138, 52, 24, 22, 4), HAIR),
        piece(circle(150, 34, 25), HAIR),
        piece(ellipse(141, 24, 9, 6, -30), C.white, { ...FLAT, opacity: 0.35 }),
        piece(band([[120, 8], [186, 58]], 6), C.yellow, { edge: 'cut' }),
        piece(poly([[184, 54], [196, 64], [186, 62]]), C.sand, FLAT),
        piece(band([[116, 5], [122, 10]], 6), C.rose, { edge: 'clean', shadow: false }),
      ];
  return group({ part: 'bun', origin: [150, 70], transform: tilt ? `rotate(${tilt})` : undefined }, nodes);
}

/** Her hooked nose and a pair of pince-nez on a chain. */
function noseAndSpecs(): Node[] {
  return [
    piece(poly([[148, 128], [166, 168], [158, 174], [146, 172]]), SKIN, CUT),
    ink([[146, 172], [156, 175]], { width: 2, color: C.snapShade }),
    ink(ringPts(124, 142, 15), { width: 2.5, color: C.gold, closed: true }),
    ink(ringPts(176, 142, 15), { width: 2.5, color: C.gold, closed: true }),
    ink([[139, 140], [161, 140]], { width: 2.5, color: C.gold }),
    ink([[109, 146], [102, 190], [112, 228]], { width: 1.5, color: C.gold, opacity: 0.8 }),
  ];
}

function ringPts(x: number, y: number, r: number): Pt[] {
  return Array.from({ length: 18 }, (_, i) => [x + Math.cos((i / 18) * Math.PI * 2) * r, y + Math.sin((i / 18) * Math.PI * 2) * r * 0.86] as Pt);
}

/** Bony cheekbones and the lines of a lifelong frown. */
const shading = (): Node[] => [
  ink([[110, 162], [124, 178]], { width: 2.5, color: C.snapShade }),
  ink([[190, 162], [176, 178]], { width: 2.5, color: C.snapShade }),
  ink([[150, 104], [150, 116]], { width: 2, color: C.snapShade }),
];

/** The black gown with sharp shoulders and a stiff white collar. `slump` drops the shoulders. */
function gown(slump = 0): Node[] {
  const s = slump;
  return [
    piece(poly([[18, 345], [24, 268 + s], [52, 238 + s], [108, 226 + s / 2], [150, 232], [192, 226 + s / 2], [248, 238 + s], [276, 268 + s], [282, 345]]), GOWN),
    // pleats
    ink([[96, 270], [88, 345]], { width: 2, color: C.charcoal }),
    ink([[204, 270], [212, 345]], { width: 2, color: C.charcoal }),
    // a neck, the stiff collar points, and a ruby brooch
    piece(poly([[134, 196], [166, 196], [164, 240], [136, 240]]), SKIN, { fibre: false }),
    piece(poly([[150, 240], [104, 204], [92, 238], [130, 256]]), C.chalk, { edge: 'cut' }),
    piece(poly([[150, 240], [196, 204], [208, 238], [170, 256]]), C.chalk, { edge: 'cut' }),
    piece(curve([[150, 244], [160, 254], [150, 266], [140, 254]], 1), C.ruler, CUT),
    dot(147, 252, 2, C.white, 0.7),
  ];
}

/** A long bony hand: a palm and fingers fanned in the direction `dir` (degrees). */
function hand(x: number, y: number, dir: number, o: { spread?: number; fist?: boolean; point?: boolean } = {}): Node[] {
  const out: Node[] = [];
  const rad = (d: number) => (d * Math.PI) / 180;
  if (!o.fist) {
    const spread = o.spread ?? 14;
    const n = o.point ? 1 : 4;
    for (let i = 0; i < n; i++) {
      const a = rad(dir + (o.point ? 0 : (i - 1.5) * spread));
      const len = o.point ? 38 : 30;
      out.push(piece(band([[x, y], [x + Math.cos(a) * len, y + Math.sin(a) * len]], 8), SKIN, { edge: 'cut', fibre: false }));
    }
    // the thumb
    const t = rad(dir + (o.point ? -70 : -60));
    out.push(piece(band([[x, y], [x + Math.cos(t) * 20, y + Math.sin(t) * 20]], 8), SKIN, { edge: 'cut', fibre: false }));
  }
  out.push(piece(circle(x, y, o.fist ? 15 : 13), SKIN, CUT));
  if (o.fist) out.push(ink([[x - 7, y - 4], [x + 7, y - 6]], { width: 1.8, color: C.snapShade }));
  return out;
}

/** The ruler, with chalk tick marks, from a to b. */
function ruler(a: Pt, b: Pt, w = 16): Node[] {
  const out: Node[] = [piece(band([a, b], w), C.ruler, { edge: 'cut' })];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const [ux, uy] = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  const [px, py] = [-uy, ux];
  for (let d = 14; d < len - 8; d += 14) {
    const big = Math.round(d / 14) % 2 === 0;
    const x = a[0] + ux * d + px * (w / 2 - 1);
    const y = a[1] + uy * d + py * (w / 2 - 1);
    const k = big ? 7 : 4;
    out.push(ink([[x, y], [x - px * k, y - py * k]], { width: 1.5, color: C.chalk, wobble: 0.2 }));
  }
  return out;
}

/** A sleeve (pivoting at the shoulder) with whatever the hand is doing. */
function sleeve(part: 'armL' | 'armR', pts: Pt[], kids: Node[], w = 34): Node {
  return group({ part, origin: pts[0] }, [piece(band(pts, w), GOWN), ...kids]);
}

// ---------------------------------------------------------------------------
// Faces
// ---------------------------------------------------------------------------

interface FaceBits {
  brows: BrowMood;
  eyes: Node[];
  mouth: Node[];
  bun?: Node;
  loose?: boolean;
  extra?: Node[];
}

function head(b: FaceBits, transform?: string, withTalk = false): Node {
  return group({ part: 'head', origin: [150, 214], transform }, [
    b.bun ?? bun(),
    piece(headShape(), SKIN),
    ...shading(),
    ...hairCap(b.loose),
    ...b.eyes,
    twigBrows(b.brows),
    group({ part: 'mouth', origin: [150, 186] }, b.mouth),
    ...(withTalk ? [group({ part: 'mouthOpen', origin: [150, 186], opacity: 0 }, talkShape(150, 184, 0.9))] : []),
    ...noseAndSpecs(),
    ...(b.extra ?? []),
  ]);
}

const sharpEyes = (): Node[] => eyes({ skin: SKIN, eyes: 'narrow', eyeCol: EYE, eyeDx: 26, eyeY: 6 });
const glintEyes = (): Node[] => [
  ...eyes({ skin: SKIN, eyes: 'narrow', eyeCol: C.starGold, eyeDx: 26, eyeY: 6, noBlink: true }),
  dot(126, 140, 1.8, C.white),
  dot(178, 140, 1.8, C.white),
];

/** Screwed-up eyes, shut tight (shrieking). */
const squeezed = (): Node[] => [
  group({ part: 'eyes', origin: [150, 142] }, [
    ink([[112, 136], [128, 144], [112, 150]], { width: 4, color: C.ink }),
    ink([[188, 136], [172, 144], [188, 150]], { width: 4, color: C.ink }),
  ]),
];

/** Sad, downcast eyes (defeated). */
const downcast = (): Node[] => [
  group({ part: 'eyes', origin: [150, 144] }, [
    piece(ellipse(124, 146, 12, 6), C.white, FLAT),
    piece(ellipse(176, 146, 12, 6), C.white, FLAT),
    piece(circle(124, 148, 4.5), EYE, { edge: 'clean', shadow: false }),
    piece(circle(176, 148, 4.5), EYE, { edge: 'clean', shadow: false }),
    ink([[110, 144], [124, 140], [138, 144]], { width: 3.4, color: C.ink }),
    ink([[162, 144], [176, 140], [190, 144]], { width: 3.4, color: C.ink }),
  ]),
];

/** A wide-open shouting mouth with a top row of teeth. */
function shout(big = 1): Node[] {
  const y = 186;
  return [
    piece(curve([[150 - 18 * big, y - 6], [150 + 18 * big, y - 6], [150 + 14 * big, y + 16 * big], [150, y + 22 * big], [150 - 14 * big, y + 16 * big]], 2), C.redDark, FLAT),
    piece(ellipse(150, y + 14 * big, 9 * big, 5 * big), C.rose, { edge: 'clean', shadow: false }),
    piece(rect(150 - 14 * big, y - 6, 28 * big, 6, 1), C.chalk, { edge: 'clean', shadow: false }),
  ];
}

/** Teeth gritted in fury. */
function gritted(): Node[] {
  return [
    piece(rect(128, 180, 44, 14, 4), C.chalk, CUT),
    ink([[128, 187], [172, 187]], { width: 1.5, color: C.snapShade }),
    ...[139, 150, 161].map((x) => ink([[x, 181], [x, 193]], { width: 1.5, color: C.snapShade })),
    ink([[126, 180], [174, 180], [174, 194], [126, 194]], { width: 2.5, color: C.redDark, closed: true }),
  ];
}

/** A thin, cruel smile (looming). */
const slySmile = (): Node[] => [
  ink([[126, 182], [140, 190], [160, 190], [178, 178]], { width: 3.5, color: C.redDark }),
  ink([[178, 178], [182, 172]], { width: 2, color: C.redDark }),
];

/** A wobbly downturned mouth (defeated). */
const wobble = (): Node[] => [ink([[130, 194], [138, 188], [146, 192], [154, 188], [162, 192], [170, 196]], { width: 3.4, color: C.redDark })];

// ---------------------------------------------------------------------------
// Portraits
// ---------------------------------------------------------------------------

/** The everyday portrait: upright and disapproving, ruler at the ready. */
export function dameSnap(): string {
  return portrait('dameSnap', 'Dame Snap', [
    group({ part: 'figure', origin: [150, 340] }, [
      ...gown(),
      head({ brows: 'cross', eyes: sharpEyes(), mouth: mouthShape('pinched', 150, 186) }, undefined, true),
      // one hand on her hip
      sleeve('armL', [[56, 262], [30, 300], [74, 326]], hand(78, 326, 10, { fist: true })),
      // the ruler, held up like a sceptre
      sleeve('armR', [[244, 262], [268, 300], [228, 304]], [group({ part: 'ruler', origin: [228, 304] }, ruler([214, 340], [262, 104])), ...hand(230, 302, 180, { fist: true })]),
    ]),
  ]);
}

/** Looming over you: bigger, leaning in, hands spread like a cloak. */
function loom(): Node[] {
  return [
    group({ part: 'shadow', origin: [150, 340] }, [
      piece(poly([[0, 345], [4, 250], [20, 120], [14, 40], [60, 110], [96, 70], [118, 10], [150, -4], [182, 10], [204, 70], [240, 110], [286, 40], [280, 120], [296, 250], [300, 345]]), GOWN, { ...FLAT, opacity: 0.2 }),
    ]),
    group({ part: 'figure', origin: [150, 340], transform: 'scale(1.08)' }, [
      sleeve('armL', [[60, 258], [26, 210], [30, 150]], hand(30, 146, -110, { spread: 18 }), 34),
      sleeve('armR', [[240, 258], [274, 210], [270, 150]], [group({ part: 'ruler', origin: [270, 150] }, ruler([268, 186], [290, 40], 14)), ...hand(270, 146, -70, { spread: 18 })], 34),
      ...gown(-8),
      head({ brows: 'fury', eyes: glintEyes(), mouth: slySmile() }, 'translate(0 6)'),
    ]),
  ];
}

/** Pointing straight at you: "YOU!" */
function point(): Node[] {
  return [
    group({ part: 'figure', origin: [150, 340] }, [
      ...gown(),
      sleeve('armL', [[56, 262], [34, 304], [62, 336]], [group({ part: 'ruler', origin: [62, 330] }, ruler([46, 345], [96, 170])), ...hand(62, 330, 0, { fist: true })]),
      head({ brows: 'fury', eyes: sharpEyes(), mouth: shout(0.8) }, 'rotate(-4)'),
      sleeve('armR', [[244, 262], [270, 236], [284, 214]], hand(284, 212, -30, { point: true }), 32),
    ]),
  ];
}

/** Shrieking, head back, arms up, ruler high. */
function shriek(): Node[] {
  const lines = (x: number, y: number, a: number): Node => {
    const r = (a * Math.PI) / 180;
    const [ux, uy] = [Math.cos(r), Math.sin(r)];
    return ink([[x, y], [x + ux * 14 - uy * 5, y + uy * 14 + ux * 5], [x + ux * 26 + uy * 5, y + uy * 26 - ux * 5]], { width: 4, color: C.ruler });
  };
  return [
    group({ part: 'shriek' }, [lines(80, 70, -140), lines(64, 130, 180), lines(220, 70, -40), lines(236, 130, 0), lines(150, 0, -90)]),
    group({ part: 'figure', origin: [150, 340] }, [
      sleeve('armL', [[58, 260], [30, 200], [52, 140]], hand(52, 134, -80, { fist: true })),
      sleeve('armR', [[242, 260], [270, 200], [248, 140]], [group({ part: 'ruler', origin: [248, 140] }, ruler([240, 170], [210, 6], 14)), ...hand(248, 136, -100, { fist: true })]),
      ...gown(-6),
      head({ brows: 'fury', eyes: squeezed(), mouth: shout(1.35), bun: bun(-8) }, 'rotate(-3)'),
    ]),
  ];
}

/** Stomping in a rage, ruler gripped in both fists, dust flying. */
function stomp(): Node[] {
  const puff = (x: number, y: number, r: number) => piece(circle(x, y, r), C.cloudShade, { ...CUT, opacity: 0.9 });
  return [
    group({ part: 'figure', origin: [150, 340], transform: 'rotate(4)' }, [
      ...gown(4),
      head({ brows: 'fury', eyes: sharpEyes(), mouth: gritted(), bun: bun(10) }, 'translate(0 8)'),
      sleeve('armL', [[56, 266], [52, 316], [100, 300]], hand(100, 298, 0, { fist: true })),
      sleeve('armR', [[244, 266], [248, 316], [200, 300]], [group({ part: 'ruler', origin: [150, 300] }, ruler([40, 302], [262, 290], 16)), ...hand(200, 298, 180, { fist: true })]),
      // wobble lines by the bun
      ink([[110, 30], [100, 22]], { width: 3, color: C.ink }),
      ink([[192, 26], [204, 18]], { width: 3, color: C.ink }),
    ]),
    group({ part: 'dust' }, [puff(28, 326, 16), puff(52, 334, 12), puff(14, 304, 9), puff(272, 326, 16), puff(250, 336, 11), puff(288, 302, 9)]),
  ];
}

/** Defeated: ruler snapped in two, bun come undone, shoulders slumped. */
function defeated(): Node[] {
  return [
    group({ part: 'figure', origin: [150, 340] }, [
      ...gown(14),
      head({ brows: 'droop', eyes: downcast(), mouth: wobble(), bun: bun(0, true), loose: true, extra: [piece(curve([[206, 120], [212, 112], [216, 124], [211, 130]], 1), C.dew, CUT)] }, 'translate(0 10) rotate(6)'),
      sleeve('armL', [[54, 276], [40, 312], [60, 340]], [group({ part: 'ruler', origin: [70, 330] }, ruler([62, 336], [104, 278])), ...hand(64, 336, 90, { fist: true })]),
      sleeve('armR', [[246, 276], [262, 312], [244, 340]], hand(244, 338, 90, { fist: true })),
      group({ part: 'rulerBits' }, [...ruler([180, 334], [236, 306]), ink([[104, 278], [100, 272], [108, 270]], { width: 2, color: C.chalk })]),
    ]),
  ];
}

const POSES: Record<SnapPose, () => Node[]> = { loom, point, shriek, stomp, defeated };

/** Dame Snap in one of her finale poses. */
export function dameSnapPose(pose: SnapPose): string {
  return portrait(`dameSnap-${pose}`, 'Dame Snap', POSES[pose]());
}

export const snap: Record<string, () => string> = { dameSnap };
