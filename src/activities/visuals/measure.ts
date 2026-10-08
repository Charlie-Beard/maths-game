/**
 * The `measure` visual (land 14, the Red Goblins): a balance (which side is heavier), a kitchen scale dial (kg), a jug (litres) or a thermometer (°C), with clear marks and numbers.
 *
 * SCAFFOLD: a stand-in label until the land 14 maths workstream draws it.
 */
import type { Node } from '../../art/paper';
import type { Visual } from '../../core/problem';
import { label } from '../visual';

export function measureNodes(_v: Extract<Visual, { type: 'measure' }>, w: number, hgt: number): Node[] {
  return [label(w / 2, hgt / 2, 'measure', 40)];
}
