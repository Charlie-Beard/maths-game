/**
 * The art for every land, by land number (1 … 14).
 *
 *   far(name)    the land in its cloud, 600 × 180 (the map's cloud, finales)
 *   scene(name)  a 1180 × 820 ground-level backdrop for stories and finales
 *   farNodes()   the far view as paper nodes, so the tree can compose it
 *                straight into its own picture (art/scenery.ts)
 */
import { cached, type Node } from '../paper';
import * as l1 from './l1';
import * as l2 from './l2';
import * as l3 from './l3';
import * as l4 from './l4';
import * as l5 from './l5';
import * as l6 from './l6';
import * as l7 from './l7';
import * as l8 from './l8';
import * as l9 from './l9';
import * as l10 from './l10';
import * as l11 from './l11';
import * as l12 from './l12';
import * as l13 from './l13';
import * as l14 from './l14';

export interface LandArt {
  far: (name: string) => string;
  scene: (name: string) => string;
  farNodes: () => Node[];
}

const art = (m: { landFar: LandArt['far']; landScene: LandArt['scene']; farNodes: LandArt['farNodes'] }): LandArt => ({
  // Drawn once and kept: a land's reward screen is the same picture eight times over.
  far: cached(m.landFar, 4),
  scene: cached(m.landScene, 4),
  farNodes: m.farNodes,
});

export const LAND_ART: Record<number, LandArt> = {
  1: art(l1),
  2: art(l2),
  3: art(l3),
  4: art(l4),
  5: art(l5),
  6: art(l6),
  7: art(l7),
  8: art(l8),
  9: art(l9),
  10: art(l10),
  11: art(l11),
  12: art(l12),
  13: art(l13),
  14: art(l14),
};

export { FAR_H, FAR_W, SCENE_H, SCENE_W } from './common';
