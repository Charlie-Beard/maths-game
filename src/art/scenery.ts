/**
 * Big backdrops (1180 × 820): the Faraway Tree at dusk, for the title and
 * the map. Each land's own backdrops live in art/lands/.
 *
 * The tree is the same every time, so he learns its places: the door in
 * the roots, Dame Washalot's tub (her washing water pouring down the
 * trunk), the Angry Pixie's window, Mr Watzisname asleep on his branch,
 * Silky's door, Mr Oom Boom Boom's ledge, the ladder up into the cloud and
 * Moon-Face's round room at the very top, with the slippery-slip
 * spiralling all the way down round the trunk. Whichever land is visiting
 * sits in the cloud above.
 *
 * TREE_PLACES gives the map its 8 stops (one per chapter, bottom to top)
 * in stage coordinates; TREE_HOOKS gives a branch tip for each land where finished
 * lands' seals can hang; TREE_SPOTS marks the slide's ends and the cloud.
 *
 * Moon-Face's round room, inside, is here too: every land's finale comes
 * home to it.
 */
import { LANDS } from '../core/curriculum';
import { LAND_ART } from './lands';
import { cloudBank, stars } from './lands/common';
import { C } from './palette';
import { band, circle, curve, dot, ellipse, group, ink, piece, poly, rect, rng, svg, type Node, type Pt } from './paper';

export interface TreePlace {
  id: string;
  label: string;
  x: number;
  y: number;
}

/** The map's 8 stops, bottom to top, in stage coordinates (the centre of each place). */
export const TREE_PLACES: TreePlace[] = [
  { id: 'door', label: 'The door in the roots', x: 600, y: 700 },
  { id: 'tub', label: 'Dame Washalot’s tub', x: 800, y: 584 },
  { id: 'pixie', label: 'The Angry Pixie’s window', x: 548, y: 520 },
  { id: 'watzisname', label: 'Mr Watzisname’s branch', x: 318, y: 436 },
  { id: 'silky', label: 'Silky’s door', x: 640, y: 386 },
  { id: 'oomboom', label: 'Mr Oom Boom Boom’s ledge', x: 852, y: 318 },
  { id: 'ladder', label: 'The ladder into the cloud', x: 410, y: 236 },
  { id: 'moonface', label: 'Moon-Face’s room', x: 596, y: 214 },
];

/** A branch tip for each land's seal (the map hangs land n on hook n-1). */
export const TREE_HOOKS: { x: number; y: number }[] = [
  { x: 180, y: 600 },
  { x: 1000, y: 650 },
  { x: 150, y: 470 },
  { x: 1010, y: 480 },
  { x: 205, y: 360 },
  { x: 990, y: 300 },
  { x: 280, y: 270 },
  { x: 930, y: 220 },
  { x: 140, y: 250 },
  { x: 1060, y: 380 },
  // The second adventure (lands 11–14).
  { x: 1080, y: 560 },
  { x: 100, y: 360 },
  { x: 1090, y: 250 },
  { x: 240, y: 180 },
];

/** Other places on the tree the map may want. */
export const TREE_SPOTS = {
  /** Where the slippery-slip starts (by Moon-Face's door) and lands (the cushions). */
  slideTop: { x: 650, y: 236 },
  slideBottom: { x: 360, y: 770 },
  /** The box the land's far view sits in (600 × 180). */
  cloud: { x: 290, y: 4, w: 600, h: 180 },
} as const;

const WATER = '#bcd9e6';
const WATER_LIGHT = '#e6f2f4';
/** The slippery-slip's polished chute and its darker rim (stories inside the trunk use them too). */
export const SLIDE = '#c98a3e';
export const SLIDE_RIM = '#8a5426';

/** Trunk half-width and centre at height y (the trunk narrows as it climbs). */
function trunkAt(y: number): { cx: number; hw: number } {
  const t = Math.min(1, Math.max(0, (y - 180) / (760 - 180)));
  return { cx: 596 + t * 4, hw: 38 + t * t * 120 + t * 20 };
}

const TRUNK: Pt[] = curve(
  [
    [380, 840],
    [470, 760],
    [508, 640],
    [528, 480],
    [544, 330],
    [556, 190],
    [560, 150],
    [632, 150],
    [636, 190],
    [648, 330],
    [664, 480],
    [690, 640],
    [728, 760],
    [820, 840],
  ],
  2,
);

/**
 * A leafy clump of canopy: a cluster of small torn leaf-balls in dusky
 * greens, with a few lighter ones catching the last of the sun.
 */
function clump(cx: number, cy: number, size: number, seed: number): Node[] {
  const r = rng(seed);
  const out: Node[] = [];
  const n = Math.round(size / 18);
  const shades = [C.greenDeep, C.leafDark, C.greenDark, C.woodShade];
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * size * 0.45;
    out.push(piece(circle(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.6, size * (0.16 + r() * 0.12)), shades[i % shades.length], { shadow: i < 2 }));
  }
  for (let i = 0; i < Math.round(n / 3); i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * size * 0.4;
    out.push(piece(circle(cx + Math.cos(a) * d, cy - size * 0.06 + Math.sin(a) * d * 0.5, size * (0.07 + r() * 0.06)), i % 2 ? C.moss : C.leaf, { shadow: false }));
  }
  return out;
}

/** A small lit window in the bark (the Folk who aren't stops still live here). */
const litWindow = (x: number, y: number, w = 22, h = 30): Node[] => [
  piece(rect(x - w / 2 - 4, y - h / 2 - 4, w + 8, h + 8, w / 2), C.barkDark, { edge: 'cut' }),
  piece(rect(x - w / 2, y - h / 2, w, h, w / 2), C.candle, { edge: 'cut', fibre: false, shadow: false }),
  piece(rect(x - 1.5, y - h / 2, 3, h), C.barkDark, { edge: 'clean', shadow: false }),
];

/** The slippery-slip: a polished wooden chute spiralling round the trunk. */
function slide(): { back: Node[]; front: Node[] } {
  const back: Node[] = [];
  const front: Node[] = [];
  const PITCH = 155;
  const y0 = 246;
  const y1 = 700;
  let run: Pt[] = [];
  let runFront: boolean | null = null;
  const flush = () => {
    if (run.length > 1) {
      const target = runFront ? front : back;
      target.push(piece(band(run, 24), runFront ? SLIDE_RIM : C.barkDark, { rough: 0.6, shadow: !!runFront }));
      target.push(piece(band(run.map(([x, y]) => [x, y - 4] as Pt), 14), runFront ? SLIDE : '#6a4426', { edge: 'cut', fibre: false, shadow: false }));
    }
    run = run.slice(-1);
  };
  for (let y = y0; y <= y1; y += 4) {
    const th = (2 * Math.PI * (y - 300)) / PITCH;
    const { cx, hw } = trunkAt(y);
    const R = hw + 26;
    const isFront = Math.cos(th) > 0;
    const p: Pt = [cx + R * Math.sin(th), y + 16 * Math.cos(th)];
    if (runFront !== null && isFront !== runFront) {
      run.push(p);
      flush();
    }
    runFront = isFront;
    run.push(p);
  }
  flush();
  // The run-out at the bottom: off round the roots to a heap of cushions.
  const out: Pt[] = [[526, 708], [490, 744], [440, 766], [396, 770]];
  front.push(piece(band(out, 24), SLIDE_RIM, { rough: 0.6 }));
  front.push(piece(band(out.map(([x, y]) => [x, y - 4] as Pt), 14), SLIDE, { edge: 'cut', fibre: false, shadow: false }));
  front.push(piece(ellipse(352, 782, 46, 20), C.rose));
  front.push(piece(ellipse(316, 770, 34, 18, -10), C.plum));
  front.push(piece(ellipse(372, 764, 30, 15, 12), C.goldLight));
  return { back, front };
}

/** Dame Washalot's tub on its branch, with the washing water pouring down the trunk. */
function washalotsTub(): Node[] {
  const { x, y } = TREE_PLACES[1];
  return [
    // The water: a ribbon tipping off the tub's lip, hugging the trunk, splashing at the bottom.
    piece(curve([[x - 52, y - 6], [x - 82, y + 20], [x - 104, y + 90], [x - 96, y + 170], [x - 70, y + 196], [x - 46, y + 194], [x - 70, y + 160], [x - 76, y + 90], [x - 58, y + 30], [x - 40, y + 4]], 2), WATER, { rough: 0.8, fibre: WATER_LIGHT }),
    ink([[x - 70, y + 20], [x - 88, y + 80], [x - 86, y + 150]], { width: 3, color: WATER_LIGHT, opacity: 0.9 }),
    ink([[x - 58, y + 40], [x - 68, y + 110]], { width: 2, color: C.white, opacity: 0.7 }),
    piece(ellipse(x - 66, y + 196, 46, 12), WATER, { edge: 'cut' }),
    ...[-40, -10, 20].map((dx, i) => piece(circle(x - 66 + dx, y + 186 - i * 4, 7 + i * 2), WATER_LIGHT, { edge: 'cut', fibre: false })),
    // The tub: a wooden half-barrel with iron hoops, frothing with suds.
    piece(poly([[x - 56, y - 24], [x + 56, y - 24], [x + 44, y + 22], [x - 44, y + 22]]), C.wood),
    piece(rect(x - 54, y - 14, 108, 7), C.greyDark, { edge: 'cut', fibre: false }),
    piece(rect(x - 48, y + 8, 96, 7), C.greyDark, { edge: 'cut', fibre: false }),
    ...[-40, -16, 10, 34].map((dx, i) => piece(circle(x + dx, y - 30 - (i % 2) * 6, 16 + (i % 2) * 4), C.white, { edge: 'torn', shadow: false })),
    piece(circle(x - 52, y - 46, 7), C.white, { edge: 'cut', fibre: false }),
    piece(circle(x + 30, y - 58, 5), C.white, { edge: 'cut', fibre: false }),
    // A washboard propped against it, and a sock hung out to dry.
    piece(rect(x + 50, y - 40, 22, 56, 4), C.sand, { edge: 'cut' }),
    ...[0, 1, 2, 3].map((i) => piece(rect(x + 53, y - 32 + i * 11, 16, 3), C.tan, { edge: 'clean', shadow: false })),
  ];
}

/** The Angry Pixie's window: a cross little window with a red curtain and a plant pot. */
function pixiesWindow(): Node[] {
  const { x, y } = TREE_PLACES[2];
  return [
    piece(rect(x - 34, y - 42, 68, 80, 30), C.barkDark, { edge: 'cut' }),
    piece(rect(x - 27, y - 35, 54, 66, 26), C.candle, { edge: 'cut', fibre: false, shadow: false }),
    piece(poly([[x - 27, y - 22], [x - 4, y - 30], [x - 14, y + 30], [x - 27, y + 30]]), C.red, { edge: 'cut', fibre: false }),
    piece(poly([[x + 27, y - 22], [x + 4, y - 30], [x + 14, y + 30], [x + 27, y + 30]]), C.red, { edge: 'cut', fibre: false }),
    // Shutters flung wide.
    piece(rect(x - 64, y - 34, 26, 64, 4), C.greenDark, { edge: 'cut' }),
    piece(rect(x + 38, y - 34, 26, 64, 4), C.greenDark, { edge: 'cut' }),
    // The sill and a pot of bristly pixie flowers.
    piece(rect(x - 42, y + 32, 84, 10, 3), C.wood),
    piece(poly([[x + 8, y + 32], [x + 32, y + 32], [x + 28, y + 12], [x + 12, y + 12]]), C.rust, { edge: 'cut' }),
    piece(circle(x + 14, y + 4, 7), C.orange, { edge: 'cut' }),
    piece(circle(x + 26, y + 2, 6), C.yellow, { edge: 'cut' }),
  ];
}

/** Mr Watzisname's branch: a sagging hammock with a snoring shape and his Zs. */
function watzisnamesBranch(): Node[] {
  const { x, y } = TREE_PLACES[3];
  const z = (zx: number, zy: number, s: number): Node =>
    ink([[zx, zy], [zx + s, zy], [zx, zy + s], [zx + s, zy + s]], { width: 3, color: C.cream, opacity: 0.9 });
  return [
    // Hammock ropes from the branch.
    ink([[x - 70, y - 22], [x - 56, y + 8]], { width: 2.5, color: C.brownDark }),
    ink([[x + 74, y - 26], [x + 60, y + 6]], { width: 2.5, color: C.brownDark }),
    piece(curve([[x - 60, y + 4], [x, y + 34], [x + 64, y + 2], [x, y + 18]], 2), C.cream, { rough: 0.8 }),
    // A blanketed sleeper and his nightcap.
    piece(curve([[x - 36, y + 10], [x - 20, y - 12], [x + 20, y - 16], [x + 44, y - 2], [x + 50, y + 12]], 2), C.plum, { edge: 'cut' }),
    piece(ellipse(x + 40, y - 6, 9, 7), C.skin, { edge: 'cut' }),
    piece(circle(x - 40, y - 8, 17), C.skin, { edge: 'cut' }),
    ink([[x - 50, y - 8], [x - 44, y - 5]], { width: 2.5, color: C.ink }),
    ink([[x - 36, y - 9], [x - 30, y - 6]], { width: 2.5, color: C.ink }),
    piece(circle(x - 40, y + 2, 3), C.rose, { edge: 'clean', shadow: false }),
    piece(poly([[x - 58, y - 14], [x - 24, y - 20], [x - 70, y - 46]]), C.purple, { edge: 'cut' }),
    piece(circle(x - 70, y - 46, 5), C.white, { edge: 'cut', fibre: false }),
    z(x - 22, y - 44, 12),
    z(x - 4, y - 66, 16),
    z(x + 20, y - 94, 20),
  ];
}

/** Silky's door: a little arched yellow door with flowers round it. */
function silkysDoor(): Node[] {
  const { x, y } = TREE_PLACES[4];
  const flowers: Node[] = [];
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (1.05 + (i / 6) * 0.9);
    flowers.push(piece(circle(x + Math.cos(a) * 42, y + 6 + Math.sin(a) * 50, 6), i % 2 ? C.pink : C.white, { edge: 'cut', fibre: false }));
  }
  return [
    piece(rect(x - 30, y - 40, 60, 82, 28), C.barkDark, { edge: 'cut' }),
    piece(rect(x - 24, y - 34, 48, 76, 24), C.goldLight, { edge: 'cut', fibre: false }),
    ink([[x, y - 30], [x, y + 40]], { width: 2, color: C.tan }),
    piece(circle(x + 14, y + 8, 3.5), C.brownDark, { edge: 'clean', shadow: false }),
    piece(rect(x - 34, y + 40, 68, 8, 3), C.wood),
    ...flowers,
  ];
}

/** Mr Oom Boom Boom's ledge: a shelf of bracket fungus with his big drum. */
function oomBoomsLedge(): Node[] {
  const { x, y } = TREE_PLACES[5];
  return [
    piece(curve([[x - 80, y + 26], [x - 70, y + 6], [x + 70, y + 2], [x + 84, y + 22], [x + 40, y + 40], [x - 40, y + 42]], 2), C.tan),
    piece(curve([[x - 66, y + 30], [x + 70, y + 26], [x + 30, y + 54], [x - 30, y + 56]], 2), C.sand),
    // The drum.
    piece(rect(x - 30, y - 34, 60, 40, 6), C.red),
    ...[0, 1, 2, 3].map((i) => ink([[x - 30 + i * 20, y - 34], [x - 20 + i * 20, y + 4]], { width: 2.5, color: C.goldLight })),
    piece(ellipse(x, y - 34, 30, 9), C.cream, { edge: 'cut' }),
    piece(band([[x + 20, y - 46], [x + 44, y - 70]], 5), C.brownDark, { edge: 'cut' }),
    piece(circle(x + 46, y - 72, 7), C.cream, { edge: 'cut' }),
    // A little striped awning above.
    piece(poly([[x - 70, y - 64], [x + 70, y - 70], [x + 60, y - 50], [x - 60, y - 44]]), C.orange, { edge: 'cut' }),
    ...[0, 1, 2, 3].map((i) => piece(poly([[x - 52 + i * 34, y - 64], [x - 36 + i * 34, y - 65], [x - 40 + i * 34, y - 47], [x - 56 + i * 34, y - 46]]), C.cream, { edge: 'cut', fibre: false, shadow: false })),
  ];
}

/** The ladder: from the top branch up through the cloud to whatever land is there. */
function ladder(): Node[] {
  const x0 = 384;
  const x1 = 432;
  const top = 92;
  const bot = 312;
  const out: Node[] = [
    piece(band([[x0, bot], [x0 + 14, top]], 9), C.wood, { edge: 'cut' }),
    piece(band([[x1, bot], [x1 + 14, top]], 9), C.wood, { edge: 'cut' }),
  ];
  for (let yy = bot - 18; yy > top + 6; yy -= 26) {
    const k = (bot - yy) / (bot - top);
    out.push(piece(rect(x0 + k * 14, yy - 3, x1 - x0, 6, 2), C.tan, { edge: 'cut', fibre: false }));
  }
  return out;
}

/** Moon-Face's round room at the top of the trunk. */
function moonFacesRoom(): Node[] {
  const { x, y } = TREE_PLACES[7];
  return [
    piece(ellipse(x, y + 6, 72, 54), C.barkLight),
    piece(ellipse(x, y + 6, 72, 54), C.bark, { edge: 'cut', fibre: false, shadow: false, opacity: 0.35 }),
    // Round door, round windows (everything about Moon-Face is round).
    piece(circle(x, y + 10, 30), C.barkDark, { edge: 'cut' }),
    piece(circle(x, y + 10, 24), C.goldLight, { edge: 'cut', fibre: false, shadow: false }),
    piece(circle(x, y + 10, 12), C.candle, { edge: 'clean', shadow: false, opacity: 0.8 }),
    piece(circle(x - 50, y - 6, 10), C.candle, { edge: 'cut' }),
    piece(circle(x + 50, y - 6, 10), C.candle, { edge: 'cut' }),
    // A little crescent moon over the door.
    piece(circle(x, y - 34, 11), C.goldLight, { edge: 'cut' }),
    piece(circle(x + 5, y - 37, 9), C.barkLight, { edge: 'cut', fibre: false, shadow: false }),
    // The slide's mouth: a dark hatch at the side with a cushion waiting.
    piece(rect(x + 44, y + 8, 34, 28, 10), C.barkDark, { edge: 'cut' }),
    piece(ellipse(x + 62, y + 30, 18, 7), C.rose, { edge: 'cut' }),
  ];
}

/** The door in the roots, with steps and a lantern. */
function rootDoor(): Node[] {
  const { x, y } = TREE_PLACES[0];
  return [
    piece(rect(x - 44, y - 56, 88, 112, 42), C.barkDark, { edge: 'cut' }),
    piece(rect(x - 36, y - 48, 72, 104, 36), C.brown, { edge: 'cut', fibre: false }),
    ...[0, 1, 2].map((i) => ink([[x - 24 + i * 24, y - 40], [x - 24 + i * 24, y + 54]], { width: 2.5, color: C.brownDark, opacity: 0.6 })),
    piece(circle(x + 22, y + 8, 5), C.gold, { edge: 'cut' }),
    piece(rect(x - 58, y + 54, 116, 14, 4), C.stone),
    piece(rect(x - 70, y + 66, 140, 14, 4), C.stoneLight),
    // A lantern on a hook.
    ink([[x + 56, y - 46], [x + 66, y - 46], [x + 66, y - 34]], { width: 3, color: C.ink }),
    piece(rect(x + 56, y - 34, 20, 28, 4), C.candle, { edge: 'cut' }),
    piece(rect(x + 56, y - 38, 20, 6, 2), C.ink, { edge: 'cut', fibre: false }),
  ];
}

/** A simple blob of colour for a land with no art (or a custom colour). */
function plainLand(color: string): Node[] {
  return [piece(ellipse(300, 110, 230, 56), color, { rough: 1.6 }), ...cloudBank(300, 156, 560, 11)];
}

export interface TreeOpts {
  /** The land visiting the cloud at the top (1 … 10). */
  landN?: number;
  /** A colour for the land instead, when there's no art to show. */
  landColor?: string;
}

/** The Faraway Tree at dusk, with a land (or none) in the cloud at the top. */
export function tree(name: string, o: TreeOpts = {}): string {
  const art = o.landN ? LAND_ART[o.landN] : undefined;
  const land: Node[] = art ? art.farNodes() : o.landColor ? plainLand(o.landColor) : [];
  const sl = slide();
  const cloud = TREE_SPOTS.cloud;
  const r = rng(5);
  const distant: Node[] = [];
  for (let i = 0; i < 11; i++) distant.push(piece(circle(40 + i * 112 + r() * 20, 640 + (i % 2) * 26, 90 + r() * 30), i % 2 ? C.greenDeep : C.leafDark, { shadow: false }));
  const grass: Node[] = [];
  for (let i = 0; i < 26; i++) {
    const gx = 20 + i * 46 + r() * 20;
    if (gx > 300 && gx < 860) continue;
    grass.push(ink([[gx, 800], [gx + 4, 778 - r() * 14]], { width: 3, color: C.leafDark, opacity: 0.8 }));
  }

  const nodes: Node[] = [
    // Sky: dusk bands from cool blue at the top to warm gold at the horizon.
    piece(rect(-20, -20, 1220, 300), C.duskHigh, { edge: 'clean', shadow: false }),
    piece(rect(-20, 240, 1220, 220), C.duskSky, { rough: 2, shadow: false, fibre: false }),
    piece(rect(-20, 420, 1220, 420), C.dusk, { rough: 2, shadow: false, fibre: false }),
    piece(circle(1010, 470, 60), C.goldLight, { edge: 'cut', fibre: false, shadow: false, opacity: 0.7 }),
    ...stars(30, 9, 1180, 120, [C.cream, C.goldLight]),
    piece(rect(-20, -20, 1220, 90), C.blueDark, { rough: 2, shadow: false, fibre: false, opacity: 0.25 }),
    // Faraway wisps.
    piece(ellipse(140, 330, 120, 14), C.cloud, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 }),
    piece(ellipse(1040, 260, 140, 16), C.cloud, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 }),
    // The cloud the land sits in: a wide bank behind, then the land itself.
    ...cloudBank(590, 196, 1000, 21, C.cloud, C.cloudShade),
    group({ transform: `translate(${cloud.x} ${cloud.y})` }, land),
    // Distant wood and the far hills.
    ...distant,
    piece(curve([[-20, 720], [300, 690], [600, 712], [900, 688], [1200, 716], [1200, 840], [-20, 840]], 2), C.greenDark, { rough: 1.4 }),
    // The back of the slide (behind the trunk), then the branches and trunk.
    ...sl.back,
    piece(band([[560, 300], [470, 296], [372, 312]], 24), C.bark),
    piece(band([[548, 440], [420, 420], [260, 432], [150, 460]], 34), C.bark),
    piece(band([[350, 425], [260, 380], [205, 356]], 14), C.bark),
    piece(band([[650, 350], [780, 334], [920, 330], [1060, 380]], 30), C.bark),
    piece(band([[880, 328], [950, 300], [990, 296]], 14), C.bark),
    piece(band([[668, 604], [760, 608], [880, 612], [1000, 650]], 30), C.bark),
    piece(band([[528, 610], [380, 592], [260, 590], [180, 600]], 26), C.barkDark),
    piece(band([[640, 250], [760, 230], [930, 220]], 18), C.bark),
    piece(band([[552, 250], [420, 252], [280, 270], [140, 250]], 16), C.bark),
    piece(TRUNK, C.bark),
    // Light and grooves on the bark.
    piece(band([[572, 200], [580, 400], [570, 560], [560, 740]], 16), C.barkLight, { shadow: false, opacity: 0.5, edge: 'cut' }),
    ink([[620, 200], [628, 420], [640, 620], [668, 760]], { width: 3, color: C.barkDark, opacity: 0.5, wobble: 1.4 }),
    ink([[566, 300], [556, 470], [534, 640]], { width: 3, color: C.barkDark, opacity: 0.4, wobble: 1.4 }),
    // Roots.
    piece(band([[500, 740], [440, 780], [360, 806], [300, 812]], 34), C.bark),
    piece(band([[700, 740], [770, 780], [860, 800], [930, 806]], 34), C.bark),
    piece(band([[600, 780], [600, 830]], 60), C.bark),
    // Canopy, framing the trunk without hiding the places.
    ...clump(110, 230, 220, 1),
    ...clump(1080, 200, 230, 2),
    ...clump(170, 560, 200, 3),
    ...clump(1030, 590, 200, 4),
    ...clump(80, 420, 170, 6),
    ...clump(1110, 430, 190, 7),
    ...clump(960, 300, 140, 10),
    ...clump(230, 330, 140, 12),
    ...clump(780, 250, 110, 8),
    ...clump(290, 250, 100, 9),
    // A few more Folk's windows on the way up.
    ...litWindow(560, 640),
    ...litWindow(650, 470, 18, 24),
    ...litWindow(610, 300, 18, 24),
    // The trunk vanishes up into the cloud.
    ...[540, 580, 620, 656].map((x, i) => piece(circle(x, 184 - (i % 2) * 6, 22 + (i % 2) * 5), C.cloud, { shadow: false })),
    // The places (one per chapter stop).
    ...rootDoor(),
    ...washalotsTub(),
    ...pixiesWindow(),
    ...watzisnamesBranch(),
    ...silkysDoor(),
    ...oomBoomsLedge(),
    ...ladder(),
    ...moonFacesRoom(),
    ...sl.front,
    // The ground and grass at the front.
    piece(curve([[-20, 790], [200, 770], [420, 800], [780, 796], [1000, 772], [1200, 790], [1200, 840], [-20, 840]], 2), C.greenDeep, { rough: 1.4 }),
    ...grass,
  ];
  return svg({ w: 1180, h: 820, name, boil: false, className: 'backdrop' }, nodes);
}

/**
 * The Faraway Tree at dusk (the title and the map). A `landColor` that
 * matches a land in the curriculum shows that land's own art in the cloud;
 * pass `landN` to choose the land directly.
 */
export function treeDusk(name: string, o: { landColor?: string; landN?: number } = {}): string {
  const match = o.landColor ? LANDS.find((l) => l.color.toLowerCase() === o.landColor!.toLowerCase()) : undefined;
  return tree(name, { landN: o.landN ?? match?.n, landColor: o.landColor });
}

// ------------------------------------------------------- Moon-Face's room

/** The colours of Moon-Face's cushions. */
export const CUSHIONS = [C.rose, C.goldLight, C.blue, C.plum, C.green, C.orange, C.pink, C.teal];

/** One plump tufted cushion, centred at (x, y). */
export function cushionNodes(x: number, y: number, w: number, h: number, color: string, rot = 0): Node[] {
  const c = Math.cos((rot * Math.PI) / 180);
  const s = Math.sin((rot * Math.PI) / 180);
  const at = (dx: number, dy: number): Pt => [x + dx * c - dy * s, y + dx * s + dy * c];
  const hw = w / 2;
  const hh = h / 2;
  return [
    piece(curve([at(-hw, -hh * 0.6), at(0, -hh), at(hw, -hh * 0.6), at(hw * 1.05, 0), at(hw, hh * 0.6), at(0, hh), at(-hw, hh * 0.6), at(-hw * 1.05, 0)], 3), color),
    dot(...at(0, 0), Math.max(3, h * 0.07), 'rgba(40,25,10,0.35)'),
    ...[-1, 1].map((sx) => ink([at(sx * hw * 0.55, -hh * 0.35), at(sx * hw * 0.2, -hh * 0.1)], { width: 2, color: 'rgba(40,25,10,0.25)' })),
  ];
}

/**
 * Moon-Face's round room, inside: curved plank walls, a big round window on
 * the night clouds, a round rug, heaps of cushions, the trapdoor where the
 * ladder comes up (left) and the mouth of the slippery-slip (right).
 */
export function moonRoom(name: string): string {
  const r = rng(81);
  const wx = 590;
  const wy = 236;
  const planks: Node[] = [];
  for (let i = -6; i <= 6; i++) {
    const x = 590 + i * 96;
    const bend = i * 14;
    planks.push(ink([[x - bend * 0.2, -10], [x, 280], [x + bend, 560]], { width: 3, color: C.brownDark, opacity: 0.35, wobble: 1.2 }));
  }
  const stars: Node[] = [];
  for (let i = 0; i < 18; i++) {
    const a = r() * Math.PI * 2;
    const d = r() * 128;
    stars.push(dot(wx + Math.cos(a) * d, wy + Math.sin(a) * d * 0.9, 1.4 + r() * 2.2, C.cream, 0.5 + r() * 0.5));
  }
  const back: Node[] = [];
  // Cushions heaped against the wall on both sides of the window.
  [[130, 520], [250, 500], [190, 470], [960, 500], [1070, 520], [1020, 470]].forEach(([x, y], i) => back.push(...cushionNodes(x, y, 150, 70, CUSHIONS[i % CUSHIONS.length], (i % 3 - 1) * 10)));
  return svg({ w: 1180, h: 820, name, boil: false, className: 'backdrop' }, [
    // The round wall, warm wood, darker at the edges.
    piece(rect(-20, -20, 1220, 860), C.wood, { edge: 'clean', shadow: false }),
    piece(rect(-20, -20, 200, 860), C.brown, { edge: 'torn', shadow: false, opacity: 0.55 }),
    piece(rect(1000, -20, 200, 860), C.brown, { edge: 'torn', shadow: false, opacity: 0.55 }),
    ...planks,
    // A shelf with jars and a little clock, all round.
    piece(rect(150, 210, 220, 14, 3), C.barkDark, { edge: 'cut' }),
    ...[180, 230, 290, 340].map((x, i) => piece(circle(x, 186 + (i % 2) * 4, 18 - (i % 2) * 4), [C.goldLight, C.sky, C.rose, C.cream][i], { edge: 'cut' })),
    piece(rect(820, 210, 220, 14, 3), C.barkDark, { edge: 'cut' }),
    piece(circle(880, 178, 26), C.cream, { edge: 'cut' }),
    ink([[880, 178], [880, 160]], { width: 3, color: C.ink }),
    ink([[880, 178], [892, 184]], { width: 3, color: C.ink }),
    ...[950, 1000].map((x, i) => piece(circle(x, 188, 16), [C.leaf, C.plum][i], { edge: 'cut' })),
    // The big round window: night sky and clouds outside.
    piece(circle(wx, wy, 168), C.barkDark),
    piece(circle(wx, wy, 146), C.night, { edge: 'cut', fibre: false, shadow: false }),
    piece(circle(wx, wy + 40, 120), C.nightLight, { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 }),
    ...stars,
    piece(circle(wx + 70, wy - 60, 26), C.goldLight, { edge: 'cut', fibre: false }),
    piece(circle(wx + 80, wy - 66, 22), C.night, { edge: 'cut', fibre: false, shadow: false }),
    piece(ellipse(wx - 40, wy + 90, 110, 26), C.cloud, { edge: 'torn', fibre: false, shadow: false, opacity: 0.85 }),
    piece(ellipse(wx + 70, wy + 110, 90, 22), C.cloudShade, { edge: 'torn', fibre: false, shadow: false, opacity: 0.85 }),
    piece(band([[wx - 146, wy], [wx + 146, wy]], 10), C.barkDark, { edge: 'cut', fibre: false }),
    piece(band([[wx, wy - 146], [wx, wy + 146]], 10), C.barkDark, { edge: 'cut', fibre: false }),
    // The floor: a round rug on wooden boards.
    piece(curve([[-20, 560], [300, 530], [590, 524], [880, 530], [1200, 560], [1200, 840], [-20, 840]], 2), C.barkLight, { rough: 1.2 }),
    ...back,
    piece(ellipse(590, 660, 400, 84), C.rose, { rough: 1.2 }),
    piece(ellipse(590, 660, 330, 64), C.gold, { edge: 'cut', fibre: false, shadow: false, opacity: 0.85 }),
    piece(ellipse(590, 660, 250, 46), C.rose, { edge: 'cut', fibre: false, shadow: false }),
    // The trapdoor, open, with the top of the ladder.
    piece(poly([[140, 640], [330, 640], [350, 720], [120, 720]]), C.ink, { edge: 'cut' }),
    piece(poly([[140, 640], [330, 640], [316, 560], [158, 560]]), C.wood, { edge: 'cut' }),
    piece(band([[180, 760], [184, 616]], 12), C.tan, { edge: 'cut' }),
    piece(band([[290, 760], [286, 616]], 12), C.tan, { edge: 'cut' }),
    ...[700, 650].map((y) => piece(rect(180, y, 110, 9, 2), C.tan, { edge: 'cut', fibre: false })),
    // The mouth of the slippery-slip, with its polished rim.
    piece(ellipse(1000, 690, 130, 40), SLIDE_RIM),
    piece(ellipse(1000, 692, 110, 30), C.ink, { edge: 'cut', fibre: false }),
    piece(band([[900, 700], [960, 716], [1040, 718], [1100, 700]], 14), SLIDE, { edge: 'cut', fibre: false, shadow: false }),
  ]);
}
