/**
 * Land 12: the Land of Music, Mr Oom Boom Boom's own land. Teal and brass
 * gold and cream: a striped bandstand with a domed roof, giant instruments
 * lived in (a tuba-house, a drum-shaped hut), trumpet-flower plants, music
 * notes hanging quite still on strings, rows of little band chairs in
 * threes, and an EMPTY stand where the big drum belongs (the Red Goblins
 * take it in chapter 6, so the empty stand is part of the story).
 *
 * The middle of the lower half is left as a calm cream path for puppets.
 * Everything is still: no boil, no motion.
 *
 * Exports for stories to reuse (all draw in stage coordinates, with (x, y)
 * the bottom-centre of the thing and s a scale):
 *   bigDrum, drumStand, bandChairs, bandstand, tubaHouse, drumHut,
 *   trumpetFlower, noteString
 */
import { C } from '../palette';
import { FIBRE, band, circle, curve, ellipse, group, ink, piece, poly, rect, rng, type Node, type Pt } from '../paper';
import { cloud, farBase, farSvg, flat, hills, sceneSvg, sky, star } from './common';

// This land's own colours (palette.ts stays as it is).
export const L12 = {
  teal: '#2f8a84',
  tealDark: '#1f625e',
  tealDeep: '#143f3d',
  tealLight: '#7cc0b8',
  skyTop: '#5fb0a8',
  skyMid: '#9ad2c6',
  skyLow: '#efe6c0',
  grass: '#4f9c88',
  grassFront: '#3a8372',
  brass: '#d4a537',
  brassLight: '#f2d37c',
  brassDark: '#9c7522',
  cream: '#f6ecd0',
  path: '#eadbb0',
  drumBlue: '#3d6fa3',
  drumRed: '#b0453b',
  wood: '#a36b3f',
};

/** Draws `nodes` (made around the origin) at (x, y), scaled by s. */
const put = (x: number, y: number, s: number, nodes: Node[]): Node => group({ transform: `translate(${x} ${y}) scale(${s})` }, nodes);

/** A thin pipe or rod between points. */
const rod = (a: Pt, b: Pt, w: number, color: string): Node => piece(band([a, b], w), color, { edge: 'cut', fibre: false });

const shadow = (rx: number): Node => piece(ellipse(0, -2, rx, 12), 'rgba(40,25,10,0.16)', flat);

// ---------------------------------------------------------------------------
// The big drum and its stand
// ---------------------------------------------------------------------------

/** The big drum: blue shell, gold cords, cream head. 240 wide, 170 tall. */
export function bigDrum(x: number, y: number, s = 1): Node[] {
  return [
    put(x, y, s, [
      shadow(110),
      piece(rect(-120, -145, 240, 125), L12.drumBlue),
      piece(ellipse(0, -20, 120, 20), L12.drumBlue, { edge: 'cut' }),
      ...Array.from({ length: 8 }, (_, i) => ink([[-104 + i * 30, -130], [-89 + i * 30, -38], [-74 + i * 30, -130]], { width: 4, color: L12.brassLight })),
      piece(rect(-122, -42, 244, 12, 4), L12.cream, { edge: 'cut' }),
      piece(rect(-122, -148, 244, 14, 4), L12.cream, { edge: 'cut' }),
      piece(ellipse(0, -146, 122, 28), L12.cream, { edge: 'cut' }),
      piece(ellipse(0, -146, 104, 21), '#f9f1dc', flat),
      ink([[-70, -110], [-30, -120]], { width: 3, color: C.white, opacity: 0.5 }),
    ]),
  ];
}

/** The empty stand the big drum sits in: two trestles and a cradle. */
export function drumStand(x: number, y: number, s = 1): Node[] {
  return [
    put(x, y, s, [
      shadow(150),
      rod([-128, 0], [-80, -128], 16, C.brownDark),
      rod([-30, 0], [-80, -128], 16, C.brownDark),
      rod([128, 0], [80, -128], 16, C.brownDark),
      rod([30, 0], [80, -128], 16, C.brownDark),
      // the cradle the drum rests in
      piece(curve([[-150, -196], [-136, -140], [-60, -112], [0, -108], [60, -112], [136, -140], [150, -196], [138, -192], [124, -146], [60, -126], [0, -122], [-60, -126], [-124, -146], [-138, -192]], 1), L12.wood),
      piece(rect(-92, -136, 184, 14, 4), L12.brassDark, { edge: 'cut' }),
      piece(circle(-148, -200, 11), L12.brass, { edge: 'cut' }),
      piece(circle(148, -200, 11), L12.brass, { edge: 'cut' }),
    ]),
  ];
}

// ---------------------------------------------------------------------------
// Chairs, flowers, notes
// ---------------------------------------------------------------------------

/** One little ladder-back band chair, centred on x = 0, standing on y = 0. */
function chair(seat: string): Node[] {
  return [
    piece(ellipse(0, -1, 34, 4), 'rgba(40,25,10,0.16)', flat),
    rod([-22, -34], [-27, 0], 7, C.brownDark),
    rod([22, -34], [27, 0], 7, C.brownDark),
    rod([-24, -112], [-24, -40], 8, L12.wood),
    rod([24, -112], [24, -40], 8, L12.wood),
    piece(rect(-28, -118, 56, 12, 4), L12.wood, { edge: 'cut' }),
    piece(rect(-24, -86, 48, 8, 3), L12.wood, { edge: 'cut' }),
    piece(rect(-24, -66, 48, 7, 3), L12.wood, { edge: 'cut' }),
    piece(rect(-34, -46, 68, 15, 5), seat),
  ];
}

/** A row of band chairs (three by default), centred on x. */
export function bandChairs(x: number, y: number, s = 1, n = 3): Node[] {
  const seats = [L12.teal, L12.drumRed, L12.brass];
  const gap = 82;
  return Array.from({ length: n }, (_, i) => put(x + (i - (n - 1) / 2) * gap * s, y, s, chair(seats[i % 3])));
}

/** A trumpet flower: a stalk, two leaves and a bloom that flares like a trumpet. */
export function trumpetFlower(x: number, y: number, s = 1, bloom: string = L12.brass): Node[] {
  return [
    put(x, y, s, [
      piece(band([[0, 0], [8, -60], [-6, -120], [2, -170]], 7), C.leafDark, { edge: 'cut' }),
      piece(poly([[6, -50], [50, -86], [34, -40]]), C.leaf, { edge: 'cut' }),
      piece(poly([[-4, -90], [-48, -122], [-30, -76]]), C.leaf, { edge: 'cut' }),
      piece(poly([[-12, -166], [16, -166], [46, -236], [-42, -236]]), bloom),
      piece(ellipse(2, -236, 44, 11), bloom, { edge: 'cut' }),
      piece(ellipse(2, -236, 34, 7), L12.tealDeep, flat),
      piece(circle(2, -166, 10), L12.brassLight, { edge: 'cut' }),
    ]),
  ];
}

export type NoteKind = 'crotchet' | 'quaver' | 'pair';

/** A note hanging from (0, 0) on a thread `len` long, by its stem. */
function note(kind: NoteKind, len: number, color: string): Node[] {
  const top = len;
  const head = (cx: number, cy: number): Node => piece(ellipse(cx, cy, 13, 9.5, -22), color, { edge: 'cut' });
  const out: Node[] = [ink([[0, 0], [0, top]], { width: 1.8, color: L12.tealDeep, opacity: 0.7, wobble: 0.2 })];
  if (kind === 'pair') {
    out.push(rod([0, top], [0, top + 54], 5, color), rod([36, top + 10], [36, top + 64], 5, color));
    out.push(piece(poly([[-2, top], [38, top + 10], [38, top + 24], [-2, top + 14]]), color, { edge: 'cut' }));
    out.push(head(-11, top + 56), head(25, top + 66));
    return out;
  }
  out.push(rod([0, top], [0, top + 56], 5, color), head(-11, top + 58));
  if (kind === 'quaver') out.push(piece(curve([[0, top], [24, top + 14], [24, top + 34], [6, top + 40], [26, top + 30], [18, top + 12]], 1), color, { edge: 'cut' }));
  return out;
}

/**
 * A string slung between a and b with notes hanging still from it:
 * each is [position along the string 0..1, thread length, kind, colour].
 */
export function noteString(a: Pt, b: Pt, sag: number, notes: [number, number, NoteKind, string][], s = 1): Node[] {
  const at = (t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + Math.sin(t * Math.PI) * sag];
  const line: Pt[] = [];
  for (let i = 0; i <= 14; i++) line.push(at(i / 14));
  return [
    piece(band(line, 3 * s), C.brownDark, { edge: 'clean', shadow: false }),
    ...notes.map(([t, len, kind, col]) => {
      const [px, py] = at(t);
      return put(px, py, s, note(kind, len, col));
    }),
  ];
}

// ---------------------------------------------------------------------------
// Buildings
// ---------------------------------------------------------------------------

/** The bandstand: a stage, six posts and a striped dome. About 460 wide, 440 tall. */
export function bandstand(x: number, y: number, s = 1): Node[] {
  const stripes = 8;
  const w = 430 / stripes;
  const eaveFlags: Node[] = [];
  for (let i = 0; i < 14; i++) {
    const fx = -210 + i * 30;
    eaveFlags.push(piece(poly([[fx, -246], [fx + 26, -246], [fx + 13, -222]]), [L12.brass, L12.cream, L12.drumRed][i % 3], { edge: 'cut', fibre: false }));
  }
  return [
    put(x, y, s, [
      shadow(230),
      // steps
      piece(rect(-46, -22, 92, 22, 3), L12.path, { edge: 'cut' }),
      piece(rect(-38, -44, 76, 22, 3), L12.cream, { edge: 'cut' }),
      // the stage
      piece(rect(-190, -100, 380, 58, 3), L12.tealDark),
      ...Array.from({ length: 6 }, (_, i) => piece(rect(-170 + i * 66, -92, 44, 42, 20), L12.teal, { edge: 'cut', fibre: false })),
      piece(rect(-198, -108, 396, 12, 4), L12.brass, { edge: 'cut' }),
      // the inside, dark behind the posts
      piece(rect(-176, -250, 352, 142), L12.tealDeep, { edge: 'cut', fibre: false }),
      // railing
      ...Array.from({ length: 12 }, (_, i) => rod([-160 + i * 29, -108], [-160 + i * 29, -150], 5, L12.cream)),
      piece(rect(-180, -156, 360, 9, 3), L12.brass, { edge: 'cut' }),
      // posts
      ...Array.from({ length: 6 }, (_, i) => piece(rect(-182 + i * 73, -254, 14, 150, 3), i % 2 ? L12.cream : L12.brassLight, { edge: 'cut' })),
      // the striped dome: wedges from the top down to the eaves, bowed at the sides
      ...Array.from({ length: stripes }, (_, i) => {
        const x0 = -215 + i * w;
        const pts: Pt[] = [[0, -378]];
        const side = (t: number, sign: number): Pt => [sign * (215 * t + 26 * Math.sin(Math.PI * t)), -378 + 128 * t - 10 * Math.sin(Math.PI * t)];
        if (i === 0) for (let k = 0; k <= 4; k++) pts.push(side(k / 4, -1));
        else pts.push([x0, -251]);
        if (i === stripes - 1) for (let k = 4; k >= 0; k--) pts.push(side(k / 4, 1));
        else pts.push([x0 + w, -251]);
        return piece(poly(pts), i % 2 ? L12.cream : L12.teal, { edge: 'cut', fibre: i === 0 ? FIBRE : false, rough: 0.6 });
      }),
      piece(rect(-228, -264, 456, 16, 5), L12.brass),
      ...eaveFlags,
      // the finial: a pole, a brass ball and a little flag
      rod([0, -376], [0, -430], 6, L12.brassDark),
      piece(circle(0, -434, 12), L12.brass),
      piece(poly([[4, -428], [40, -420], [4, -408]]), L12.drumRed, { edge: 'cut' }),
    ]),
  ];
}

/** A house that is a tuba: the coil is the room, the bell rises above. About 280 wide, 380 tall. */
export function tubaHouse(x: number, y: number, s = 1): Node[] {
  return [
    put(x, y, s, [
      shadow(120),
      // pistons behind the coil
      ...[20, 48, 76].flatMap((px) => [rod([px, -190], [px, -262], 16, L12.brassDark), piece(circle(px, -268, 11), L12.cream, { edge: 'cut' })]),
      // the bell, rising on the left
      rod([-96, -170], [-98, -262], 26, L12.brass),
      piece(poly([[-120, -250], [-76, -250], [-12, -366], [-182, -366]]), L12.brass),
      piece(ellipse(-97, -366, 86, 16), L12.brassLight, { edge: 'cut' }),
      piece(ellipse(-97, -366, 70, 10), L12.tealDeep, flat),
      // the coil, with a lit room inside
      piece(circle(0, -110, 110), L12.brass),
      ink(circle(0, -110, 94), { width: 5, color: L12.brassDark, closed: true, opacity: 0.7 }),
      piece(circle(0, -110, 76), L12.brassDark, { edge: 'cut', fibre: false }),
      piece(circle(0, -110, 66), C.candle, { edge: 'cut', fibre: false }),
      // round window and door
      piece(circle(0, -148, 20), L12.tealLight, { edge: 'cut', fibre: false }),
      ink([[-20, -148], [20, -148]], { width: 3, color: L12.brassDark }),
      ink([[0, -168], [0, -128]], { width: 3, color: L12.brassDark }),
      piece(rect(-27, -76, 54, 76, 27), C.brownDark, { edge: 'cut' }),
      piece(circle(14, -36, 4), L12.brassLight, { edge: 'clean', shadow: false }),
      ink([[-84, -170], [-70, -192]], { width: 5, color: C.white, opacity: 0.5 }),
    ]),
  ];
}

/** A hut that is a drum: red shell, gold cords, a little teal hat. About 210 wide, 290 tall. */
export function drumHut(x: number, y: number, s = 1): Node[] {
  return [
    put(x, y, s, [
      shadow(120),
      piece(rect(-100, -176, 200, 176), L12.drumRed),
      ...Array.from({ length: 9 }, (_, i) => ink([[-96 + i * 24, -160], [-84 + i * 24, -24], [-72 + i * 24, -160]], { width: 4, color: L12.brassLight })),
      piece(rect(-104, -184, 208, 18, 5), L12.cream, { edge: 'cut' }),
      piece(rect(-104, -26, 208, 16, 5), L12.cream, { edge: 'cut' }),
      // roof: a little teal cone on the drum head
      piece(ellipse(0, -188, 108, 20), L12.cream, { edge: 'cut' }),
      piece(poly([[-96, -190], [0, -282], [96, -190]]), L12.teal),
      piece(circle(0, -286, 9), L12.brass, { edge: 'cut' }),
      // door and windows
      piece(rect(-28, -92, 56, 68, 28), L12.drumBlue, { edge: 'cut' }),
      piece(circle(12, -54, 4), L12.brassLight, { edge: 'clean', shadow: false }),
      piece(circle(-66, -118, 20), C.candle, { edge: 'cut', fibre: false }),
      piece(circle(66, -118, 20), C.candle, { edge: 'cut', fibre: false }),
      ink([[-86, -118], [-46, -118]], { width: 3, color: L12.brassDark }),
      ink([[46, -118], [86, -118]], { width: 3, color: L12.brassDark }),
    ]),
  ];
}

// ---------------------------------------------------------------------------
// The two pictures
// ---------------------------------------------------------------------------

export function farNodes(): Node[] {
  const base = farBase(L12.grass, 1201, { cloud: '#f2eddc', shade: '#d5cfbc' });
  return [
    ...base.back,
    ...noteString([52, 30], [550, 24], 22, [[0.12, 8, 'crotchet', L12.brass], [0.3, 18, 'pair', L12.cream], [0.5, 4, 'quaver', L12.brassLight], [0.7, 16, 'crotchet', L12.cream], [0.88, 6, 'pair', L12.brass]], 0.36),
    ...trumpetFlower(40, 150, 0.26, L12.brass),
    ...tubaHouse(112, 146, 0.2),
    ...trumpetFlower(206, 146, 0.24, L12.drumRed),
    ...drumStand(378, 145, 0.14),
    ...bandstand(300, 146, 0.2),
    ...bandChairs(222, 150, 0.14),
    ...drumHut(480, 146, 0.2),
    ...trumpetFlower(560, 150, 0.26, L12.teal),
    ...base.front,
  ];
}

export const landFar = (name: string): string => farSvg(name, farNodes(), 'The Land of Music');

export function landScene(name: string): string {
  const r = rng(1212);
  const dots: Node[] = [];
  for (let i = 0; i < 9; i++) dots.push(piece(star(60 + r() * 1060, 60 + r() * 120, 3 + r() * 3, 1.6, 4), L12.cream, { ...flat, opacity: 0.5 }));
  return sceneSvg(name, [
    ...sky([
      [L12.skyTop, 0],
      [L12.skyMid, 200],
      [L12.skyLow, 400],
    ]),
    ...dots,
    // a warm brass sun and soft clouds
    piece(circle(930, 160, 70), L12.brassLight, { ...flat, opacity: 0.55 }),
    piece(circle(930, 160, 46), L12.brass, { ...flat, opacity: 0.9 }),
    cloud(240, 110, 300, 1, '#f6f1e0', 0.9),
    cloud(700, 70, 260, 2, '#f6f1e0', 0.85),
    // faraway teal hills
    hills(480, 60, '#74b8ac', 1213),
    hills(530, 40, '#5aa597', 1214, { step: 120 }),
    // the bandstand, middle distance
    ...bandstand(560, 570, 0.8),
    // ground
    hills(590, 24, L12.grass, 1215, { step: 110 }),
    ...tubaHouse(170, 660, 0.9),
    ...bandChairs(408, 668, 0.65),
    ...trumpetFlower(330, 650, 0.9, L12.drumRed),
    // the empty drum stand, where the big drum belongs
    ...drumStand(795, 640, 0.8),
    ...drumHut(1010, 660, 0.9),
    // a calm cream path to the bandstand, left clear for puppets
    piece(poly([[548, 584], [612, 584], [800, 840], [340, 840]]), L12.path, { rough: 1.2, shadow: false }),
    hills(760, 30, L12.grassFront, 1216, { step: 150 }),
    ...bandChairs(110, 800, 0.85),
    ...trumpetFlower(1150, 815, 1.2, L12.brass),
    ...trumpetFlower(960, 815, 0.7, L12.teal),
    // notes hung still on strings across the sky
    ...noteString([-10, 130], [560, 250], 60, [[0.15, 14, 'crotchet', L12.cream], [0.35, 40, 'pair', L12.brass], [0.55, 18, 'quaver', L12.cream], [0.8, 8, 'crotchet', L12.brassLight]]),
    ...noteString([560, 250], [1190, 110], 70, [[0.2, 20, 'quaver', L12.brassLight], [0.4, 44, 'crotchet', L12.cream], [0.62, 12, 'pair', L12.brass], [0.85, 34, 'quaver', L12.cream]]),
  ]);
}
