/**
 * The `tally` visual (land 11, The Old Woman's Shoe): a tally chart (marks in gates of five) or a pictogram (rows of pictures, with a key when one picture stands for more than one).
 *
 * SCAFFOLD: a stand-in label until the land 11 maths workstream draws it.
 */
import type { Node } from '../../art/paper';
import type { Visual } from '../../core/problem';
import { label } from '../visual';

export function tallyNodes(_v: Extract<Visual, { type: 'tally' }>, w: number, hgt: number): Node[] {
  return [label(w / 2, hgt / 2, 'tally', 40)];
}
