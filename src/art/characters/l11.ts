/**
 * The host of land 11, the Old Woman's Shoe: `oldWoman`.
 *
 * A round, kindly, bustling old woman who has so many children she hardly
 * knows what to do. A frilly mob cap, little round spectacles, a patched
 * shawl over a brown frock, and a floury apron with a wooden spoon poking
 * out of the pocket. Warm and a bit harassed, never cross.
 *
 * Parts (on top of the common ones in parts.ts): cap (the `hat`), glasses
 * (slip them down her nose), spoon (waggle it), shawl.
 */
import { C } from '../palette';
import { band, circle, curve, ellipse, group, ink, piece, poly, rect, type Node, type Pt } from '../paper';
import { arm, CUT, cx, cy, FLAT, fluff, person, ring } from './parts';

// Colours for this land only (not in palette.ts).
const FROCK = '#8c5a32';
const SHAWL = '#6c8a9a';
const SHAWL_DARK = '#51707f';
const APRON = '#f6efdc';
const PATCHES = ['#d9a441', '#b5583b', '#7d9a4a'];

function rotAbout(px: number, py: number, x: number, y: number, deg: number): Pt {
  const a = (deg * Math.PI) / 180;
  const dx = px - x;
  const dy = py - y;
  return [x + dx * Math.cos(a) - dy * Math.sin(a), y + dx * Math.sin(a) + dy * Math.cos(a)];
}

/** A little square patch with running stitches round it. */
const patch = (x: number, y: number, s: number, color: string, rot = 0): Node[] => {
  const h = s / 2 - 3;
  const corners: Pt[] = [[x - h, y - h], [x + h, y - h], [x + h, y + h], [x - h, y + h], [x - h, y - h]];
  return [
    piece(rect(x - s / 2, y - s / 2, s, s, 2).map(([px, py]) => rotAbout(px, py, x, y, rot)), color, CUT),
    ink(corners.map(([px, py]) => rotAbout(px, py, x, y, rot)), { width: 1.4, color: 'rgba(60,40,30,0.55)', wobble: 0.3 }),
  ];
};

export function oldWoman(): string {
  const skin = C.skin;
  const hairGrey = C.hairGrey;
  const wood = C.wood;
  return person({
    name: 'oldWoman',
    label: 'The Old Woman in the Shoe',
    skin,
    face: [64, 62],
    ears: false,
    eyes: 'round',
    eyeCol: C.teal,
    eyeDx: 26,
    brows: 'worried',
    browCol: '#9b948a',
    browY: -23,
    nose: 'round',
    mouth: 'smile',
    mouthY: 42,
    cheeks: C.rose,
    // grey wisps escaping from under the cap
    behindHead: [
      fluff([[84, 150], [82, 112], [102, 118], [100, 164]], hairGrey, 8),
      fluff([[216, 150], [218, 112], [198, 118], [200, 164]], hairGrey, 8),
    ],
    body: [
      // brown frock
      piece(curve([[34, 345], [44, 270], [98, 234], [150, 230], [202, 234], [256, 270], [266, 345]], 2), FROCK),
      // the apron, with a bib and a pocket
      piece(curve([[104, 250], [196, 250], [212, 345], [88, 345]], 1), APRON),
      piece(poly([[116, 252], [184, 252], [176, 292], [124, 292]]), APRON, CUT),
      piece(rect(118, 306, 64, 34, 6), '#e9dcc0', CUT),
      ink([[122, 311], [178, 311]], { width: 1.8, color: 'rgba(120,90,60,0.45)' }),
      // the patched shawl round her shoulders
      group({ part: 'shawl', origin: [150, 250] }, [
        piece(curve([[40, 300], [52, 260], [100, 228], [150, 238], [200, 228], [248, 260], [260, 300], [208, 270], [150, 296], [92, 270]], 2), SHAWL),
        piece(curve([[60, 292], [70, 266], [104, 244], [150, 256], [196, 244], [230, 266], [240, 292], [200, 270], [150, 290], [100, 270]], 1), SHAWL_DARK, { ...FLAT, opacity: 0.4 }),
        // fringe
        ...[48, 58, 68, 232, 242, 252].map((x) => ink([[x, 296], [x + (x < 150 ? -3 : 3), 314]], { width: 3, color: SHAWL_DARK })),
        ...patch(82, 270, 26, PATCHES[0], -8),
        ...patch(224, 276, 24, PATCHES[1], 10),
        ...patch(132, 252, 18, PATCHES[2], 4),
      ]),
    ],
    neck: skin,
    // the cap sits right over her hair; its frill is a ruffle round her brow
    hat: [
      group({ part: 'cap' }, [
        fluff([[88, 112], [92, 76], [124, 54], [150, 50], [176, 54], [208, 76], [212, 112], [180, 96], [150, 92], [120, 96]], C.white, 10),
        piece(curve([[96, 100], [108, 70], [150, 62], [192, 70], [204, 100], [150, 84]], 2), '#ebe3cf', { ...FLAT, opacity: 0.8 }),
        // frilly band over the forehead
        fluff([[86, 108], [110, 96], [150, 90], [190, 96], [214, 108], [190, 104], [150, 100], [110, 104]], '#fffaf0', 6),
        // a pink ribbon bow
        piece(poly([[150, 62], [128, 52], [126, 74]]), C.pink, CUT),
        piece(poly([[150, 62], [172, 52], [174, 74]]), C.pink, CUT),
        piece(circle(150, 62, 6), C.rose, CUT),
      ]),
    ],
    // little round spectacles, perched on her nose
    front: [
      group({ part: 'glasses', origin: [cx, cy + 6] }, [
        ink(ring(cx - 26, cy + 1, 18, 22), { width: 3, color: C.brownDark, closed: true }),
        ink(ring(cx + 26, cy + 1, 18, 22), { width: 3, color: C.brownDark, closed: true }),
        ink([[cx - 8, cy], [cx, cy - 4], [cx + 8, cy]], { width: 3, color: C.brownDark }),
        ink([[cx - 44, cy], [cx - 58, cy - 4]], { width: 2.4, color: C.brownDark }),
        ink([[cx + 44, cy], [cx + 58, cy - 4]], { width: 2.4, color: C.brownDark }),
        piece(ellipse(cx - 33, cy - 7, 4, 7, 30), C.white, { ...FLAT, opacity: 0.45 }),
        piece(ellipse(cx + 19, cy - 7, 4, 7, 30), C.white, { ...FLAT, opacity: 0.45 }),
      ]),
    ],
    arms: [
      // arms by her sides, hands on her hips: busy but never cross
      arm('armL', { from: [66, 268], via: [38, 300], to: [76, 330], sleeve: FROCK, width: 30, hand: skin, handR: 16 }),
      arm('armR', { from: [234, 268], via: [262, 300], to: [224, 330], sleeve: FROCK, width: 30, hand: skin, handR: 16 }),
    ],
    // a wooden spoon poking out of the apron pocket
    extra: [
      group({ part: 'spoon', origin: [150, 316] }, [
        piece(band([[148, 326], [152, 296], [160, 270]], 7), wood, CUT),
        piece(ellipse(162, 258, 11, 15, 14), wood, CUT),
        ink([[158, 252], [162, 244]], { width: 2, color: 'rgba(255,255,255,0.4)' }),
      ]),
      piece(rect(118, 318, 64, 24, 6), '#e9dcc0', CUT),
    ],
  });
}

export const L11_CHARACTERS: Record<string, () => string> = {
  oldWoman,
};
