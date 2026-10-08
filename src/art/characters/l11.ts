/**
 * The host of land 11, the Old Woman's Shoe: `oldWoman`.
 *
 * SCAFFOLD: a stand-in (another portrait) until the land 11 art workstream
 * draws a real one, following the conventions in parts.ts and lands.ts:
 * 300 × 340, the face inside the box 78 62 144 144, with `data-part`
 * groups for eyes, mouth and arms.
 */
import { lands } from './lands';

export const L11_CHARACTERS: Record<string, () => string> = {
  oldWoman: lands.topsy,
};
