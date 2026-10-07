/**
 * Character portraits: 300 × 340, head and shoulders, torn paper.
 *
 * One file per group (folk, family, lands, snap), all built from the
 * shared pieces in parts.ts. Every portrait keeps its face inside the box
 * 78 62 144 144, which caption chips crop to, and has `data-part` groups
 * stories can animate (listed in parts.ts and above each portrait).
 *
 * Ids match CHARACTER_NAMES in core/names.ts.
 */
import { family } from './family';
import { folk } from './folk';
import { lands } from './lands';
import { snap } from './snap';

export { dameSnapPose, type SnapPose } from './snap';
export { topsyTall } from './lands';

export const characters: Record<string, () => string> = {
  ...folk,
  ...family,
  ...lands,
  ...snap,
};

export const characterArt = (id: string): string => (characters[id] ?? characters.moonface)();
