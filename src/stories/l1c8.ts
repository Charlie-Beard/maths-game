/**
 * Land 1, chapter 8 (the land's finale): Up to Moon-Face's Room.
 *
 * Plays straight after the climb: he has just answered his way up the
 * ladder. Four scenes:
 *
 *   1. The top of the tree. {name} and the chosen child pop up through the
 *      trapdoor into Moon-Face's round room: round window, round rug,
 *      heaps of cushions. Moon-Face gives them his moon lamp.
 *   2. The slippery-slip. On a cushion, round and round, down the inside
 *      of the trunk: lanterns, little windows and the Folk's doors whizz
 *      past (the world scrolls up while they swing from side to side).
 *   3. The bottom. Whoosh out of the hatch in the roots, flump onto the
 *      cushions. Moon-Face explains the lands in the cloud: they come and
 *      go, and it is dangerous to stay when one moves on. The seal of the
 *      Enchanted Wood.
 *   4. That night. The tree is asleep, the cloud at the top is empty and
 *      still. From far off: clack, clack, clack… and a ruler's SNAP,
 *      echoing through the clouds. Nobody is seen. A low sting, and black.
 */
import { tree } from '../art/scenery';
import { landSeal } from '../art/keepsakes';
import { band, C, circle, curve, defineStory, dot, ellipse, ink, noiseBurst, NOTE, now, piece, poly, rect, rng, svg, tone, bell, type Kit, type Node, type Pt } from './kit';

// ------------------------------------------------------------------ sounds

/** Plump cushions taking a landing: a soft, deep flump. */
export function flump(): void {
  const t = now();
  noiseBurst(t, { freq: 320, type: 'lowpass', peak: 0.22, attack: 0.01, decay: 0.32 });
  tone(95, t, { peak: 0.16, decay: 0.25, glideTo: 55 });
}

/** The ride: a long, swooping whoosh that rises and falls like the spiral. */
function slideWhoosh(seconds: number): void {
  const t = now();
  const turns = Math.max(2, Math.round(seconds / 1.2));
  for (let i = 0; i < turns; i++) {
    const at = t + (i * seconds) / turns;
    noiseBurst(at, { freq: 700, q: 1.6, peak: 0.1, attack: 0.25, decay: 0.6, sweepTo: 2600 });
  }
  tone(240, t, { wave: 'triangle', peak: 0.05, attack: 0.3, decay: seconds, glideTo: 120, vibrato: [1 / 1.2, 40], lowpass: 1200 });
}

/** One heel on a hard floor, far away: a sharp, dry click and a faint echo. */
function clack(t: number, loud = 1): void {
  for (const [dt, k] of [[0, 1], [0.22, 0.35], [0.44, 0.12]] as const) {
    noiseBurst(t + dt, { freq: 2600, q: 5, peak: 0.12 * loud * k, attack: 0.002, decay: 0.035 });
    tone(1400, t + dt, { wave: 'square', peak: 0.03 * loud * k, attack: 0.002, decay: 0.03, lowpass: 2600 });
  }
}

/** A slow walk of heels: clack … clack … clack. */
function heels(steps: number, gap = 0.6): void {
  const t = now();
  for (let i = 0; i < steps; i++) clack(t + i * gap, 0.6 + (i / steps) * 0.5);
}

/** A ruler snapped down on a desk, ringing round and round the clouds. */
export function rulerSnap(): void {
  const t = now();
  for (let i = 0; i < 5; i++) {
    const at = t + i * 0.32;
    const k = 0.55 ** i;
    noiseBurst(at, { freq: 3200, q: 0.9, peak: 0.3 * k, attack: 0.002, decay: 0.1 });
    tone(260, at, { wave: 'square', peak: 0.12 * k, attack: 0.002, decay: 0.09, glideTo: 90, lowpass: 2400 });
    tone(70, at, { peak: 0.2 * k, attack: 0.002, decay: 0.25, glideTo: 40 });
  }
}

/** The ominous sting at the very end: a low, uneasy chord that hangs and fades. */
export function sting(): void {
  const t = now();
  for (const f of [NOTE.C3, 155.56, 185.0]) tone(f, t, { wave: 'sawtooth', peak: 0.06, attack: 0.04, decay: 3, lowpass: 650, vibrato: [5, 1.5] });
  tone(65.4, t, { peak: 0.16, attack: 0.04, decay: 3.2 });
  bell(NOTE.C5 * 1.06, t + 0.1, 0.05, 2.5);
}

/** A cosy little rising tune: the moon lamp glowing on. */
function lampOn(): void {
  const t = now();
  [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6].forEach((f, i) => bell(f, t + i * 0.13, 0.08, 1.2));
}

// --------------------------------------------------------------------- art

const SLIDE = '#c98a3e';
const SLIDE_RIM = '#8a5426';
const CUSHIONS = [C.rose, C.goldLight, C.blue, C.plum, C.green, C.orange, C.pink, C.teal];

/** One plump tufted cushion, centred at (x, y). */
function cushionNodes(x: number, y: number, w: number, h: number, color: string, rot = 0): Node[] {
  const c = Math.cos((rot * Math.PI) / 180);
  const s = Math.sin((rot * Math.PI) / 180);
  const at = (dx: number, dy: number): Pt => [x + dx * c - dy * s, y + dx * s + dy * c];
  const hw = w / 2;
  const hh = h / 2;
  return [
    piece(curve([at(-hw, -hh * 0.6), at(0, -hh), at(hw, -hh * 0.6), at(hw * 1.05, 0), at(hw, hh * 0.6), at(0, hh), at(-hw, hh * 0.6), at(-hw * 1.05, 0)], 3), color),
    dot(...at(0, 0), Math.max(3, h * 0.07), 'rgba(40,25,10,0.35)'),
    ...[-1, 1].map((sx) => ink([at(sx * hw * 0.55, -hh * 0.35), at(sx * hw * 0.2, -hh * 0.1)], { width: 2, color: 'rgba(40,25,10,0.25)' })),
  ];
}

/** A single cushion as an actor (for riding the slide). */
function cushionArt(color: string, name: string): string {
  return svg({ w: 220, h: 90, name, boil: false }, cushionNodes(110, 46, 200, 70, color));
}

/** A heap of cushions as an actor (the front of the landing pile). */
function heapArt(name: string, count: number, seed: number): string {
  const r = rng(seed);
  const nodes: Node[] = [];
  for (let i = 0; i < count; i++) {
    const x = 70 + (i / Math.max(1, count - 1)) * 380 + r() * 20;
    const y = 80 + (i % 2) * 22 + r() * 10;
    nodes.push(...cushionNodes(x, y, 140 + r() * 30, 66 + r() * 12, CUSHIONS[(i + seed) % CUSHIONS.length], (r() - 0.5) * 24));
  }
  return svg({ w: 520, h: 150, name, boil: false }, nodes);
}

/**
 * Moon-Face's round room, inside: curved plank walls, a big round window on
 * the night clouds, a round rug, heaps of cushions, the trapdoor where the
 * ladder comes up (left) and the mouth of the slippery-slip (right).
 * Exported so the other finales can come home to it.
 */
export function moonRoom(name: string): string {
  const r = rng(81);
  const wx = 590;
  const wy = 236;
  const planks: Node[] = [];
  for (let i = -6; i <= 6; i++) {
    const x = 590 + i * 96;
    const bend = i * 14;
    planks.push(ink([[x - bend * 0.2, -10], [x, 280], [x + bend, 560]], { width: 3, color: C.brownDark, opacity: 0.35, wobble: 1.2 }));
  }
  const stars: Node[] = [];
  for (let i = 0; i < 18; i++) {
    const a = r() * Math.PI * 2;
    const d = r() * 128;
    stars.push(dot(wx + Math.cos(a) * d, wy + Math.sin(a) * d * 0.9, 1.4 + r() * 2.2, C.cream, 0.5 + r() * 0.5));
  }
  const back: Node[] = [];
  // Cushions heaped against the wall on both sides of the window.
  [[130, 520], [250, 500], [190, 470], [960, 500], [1070, 520], [1020, 470]].forEach(([x, y], i) => back.push(...cushionNodes(x, y, 150, 70, CUSHIONS[i % CUSHIONS.length], (i % 3 - 1) * 10)));
  return svg({ w: 1180, h: 820, name, boil: false, className: 'backdrop' }, [
    // The round wall, warm wood, darker at the edges.
    piece(rect(-20, -20, 1220, 860), C.wood, { edge: 'clean', shadow: false }),
    piece(rect(-20, -20, 200, 860), C.brown, { edge: 'torn', shadow: false, opacity: 0.55 }),
    piece(rect(1000, -20, 200, 860), C.brown, { edge: 'torn', shadow: false, opacity: 0.55 }),
    ...planks,
    // A shelf with jars and a little clock, all round.
    piece(rect(150, 210, 220, 14, 3), C.barkDark, { edge: 'cut' }),
    ...[180, 230, 290, 340].map((x, i) => piece(circle(x, 186 + (i % 2) * 4, 18 - (i % 2) * 4), [C.goldLight, C.sky, C.rose, C.cream][i], { edge: 'cut' })),
    piece(rect(820, 210, 220, 14, 3), C.barkDark, { edge: 'cut' }),
    piece(circle(880, 178, 26), C.cream, { edge: 'cut' }),
    ink([[880, 178], [880, 160]], { width: 3, color: C.ink }),
    ink([[880, 178], [892, 184]], { width: 3, color: C.ink }),
    ...[950, 1000].map((x, i) => piece(circle(x, 188, 16), [C.leaf, C.plum][i], { edge: 'cut' })),
    // The big round window: night sky and clouds outside.
    piece(circle(wx, wy, 168), C.barkDark),
    piece(circle(wx, wy, 146), C.night, { edge: 'cut', fibre: false, shadow: false }),
    piece(circle(wx, wy + 40, 120), C.nightLight, { edge: 'cut', fibre: false, shadow: false, opacity: 0.6 }),
    ...stars,
    piece(circle(wx + 70, wy - 60, 26), C.goldLight, { edge: 'cut', fibre: false }),
    piece(circle(wx + 80, wy - 66, 22), C.night, { edge: 'cut', fibre: false, shadow: false }),
    piece(ellipse(wx - 40, wy + 90, 110, 26), C.cloud, { edge: 'torn', fibre: false, shadow: false, opacity: 0.85 }),
    piece(ellipse(wx + 70, wy + 110, 90, 22), C.cloudShade, { edge: 'torn', fibre: false, shadow: false, opacity: 0.85 }),
    piece(band([[wx - 146, wy], [wx + 146, wy]], 10), C.barkDark, { edge: 'cut', fibre: false }),
    piece(band([[wx, wy - 146], [wx, wy + 146]], 10), C.barkDark, { edge: 'cut', fibre: false }),
    // The floor: a round rug on wooden boards.
    piece(curve([[-20, 560], [300, 530], [590, 524], [880, 530], [1200, 560], [1200, 840], [-20, 840]], 2), C.barkLight, { rough: 1.2 }),
    ...back,
    piece(ellipse(590, 660, 400, 84), C.rose, { rough: 1.2 }),
    piece(ellipse(590, 660, 330, 64), C.gold, { edge: 'cut', fibre: false, shadow: false, opacity: 0.85 }),
    piece(ellipse(590, 660, 250, 46), C.rose, { edge: 'cut', fibre: false, shadow: false }),
    // The trapdoor, open, with the top of the ladder.
    piece(poly([[140, 640], [330, 640], [350, 720], [120, 720]]), C.ink, { edge: 'cut' }),
    piece(poly([[140, 640], [330, 640], [316, 560], [158, 560]]), C.wood, { edge: 'cut' }),
    piece(band([[180, 760], [184, 616]], 12), C.tan, { edge: 'cut' }),
    piece(band([[290, 760], [286, 616]], 12), C.tan, { edge: 'cut' }),
    ...[700, 650].map((y) => piece(rect(180, y, 110, 9, 2), C.tan, { edge: 'cut', fibre: false })),
    // The mouth of the slippery-slip, with its polished rim.
    piece(ellipse(1000, 690, 130, 40), SLIDE_RIM),
    piece(ellipse(1000, 692, 110, 30), C.ink, { edge: 'cut', fibre: false }),
    piece(band([[900, 700], [960, 716], [1040, 718], [1100, 700]], 14), SLIDE, { edge: 'cut', fibre: false, shadow: false }),
  ]);
}

/** Length of the slide picture, and the path down it (a zigzag spiral round the inside of the trunk). */
const SLIDE_H = 2900;
const slidePath = (t: number): Pt => [590 + 410 * Math.sin(2 * Math.PI * 2.5 * t - Math.PI / 2), 300 + t * 2350];

/**
 * The inside of the trunk, very tall: dark bark with grain, lanterns,
 * little round windows on the dusk, the Folk's back doors, and the
 * slippery-slip zigzagging all the way down. Scrolled up past the riders.
 */
function trunkInside(): string {
  const r = rng(82);
  const nodes: Node[] = [
    piece(rect(-20, -20, 1220, SLIDE_H + 40), C.barkDark, { edge: 'clean', shadow: false }),
    piece(rect(-20, -20, 180, SLIDE_H + 40), C.ink, { edge: 'torn', shadow: false, opacity: 0.35 }),
    piece(rect(1020, -20, 180, SLIDE_H + 40), C.ink, { edge: 'torn', shadow: false, opacity: 0.35 }),
  ];
  for (let i = 0; i < 16; i++) {
    const x = 40 + i * 74 + r() * 20;
    nodes.push(ink([[x, -10], [x + r() * 30 - 15, SLIDE_H / 2], [x + r() * 30 - 15, SLIDE_H + 10]], { width: 3, color: C.bark, opacity: 0.6, wobble: 2 }));
  }
  // Knots in the wood.
  for (let i = 0; i < 14; i++) nodes.push(piece(ellipse(80 + r() * 1020, 100 + r() * (SLIDE_H - 200), 16 + r() * 12, 26 + r() * 10), C.bark, { edge: 'cut', fibre: false, shadow: false }));
  // Little round windows on the dusk outside, and lanterns between the turns.
  for (let i = 0; i < 9; i++) {
    const y = 180 + i * 300;
    const x = i % 2 ? 940 : 240;
    nodes.push(piece(circle(x, y, 40), C.bark), piece(circle(x, y, 30), i < 5 ? C.duskSky : C.dusk, { edge: 'cut', fibre: false, shadow: false }));
    nodes.push(piece(band([[x - 30, y], [x + 30, y]], 5), C.bark, { edge: 'cut', fibre: false, shadow: false }));
    const lx = i % 2 ? 300 : 880;
    nodes.push(ink([[lx, y - 40], [lx, y - 6]], { width: 3, color: C.ink }));
    nodes.push(piece(rect(lx - 14, y - 8, 28, 36, 8), C.candle, { edge: 'cut' }), piece(poly([[lx - 18, y - 6], [lx, y - 22], [lx + 18, y - 6]]), C.brownDark, { edge: 'cut', fibre: false }));
  }
  // Back doors of the Folk on the way down: round, square, and one with a tub.
  for (const [x, y, col] of [[590, 520, C.violet], [590, 1500, C.teal], [590, 2460, C.red]] as const) {
    nodes.push(piece(rect(x - 44, y - 70, 88, 120, 40), col, { edge: 'cut' }), dot(x + 26, y - 6, 6, C.goldLight));
  }
  // The slide: a dark rim underneath, the polished chute on top.
  const pts: Pt[] = [];
  for (let i = 0; i <= 160; i++) pts.push(slidePath(i / 160));
  pts.unshift([pts[0][0] - 200, pts[0][1] - 40]);
  nodes.push(piece(band(pts.map(([x, y]) => [x, y + 16] as Pt), 40), SLIDE_RIM, { rough: 0.6 }));
  nodes.push(piece(band(pts, 30), SLIDE, { edge: 'cut', fibre: false }));
  nodes.push(ink(pts.map(([x, y]) => [x, y - 6] as Pt), { width: 4, color: C.goldLight, opacity: 0.6 }));
  // Light from the bottom, where the slide comes out.
  nodes.push(piece(ellipse(590, SLIDE_H - 60, 500, 140), C.duskSky, { edge: 'torn', shadow: false, opacity: 0.35 }));
  return svg({ w: 1180, h: SLIDE_H, name: 'l1c8-trunk', boil: false }, nodes);
}

/** The bottom of the tree at dusk: a great trunk, the slide's hatch in its roots, a heap of cushions. */
function treeFoot(): string {
  const r = rng(83);
  const grass: Node[] = [];
  for (let i = 0; i < 30; i++) {
    const gx = r() * 1180;
    grass.push(ink([[gx, 812], [gx + 4, 784 - r() * 18]], { width: 3, color: C.leafDark, opacity: 0.8 }));
  }
  return svg({ w: 1180, h: 820, name: 'l1c8-foot', boil: false, className: 'backdrop' }, [
    piece(rect(-20, -20, 1220, 300), C.duskHigh, { edge: 'clean', shadow: false }),
    piece(rect(-20, 220, 1220, 240), C.duskSky, { rough: 2, shadow: false, fibre: false }),
    piece(rect(-20, 400, 1220, 440), C.dusk, { rough: 2, shadow: false, fibre: false }),
    piece(circle(1000, 420, 54), C.goldLight, { edge: 'cut', fibre: false, shadow: false, opacity: 0.7 }),
    ...[0, 1, 2, 3, 4, 5, 6].map((i) => piece(circle(560 + i * 110, 470 + (i % 2) * 30, 100 + (i % 3) * 20), i % 2 ? C.greenDeep : C.leafDark, { shadow: false })),
    piece(curve([[-20, 600], [300, 580], [700, 600], [1200, 570], [1200, 840], [-20, 840]], 2), C.greenDark, { rough: 1.4 }),
    // The great trunk, too big to fit, with roots spreading out.
    piece(curve([[40, 840], [130, 640], [170, 300], [180, -20], [500, -20], [500, 300], [520, 600], [640, 840]], 2), C.bark),
    piece(band([[260, -10], [270, 300], [250, 600]], 30), C.barkLight, { shadow: false, opacity: 0.45, edge: 'cut' }),
    ink([[420, -10], [430, 320], [460, 620]], { width: 3, color: C.barkDark, opacity: 0.5, wobble: 1.4 }),
    piece(band([[500, 700], [600, 760], [720, 790]], 40), C.bark),
    piece(band([[160, 720], [60, 780], [-20, 800]], 40), C.bark),
    // The hatch the slide comes out of, with the chute's lip.
    piece(rect(340, 430, 150, 170, 70), C.ink, { edge: 'cut' }),
    piece(rect(330, 422, 170, 186, 80), C.barkDark, { edge: 'cut', fibre: false, shadow: false, opacity: 0.4 }),
    piece(band([[380, 590], [470, 600], [560, 628]], 30), SLIDE_RIM, { rough: 0.6 }),
    piece(band([[380, 584], [470, 594], [560, 622]], 18), SLIDE, { edge: 'cut', fibre: false, shadow: false }),
    // A lantern by the hatch.
    ink([[300, 360], [300, 410]], { width: 3, color: C.ink }),
    piece(rect(284, 408, 32, 40, 8), C.candle, { edge: 'cut' }),
    // The cushions waiting at the bottom (more in front, as an actor).
    ...cushionNodes(700, 600, 180, 80, C.blue, -6),
    ...cushionNodes(880, 590, 190, 84, C.plum, 8),
    ...cushionNodes(1040, 610, 170, 76, C.goldLight, -4),
    piece(curve([[-20, 790], [300, 770], [700, 800], [1200, 780], [1200, 840], [-20, 840]], 2), C.greenDeep, { rough: 1.4 }),
    ...grass,
  ]);
}

/** "SNAP!" torn out of chalk-white paper, jagged, for the last scene. */
function snapWord(): string {
  const spikes: Pt[] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const rr = i % 2 ? 70 : 118;
    spikes.push([160 + Math.cos(a) * rr * 1.25, 100 + Math.sin(a) * rr * 0.72]);
  }
  return svg({ w: 320, h: 200, name: 'l1c8-snap', boil: false }, [
    piece(poly(spikes), C.chalk, { edge: 'torn' }),
    piece(poly(spikes.map(([x, y]) => [160 + (x - 160) * 0.8, 100 + (y - 100) * 0.8] as Pt)), C.ruler, { edge: 'cut', fibre: false, shadow: false, opacity: 0.18 }),
    () => `<text x="160" y="122" text-anchor="middle" font-family="Andika, sans-serif" font-weight="700" font-size="64" fill="${C.snapInk}" letter-spacing="2">SNAP!</text>`,
  ]);
}

/** A full-stage black sheet (the last cut to black). */
const blackArt = (): string => svg({ w: 1180, h: 820, name: 'l1c8-black', boil: false }, [() => `<rect x="-40" y="-40" width="1260" height="900" fill="#08070b"/>`]);

// -------------------------------------------------------------------- moves

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

// -------------------------------------------------------------------- story

export default defineStory({
  lines: {
    welcome: { who: 'moonface', text: 'You made it, {name}! Welcome to my room, right at the top of the tree!' },
    round: { who: 'hero', text: 'Everything is round! And look at all the cushions!' },
    lamp: { who: 'moonface', text: 'Every sum was a step up the ladder. Here, take my moon lamp.' },
    best: { who: 'moonface', text: 'Now for the best bit. Grab a cushion. It’s the slippery-slip!' },
    whee: { who: 'hero', text: 'Wheeeee! Round and round and round we go!' },
    bump: { who: 'narrator', text: 'Whoosh! Out of the roots they shot, and flump! Right onto the cushions.' },
    lands: { who: 'moonface', text: 'Up in the cloud at the top of the tree, a new land comes, then goes.' },
    danger: { who: 'moonface', text: 'But never stay when a land moves on. You might never get home!' },
    promise: { who: 'hero', text: 'We’ll always come back down in time. Promise!' },
    seal: { who: 'narrator', text: 'And {name} won the seal of the Enchanted Wood!' },
    night: { who: 'narrator', text: 'That night, the whole tree was asleep. The cloud at the top was very still.' },
    clack: { who: 'narrator', text: 'Then, from far away… clack. Clack. Clack.' },
    ruler: { who: 'narrator', text: 'Somebody was out there. Somebody with a ruler…' },
  },

  async play(k) {
    // ------------------------------------------- scene 1: Moon-Face's room
    k.backdrop(moonRoom('l1c8-room'));
    k.music('cosy');
    k.light(590, 236, 230, { color: '#c9d4ff', strength: 0.25 });
    k.light(860, 190, 120, { color: C.candle, strength: 0.35, flicker: true });
    k.ambient('dust', { count: 14 });
    const mf = k.character('moonface', { x: 520, y: 330, w: 270, z: 20 });
    const hero = k.character('hero', { x: 125, y: 400, w: 240, z: 18 });
    // A strip of floor in front of the trapdoor, so the hero rises out of the hole.
    k.add(svg({ w: 220, h: 120, name: 'l1c8-lip', boil: false }, [piece(poly([[0, 0], [220, 0], [230, 120], [-10, 120]]), C.barkLight, { edge: 'torn', shadow: false })]), { x: 120, y: 720, w: 240, z: 19, still: true });
    k.set(hero, { opacity: 0 });
    k.set(mf, { opacity: 0 });

    await k.enter(mf, 'right', 0.8);
    k.float(mf, 6, 2.4);
    await k.wait(300);
    // The hero climbs up through the trapdoor: creak, creak, pop!
    k.fx.creak();
    k.set(hero, { opacity: 1, y: 300 });
    await k.to(hero, 0.5, { y: 160, ease: 'power1.out' });
    await k.to(hero, 0.5, { y: 60, ease: 'power1.out' });
    k.fx.boing();
    await k.to(hero, 0.3, { y: 0, ease: 'back.out(2)' });
    void k.blink(mf);
    void wave(k, mf, 'armR', 2);
    await k.say('welcome', mf);

    // The hero looks all round.
    await k.camera({ zoom: 1.25, x: 590, y: 330 }, 1.6);
    void k.hop(hero, 30, 2);
    await k.say('round', hero);

    // The moon lamp: it glows on in Moon-Face's hands.
    void k.camera({ zoom: 1.35, x: 640, y: 420 }, 1.2);
    const lamp = k.keepsake(k.chapter!.keepsake, { x: 700, y: 380, w: 170, z: 24 });
    k.set(lamp, { opacity: 0 });
    void k.say('lamp', mf);
    await k.wait(1300);
    await k.appear(lamp, 0.5);
    lampOn();
    k.light(785, 450, 160, { color: C.candle, strength: 0.55, flicker: true, z: 23 });
    k.sparkle(785, 440, 16, 140);
    await k.to(lamp, 1.2, { x: -380, y: 60, rotation: -6, ease: 'sine.inOut' });
    void k.hop(hero, 24, 1);
    await k.wait(1800);

    // Off to the slide: Moon-Face points at the polished hole in the floor.
    await k.camera({}, 1);
    await k.say('best', mf);
    k.fx.whizz();
    await k.all(k.to(mf, 0.7, { x: 400, y: 120, scale: 0.7, ease: 'power2.in' }), k.to(hero, 0.8, { x: 820, y: 80, scale: 0.7, ease: 'power2.in' }), k.to(lamp, 0.8, { x: 0, y: 140, scale: 0.6, opacity: 0, ease: 'power2.in' }));
    await k.all(k.fade(mf, 0, 0.2), k.fade(hero, 0, 0.2));

    // ------------------------------------------- scene 2: the slippery-slip
    let strip!: HTMLElement;
    let rider1!: HTMLElement;
    let rider2!: HTMLElement;
    let seat!: HTMLElement;
    await k.cut(() => {
      strip = k.add(trunkInside(), { x: 0, y: 0, w: 1180, h: SLIDE_H, z: 2, still: true });
      k.dim(0.15, '#2a1408');
      // Riders: placed at (0, 0) and moved by absolute offsets along the path.
      seat = k.add(cushionArt(C.rose, 'l1c8-seat'), { x: 0, y: 0, w: 230, z: 22 });
      rider1 = k.character('moonface', { x: 0, y: 0, w: 150, z: 20 });
      rider2 = k.character('hero', { x: 0, y: 0, w: 150, z: 21 });
    });
    k.music('adventure');
    // Where the riders sit for a point on the path (their cushion on the chute).
    const placeRiders = (p: Pt, scroll: number, flip: boolean) => {
      const sy = p[1] - scroll;
      return [
        { el: seat, x: p[0] - 115, y: sy - 74 },
        { el: rider1, x: p[0] + (flip ? 0 : -150), y: sy - 196 },
        { el: rider2, x: p[0] + (flip ? -150 : 0), y: sy - 190 },
      ];
    };
    const scrollFor = (p: Pt) => Math.max(0, Math.min(SLIDE_H - 820, p[1] - 440));
    const start = slidePath(0);
    for (const { el, x, y } of placeRiders(start, scrollFor(start), false)) k.set(el, { x, y });
    k.set(strip, { y: -scrollFor(start) });
    await k.wait(400);

    const N = 44;
    slideWhoosh(N * 0.2);
    k.fx.whizz();
    void k.say('whee', rider2);
    let flip = false;
    for (let i = 1; i <= N; i++) {
      const prev = slidePath((i - 1) / N);
      const p = slidePath(i / N);
      const goingLeft = p[0] < prev[0];
      if (goingLeft !== flip && Math.abs(p[0] - prev[0]) > 4) {
        flip = goingLeft;
        k.face(rider1, flip);
        k.face(rider2, flip);
        k.face(seat, flip);
      }
      // Tip down the slope: clockwise going right, anticlockwise going left.
      const slope = Math.min(22, (Math.atan2(p[1] - prev[1], Math.abs(p[0] - prev[0])) * 180) / Math.PI);
      const rot = goingLeft ? -slope : slope;
      const scroll = scrollFor(p);
      await k.all(
        k.to(strip, 0.2, { y: -scroll, ease: 'none' }),
        ...placeRiders(p, scroll, flip).map(({ el, x, y }) => k.to(el, 0.2, { x, y, rotation: rot * 0.6, ease: 'none' })),
      );
      if (i % 9 === 0) k.fx.whizz();
      if (i % 11 === 0) k.sparkle(p[0], p[1] - scroll - 40, 6, 60);
    }
    k.fx.whizz();
    await together(k, [seat, rider1, rider2], 0.4, { y: '+=500', ease: 'power2.in' });

    // ------------------------------------------- scene 3: the bottom of the tree
    let mf3!: HTMLElement;
    let hero3!: HTMLElement;
    let heap!: HTMLElement;
    await k.cut(() => {
      k.backdrop(treeFoot());
      k.ambient('fireflies', { count: 12, area: [500, 300, 680, 360] });
      k.light(300, 430, 90, { color: C.candle, strength: 0.5, flicker: true });
      mf3 = k.character('moonface', { x: 640, y: 300, w: 230, z: 20 });
      hero3 = k.character('hero', { x: 850, y: 310, w: 230, z: 20 });
      heap = k.add(heapArt('l1c8-heap', 4, 3), { x: 600, y: 540, w: 560, z: 24 });
      k.set([mf3, hero3], { opacity: 0 });
    });
    k.music('dreamy');
    await k.wait(300);
    // Out of the hatch, one after the other, in a swooping arc onto the heap.
    for (const [el, dx] of [[mf3, -260], [hero3, -470]] as const) {
      k.set(el, { opacity: 1, x: dx, y: 120, scale: 0.4, rotation: -30 });
      k.fx.whizz();
      await k.to(el, 0.35, { x: dx / 2, y: -40, scale: 0.8, rotation: -10, ease: 'power1.out' });
      await k.to(el, 0.3, { x: 0, y: 30, scale: 1, rotation: 6, ease: 'power2.in' });
      flump();
      k.puff(el.offsetLeft + 115, 600, 120, C.cream);
      await k.to(el, 0.3, { y: 0, rotation: 0, ease: 'back.out(2)' });
    }
    void k.pop(heap, 1.05);
    await k.say('bump');
    // Giggles: a bounce each.
    k.fx.boing();
    await k.all(k.hop(mf3, 30, 2), k.wait(150).then(() => k.hop(hero3, 30, 2)));

    // Moon-Face explains the lands, and points up at the cloud.
    void k.camera({ zoom: 1.2, x: 760, y: 380 }, 1.4);
    k.fx.twinkle();
    void k.to(k.part(mf3, 'armR'), 0.4, { rotation: -40 });
    await k.say('lands', mf3);
    k.fx.rumble(1.2);
    void k.to(k.part(mf3, 'armR'), 0.3, { rotation: 0 });
    void k.shake(mf3, 4, 2);
    await k.say('danger', mf3);
    void k.blink(hero3);
    await k.say('promise', hero3);

    // The seal of the Enchanted Wood.
    await k.camera({}, 1);
    const seal = k.add(landSeal(1), { x: 470, y: 60, w: 240, z: 30 });
    k.set(seal, { opacity: 0 });
    k.fx.jingle();
    await k.appear(seal, 0.6);
    k.sparkle(590, 170, 18, 220);
    k.float(seal, 6, 2);
    void k.all(k.hop(hero3, 40, 2), k.hop(mf3, 26, 1));
    await k.say('seal');
    await k.wait(1200);

    // ------------------------------------------- scene 4: that night
    let quiet!: HTMLElement;
    await k.cut(() => {
      k.silence();
      k.backdrop(tree('l1c8-night'));
      quiet = k.dim(0.62, '#0b1030');
      k.ambient('stars', { count: 26, z: 36, area: [0, 0, 1180, 260] });
      // Only Moon-Face's windows still glow, very softly.
      k.light(596, 220, 70, { color: C.candle, strength: 0.4, flicker: true });
      k.light(560, 640, 40, { color: C.candle, strength: 0.3 });
    });
    k.music('spooky');
    k.fx.wind(3);
    void k.camera({ zoom: 1.3, x: 590, y: 300 }, 4);
    await k.say('night');
    // The camera creeps up into the empty cloud.
    await k.camera({ zoom: 1.8, x: 590, y: 150 }, 2.6);
    k.silence();
    void k.say('clack');
    await k.wait(900);
    heels(5, 0.62);
    await k.wait(3600);

    // SNAP! It rings round and round the clouds.
    rulerSnap();
    const word = k.add(snapWord(), { x: 430, y: 40, w: 320, z: 60 });
    k.set(word, { opacity: 0 });
    void k.quake(6);
    void k.to(quiet, 0.2, { opacity: 0.72 });
    await k.appear(word, 0.2);
    await k.shake(word, 6, 2);
    await k.wait(900);
    void k.fade(word, 0, 1.2);
    await k.wait(400);
    sting();
    void k.camera({ zoom: 1.95, x: 590, y: 140 }, 4);
    await k.say('ruler');

    // Cut to black.
    const black = k.add(blackArt(), { x: 0, y: 0, w: 1180, h: 820, z: 90, still: true });
    k.set(black, { opacity: 0 });
    await k.to(black, 1.6, { opacity: 1, ease: 'none' });
    await k.wait(1500);
  },
});
