/**
 * Generators for land 13, the Land of Roundabouts: `turns`, `shapes-3d`.
 * Each follows its skill's tiers in core/skills.ts (concrete → pictorial →
 * abstract) and the conventions in the header of generators/more.ts.
 *
 * SCAFFOLD: the land 13 maths workstream writes these. Until then the
 * skills use the stand-in generator in generators/index.ts.
 */
import type { SkillId } from '../skills';
import type { Generator } from './helpers';

export const L13: Partial<Record<SkillId, Generator>> = {};
