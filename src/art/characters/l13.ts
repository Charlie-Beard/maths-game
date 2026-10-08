/**
 * The host of land 13, the Land of Roundabouts: `whirligig`.
 *
 * SCAFFOLD: a stand-in (another portrait) until the land 13 art workstream
 * draws a real one, following the conventions in parts.ts and lands.ts:
 * 300 × 340, the face inside the box 78 62 144 144, with `data-part`
 * groups for eyes, mouth and arms.
 */
import { lands } from './lands';

export const L13_CHARACTERS: Record<string, () => string> = {
  whirligig: lands.snowman,
};
