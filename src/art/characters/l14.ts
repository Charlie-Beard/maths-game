/**
 * The host of land 14, the Land of the Red Goblins: `redGoblin`.
 *
 * SCAFFOLD: a stand-in (another portrait) until the land 14 art workstream
 * draws a real one, following the conventions in parts.ts and lands.ts:
 * 300 × 340, the face inside the box 78 62 144 144, with `data-part`
 * groups for eyes, mouth and arms.
 */
import { lands } from './lands';

export const L14_CHARACTERS: Record<string, () => string> = {
  redGoblin: lands.jellyGoblin,
};
