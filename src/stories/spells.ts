/**
 * Shared pieces for the Land of Spells stories (l7c1 … l7c7).
 *
 * Not a story itself. It holds the things several of these stories draw:
 * a ten frame to fill, a number line to hop back along, and the small
 * signs that Dame Snap is near. Her presence grows chapter by chapter (a
 * far-off clack, a ruler-shaped shadow, a torn page in her handwriting),
 * but she is never seen: the Land of Spells only hints, and l7c8 is where
 * she steps out. These hints are all sound and shadow, never a touch.
 */
import { gsap } from 'gsap';
import { snapSound } from './snapSchool';
import { bell, C, circle, ellipse, ink, NOTE, noiseBurst, now, piece, poly, raw, rect, svg, tone, type Kit } from './kit';

export { snapSound };

// ------------------------------------------------------------------ sounds

/** A small spell going right: a quick run of bell notes, up. */
export function spellChime(n = 4): void {
  const t = now();
  [NOTE.E5, NOTE.G5, NOTE.C6, NOTE.E6, NOTE.G6].slice(0, n).forEach((f, i) => bell(f, t + i * 0.11, 0.07, 0.9));
}

/** One bottle or star dropping into place: a soft glassy plink. */
export function plink(i = 0): void {
  bell(NOTE.C6 * Math.pow(2, (i % 6) / 6), now(), 0.06, 0.5);
}

/** A bubbling cauldron: a few low, wet bloops. */
export function bloop(times = 4): void {
  const t = now();
  for (let i = 0; i < times; i++) tone(200 + (i % 3) * 60, t + i * 0.18, { peak: 0.07, attack: 0.01, decay: 0.12, glideTo: 380 });
}

/** A page being turned or a sheet tearing: a rasp of paper. */
export function rustle(): void {
  noiseBurst(now(), { freq: 2200, q: 0.6, peak: 0.08, attack: 0.01, decay: 0.3, sweepTo: 900 });
}

// --------------------------------------------------------------------- art

/** A ten frame (two rows of five) on cream paper. 560 × 250. */
export function tenFrame(name: string, tint: string = C.cream): string {
  const lines = [0, 1, 2, 3, 4, 5].map((i) => ink([[30 + i * 100, 30], [30 + i * 100, 230]], { width: 4, color: C.plum }));
  const rows = [0, 1, 2].map((i) => ink([[30, 30 + i * 100], [530, 30 + i * 100]], { width: 4, color: C.plum }));
  return svg({ w: 560, h: 250, name, boil: false }, [piece(rect(8, 8, 544, 234, 14), tint, { rough: 1 }), ...lines, ...rows]);
}

/** Where cell `i` (0–9) of a ten frame placed at (x, y) has its middle. */
export const cell = (x: number, y: number, i: number): [number, number] => [x + 80 + (i % 5) * 100, y + 80 + Math.floor(i / 5) * 100];

/**
 * A little number line from `from` to `to`, marks every one, with the
 * numbers in `label` written large. 900 × 150; mark n sits at x(n).
 */
export function numberLine(name: string, from: number, to: number, label: number[]): string {
  const span = to - from;
  const mx = (n: number) => 50 + ((n - from) / span) * 800;
  const marks = Array.from({ length: span + 1 }, (_, i) => from + i);
  return svg({ w: 900, h: 150, name, boil: false }, [
    piece(rect(10, 40, 880, 100, 14), C.cream, { rough: 1, opacity: 0.92 }),
    ink([[40, 90], [860, 90]], { width: 5, color: C.plum }),
    ...marks.map((n) => ink([[mx(n), 78], [mx(n), 102]], { width: 4, color: C.plum })),
    ...label.map((n) =>
      raw(`<text x="${mx(n)}" y="132" text-anchor="middle" font-family="Andika, sans-serif" font-weight="700" font-size="44" fill="${C.ink}">${n}</text>`),
    ),
  ]);
}

/** Where number `n` sits along a numberLine placed at stage x with width w. */
export const lineX = (x: number, w: number, from: number, to: number, n: number): number => x + ((50 + ((n - from) / (to - from)) * 800) / 900) * w;

/** An arc to show a hop along the number line (200 wide at most). */
export function hopArc(name: string, w: number, color: string): string {
  return svg({ w, h: 70, name, boil: false }, [ink([[6, 66], [w * 0.25, 14], [w * 0.75, 14], [w - 6, 66]], { width: 6, color })]);
}

/** A torn bit of spellbook page, 360 × 300, with spiky red handwriting. */
export function tornPage(name: string, lines: string[]): string {
  return svg({ w: 360, h: 300, name }, [
    piece(poly([[14, 20], [120, 8], [200, 22], [300, 6], [346, 30], [336, 120], [350, 190], [332, 280], [230, 292], [140, 276], [60, 290], [12, 270], [24, 160]]), '#efe2c4', { rough: 1.4 }),
    ...lines.map((t, i) =>
      raw(
        `<text x="180" y="${88 + i * 62}" text-anchor="middle" font-family="Andika, sans-serif" font-weight="700" font-size="${i === lines.length - 1 ? 44 : 34}" fill="#8b1c2c" transform="rotate(${i % 2 ? 2 : -3} 180 ${88 + i * 62}) skewX(-10)">${t}</text>`,
      ),
    ),
  ]);
}

/** The long, thin shadow of a ruler: 560 × 70, dark and soft, with tick marks. */
export function rulerShadow(name: string): string {
  const ticks = Array.from({ length: 13 }, (_, i) => piece(rect(20 + i * 40, 8, 5, i % 2 ? 14 : 24), '#0a0814', { edge: 'clean', shadow: false, opacity: 0.8 }));
  return svg({ w: 560, h: 70, name, boil: false }, [
    piece(poly([[10, 10], [550, 14], [552, 58], [8, 56]]), '#0a0814', { edge: 'clean', fibre: false, shadow: false, opacity: 0.75 }),
    ...ticks,
  ]);
}

/** A pair of narrow pointed heel-prints on the stones. 120 × 60. */
export function heelPrints(name: string): string {
  return svg({ w: 120, h: 60, name, boil: false }, [
    piece(ellipse(24, 40, 12, 7), '#0a0814', { edge: 'clean', fibre: false, shadow: false, opacity: 0.5 }),
    piece(ellipse(80, 20, 12, 7), '#0a0814', { edge: 'clean', fibre: false, shadow: false, opacity: 0.5 }),
    piece(circle(24, 40, 3), '#0a0814', { edge: 'clean', fibre: false, shadow: false, opacity: 0.5 }),
  ]);
}

/** The tip of a long wooden ruler, pointing in from the right (460 × 70). */
export function rulerTip(name: string): string {
  const ticks = Array.from({ length: 10 }, (_, i) => piece(rect(40 + i * 40, 10, 4, i % 2 ? 14 : 24), C.brownDark, { edge: 'cut', fibre: false, shadow: false }));
  return svg({ w: 460, h: 70, name }, [piece(poly([[6, 30], [14, 10], [450, 12], [452, 58], [14, 60]]), C.wood, { rough: 0.8 }), ...ticks]);
}

/** A birdcage-shaped lantern on a chain, glowing gold inside (220 × 400). Empty, and waiting. */
export function cageLantern(name: string): string {
  const bars = [0, 1, 2, 3, 4].map((i) => piece(rect(54 + i * 28, 150, 7, 170, 2), C.iron, { edge: 'cut', fibre: false, shadow: false }));
  return svg({ w: 220, h: 400, name }, [
    ink([[110, 0], [110, 90]], { width: 6, color: C.iron }),
    piece(circle(110, 96, 14), C.iron, { edge: 'cut' }),
    piece(ellipse(110, 240, 90, 98), '#f3d97a', { edge: 'clean', fibre: false, shadow: false, opacity: 0.55 }),
    piece(poly([[40, 160], [110, 110], [180, 160]]), C.iron, { rough: 0.6 }),
    ...bars,
    piece(ellipse(110, 330, 76, 16), C.iron, { rough: 0.6 }),
    piece(rect(34, 154, 152, 8, 3), C.iron, { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

// ------------------------------------------------------------------- moves

/**
 * A ruler-shaped shadow slides slowly across the ground and the wall, then
 * is gone. Pure atmosphere: it never reaches anyone. Calm mode still shows it.
 */
export async function shadowPasses(k: Kit, y: number, name: string, seconds = 2.6): Promise<void> {
  const sh = k.add(rulerShadow(name), { x: 1220, y, w: 560, z: 30, still: true });
  snapSound.heels(3, 0.4, 0.5);
  await k.to(sh, seconds, { x: -1700, ease: 'none' });
  k.remove(sh);
}

/** Makes an element glow gently while a spell works (kept slow: nothing flashes). */
export function breathe(el: HTMLElement | undefined, to = 0.6): void {
  if (el) gsap.to(el, { opacity: to, duration: 1.2, yoyo: true, repeat: 1, ease: 'sine.inOut' });
}
