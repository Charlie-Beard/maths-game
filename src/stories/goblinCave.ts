/**
 * Shared pieces for land 14's stories (the Land of the Red Goblins): the
 * cave backdrop with its lamplight, goblins for the crowd, a pan balance,
 * a measuring jug, a thermometer, a round dial and a clock (the chapter's
 * maths, drawn big enough to read), the big drum, a rope ladder, and the
 * goblins' sounds.
 *
 * Not a story itself (it isn't in any registry). It lives beside the
 * stories, like snapPrison.ts, so the chapter stories (l14c1 … l14c8)
 * borrow from here and never from each other.
 *
 * Scary-cartoon, never cruel (PLAN.md §2): goblins sneak, grab at things,
 * shout and chase, but they never touch anyone, and every one of them is
 * cross or grumpy rather than nasty. Nobody is hurt.
 */
import { gsap } from 'gsap';
import { goblinFigure, type GoblinFigureOpts } from '../art/characters/l14';
import { bigDrum } from '../art/lands/l12';
import { bell, C, circle, curve, group, ink, noiseBurst, NOTE, now, piece, poly, raw, rect, svg, tone, type Kit, type Node } from './kit';

// ------------------------------------------------------------------ sounds

export const goblinSound = {
  /** A rough, grumbly goblin shout: a low buzzy honk that wobbles. */
  grumble(): void {
    const t = now();
    tone(110, t, { wave: 'sawtooth', peak: 0.07, attack: 0.03, decay: 0.45, lowpass: 600, glideTo: 80, vibrato: [9, 6] });
    noiseBurst(t, { freq: 400, type: 'lowpass', peak: 0.04, decay: 0.3 });
  },
  /** A hooting goblin laugh-cackle: three quick high wobbles. */
  cackle(): void {
    const t = now();
    for (let i = 0; i < 3; i++) tone(520 + i * 40, t + i * 0.12, { wave: 'square', peak: 0.03, attack: 0.01, decay: 0.1, lowpass: 1600, glideTo: 380 });
  },
  /** Soft pit-pat of sneaking bare feet on rock. */
  creep(times = 4): void {
    const t = now();
    for (let i = 0; i < times; i++) noiseBurst(t + i * 0.28, { freq: 700, type: 'lowpass', peak: 0.05, decay: 0.07 });
  },
  /** A pot-and-pan clank, once or a few times. */
  clank(times = 3): void {
    const t = now();
    for (let i = 0; i < times; i++) {
      bell(NOTE.G5 * (i % 2 ? 1.12 : 1), t + i * 0.2, 0.06, 0.5);
      noiseBurst(t + i * 0.2, { freq: 3000, q: 4, peak: 0.04, decay: 0.05 });
    }
  },
  /** A sack or coins landing: thud and a jingle. */
  clink(): void {
    const t = now();
    tone(90, t, { peak: 0.15, decay: 0.2, glideTo: 55 });
    [NOTE.E5, NOTE.G5, NOTE.C6].forEach((f, i) => bell(f, t + 0.05 + i * 0.05, 0.03, 0.4));
  },
  /** The big drum: a deep, round BOOM. */
  boom(): void {
    const t = now();
    tone(110, t, { peak: 0.3, attack: 0.005, decay: 0.7, glideTo: 48 });
    noiseBurst(t, { freq: 200, type: 'lowpass', peak: 0.16, decay: 0.3 });
  },
  /** A little rising ding when a reading is found. */
  ding(i = 0): void {
    bell([NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6][i % 4], now(), 0.07, 0.9);
  },
};

// ------------------------------------------------------------------- places

/** The cave, dimmed down to lamplight but still easy to see. */
export function cave(k: Kit, o: { dim?: number; color?: string } = {}): void {
  k.landScene(14);
  k.dim(o.dim ?? 0.18, o.color ?? '#1a0a08');
  k.light(400, 140, 220, { color: '#f6b848', strength: 0.3, flicker: true });
  k.light(790, 140, 180, { color: '#f6b848', strength: 0.26, flicker: true });
}

/** A rope ladder hanging straight down (110 wide), `len` tall. */
export function ropeLadder(len: number, name = 'l14-rope'): string {
  const rungs: Node[] = [];
  for (let y = 24; y < len - 10; y += 52) rungs.push(piece(rect(8, y, 94, 12, 4), C.wood, { edge: 'cut', fibre: false }));
  return svg({ w: 110, h: len, name, boil: false }, [
    ink([[12, 0], [12, len]], { width: 6, color: C.tan }),
    ink([[98, 0], [98, len]], { width: 6, color: C.tan }),
    ...rungs,
  ]);
}

/** A night sky over a bank of cloud, with a red glow low down, for the way home. */
export function homeSky(name = 'l14-sky'): string {
  return svg({ w: 1180, h: 820, name, boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 380), '#3a2438', { edge: 'clean', shadow: false }),
    piece(rect(-20, 240, 1220, 260), '#6a3a48', { rough: 2, shadow: false, fibre: false }),
    piece(rect(-20, 440, 1220, 420), '#8a5a60', { rough: 2, shadow: false, fibre: false }),
    ...[120, 300, 520, 760, 980, 1100].map((x, i) => piece(circle(x, 60 + (i * 53) % 160, 2.5), C.cream, { edge: 'clean', fibre: false, shadow: false, opacity: 0.7 })),
  ]);
}

/** A soft bank of cloud (1300 × 260) for hiding the foot of a ladder. */
export function cloudBank(color = '#c9a6a8', shade = '#a07880', name = 'l14-bank'): string {
  const puffs: Node[] = [];
  for (let i = 0; i < 12; i++) puffs.push(piece(circle(20 + i * 112, 96 + (i % 3) * 8, 80), shade, { shadow: false }));
  for (let i = 0; i < 13; i++) puffs.push(piece(circle(i * 104, 146 + (i % 2) * 14, 82), color, { shadow: i % 3 === 0 }));
  puffs.push(piece(rect(-20, 170, 1340, 120), color, { edge: 'torn', shadow: false }));
  return svg({ w: 1300, h: 260, name, boil: false }, puffs);
}

// ----------------------------------------------------------------- goblins

/** A whole goblin (240 × 340) on stage. Faces right unless `flip`. */
export function goblin(k: Kit, name: string, x: number, y: number, o: GoblinFigureOpts & { w?: number; z?: number } = {}): HTMLElement {
  const el = k.add(goblinFigure(name, { pose: o.pose, carry: o.carry, flip: o.flip }), { x, y, w: o.w ?? 190, z: o.z ?? 14 });
  el.dataset.who = 'redGoblin';
  return el;
}

/** Makes a goblin's arms and legs swing while it runs or creeps. Returns a stopper. */
export function scurry(k: Kit, el: HTMLElement, fast = true): () => void {
  if (k.calm) return () => {};
  const legs = k.pivot(k.part(el, 'legL').concat(k.part(el, 'legR')));
  const arms = k.pivot(k.part(el, 'armL').concat(k.part(el, 'armR')));
  const d = fast ? 0.14 : 0.3;
  const tw = [
    gsap.to(legs[0] ?? [], { rotation: 22, duration: d, yoyo: true, repeat: -1, ease: 'sine.inOut' }),
    gsap.to(legs[1] ?? [], { rotation: -22, duration: d, yoyo: true, repeat: -1, ease: 'sine.inOut' }),
    gsap.to(arms, { rotation: fast ? 14 : 6, duration: d, yoyo: true, repeat: -1, ease: 'sine.inOut' }),
  ];
  return () => tw.forEach((t) => t.progress(0).kill());
}

/** The big drum (260 × 200), as an actor's art. */
export function drumArt(name = 'l14-drum'): string {
  return svg({ w: 260, h: 200, name, boil: false }, bigDrum(130, 192, 1));
}

// ----------------------------------------------------------------- the maths

const label = (x: number, y: number, s: string, size: number, fill: string = C.ink, anchor = 'middle'): Node =>
  raw(`<text x="${x}" y="${y}" font-family="Andika, sans-serif" font-weight="700" font-size="${size}" fill="${fill}" text-anchor="${anchor}">${s}</text>`);

/** A tall measuring jug (150 × 260) filled to `litres` of `max`, with a number at every litre. */
export function jugArt(name: string, litres: number, max = 4, soup = '#c4642e'): string {
  const top = 40;
  const bot = 232;
  const per = (bot - top) / max;
  const ticks: Node[] = [];
  for (let i = 1; i <= max; i++) {
    const y = bot - i * per;
    ticks.push(ink([[28, y], [52, y]], { width: 3, color: C.ink, opacity: 0.8 }), label(18, y + 7, String(i), 22, C.ink, 'end'));
  }
  return svg({ w: 150, h: 260, name, boil: false }, [
    piece(rect(34, top - 14, 90, bot - top + 28, 10), C.glass, { edge: 'cut' }),
    litres > 0 ? piece(rect(40, bot - litres * per, 78, litres * per + 8, 6), soup, { edge: 'clean', shadow: false }) : (() => ''),
    piece(poly([[124, top - 6], [142, top - 20], [124, top + 14]]), C.glass, { edge: 'cut', shadow: false }),
    ...ticks,
    label(96, 258, 'litres', 18, C.ink),
  ]);
}

/** A tall thermometer (130 × 380) reading `deg` °C on a 0 to 40 scale. */
export function thermoArt(name: string, deg: number, hot: boolean): string {
  const top = 30;
  const bot = 300;
  const y = (d: number) => bot - (d / 40) * (bot - top);
  const col = hot ? C.toadRed : '#3f86d6';
  const ticks: Node[] = [];
  for (let d = 0; d <= 40; d += 10) ticks.push(ink([[34, y(d)], [54, y(d)]], { width: 3, color: C.ink, opacity: 0.85 }), label(28, y(d) + 8, String(d), 24, C.ink, 'end'));
  for (let d = 5; d < 40; d += 10) ticks.push(ink([[40, y(d)], [54, y(d)]], { width: 2, color: C.ink, opacity: 0.6 }));
  return svg({ w: 130, h: 380, name, boil: false }, [
    piece(rect(24, 6, 100, 366, 14), C.sand, { edge: 'cut' }),
    piece(rect(62, top - 10, 28, bot - top + 24, 14), C.glass, { edge: 'cut' }),
    piece(circle(76, 332, 26), C.glass, { edge: 'cut' }),
    piece(rect(69, y(deg), 14, bot + 14 - y(deg), 6), col, { edge: 'clean', shadow: false }),
    piece(circle(76, 332, 19), col, { edge: 'clean', shadow: false }),
    ...ticks,
    label(100, 372, '°C', 22, C.ink),
  ]);
}

/**
 * A round dial (260 × 260) with a needle you can turn: `max` round the edge,
 * a number every `step`. The needle is the 'needle' part; turn it with
 * `dialTo`. 0 is at the lower left and `max` at the lower right.
 */
export function dialArt(name: string, o: { max: number; step: number; unit: string; at?: number }): string {
  const cx = 130;
  const cy = 130;
  const ang = (v: number) => -135 + (v / o.max) * 270;
  const mk: Node[] = [];
  for (let v = 0; v <= o.max; v += o.step) {
    const a = (ang(v) * Math.PI) / 180;
    const p = (r: number): [number, number] => [cx + Math.sin(a) * r, cy - Math.cos(a) * r];
    mk.push(ink([p(92), p(76)], { width: 4, color: C.ink }), label(p(58)[0], p(58)[1] + 8, String(v), o.max > 20 ? 20 : 26, C.ink));
  }
  return svg({ w: 260, h: 260, name, boil: false }, [
    piece(circle(cx, cy, 124), C.brass, { edge: 'cut' }),
    piece(circle(cx, cy, 108), C.cream, { edge: 'clean', shadow: false }),
    ...mk,
    label(cx, cy + 86, o.unit, 22, C.ink),
    group({ part: 'needle', origin: [cx, cy], transform: `rotate(${ang(o.at ?? 0)} ${cx} ${cy})` }, [
      piece(poly([[cx - 6, cy], [cx, cy - 84], [cx + 6, cy]]), C.toadRed, { edge: 'cut', shadow: false }),
    ]),
    piece(circle(cx, cy, 11), C.iron, { edge: 'cut', fibre: false }),
  ]);
}

/** Swings a dial's needle to a reading. */
export function dialTo(k: Kit, dial: HTMLElement, max: number, v: number, seconds = 1.2): Promise<void> {
  const needle = k.pivot(k.part(dial, 'needle'));
  return k.to(needle, seconds, { rotation: -135 + (v / max) * 270, ease: 'sine.inOut' });
}

/** A wall clock (200 × 200) at `hour` and `min` (a multiple of 5). */
export function clockArt(name: string, hour: number, min: number): string {
  const ticks: Node[] = [];
  for (let i = 1; i <= 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    ticks.push(label(100 + Math.sin(a) * 74, 100 - Math.cos(a) * 74 + 9, String(i), 26, C.ink));
  }
  const hand = (deg: number, len: number, w: number): Node => ink([[100, 100], [100 + Math.sin((deg * Math.PI) / 180) * len, 100 - Math.cos((deg * Math.PI) / 180) * len]], { width: w, color: C.ink });
  return svg({ w: 200, h: 200, name, boil: false }, [
    piece(circle(100, 100, 96), C.brass, { edge: 'cut' }),
    piece(circle(100, 100, 84), C.cream, { edge: 'clean', shadow: false }),
    ...ticks,
    hand(((hour % 12) + min / 60) * 30, 46, 8),
    hand(min * 6, 68, 5),
    piece(circle(100, 100, 7), C.iron, { edge: 'cut', fibre: false }),
  ]);
}

/**
 * A pan balance. The beam tips about the middle; two pans hang from its
 * ends, and anything put on a pan rides with it. `tilt(1)` is the right
 * side heavier (it goes down), `tilt(-1)` the left, `tilt(0)` level.
 */
export interface Balance {
  parts: HTMLElement[];
  /** Puts an actor on a pan; it sits there and rides up and down. */
  load(el: HTMLElement, side: 'L' | 'R', width: number): void;
  tilt(dir: number, seconds?: number): Promise<void>;
}

export function balance(k: Kit, cx: number, cy: number, z = 12): Balance {
  const HALF = 170;
  const stand = k.add(
    svg({ w: 120, h: 300, name: 'l14-bal-stand', boil: false }, [
      piece(poly([[60, 0], [96, 296], [24, 296]]), C.wood, { edge: 'cut' }),
      piece(rect(0, 280, 120, 20, 6), C.barkDark, { edge: 'cut' }),
    ]),
    { x: cx - 60, y: cy, w: 120, z },
  );
  const beam = k.add(
    svg({ w: 360, h: 36, name: 'l14-bal-beam', boil: false }, [
      piece(rect(0, 8, 360, 20, 8), C.brass, { edge: 'cut' }),
      piece(circle(180, 18, 14), C.iron, { edge: 'cut', fibre: false }),
    ]),
    { x: cx - 180, y: cy - 18, w: 360, z: z + 1 },
  );
  const pans = (['L', 'R'] as const).map((s) =>
    k.add(
      svg({ w: 150, h: 110, name: `l14-bal-pan${s}`, boil: false }, [
        ink([[75, 0], [14, 82]], { width: 3, color: C.iron }),
        ink([[75, 0], [136, 82]], { width: 3, color: C.iron }),
        piece(curve([[4, 80], [146, 80], [124, 108], [26, 108]], 2), C.brass, { edge: 'cut' }),
      ]),
      { x: cx - 75, y: cy, w: 150, z: z + 2 },
    ),
  );
  const loads: { el: HTMLElement; side: 'L' | 'R'; w: number; h: number }[] = [];
  const pos = { a: 0 };
  const apply = (): void => {
    const r = (pos.a * Math.PI) / 180;
    gsap.set(beam, { rotation: pos.a });
    (['L', 'R'] as const).forEach((s, i) => {
      const sgn = s === 'L' ? -1 : 1;
      const ex = cx + sgn * HALF * Math.cos(r);
      const ey = cy + sgn * HALF * Math.sin(r);
      gsap.set(pans[i], { x: ex - cx, y: ey - cy });
      for (const l of loads.filter((q) => q.side === s)) gsap.set(l.el, { x: ex - l.w / 2 - parseFloat(l.el.style.left), y: ey + 100 - l.h - parseFloat(l.el.style.top) });
    });
  };
  apply();
  return {
    parts: [stand, beam, ...pans],
    load(el, side, width) {
      loads.push({ el, side, w: width, h: el.offsetHeight || parseFloat(el.style.height) || width });
      apply();
    },
    tilt(dir, seconds = 1.1) {
      return k.to(pos, seconds, { a: dir * 12, ease: 'sine.inOut', onUpdate: apply });
    },
  };
}
