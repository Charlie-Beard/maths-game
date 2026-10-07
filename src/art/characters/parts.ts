/**
 * Shared pieces for the character portraits.
 *
 * Every portrait is 300 × 340, head and shoulders, with the face inside the
 * box 78 62 144 144 (caption chips crop to exactly that box, so the eyes and
 * mouth must sit well inside it). Faces are centred on HEAD.
 *
 * Portraits are puppets: their moving bits are `data-part` groups that
 * stories can find and animate. The common ones, on every person built with
 * `person()`:
 *
 *   figure     everything (bob, lean, shake)
 *   head       the head and all it carries; pivots at the neck (nod, tilt)
 *   eyes       the open eyes (look about: nudge x)
 *   lids       eyelids, hidden (opacity 0): show them for a blink
 *   brows      the eyebrows (raise in surprise: nudge y)
 *   mouth      the resting mouth
 *   mouthOpen  an open, talking mouth, hidden (opacity 0): swap with mouth
 *   hat        whatever is on top (lift it off, wobble it)
 *   armL armR  arms on the viewer's left and right; each pivots at its
 *              shoulder (wave, point, shake a fist)
 *
 * Characters add their own (wings, pots, tub, zzz, drum, ruler …), listed
 * in the comment above each portrait.
 */
import { C } from '../palette';
import { band, circle, curve, dot, ellipse, group, ink, piece, poly, svg, type Node, type PieceOpts, type Pt } from '../paper';

export const W = 300;
export const H = 340;
/** Centre of the face: the middle of the chip box 78 62 144 144. */
export const HEAD: Pt = [150, 136];
export const [cx, cy] = HEAD;

/** No fibre and no shadow: flat details printed on a piece (cheeks, pupils). */
export const FLAT: PieceOpts = { edge: 'cut', fibre: false, shadow: false };
/** Scissor-cut with a shadow but no fibre: small cut shapes (buttons, noses). */
export const CUT: PieceOpts = { edge: 'cut', fibre: false };

/** Wraps a portrait's pieces in the standard 300 × 340 SVG. */
export const portrait = (name: string, label: string, nodes: Node[]): string =>
  svg({ w: W, h: H, name, label, className: 'portrait' }, nodes);

/**
 * Clips pieces to the portrait's frame. The paper SVG has overflow visible
 * (so torn edges are never shaved off), which lets very big shapes (the
 * giant's face, the snowman's body) spill out of the picture on stage.
 * Note: a group's `origin` also centres its `transform`, so transforms on
 * groups with an origin are written without a centre (rotate(8), not
 * rotate(8 150 200)).
 */
export function framed(id: string, nodes: Node[]): Node {
  return (ctx) =>
    `<clipPath id="frame-${id}"><rect x="-6" y="-6" width="${W + 12}" height="${H + 6}"/></clipPath><g clip-path="url(#frame-${id})">${nodes.map((n) => n(ctx)).join('')}</g>`;
}

/** A soft shadow on the floor under a figure. */
export const floor = (rx = 120, y = 334): Node => piece(ellipse(150, y, rx, 12), 'rgba(40,25,10,0.16)', FLAT);

/** A five-pointed star outline. */
export function star(x: number, y: number, r: number, rot = 0): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < 10; i++) {
    const a = ((rot - 90 + i * 36) * Math.PI) / 180;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
  }
  return pts;
}

/**
 * One fluffy, scalloped shape (curly hair, beards, suds, clouds): an outline
 * through `pts` with a bump between every pair of points.
 */
export function fluff(pts: Pt[], color: string, bump = 14, o: PieceOpts = {}): Node {
  let sx = 0;
  let sy = 0;
  for (const [x, y] of pts) {
    sx += x;
    sy += y;
  }
  const c: Pt = [sx / pts.length, sy / pts.length];
  const out: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const len = Math.hypot(mx - c[0], my - c[1]) || 1;
    out.push(a, [mx + ((mx - c[0]) / len) * bump, my + ((my - c[1]) / len) * bump]);
  }
  return piece(curve(out, 3), color, { rough: 1.2, ...o });
}

/** Points round a circle, for closed ink loops (glasses, rings). */
export function ring(x: number, y: number, r: number, n = 20): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [x + Math.cos(a) * r, y + Math.sin(a) * r] as Pt;
  });
}

// ---------------------------------------------------------------------------
// Faces
// ---------------------------------------------------------------------------

export type EyeStyle = 'round' | 'big' | 'dot' | 'shut' | 'happy' | 'narrow' | 'none';
export type BrowStyle = 'kind' | 'raised' | 'cross' | 'worried' | 'none';
export type NoseStyle = 'button' | 'round' | 'long' | 'pointy' | 'none';
export type MouthStyle = 'smile' | 'grin' | 'beam' | 'flat' | 'frown' | 'o' | 'snore' | 'pinched' | 'sneer' | 'none';

export interface FaceOpts {
  skin: string;
  /** Face centre (default HEAD). */
  at?: Pt;
  /** Scale of the features (1 = a child's face). */
  scale?: number;
  eyes?: EyeStyle;
  eyeCol?: string;
  /** Half the distance between the eyes. */
  eyeDx?: number;
  /** Eyes' height relative to the centre. */
  eyeY?: number;
  brows?: BrowStyle;
  browCol?: string;
  /** Brows' height relative to the eyes. */
  browY?: number;
  nose?: NoseStyle;
  noseCol?: string;
  mouth?: MouthStyle;
  /** Mouth height relative to the centre. */
  mouthY?: number;
  /** Rosy cheeks: true, a colour, or false. */
  cheeks?: boolean | string;
  freckles?: boolean;
  /** Leave out the hidden talking mouth. */
  noTalk?: boolean;
  /** Leave out the hidden blink lids. */
  noBlink?: boolean;
}

/** The eyes (in a `data-part="eyes"` group) and their hidden blink lids. */
export function eyes(o: FaceOpts, part = 'eyes'): Node[] {
  const [x0, y0] = o.at ?? HEAD;
  const s = o.scale ?? 1;
  const dx = (o.eyeDx ?? 26) * s;
  const y = y0 + (o.eyeY ?? 0) * s;
  const col = o.eyeCol ?? C.brownDark;
  const style = o.eyes ?? 'round';
  if (style === 'none') return [];
  const one = (x: number, side: number): Node[] => {
    switch (style) {
      case 'dot':
        return [piece(ellipse(x, y, 8 * s, 9.5 * s), C.ink, { edge: 'clean', shadow: false }), dot(x - 2.5 * s, y - 3.5 * s, 2.6 * s, C.white)];
      case 'shut':
        return [
          ink([[x - 11 * s, y - 1 * s], [x, y + 6 * s], [x + 11 * s, y - 1 * s]], { width: 3.2 * s, color: C.ink }),
          ink([[x + side * 11 * s, y - 1 * s], [x + side * 15 * s, y - 4 * s]], { width: 2.4 * s, color: C.ink }),
        ];
      case 'happy':
        return [ink([[x - 11 * s, y + 3 * s], [x, y - 6 * s], [x + 11 * s, y + 3 * s]], { width: 3.6 * s, color: C.ink })];
      case 'narrow':
        return [
          piece(curve([[x - 14 * s, y + 1 * s], [x, y - 7 * s], [x + 14 * s, y + 1 * s], [x, y + 6 * s]], 2), C.white, FLAT),
          piece(circle(x + side * -1.5 * s, y, 4.6 * s), col, { edge: 'clean', shadow: false }),
          piece(circle(x + side * -1.5 * s, y, 2.2 * s), C.ink, { edge: 'clean', shadow: false }),
          ink([[x - 15 * s, y + 1 * s], [x, y - 7.5 * s], [x + 15 * s, y]], { width: 3.4 * s, color: C.ink }),
        ];
      default: {
        const r = (style === 'big' ? 14 : 11) * s;
        return [
          piece(ellipse(x, y, r, r * 1.1), C.white, FLAT),
          piece(circle(x + side * -0.8 * s, y + 1.5 * s, r * 0.64), col, { edge: 'clean', shadow: false }),
          piece(circle(x + side * -0.8 * s, y + 1.5 * s, r * 0.34), C.ink, { edge: 'clean', shadow: false }),
          dot(x - r * 0.28, y - r * 0.22, r * 0.22, C.white),
        ];
      }
    }
  };
  const out: Node[] = [group({ part, origin: [x0, y] }, [...one(x0 - dx, -1), ...one(x0 + dx, 1)])];
  if (!o.noBlink && part === 'eyes' && style !== 'shut' && style !== 'happy') {
    const lid = (x: number): Node[] => [
      piece(ellipse(x, y, 15 * s, 14 * s), o.skin, { edge: 'cut', fibre: false, shadow: false }),
      ink([[x - 12 * s, y + 1 * s], [x, y + 6 * s], [x + 12 * s, y + 1 * s]], { width: 2.8 * s, color: C.ink }),
    ];
    out.push(group({ part: 'lids', opacity: 0 }, [...lid(x0 - dx), ...lid(x0 + dx)]));
  }
  return out;
}

export function brows(o: FaceOpts): Node[] {
  const [x0, y0] = o.at ?? HEAD;
  const s = o.scale ?? 1;
  const color = o.browCol ?? C.brownDark;
  const dx = (o.eyeDx ?? 26) * s;
  const y = y0 + ((o.eyeY ?? 0) + (o.browY ?? -20)) * s;
  const w = 4.6 * s;
  const pair = (l: Pt[]): Node =>
    group({ part: 'brows', origin: [x0, y] }, [
      ink(l.map(([x, yy]) => [x0 - dx + x * s, y + yy * s] as Pt), { width: w, color }),
      ink(l.map(([x, yy]) => [x0 + dx - x * s, y + yy * s] as Pt).reverse(), { width: w, color }),
    ]);
  switch (o.brows ?? 'kind') {
    case 'none':
      return [];
    case 'raised':
      return [pair([[-13, 0], [0, -8], [13, -3]])];
    case 'cross':
      return [pair([[-15, -6], [0, -1], [13, 6]])];
    case 'worried':
      return [pair([[-14, 4], [0, -2], [12, -8]])];
    default:
      return [pair([[-13, 1], [0, -4], [13, -1]])];
  }
}

export function nose(o: FaceOpts): Node[] {
  const [x0, y0] = o.at ?? HEAD;
  const s = o.scale ?? 1;
  const y = y0 + 22 * s;
  const shade = o.noseCol ?? 'rgba(120,60,30,0.38)';
  switch (o.nose ?? 'button') {
    case 'none':
      return [];
    case 'round':
      return [piece(ellipse(x0, y, 11 * s, 9 * s), o.skin, CUT), dot(x0 - 4 * s, y - 3 * s, 2.5 * s, C.white, 0.5)];
    case 'long':
      return [ink([[x0 + 2 * s, y - 16 * s], [x0 - 5 * s, y + 4 * s], [x0 + 6 * s, y + 6 * s]], { width: 3 * s, color: shade })];
    case 'pointy':
      return [piece(poly([[x0 - 2 * s, y - 18 * s], [x0 + 20 * s, y + 6 * s], [x0 - 4 * s, y + 6 * s]]), o.skin, CUT)];
    default:
      return [ink([[x0 - 6 * s, y], [x0, y + 4 * s], [x0 + 6 * s, y]], { width: 3 * s, color: shade })];
  }
}

/** A mouth by style, positioned at (x, y). */
export function mouthShape(style: MouthStyle, x: number, y: number, s = 1): Node[] {
  const lip = C.redDark;
  switch (style) {
    case 'none':
      return [];
    case 'grin':
      return [
        piece(curve([[x - 22 * s, y - 4 * s], [x + 22 * s, y - 4 * s], [x + 12 * s, y + 12 * s], [x - 12 * s, y + 12 * s]], 2), lip, FLAT),
        piece(curve([[x - 15 * s, y - 3 * s], [x + 15 * s, y - 3 * s], [x + 12 * s, y + 2 * s], [x - 12 * s, y + 2 * s]], 1), C.white, { edge: 'clean', shadow: false }),
        piece(ellipse(x, y + 7 * s, 8 * s, 3.5 * s), C.rose, { edge: 'clean', shadow: false }),
      ];
    case 'beam':
      return [
        piece(curve([[x - 30 * s, y - 8 * s], [x + 30 * s, y - 8 * s], [x + 18 * s, y + 14 * s], [x - 18 * s, y + 14 * s]], 2), lip, FLAT),
        piece(curve([[x - 22 * s, y - 7 * s], [x + 22 * s, y - 7 * s], [x + 18 * s, y - 1 * s], [x - 18 * s, y - 1 * s]], 1), C.white, { edge: 'clean', shadow: false }),
        piece(ellipse(x, y + 8 * s, 11 * s, 4.5 * s), C.rose, { edge: 'clean', shadow: false }),
      ];
    case 'flat':
      return [ink([[x - 12 * s, y + 2 * s], [x + 12 * s, y + 2 * s]], { width: 3.4 * s, color: lip })];
    case 'frown':
      return [ink([[x - 15 * s, y + 6 * s], [x, y], [x + 15 * s, y + 6 * s]], { width: 3.6 * s, color: lip })];
    case 'o':
      return [piece(ellipse(x, y + 3 * s, 9 * s, 11 * s), lip, FLAT), piece(ellipse(x, y + 8 * s, 6 * s, 3 * s), C.rose, { edge: 'clean', shadow: false })];
    case 'snore':
      return [piece(ellipse(x, y + 3 * s, 11 * s, 8 * s), lip, FLAT), piece(ellipse(x, y + 7 * s, 7 * s, 2.5 * s), C.rose, { edge: 'clean', shadow: false })];
    case 'pinched':
      return [
        ink([[x - 9 * s, y + 2 * s], [x - 3 * s, y], [x + 3 * s, y], [x + 9 * s, y + 2 * s]], { width: 3.4 * s, color: lip }),
        ink([[x - 13 * s, y - 2 * s], [x - 11 * s, y + 4 * s]], { width: 1.8 * s, color: 'rgba(60,40,30,0.5)' }),
        ink([[x + 13 * s, y - 2 * s], [x + 11 * s, y + 4 * s]], { width: 1.8 * s, color: 'rgba(60,40,30,0.5)' }),
      ];
    case 'sneer':
      return [ink([[x - 16 * s, y + 4 * s], [x - 4 * s, y + 2 * s], [x + 8 * s, y - 1 * s], [x + 16 * s, y - 6 * s]], { width: 3.6 * s, color: lip })];
    default:
      return [ink([[x - 17 * s, y], [x, y + 9 * s], [x + 17 * s, y]], { width: 3.6 * s, color: lip })];
  }
}

/** An open, talking mouth. */
export function talkShape(x: number, y: number, s = 1): Node[] {
  return [
    piece(curve([[x - 15 * s, y - 2 * s], [x + 15 * s, y - 2 * s], [x + 10 * s, y + 15 * s], [x - 10 * s, y + 15 * s]], 2), C.redDark, FLAT),
    piece(ellipse(x, y + 10 * s, 8 * s, 4 * s), C.rose, { edge: 'clean', shadow: false }),
    piece(curve([[x - 10 * s, y - 1 * s], [x + 10 * s, y - 1 * s], [x + 8 * s, y + 3 * s], [x - 8 * s, y + 3 * s]], 1), C.white, { edge: 'clean', shadow: false }),
  ];
}

/** The mouth, plus its hidden talking twin. */
export function mouth(o: FaceOpts): Node[] {
  const [x0, y0] = o.at ?? HEAD;
  const s = o.scale ?? 1;
  const y = y0 + (o.mouthY ?? 42) * s;
  const out: Node[] = [group({ part: 'mouth', origin: [x0, y] }, mouthShape(o.mouth ?? 'smile', x0, y, s))];
  if (!o.noTalk) out.push(group({ part: 'mouthOpen', origin: [x0, y], opacity: 0 }, talkShape(x0, y, s)));
  return out;
}

export function cheeks(o: FaceOpts): Node[] {
  if (o.cheeks === false) return [];
  const [x0, y0] = o.at ?? HEAD;
  const s = o.scale ?? 1;
  const col = typeof o.cheeks === 'string' ? o.cheeks : C.pink;
  const out: Node[] = [
    piece(ellipse(x0 - 38 * s, y0 + 26 * s, 11 * s, 7 * s), col, { ...FLAT, opacity: 0.6 }),
    piece(ellipse(x0 + 38 * s, y0 + 26 * s, 11 * s, 7 * s), col, { ...FLAT, opacity: 0.6 }),
  ];
  if (o.freckles) {
    for (const [x, y] of [[-34, 18], [-26, 24], [-40, 26], [34, 18], [26, 24], [40, 26]] as const) out.push(dot(x0 + x * s, y0 + y * s, 2.2 * s, C.brown, 0.65));
  }
  return out;
}

/** All the features of a face, in drawing order. */
export const features = (o: FaceOpts): Node[] => [...cheeks(o), ...eyes(o), ...brows(o), ...nose(o), ...mouth(o)];

// ---------------------------------------------------------------------------
// Bodies
// ---------------------------------------------------------------------------

/** Shoulders and chest, the base of most portraits. `wide` widens the shoulders. */
export function torso(color: string, wide = 0, top = 228): Node {
  return piece(
    curve([[34 - wide, 345], [44 - wide, 268], [98 - wide / 2, top + 4], [150, top], [202 + wide / 2, top + 4], [256 + wide, 268], [266 + wide, 345]], 2),
    color,
  );
}

export interface ArmOpts {
  /** Shoulder (the pivot). */
  from: Pt;
  /** Elbow, optional. */
  via?: Pt;
  /** Wrist. */
  to: Pt;
  sleeve: string;
  width?: number;
  /** Hand colour, or false for none (hidden behind a prop). */
  hand?: string | false;
  handR?: number;
  /** A cuff colour at the wrist. */
  cuff?: string;
  /** Extra pieces moving with the arm (a held ruler, a drumstick). */
  holding?: Node[];
  /** Drawn before the sleeve (behind it). */
  behind?: Node[];
}

/** An arm in a `data-part` group that pivots at its shoulder. */
export function arm(part: 'armL' | 'armR', o: ArmOpts): Node {
  const pts = o.via ? [o.from, o.via, o.to] : [o.from, o.to];
  const width = o.width ?? 30;
  const kids: Node[] = [...(o.behind ?? [])];
  kids.push(piece(band(pts, width), o.sleeve));
  if (o.cuff) {
    const a = pts[pts.length - 2];
    const b = o.to;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const k = Math.max(0, 1 - 14 / len);
    kids.push(piece(band([[a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k], b], width + 4), o.cuff, CUT));
  }
  kids.push(...(o.holding ?? []));
  if (o.hand !== false) kids.push(piece(circle(o.to[0], o.to[1], o.handR ?? width * 0.48), o.hand ?? C.skin, CUT));
  return group({ part, origin: o.from }, kids);
}

/** A neck. */
export const neck = (skin: string, w = 40, top = cy + 40, h = 60): Node => piece(poly([[cx - w / 2, top], [cx + w / 2, top], [cx + w / 2 + 2, top + h], [cx - w / 2 - 2, top + h]]), skin, { fibre: false });

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

export interface PersonOpts extends FaceOpts {
  name: string;
  label: string;
  /** Behind everything: long hair, wings, a back pack. */
  back?: Node[];
  /** Shoulders and clothes. */
  body: Node[];
  /** Neck colour; false for none (high collars, beards). */
  neck?: string | false;
  /** Head size: rx, ry. */
  face?: [number, number];
  /** A custom head outline instead of the ellipse. */
  headShape?: Pt[];
  ears?: boolean | 'pointy';
  /** Behind the head but inside the head group (hair at the back, a bun). */
  behindHead?: Node[];
  /** Printed on the head under the features (shading, craters, stubble). */
  onHead?: Node[];
  /** Over the face: fringes, beards, glasses, moustaches. */
  front?: Node[];
  /** On top of the head, in a `data-part="hat"` group. */
  hat?: Node[];
  /** Arms (from `arm()`), drawn over the body and head. */
  arms?: Node[];
  /** Over everything: props, held things. */
  extra?: Node[];
  /** Head tilt in degrees, about the neck. */
  tilt?: number;
}

export function person(o: PersonOpts): string {
  const [rx, ry] = o.face ?? [58, 64];
  const neckY = cy + ry;
  const ears: Node[] = [];
  if (o.ears === 'pointy') {
    ears.push(piece(poly([[cx - rx + 8, cy - 8], [cx - rx - 30, cy - 30], [cx - rx + 4, cy + 22]]), o.skin));
    ears.push(piece(poly([[cx + rx - 8, cy - 8], [cx + rx + 30, cy - 30], [cx + rx - 4, cy + 22]]), o.skin));
  } else if (o.ears !== false) {
    ears.push(piece(ellipse(cx - rx + 2, cy + 6, 12, 17), o.skin), piece(ellipse(cx + rx - 2, cy + 6, 12, 17), o.skin));
  }
  return portrait(o.name, o.label, [
    group({ part: 'figure', origin: [150, 340] }, [
      ...(o.back ?? []),
      ...o.body,
      ...(o.neck === false ? [] : [neck(o.neck ?? o.skin, 40, neckY - 30, 52)]),
      group({ part: 'head', origin: [cx, neckY], transform: o.tilt ? `rotate(${o.tilt})` : undefined }, [
        ...(o.behindHead ?? []),
        ...ears,
        piece(o.headShape ?? ellipse(cx, cy, rx, ry), o.skin),
        ...(o.onHead ?? []),
        ...features(o),
        ...(o.front ?? []),
        ...(o.hat ? [group({ part: 'hat', origin: [cx, cy - ry] }, o.hat)] : []),
      ]),
      ...(o.arms ?? []),
      ...(o.extra ?? []),
    ]),
  ]);
}
