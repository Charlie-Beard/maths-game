/**
 * Shared pieces for the Land of Roundabouts stories (l13c1 … l13c8).
 *
 * Not a story itself (it isn't in any registry). The land is a fair, and
 * its maths is turning and 3D shapes, so these are the things several
 * stories show: Mr Whirligig's magic arrow and the curved arrows that show
 * a turn (a quarter, a half, a whole one; clockwise or anticlockwise), a
 * fair clock, torn-paper solids (cube, cuboid, sphere, cylinder, cone,
 * pyramid), the arrow cards and little map for following directions, and
 * the red goblins who creep about the fair at the end of the land.
 *
 * The goblins are cartoon sneaks (PLAN.md §2): they peep, snigger, grab
 * and run, and they never hurt anyone.
 */
import { goblinFigure, type GoblinPose } from '../art/characters/l14';
import { bigWheel, FAIR_CREAM, FAIR_GOLD, FAIR_RED, FAIR_TEAL, FAIR_TEAL_DARK, signpost, teacup } from '../art/lands/l13';
import { bell, C, circle, curve, ellipse, group, ink, noiseBurst, NOTE, now, piece, poly, raw, rect, svg, tone, type Kit, type Node, type Pt } from './kit';

export { FAIR_CREAM, FAIR_GOLD, FAIR_RED, FAIR_TEAL, FAIR_TEAL_DARK };

// ------------------------------------------------------------------ sounds

/** Mr Whirligig's brass handbell: ting-a-ling. */
export function handbell(times = 4): void {
  const t = now();
  for (let i = 0; i < times; i++) bell(i % 2 ? NOTE.E6 : NOTE.C6 * 1.5, t + i * 0.13, 0.05, 0.6);
}

/** A few bars of fairground organ: a bouncy oom-pah-pah waltz. */
export function organ(): void {
  const t = now();
  const tune = [NOTE.G4, NOTE.C5, NOTE.E5, NOTE.G5, NOTE.E5, NOTE.C5, NOTE.D5, NOTE.F5, NOTE.B4];
  tune.forEach((f, i) => tone(f, t + i * 0.2, { wave: 'square', peak: 0.035, attack: 0.01, decay: 0.18, lowpass: 1800 }));
  [NOTE.C3, NOTE.G3, NOTE.G3, NOTE.C3, NOTE.G3, NOTE.G3, NOTE.G3 * 0.75, NOTE.G3, NOTE.G3].forEach((f, i) =>
    tone(f, t + i * 0.2, { wave: 'triangle', peak: i % 3 ? 0.04 : 0.08, attack: 0.01, decay: 0.16 }),
  );
}

/** Something spinning round: a whirr that rises and falls. */
export function whirr(seconds = 1.2): void {
  const t = now();
  tone(220, t, { wave: 'triangle', peak: 0.05, attack: 0.1, decay: seconds, glideTo: 520, vibrato: [9, 18] });
  noiseBurst(t, { freq: 900, q: 2, peak: 0.04, attack: 0.15, decay: seconds, sweepTo: 1800 });
}

/** The Saucepan Man's pots and pans clanking as he moves. */
export function clank(times = 3, loud = 1): void {
  const t = now();
  for (let i = 0; i < times; i++) bell(NOTE.A5 + (i % 3) * 40, t + i * 0.11, 0.05 * loud, 0.35);
}

/** A goblin sniggering: hee-hee-hee, high and sly. */
export function snigger(): void {
  const t = now();
  for (let i = 0; i < 3; i++) tone(980 - i * 90, t + i * 0.12, { wave: 'square', peak: 0.025, attack: 0.005, decay: 0.08, lowpass: 2400, glideTo: 820 - i * 90 });
}

/** A ball rolling along: a soft rumble. */
export function roll(seconds = 1): void {
  noiseBurst(now(), { freq: 260, type: 'lowpass', peak: 0.09, attack: 0.08, decay: seconds });
}

/** A wooden block set down on another: tock. */
export function tock(i = 0): void {
  const t = now();
  tone(420 + i * 60, t, { wave: 'triangle', peak: 0.1, attack: 0.003, decay: 0.09 });
  noiseBurst(t, { freq: 1200, q: 3, peak: 0.05, attack: 0.002, decay: 0.05 });
}

// ------------------------------------------------------------------- moves

/** Mr Whirligig rings his handbell (the bell swings in his raised hand). */
export async function ringBell(k: Kit, el: HTMLElement, times = 3): Promise<void> {
  const b = k.pivot(k.part(el, 'bell'));
  handbell(times + 1);
  for (let i = 0; i < times; i++) {
    await k.to(b, 0.13, { rotation: 18 });
    await k.to(b, 0.13, { rotation: -18 });
  }
  await k.to(b, 0.12, { rotation: 0 });
}

/** The pinwheel on Mr Whirligig's hat spins round. */
export function spinPinwheel(k: Kit, el: HTMLElement, turns = 3, seconds = 1.4): Promise<void> {
  return k.to(k.pivot(k.part(el, 'pinwheel')), seconds, { rotation: `+=${360 * turns}`, ease: 'power1.inOut' });
}

/** Turns an actor (about its middle) by a fraction of a whole turn: 0.25 is a quarter, clockwise. */
export function turn(k: Kit, el: HTMLElement, fraction: number, seconds = 1): Promise<void> {
  return k.to(el, seconds, { rotation: `+=${360 * fraction}`, ease: 'power2.inOut' });
}

/** A red goblin, small and whole (the figure from art/characters/l14): about 150 wide. */
export function goblin(k: Kit, name: string, o: { x: number; y: number; w?: number; z?: number; pose?: GoblinPose; flip?: boolean; carry?: Node[] }): HTMLElement {
  const el = k.add(goblinFigure(`fair-goblin-${name}`, { pose: o.pose, flip: o.flip, carry: o.carry }), { x: o.x, y: o.y, w: o.w ?? 150, z: o.z ?? 20 });
  el.dataset.who = 'redGoblin';
  return el;
}

/**
 * A red goblin's head peeping up from behind something: the top of the
 * Red Goblin portrait (his cap, ears and narrow yellow eyes), about `w` wide.
 */
export function peeper(k: Kit, o: { x: number; y: number; w?: number; z?: number; flip?: boolean }): HTMLElement {
  return k.character('redGoblin', { crop: '40 0 220 190', w: o.w ?? 120, x: o.x, y: o.y, z: o.z ?? 15, flip: o.flip });
}

// --------------------------------------------------------------------- art

/** Points round a circle, from `a0` to `a1` (radians, 0 = twelve o'clock, clockwise). */
function arc(cx: number, cy: number, r: number, a0: number, a1: number, n = 40): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + Math.sin(a) * r, cy - Math.cos(a) * r] as Pt;
  });
}

/** Mr Whirligig's magic arrow board: a round striped board (240 × 240) for the arrow to spin on. */
export function arrowBoard(name = 'fair-board'): string {
  const wedges: Node[] = [];
  for (let i = 0; i < 8; i++) {
    const a0 = (i / 8) * Math.PI * 2;
    wedges.push(piece([[120, 120], ...arc(120, 120, 104, a0, a0 + Math.PI / 4, 8)], i % 2 ? FAIR_CREAM : '#f6d9a8', { edge: 'cut', fibre: false, shadow: false }));
  }
  return svg({ w: 240, h: 240, name, boil: false, label: 'a round board' }, [
    piece(circle(120, 120, 116), FAIR_TEAL),
    ...wedges,
    ...[0, 1, 2, 3].map((i) => {
      const a = (i / 4) * Math.PI * 2;
      return piece(circle(120 + Math.sin(a) * 108, 120 - Math.cos(a) * 108, 8), FAIR_GOLD, { edge: 'cut' });
    }),
  ]);
}

/** The magic arrow itself (240 × 240, pointing up), to lay on the board and turn about its middle. */
export function arrow(name = 'fair-arrow', color = FAIR_RED): string {
  return svg({ w: 240, h: 240, name, boil: false, label: 'an arrow' }, [
    piece(
      poly([
        [120, 20],
        [168, 82],
        [134, 78],
        [134, 196],
        [106, 196],
        [106, 78],
        [72, 82],
      ]),
      color,
      { rough: 0.6 },
    ),
    piece(poly([[106, 196], [134, 196], [146, 218], [94, 218]]), FAIR_GOLD, { edge: 'cut' }),
    piece(circle(120, 120, 13), FAIR_GOLD, { edge: 'cut' }),
    piece(circle(120, 120, 5), C.brownDark, { edge: 'clean', shadow: false }),
  ]);
}

/**
 * A curved arrow showing a turn (300 × 300): it starts at the top and goes
 * clockwise round by `fraction` of a whole turn (mirror it with `flip` for
 * anticlockwise).
 */
export function turnArc(fraction: number, color: string, name: string): string {
  const end = Math.PI * 2 * Math.min(fraction, 0.94);
  const pts = arc(150, 150, 126, 0.08, end, 48);
  const [tx, ty] = pts[pts.length - 1];
  // The arrowhead points along the circle (clockwise) at the end.
  const dir = end + Math.PI / 2;
  const ux = Math.sin(dir);
  const uy = -Math.cos(dir);
  const px = -uy;
  const py = ux;
  return svg({ w: 300, h: 300, name, boil: false }, [
    ink(pts, { width: 12, color, wobble: 0.4 }),
    piece(
      poly([
        [tx + ux * 26, ty + uy * 26],
        [tx + px * 20, ty + py * 20],
        [tx - px * 20, ty - py * 20],
      ]),
      color,
      { edge: 'cut' },
    ),
  ]);
}

/** A torn paper label with a word or two on it (`w` × 80). */
export function wordTag(text: string, color: string, name: string, w = 240): string {
  return svg({ w, h: 80, name, boil: false }, [
    piece(rect(6, 6, w - 12, 68, 10), color, { rough: 0.7 }),
    raw(`<text x="${w / 2}" y="54" font-family="Andika, sans-serif" font-weight="700" font-size="40" fill="${C.ink}" text-anchor="middle">${text}</text>`),
  ]);
}

/** A square paper tag with a number on it (100 × 100): one face of a cube. */
export function squareTag(n: number | string, color: string, name: string): string {
  return svg({ w: 100, h: 100, name, boil: false }, [
    piece(rect(10, 10, 80, 80, 4), color, { rough: 0.6 }),
    raw(`<text x="50" y="69" text-anchor="middle" font-family="Andika, sans-serif" font-size="52" font-weight="700" fill="${C.ink}">${n}</text>`),
  ]);
}

/**
 * The fair's clock (220 × 220), in its colours, with every number round the
 * edge and its hands at a time. The hands are the parts hourHand and minHand.
 */
export function fairClock(name: string, hour = 12, minute = 0): string {
  const hDeg = (hour % 12) * 30 + minute * 0.5;
  const mDeg = minute * 6;
  const at = (deg: number, r: number): Pt => [110 + Math.sin((deg * Math.PI) / 180) * r, 110 - Math.cos((deg * Math.PI) / 180) * r];
  const nums = Array.from({ length: 12 }, (_, i) => {
    const [x, y] = at((i + 1) * 30, 66);
    return raw(`<text x="${x}" y="${y + 9}" text-anchor="middle" font-family="Andika, sans-serif" font-weight="700" font-size="25" fill="${C.ink}">${i + 1}</text>`);
  });
  const ticks = Array.from({ length: 60 }, (_, i) => ink([at(i * 6, i % 5 ? 84 : 80), at(i * 6, 88)], { width: i % 5 ? 1.4 : 3, color: C.brownDark }));
  return svg({ w: 220, h: 220, name, boil: false, label: 'a clock' }, [
    piece(circle(110, 110, 106), FAIR_RED),
    piece(circle(110, 110, 94), FAIR_CREAM, { edge: 'cut', fibre: false }),
    ...ticks,
    ...nums,
    // Hands drawn already pointing at the time (see snow.ts clockFace for why).
    group({ part: 'hourHand', origin: [110, 110] }, [piece(poly([at(hDeg - 8, 8), at(hDeg, 46), at(hDeg + 8, 8), at(hDeg + 180, 10)]), C.ink, { edge: 'cut', shadow: false })]),
    group({ part: 'minHand', origin: [110, 110] }, [piece(poly([at(mDeg - 4, 10), at(mDeg, 74), at(mDeg + 4, 10), at(mDeg + 180, 12)]), FAIR_TEAL_DARK, { edge: 'cut', shadow: false })]),
    piece(circle(110, 110, 8), FAIR_GOLD, { edge: 'cut' }),
  ]);
}

export type Solid = 'cube' | 'cuboid' | 'sphere' | 'cylinder' | 'cone' | 'pyramid';

/** Each solid's colours: [light face, main face, shaded face]. */
const SOLID_COLOURS: Record<Solid, [string, string, string]> = {
  cube: ['#f08e78', FAIR_RED, '#9a2e22'],
  cuboid: ['#f3c56c', FAIR_GOLD, '#a97a28'],
  sphere: ['#7cc4c0', FAIR_TEAL, FAIR_TEAL_DARK],
  cylinder: ['#fbe7c4', '#ecc98f', '#c9a066'],
  cone: ['#f7b27a', '#e07b39', '#b3561f'],
  pyramid: ['#d4b8e8', '#9a78c2', '#6f4f96'],
};

/**
 * A 3D shape in torn paper (160 × 160, sitting on y ≈ 140): its faces in a
 * light, a middle and a shaded colour so it reads as solid.
 */
export function solid(kind: Solid, name: string, colours: [string, string, string] = SOLID_COLOURS[kind]): string {
  const [lite, mid, dark] = colours;
  const cut = { edge: 'cut' as const, fibre: false as const };
  const shadow = piece(ellipse(80, 146, 62, 8), 'rgba(40,25,10,0.18)', { edge: 'clean', fibre: false, shadow: false });
  let nodes: Node[];
  if (kind === 'cube') {
    nodes = [
      piece(poly([[26, 62], [106, 62], [106, 142], [26, 142]]), mid),
      piece(poly([[26, 62], [56, 32], [136, 32], [106, 62]]), lite, cut),
      piece(poly([[106, 62], [136, 32], [136, 112], [106, 142]]), dark, cut),
    ];
  } else if (kind === 'cuboid') {
    nodes = [
      piece(poly([[8, 84], [122, 84], [122, 142], [8, 142]]), mid),
      piece(poly([[8, 84], [34, 58], [150, 58], [122, 84]]), lite, cut),
      piece(poly([[122, 84], [150, 58], [150, 116], [122, 142]]), dark, cut),
    ];
  } else if (kind === 'sphere') {
    nodes = [
      piece(circle(80, 86, 58), mid),
      piece(curve([[124, 46], [140, 86], [122, 130], [80, 144], [104, 120], [116, 86]], 2), dark, { ...cut, shadow: false, opacity: 0.8 }),
      piece(ellipse(60, 64, 16, 10, -30), lite, { ...cut, shadow: false, opacity: 0.9 }),
    ];
  } else if (kind === 'cylinder') {
    nodes = [
      piece([[36, 42], [36, 132], ...ellipseHalf(80, 132, 44, 13), [124, 42]], mid),
      piece(poly([[104, 44], [124, 42], [124, 132], [104, 140]]), dark, { ...cut, shadow: false, opacity: 0.7 }),
      piece(ellipse(80, 42, 44, 13), lite, cut),
    ];
  } else if (kind === 'cone') {
    nodes = [
      piece([[80, 16], [30, 128], ...ellipseHalf(80, 128, 50, 14), [130, 128]], mid),
      piece(poly([[80, 16], [104, 136], [130, 128]]), dark, { ...cut, shadow: false, opacity: 0.75 }),
      piece(poly([[80, 16], [52, 120], [64, 126]]), lite, { ...cut, shadow: false, opacity: 0.6 }),
    ];
  } else {
    nodes = [
      piece(poly([[80, 18], [22, 132], [98, 144]]), lite),
      piece(poly([[80, 18], [98, 144], [142, 120]]), dark, cut),
    ];
  }
  return svg({ w: 160, h: 160, name, boil: false, label: `a ${kind}` }, [shadow, ...nodes]);
}

/** The lower half of an ellipse, left to right (the curved bottom of a cylinder or cone). */
function ellipseHalf(cx: number, cy: number, rx: number, ry: number, n = 16): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = Math.PI - (i / n) * Math.PI;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as Pt;
  });
}

export type Way = 'forwards' | 'left' | 'right';

/** A cream card with a big arrow (110 × 110): straight up for forwards, bent for a turn. */
export function arrowCard(way: Way, name: string): string {
  const s = way === 'left' ? -1 : 1;
  const shape: Node[] =
    way === 'forwards'
      ? [piece(poly([[55, 14], [86, 50], [64, 48], [64, 96], [46, 96], [46, 48], [24, 50]]), FAIR_RED, { edge: 'cut' })]
      : [
          ink([[55 - s * 14, 96], [55 - s * 14, 54], [55 + s * 18, 54]], { width: 16, color: FAIR_TEAL }),
          piece(poly([[55 + s * 14, 34], [55 + s * 44, 54], [55 + s * 14, 74]]), FAIR_TEAL, { edge: 'cut' }),
        ];
  return svg({ w: 110, h: 110, name, boil: false, label: way }, [piece(rect(6, 6, 98, 98, 12), FAIR_CREAM, { rough: 0.8 }), ...shape]);
}

/** The little map of the fair for following directions: a grid 4 across and 3 down. */
export const GRID = { cols: 4, rows: 3, cell: 110, x: 40, y: 30, w: 520, h: 390 };

/** Where the middle of a square of the grid is on the map card itself. */
export const cellOnMap = (col: number, row: number): Pt => [GRID.x + (col + 0.5) * GRID.cell, GRID.y + (row + 0.5) * GRID.cell];

/**
 * The map card (520 × 390): a grid of paths across the fair, a star where
 * they start (bottom left) and the big wheel at the top right, with a
 * teacup and a carousel tent in the way.
 */
export function fairMap(name = 'fair-map'): string {
  const { cols, rows, cell, x, y } = GRID;
  const squares: Node[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) squares.push(piece(rect(x + c * cell + 4, y + r * cell + 4, cell - 8, cell - 8, 8), (r + c) % 2 ? '#f6e3c0' : '#efd2a0', { edge: 'cut', fibre: false, shadow: false }));
  const [sx, sy] = cellOnMap(0, 2);
  const star: Pt[] = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
    const rr = i % 2 ? 14 : 32;
    return [sx + Math.cos(a) * rr, sy + Math.sin(a) * rr];
  });
  const [wx, wy] = cellOnMap(3, 0);
  const [tx, ty] = cellOnMap(1, 1);
  const [cx, cy] = cellOnMap(2, 2);
  return svg({ w: 520, h: 390, name, boil: false, label: 'a map of the fair' }, [
    piece(rect(6, 6, 508, 378, 18), C.sand, { rough: 1.2 }),
    piece(rect(x - 6, y - 6, cols * cell + 12, rows * cell + 12, 12), '#d9b483', { edge: 'cut', fibre: false, shadow: false }),
    ...squares,
    piece(star, C.goldLight, { edge: 'cut' }),
    bigWheel(wx, wy + 48, 30, 1),
    teacup(tx, ty + 26, 0.62, FAIR_TEAL),
    piece(poly([[cx - 36, cy + 34], [cx, cy - 36], [cx + 36, cy + 34]]), FAIR_RED, { edge: 'cut' }),
    piece(poly([[cx - 12, cy + 34], [cx, cy - 36], [cx + 12, cy + 34]]), FAIR_CREAM, { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

/** The walker on the map (80 × 80): a round counter with an arrowhead showing which way it faces (up). */
export function walker(name = 'fair-walker'): string {
  return svg({ w: 80, h: 80, name, boil: false, label: 'you are here' }, [
    piece(circle(40, 40, 32), FAIR_RED),
    piece(poly([[40, 14], [60, 50], [40, 42], [20, 50]]), FAIR_CREAM, { edge: 'cut' }),
  ]);
}

/**
 * The spinning teacups seen from above (300 × 300): a striped turntable
 * with four cups round it, red at the top, teal on the right, cream on the
 * left, and the Saucepan Man's gold cup (a saucepan in it) at the bottom.
 * Turn the whole actor about its middle.
 */
export function teacupRide(name = 'fair-ride'): string {
  const wedges: Node[] = [];
  for (let i = 0; i < 12; i++) {
    const a0 = (i / 12) * Math.PI * 2;
    wedges.push(piece([[150, 150], ...arc(150, 150, 136, a0, a0 + Math.PI / 6, 6)], i % 2 ? FAIR_CREAM : '#f2c9a0', { edge: 'cut', fibre: false, shadow: false }));
  }
  const cup = (a: number, color: string, inner: string, extra: Node[] = []): Node[] => {
    const x = 150 + Math.sin(a) * 92;
    const y = 150 - Math.cos(a) * 92;
    const hx = 150 + Math.sin(a + 0.42) * 128;
    const hy = 150 - Math.cos(a + 0.42) * 128;
    return [
      piece(circle(hx, hy, 9), color, { edge: 'cut' }),
      piece(circle(x, y, 36), color),
      piece(circle(x, y, 26), inner, { edge: 'cut', fibre: false, shadow: false }),
      ...extra.map((n) => group({ transform: `translate(${x} ${y})` }, [n])),
    ];
  };
  const pot: Node[] = [
    piece(circle(0, 0, 16), C.steelLight, { edge: 'cut' }),
    piece(circle(0, 0, 10), C.steel, { edge: 'cut', fibre: false, shadow: false }),
    piece(rect(12, -4, 22, 8, 3), C.brownDark, { edge: 'cut' }),
  ];
  return svg({ w: 300, h: 300, name, boil: false, label: 'the spinning teacups' }, [
    piece(circle(150, 150, 146), FAIR_TEAL),
    ...wedges,
    ...cup(0, FAIR_RED, '#8f2c20'),
    ...cup(Math.PI / 2, FAIR_TEAL, FAIR_TEAL_DARK),
    ...cup(Math.PI, FAIR_GOLD, '#a97a28', pot),
    ...cup((Math.PI * 3) / 2, FAIR_CREAM, '#d8c4a0'),
    piece(circle(150, 150, 22), FAIR_GOLD, { edge: 'cut' }),
    piece(circle(150, 150, 8), C.brownDark, { edge: 'clean', shadow: false }),
  ]);
}

/** A signpost with arrows (the land's own, from art/lands/l13), on its own: 160 × 200. */
export function signpostArt(name = 'fair-signpost'): string {
  return svg({ w: 160, h: 200, name, boil: false, label: 'a signpost' }, [signpost(80, 190, 1.3)]);
}

/** A big striped barrel (a cylinder) to hide behind (200 × 220). */
export function barrel(name = 'fair-barrel'): string {
  return svg({ w: 200, h: 220, name, boil: false, label: 'a barrel' }, [
    piece(ellipse(100, 206, 90, 10), 'rgba(40,25,10,0.18)', { edge: 'clean', fibre: false, shadow: false }),
    piece([[16, 40], [16, 196], ...ellipseHalf(100, 196, 84, 18), [184, 40]], C.wood, { rough: 0.6 }),
    ...[80, 150].map((y) => piece(rect(14, y, 172, 16, 3), FAIR_RED, { edge: 'cut', fibre: false })),
    piece(ellipse(100, 40, 84, 18), '#c99a62', { edge: 'cut' }),
    piece(ellipse(100, 40, 70, 12), C.woodShade, { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

/** A stack of boxes (cuboids) to hide behind (240 × 230). */
export function boxes(name = 'fair-boxes'): string {
  const box = (x: number, y: number, w: number, h: number, c: [string, string, string]): Node[] => [
    piece(poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]), c[1]),
    piece(poly([[x, y], [x + 18, y - 16], [x + w + 18, y - 16], [x + w, y]]), c[0], { edge: 'cut', fibre: false }),
    piece(poly([[x + w, y], [x + w + 18, y - 16], [x + w + 18, y + h - 16], [x + w, y + h]]), c[2], { edge: 'cut', fibre: false }),
  ];
  return svg({ w: 240, h: 230, name, boil: false, label: 'a pile of boxes' }, [
    piece(ellipse(118, 220, 110, 9), 'rgba(40,25,10,0.18)', { edge: 'clean', fibre: false, shadow: false }),
    ...box(10, 150, 100, 66, SOLID_COLOURS.cuboid),
    ...box(112, 150, 100, 66, ['#f08e78', FAIR_RED, '#9a2e22']),
    ...box(56, 84, 110, 66, ['#7cc4c0', FAIR_TEAL, FAIR_TEAL_DARK]),
  ]);
}
