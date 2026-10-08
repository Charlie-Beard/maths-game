/**
 * Shared pieces for land 10's stories (Dame Snap's Prison): its sounds, its
 * places (the outside wall, the long side-on corridor, Silky's tower cell),
 * and the things in them (hanging cages, cell doors, numbered bars, rule
 * cards, sum slates, her shadow, Silky's dewdrop).
 *
 * Not a story itself (it isn't in any registry). It lives beside the
 * stories, like snapSchool.ts, so the chapter stories (l10c1 … l10c7) and
 * the finale (l10c8) borrow from here and never from each other. Her own
 * sounds (heels, ruler, clang, crack, slam, caw, clank) and the land 4
 * pieces (crowFlying, crackArt, chalkText, padlock) come from snapSchool.ts;
 * `prisonSound` re-exports the sounds so a prison story needs one import.
 *
 * The story bible for the land (what each chapter shows) is in the brief
 * in docs/ROADMAP.md (W5-10): the Folk are carried up in cages (c1), the
 * heroes squeeze in through numbered bars (c2), crack the rules in the
 * corridor (c3), open the outer doors with the Angry Pixie's help (c4),
 * find the Folk in cages they can't open yet (c5), hide from her in her
 * classroom (c6) and reach Silky's cell just as she comes (c7). The cages,
 * and Silky's cell, open only in the finale.
 *
 * Scary, never cruel (PLAN.md §2): cages drop and doors slam, but nobody
 * is ever touched, and every captive is cross or brave, never hurt.
 */
import { snapSound } from './snapSchool';
import { band, bell, C, circle, curve, ellipse, ink, NOTE, noiseBurst, now, piece, poly, raw, rect, rng, svg, tone, type Kit, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/**
 * The prison's sounds: Dame Snap's own (from snapSchool) plus locks, keys,
 * rattling bars, dripping water, the prison bell and Silky's song. All soft
 * and short, like hers.
 */
export const prisonSound = {
  ...snapSound,
  /** A lock giving way: a heavy clunk, a click, and a bright little ting. */
  unlock(): void {
    const t = now();
    tone(160, t, { peak: 0.14, attack: 0.002, decay: 0.12, glideTo: 90 });
    noiseBurst(t, { freq: 1800, q: 4, peak: 0.08, decay: 0.04 });
    noiseBurst(t + 0.14, { freq: 3200, q: 6, peak: 0.08, decay: 0.03 });
    bell(NOTE.E6, t + 0.2, 0.04, 0.6);
  },
  /** A lock that won't open: a dull rattle and a low, cross clunk. */
  stuck(): void {
    const t = now();
    for (let i = 0; i < 3; i++) noiseBurst(t + i * 0.08, { freq: 1400, q: 3, peak: 0.06, decay: 0.04 });
    tone(110, t + 0.26, { wave: 'triangle', peak: 0.1, decay: 0.18, glideTo: 80 });
  },
  /** Iron bars rattled (by a cross pixie, or a squeeze): quick metal taps. */
  rattle(times = 5): void {
    const t = now();
    for (let i = 0; i < times; i++) {
      const f = i % 2 ? 1250 : 980;
      tone(f, t + i * 0.07, { wave: 'triangle', peak: 0.05, attack: 0.002, decay: 0.12 });
      tone(f * 2.7, t + i * 0.07, { peak: 0.02, attack: 0.002, decay: 0.08 });
    }
  },
  /** A drop of water falling in the dark. */
  drip(): void {
    const t = now();
    tone(1300, t, { peak: 0.06, attack: 0.003, decay: 0.16, glideTo: 2100 });
  },
  /** The prison bell, far off: one deep, slow toll. */
  toll(): void {
    const t = now();
    bell(174.6, t, 0.14, 3.2);
    tone(87.3, t, { peak: 0.09, attack: 0.01, decay: 3.2 });
    bell(174.6 * 1.19, t + 0.01, 0.04, 2.2);
  },
  /** Silky singing, far up the stairs: a soft little tune of bells. */
  song(): void {
    const t = now();
    [NOTE.E5, NOTE.G5, NOTE.A5, NOTE.G5, NOTE.E5, NOTE.D5, NOTE.E5].forEach((f, i) => bell(f, t + i * 0.32, 0.035, 0.9));
  },
  /** Something squeezing through a tight gap: a rubbery squeak, then a pop. */
  squeeze(): void {
    const t = now();
    tone(500, t, { wave: 'triangle', peak: 0.06, attack: 0.05, decay: 0.5, glideTo: 820, vibrato: [14, 30] });
    tone(300, t + 0.55, { peak: 0.12, attack: 0.003, decay: 0.12, glideTo: 700 });
  },
};

// --------------------------------------------------------------- lettering

/** Andika lettering. */
const text = (x: number, y: number, s: string, size: number, fill: string, anchor = 'middle'): Node =>
  raw(`<text x="${x}" y="${y}" font-family="Andika, sans-serif" font-weight="700" font-size="${size}" fill="${fill}" text-anchor="${anchor}">${s}</text>`);

const flat = { edge: 'cut' as const, fibre: false as const, shadow: false };

/** Big flagstones of the prison wall, row by row, in a w × h area from (x, y). */
function stones(x: number, y: number, w: number, h: number, seed: number, o: { bw?: number; bh?: number } = {}): Node[] {
  const r = rng(seed);
  const bw = o.bw ?? 170;
  const bh = o.bh ?? 54;
  const out: Node[] = [];
  for (let row = 0; row * bh < h + bh; row++) {
    for (let col = -1; col * bw < w + bw; col++) {
      const sx = x + col * bw + (row % 2) * (bw / 2) + 4;
      const shade = r() < 0.3 ? '#47424f' : r() < 0.5 ? C.prisonWall : '#413c49';
      out.push(piece(rect(sx, y + row * bh + 3, bw - 8, bh - 6, 6), shade, { ...flat, opacity: 0.95 }));
    }
  }
  return out;
}

/** A cold lantern on a wall bracket (its glow is drawn too). */
function lantern(x: number, y: number, s = 1): Node[] {
  return [
    piece(circle(x, y + 30 * s, 80 * s), C.moonPale, { ...flat, opacity: 0.1 }),
    piece(band([[x - 34 * s, y - 10 * s], [x, y - 14 * s]], 5 * s), C.iron, { edge: 'cut' }),
    ink([[x, y - 14 * s], [x, y]], { width: 2 * s, color: C.iron }),
    piece(poly([[x - 13 * s, y], [x + 13 * s, y], [x + 17 * s, y + 11 * s], [x - 17 * s, y + 11 * s]]), C.iron, { edge: 'cut' }),
    piece(rect(x - 13 * s, y + 11 * s, 26 * s, 36 * s, 3), '#d9e2cf', { edge: 'cut', fibre: false }),
    piece(curve([[x, y + 20 * s], [x + 5 * s, y + 30 * s], [x + 4 * s, y + 38 * s], [x - 4 * s, y + 38 * s], [x - 5 * s, y + 30 * s]], 2), C.candle, flat),
    piece(rect(x - 17 * s, y + 46 * s, 34 * s, 8 * s), C.iron, { edge: 'cut' }),
  ];
}

/** A chain hanging down from (x, y), `len` long. */
function chain(x: number, y: number, len: number, s = 1): Node[] {
  const out: Node[] = [];
  for (let d = 0, i = 0; d < len; d += 16 * s, i++) {
    out.push(piece(i % 2 ? ellipse(x, y + d, 4 * s, 10 * s) : ellipse(x, y + d, 7 * s, 10 * s), C.ironLight, { edge: 'cut', fibre: false }));
    if (i % 2 === 0) out.push(piece(ellipse(x, y + d, 3 * s, 6 * s), C.prisonNight, { edge: 'clean', shadow: false }));
  }
  return out;
}

/** The moon behind ragged night clouds. */
function moon(x: number, y: number, r: number): Node[] {
  return [
    piece(circle(x, y, r * 1.8), C.moonPale, { ...flat, opacity: 0.1 }),
    piece(circle(x, y, r), C.moonPale, { edge: 'cut' }),
    piece(circle(x - r * 0.3, y - r * 0.2, r * 0.18), '#cfcbb4', flat),
    piece(circle(x + r * 0.35, y + r * 0.25, r * 0.13), '#cfcbb4', flat),
    piece(ellipse(x + r * 0.3, y + r * 0.6, r * 1.6, r * 0.3), '#3a3a52', { edge: 'torn', fibre: false, shadow: false, opacity: 0.9 }),
  ];
}

// ------------------------------------------------------------- backdrops

/**
 * Outside the prison, high in the cloud at night: a huge moon, the black
 * keep's stone wall across the middle, and in it a tall dark gap where the
 * barred gate goes (the bars are actors: see `numberedBar`). The gap is
 * GAP; the land's cloud edge runs along the bottom, where a ladder comes up.
 */
export const GAP = { x: 380, y: 170, w: 420, h: 450 };

export function outsideWall(name = 'l10-outside'): string {
  const r = rng(1010);
  const sky: Node[] = [piece(rect(-20, -20, 1220, 860), '#1b1a2c', { edge: 'clean', shadow: false })];
  for (let i = 0; i < 24; i++) sky.push(piece(circle(r() * 1180, r() * 160, 1.4 + r() * 1.6), C.cream, { ...flat, opacity: 0.7 }));
  const { x, y, w, h } = GAP;
  return svg({ w: 1180, h: 820, name, boil: false, className: 'backdrop' }, [
    ...sky,
    ...moon(1010, 90, 54),
    // The keep: the wall, battlements and two squat towers.
    piece(rect(-20, 110, 1220, 560), C.prisonWall, { rough: 0.8 }),
    ...stones(-20, 116, 1220, 540, 1011),
    ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => piece(rect(-10 + i * 120, 76, 70, 48, 2), C.prisonStone, { edge: 'cut' })),
    piece(rect(40, 40, 170, 640), C.prisonStone, { rough: 0.8 }),
    piece(rect(970, 40, 170, 640), C.prisonStone, { rough: 0.8 }),
    piece(poly([[28, 44], [125, -40], [222, 44]]), C.iron),
    piece(poly([[958, 44], [1055, -40], [1152, 44]]), C.iron),
    // Narrow barred slits in the towers, one with a cold light.
    ...[[125, 220], [125, 420], [1055, 260]].flatMap(([sx, sy], i) => [
      piece(rect(sx - 14, sy, 28, 70, 14), i === 1 ? '#c9d6c2' : C.prisonNight, { edge: 'cut' }),
      piece(rect(sx - 2, sy, 4, 70), C.iron, { edge: 'clean', shadow: false }),
    ]),
    // The gate's dark gap and its stone arch.
    piece(rect(x - 30, y - 40, w + 60, h + 40, (w + 60) / 2), C.prisonStone, { rough: 0.8 }),
    piece(rect(x, y, w, h, w / 2), '#0c0b10', { edge: 'cut', fibre: false }),
    piece(ellipse(x + w / 2, y + h - 40, w * 0.35, 30), '#1d1b24', { ...flat, opacity: 0.8 }),
    // A rule nailed beside the gate, and a lantern.
    piece(rect(240, 250, 90, 110, 2), C.chalk, { rough: 0.8 }),
    text(285, 290, 'NO', 30, C.ruler),
    text(285, 330, 'ENTRY', 22, C.snapInk),
    ink([[250, 346], [320, 344]], { width: 3, color: C.ruler }),
    ...lantern(880, 190, 1.1),
    // The land's cloud edge along the bottom.
    piece(curve([[-20, 640], [160, 620], [340, 650], [560, 626], [800, 652], [1000, 622], [1200, 646], [1200, 860], [-20, 860]], 2), '#8e8a94', { rough: 1.4 }),
    ...[60, 260, 480, 700, 920, 1120].map((cx, i) => piece(circle(cx, 690 + (i % 2) * 20, 70 + (i % 3) * 14), '#76727e', { rough: 1.2, shadow: false })),
    piece(rect(-20, 740, 1220, 120), '#5f5b68', { rough: 1.6, shadow: false }),
  ]);
}

/**
 * Inside the prison, seen side-on: a long stone wall with cold lanterns
 * and hanging chains, a high barred slit of moonlight, and flagstones
 * underfoot. The wall is plain between x 120 and 1060 (y 120 … 560) so
 * rule cards, cell doors or cages can stand against it. `wide` makes it
 * 2360 wide, for the camera to pan along a long corridor.
 */
export function corridor(name = 'l10-corridor', o: { wide?: boolean } = {}): string {
  const W = o.wide ? 2360 : 1180;
  const r = rng(1020);
  const flags: Node[] = [];
  for (let i = 0; i * 120 < W + 120; i++) flags.push(ink([[i * 120 - 40, 600], [i * 120 - 120, 840]], { width: 2, color: C.ink, opacity: 0.35 }));
  for (const fy of [650, 720]) flags.push(ink([[-20, fy], [W + 20, fy]], { width: 2, color: C.ink, opacity: 0.3 }));
  const lamps: Node[] = [];
  for (let lx = 80; lx < W; lx += 590) lamps.push(...lantern(lx, 90, 1));
  const chains: Node[] = [];
  for (let cx = 380; cx < W; cx += 760) chains.push(...chain(cx, -10, 110 + r() * 60));
  return svg({ w: W, h: 820, name, boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, W + 40, 860), C.prisonNight, { edge: 'clean', shadow: false }),
    ...stones(-20, -10, W + 40, 600, 1021),
    // A high barred slit, the moon's light falling in a long slant.
    piece(rect(560, 30, 60, 90, 30), '#1c2236', { edge: 'cut' }),
    piece(circle(590, 70, 20), C.moonPale, flat),
    ...[578, 602].map((bx) => piece(rect(bx - 3, 30, 6, 90), C.iron, { edge: 'cut', fibre: false })),
    piece(poly([[560, 120], [620, 120], [820, 820], [520, 820]]), C.moonPale, { ...flat, opacity: 0.06 }),
    // Skirting and floor.
    piece(rect(-20, 570, W + 40, 34), '#2c2933', { rough: 0.6 }),
    piece(rect(-20, 600, W + 40, 260), '#2a2730', { rough: 0.8 }),
    ...flags,
    ...lamps,
    ...chains,
    piece(ellipse(W / 2, 812, W * 0.55, 40), C.snapInk, { ...flat, opacity: 0.3 }),
  ]);
}

/**
 * The top of the tallest tower: a round stone cell with a tiny barred
 * window full of stars, and the stair coming up on the right (where her
 * heels come from). The cell's barred front (`cellBars`) stands at the
 * left, x 120 … 560.
 */
export function towerTop(name = 'l10-tower'): string {
  const r = rng(1030);
  const starsN: Node[] = [];
  for (let i = 0; i < 7; i++) starsN.push(piece(circle(280 + r() * 100, 80 + r() * 60, 1.6 + r()), C.cream, flat));
  const steps: Node[] = [];
  for (let i = 0; i < 7; i++) {
    const sy = 600 + i * 34;
    steps.push(piece(rect(880 + i * 30, sy, 340, 30, 3), i % 2 ? C.prisonStone : '#5a5463', { edge: 'cut' }));
  }
  return svg({ w: 1180, h: 820, name, boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), C.prisonNight, { edge: 'clean', shadow: false }),
    ...stones(-20, -10, 1220, 640, 1031, { bw: 140, bh: 50 }),
    // The curve of the round room: darker at both edges.
    piece(rect(-20, -20, 140, 860), C.snapInk, { ...flat, opacity: 0.35 }),
    piece(rect(1080, -20, 120, 860), C.snapInk, { ...flat, opacity: 0.35 }),
    // A tiny window full of stars.
    piece(rect(270, 60, 120, 100, 50), '#1c2236', { edge: 'cut' }),
    ...starsN,
    ...[300, 330, 360].map((bx) => piece(rect(bx - 3, 60, 6, 100), C.iron, { edge: 'cut', fibre: false })),
    piece(rect(258, 156, 144, 14, 3), C.prisonStone),
    // The stair's dark doorway, steps going down out of sight.
    piece(rect(860, 220, 300, 400, 150), '#0c0b10', { edge: 'cut' }),
    piece(rect(840, 200, 340, 30, 6), C.prisonStone, { edge: 'cut' }),
    ...steps,
    ...lantern(800, 200, 1),
    // The floor.
    piece(rect(-20, 600, 900, 260), '#2a2730', { rough: 0.8 }),
    ...[660, 730].map((fy) => ink([[-20, fy], [880, fy]], { width: 2, color: C.ink, opacity: 0.3 })),
    piece(ellipse(440, 812, 520, 40), C.snapInk, { ...flat, opacity: 0.3 }),
  ]);
}

// ---------------------------------------------------------------- things

/**
 * One iron bar of the gate, 80 × 470, with a number chalked on a tag
 * halfway up. `bent` bows it out sideways (the one they squeeze past).
 */
export function numberedBar(n: number, o: { bent?: boolean; tag?: string } = {}): string {
  const shaft: Pt[] = o.bent
    ? [[40, 6], [36, 120], [14, 235], [36, 350], [40, 464]]
    : [[40, 6], [40, 464]];
  return svg({ w: 80, h: 470, name: `l10-bar-${n}-${o.bent ? 'b' : 's'}` }, [
    piece(band(shaft, 18), C.iron, { edge: 'cut' }),
    piece(band(shaft.map(([x, y]) => [x - 5, y] as Pt), 4), C.ironLight, { ...flat, opacity: 0.8 }),
    piece(poly([[26, 14], [40, -14], [54, 14]]), C.iron, { edge: 'cut', fibre: false }),
    piece(rect(4, 200, 72, 56, 6), o.tag ?? C.chalk, { edge: 'cut' }),
    text(40, 243, String(n), 40, C.snapInk),
  ]);
}

/** The top and bottom rails that hold the bars, w × 470 (lay it behind them). */
export function barRails(w: number, name = 'l10-rails'): string {
  return svg({ w, h: 470, name: `${name}-${w}` }, [
    piece(rect(0, 20, w, 22, 4), C.iron, { edge: 'cut' }),
    piece(rect(0, 420, w, 22, 4), C.iron, { edge: 'cut' }),
    ...[0, 1, 2, 3].map((i) => piece(circle(20 + (i * (w - 40)) / 3, 31, 5), C.ironLight, { edge: 'clean', shadow: false })),
  ]);
}

/** A sum chalked on a framed slate, w × 120: lock sums, bar sums, her sums. */
export function slateSum(s: string, w = 360, name = ''): string {
  return svg({ w, h: 120, name: `l10-slate-${name}${s}-${w}` }, [
    piece(rect(0, 0, w, 120, 6), C.brownDark),
    piece(rect(10, 10, w - 20, 100, 3), C.blackboard, { edge: 'cut', fibre: false }),
    piece(ellipse(w * 0.7, 84, w * 0.2, 8, -6), C.chalk, { ...flat, opacity: 0.06 }),
    text(w / 2, 82, s, 58, C.chalk),
  ]);
}

/**
 * One of her rules nailed to the wall, 300 × 200: RULE and its number in
 * ruler-red, and under it a sum in ink. Crack it with `crackCard`; chalk
 * the answer on with `answerTag`.
 */
export function ruleCard(n: number, sum: string): string {
  return svg({ w: 300, h: 200, name: `l10-rule-${n}-${sum}`, label: `Rule ${n}` }, [
    piece(rect(8, 10, 284, 182, 4), C.chalk, { rough: 0.9 }),
    piece(circle(150, 22, 5), C.ironLight, { edge: 'clean', shadow: false }),
    text(150, 70, `RULE ${n}`, 36, C.ruler),
    ink([[70, 84], [230, 82]], { width: 3, color: C.ruler }),
    text(150, 156, sum, 56, C.snapInk),
  ]);
}

/** The answer chalked on a little ruler-red tag (120 × 90), to stick on a card or a lock. */
export function answerTag(s: string, color: string = C.goldLight): string {
  return svg({ w: 120, h: 90, name: `l10-answer-${s}-${color}`, boil: false }, [
    piece(rect(6, 6, 108, 78, 10), color, { rough: 0.8 }),
    text(60, 66, s, 54, C.snapInk),
  ]);
}

/** A jagged split right through a card, 300 × 200 (an actor laid over a ruleCard). */
export function crackCard(seed = 1): string {
  const r = rng(seed * 97 + 5);
  const pts: Pt[] = [];
  for (let i = 0; i <= 8; i++) pts.push([150 + (i % 2 ? -14 : 12) + (r() - 0.5) * 12, 6 + i * 24]);
  return svg({ w: 300, h: 200, name: `l10-crack-${seed}`, boil: false }, [
    ink(pts.map(([x, y]) => [x + 3, y] as Pt), { width: 7, color: C.snapInk, wobble: 0.4 }),
    ink(pts, { width: 2.5, color: '#fbf6ea', wobble: 0.4 }),
  ]);
}

/**
 * Cracks a rule card actor (placed at x, y, w): the split runs down it,
 * chalk dust puffs, it crackles, and the card's two halves sag apart a
 * little. Returns the crack.
 */
export async function crackCardOn(k: Kit, card: HTMLElement, box: { x: number; y: number; w: number }, seed = 1): Promise<HTMLElement> {
  const s = box.w / 300;
  const crack = k.add(crackCard(seed), { x: box.x, y: box.y, w: box.w, z: Number(card.style.zIndex || 10) + 1 });
  k.set(crack, { scaleY: 0, transformOrigin: '50% 0%' });
  snapSound.crack();
  await k.to(crack, 0.4, { scaleY: 1, ease: 'power1.in' });
  k.puff(box.x + 150 * s, box.y + 20 * s, 70, C.chalk);
  k.puff(box.x + 150 * s, box.y + 180 * s, 60, C.chalk);
  await k.all(k.to(card, 0.35, { rotation: 4, y: '+=8', ease: 'back.out(2)' }), k.to(crack, 0.35, { rotation: 4, y: '+=8', ease: 'back.out(2)' }));
  return crack;
}

/**
 * A heavy cell door, 280 × 460: planks, iron bands and studs, and a little
 * barred window at the top. Its hinge is on the left edge, so swing it
 * open with scaleX from the left (transformOrigin '0% 50%').
 */
export function cellDoor(name: string): string {
  const studs: Node[] = [];
  for (const sy of [120, 300, 420]) for (let i = 0; i < 6; i++) studs.push(piece(circle(36 + i * 42, sy, 5), C.ironLight, { edge: 'clean', shadow: false }));
  return svg({ w: 280, h: 460, name: `l10-door-${name}`, label: 'a cell door' }, [
    piece(rect(0, 0, 280, 460, 8), C.iron),
    ...[0, 1, 2, 3, 4].map((i) => piece(rect(12 + i * 52, 12, 50, 440, 2), i % 2 ? '#5b4636' : '#634c3a', { edge: 'cut' })),
    ...[110, 290, 410].map((by) => piece(rect(6, by, 268, 22, 2), C.iron, { edge: 'cut' })),
    ...studs,
    // The little barred window.
    piece(rect(80, 34, 120, 66, 8), '#0c0b10', { edge: 'cut' }),
    ...[110, 140, 170].map((bx) => piece(rect(bx - 4, 34, 8, 66), C.iron, { edge: 'cut', fibre: false })),
    // The handle.
    piece(circle(240, 230, 16), C.iron, { edge: 'cut' }),
    piece(circle(240, 230, 8), C.ironLight, { edge: 'clean', shadow: false }),
  ]);
}

/** The dark doorway behind a cell door (seen when it swings open), 280 × 460. */
export function doorway(name: string): string {
  return svg({ w: 280, h: 460, name: `l10-doorway-${name}` }, [
    piece(rect(0, 0, 280, 460, 8), C.prisonStone),
    piece(rect(16, 16, 248, 444, 4), '#0c0b10', { edge: 'cut', fibre: false }),
    piece(ellipse(140, 420, 90, 24), '#2a2730', { ...flat, opacity: 0.7 }),
  ]);
}

/**
 * A hanging cage, in two layers so someone can sit inside it: `cageBack`
 * (the dark inside and the floor) goes behind them and `cageFront` (the
 * bars, the dome, the ring and the lock) in front. The back is 280 × 400 and
 * the front 280 × 440 (the lock's tag hangs below the floor); lay both at
 * the same top-left corner and width. `lock` writes a sum on the lock's tag; `open` draws
 * the door swung wide (for the finale).
 */
export function cageBack(name: string): string {
  return svg({ w: 280, h: 400, name: `l10-cageback-${name}` }, [
    piece(curve([[20, 120], [40, 50], [140, 26], [240, 50], [260, 120], [260, 370], [20, 370]], 1), '#14121b', { edge: 'cut', fibre: false, shadow: false, opacity: 0.55 }),
    piece(ellipse(140, 372, 128, 20), C.iron, { edge: 'cut' }),
  ]);
}

export function cageFront(name: string, o: { lock?: string; open?: boolean } = {}): string {
  const bars: Node[] = [];
  const xs = [22, 68, 114, 166, 212, 258];
  for (const [i, x] of xs.entries()) {
    if (o.open && (i === 2 || i === 3)) continue;
    // The bars curve in at the top to meet under the ring.
    const top: Pt = [140 + (x - 140) * 0.35, 30];
    bars.push(piece(band([top, [x, 110], [x, 372]], 8), C.iron, { edge: 'cut', fibre: false }));
  }
  return svg({ w: 280, h: 440, name: `l10-cage-${name}-${o.lock ?? ''}-${o.open ? 'o' : 'c'}`, label: 'a cage' }, [
    ink(circle(140, 14, 13), { width: 6, color: C.iron, closed: true }),
    piece(ellipse(140, 32, 30, 10), C.iron, { edge: 'cut' }),
    ...bars,
    piece(band([[18, 112], [140, 100], [262, 112]], 10), C.iron, { edge: 'cut' }),
    piece(rect(10, 364, 260, 20, 6), C.iron, { edge: 'cut' }),
    ...(o.open
      ? [piece(poly([[114, 120], [60, 140], [60, 360], [114, 372]]), C.ironLight, { edge: 'cut', fibre: false, opacity: 0.5 })]
      : [
          // The lock, low on the door (clear of the face inside), its sum on a tag hanging below.
          piece(band([[126, 346], [126, 332], [140, 324], [154, 332], [154, 346]], 6), C.ironLight, { edge: 'cut' }),
          piece(rect(118, 342, 44, 38, 8), C.iron, { edge: 'cut' }),
          piece(circle(140, 358, 4), C.snapInk, { edge: 'clean', shadow: false }),
          ...(o.lock ? [ink([[140, 380], [140, 394]], { width: 2, color: C.ironLight }), piece(rect(70, 392, 140, 46, 6), C.chalk, { edge: 'cut' }), text(140, 427, o.lock, 32, C.snapInk)] : []),
        ]),
  ]);
}

/**
 * Puts a character in a hanging cage: back, the portrait (w × 0.7 of the
 * cage, sitting on its floor), then the bars. Returns the three actors
 * (move them together with bits' `together`), front last.
 */
export function caged(k: Kit, who: string, at: { x: number; y: number; w: number; z?: number; flip?: boolean; lock?: string }): { back: HTMLElement; who: HTMLElement; front: HTMLElement; all: HTMLElement[] } {
  const s = at.w / 280;
  const z = at.z ?? 20;
  const back = k.add(cageBack(who), { x: at.x, y: at.y, w: at.w, z });
  const pw = 200 * s;
  const el = k.character(who, { x: at.x + 40 * s, y: at.y + 372 * s - (340 / 300) * pw, w: pw, z: z + 1, flip: at.flip });
  const front = k.add(cageFront(who, { lock: at.lock }), { x: at.x, y: at.y, w: at.w, z: z + 2 });
  return { back, who: el, front, all: [back, el, front] };
}

/** Wide iron bars across the front of a cell, 440 × 500, with a lock low in the middle. */
export function cellBars(name: string, lock?: string): string {
  const bars: Node[] = [];
  for (let i = 0; i < 8; i++) bars.push(piece(rect(14 + i * 58, 20, 16, 470, 4), C.iron, { edge: 'cut' }));
  return svg({ w: 440, h: 500, name: `l10-cellbars-${name}-${lock ?? ''}`, label: 'cell bars' }, [
    ...bars,
    piece(rect(0, 10, 440, 24, 4), C.iron, { edge: 'cut' }),
    piece(rect(0, 466, 440, 24, 4), C.iron, { edge: 'cut' }),
    // The crossbar and lock sit low, so a face behind the bars stays clear.
    piece(rect(0, 346, 440, 18, 3), C.iron, { edge: 'cut' }),
    piece(rect(186, 330, 68, 60, 10), C.ironLight, { edge: 'cut' }),
    piece(circle(220, 352, 8), C.snapInk, { edge: 'clean', shadow: false }),
    piece(rect(216, 352, 8, 20), C.snapInk, { edge: 'clean', shadow: false }),
    ...(lock ? [piece(rect(130, 396, 180, 60, 6), C.chalk, { edge: 'cut' }), text(220, 442, lock, 40, C.snapInk)] : []),
  ]);
}

/** Dame Washalot's washtub, 220 × 150, frothing with suds. */
export function washtub(name = 'l10-tub'): string {
  return svg({ w: 220, h: 150, name, label: 'a washtub' }, [
    piece(poly([[20, 50], [200, 50], [182, 144], [38, 144]]), C.wood),
    ...[70, 120].map((by) => piece(band([[24 + (by - 50) * 0.2, by], [196 - (by - 50) * 0.2, by]], 8), C.iron, { edge: 'cut', fibre: false })),
    piece(ellipse(110, 52, 92, 14), C.brownDark, { edge: 'cut' }),
    ...[[50, 40, 20], [86, 30, 24], [126, 34, 22], [164, 42, 18], [104, 46, 18]].map(([x, y, rr]) => piece(circle(x, y, rr), C.suds, { edge: 'cut' })),
  ]);
}

/**
 * Silky's dewdrop (kept since land 7), 90 × 110: a glowing drop of light.
 * Her magic lives in it, so it glows when sums are right and when it's
 * near her. Put a `k.light` behind it for the glow.
 */
export function dewdrop(name = 'l10-dewdrop'): string {
  return svg({ w: 90, h: 110, name, label: 'Silky’s dewdrop' }, [
    piece(curve([[45, 4], [72, 52], [78, 78], [60, 104], [30, 104], [12, 78], [18, 52]], 2), C.dew, { edge: 'cut' }),
    piece(curve([[45, 30], [62, 64], [58, 88], [32, 88], [28, 64]], 2), C.dewShade, { ...flat, opacity: 0.6 }),
    piece(ellipse(32, 62, 7, 14, 20), C.white, { ...flat, opacity: 0.9 }),
    piece(circle(56, 84, 4), C.white, { ...flat, opacity: 0.8 }),
  ]);
}

/**
 * Dame Snap's shadow thrown on a wall, 260 × 460: the doorknob bun, the
 * sharp shoulders and the long ruler. Grow it on a wall (transformOrigin
 * '50% 100%') as her heels come closer.
 */
export function snapShadow(name = 'l10-shadow'): string {
  const ink2 = { edge: 'cut' as const, fibre: false as const, shadow: false };
  return svg({ w: 260, h: 460, name, boil: false }, [
    piece(circle(130, 34, 24), C.snapInk, ink2),
    piece(ellipse(130, 104, 40, 48), C.snapInk, ink2),
    piece(poly([[40, 460], [52, 190], [80, 160], [180, 160], [208, 190], [220, 460]]), C.snapInk, ink2),
    piece(band([[214, 200], [250, 40]], 12), C.snapInk, ink2),
  ]);
}

/** A tall wooden ladder, 160 × h, coming up from below (rungs every 50). */
export function ladderArt(h: number, name = 'l10-ladder'): string {
  const rungs: Node[] = [];
  for (let y = 30; y < h - 10; y += 50) rungs.push(piece(rect(26, y, 108, 12, 3), C.tan, { edge: 'cut', fibre: false }));
  return svg({ w: 160, h, name: `${name}-${h}` }, [
    piece(band([[22, 0], [22, h]], 18), C.wood, { edge: 'cut' }),
    piece(band([[138, 0], [138, h]], 18), C.wood, { edge: 'cut' }),
    ...rungs,
  ]);
}
