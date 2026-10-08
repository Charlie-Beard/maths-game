/**
 * The `solid` visual (land 13, Roundabouts): 3D shapes drawn in torn paper with a light and a dark side, so faces read as faces.
 *
 * SCAFFOLD: a stand-in label until the land 13 maths workstream draws it.
 */
import type { Node } from '../../art/paper';
import type { Visual } from '../../core/problem';
import { label } from '../visual';

export function solidNodes(_v: Extract<Visual, { type: 'solid' }>, w: number, hgt: number): Node[] {
  return [label(w / 2, hgt / 2, 'solid', 40)];
}
