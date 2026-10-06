/**
 * The Folk of the Faraway Tree: Moon-Face, Silky, the Saucepan Man, Dame
 * Washalot, Mr Watzisname, the Angry Pixie and Mr Oom Boom Boom.
 *
 * Every portrait has the common parts listed in parts.ts (figure, head,
 * eyes, lids, brows, mouth, mouthOpen, armL, armR, and hat where there is
 * one), plus the extras named above each function.
 */
import { C } from '../palette';
import { band, circle, curve, dot, ellipse, group, ink, piece, poly, rect, type Node, type Pt } from '../paper';
import { arm, CUT, cx, cy, eyes, FLAT, fluff, person, star, torso } from './parts';

/** A dewdrop (a teardrop with its point at `tip` and its round end at `c`). */
export function drop(tip: Pt, c: Pt, r: number): Pt[] {
  const dx = c[0] - tip[0];
  const dy = c[1] - tip[1];
  const l = Math.hypot(dx, dy) || 1;
  const [ux, uy] = [dx / l, dy / l];
  const [px, py] = [-uy, ux];
  const at = (a: number, b: number): Pt => [c[0] + ux * a * r + px * b * r, c[1] + uy * a * r + py * b * r];
  return curve([tip, tip, at(-0.3, 0.95), at(0.6, 0.85), at(1, 0), at(0.6, -0.85), at(-0.3, -0.95)], 3);
}

/** A Z for snoring. */
const zed = (x: number, y: number, s: number, color: string = C.slate): Node =>
  ink([[x, y], [x + s, y], [x, y + s], [x + s, y + s]], { width: Math.max(3, s / 5), color, wobble: 0.4 });

// ---------------------------------------------------------------------------

/** Moon-Face. Extra parts: glow (the shine round his face). */
export function moonface(): string {
  const skin = C.moon;
  const coat = C.blue;
  const sparkle = (x: number, y: number, r: number) => piece(star(x, y, r, 18), C.starGold, CUT);
  const coatStar = (x: number, y: number, r: number, rot: number) => piece(star(x, y, r, rot), C.starGold, CUT);
  return person({
    name: 'moonface',
    label: 'Moon-Face',
    skin,
    neck: false,
    ears: false,
    headShape: circle(cx, cy, 70),
    back: [
      group({ part: 'glow', origin: [cx, cy] }, [
        piece(circle(cx, cy, 100), C.moonLight, { ...FLAT, opacity: 0.35 }),
        piece(circle(cx, cy, 86), C.moonLight, { ...FLAT, opacity: 0.55 }),
        sparkle(46, 64, 9),
        sparkle(256, 52, 11),
        sparkle(30, 168, 7),
        sparkle(272, 160, 8),
      ]),
    ],
    body: [
      torso(coat, 8, 218),
      // turned-up collar either side of his chin
      piece(poly([[78, 236], [60, 196], [118, 214], [128, 252]]), C.blueDark),
      piece(poly([[222, 236], [240, 196], [182, 214], [172, 252]]), C.blueDark),
      piece(poly([[150, 214], [176, 345], [124, 345]]), C.blueDark, { fibre: false }),
      ...[262, 292, 322].map((y) => piece(circle(150, y, 7), C.gold, CUT)),
      coatStar(92, 290, 11, 10),
      coatStar(206, 300, 10, -14),
      coatStar(118, 328, 8, 24),
      coatStar(236, 334, 9, 4),
      coatStar(66, 330, 7, -8),
    ],
    onHead: [
      // the shaded side of the moon, and a few soft craters
      piece(curve([[188, 82], [222, 120], [222, 164], [190, 200], [204, 150], [204, 116]], 2), C.moonShade, { ...FLAT, opacity: 0.55 }),
      piece(circle(118, 96, 7), C.moonShade, { ...FLAT, opacity: 0.45 }),
      piece(circle(104, 112, 4), C.moonShade, { ...FLAT, opacity: 0.45 }),
      piece(circle(190, 94, 5), C.moonShade, { ...FLAT, opacity: 0.45 }),
      piece(ellipse(120, 92, 22, 9, -30), C.moonLight, { ...FLAT, opacity: 0.8 }),
    ],
    eyes: 'round',
    eyeCol: C.blueDark,
    eyeDx: 28,
    eyeY: -2,
    browCol: '#a8822f',
    nose: 'round',
    mouth: 'beam',
    mouthY: 38,
    cheeks: C.rose,
    arms: [
      arm('armL', { from: [72, 262], via: [52, 298], to: [58, 334], sleeve: coat, cuff: C.blueDark, hand: skin }),
      arm('armR', { from: [226, 258], via: [266, 232], to: [256, 186], sleeve: coat, cuff: C.blueDark, hand: skin, handR: 16 }),
    ],
  });
}

/** Silky. Extra parts: wingL, wingR, wand. */
export function silky(): string {
  const hair = C.fairyHair;
  const shade = C.fairyHairShade;
  const dress = '#cdb6d8';
  const wing = (part: string, s: number): Node =>
    group({ part, origin: [150 + s * 30, 250] }, [
      piece(drop([150 + s * 30, 244], [150 + s * 104, 186], 42), C.dew, { opacity: 0.85, rough: 0.7 }),
      piece(drop([150 + s * 32, 258], [150 + s * 94, 296], 28), C.dew, { opacity: 0.85, rough: 0.7 }),
      ink([[150 + s * 34, 244], [150 + s * 80, 210], [150 + s * 112, 178]], { width: 2, color: C.dewShade }),
      ink([[150 + s * 36, 258], [150 + s * 90, 292]], { width: 2, color: C.dewShade }),
      dot(150 + s * 96, 172, 6, C.white, 0.95),
      dot(150 + s * 116, 196, 3.5, C.white, 0.9),
      dot(150 + s * 88, 286, 4, C.white, 0.9),
    ]);
  const flower = (x: number, y: number, col: string) => [piece(curve(star(x, y, 12, 0), 1), col, CUT), dot(x, y, 3.5, C.gold)];
  return person({
    name: 'silky',
    label: 'Silky',
    skin: C.skin,
    face: [52, 58],
    back: [
      wing('wingL', -1),
      wing('wingR', 1),
      // long silvery-gold hair down past her shoulders
      piece(curve([[96, 128], [98, 72], [150, 58], [202, 72], [204, 128], [212, 200], [230, 268], [196, 286], [176, 252], [124, 252], [104, 286], [70, 268], [88, 200]], 3), hair),
      ink([[92, 190], [84, 250]], { width: 2, color: shade }),
      ink([[208, 190], [216, 250]], { width: 2, color: shade }),
    ],
    body: [
      torso(dress, -6, 236),
      // a collar of petals
      fluff([[106, 232], [128, 226], [150, 230], [172, 226], [194, 232], [186, 252], [150, 262], [114, 252]], '#ebdcef', 7, { fibre: false }),
      ink([[118, 300], [150, 312], [182, 300]], { width: 2, color: C.white, opacity: 0.7 }),
    ],
    front: [
      // a side-swept fringe
      piece(curve([[96, 126], [98, 82], [140, 64], [196, 72], [206, 112], [188, 92], [150, 90], [124, 104], [106, 128]], 2), hair),
      ink([[132, 76], [118, 100]], { width: 2, color: shade }),
      ink([[166, 74], [186, 90]], { width: 2, color: shade }),
      ...flower(104, 92, C.pink),
      ...flower(196, 84, C.white),
    ],
    eyes: 'big',
    eyeCol: C.blue,
    eyeDx: 23,
    eyeY: 2,
    browCol: shade,
    mouth: 'smile',
    mouthY: 36,
    arms: [
      arm('armL', { from: [80, 268], via: [64, 302], to: [70, 336], sleeve: C.skin, width: 22, holding: [piece(ellipse(84, 266, 18, 14, -20), dress, CUT)] }),
      arm('armR', {
        from: [220, 268],
        via: [252, 252],
        to: [244, 214],
        sleeve: C.skin,
        width: 22,
        behind: [
          group({ part: 'wand' }, [
            piece(band([[244, 220], [262, 140]], 6), C.stoneLight, { edge: 'cut' }),
            piece(star(263, 132, 17, 8), C.starGold, CUT),
            dot(258, 128, 3, C.white, 0.8),
          ]),
        ],
        holding: [piece(ellipse(216, 266, 18, 14, 20), dress, CUT)],
      }),
    ],
  });
}

/** The Saucepan Man. Extra parts: pots (everything that clanks). */
export function saucepan(): string {
  const coat = C.wood;
  const hairC = C.hairBrown;
  return person({
    name: 'saucepan',
    label: 'The Saucepan Man',
    skin: C.skin,
    face: [58, 62],
    behindHead: [fluff([[86, 124], [96, 98], [112, 112], [104, 150], [88, 154]], hairC, 8), fluff([[214, 124], [204, 98], [188, 112], [196, 150], [212, 154]], hairC, 8)],
    body: [torso(coat, 4), piece(poly([[124, 230], [150, 270], [176, 230]]), C.cream, { fibre: false })],
    front: [
      // a big bushy moustache
      piece(curve([[150, 160], [130, 154], [106, 160], [100, 172], [120, 172], [150, 168]], 2), hairC),
      piece(curve([[150, 160], [170, 154], [194, 160], [200, 172], [180, 172], [150, 168]], 2), hairC),
    ],
    hat: [
      // a saucepan, upside down
      piece(poly([[102, 92], [108, 36], [192, 36], [198, 92]]), C.stone),
      ink([[118, 46], [114, 84]], { width: 4, color: C.white, opacity: 0.5 }),
      ink([[166, 52], [172, 60], [178, 52]], { width: 2.5, color: C.greyDark }),
      piece(band([[194, 62], [268, 40]], 13), C.greyDark, { edge: 'cut' }),
      piece(circle(256, 44, 3.5), C.cream, FLAT),
      piece(rect(88, 84, 124, 14, 6), C.stoneLight),
    ],
    eyes: 'round',
    eyeCol: C.brown,
    brows: 'raised',
    browCol: hairC,
    browY: -16,
    nose: 'round',
    mouth: 'grin',
    mouthY: 46,
    cheeks: C.rose,
    arms: [
      arm('armL', { from: [70, 264], via: [50, 300], to: [56, 336], sleeve: coat, cuff: C.cream }),
      // a hand cupped to his ear: "Eh? What did you say?"
      arm('armR', { from: [230, 262], via: [266, 228], to: [218, 150], sleeve: coat, cuff: C.cream, handR: 15 }),
    ],
    extra: [
      group({ part: 'pots', origin: [150, 250] }, [
        ink([[66, 258], [104, 286], [150, 296], [196, 286], [234, 258]], { width: 2.5, color: C.sand }),
        // a ladle
        piece(band([[48, 252], [52, 300]], 6), C.stoneLight, { edge: 'cut' }),
        piece(circle(52, 306, 11), C.stoneLight, CUT),
        // a kettle
        ink([[78, 290], [96, 268], [114, 290]], { width: 4, color: C.tinDark }),
        piece(band([[118, 312], [140, 292]], 9), C.tin, { edge: 'cut' }),
        piece(ellipse(98, 312, 28, 22), C.tin),
        piece(ellipse(98, 292, 14, 5), C.tinDark, CUT),
        ink([[86, 304], [90, 324]], { width: 3, color: C.white, opacity: 0.5 }),
        // a copper pan
        piece(band([[226, 300], [264, 292]], 8), C.brownDark, { edge: 'cut' }),
        piece(rect(176, 288, 52, 36, 7), C.rust),
        piece(rect(172, 284, 60, 8, 3), '#c86a48', CUT),
        // a little frying pan
        piece(circle(150, 326, 20), C.coal),
        piece(circle(146, 322, 12), '#45454c', FLAT),
      ]),
    ],
  });
}

/** Dame Washalot. Extra parts: tub, suds (bubbles that can float up). */
export function washalot(): string {
  const skin = C.skinShade;
  const dress = C.teal;
  const scarf = C.red;
  // a short sleeve with its cuff rolled up above the elbow
  const rolled = (x: number, y: number, rot: number): Node[] => {
    const s = rot > 0 ? 1 : -1;
    return [piece(ellipse(x, y, 20, 17, rot), dress, CUT), piece(band([[x - s * 22, y + 12], [x + s * 6, y + 18]], 10), C.cream, CUT)];
  };
  return person({
    name: 'washalot',
    label: 'Dame Washalot',
    skin,
    face: [62, 62],
    behindHead: [fluff([[90, 140], [94, 112], [108, 120], [104, 156]], C.hairGrey, 7), fluff([[210, 140], [206, 112], [192, 120], [196, 156]], C.hairGrey, 7)],
    body: [
      torso(dress, 16),
      piece(curve([[106, 246], [194, 246], [210, 345], [90, 345]], 1), C.cream),
      piece(band([[110, 248], [96, 228]], 8), C.cream, { edge: 'cut' }),
      piece(band([[190, 248], [204, 228]], 8), C.cream, { edge: 'cut' }),
    ],
    hat: [
      // a spotted headscarf tied in a knot on top
      piece(curve([[84, 128], [88, 74], [150, 56], [212, 74], [216, 128], [196, 104], [150, 94], [104, 104]], 2), scarf),
      ...[[110, 84], [138, 72], [168, 72], [194, 86], [124, 98], [180, 98], [152, 86]].map(([x, y]) => dot(x, y, 4, C.white, 0.85)),
      piece(ellipse(132, 54, 18, 11, -30), scarf, CUT),
      piece(ellipse(168, 54, 18, 11, 30), scarf, CUT),
      piece(circle(150, 60, 9), C.redDark, CUT),
    ],
    eyes: 'round',
    eyeCol: C.brownDark,
    eyeDx: 27,
    nose: 'round',
    mouth: 'grin',
    mouthY: 42,
    cheeks: C.rose,
    arms: [
      arm('armL', { from: [64, 266], via: [42, 300], to: [70, 302], sleeve: skin, width: 26, hand: false, holding: rolled(62, 270, 20) }),
      arm('armR', { from: [236, 266], via: [258, 300], to: [230, 302], sleeve: skin, width: 26, hand: false, holding: rolled(238, 270, -20) }),
    ],
    extra: [
      group({ part: 'tub', origin: [150, 320] }, [
        piece(poly([[56, 300], [244, 300], [230, 345], [70, 345]]), C.wood),
        ...[96, 126, 156, 186, 214].map((x) => ink([[x, 304], [x - (x - 150) * 0.08, 345]], { width: 2, color: C.brownDark, opacity: 0.6 })),
        piece(band([[60, 316], [240, 316]], 7), C.stone, { edge: 'cut' }),
        piece(ellipse(150, 300, 96, 14), C.brownDark, { edge: 'cut' }),
        fluff([[64, 300], [96, 284], [150, 280], [204, 284], [236, 300], [150, 306]], C.suds, 10),
        piece(circle(70, 302, 14), skin, CUT),
        piece(circle(230, 302, 14), skin, CUT),
      ]),
      group({ part: 'suds' }, [
        ...[[96, 266, 9], [206, 258, 11], [178, 236, 6], [238, 232, 7], [60, 246, 6]].flatMap(([x, y, r]) => [
          piece(circle(x, y, r), C.suds, { ...CUT, opacity: 0.85 }),
          dot(x - r * 0.3, y - r * 0.3, r * 0.25, C.white),
        ]),
      ]),
    ],
  });
}

/**
 * Mr Watzisname, fast asleep. Extra parts: zzz (the snores), eyesOpen
 * (hidden: show it, and hide eyes, when he wakes with a start), cap.
 */
export function watzisname(): string {
  const skin = C.skin;
  const pj = C.sky;
  const o = { skin, eyeDx: 25, eyeY: 2 };
  return person({
    name: 'watzisname',
    label: 'Mr Watzisname',
    skin,
    face: [60, 62],
    tilt: -8,
    behindHead: [fluff([[84, 146], [86, 116], [104, 124], [102, 162]], C.hairGrey, 8), fluff([[216, 146], [214, 116], [196, 124], [198, 162]], C.hairGrey, 8)],
    body: [
      torso(pj, 6),
      ...[86, 118, 182, 214].map((x) => piece(band([[x, 250], [x + (x - 150) * 0.15, 345]], 9), C.blueDark, { ...FLAT, opacity: 0.3 })),
      piece(poly([[118, 226], [150, 262], [128, 270]]), C.cream, CUT),
      piece(poly([[182, 226], [150, 262], [172, 270]]), C.cream, CUT),
      ...[284, 314].map((y) => piece(circle(150, y, 5), C.cream, CUT)),
    ],
    onHead: [ink([[110, 186], [116, 192]], { width: 2, color: C.hairGrey }), ink([[188, 188], [182, 194]], { width: 2, color: C.hairGrey })],
    front: [group({ part: 'eyesOpen', opacity: 0 }, eyes({ ...o, eyes: 'big', eyeCol: C.blue }, 'eyesOpenInner'))],
    hat: [
      group({ part: 'cap', origin: [150, 90] }, [
        // a long, floppy nightcap flopping over to one side
        piece(curve([[88, 108], [98, 62], [150, 40], [212, 48], [252, 82], [270, 134], [252, 146], [234, 108], [208, 88], [212, 108]], 2), C.plum),
        ink([[140, 48], [196, 60], [232, 92]], { width: 6, color: C.goldLight, opacity: 0.6 }),
        piece(rect(84, 96, 132, 18, 8), C.cream),
        fluff([[248, 140], [262, 130], [276, 144], [262, 160]], C.white, 7),
      ]),
    ],
    eyes: 'shut',
    eyeDx: 25,
    eyeY: 2,
    brows: 'kind',
    browCol: C.hairGrey,
    nose: 'round',
    mouth: 'snore',
    mouthY: 44,
    cheeks: C.rose,
    noTalk: true,
    arms: [
      arm('armL', { from: [70, 264], via: [72, 318], to: [134, 318], sleeve: pj, cuff: C.cream }),
      arm('armR', { from: [230, 264], via: [228, 318], to: [166, 316], sleeve: pj, cuff: C.cream }),
    ],
    extra: [group({ part: 'zzz', origin: [60, 80] }, [zed(28, 98, 14), zed(46, 64, 20), zed(68, 22, 28)])],
  });
}

/** The Angry Pixie. Extra parts: puff (cross little lines by his head). */
export function pixie(): string {
  const skin = '#e7c493';
  const hairC = C.ginger;
  const tunic = C.greenDark;
  return person({
    name: 'pixie',
    label: 'The Angry Pixie',
    skin,
    face: [52, 56],
    ears: 'pointy',
    behindHead: [
      piece(poly([[94, 132], [80, 118], [96, 112], [86, 96], [108, 100], [116, 124]]), hairC),
      piece(poly([[206, 132], [220, 118], [204, 112], [214, 96], [192, 100], [184, 124]]), hairC),
    ],
    body: [
      torso(tunic, -10, 244),
      // a jagged leaf collar
      piece(poly([[96, 256], [110, 240], [122, 262], [136, 240], [150, 264], [164, 240], [178, 262], [190, 240], [204, 256], [196, 278], [104, 278]]), C.green),
      piece(band([[60, 320], [240, 320]], 14), C.brownDark, { edge: 'cut' }),
      piece(rect(138, 310, 24, 20, 3), C.gold, CUT),
    ],
    hat: [
      // a tall red pointed cap, its tip bent over
      piece(curve([[92, 106], [104, 64], [128, 30], [150, 8], [176, 0], [194, 12], [176, 20], [170, 48], [194, 76], [208, 106]], 2), C.red),
      piece(circle(196, 14, 7), C.goldLight, CUT),
      piece(rect(90, 96, 120, 16, 6), C.redDark),
    ],
    eyes: 'round',
    eyeCol: C.greenDark,
    eyeDx: 22,
    eyeY: 2,
    brows: 'cross',
    browCol: '#6b3216',
    browY: -14,
    nose: 'pointy',
    mouth: 'frown',
    mouthY: 40,
    cheeks: C.red,
    arms: [
      arm('armL', { from: [82, 272], via: [50, 300], to: [92, 322], sleeve: tunic, cuff: C.green, hand: skin }),
      // shaking his fist
      arm('armR', {
        from: [218, 272],
        via: [258, 248],
        to: [248, 198],
        sleeve: tunic,
        cuff: C.green,
        hand: skin,
        handR: 18,
      }),
    ],
    extra: [
      group({ part: 'puff', origin: [60, 110] }, [
        ink([[58, 120], [36, 112]], { width: 4, color: C.red }),
        ink([[62, 104], [46, 86]], { width: 4, color: C.red }),
        ink([[74, 94], [70, 72]], { width: 4, color: C.red }),
      ]),
    ],
  });
}

/** Mr Oom Boom Boom. Extra parts: drum. His arms carry the drumsticks. */
export function oomboom(): string {
  const skin = C.skinDeep;
  const coat = C.orange;
  const stick = (from: Pt, to: Pt): Node[] => [piece(band([from, to], 7), C.cream, { edge: 'cut' }), piece(circle(to[0], to[1], 8), C.redDark, CUT)];
  return person({
    name: 'oomboom',
    label: 'Mr Oom Boom Boom',
    skin,
    face: [52, 68],
    behindHead: [piece(ellipse(cx, cy - 20, 56, 50), C.hairBlack)],
    body: [
      torso(coat, 10),
      // gold epaulettes and frogging
      fluff([[44, 262], [70, 246], [96, 254], [80, 272], [52, 278]], C.gold, 5),
      fluff([[256, 262], [230, 246], [204, 254], [220, 272], [248, 278]], C.gold, 5),
      ...[258, 280].map((y) => ink([[120, y], [180, y]], { width: 4, color: C.goldLight })),
      // the drum: in front of his coat, behind his hands
      group({ part: 'drum', origin: [150, 310] }, [
        piece(band([[86, 250], [150, 300], [214, 250]], 8), C.brownDark, { edge: 'cut' }),
        piece(rect(60, 276, 180, 80, 4), C.blue),
        ink([[62, 290], [92, 340], [122, 290], [152, 340], [182, 290], [212, 340], [238, 292]], { width: 3, color: C.goldLight }),
        piece(rect(56, 284, 188, 10, 3), C.cream, CUT),
        piece(ellipse(150, 278, 92, 16), C.cream),
        piece(ellipse(150, 278, 80, 11), '#f7ecd4', FLAT),
      ]),
    ],
    front: [
      // a curly moustache
      piece(band([[150, 164], [128, 160], [110, 168], [102, 158], [110, 150]], 9), C.hairBlack, { edge: 'cut' }),
      piece(band([[150, 164], [172, 160], [190, 168], [198, 158], [190, 150]], 9), C.hairBlack, { edge: 'cut' }),
    ],
    hat: [
      // a tall bandsman's hat with a plume
      piece(poly([[100, 98], [108, 4], [192, 4], [200, 98]]), C.blueDark),
      piece(rect(98, 80, 104, 16, 4), C.gold, CUT),
      piece(star(150, 46, 16, 0), C.goldLight, CUT),
      fluff([[192, 30], [200, 4], [214, 2], [210, 30]], C.white, 6),
    ],
    eyes: 'round',
    eyeCol: C.brownDark,
    eyeDx: 24,
    eyeY: -4,
    brows: 'raised',
    browCol: C.hairBlack,
    nose: 'round',
    noseCol: 'rgba(60,30,15,0.4)',
    mouth: 'grin',
    mouthY: 48,
    cheeks: C.rust,
    arms: [
      arm('armL', { from: [70, 264], via: [76, 300], to: [108, 270], sleeve: coat, cuff: C.gold, hand: skin, holding: stick([108, 270], [74, 214]) }),
      arm('armR', { from: [230, 264], via: [224, 300], to: [192, 270], sleeve: coat, cuff: C.gold, hand: skin, holding: stick([192, 270], [226, 214]) }),
    ],
  });
}

export const folk: Record<string, () => string> = {
  moonface,
  silky,
  saucepan,
  washalot,
  watzisname,
  pixie,
  oomboom,
};
