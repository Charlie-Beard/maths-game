/**
 * Generators for land 14, the Land of the Red Goblins: `compare-measures`, `read-scales`.
 * Each follows its skill's tiers in core/skills.ts (concrete → pictorial →
 * abstract) and the conventions in the header of generators/more.ts.
 *
 * SCAFFOLD: the land 14 maths workstream writes these. Until then the
 * skills use the stand-in generator in generators/index.ts.
 */
import type { SkillId } from '../skills';
import type { Generator } from './helpers';

export const L14: Partial<Record<SkillId, Generator>> = {};
