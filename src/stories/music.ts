/**
 * Shared pieces for the Land of Music stories (l12c1 … l12c8): the sounds
 * of a brass band, notes that pop up in bars of three, a big paper clock
 * whose hands really turn (counting on in fives), the big drum on its
 * stand, and the sneaky red goblins' footprints and figures.
 *
 * Not a story itself (it isn't in any registry). Bigger art lives in
 * src/art/lands/l12.ts and src/art/characters/l14.ts; this file only
 * dresses them for the puppet show.
 *
 * The land's story, chapter by chapter:
 *
 *   1  Oom-Pah-Pah!            Mr Oom Boom Boom's land, his big drum, a baton
 *   2  Three Beats to a Bar    saucepans played in threes, a triangle
 *   3  Trumpets in Threes      bunches of three trumpet flowers
 *   4  When Does the Band Play? ten past three, on the clock
 *   5  Five Minutes to Showtime twenty to four… and the drum vanishes
 *   6  The Big Drum is Gone!   red goblins have it, and run off
 *   7  Little Red Footprints   footprints in threes, to the edge of the land
 *   8  The Grand Parade        the goblins march it down a goblin hole
 *
 * Mr Oom Boom Boom's portrait has his own little drum on his chest; from
 * chapter 6 on it's hidden (`drumless`), so he holds just his sticks and
 * the loss shows.
 */
import { goblinFigure } from '../art/characters/l14';
import { bandChairs, bigDrum, L12, noteString, trumpetFlower } from '../art/lands/l12';
import { roundTag } from './bits';
import { band, bell, C, circle, curve, ellipse, group, ink, NOTE, noiseBurst, now, piece, poly, raw, rect, svg, tone, type Kit, type Node, type Pt } from './kit';

export { L12 };

// ------------------------------------------------------------------ sounds

/** One deep drum beat, `times` of them. `soft` is a beat heard far away. */
export function boom(times = 1, gap = 0.4, soft = false): void {
  const t = now();
  const v = soft ? 0.35 : 1;
  for (let i = 0; i < times; i++) {
    tone(96, t + i * gap, { peak: 0.26 * v, attack: 0.004, decay: 0.45, glideTo: 52 });
    noiseBurst(t + i * gap, { freq: 260, type: 'lowpass', peak: 0.16 * v, attack: 0.004, decay: 0.2 });
  }
}

/** A drum played badly (goblins at it): beats too loud, too soft and out of time. */
export function badBoom(times = 4): void {
  const t = now();
  const gaps = [0, 0.3, 0.85, 1.0, 1.6, 1.75];
  for (let i = 0; i < times; i++) {
    const at = t + gaps[i % gaps.length] + Math.floor(i / gaps.length) * 2;
    const v = i % 3 === 1 ? 0.4 : 1;
    tone(i % 2 ? 120 : 92, at, { peak: 0.22 * v, attack: 0.004, decay: 0.35, glideTo: 50 });
    noiseBurst(at, { freq: 300, type: 'lowpass', peak: 0.14 * v, attack: 0.004, decay: 0.18 });
  }
}

/** Oom-pah-pah: a deep beat and two light ones, `bars` times over. */
export function oomPah(bars = 1): void {
  const t = now();
  for (let i = 0; i < bars; i++) {
    const b = t + i * 1.5;
    tone(110, b, { peak: 0.2, attack: 0.005, decay: 0.3, glideTo: 70 });
    for (const dt of [0.5, 1]) tone(NOTE.E4, b + dt, { wave: 'triangle', peak: 0.09, attack: 0.005, decay: 0.16 });
  }
}

/** One beat of a bar: the first is low (oom), the others light (pah). */
export function beat(i: number): void {
  const t = now();
  if (i % 3 === 0) tone(110, t, { peak: 0.2, attack: 0.005, decay: 0.3, glideTo: 70 });
  else tone(NOTE.E4 * (i % 3 === 1 ? 1 : 1.12), t, { wave: 'triangle', peak: 0.1, attack: 0.005, decay: 0.18 });
}

/** A bright brass blast (a trumpet), short. */
export function blare(root: number = NOTE.G4): void {
  const t = now();
  for (const [f, dt] of [[root, 0], [root * 1.25, 0.16], [root * 1.5, 0.32]] as const) {
    tone(f, t + dt, { wave: 'sawtooth', peak: 0.05, attack: 0.02, decay: 0.2, lowpass: 1800 });
  }
}

/** A little trumpet fanfare: ta-ta-taaa. */
export function fanfare(): void {
  const t = now();
  for (const [f, dt, d] of [[NOTE.C5, 0, 0.14], [NOTE.C5, 0.16, 0.14], [NOTE.G5, 0.32, 0.6]] as const) {
    tone(f, t + dt, { wave: 'sawtooth', peak: 0.05, attack: 0.02, decay: d, lowpass: 2000 });
    tone(f / 2, t + dt, { wave: 'triangle', peak: 0.04, attack: 0.02, decay: d });
  }
}

/** A saucepan clank: a dull metal bonk, `times` of them. */
export function clank(times = 1, gap = 0.18): void {
  const t = now();
  for (let i = 0; i < times; i++) {
    noiseBurst(t + i * gap, { freq: 2400 + (i % 3) * 400, q: 4, peak: 0.09, attack: 0.002, decay: 0.12 });
    tone(520 + (i % 2) * 90, t + i * gap, { wave: 'square', peak: 0.025, attack: 0.002, decay: 0.12, lowpass: 1600 });
  }
}

/** A triangle: ting! */
export function ting(): void {
  const t = now();
  bell(NOTE.E6 * 1.5, t, 0.06, 1.6);
  bell(NOTE.E6 * 2.01, t, 0.025, 1.2);
}

/** A clock's soft tick-tock, `times` of them. */
export function tickTock(times = 3): void {
  const t = now();
  for (let i = 0; i < times; i++) tone(i % 2 ? 760 : 920, t + i * 0.5, { wave: 'triangle', peak: 0.06, attack: 0.002, decay: 0.07 });
}

/** A chime for a time reached: two soft bells. */
export function chimeTime(): void {
  const t = now();
  bell(NOTE.G5, t, 0.08, 1.2);
  bell(NOTE.C6, t + 0.18, 0.08, 1.4);
}

/** Tiny sneaky tiptoe steps, `n` of them. */
export function tiptoe(n = 6): void {
  const t = now();
  for (let i = 0; i < n; i++) {
    noiseBurst(t + i * 0.22, { freq: 1500, type: 'bandpass', peak: 0.05, attack: 0.002, decay: 0.05 });
    if (i % 3 === 0) bell(NOTE.E6, t + i * 0.22, 0.015, 0.25);
  }
}

/** A sly little goblin giggle: a quick wobbling run of notes. */
export function snicker(): void {
  const t = now();
  [NOTE.A5, NOTE.G5, NOTE.A5, NOTE.G5, NOTE.A5].forEach((f, i) => tone(f, t + i * 0.09, { wave: 'triangle', peak: 0.05, attack: 0.005, decay: 0.08, vibrato: [14, 8] }));
}

/** A sad, slow tune that gets further away (a land drifting off). */
export function farewellTune(): void {
  const t = now();
  [NOTE.E4, NOTE.D4, NOTE.C4].forEach((f, i) => bell(f, t + i * 0.7, 0.07 - i * 0.015, 1.8));
}

// ------------------------------------------------------------------- notes

/** A crotchet (60 × 110), cut from paper. Big ones are the "oom" of a bar. */
export function noteArt(color: string, name: string): string {
  return svg({ w: 60, h: 110, name, boil: false, label: 'a note' }, [
    piece(band([[42, 84], [42, 8]], 7), C.ink, { edge: 'cut', fibre: false }),
    piece(ellipse(28, 86, 20, 15, -22), color, { rough: 0.6 }),
  ]);
}

/**
 * Notes popping up in bars of three, with a running count under each bar
 * (3, 6, 9 …): the chapter's counting in threes, played as oom-pah-pah.
 * The first note of each bar is big (oom), the other two small (pah).
 * Bar lines stand between the bars. Returns everything it put on stage.
 */
export async function barsOfThree(k: Kit, bars: number, o: { x: number; y: number; barW?: number; z?: number; name: string; gap?: number }): Promise<HTMLElement[]> {
  const barW = o.barW ?? 180;
  const z = o.z ?? 24;
  const out: HTMLElement[] = [];
  const colors = [L12.brass, L12.drumRed, L12.teal];
  // A sheet of music paper behind the notes, so they stand out from the scenery.
  const sheet = k.add(musicSheet(bars * barW + 30, 250, `${o.name}-sheet`), { x: o.x - 20, y: o.y - 24, z: z - 1, still: true });
  k.set(sheet, { opacity: 0 });
  out.push(sheet);
  await k.fade(sheet, 1, 0.3);
  for (let b = 0; b < bars; b++) {
    const bx = o.x + b * barW;
    if (b > 0) out.push(k.add(barLine(), { x: bx - 14, y: o.y - 6, w: 12, z }));
    for (let i = 0; i < 3; i++) {
      const big = i === 0;
      const n = k.add(noteArt(colors[b % 3], `${o.name}-note-${b}-${i}`), { x: bx + 6 + i * 52, y: o.y + (big ? 0 : 22), w: big ? 62 : 48, z });
      k.set(n, { opacity: 0 });
      out.push(n);
      beat(i);
      await k.appear(n, 0.2);
      await k.wait(o.gap ?? 260);
    }
    const tag = k.add(roundTag((b + 1) * 3, C.goldLight, `${o.name}-tag-${b}`), { x: bx + 40, y: o.y + 122, w: 86, z });
    k.set(tag, { opacity: 0 });
    out.push(tag);
    k.fx.pop();
    await k.appear(tag, 0.25);
    await k.wait(200);
  }
  return out;
}

/** A sheet of cream music paper with five faint lines (w × h). */
export function musicSheet(w: number, h: number, name: string): string {
  return svg({ w, h, name, boil: false }, [
    piece(rect(6, 6, w - 12, h - 12, 10), L12.cream, { rough: 1 }),
    ...[0, 1, 2, 3, 4].map((i) => ink([[24, 40 + i * 18], [w - 24, 40 + i * 18]], { width: 1.5, color: L12.tealDark, opacity: 0.25 })),
  ]);
}

/** A thin bar line between bars of notes (12 × 120). */
function barLine(): string {
  return svg({ w: 12, h: 120, name: 'l12-barline', boil: false }, [ink([[6, 4], [6, 116]], { width: 4, color: C.ink, opacity: 0.8 })]);
}

/** A row of saucepans hung in threes (the Saucepan Man's band): `groups` × 3. */
export function panTrio(name: string): string {
  const pan = (x: number, y: number, r: number, col: string): Node[] => [
    piece(band([[x + r * 0.7, y - 4], [x + r * 2, y - 14]], 8), C.ink, { edge: 'cut', fibre: false }),
    piece(ellipse(x, y + 4, r, r * 0.8), col, { rough: 0.7 }),
    piece(ellipse(x, y - r * 0.55, r, r * 0.28), C.stoneLight, { edge: 'cut', fibre: false }),
  ];
  return svg({ w: 200, h: 110, name, boil: false, label: 'three saucepans' }, [
    ink([[6, 14], [194, 14]], { width: 3, color: C.brownDark }),
    ...[0, 1, 2].flatMap((i) => [ink([[34 + i * 64, 14], [34 + i * 64, 40]], { width: 2, color: C.brownDark }), ...pan(34 + i * 64, 70, i === 0 ? 30 : 24, i === 0 ? C.greyDark : C.grey)]),
  ]);
}

/** Three trumpet flowers growing from one pot (160 × 260). */
export function trumpetBunch(name: string, bloom: string): string {
  return svg({ w: 160, h: 260, name, boil: false, label: 'three trumpet flowers' }, [
    ...trumpetFlower(40, 222, 0.7, bloom),
    ...trumpetFlower(120, 222, 0.7, bloom),
    ...trumpetFlower(80, 212, 0.86, bloom),
    piece(poly([[34, 206], [126, 206], [114, 256], [46, 256]]), L12.drumRed, { rough: 0.6 }),
    piece(rect(28, 200, 104, 16, 4), L12.brass, { edge: 'cut' }),
  ]);
}

// ------------------------------------------------------------------- clock

const MINUTE_NUMS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

/**
 * A big paper clock (260 × 260) showing a time, in Andika numbers. The
 * hands are parts: `hour` and `minute` (drawn pointing up; set them with
 * `setClock`). With `fives`, small red minute numbers (5, 10 … 60) ring
 * the outside, so counting in fives can be read off it.
 */
export function clockFace(name: string, o: { fives?: boolean } = {}): string {
  const c = 130;
  const pt = (r: number, deg: number): Pt => [c + Math.sin((deg * Math.PI) / 180) * r, c - Math.cos((deg * Math.PI) / 180) * r];
  const nodes: Node[] = [
    piece(circle(c, c, o.fives ? 124 : 122), L12.brass, { rough: 0.8 }),
    piece(circle(c, c, o.fives ? 92 : 104), C.cream, { edge: 'cut', fibre: false, shadow: false }),
  ];
  for (let i = 1; i <= 12; i++) {
    const [x, y] = pt(o.fives ? 72 : 80, i * 30);
    nodes.push(raw(`<text x="${x}" y="${y + 11}" text-anchor="middle" font-family="Andika, sans-serif" font-weight="700" font-size="${o.fives ? 30 : 34}" fill="${C.ink}">${i}</text>`));
  }
  if (o.fives) {
    MINUTE_NUMS.forEach((m, i) => {
      const [x, y] = pt(108, (i + 1) * 30);
      nodes.push(raw(`<text x="${x}" y="${y + 6}" text-anchor="middle" font-family="Andika, sans-serif" font-weight="700" font-size="17" fill="${C.redDark}">${m}</text>`));
    });
  }
  nodes.push(
    group({ part: 'hour', origin: [c, c] }, [piece(band([[c, c + 10], [c, c - 52]], 11), C.ink, { edge: 'cut', fibre: false })]),
    group({ part: 'minute', origin: [c, c] }, [piece(band([[c, c + 12], [c, c - (o.fives ? 78 : 86)]], 7), C.redDark, { edge: 'cut', fibre: false })]),
    piece(circle(c, c, 9), C.gold, { edge: 'cut', fibre: false }),
    ink([[c - 4, c], [c + 4, c]], { width: 2, color: C.ink }),
  );
  return svg({ w: 260, h: 260, name, boil: false, label: 'a clock' }, nodes);
}

/** Puts a clock on stage showing a time (top-left x, y; width w). */
export function clock(k: Kit, name: string, o: { x: number; y: number; w?: number; z?: number; hour: number; minute: number; fives?: boolean }): HTMLElement {
  const el = k.add(clockFace(name, { fives: o.fives }), { x: o.x, y: o.y, w: o.w ?? 240, z: o.z ?? 16, still: true });
  setClock(k, el, o.hour, o.minute);
  return el;
}

/** Sets a clock's hands to a time straight away. */
export function setClock(k: Kit, el: HTMLElement, hour: number, minute: number): void {
  k.set(k.pivot(k.part(el, 'hour')), { rotation: (hour % 12) * 30 + minute * 0.5 });
  k.set(k.pivot(k.part(el, 'minute')), { rotation: minute * 6 });
}

/** Turns the hands on to a later time (minute hand clockwise, hour hand creeping with it). */
export function runClock(k: Kit, el: HTMLElement, hour: number, toMinute: number, seconds: number): Promise<void> {
  const hourDeg = (hour % 12) * 30 + toMinute * 0.5;
  return k.all(k.to(k.part(el, 'minute'), seconds, { rotation: toMinute * 6, ease: 'power1.inOut' }), k.to(k.part(el, 'hour'), seconds, { rotation: hourDeg, ease: 'power1.inOut' }));
}

/**
 * Counts on in fives: the minute hand steps five minutes at a time from
 * `from` to `to`, ticking, and a gold tag with the minutes counted so far
 * (5, 10, 15 …) pops up just outside the rim where the hand points.
 * Returns the tags (fade them when done).
 */
export async function countFives(k: Kit, el: HTMLElement, hour: number, from: number, to: number, name: string, each = 0.55): Promise<HTMLElement[]> {
  const left = parseFloat(el.style.left);
  const top = parseFloat(el.style.top);
  const size = parseFloat(el.style.width);
  const cx = left + size / 2;
  const cy = top + size / 2;
  const tags: HTMLElement[] = [];
  for (let m = from + 5; m <= to; m += 5) {
    tickTock(1);
    await runClock(k, el, hour, m, each);
    const a = (m * 6 * Math.PI) / 180;
    const r = size / 2 + 38;
    const tag = k.add(roundTag(m - from, C.goldLight, `${name}-five-${m}`), { x: cx + Math.sin(a) * r - 32, y: cy - Math.cos(a) * r - 32, w: 64, z: 30 });
    k.set(tag, { opacity: 0 });
    tags.push(tag);
    k.fx.pop();
    await k.appear(tag, 0.22);
    await k.wait(250);
  }
  return tags;
}

// ---------------------------------------------------------------- the drum

/** The big drum on its own (270 × 200), to sit in the empty stand or be carried off. */
export function drumArt(name: string): string {
  return svg({ w: 270, h: 200, name, boil: false, label: 'the big drum' }, bigDrum(135, 188, 1.05));
}

/** Where the big drum sits on the scenery's stand (stage coordinates of its top-left, and its width). */
export const DRUM_SPOT = { x: 705, y: 395, w: 180 } as const;

/** Puts the big drum on its stand. */
export function drumOnStand(k: Kit, name: string): HTMLElement {
  return k.add(drumArt(name), { x: DRUM_SPOT.x, y: DRUM_SPOT.y, w: DRUM_SPOT.w, z: 6, still: true });
}

/** The big drum booms: a deep beat and a little squash, `times` over. */
export async function boomDrum(k: Kit, drum: HTMLElement, times = 2): Promise<void> {
  for (let i = 0; i < times; i++) {
    boom(1);
    await k.to(drum, 0.08, { scaleY: 0.95, scaleX: 1.03, transformOrigin: '50% 100%', ease: 'power1.out' });
    await k.to(drum, 0.3, { scaleY: 1, scaleX: 1, ease: 'back.out(3)' });
  }
}

/** Hides Mr Oom Boom Boom's own little drum (after the big one is stolen, he has only his sticks). */
export function drumless(k: Kit, oom: HTMLElement): void {
  k.part(oom, 'drum').forEach((g) => (g.style.opacity = '0'));
}

// --------------------------------------------------------------- goblins

/** A whole red goblin (240 × 340 art), sneaking or running, perhaps carrying the big drum. */
export function goblin(k: Kit, name: string, o: { x: number; y: number; w?: number; z?: number; pose?: 'sneak' | 'run'; flip?: boolean; drum?: boolean }): HTMLElement {
  const carry = o.drum ? bigDrum(150, 250, 0.62) : undefined;
  return k.add(goblinFigure(name, { pose: o.pose ?? 'sneak', flip: o.flip, carry }), { x: o.x, y: o.y, w: o.w ?? 150, z: o.z ?? 12 });
}

/** A goblin's little marching step: a bob, `times` over, `each` seconds a step. */
export async function goblinBob(k: Kit, els: HTMLElement[], times: number, each = 0.3): Promise<void> {
  if (k.calm) return k.wait(times * each * 1000);
  for (let i = 0; i < times; i++) {
    await k.all(...els.map((e) => k.to(e, each / 2, { y: '-=8', rotation: i % 2 ? 3 : -3, ease: 'sine.out' })));
    await k.all(...els.map((e) => k.to(e, each / 2, { y: '+=8', ease: 'sine.in' })));
  }
}

/** A little red footprint on the ground. */
export function footprint(k: Kit, x: number, y: number, w = 76, z = 8, turn = -14): HTMLElement {
  const el = k.keepsake('muddyPrint', { x, y, w, z, still: true });
  k.set(el, { rotation: turn });
  return el;
}

// ------------------------------------------------------- the finale's scenery

/** The sky at the edge of the Land of Music, at dusk: teal going to gold. */
export function edgeSky(name: string): string {
  return svg({ w: 1180, h: 820, name, boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 860), L12.skyTop, { edge: 'clean', shadow: false }),
    piece(rect(-20, 240, 1220, 300), L12.skyMid, { edge: 'torn', shadow: false, fibre: false }),
    piece(rect(-20, 470, 1220, 400), C.duskSky, { edge: 'torn', shadow: false, fibre: false }),
    piece(circle(1000, 150, 54), L12.brassLight, { edge: 'cut', fibre: false, shadow: false, opacity: 0.7 }),
    ...[[200, 110], [640, 70], [940, 260]].map(([x, y]) => piece(ellipse(x, y, 120, 24), C.white, { edge: 'torn', fibre: false, shadow: false, opacity: 0.7 })),
    // the clouds below the land, where the ladder comes up
    ...[0, 1, 2, 3, 4, 5, 6].map((i) => piece(circle(40 + i * 190, 800 + (i % 2) * 24, 120), i % 2 ? C.cloud : C.cloudShade, { shadow: i % 2 === 0 })),
  ]);
}

/** Where the land's edge puts things (stage coordinates, before it rises away). */
export const EDGE = { ground: 560, end: 860, hole: { x: 470, w: 200 }, clock: { x: 60, y: 140, w: 200 } } as const;

/**
 * The edge of the Land of Music (1000 × 900): a grassy strip of land that
 * stops in mid-air, with band chairs, trumpet flowers, a string of notes
 * and a tall clock post. The goblin hole is its own actor (`goblinHole`).
 */
export function landEdge(name: string): string {
  const g = EDGE.ground;
  const pts: Pt[] = [[-40, g - 6], [EDGE.end - 40, g - 10], [EDGE.end, g + 30], [EDGE.end - 30, g + 120], [EDGE.end - 70, g + 230], [EDGE.end - 150, 900], [-40, 900]];
  const { x: cx, y: cy, w: cw } = EDGE.clock;
  return svg({ w: 1000, h: 900, name, boil: false }, [
    // a far field behind, so the edge reads as land and not a ledge
    piece(curve([[-40, g - 70], [260, g - 96], [560, g - 70], [EDGE.end - 70, g - 50], [EDGE.end - 30, g + 20], [-40, g + 20]], 1), '#74b8ac', { rough: 1, shadow: false }),
    ...noteString([-20, 60], [700, 120], 50, [[0.15, 16, 'crotchet', L12.cream], [0.38, 34, 'pair', L12.brass], [0.62, 10, 'quaver', L12.cream], [0.86, 30, 'crotchet', L12.brassLight]]),
    // the clock post
    piece(rect(cx + cw / 2 - 12, cy + cw - 10, 24, g - cy - cw + 14), L12.brassDark, { edge: 'cut' }),
    piece(rect(cx + cw / 2 - 34, g - 18, 68, 22, 6), L12.brass, { edge: 'cut' }),
    ...bandChairs(330, g + 4, 0.6),
    ...trumpetFlower(250, g + 6, 0.6, L12.drumRed),
    ...trumpetFlower(700, g + 6, 0.7, L12.teal),
    piece(curve(pts, 1), L12.grass, { rough: 1.2 }),
    piece(curve([[-40, g + 40], [EDGE.end - 20, g + 36], [EDGE.end - 50, g + 140], [EDGE.end - 100, g + 250], [EDGE.end - 170, 900], [-40, 900]], 1), L12.grassFront, { rough: 1.2, shadow: false }),
    piece(curve([[-40, g + 160], [EDGE.end - 110, g + 170], [EDGE.end - 160, 900], [-40, 900]], 1), '#8a6a4a', { rough: 1.4, shadow: false }),
    ...[[EDGE.end - 40, g + 210], [EDGE.end - 80, g + 300], [EDGE.end - 120, g + 360]].map(([x, y], i) => piece(rect(x, y, 16 - i * 4, 16 - i * 4, 3), '#8a6a4a', { edge: 'cut' })),
  ]);
}

/** The back of a goblin hole (a dark mouth in the ground), 200 × 70. */
export function holeBack(name: string): string {
  return svg({ w: 200, h: 70, name, boil: false, label: 'a goblin hole' }, [
    piece(ellipse(100, 35, 96, 30), '#3a2a1e', { rough: 0.8 }),
    piece(ellipse(100, 38, 84, 22), '#120c08', { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

/**
 * The front lip of a goblin hole and the ground below it (200 × 240): put
 * it in front of the goblins, and anything that sinks below the lip is hidden.
 */
export function holeFront(name: string): string {
  // The same bands as landEdge's ground below the hole (local y = stage y - (ground - 35)).
  return svg({ w: 200, h: 240, name, boil: false }, [
    piece(curve([[2, 34], [30, 52], [100, 66], [170, 52], [198, 34], [200, 240], [0, 240]], 1), L12.grass, { edge: 'clean', fibre: false, shadow: false }),
    piece(rect(0, 74, 200, 170), L12.grassFront, { edge: 'clean', fibre: false, shadow: false }),
    piece(rect(0, 198, 200, 50), '#8a6a4a', { edge: 'clean', fibre: false, shadow: false }),
    ink([[8, 36], [40, 54], [100, 66], [160, 54], [192, 36]], { width: 4, color: '#3a2a1e', opacity: 0.8 }),
  ]);
}

/** The top of the ladder, coming up through the cloud (600 × 400). */
export function ladderTop(name: string): string {
  return svg({ w: 600, h: 400, name, boil: false }, [
    piece(band([[190, 420], [196, 40]], 12), C.wood, { edge: 'cut' }),
    piece(band([[300, 420], [294, 40]], 12), C.wood, { edge: 'cut' }),
    ...[80, 140, 200, 260].map((y) => piece(rect(196, y, 98, 9, 2), C.tan, { edge: 'cut', fibre: false })),
    ...[0, 1, 2, 3, 4, 5].map((i) => piece(circle(30 + i * 110, 300 + (i % 2) * 30, 90), i % 2 ? C.cloud : C.cloudShade, { shadow: i % 2 === 0 })),
  ]);
}
