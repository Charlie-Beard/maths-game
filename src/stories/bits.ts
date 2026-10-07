/**
 * Small shared pieces for the chapter stories: a few sounds, moves and
 * paper cards that several stories were each drawing for themselves.
 *
 * Not a story itself (it isn't in any registry). It lives beside the
 * stories, like snapSchool.ts, so that stories borrow from here and never
 * from each other. Bigger art (backdrops, characters) lives in src/art/.
 *
 * The paper cards take a `name`: it seeds the torn edges, so each story
 * passes the name it always used and its cards keep exactly the same tears.
 */
import { gsap } from 'gsap';
import { bell, C, circle, ellipse, NOTE, noiseBurst, now, piece, raw, rect, svg, tone, type Kit } from './kit';

// ------------------------------------------------------------------ sounds

/** Plump cushions taking a landing: a soft, deep flump. */
export function flump(): void {
  const t = now();
  noiseBurst(t, { freq: 320, type: 'lowpass', peak: 0.22, attack: 0.01, decay: 0.32 });
  tone(95, t, { peak: 0.16, decay: 0.25, glideTo: 55 });
}

/** The ominous sting at the very end of a finale: a low, uneasy chord that hangs and fades. */
export function sting(): void {
  const t = now();
  for (const f of [NOTE.C3, 155.56, 185.0]) tone(f, t, { wave: 'sawtooth', peak: 0.06, attack: 0.04, decay: 3, lowpass: 650, vibrato: [5, 1.5] });
  tone(65.4, t, { peak: 0.16, attack: 0.04, decay: 3.2 });
  bell(NOTE.C5 * 1.06, t + 0.1, 0.05, 2.5);
}

/** A counting tick, one note higher for each thing counted (`i` from 0). */
export function tick(i: number, base = 560): void {
  tone(base * Math.pow(2, i / 6), now(), { wave: 'triangle', peak: 0.08, attack: 0.004, decay: 0.14 });
}

// ------------------------------------------------------------------- moves

/** Waves an arm a few times (armR lifts with a negative turn, armL with a positive one). */
export async function wave(k: Kit, el: HTMLElement, arm: 'armL' | 'armR' = 'armR', times = 3): Promise<void> {
  const parts = k.part(el, arm);
  if (!parts.length) return k.hop(el, 20, times);
  const up = arm === 'armR' ? -1 : 1;
  for (let i = 0; i < times; i++) {
    await k.to(parts, 0.18, { rotation: up * 28 });
    await k.to(parts, 0.18, { rotation: up * 8 });
  }
  await k.to(parts, 0.2, { rotation: 0 });
}

/** Moves several actors by the same amount at once. */
export function together(k: Kit, els: HTMLElement[], seconds: number, vars: Parameters<Kit['to']>[2]): Promise<void> {
  return k.all(...els.map((e) => k.to(e, seconds, vars)));
}

/** Where an actor really is now (its placed corner plus its tween offset). */
export function at(el: HTMLElement): [number, number] {
  return [(parseFloat(el.style.left) || 0) + Number(gsap.getProperty(el, 'x')), (parseFloat(el.style.top) || 0) + Number(gsap.getProperty(el, 'y'))];
}

/** A hop along an arc to an absolute stage spot (the actor's top-left). */
export function jump(k: Kit, el: HTMLElement, x: number, y: number, height: number, seconds: number): Promise<void> {
  const bx = parseFloat(el.style.left) || 0;
  const by = parseFloat(el.style.top) || 0;
  const peak = Math.min(at(el)[1], y) - height;
  return k.all(
    k.to(el, seconds, { x: x - bx, ease: 'none' }),
    k.to(el, seconds / 2, { y: peak - by, ease: 'power2.out' }).then(() => k.to(el, seconds / 2, { y: y - by, ease: 'power2.in' })),
  );
}

/** The chapter's host, or another child if the host is the one he climbs with. */
export const buddy = (k: Kit, host: string, instead: string): string => (host === k.hero ? instead : host);

// --------------------------------------------------------------------- art

/** A number on a round paper tag (100 × 100), for counting aloud. */
export function roundTag(n: number, color: string, name: string): string {
  return svg({ w: 100, h: 100, name, boil: false }, [
    piece(circle(50, 50, 40), color, { rough: 0.8 }),
    raw(`<text x="50" y="68" text-anchor="middle" font-family="Andika, sans-serif" font-size="54" font-weight="700" fill="${C.ink}">${n}</text>`),
  ]);
}

/** A torn paper label with a number on it (120 × 80): the ten, the more, the total. */
export function numberTag(text: string, color: string, name: string): string {
  return svg({ w: 120, h: 80, name, boil: false }, [
    piece(rect(6, 6, 108, 68, 8), color, { rough: 0.7 }),
    raw(`<text x="60" y="56" font-family="Andika, sans-serif" font-weight="700" font-size="46" fill="${C.ink}" text-anchor="middle">${text}</text>`),
  ]);
}

/**
 * A torn paper disc with a big number on it, for counting (160 × 160).
 * Longer numbers get a wider disc, and a rounded card past two digits.
 */
export function numberCard(text: string, color: string = C.cream): string {
  const w = Math.max(160, text.length * 60 + 60);
  return svg({ w, h: 160, name: `l2-card-${text}-${color}`, boil: false }, [
    piece(text.length > 2 ? rect(8, 14, w - 16, 132, 30) : ellipse(w / 2, 80, w / 2 - 8, 72), color, { rough: 1.2 }),
    raw(`<text x="${w / 2}" y="112" font-family="Andika, sans-serif" font-weight="700" font-size="92" fill="${C.plum}" text-anchor="middle">${text}</text>`),
  ]);
}

/** A sum on a torn paper strip (320 × 110), held still. */
export function sumStrip(text: string, name: string): string {
  return svg({ w: 320, h: 110, name, boil: false }, [
    piece(rect(8, 8, 304, 94, 10), C.cream, { rough: 1.2 }),
    raw(`<text x="160" y="76" text-anchor="middle" font-family="Andika, sans-serif" font-size="64" font-weight="700" fill="${C.ink}">${text}</text>`),
  ]);
}

/** A torn paper card with a sum on it, in big Andika (420 × 130). */
export function sumCard(text: string, name: string): string {
  return svg({ w: 420, h: 130, name }, [
    piece(rect(10, 10, 400, 110, 10), C.cream, { rough: 1.2 }),
    raw(`<text x="210" y="92" font-family="Andika, sans-serif" font-weight="700" font-size="76" fill="${C.ink}" text-anchor="middle">${text}</text>`),
  ]);
}

/** A full-stage black sheet (the last cut to black). */
export const blackSheet = (): string => svg({ w: 1180, h: 820, name: 'black', boil: false }, [() => `<rect x="-40" y="-40" width="1260" height="900" fill="#08070b"/>`]);
