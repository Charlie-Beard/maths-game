/**
 * Shared pieces for land 4's chapter stories (Dame Snap's School): her
 * sounds, the classroom, the board of rules that cracks a little more
 * after every chapter, chalk sums, desks and the iron gates.
 *
 * Not a story itself (it isn't in any registry). It lives beside the
 * stories rather than in kit.ts so land 4 can be written without touching
 * the shared kit.
 *
 * The spine of the land (PLAN.md §3): every right answer quietly cracks one
 * of her rules. Her board lists seven, one per chapter, and each chapter's
 * story cracks its own (the ones before it are already cracked).
 */
import { C, band, bell, circle, ellipse, ink, noiseBurst, NOTE, now, piece, poly, raw, rect, rng, svg, tone, type Kit, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/**
 * Dame Snap's sounds. All soft and short: menace, never a fright that
 * hurts the ears. The chalk screech in particular is kept very quiet.
 */
export const snapSound = {
  /** Her terrible clacking heels: sharp, hollow clicks, `steps` of them. */
  heels(steps = 4, gap = 0.34, loud = 1): void {
    const t = now();
    for (let i = 0; i < steps; i++) {
      const at = t + i * gap;
      noiseBurst(at, { freq: 3200 + (i % 2) * 400, q: 5, peak: 0.1 * loud, decay: 0.03 });
      tone(1500 + (i % 2) * 120, at, { wave: 'triangle', peak: 0.05 * loud, attack: 0.002, decay: 0.05, glideTo: 900 });
      tone(220, at, { peak: 0.06 * loud, attack: 0.002, decay: 0.06, glideTo: 140 });
    }
  },
  /** The ruler SNAPPED down on a desk: a crack and a wooden thwack. */
  ruler(): void {
    const t = now();
    noiseBurst(t, { freq: 2600, q: 0.7, peak: 0.2, attack: 0.002, decay: 0.07, type: 'highpass' });
    tone(420, t, { wave: 'square', peak: 0.06, attack: 0.002, decay: 0.09, glideTo: 160, lowpass: 1600 });
    tone(140, t, { peak: 0.14, attack: 0.002, decay: 0.12, glideTo: 70 });
  },
  /** Chalk squeaking on the board: thin and very quiet. */
  chalk(seconds = 0.5): void {
    const t = now();
    tone(2300, t, { wave: 'sawtooth', peak: 0.012, attack: 0.04, decay: seconds, glideTo: 2600, vibrato: [30, 60], lowpass: 3200 });
    noiseBurst(t, { freq: 3000, q: 2, peak: 0.03, attack: 0.03, decay: seconds });
  },
  /** A crow's harsh caw, `times` over. */
  caw(times = 2): void {
    const t = now();
    for (let i = 0; i < times; i++) {
      const at = t + i * 0.42;
      tone(620, at, { wave: 'sawtooth', peak: 0.05, attack: 0.02, decay: 0.24, glideTo: 430, vibrato: [40, 30], lowpass: 1500 });
      noiseBurst(at, { freq: 1200, q: 1.5, peak: 0.04, attack: 0.02, decay: 0.2 });
    }
  },
  /** The iron gates clanging shut: a low ring and a heavy bump. */
  clang(): void {
    const t = now();
    bell(NOTE.C4, t, 0.12, 1.6);
    bell(NOTE.D4 * 1.06, t + 0.01, 0.07, 1.2);
    tone(80, t, { peak: 0.22, decay: 0.3, glideTo: 45 });
    noiseBurst(t, { freq: 900, q: 0.8, peak: 0.12, decay: 0.25 });
  },
  /** One of her rules cracking: a dry little crackle, then a split. */
  crack(): void {
    const t = now();
    const r = rng(17);
    for (let i = 0; i < 7; i++) noiseBurst(t + i * 0.035 + r() * 0.02, { freq: 2000 + r() * 2500, q: 3, peak: 0.07, decay: 0.025 });
    noiseBurst(t + 0.28, { freq: 1600, q: 0.8, peak: 0.13, decay: 0.12, sweepTo: 600 });
    tone(300, t + 0.28, { wave: 'triangle', peak: 0.06, decay: 0.15, glideTo: 120 });
  },
  /** A door slammed (somewhere off, not on anyone). */
  slam(): void {
    const t = now();
    tone(90, t, { peak: 0.26, decay: 0.28, glideTo: 45 });
    noiseBurst(t, { freq: 500, type: 'lowpass', peak: 0.2, decay: 0.22 });
    noiseBurst(t + 0.02, { freq: 2200, q: 1, peak: 0.05, decay: 0.08 });
  },
  /** The Saucepan Man's pots clanking. */
  clank(times = 3): void {
    const t = now();
    for (let i = 0; i < times; i++) bell(NOTE.A5 + i * 40, t + i * 0.11, 0.05, 0.35);
  },
};

// --------------------------------------------------------------- lettering

/** Andika lettering, for chalk sums and rules. */
const text = (x: number, y: number, s: string, size: number, fill: string, anchor = 'middle'): Node =>
  raw(`<text x="${x}" y="${y}" font-family="Andika, sans-serif" font-weight="700" font-size="${size}" fill="${fill}" text-anchor="${anchor}">${s}</text>`);

const chalkLine = (pts: Pt[], width = 4, color: string = C.chalk): Node => ink(pts, { width, color, wobble: 1 });

/**
 * A chalk sum (or any short chalk writing) on its own, no board behind it:
 * lay it over a board. `w` is the art's width; the text is 60 tall.
 */
export function chalkText(s: string, o: { w?: number; color?: string; size?: number } = {}): string {
  const w = o.w ?? 300;
  const size = o.size ?? 54;
  return svg({ w, h: 80, name: `l4-chalk-${s}-${o.color ?? ''}`, boil: false }, [text(w / 2, 60, s, size, o.color ?? C.chalk)]);
}

/** A plain framed slate to chalk sums on, `w` × `h`. */
export function slate(w: number, h: number, name = 'slate'): string {
  return svg({ w, h, name: `l4-slate-${name}-${w}x${h}` }, [
    piece(rect(0, 0, w, h, 6), C.brownDark),
    piece(rect(12, 12, w - 24, h - 24, 3), C.blackboard, { edge: 'cut', fibre: false }),
    piece(ellipse(w * 0.7, h * 0.7, w * 0.2, h * 0.08, -6), C.chalk, { edge: 'cut', fibre: false, shadow: false, opacity: 0.06 }),
  ]);
}

// ------------------------------------------------------------------ rules

/**
 * Her seven rules, one per chapter: chapter n's story cracks rule `RULE_FOR[n]`.
 * "Rule Number One: No Fun" is the one chapter 4 is named after.
 */
export const RULES = ['No fun', 'No right answers', 'No going home', 'No sitting in pairs', 'No helping', 'No shouting (except me)', 'No escaping'];
export const RULE_FOR: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 0, 5: 4, 6: 5, 7: 6 };

/** The rules board's size. */
export const BOARD = { w: 440, h: 380, top: 92, gap: 40 };

/**
 * The board of rules: a framed blackboard headed RULES in ruler-red, with
 * the seven rules in chalk. Rules listed in `cracked` are already split
 * (a jagged crack through the words). 440 × 380.
 */
export function rulesBoard(cracked: number[] = []): string {
  const { w, h, top, gap } = BOARD;
  const nodes: Node[] = [
    piece(rect(0, 0, w, h, 6), C.brownDark),
    piece(rect(14, 14, w - 28, h - 28, 3), C.blackboard, { edge: 'cut', fibre: false }),
    // Old smudges of rubbed-out sums.
    piece(ellipse(330, 300, 70, 22, -8), C.chalk, { edge: 'cut', fibre: false, shadow: false, opacity: 0.07 }),
    piece(ellipse(120, 60, 60, 16, 5), C.chalk, { edge: 'cut', fibre: false, shadow: false, opacity: 0.06 }),
    text(w / 2, 56, 'RULES', 38, C.ruler),
    chalkLine([[140, 66], [300, 66]], 4, C.ruler),
  ];
  RULES.forEach((r, i) => {
    const y = top + i * gap;
    nodes.push(text(36, y + 6, `${i + 1}.`, 24, C.chalk, 'start'));
    nodes.push(text(72, y + 6, r, 24, C.chalk, 'start'));
    if (cracked.includes(i)) nodes.push(...crackNodes(60, y - 2, 330, i + 3));
  });
  return svg({ w, h, name: `l4-rules-${cracked.join('')}`, label: 'Dame Snap’s rules' }, nodes);
}

/** A jagged crack across from (x, y), `w` long: a dark split with a pale edge. */
function crackNodes(x: number, y: number, w: number, seed: number): Node[] {
  const r = rng(seed * 131);
  const pts: Pt[] = [];
  const n = 9;
  for (let i = 0; i <= n; i++) pts.push([x + (w * i) / n, y + (i % 2 ? -9 : 7) + r() * 4]);
  return [chalkLine(pts.map(([px, py]) => [px, py + 2] as Pt), 6, C.snapInk), chalkLine(pts, 2.5, '#fbf6ea')];
}

/** A single fresh crack, as its own actor (so it can be drawn on, left to right): 340 × 40. */
export function crackArt(seed = 1): string {
  return svg({ w: 340, h: 40, name: `l4-crack-${seed}`, boil: false }, crackNodes(5, 20, 330, seed + 40));
}

/**
 * Cracks rule `i` on a rules board actor (placed with x, y and width w):
 * the crack draws across the words, chalk dust puffs off it, and it
 * crackles. Leaves the crack on the board. `amount` < 1 cracks it only
 * part of the way (her last rule, still holding until the finale).
 */
export async function crackRule(k: Kit, board: { x: number; y: number; w: number }, i: number, amount = 1): Promise<HTMLElement> {
  const s = board.w / BOARD.w;
  const y = board.y + (BOARD.top + i * BOARD.gap - 22) * s;
  const crack = k.add(crackArt(i), { x: board.x + 55 * s, y, w: 340 * s, z: 26 });
  k.set(crack, { scaleX: 0, transformOrigin: '0% 50%' });
  snapSound.crack();
  await k.to(crack, 0.45 * amount, { scaleX: amount, ease: 'power1.in' });
  k.puff(board.x + (55 + 335 * amount) * s, y + 20 * s, 70, C.chalk);
  k.puff(board.x + 120 * s, y + 20 * s, 50, C.chalk);
  return crack;
}

// -------------------------------------------------------------- the school

const WALL = '#4a4752';
const WALL_LOW = '#3a3741';
const FLOOR = '#5c4a3c';

/** A little school desk seen from behind (backdrop rows). */
function deskBack(x: number, baseY: number, s: number): Node[] {
  return [
    piece(rect(x - 36 * s, baseY - 52 * s, 6 * s, 52 * s), C.brownDark, { edge: 'cut', shadow: false }),
    piece(rect(x + 30 * s, baseY - 52 * s, 6 * s, 52 * s), C.brownDark, { edge: 'cut', shadow: false }),
    piece(poly([[x - 42 * s, baseY - 60 * s], [x + 42 * s, baseY - 60 * s], [x + 46 * s, baseY - 46 * s], [x - 46 * s, baseY - 46 * s]]), C.wood, { edge: 'cut' }),
    piece(rect(x - 40 * s, baseY - 46 * s, 80 * s, 20 * s), C.brown, { edge: 'cut' }),
    piece(circle(x + 28 * s, baseY - 62 * s, 5 * s), C.snapInk, { edge: 'cut' }),
  ];
}

/** A tall arched window with bars, the stormy sky beyond. */
function window(x: number, y: number, w: number, h: number, crow = false): Node[] {
  const out: Node[] = [
    piece(rect(x - 10, y - 10, w + 20, h + 20, w / 2 + 10), C.schoolDark),
    piece(rect(x, y, w, h, w / 2), '#5d5b6b', { edge: 'cut', fibre: false }),
    piece(ellipse(x + w * 0.3, y + h * 0.35, w * 0.5, 16), '#6f6c7c', { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }),
  ];
  for (let i = 1; i < 4; i++) out.push(piece(rect(x + (w * i) / 4 - 3, y + 6, 6, h - 6), C.iron, { edge: 'cut', shadow: false }));
  out.push(piece(rect(x - 16, y + h + 4, w + 32, 14, 2), C.schoolDark, { edge: 'cut' }));
  if (crow) {
    const cx = x + w * 0.7;
    const cy = y + h - 10;
    out.push(
      piece(ellipse(cx, cy, 18, 12, 20), C.snapInk, { edge: 'cut' }),
      piece(circle(cx - 14, cy - 10, 8), C.snapInk, { edge: 'cut' }),
      piece(poly([[cx - 20, cy - 12], [cx - 32, cy - 8], [cx - 20, cy - 6]]), C.greyDark, { edge: 'cut', fibre: false }),
      piece(poly([[cx + 14, cy + 2], [cx + 32, cy + 14], [cx + 12, cy + 10]]), C.snapInk, { edge: 'cut', fibre: false }),
      piece(circle(cx - 16, cy - 12, 2), C.chalk, { edge: 'clean', shadow: false }),
    );
  }
  return out;
}

/**
 * Her classroom, as a backdrop: a tall gloomy wall, barred windows either
 * side (a crow on one sill), a stopped clock, a clear space in the middle
 * of the wall for the rules board, and rows of little desks on the bare
 * boards. `rows: false` leaves the floor empty (for desks as actors).
 */
export function classroom(o: { rows?: boolean; name?: string } = {}): string {
  const r = rng(73);
  const boards: Node[] = [];
  for (let i = 0; i < 9; i++) boards.push(ink([[-20, 560 + i * 34 + i * i * 2], [1200, 560 + i * 34 + i * i * 2]], { width: 2, color: '#47382d', opacity: 0.7 }));
  const desks: Node[] = [];
  if (o.rows !== false) {
    for (let row = 0; row < 3; row++) {
      const s = 0.85 + row * 0.25;
      const y = 600 + row * 70;
      for (let i = 0; i < 4; i++) desks.push(...deskBack(590 + (i - 1.5) * 190 * s, y, s));
    }
  }
  return svg({ w: 1180, h: 820, name: o.name ?? 'l4-classroom', boil: false }, [
    piece(rect(-20, -20, 1220, 860), WALL, { edge: 'clean', shadow: false }),
    // Damp stains and cracks on the wall.
    ...[0, 1, 2, 3].map((i) => piece(ellipse(140 + i * 300 + r() * 60, 120 + r() * 200, 80, 40), WALL_LOW, { edge: 'torn', fibre: false, shadow: false, opacity: 0.35 })),
    ink([[880, 40], [870, 90], [890, 120], [876, 170]], { width: 2, color: C.iron, opacity: 0.6 }),
    // Wainscot.
    piece(rect(-20, 430, 1220, 140), WALL_LOW, { rough: 0.6 }),
    piece(rect(-20, 424, 1220, 14, 2), C.schoolDark, { edge: 'cut' }),
    ...[0, 1, 2, 3, 4, 5, 6].map((i) => ink([[i * 180 + 40, 440], [i * 180 + 40, 560]], { width: 3, color: C.iron, opacity: 0.5 })),
    ...window(60, 90, 150, 300, true),
    ...window(970, 90, 150, 300),
    // The stopped clock, high up.
    piece(circle(590, 40, 34), C.chalk, { edge: 'cut' }),
    ink([[590, 40], [590, 16]], { width: 4, color: C.snapInk }),
    ink([[590, 40], [606, 50]], { width: 4, color: C.snapInk }),
    // Floor.
    piece(rect(-20, 560, 1220, 300), FLOOR, { rough: 0.8 }),
    ...boards,
    ...desks,
    piece(ellipse(590, 812, 640, 40), C.snapInk, { edge: 'cut', fibre: false, shadow: false, opacity: 0.3 }),
  ]);
}

/**
 * A little desk seen from the front, for someone to sit behind (put it in
 * front of a portrait, lower down): a slanted lid, an inkwell and a slate.
 * 300 × 150. `slate` writes a sum on the slate.
 */
export function deskFront(name: string, slate?: string): string {
  return svg({ w: 300, h: 150, name: `l4-desk-${name}` }, [
    piece(rect(30, 70, 14, 80), C.brownDark, { edge: 'cut' }),
    piece(rect(256, 70, 14, 80), C.brownDark, { edge: 'cut' }),
    piece(rect(20, 64, 260, 60, 4), C.brown),
    piece(poly([[6, 30], [294, 30], [284, 70], [16, 70]]), C.wood),
    ink([[20, 40], [280, 40]], { width: 2, color: C.brownDark, opacity: 0.5 }),
    piece(circle(258, 26, 13), C.snapInk, { edge: 'cut' }),
    piece(rect(250, 8, 3, 18), C.chalk, { edge: 'cut', fibre: false }),
    ...(slate
      ? [piece(poly([[60, 16], [190, 16], [196, 60], [54, 60]]), C.blackboard, { edge: 'cut' }), text(125, 52, slate, 32, C.chalk)]
      : []),
  ]);
}

/** The gates' iron, lighter than the railings so they read when they swing. */
const GATE = '#6a6572';

/**
 * One leaf of the iron gates (the left one; flip it for the right), 230 ×
 * 330: tall spiked bars, cross rails and a curl at the top. The hinge is on
 * the outer edge (x 0), so swing it shut with scaleX from the left.
 */
export function gateLeaf(name: string): string {
  const bars: Node[] = [];
  for (let i = 0; i < 6; i++) {
    const x = 16 + i * 40;
    const top = 40 + i * 6;
    bars.push(piece(rect(x - 5, top, 10, 320 - top), GATE, { edge: 'cut' }));
    bars.push(piece(poly([[x - 11, top], [x, top - 24], [x + 11, top]]), GATE, { edge: 'cut', fibre: false }));
  }
  return svg({ w: 230, h: 330, name: `l4-gate-${name}` }, [
    piece(rect(0, 10, 18, 320, 3), C.stone),
    ...bars,
    piece(band([[0, 90], [230, 110]], 12), GATE, { edge: 'cut' }),
    piece(band([[0, 290], [230, 296]], 12), GATE, { edge: 'cut' }),
    ink([[60, 150], [90, 130], [120, 150], [150, 130], [180, 150]], { width: 7, color: GATE }),
    ink([[60, 230], [90, 250], [120, 230], [150, 250], [180, 230]], { width: 7, color: GATE }),
  ]);
}

/** A heavy padlock, 160 × 190. `dial` is chalked on its face. */
export function padlock(dial?: string): string {
  return svg({ w: 160, h: 190, name: `l4-padlock-${dial ?? ''}`, label: 'a padlock' }, [
    piece(band([[40, 90], [40, 40], [80, 14], [120, 40], [120, 90]], 18), C.ironLight, { edge: 'cut' }),
    piece(rect(14, 80, 132, 104, 14), C.iron),
    piece(rect(24, 90, 112, 84, 10), C.ironLight, { edge: 'cut', fibre: false, opacity: 0.6 }),
    piece(circle(80, 116, 10), C.snapInk, { edge: 'cut' }),
    piece(rect(76, 116, 8, 28), C.snapInk, { edge: 'cut', fibre: false }),
    ...(dial ? [text(80, 168, dial, 22, C.chalk)] : []),
  ]);
}

/** A crow, wings out, flying (for crows lifting off): 160 × 100. */
export function crowFlying(name: string): string {
  return svg({ w: 160, h: 100, name: `l4-crow-${name}`, label: 'a crow' }, [
    piece(poly([[70, 52], [20, 10], [10, 30], [40, 56]]), C.snapInk, { edge: 'cut' }),
    piece(poly([[90, 52], [140, 6], [152, 26], [118, 58]]), C.snapInk, { edge: 'cut' }),
    piece(ellipse(80, 60, 34, 16), C.snapInk, { edge: 'cut' }),
    piece(circle(112, 50, 12), C.snapInk, { edge: 'cut' }),
    piece(poly([[120, 46], [140, 52], [120, 56]]), C.greyDark, { edge: 'cut', fibre: false }),
    piece(poly([[48, 60], [22, 74], [50, 70]]), C.snapInk, { edge: 'cut', fibre: false }),
    piece(circle(115, 47, 2.5), C.chalk, { edge: 'clean', shadow: false }),
  ]);
}
