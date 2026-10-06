/**
 * Counting props: 120 × 120 paper cut-outs (pop biscuits, acorns,
 * saucepans …), used by problems and stories.
 *
 * SCAFFOLD: each is a simple stand-in (a coloured shape with one detail).
 * Workstream W3 draws them properly. Keep each one distinct in colour AND
 * shape, so objects are easy to tell apart and to count.
 */
import type { PropId } from '../core/problem';
import { C } from './palette';
import { circle, ellipse, piece, poly, rect, svg, type Node } from './paper';

type Look = Node[];

const LOOKS: Record<PropId, Look> = {
  popBiscuit: [piece(circle(60, 60, 44), C.tan), piece(circle(60, 60, 30), C.sand, { shadow: false })],
  toffee: [piece(rect(28, 40, 64, 40, 8), C.gold), piece(poly([[28, 60], [8, 44], [8, 76]]), C.goldLight), piece(poly([[92, 60], [112, 44], [112, 76]]), C.goldLight)],
  acorn: [piece(ellipse(60, 72, 30, 36), C.wood), piece(ellipse(60, 40, 36, 16), C.brownDark)],
  saucepan: [piece(ellipse(54, 64, 40, 30), C.stone), piece(rect(90, 58, 26, 10, 4), C.greyDark)],
  toadstool: [piece(rect(48, 60, 24, 44, 6), C.cream), piece(ellipse(60, 52, 48, 28), C.red), piece(circle(46, 44, 6), C.white, { shadow: false }), piece(circle(72, 40, 5), C.white, { shadow: false })],
  apple: [piece(circle(60, 66, 40), C.red), piece(ellipse(72, 22, 12, 6, -0.5), C.green)],
  cushion: [piece(rect(18, 34, 84, 56, 18), C.plum)],
  teacup: [piece(poly([[24, 40], [96, 40], [84, 96], [36, 96]]), C.white), piece(ellipse(102, 64, 12, 16), C.white)],
  hat: [piece(poly([[60, 8], [98, 92], [22, 92]]), C.purple), piece(rect(10, 88, 100, 14, 6), C.purple)],
  googleBun: [piece(ellipse(60, 66, 48, 34), C.orange), piece(ellipse(60, 52, 30, 12), C.cream, { shadow: false })],
  jelly: [piece(poly([[30, 96], [36, 36], [84, 36], [90, 96]]), C.rose), piece(ellipse(60, 36, 24, 8), C.pink, { shadow: false })],
  candle: [piece(rect(46, 40, 28, 70, 4), C.blue), piece(ellipse(60, 28, 10, 16), C.candle)],
  present: [piece(rect(20, 36, 80, 70, 4), C.green), piece(rect(54, 36, 12, 70), C.gold, { shadow: false })],
  balloon: [piece(ellipse(60, 50, 34, 42), C.red), piece(rect(58, 92, 4, 26), C.ink, { edge: 'clean', shadow: false })],
  stick: [piece(rect(54, 6, 12, 108, 4), C.wood, { edge: 'cut' })],
  button: [piece(circle(60, 60, 42), C.teal), piece(circle(50, 50, 6), C.ink, { shadow: false }), piece(circle(70, 70, 6), C.ink, { shadow: false })],
  potion: [piece(circle(60, 76, 34), C.purple), piece(rect(50, 18, 20, 30, 4), C.sky)],
  star: [piece(poly([[60, 8], [74, 44], [112, 46], [82, 70], [92, 108], [60, 86], [28, 108], [38, 70], [8, 46], [46, 44]]), C.gold)],
  soldier: [piece(rect(42, 40, 36, 70, 6), C.red), piece(circle(60, 30, 16), C.skin), piece(rect(46, 2, 28, 22, 3), C.ink)],
  teddy: [piece(circle(60, 70, 36), C.tan), piece(circle(32, 34, 14), C.tan), piece(circle(88, 34, 14), C.tan)],
  snowball: [piece(circle(60, 60, 40), C.white)],
  sledge: [piece(rect(16, 44, 88, 26, 6), C.red), piece(rect(16, 82, 92, 8, 4), C.greyDark)],
  icicle: [piece(poly([[40, 10], [80, 10], [60, 112]]), C.sky)],
  key: [piece(circle(36, 60, 22), C.gold), piece(rect(54, 54, 56, 12, 3), C.gold), piece(rect(92, 64, 10, 18), C.gold)],
};

export function prop(id: PropId): string {
  return svg({ w: 120, h: 120, name: 'prop-' + id, boil: false }, LOOKS[id]);
}
