/**
 * Shared pieces for the Land of Toys stories (l8c1 … l8c7): a few toy
 * sounds, paper coins, a shop counter and a toy train, and Silky's dewdrop.
 *
 * Not a story itself (it isn't in any registry). It sits beside the
 * stories, like snapSchool.ts, so the stories borrow from here and never
 * from each other.
 *
 * Silky was taken at the end of land 7, but she dropped a dewdrop and the
 * hero kept it. Her magic lives in it: that's why her help still works on
 * the problem screen. In these stories it glows a little whenever a sum
 * comes out right, which is how the toys (and he) know she is still
 * out there.
 */
import { bell, C, circle, curve, ellipse, noiseBurst, now, NOTE, piece, poly, raw, rect, svg, tone, type Kit } from './kit';

// ------------------------------------------------------------------ sounds

/** A drum beat: a round, low boom (`big` for the deep one). */
export function boom(big = false): void {
  const t = now();
  tone(big ? 78 : 110, t, { peak: 0.3, attack: 0.004, decay: big ? 0.6 : 0.4, glideTo: big ? 42 : 60 });
  noiseBurst(t, { freq: 340, type: 'lowpass', peak: 0.1, attack: 0.003, decay: 0.12 });
}

/** A clockwork key being wound: a run of little clicks. */
export function windUp(clicks = 9): void {
  const t = now();
  for (let i = 0; i < clicks; i++) noiseBurst(t + i * 0.09, { freq: 2600 + (i % 2) * 500, q: 3, peak: 0.05, attack: 0.002, decay: 0.04 });
}

/** A coin set down on wood: a bright little clink. */
export function clink(i = 0): void {
  const t = now();
  bell(NOTE.E6 * (1 + i * 0.06), t, 0.05, 0.5);
  noiseBurst(t, { freq: 5000, q: 3, peak: 0.03, attack: 0.002, decay: 0.05 });
}

/** A tinny toy-train whistle: toot toot. */
export function toot(): void {
  const t = now();
  tone(440, t, { wave: 'square', peak: 0.04, attack: 0.02, decay: 0.28, lowpass: 1600 });
  tone(554, t + 0.34, { wave: 'square', peak: 0.04, attack: 0.02, decay: 0.4, lowpass: 1600 });
}

/** The dewdrop's soft chime: two high, gentle notes. */
function dewChime(): void {
  const t = now();
  bell(NOTE.G5, t, 0.05, 1.0);
  bell(NOTE.C6, t + 0.2, 0.05, 1.4);
}

// --------------------------------------------------------------------- art

/** Silky's dewdrop: a pale blue paper teardrop with a shine (60 × 80). */
function dewdropArt(): string {
  return svg({ w: 60, h: 80, name: 'toys-dewdrop', boil: false }, [
    piece(curve([[30, 4], [50, 40], [52, 58], [30, 76], [8, 58], [10, 40]], 2), C.dew, { rough: 0.5 }),
    piece(curve([[30, 30], [42, 52], [30, 66], [20, 54]], 2), C.dewShade, { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 }),
    piece(ellipse(22, 46, 4, 9, 20), '#ffffff', { edge: 'cut', fibre: false, shadow: false, opacity: 0.85 }),
  ]);
}

/**
 * Puts the hero's dewdrop on stage, in front of him (he stands at the
 * right, facing left, at x 905). `glow()` makes it shine for a moment.
 */
export function dewdrop(k: Kit): { el: HTMLElement; glow: () => Promise<void> } {
  const el = k.add(dewdropArt(), { x: 985, y: 575, w: 44, z: 26 });
  const halo = k.light(1007, 612, 95, { color: C.goldLight, strength: 0, z: 25 });
  const glow = async () => {
    dewChime();
    k.sparkle(1007, 600, 8, 90);
    await k.fade(halo, 0.55, 0.5);
    await k.wait(500);
    await k.fade(halo, 0, 0.7);
  };
  return { el, glow };
}

/** A paper coin (100 × 100) with its value on it: 1p, 2p and 5p, 10p. */
export function coin(pence: 1 | 2 | 5 | 10): string {
  const copper = pence <= 2;
  return svg({ w: 100, h: 100, name: `toys-coin-${pence}`, boil: false }, [
    piece(circle(50, 50, 42), copper ? '#c0773f' : '#c8ced5', { rough: 0.7 }),
    piece(circle(50, 50, 33), copper ? '#d38b50' : '#dde2e8', { edge: 'cut', fibre: false, shadow: false, opacity: 0.8 }),
    raw(`<text x="50" y="64" text-anchor="middle" font-family="Andika, sans-serif" font-weight="700" font-size="40" fill="${C.ink}">${pence}p</text>`),
  ]);
}

/** A wooden shop counter (700 × 200) with a painted front. */
export function counter(): string {
  return svg({ w: 700, h: 200, name: 'toys-counter', boil: false }, [
    piece(rect(10, 40, 680, 150, 6), C.wood, { rough: 0.8 }),
    ...[0, 1, 2, 3, 4, 5].map((i) => piece(rect(30 + i * 108, 70, 84, 100, 6), i % 2 ? C.toyBlue : C.toyRed, { edge: 'cut', fibre: false, shadow: false, opacity: 0.85 })),
    piece(rect(0, 10, 700, 40, 6), C.tan, { rough: 0.6 }),
  ]);
}

/** A little toy train: red engine, a yellow and a green carriage (420 × 150). */
export function toyTrain(): string {
  const wheel = (x: number, r = 17) => [piece(circle(x, 128, r), C.ink, { edge: 'cut' }), piece(circle(x, 128, r * 0.4), C.toyYellow, { edge: 'clean', shadow: false })];
  return svg({ w: 420, h: 150, name: 'toys-train', boil: false }, [
    // carriages
    piece(rect(150, 62, 110, 56, 6), C.toyYellow, { rough: 0.6 }),
    piece(rect(274, 62, 110, 56, 6), C.toyGreen, { rough: 0.6 }),
    piece(rect(258, 100, 18, 6), C.ink, { edge: 'cut', fibre: false }),
    // engine: cab, boiler, funnel
    piece(rect(10, 30, 62, 88, 4), C.toyRed, { rough: 0.6 }),
    piece(rect(66, 56, 90, 62, 22), C.toyBlue, { rough: 0.6 }),
    piece(rect(104, 22, 28, 38, 3), C.toyRed, { edge: 'cut' }),
    piece(poly([[0, 26], [82, 26], [76, 36], [6, 36]]), C.toyYellow, { edge: 'cut' }),
    ...[40, 92, 130, 196, 238, 312, 356].flatMap((x) => wheel(x, x === 40 ? 21 : 17)),
  ]);
}
