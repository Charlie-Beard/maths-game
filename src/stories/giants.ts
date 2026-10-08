/**
 * Small shared pieces for the Land of Giants stories (l6c1 … l6c8): a
 * pond-sized footprint, number tags for counting in tens, Giant
 * Rumbletum's big face, rows of things to count, and a splash sound.
 *
 * Not a story itself (it isn't in any registry). It sits beside the stories,
 * like snapSchool.ts, so that they borrow from here and never from each other.
 */
import { cloud, hills, roundTree, sceneSvg, sky } from '../art/lands/common';
import { C, circle, curve, ellipse, ink, noiseBurst, now, piece, raw, rect, rng, svg, tone, type Kit, type Node } from './kit';
import { tick } from './bits';

// ------------------------------------------------------------------ sounds

/** A soft splash: something small landing in a puddle as big as a pond. */
export function splash(): void {
  const t = now();
  noiseBurst(t, { freq: 1800, q: 0.7, peak: 0.1, attack: 0.01, decay: 0.3, sweepTo: 700 });
  tone(320, t, { wave: 'sine', peak: 0.06, decay: 0.2, glideTo: 180 });
}

// --------------------------------------------------------------------- art

/**
 * A round paper tag with a number in it (100 × 100). Three-digit numbers
 * get smaller type so that "100" still fits.
 */
export function countTag(text: string | number, color: string, name: string): string {
  const s = String(text);
  const size = s.length > 2 ? 38 : s.length > 1 ? 52 : 60;
  return svg({ w: 100, h: 100, name, boil: false }, [
    piece(circle(50, 50, 42), color, { rough: 0.8 }),
    raw(`<text x="50" y="${50 + size * 0.35}" text-anchor="middle" font-family="Andika, sans-serif" font-size="${size}" font-weight="700" fill="${C.ink}">${s}</text>`),
  ]);
}

/**
 * A torn paper strip with a sum or comparison on it ("30 + 4 = 34", "64 > 46"),
 * as wide as its text needs (60 px a character plus margins) and 110 tall.
 */
export function strip(text: string, color: string, name: string): string {
  const w = Math.round(text.length * 40 + 60);
  return svg({ w, h: 110, name, boil: false }, [
    piece(rect(8, 8, w - 16, 94, 12), color, { rough: 1 }),
    raw(`<text x="${w / 2}" y="76" text-anchor="middle" font-family="Andika, sans-serif" font-size="64" font-weight="700" fill="${C.ink}">${text}</text>`),
  ]);
}

/** A giant's footprint with rainwater in it: a pond with five toes (160 × 200). */
export function pondPrint(name = 'giants-pond-print'): string {
  const toes: [number, number, number, number][] = [[36, 52, 16, 20], [66, 34, 13, 16], [90, 30, 11, 13], [110, 38, 9, 11], [124, 52, 8, 10]];
  return svg({ w: 160, h: 200, name, boil: false }, [
    piece(curve([[40, 186], [22, 150], [28, 100], [50, 66], [90, 60], [110, 86], [108, 130], [98, 170], [74, 192]], 2), C.barkLight, { rough: 0.8 }),
    ...toes.map(([x, y, rx, ry]) => piece(ellipse(x, y, rx, ry), C.barkLight, { rough: 0.6 })),
    piece(curve([[48, 170], [38, 142], [42, 104], [58, 80], [88, 78], [98, 96], [96, 130], [88, 160], [72, 176]], 2), C.sky, { edge: 'cut', fibre: false, shadow: false }),
    ...toes.map(([x, y, rx, ry]) => piece(ellipse(x, y + 1, rx * 0.55, ry * 0.55), C.sky, { edge: 'cut', fibre: false, shadow: false })),
    ink([[56, 112], [70, 106], [84, 114]], { width: 2.5, color: C.white, opacity: 0.8 }),
    ink([[54, 140], [68, 134], [82, 142]], { width: 2.5, color: C.white, opacity: 0.7 }),
  ]);
}

/**
 * A clear giant-sized meadow for stories that need an open stretch of grass
 * to count on: giant sky, far hills, a few tiny trees (they show how big
 * everything is) and a pair of trouser legs going up out of the sky. The
 * land's own scene (k.landScene) is busier: a teacup, buttons, a table leg.
 */
export function meadow(name: string): string {
  const r = rng(77);
  const grass: Node[] = [];
  for (let i = 0; i < 36; i++) {
    const x = r() * 1180;
    const y = 520 + r() * 300;
    grass.push(ink([[x, y], [x + 3, y - 14 - r() * 10]], { width: 2.5, color: C.leafDark, opacity: 0.7 }));
  }
  const tiny: Node[] = [];
  for (let i = 0; i < 8; i++) tiny.push(...roundTree(60 + i * 150 + r() * 40, 400 + r() * 14, 40 + r() * 20, 700 + i));
  return sceneSvg(name, [
    ...sky([
      [C.giantSky, 0],
      ['#cfdfe6', 300],
      ['#e2e8dc', 440],
    ]),
    cloud(260, 120, 300, 3, C.white, 0.9),
    cloud(900, 200, 220, 4, C.white, 0.8),
    hills(430, 40, '#a9bf9a', 71),
    ...tiny,
    hills(470, 26, '#8faa7a', 72),
    hills(520, 16, C.green, 73, { step: 80 }),
    ...grass,
  ]);
}

// ------------------------------------------------------------------- actors

/**
 * Giant Rumbletum's big, friendly face, spilling out of the top of the
 * stage. Slide him in with `peek`.
 */
export function giantHead(k: Kit, o: { x: number; y?: number; w?: number; flip?: boolean }): HTMLElement {
  return k.character('giant', { x: o.x, y: o.y ?? -150, w: o.w ?? 420, z: 28, flip: o.flip });
}

/** Giant Rumbletum leans in from above, with a thump you can feel. */
export async function peek(k: Kit, giant: HTMLElement, seconds = 0.9): Promise<void> {
  k.fx.rumble(0.8);
  await k.enter(giant, 'top', seconds);
  void k.quake(4);
}

/**
 * A row of the same prop, popping in one at a time with a rising tick.
 * Returns the elements. `startTick` carries the rising note on from an
 * earlier row.
 */
export async function popRow(
  k: Kit,
  id: Parameters<Kit['prop']>[0],
  count: number,
  x: number,
  y: number,
  pitch: number,
  w: number,
  o: { z?: number; startTick?: number; gap?: number } = {},
): Promise<HTMLElement[]> {
  const els: HTMLElement[] = [];
  for (let i = 0; i < count; i++) {
    const e = k.prop(id, { x: x + i * pitch, y, w, z: o.z ?? 15 });
    k.set(e, { opacity: 0 });
    els.push(e);
  }
  for (let i = 0; i < count; i++) {
    tick((o.startTick ?? 0) + i);
    void k.appear(els[i], 0.18);
    await k.wait(o.gap ?? 70);
  }
  return els;
}
