/**
 * The people of the lands that come to the top of the tree: the
 * Topsy-Turvy Man, the Jelly Goblin, Giant Rumbletum, the Enchanter,
 * Captain Tin and Mr Snowman.
 *
 * Common parts (see parts.ts) where they make sense, plus the extras named
 * above each function.
 */
import { C } from '../palette';
import { band, circle, curve, dot, ellipse, group, ink, piece, poly, raw, rect, svg, type Node, type Pt } from '../paper';
import { arm, brows, cheeks, CUT, cx, cy, eyes, FLAT, floor, fluff, framed, mouthShape, nose, person, portrait, star, talkShape, torso } from './parts';

/**
 * The Topsy-Turvy Man, standing on his head. His head is drawn upright and
 * then turned over, so his hair is on the ground and his chin is in the
 * air; only his grin stays the right way up (so he still looks happy).
 * Extra parts: legs (his shoulders and body, above), hair.
 */
export function topsy(): string {
  const skin = C.skin;
  const hair = C.green;
  const shirt = '#9a5aa0';
  const stripe = C.pink;
  const face = { skin, eyes: 'round' as const, eyeCol: C.purple, eyeDx: 25, browCol: C.greenDark, nose: 'round' as const, cheeks: C.rose };
  const turned = 'rotate(180)';
  return portrait('topsy', 'The Topsy-Turvy Man', [
    floor(130, 330),
    framed('topsy', [group({ part: 'figure', origin: [150, 330] }, [
      // his body goes up out of the top of the picture
      group({ part: 'legs', origin: [150, 40] }, [
        piece(curve([[60, -20], [64, 34], [110, 52], [150, 56], [190, 52], [236, 34], [240, -20]], 2), shirt),
        ...[8, 30].map((y) => piece(band([[64, y], [236, y]], 9), stripe, { ...FLAT, opacity: 0.8 })),
        piece(rect(130, 44, 40, 30, 6), skin, { fibre: false }),
      ]),
      group({ part: 'head', origin: [cx, cy], transform: turned }, [
        // hair, drawn on top of his upright head (so it ends up on the ground)
        group({ part: 'hair', origin: [cx, 70] }, [
          // wild spiky hair (once he's turned over, it sticks down at the grass)
          piece(
            poly([
              [92, 124], [64, 104], [84, 92], [58, 64], [92, 66], [88, 34], [118, 50], [126, 14], [146, 44], [162, 8], [174, 44],
              [196, 18], [200, 54], [232, 42], [218, 72], [244, 90], [214, 100], [208, 124], [150, 100],
            ]),
            hair,
          ),
        ]),
        piece(ellipse(cx - 56, cy + 6, 12, 17), skin),
        piece(ellipse(cx + 56, cy + 6, 12, 17), skin),
        piece(ellipse(cx, cy, 58, 62), skin),
        ...cheeks(face),
        ...eyes(face),
        ...brows(face),
        ...nose(face),
      ]),
      // the grin, the right way up for us
      group({ part: 'mouth', origin: [cx, 98] }, mouthShape('beam', cx, 98)),
      group({ part: 'mouthOpen', origin: [cx, 98], opacity: 0 }, talkShape(cx, 94)),
      // arms reach down and his hands are flat on the ground
      arm('armL', { from: [74, 30], via: [34, 170], to: [62, 314], sleeve: shirt, cuff: stripe, width: 28, hand: skin, handR: 17 }),
      arm('armR', { from: [226, 30], via: [266, 170], to: [238, 314], sleeve: shirt, cuff: stripe, width: 28, hand: skin, handR: 17 }),
      // his cap, fallen off, upside down on the grass
      group({ part: 'hat', origin: [208, 300] }, [
        piece(curve([[160, 276], [210, 270], [252, 280], [240, 316], [200, 326], [168, 314]], 2), C.pink),
        piece(ellipse(206, 276, 46, 9), C.rose, CUT),
        piece(circle(204, 326, 8), C.yellow, CUT),
      ]),
    ])]),
  ]);
}

/**
 * The Topsy-Turvy Man with the rest of him, for stories: his portrait
 * (standing on his hands) under a pair of legs that go up into the air,
 * so his feet are on stage to balance things on. 300 × 590; the portrait
 * sits at y 250. Not a portrait itself, so it isn't in `lands` below.
 * Parts: legL, legR (kick them; pivots at the hips), plus all of his own.
 */
export function topsyTall(): string {
  const trousers = C.topsyGreen;
  const boot = (x: number, dir: 1 | -1) => [
    piece(curve([[x - 20, 84], [x - 22, 40], [x - 6 * dir, 30], [x + 30 * dir, 28], [x + 38 * dir, 46], [x + 20, 84]], 2), C.topsyPink),
    piece(band([[x - 26, 30], [x + 40 * dir, 26]], 10), C.plum, { edge: 'cut', fibre: false }),
  ];
  const leg = (part: string, hip: Pt, foot: Pt, dir: 1 | -1) =>
    group({ part, origin: hip }, [
      piece(band([hip, [(hip[0] + foot[0]) / 2 - dir * 10, (hip[1] + foot[1]) / 2], [foot[0], foot[1] + 20]], 40), trousers),
      ...[0.35, 0.65].map((s) => {
        const p: Pt = [hip[0] + (foot[0] - hip[0]) * s, hip[1] + (foot[1] - hip[1]) * s];
        return piece(band([[p[0] - 20, p[1]], [p[0] + 20, p[1]]], 7), C.topsyPink, { edge: 'cut', fibre: false, shadow: false });
      }),
      ...boot(foot[0], dir),
    ]);
  return svg({ w: 300, h: 590, name: 'l2-topsy-tall', label: 'The Topsy-Turvy Man' }, [
    leg('legL', [112, 230], [96, 70], -1),
    leg('legR', [188, 230], [206, 70], 1),
    piece(curve([[66, 262], [72, 206], [150, 194], [228, 206], [234, 262]], 2), trousers),
    raw(topsy().replace('<svg ', '<svg x="0" y="250" width="300" height="340" style="width:300px;height:340px" ')),
  ]);
}

/**
 * The Jelly Goblin: a greedy wobbly green jelly with a goblin's face and a
 * cherry on top. Extra parts: jelly (the whole wobbly body: squash it),
 * cherry, tongue, spoon (in armR).
 */
export function jellyGoblin(): string {
  const jelly = C.jelly;
  const face = {
    skin: jelly,
    eyes: 'big' as const,
    eyeCol: C.gold,
    eyeDx: 26,
    eyeY: 0,
    brows: 'cross' as const,
    browCol: C.greenDeep,
    nose: 'round' as const,
    cheeks: C.jellyLight,
  };
  const ridge = (x: number) => piece(band([[x, 108 + Math.abs(x - 150) * 0.5], [x + (x - 150) * 0.25, 322]], 14), C.jellyLight, { ...FLAT, opacity: 0.45 });
  return portrait('jellyGoblin', 'The Jelly Goblin', [
    piece(ellipse(150, 330, 140, 16), C.cream),
    group({ part: 'figure', origin: [150, 330] }, [
      group({ part: 'jelly', origin: [150, 330] }, [
        // pointed goblin ears
        piece(poly([[70, 140], [20, 110], [62, 176]]), C.jellyDark),
        piece(poly([[230, 140], [280, 110], [238, 176]]), C.jellyDark),
        // the jelly, in the shape of a fluted mould
        piece(curve([[40, 330], [50, 260], [72, 200], [80, 130], [110, 76], [150, 64], [190, 76], [220, 130], [228, 200], [250, 260], [260, 330]], 3), jelly),
        piece(curve([[48, 330], [56, 290], [244, 290], [252, 330]], 2), C.jellyDark, { ...FLAT, opacity: 0.6 }),
        ridge(70),
        ridge(110),
        ridge(190),
        ridge(230),
        piece(ellipse(104, 104, 14, 26, 30), C.white, { ...FLAT, opacity: 0.45 }),
        piece(ellipse(84, 240, 8, 22, 10), C.white, { ...FLAT, opacity: 0.35 }),
        // drips
        piece(curve([[200, 282], [212, 282], [214, 300], [206, 312], [198, 300]], 2), jelly, CUT),
        piece(curve([[86, 288], [96, 288], [98, 302], [91, 310], [84, 302]], 2), jelly, CUT),
        ...cheeks(face),
        ...eyes(face),
        ...brows(face),
        ...nose(face),
        group({ part: 'mouth', origin: [cx, 178] }, [
          ...mouthShape('beam', cx, 178),
          // licking his lips
          group({ part: 'tongue', origin: [174, 188] }, [piece(curve([[164, 186], [190, 184], [196, 204], [182, 210], [170, 200]], 2), C.rose, CUT)]),
        ]),
        group({ part: 'mouthOpen', origin: [cx, 178], opacity: 0 }, talkShape(cx, 176)),
      ]),
      group({ part: 'cherry', origin: [150, 64] }, [
        ink([[150, 50], [158, 26], [172, 16]], { width: 3, color: C.greenDeep }),
        piece(circle(150, 52, 18), C.red),
        dot(144, 46, 4, C.white, 0.7),
      ]),
      // grabby little arms, one with a big spoon
      arm('armL', { from: [70, 236], via: [36, 224], to: [26, 186], sleeve: jelly, width: 24, hand: C.jellyDark, handR: 14 }),
      arm('armR', {
        from: [230, 236],
        via: [264, 230],
        to: [266, 196],
        sleeve: jelly,
        width: 24,
        hand: C.jellyDark,
        handR: 14,
        behind: [
          group({ part: 'spoon', origin: [266, 196] }, [
            piece(band([[266, 210], [272, 120]], 9), C.stoneLight, { edge: 'cut' }),
            piece(ellipse(273, 106, 17, 22), C.stoneLight, CUT),
            piece(ellipse(273, 108, 10, 14), C.stone, FLAT),
          ]),
        ],
      }),
    ]),
  ]);
}

/**
 * Giant Rumbletum: so big his face fills the whole picture. Friendly-ish.
 * His features sit inside the chip box like everyone else's. Extra parts:
 * hand (his enormous hand at the bottom), bird (a little bird in his hair).
 */
export function giant(): string {
  const skin = C.skinShade;
  const hair = C.ginger;
  const s = 1.55;
  const face = {
    skin,
    scale: s,
    eyes: 'round' as const,
    eyeCol: C.greenDark,
    eyeDx: 27,
    eyeY: -8,
    brows: 'raised' as const,
    browCol: '#8a3a18',
    browY: -16,
    nose: 'round' as const,
    mouth: 'beam' as const,
    mouthY: 30,
    cheeks: C.rose,
  };
  return portrait('giant', 'Giant Rumbletum', [
    framed('giant', [group({ part: 'figure', origin: [150, 340] }, [
      group({ part: 'head', origin: [150, 340] }, [
        piece(ellipse(-6, 170, 36, 60), skin),
        piece(ellipse(306, 170, 36, 60), skin),
        piece(ellipse(150, 176, 168, 196), skin),
        // a wild ginger thatch and a bushy beard
        fluff([[-20, 70], [20, 10], [90, -20], [150, -26], [210, -20], [280, 10], [320, 70], [270, 60], [230, 40], [190, 56], [150, 38], [110, 56], [70, 40], [30, 60]], hair, 18),
        fluff([[-10, 250], [30, 236], [60, 270], [100, 232], [120, 246], [150, 236], [180, 246], [200, 232], [240, 270], [270, 236], [310, 250], [310, 360], [-10, 360]], hair, 16),
        piece(ellipse(150, 230, 64, 20), skin, { fibre: false, shadow: false }),
        ...cheeks({ ...face, scale: 1.8 }),
        ...eyes(face),
        ...brows(face),
        ...nose(face),
        group({ part: 'mouth', origin: [cx, 183] }, [
          ...mouthShape('beam', cx, 183, s),
          // a gap in his teeth
          piece(rect(152, 171, 9, 9, 1), C.redDark, { edge: 'clean', shadow: false }),
        ]),
        group({ part: 'mouthOpen', origin: [cx, 183], opacity: 0 }, talkShape(cx, 180, s)),
        group({ part: 'bird', origin: [236, 30] }, [
          piece(ellipse(236, 30, 16, 12), C.sky, CUT),
          piece(circle(248, 22, 8), C.sky, CUT),
          piece(poly([[255, 21], [264, 24], [255, 26]]), C.orange, FLAT),
          dot(249, 20, 1.8, C.ink),
          piece(ellipse(228, 28, 9, 5, -20), C.blue, FLAT),
        ]),
      ]),
      // a huge hand rising from the bottom corner
      group({ part: 'hand', origin: [250, 340] }, [
        piece(curve([[200, 345], [206, 300], [226, 286], [270, 284], [300, 300], [300, 345]], 2), skin),
        ...[0, 1, 2].map((i) => piece(rect(206 + i * 22, 262 - (i === 1 ? 8 : 0), 20, 40, 10), skin, CUT)),
        piece(ellipse(198, 306, 12, 22, -30), skin, CUT),
      ]),
    ])]),
  ]);
}

/** The Enchanter: midnight robes, a crooked starry hat, a glowing orb. Extra parts: orb. */
export function enchanter(): string {
  const skin = C.skinBrown;
  const robe = C.nightLight;
  const silver = C.hairGrey;
  const moon = (x: number, y: number, r: number): Node[] => [piece(circle(x, y, r), C.starGold, CUT), piece(circle(x + r * 0.45, y - r * 0.25, r * 0.85), robe, FLAT)];
  return person({
    name: 'enchanter',
    label: 'The Enchanter',
    skin,
    face: [54, 64],
    behindHead: [piece(curve([[94, 120], [96, 200], [114, 236], [186, 236], [204, 200], [206, 120]], 2), silver)],
    body: [
      torso(robe, 14),
      piece(poly([[110, 228], [150, 300], [190, 228], [176, 222], [150, 262], [124, 222]]), C.purple, { fibre: false }),
      piece(star(80, 300, 10, 10), C.starGold, CUT),
      piece(star(226, 290, 8, -10), C.starGold, CUT),
      ...moon(112, 326, 9),
      piece(star(196, 330, 7, 20), C.starGold, CUT),
    ],
    front: [
      // a curly silver moustache and a pointed beard
      piece(curve([[150, 192], [170, 196], [162, 246], [150, 262], [138, 246], [130, 196]], 2), silver),
      piece(band([[150, 166], [128, 162], [110, 170], [104, 160], [112, 154]], 8), silver, { edge: 'cut' }),
      piece(band([[150, 166], [172, 162], [190, 170], [196, 160], [188, 154]], 8), silver, { edge: 'cut' }),
    ],
    hat: [
      // a tall crooked hat, its tip flopping over
      piece(curve([[96, 98], [118, 60], [136, 20], [160, 2], [196, 8], [214, 30], [196, 26], [178, 30], [176, 60], [204, 98]], 2), robe),
      piece(ellipse(150, 96, 92, 14), robe),
      piece(band([[104, 88], [196, 88]], 10), C.purple, { edge: 'cut' }),
      piece(star(150, 56, 11, 0), C.starGold, CUT),
      piece(star(176, 22, 7, 12), C.starGold, CUT),
      ...moon(126, 74, 8),
      piece(star(212, 30, 7, 0), C.goldLight, CUT),
    ],
    eyes: 'round',
    eyeCol: C.purple,
    eyeDx: 24,
    eyeY: 2,
    brows: 'raised',
    browCol: silver,
    nose: 'long',
    mouth: 'smile',
    mouthY: 42,
    cheeks: false,
    arms: [
      arm('armL', { from: [66, 266], via: [48, 300], to: [60, 334], sleeve: robe, width: 40, cuff: C.purple, hand: skin }),
      arm('armR', {
        from: [234, 266],
        via: [262, 266],
        to: [244, 232],
        sleeve: robe,
        width: 38,
        cuff: C.purple,
        hand: skin,
        behind: [
          group({ part: 'orb', origin: [246, 196] }, [
            piece(circle(246, 196, 36), C.dew, { ...FLAT, opacity: 0.35 }),
            piece(circle(246, 196, 24), '#b9a6e0', { edge: 'cut', opacity: 0.9 }),
            piece(ellipse(238, 188, 7, 10, 30), C.white, { ...FLAT, opacity: 0.8 }),
          ]),
        ],
      }),
    ],
  });
}

/**
 * Captain Tin, a wind-up toy soldier, saluting. Painted wooden face, a
 * tall black busby. Extra parts: key (his wind-up key: spin it).
 */
export function toySoldier(): string {
  const skin = '#f0cfa8';
  const jacket = C.red;
  return person({
    name: 'toySoldier',
    label: 'Captain Tin',
    skin,
    face: [54, 62],
    ears: false,
    back: [
      group({ part: 'key', origin: [262, 236] }, [
        piece(band([[230, 248], [262, 236]], 10), C.goldLight, { edge: 'cut' }),
        piece(ellipse(270, 222, 12, 18, -20), C.gold, CUT),
        piece(ellipse(276, 252, 12, 18, 20), C.gold, CUT),
      ]),
    ],
    body: [
      torso(jacket, 0),
      // white cross belts and two rows of gold buttons
      piece(band([[70, 260], [236, 345]], 18), C.white, { edge: 'cut' }),
      piece(band([[230, 260], [64, 345]], 18), C.white, { edge: 'cut' }),
      ...[268, 296, 324].flatMap((y) => [piece(circle(126, y, 5), C.gold, CUT), piece(circle(174, y, 5), C.gold, CUT)]),
      piece(rect(118, 222, 64, 22, 4), C.blueDark),
      fluff([[46, 262], [72, 248], [96, 256], [80, 274], [52, 278]], C.gold, 5),
    ],
    onHead: [ink([[cx - 58, cy + 52], [cx, cy + 70], [cx + 58, cy + 52]], { width: 3, color: C.gold })],
    front: [
      // a painted moustache
      piece(curve([[150, 164], [134, 158], [116, 164], [108, 156], [118, 170], [150, 170]], 2), C.ink, CUT),
      piece(curve([[150, 164], [166, 158], [184, 164], [192, 156], [182, 170], [150, 170]], 2), C.ink, CUT),
    ],
    hat: [
      // a tall black busby with a gold badge and chin strap
      piece(rect(94, 2, 112, 110, 30), C.coal, { rough: 1.6 }),
      ink([[116, 20], [112, 90]], { width: 3, color: C.slate, opacity: 0.8 }),
      piece(circle(150, 74, 14), C.gold, CUT),
      piece(star(150, 74, 8, 0), C.goldLight, FLAT),
      piece(band([[192, 30], [200, 4]], 10), C.red, { edge: 'cut' }),
    ],
    eyes: 'dot',
    eyeDx: 24,
    eyeY: 4,
    brows: 'none',
    nose: 'button',
    mouth: 'smile',
    mouthY: 44,
    cheeks: C.red,
    arms: [
      arm('armL', { from: [70, 264], via: [52, 300], to: [58, 334], sleeve: jacket, cuff: C.white, hand: C.white }),
      // a smart salute
      arm('armR', { from: [230, 262], via: [270, 200], to: [214, 118], sleeve: jacket, cuff: C.white, hand: C.white, handR: 15 }),
    ],
  });
}

/** Mr Snowman: coal eyes, a carrot nose, a top hat and a stripy scarf. Extra parts: scarf. */
export function snowman(): string {
  const snow = C.snow;
  const face = { skin: snow, eyes: 'dot' as const, eyeDx: 26, eyeY: -6, brows: 'none' as const, cheeks: C.pink };
  const twig = (pts: Pt[]) => ink(pts, { width: 6, color: C.brownDark });
  const coalSmile: Node[] = [[-24, 30], [-12, 37], [0, 40], [12, 37], [24, 30]].map(([dx, dy]) => piece(circle(cx + dx, cy + dy, 4.5), C.coal, CUT));
  return portrait('snowman', 'Mr Snowman', [
    framed('snowman', [group({ part: 'figure', origin: [150, 340] }, [
      // twig arms, behind the body
      group({ part: 'armL', origin: [56, 268] }, [twig([[66, 270], [30, 230], [6, 200]]), twig([[36, 236], [14, 236]]), twig([[22, 216], [16, 192]])]),
      group({ part: 'armR', origin: [244, 268] }, [twig([[234, 270], [268, 236], [292, 198]]), twig([[262, 242], [286, 244]]), twig([[280, 216], [290, 194]])]),
      piece(circle(150, 400, 160), snow),
      piece(curve([[220, 250], [270, 300], [280, 345], [240, 345]], 2), C.snowShade, { ...FLAT, opacity: 0.7 }),
      ...[290, 326].map((y) => piece(circle(150, y, 8), C.coal, CUT)),
      group({ part: 'head', origin: [150, 230] }, [
        piece(circle(cx, cy, 72), snow),
        piece(curve([[196, 82], [222, 126], [214, 176], [186, 204], [204, 150], [204, 112]], 2), C.snowShade, { ...FLAT, opacity: 0.6 }),
        ...cheeks(face),
        ...eyes(face),
        group({ part: 'mouth', origin: [cx, cy + 38] }, coalSmile),
        group({ part: 'mouthOpen', origin: [cx, cy + 38], opacity: 0 }, [piece(ellipse(cx, cy + 40, 14, 11), C.coal, CUT)]),
        // the carrot, poking out to one side
        piece(curve([[146, 138], [154, 132], [204, 156], [152, 154]], 1), C.carrot, CUT),
        ink([[166, 140], [168, 150]], { width: 1.5, color: C.rust }),
        ink([[180, 146], [182, 153]], { width: 1.5, color: C.rust }),
        group({ part: 'hat', origin: [cx, 76] }, [
          piece(ellipse(cx, 80, 76, 12), C.coal),
          piece(rect(104, 6, 92, 76, 6), C.coal),
          piece(rect(104, 56, 92, 16, 2), C.red, CUT),
          piece(rect(170, 54, 16, 20, 3), C.leafDark, FLAT),
        ]),
      ]),
      // a stripy scarf, with one end blowing out
      group({ part: 'scarf', origin: [150, 220] }, [
        piece(band([[204, 224], [226, 270], [216, 320]], 26), C.red),
        ...[260, 290].map((y) => piece(band([[208, y], [234, y - 2]], 8), C.cream, FLAT)),
        piece(curve([[80, 206], [150, 222], [220, 206], [224, 230], [150, 246], [76, 230]], 2), C.red),
        ...[110, 150, 190].map((x) => piece(band([[x, 214 + Math.abs(x - 150) * 0.1], [x, 238 - Math.abs(x - 150) * 0.1]], 8), C.cream, FLAT)),
      ]),
      ...[[40, 60], [270, 90], [26, 140], [258, 310]].map(([x, y]) => piece(star(x, y, 6, 0), C.white, { ...CUT, opacity: 0.9 })),
    ])]),
  ]);
}

export const lands: Record<string, () => string> = { topsy, jellyGoblin, giant, enchanter, toySoldier, snowman };
