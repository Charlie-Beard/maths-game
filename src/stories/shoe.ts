/**
 * Shared pieces for the land 11 stories (the Old Woman's Shoe): its
 * sounds, the Old Woman's many children, tally marks that appear one at a
 * time, socks for the pictogram, coins and the bread stall for paying and
 * change, the beds in the toe, and the little red cap that peeps out of
 * the laces (the first sign of the Red Goblins, PLAN.md §3 / ROADMAP
 * "Session 6").
 *
 * Not a story itself (it isn't in any registry), like snow.ts: the
 * l11c* stories borrow from here and never from each other.
 *
 * Where things are in the land's backdrop (`k.landScene(11)`, the boot at
 * bootHouse(560, 585, 0.98)) is kept here too, so the children run out of
 * the real front door and the red cap hides in the real laces.
 */
import { child, bootHouse } from '../art/lands/l11';
import { drawCoin } from '../activities/visual';
import { bell, C, circle, curve, ellipse, group, ink, noiseBurst, NOTE, now, piece, poly, raw, rect, svg, tone, type Kit, type Node } from './kit';

// ------------------------------------------------------------------ places

/** Spots on the land's backdrop, in stage coordinates. */
export const SHOE = {
  /** The front door in the toe (its middle, and the step's y). */
  door: { x: 650, y: 577 },
  /** A gap in the laces, halfway down the boot's front, for something to hide in. */
  laces: { x: 852, y: 300 },
  /** The windows high in the shaft (glowing at night). */
  windows: [
    [1003, 260],
    [1089, 260],
    [1046, 382],
    [787, 489],
  ] as [number, number][],
} as const;

// ------------------------------------------------------------------ sounds

/** The old leather of the shoe creaking: a low, slow groan. */
export function creak(loud = 1): void {
  const t = now();
  tone(110, t, { wave: 'sawtooth', peak: 0.05 * loud, attack: 0.08, decay: 0.7, glideTo: 82, lowpass: 420, vibrato: [9, 3] });
  tone(160, t + 0.18, { wave: 'sawtooth', peak: 0.03 * loud, attack: 0.06, decay: 0.5, glideTo: 120, lowpass: 380, vibrato: [11, 2] });
}

/** One giant step of the walking shoe: a soft, deep thump and a creak. */
export function bootStep(): void {
  const t = now();
  noiseBurst(t, { freq: 240, type: 'lowpass', peak: 0.26, attack: 0.01, decay: 0.4 });
  tone(70, t, { peak: 0.2, decay: 0.45, glideTo: 42 });
  creak(0.6);
}

/** Children giggling: little clusters of high, quick notes. */
export function giggle(clusters = 2): void {
  const t = now();
  for (let c = 0; c < clusters; c++) {
    const base = [NOTE.E6, NOTE.C6, NOTE.G5][c % 3];
    for (let i = 0; i < 4; i++) tone(base * (1 - i * 0.06), t + c * 0.35 + i * 0.07, { wave: 'triangle', peak: 0.035, attack: 0.004, decay: 0.07 });
  }
}

/** A pencil mark on the tally card: a short, dry scratch. */
export function scratch(): void {
  noiseBurst(now(), { freq: 3200, type: 'bandpass', q: 1.2, peak: 0.07, attack: 0.005, decay: 0.12 });
}

/** The tiny bell on a goblin's cap: a quick, thin jingle. */
export function jingle(): void {
  const t = now();
  for (let i = 0; i < 3; i++) bell(NOTE.C7 * (i % 2 ? 0.94 : 1), t + i * 0.09, 0.03, 0.35);
}

/** A coin set down on the wooden counter. */
export function clink(i = 0): void {
  bell(NOTE.E6 * (1 + (i % 3) * 0.06), now(), 0.05, 0.4);
}

// --------------------------------------------------------------------- art

/** The children's clothes and hair, so each one looks different. */
const TOPS = [C.red, '#f2cf3b', C.teal, C.pink, C.blue, C.orange, C.purple, C.green];
const HAIR = [C.hairBrown, C.hairAuburn, C.hairBlack, C.hairSandy, C.hairBrown, C.hairBlack, C.hairSandy, C.hairAuburn];
const SKIN = [C.skin, C.skin, C.skinBrown, C.skin, C.skinBrown, C.skin, C.skin, C.skinBrown];

/**
 * One of the Old Woman's children (90 × 140; the feet at the bottom
 * middle). `i` picks the clothes; the pose is the land art's own.
 */
export function kid(i: number, pose: 'stand' | 'wave' | 'jump' | 'skip' = 'stand'): string {
  const n = ((i % 8) + 8) % 8;
  return svg({ w: 90, h: 140, name: `l11-kid-${n}-${pose}`, boil: false }, child(45, 136, 128, TOPS[n], { hair: HAIR[n], skin: SKIN[n], skirt: n % 2 === 1, pose }));
}

/** A cream torn-paper card (a tally chart or a sign), w × h. */
export function card(w: number, h: number, name: string, color: string = C.cream): string {
  return svg({ w, h, name, boil: false }, [piece(rect(6, 6, w - 12, h - 12, 12), color, { rough: 1 })]);
}

/** One upright tally mark (30 × 110), pencil-dark. */
export const mark = (name: string): string => svg({ w: 30, h: 110, name, boil: false }, [ink([[14, 8], [16, 102]], { width: 7, color: C.ink, wobble: 0.8 })]);

/** The fifth mark, across the other four like a gate (150 × 110), in red. */
export const gateMark = (name: string): string => svg({ w: 150, h: 110, name, boil: false }, [ink([[8, 86], [142, 24]], { width: 7, color: C.red, wobble: 0.8 })]);

/** Spacing of tally marks on the card, at full size. */
const SP = 26;
const GATE = SP * 4 + 34;

/**
 * Lays out `count` tally marks from (x, y), in gates of five, as hidden
 * actors (`scale` shrinks them). Show them one at a time with `showMark`.
 */
export function tallyMarks(k: Kit, x: number, y: number, count: number, o: { scale?: number; z?: number; name?: string } = {}): HTMLElement[] {
  const s = o.scale ?? 1;
  const out: HTMLElement[] = [];
  for (let i = 0; i < count; i++) {
    const g = Math.floor(i / 5);
    const j = i % 5;
    const gx = x + g * GATE * s;
    const el =
      j === 4
        ? k.add(gateMark(`${o.name ?? 'l11-tally'}-g`), { x: gx - 18 * s, y, w: 150 * s, z: (o.z ?? 22) + 1 })
        : k.add(mark(`${o.name ?? 'l11-tally'}-${j}`), { x: gx + j * SP * s, y, w: 30 * s, z: o.z ?? 22 });
    k.set(el, { opacity: 0 });
    out.push(el);
  }
  return out;
}

/** The width of `count` tally marks, at a scale (to centre them). */
export const tallyWidth = (count: number, s = 1): number => (Math.floor((count - 1) / 5) * GATE + (count % 5 === 0 ? 4 * SP + 10 : ((count - 1) % 5) * SP + 30)) * s;

/** Draws one tally mark in: the gate swipes across, the others grow down. */
export async function showMark(k: Kit, el: HTMLElement, gate: boolean): Promise<void> {
  scratch();
  if (gate) {
    k.set(el, { opacity: 1, scaleX: 0, transformOrigin: '0% 80%' });
    await k.to(el, 0.3, { scaleX: 1, ease: 'power2.out' });
  } else {
    k.set(el, { opacity: 1, scaleY: 0, transformOrigin: '50% 0%' });
    await k.to(el, 0.22, { scaleY: 1, ease: 'power2.out' });
  }
}

/** A sock (60 × 80) in a colour, for the pictogram. */
export function sock(color: string): string {
  return svg({ w: 60, h: 80, name: `l11-sock-${color}`, boil: false }, [
    piece(curve([[14, 6], [40, 6], [40, 50], [54, 58], [52, 74], [30, 74], [14, 60]], 1), color, { rough: 0.6 }),
    piece(rect(12, 4, 30, 12, 2), C.cream, { edge: 'cut', fibre: false }),
    ink([[16, 30], [38, 30]], { width: 3, color: 'rgba(255,255,255,0.55)' }),
    ink([[16, 40], [38, 40]], { width: 3, color: 'rgba(255,255,255,0.55)' }),
  ]);
}

/** A real coin (100 × 100), as he sees them in the toy shop and the activities. */
export const coin = (pence: number): string => drawCoin(pence, 100, false);

/**
 * The bread stall (420 × 300): a striped awning on two poles, a wooden
 * counter and a basket of loaves. Things for sale sit on the counter top
 * (y = 196 in the stall's own coordinates).
 */
export function breadStall(name = 'l11-stall'): string {
  const stripes: Node[] = [];
  for (let i = 0; i < 7; i++) stripes.push(piece(poly([[20 + i * 54, 20], [74 + i * 54, 20], [74 + i * 54, 74], [20 + i * 54, 74]]), i % 2 ? C.cream : C.red, { edge: 'cut', fibre: false }));
  const scallops: Node[] = [];
  for (let i = 0; i < 7; i++) scallops.push(piece(ellipse(47 + i * 54, 74, 27, 14), i % 2 ? C.cream : C.red, { edge: 'cut', fibre: false }));
  const loaves: Node[] = [];
  for (let i = 0; i < 4; i++) {
    const lx = 268 + (i % 2) * 52 + (i > 1 ? 26 : 0);
    const ly = 168 - (i > 1 ? 22 : 0);
    loaves.push(piece(ellipse(lx, ly, 28, 16), '#c98a45', { rough: 0.5 }), ink([[lx - 12, ly - 8], [lx - 6, ly + 2]], { width: 2.4, color: '#f1d39c' }), ink([[lx + 2, ly - 10], [lx + 8, ly]], { width: 2.4, color: '#f1d39c' }));
  }
  return svg({ w: 420, h: 300, name, boil: false }, [
    piece(rect(30, 60, 14, 236), C.brownDark, { edge: 'cut' }),
    piece(rect(376, 60, 14, 236), C.brownDark, { edge: 'cut' }),
    ...stripes,
    ...scallops,
    piece(rect(10, 196, 400, 26, 4), C.tan, { edge: 'cut' }),
    piece(rect(24, 220, 372, 76, 4), C.wood, { rough: 0.6 }),
    ink([[40, 252], [380, 252]], { width: 2, color: 'rgba(40,20,10,0.3)' }),
    piece(ellipse(310, 186, 78, 20), '#a7743f', { rough: 0.6 }),
    ...loaves,
  ]);
}

/** A sign with a price on it (150 × 96), held still. */
export function priceSign(text: string, name: string): string {
  return svg({ w: 150, h: 96, name, boil: false }, [
    piece(rect(8, 8, 134, 80, 10), C.cream, { rough: 0.8 }),
    raw(`<text x="75" y="68" text-anchor="middle" font-family="Andika, sans-serif" font-size="56" font-weight="700" fill="${C.ink}">${text}</text>`),
  ]);
}

/** A little wooden bed with a patchwork quilt (200 × 120), heads poke over the top. */
export function bed(color: string, name: string): string {
  return svg({ w: 200, h: 120, name, boil: false }, [
    piece(rect(6, 10, 22, 106, 4), C.wood, { edge: 'cut' }),
    piece(rect(172, 30, 22, 86, 4), C.wood, { edge: 'cut' }),
    piece(rect(20, 40, 160, 56, 8), color, { rough: 0.6 }),
    ...[0, 1, 2, 3].map((i) => piece(rect(30 + i * 38, 50, 28, 20, 3), i % 2 ? C.cream : C.goldLight, { edge: 'cut', fibre: false, opacity: 0.8 })),
    piece(rect(14, 90, 172, 12, 3), C.brownDark, { edge: 'cut' }),
  ]);
}

/** A sleepy child's head on a pillow (70 × 70), for tucking into bed. */
export function sleepyHead(i: number): string {
  const n = ((i % 8) + 8) % 8;
  return svg({ w: 70, h: 70, name: `l11-head-${n}`, boil: false }, [
    piece(ellipse(35, 52, 30, 14), C.white, { edge: 'cut' }),
    piece(circle(35, 38, 20), SKIN[n], { rough: 0.4 }),
    piece(curve([[15, 38], [17, 20], [35, 14], [53, 20], [55, 38], [35, 28]], 2), HAIR[n], { rough: 0.4 }),
    ink([[26, 40], [31, 42]], { width: 2.4, color: C.ink }),
    ink([[39, 42], [44, 40]], { width: 2.4, color: C.ink }),
  ]);
}

/**
 * A little red cap peeping out of a dark gap (140 × 120): the floppy
 * cap with its bell, and two narrow yellow eyes. Parts: `eyes`, `cap`.
 * Not frightening on its own: just somebody who shouldn't be there.
 */
export function redPeek(name = 'l11-peek'): string {
  return svg({ w: 140, h: 120, name, boil: false, label: 'a little red cap, hiding' }, [
    piece(ellipse(70, 84, 56, 30), '#24160e', { edge: 'cut', fibre: false }),
    group({ part: 'cap', origin: [70, 74] }, [
      piece(curve([[30, 74], [40, 36], [70, 20], [104, 30], [126, 14], [120, 40], [108, 74]], 2), '#b02634', { rough: 0.6 }),
      piece(curve([[28, 72], [110, 72], [112, 84], [26, 84]], 1), '#7c1a26', { edge: 'cut' }),
      piece(circle(124, 14, 9), C.brass, { edge: 'cut' }),
    ]),
    group({ part: 'eyes' }, [
      piece(ellipse(54, 96, 12, 7), '#f2d43a', { edge: 'cut', fibre: false, shadow: false }),
      piece(ellipse(88, 96, 12, 7), '#f2d43a', { edge: 'cut', fibre: false, shadow: false }),
      piece(ellipse(56, 96, 3, 6), '#1a0f08', { edge: 'clean', fibre: false, shadow: false }),
      piece(ellipse(90, 96, 3, 6), '#1a0f08', { edge: 'clean', fibre: false, shadow: false }),
    ]),
  ]);
}

/** The whole shoe on its own (640 × 480), toe to the left, for walking away. */
export function shoeHouse(name = 'l11-shoe'): string {
  return svg({ w: 640, h: 480, name, boil: false, label: 'the shoe house' }, [bootHouse(16, 458, 1)]);
}

/** A basket of buns with a checked cloth (200 × 150). `buns` shows that many peeping out. */
export function bunBasket(buns: number, name = 'l11-basket'): string {
  const out: Node[] = [];
  for (let i = 0; i < buns; i++) {
    const bx = 46 + (i % 4) * 36 + (i >= 4 ? 18 : 0);
    const by = 70 - (i >= 4 ? 16 : 0);
    out.push(piece(circle(bx, by, 20), '#d9a056', { rough: 0.5 }), piece(ellipse(bx - 5, by - 7, 7, 4), '#f3d29a', { edge: 'clean', fibre: false, shadow: false }));
  }
  return svg({ w: 200, h: 150, name, boil: false }, [
    ink([[40, 70], [60, 6], [140, 6], [160, 70]], { width: 6, color: C.brownDark }),
    ...out,
    piece(curve([[16, 72], [184, 72], [170, 140], [30, 140]], 1), '#b98a4a', { rough: 0.7 }),
    ...[0, 1, 2, 3].map((i) => ink([[30 + i * 4, 90 + i * 14], [170 - i * 4, 90 + i * 14]], { width: 2.2, color: 'rgba(70,40,15,0.45)' })),
    piece(poly([[22, 70], [96, 70], [70, 96]]), C.red, { edge: 'cut', fibre: false }),
    piece(poly([[34, 72], [56, 72], [48, 82]]), C.cream, { edge: 'cut', fibre: false, opacity: 0.8 }),
  ]);
}
