/**
 * Shared pieces for the Land of Music stories (land 12): the sounds of a
 * brass band, a big paper clock whose hands really turn, the big drum on
 * its stand, and the sneaky red goblins' footprints and figures.
 *
 * Not a story itself (it isn't in any registry). Bigger art lives in
 * src/art/lands/l12.ts and src/art/characters/l14.ts; this file only
 * dresses them for the puppet show.
 */
import { goblinFigure } from '../art/characters/l14';
import { bigDrum, L12 } from '../art/lands/l12';
import { band, bell, C, circle, group, ink, NOTE, noiseBurst, now, piece, raw, svg, tone, type Kit, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** One deep drum beat, `times` of them. */
export function boom(times = 1, gap = 0.4): void {
  const t = now();
  for (let i = 0; i < times; i++) {
    tone(96, t + i * gap, { peak: 0.26, attack: 0.004, decay: 0.45, glideTo: 52 });
    noiseBurst(t + i * gap, { freq: 260, type: 'lowpass', peak: 0.16, attack: 0.004, decay: 0.2 });
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

// ------------------------------------------------------------------- clock

const MINUTE_NUMS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

/**
 * A big paper clock (260 × 260) showing a time, in Andika numbers. The
 * hands are parts: `hour` and `minute` (draw both pointing up; set them
 * with `setClock`). With `fives`, small red minute numbers (5, 10 … 60)
 * ring the outside, so counting in fives can be read off it.
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

/** Sets a clock's hands to a time straight away. */
export function setClock(k: Kit, clock: HTMLElement, hour: number, minute: number): void {
  k.set(k.pivot(k.part(clock, 'hour')), { rotation: (hour % 12) * 30 + minute * 0.5 });
  k.set(k.pivot(k.part(clock, 'minute')), { rotation: minute * 6 });
}

/** Turns the hands on to a later time (minute hand clockwise, hour hand creeping with it). */
export function runClock(k: Kit, clock: HTMLElement, hour: number, toMinute: number, seconds: number): Promise<void> {
  const mins = k.part(clock, 'minute');
  const hrs = k.part(clock, 'hour');
  const hourDeg = (hour % 12) * 30 + toMinute * 0.5;
  return k.all(k.to(mins, seconds, { rotation: toMinute * 6, ease: 'power1.inOut' }), k.to(hrs, seconds, { rotation: hourDeg, ease: 'power1.inOut' }));
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

// --------------------------------------------------------------- goblins

/** A whole red goblin (240 × 340 art), sneaking or running, perhaps carrying the big drum. */
export function goblin(k: Kit, name: string, o: { x: number; y: number; w?: number; z?: number; pose?: 'sneak' | 'run'; flip?: boolean; drum?: boolean }): HTMLElement {
  const carry = o.drum ? bigDrum(196, 262, 0.5) : undefined;
  return k.add(goblinFigure(name, { pose: o.pose ?? 'sneak', flip: o.flip, carry }), { x: o.x, y: o.y, w: o.w ?? 150, z: o.z ?? 12 });
}

/** A little red footprint on the ground. */
export function footprint(k: Kit, x: number, y: number, w = 76, z = 8): HTMLElement {
  const el = k.keepsake('muddyPrint', { x, y, w, z, still: true });
  k.set(el, { rotation: -14 });
  return el;
}
