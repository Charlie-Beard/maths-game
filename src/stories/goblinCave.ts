/**
 * Shared pieces for land 14's stories (the Land of the Red Goblins): the
 * cave backdrop with its lamplight, goblins for the crowd (running,
 * sneaking or fast asleep), the chapters' maths drawn big enough to read
 * (a pan balance, a dial scale in kilograms, a measuring jug in litres, a
 * thermometer, a clock whose hands turn), the big drum, sacks of gold,
 * tunnels, the cage the Saucepan Man is kept in with its padlock and key,
 * the night sky over the cloud for the way home, and the goblins' sounds.
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

/**
 * The cave, dimmed down to lamplight but still easy to see. The backdrop's
 * soup cauldron sits low on the right, just where a character stands, so
 * a heap of goblin sacks hides it unless `cauldron` asks to see it.
 */
export function cave(k: Kit, o: { dim?: number; color?: string; cauldron?: boolean } = {}): void {
  k.landScene(14);
  k.dim(o.dim ?? 0.18, o.color ?? '#1a0a08');
  k.light(400, 140, 220, { color: '#f6b848', strength: 0.3, flicker: true });
  k.light(790, 140, 180, { color: '#f6b848', strength: 0.26, flicker: true });
  if (!o.cauldron) {
    k.add(sackArt('l14-heap-a', '#9a7e52', 0.9), { x: 1000, y: 560, w: 190, z: 6 });
    k.add(sackArt('l14-heap-b', '#a98d5e', 1), { x: 870, y: 580, w: 200, z: 7 });
  }
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

/**
 * A goblin sack tied at the neck (160 × 170, its bottom on y = 166).
 * `fill` from about 0.6 (thin and saggy) to 1 (fat and full).
 */
export function sackArt(name: string, color = '#a98d5e', fill = 1): string {
  const w = 50 + 26 * fill;
  const top = 166 - 60 - 70 * fill;
  return svg({ w: 160, h: 170, name, boil: false }, [
    piece(curve([[80 - 16, top + 18], [80 - w * 0.7, top + 50], [80 - w, 150], [80 - w * 0.6, 166], [80 + w * 0.6, 166], [80 + w, 150], [80 + w * 0.7, top + 50], [80 + 16, top + 18]], 2), color),
    piece(curve([[80 - 18, top + 4], [80 - 6, top - 8], [80 + 8, top - 6], [80 + 18, top + 6], [80 + 12, top + 20], [80 - 12, top + 20]], 2), color, { edge: 'cut' }),
    ink([[80 - 16, top + 18], [80, top + 22], [80 + 16, top + 18]], { width: 5, color: C.barkDark }),
    // a patch and a crease or two
    piece(rect(80 + w * 0.2, 120, 22, 20, 3), '#8a7048', { edge: 'cut', fibre: false }),
    ink([[80 - w * 0.4, top + 70], [80 - w * 0.2, top + 90]], { width: 2.4, color: C.ink, opacity: 0.25 }),
  ]);
}

/** The big drum (260 × 200), as an actor's art. */
export function drumArt(name = 'l14-drum'): string {
  return svg({ w: 260, h: 200, name, boil: false }, bigDrum(130, 192, 1));
}

// ----------------------------------------------------------------- the maths

const label = (x: number, y: number, s: string, size: number, fill: string = C.ink, anchor = 'middle'): Node =>
  raw(`<text x="${x}" y="${y}" font-family="Andika, sans-serif" font-weight="700" font-size="${size}" fill="${fill}" text-anchor="${anchor}">${s}</text>`);

/**
 * A tall measuring jug (170 × 280) filled to `litres`, numbered every
 * `step` up to `max` (a tick at every litre in between), so the soup line
 * is easy to read off against a number.
 */
export function jugArt(name: string, litres: number, o: { max?: number; step?: number; soup?: string } = {}): string {
  const max = o.max ?? 10;
  const step = o.step ?? 2;
  const top = 44;
  const bot = 228;
  const per = (bot - top) / max;
  const ticks: Node[] = [];
  for (let i = 1; i <= max; i++) {
    const y = bot - i * per;
    const big = i % step === 0;
    ticks.push(ink([[50, y], [big ? 84 : 70, y]], { width: big ? 4 : 2.4, color: C.ink, opacity: big ? 0.9 : 0.6 }));
    if (big) ticks.push(label(40, y + 10, String(i), 30, C.ink, 'end'));
  }
  return svg({ w: 170, h: 280, name, boil: false }, [
    piece(rect(0, 8, 162, 256, 12), C.sand, { edge: 'cut' }),
    piece(rect(48, top - 16, 102, bot - top + 32, 12), C.glass, { edge: 'cut' }),
    litres > 0 ? piece(rect(54, bot - litres * per, 90, litres * per + 10, 6), o.soup ?? '#c4642e', { edge: 'clean', shadow: false }) : () => '',
    litres > 0 ? piece(rect(54, bot - litres * per, 90, 6, 3), '#e0905a', { edge: 'clean', shadow: false }) : () => '',
    piece(poly([[150, top - 8], [168, top - 22], [150, top + 14]]), C.glass, { edge: 'cut', shadow: false }),
    ...ticks,
    label(100, 258, 'litres', 20, C.ink),
  ]);
}

/** A tall thermometer (130 × 380) reading `deg` °C on a 0 to 40 scale, numbered every 10. */
export function thermoArt(name: string, deg: number, hot: boolean): string {
  const top = 30;
  const bot = 300;
  const y = (d: number) => bot - (d / 40) * (bot - top);
  const col = hot ? C.toadRed : '#3f86d6';
  const ticks: Node[] = [];
  for (let d = 0; d <= 40; d += 10) ticks.push(ink([[34, y(d)], [56, y(d)]], { width: 3, color: C.ink, opacity: 0.85 }), label(30, y(d) + 9, String(d), 28, C.ink, 'end'));
  for (let d = 5; d < 40; d += 10) ticks.push(ink([[42, y(d)], [56, y(d)]], { width: 2, color: C.ink, opacity: 0.6 }));
  return svg({ w: 130, h: 380, name, boil: false }, [
    piece(rect(6, 6, 118, 366, 14), C.sand, { edge: 'cut' }),
    piece(rect(62, top - 10, 28, bot - top + 24, 14), C.glass, { edge: 'cut' }),
    piece(circle(76, 332, 26), C.glass, { edge: 'cut' }),
    piece(rect(69, y(deg), 14, bot + 14 - y(deg), 6), col, { edge: 'clean', shadow: false }),
    piece(circle(76, 332, 19), col, { edge: 'clean', shadow: false }),
    ...ticks,
    label(104, 368, '°C', 22, C.ink),
  ]);
}

/**
 * A round dial (260 × 260) with a needle you can turn: `max` round the edge,
 * a number every `step`, and with `minor` a small unnumbered mark at every
 * `minor` in between. The needle is the 'needle' part; set it with `dialAt`
 * and swing it with `dialTo`. 0 is at the lower left and `max` at the lower right.
 */
export function dialArt(name: string, o: { max: number; step: number; minor?: number; unit: string }): string {
  const cx = 130;
  const cy = 130;
  const ang = (v: number) => -135 + (v / o.max) * 270;
  const mk: Node[] = [];
  const pt = (v: number, r: number): [number, number] => {
    const a = (ang(v) * Math.PI) / 180;
    return [cx + Math.sin(a) * r, cy - Math.cos(a) * r];
  };
  if (o.minor) for (let v = 0; v <= o.max; v += o.minor) if (v % o.step) mk.push(ink([pt(v, 96), pt(v, 86)], { width: 2.4, color: C.ink, opacity: 0.75 }));
  for (let v = 0; v <= o.max; v += o.step) {
    mk.push(ink([pt(v, 98), pt(v, 78)], { width: 4, color: C.ink }));
    const [tx, ty] = pt(v, 58);
    mk.push(label(tx, ty + 10, String(v), 28, C.ink));
  }
  return svg({ w: 260, h: 260, name, boil: false }, [
    piece(circle(cx, cy, 126), C.brass, { edge: 'cut' }),
    piece(circle(cx, cy, 110), C.cream, { edge: 'clean', shadow: false }),
    ...mk,
    label(cx, cy + 90, o.unit, 24, C.ink),
    group({ part: 'needle', origin: [cx, cy] }, [piece(poly([[cx - 6, cy], [cx, cy - 88], [cx + 6, cy]]), C.toadRed, { edge: 'cut', shadow: false })]),
    piece(circle(cx, cy, 11), C.iron, { edge: 'cut', fibre: false }),
  ]);
}

/** The pan and post (260 × 120) that sit on top of a dial to make a weighing scale. */
export function scalePan(name = 'l14-pan'): string {
  return svg({ w: 260, h: 120, name, boil: false }, [
    piece(rect(118, 40, 24, 80, 4), C.brassDark, { edge: 'cut' }),
    piece(rect(10, 26, 240, 22, 10), C.brass, { edge: 'cut' }),
  ]);
}

/**
 * Sets a dial's needle to a reading at once. Call it once when the dial is
 * made: it also fixes the needle's pivot (set twice, the pivot drifts).
 */
export function dialAt(k: Kit, dial: HTMLElement, max: number, v: number): void {
  k.set(k.pivot(k.part(dial, 'needle')), { rotation: -135 + (v / max) * 270 });
}

/** Swings a dial's needle to a reading (after `dialAt`). */
export function dialTo(k: Kit, dial: HTMLElement, max: number, v: number, seconds = 1.2): Promise<void> {
  return k.to(k.part(dial, 'needle'), seconds, { rotation: -135 + (v / max) * 270, ease: 'sine.inOut' });
}

/** A wall clock (200 × 200) with hands that turn ('hour' and 'minute' parts). Set it with `clockAt`. */
export function clockArt(name: string): string {
  const ticks: Node[] = [];
  for (let i = 1; i <= 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    ticks.push(label(100 + Math.sin(a) * 70, 100 - Math.cos(a) * 70 + 10, String(i), 28, C.ink));
  }
  return svg({ w: 200, h: 200, name, boil: false }, [
    piece(circle(100, 100, 98), C.brass, { edge: 'cut' }),
    piece(circle(100, 100, 88), C.cream, { edge: 'clean', shadow: false }),
    ...ticks,
    group({ part: 'hour', origin: [100, 100] }, [ink([[100, 104], [100, 56]], { width: 9, color: C.ink })]),
    group({ part: 'minute', origin: [100, 100] }, [ink([[100, 106], [100, 30]], { width: 5, color: C.toadRed })]),
    piece(circle(100, 100, 7), C.iron, { edge: 'cut', fibre: false }),
  ]);
}

/** Sets a clock's hands to a time at once. Call it once when the clock is made: it fixes the hands' pivots. */
export function clockAt(k: Kit, clock: HTMLElement, hour: number, min: number): void {
  k.set(k.pivot(k.part(clock, 'hour')), { rotation: (hour % 12) * 30 + min / 2 });
  k.set(k.pivot(k.part(clock, 'minute')), { rotation: min * 6 });
}

/** Turns a clock's hands on to a later time (after `clockAt`). */
export function clockTo(k: Kit, clock: HTMLElement, hour: number, min: number, seconds = 1): Promise<void> {
  return k.all(
    k.to(k.part(clock, 'hour'), seconds, { rotation: (hour % 12) * 30 + min / 2, ease: 'sine.inOut' }),
    k.to(k.part(clock, 'minute'), seconds, { rotation: min * 6, ease: 'sine.inOut' }),
  );
}

// ---------------------------------------------------------- more scenery

/** A dark tunnel mouth (200 × 240) in rough rock, with a wooden frame. */
export function tunnelArt(name: string): string {
  return svg({ w: 200, h: 240, name, boil: false }, [
    piece(curve([[4, 240], [4, 120], [30, 40], [100, 8], [170, 40], [196, 120], [196, 240]], 2), '#8c3626'),
    piece(curve([[24, 240], [24, 130], [46, 60], [100, 34], [154, 60], [176, 130], [176, 240]], 2), '#1a0a08', { edge: 'cut' }),
    piece(curve([[50, 240], [52, 150], [100, 96], [148, 150], [150, 240]], 2), '#10070a', { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(14, 100, 16, 140, 3), C.barkDark, { edge: 'cut' }),
    piece(rect(170, 100, 16, 140, 3), C.barkDark, { edge: 'cut' }),
    piece(rect(4, 88, 192, 18, 3), C.bark, { edge: 'cut' }),
  ]);
}

/** The back of a goblin cage (240 × 300): floor, a dark inside and a chain up to the ceiling. */
export function cageBack(name = 'l14-cage-back'): string {
  return svg({ w: 240, h: 300, name, boil: false }, [
    ink([[120, 0], [120, 40]], { width: 6, color: C.iron }),
    piece(rect(20, 60, 200, 210, 6), '#2a120c', { edge: 'cut', fibre: false, shadow: false, opacity: 0.55 }),
    piece(rect(8, 268, 224, 26, 6), C.barkDark, { edge: 'cut' }),
  ]);
}

/** The front of the cage (240 × 300): a pointed roof, and the bars, which open as a door. */
export function cageFront(name = 'l14-cage-front'): string {
  const bars: Node[] = [];
  for (let x = 28; x <= 212; x += 30.6) bars.push(piece(rect(x - 5, 56, 10, 218, 4), C.wood, { edge: 'cut' }));
  return svg({ w: 240, h: 300, name, boil: false }, [
    ...bars,
    piece(rect(14, 150, 212, 12, 4), C.bark, { edge: 'cut' }),
    piece(poly([[0, 66], [120, 26], [240, 66], [226, 76], [14, 76]]), '#7c1a26', { edge: 'cut' }),
    piece(circle(120, 30, 12), C.iron, { edge: 'cut' }),
  ]);
}

/** A heavy goblin padlock (80 × 90). */
export function padlock(name = 'l14-lock'): string {
  return svg({ w: 80, h: 90, name, boil: false }, [
    piece(curve([[20, 44], [20, 18], [40, 6], [60, 18], [60, 44], [52, 44], [52, 22], [40, 14], [28, 22], [28, 44]], 1), C.ironLight, { edge: 'cut' }),
    piece(rect(6, 38, 68, 48, 8), C.brassDark, { edge: 'cut' }),
    piece(circle(40, 58, 7), C.iron, { edge: 'cut', fibre: false }),
    piece(rect(37, 60, 6, 14, 2), C.iron, { edge: 'clean', shadow: false }),
  ]);
}

/** A big iron key (160 × 70). */
export function keyArt(name = 'l14-key'): string {
  return svg({ w: 160, h: 70, name, boil: false }, [
    piece(circle(34, 35, 28), C.brass, { edge: 'cut' }),
    piece(circle(34, 35, 12), '#2a120c', { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(58, 29, 96, 12, 4), C.brass, { edge: 'cut' }),
    piece(rect(122, 40, 12, 22, 3), C.brass, { edge: 'cut' }),
    piece(rect(140, 40, 12, 16, 3), C.brass, { edge: 'cut' }),
  ]);
}

/** Sleepy "Z"s (90 × 90) for a snoring goblin. */
export function snoreArt(name = 'l14-zzz'): string {
  return svg({ w: 90, h: 90, name, boil: false }, [label(20, 80, 'z', 30, C.cream), label(46, 54, 'z', 38, C.cream), label(74, 26, 'Z', 44, C.cream)]);
}

/** Shuts a goblin's eyes (asleep), or opens them again. */
export function sleepy(k: Kit, el: HTMLElement, asleep: boolean): void {
  k.part(el, 'lids').forEach((l) => (l.style.opacity = asleep ? '1' : '0'));
  k.part(el, 'eyes').forEach((l) => (l.style.opacity = asleep ? '0' : '1'));
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
