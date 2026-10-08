/**
 * The `turn` visual (land 13, Roundabouts): something with a clear front (a carousel horse, an arrow) facing a way, with a curved arrow for the turn (clockwise or anticlockwise), or a short path of moves on a grid.
 *
 * SCAFFOLD: a stand-in label until the land 13 maths workstream draws it.
 */
import type { Node } from '../../art/paper';
import type { Visual } from '../../core/problem';
import { label } from '../visual';

export function turnNodes(_v: Extract<Visual, { type: 'turn' }>, w: number, hgt: number): Node[] {
  return [label(w / 2, hgt / 2, 'turn', 40)];
}
