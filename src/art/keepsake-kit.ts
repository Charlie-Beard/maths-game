/**
 * The shared kit for keepsake drawings (keepsakes.ts and each later land's
 * keepsakes-l{n}.ts): a 200 × 200 box, torn paper, the thing he counted
 * drawn as the thing he wins.
 */
import type { PropId } from '../core/problem';
import { C } from './palette';
import { circle, curve, group, ink, piece, poly, raw, rect, type Node } from './paper';
import { ground, propNodes, shine } from './props';

export type Draw = () => Node[];

/** A prop's drawing (120 box) scaled up into the keepsake box. */
export const big = (id: PropId, s = 1.45, x = 100, y = 100): Node =>
  group({ transform: `translate(${x - 60 * s} ${y - 60 * s}) scale(${s})` }, propNodes(id, true));

/** Any nodes moved and scaled. */
export const at = (x: number, y: number, s: number, nodes: Node[], rot = 0): Node =>
  group({ transform: `translate(${x} ${y}) scale(${s})${rot ? ` rotate(${rot})` : ''}` }, nodes);

/** Andika lettering laid on the art (sums on a blackboard, £1 on a coin). */
export const text = (x: number, y: number, s: string, size: number, fill: string, rot = 0): Node =>
  raw(
    `<text x="${x}" y="${y}" font-family="Andika, sans-serif" font-weight="700" font-size="${size}" fill="${fill}" text-anchor="middle"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}>${s}</text>`,
  );

export const cut = { edge: 'cut' as const };
export const cutFlat = { edge: 'cut' as const, fibre: false as const };

/** Mixes two #rrggbb colours (t = 0 → a, 1 → b). */
export function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

/** A key, big, in any metal: the bow on the left, teeth on the right. */
export const bigKey = (metal: string, dark: string, fancy = false): Node[] => [
  ground(100, 150, 76, 8),
  piece(rect(70, 90, 112, 20, 6), metal),
  piece(poly([[140, 104], [184, 104], [184, 140], [172, 140], [172, 126], [160, 126], [160, 142], [140, 142]]), metal),
  ...(fancy
    ? [
        piece(circle(46, 76, 16), metal),
        piece(circle(46, 124, 16), metal),
        piece(circle(22, 100, 16), metal),
      ]
    : []),
  piece(circle(48, 100, 34), metal),
  piece(circle(48, 100, 15), dark, cutFlat),
  shine([[24, 90], [34, 74], [40, 78], [30, 94]], 0.45),
  ink([[80, 96], [136, 96]], { width: 3, color: mix(metal, '#ffffff', 0.4) }),
];

/** A fluffy lip of snow along the top of something. */
export const snowLip = (x0: number, x1: number, y: number): Node =>
  piece(curve([[x0, y + 4], [x0 + 8, y - 12], [(x0 + x1) / 2, y - 16], [x1 - 8, y - 12], [x1, y + 4], [(x0 + x1) / 2, y + 10]], 2), C.snow, { fibre: C.snowShade });

/** Grass tufts along the ground. */
export const grass = (pts: [number, number][]): Node[] =>
  pts.map(([x, y]) => ink([[x - 6, y - 12], [x, y], [x + 2, y - 16], [x + 4, y], [x + 10, y - 10]], { width: 3, color: C.leafDark }));

