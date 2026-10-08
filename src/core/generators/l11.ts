/**
 * Generators for land 11, the Old Woman's Shoe: `tally`, `change`.
 * Each follows its skill's tiers in core/skills.ts (concrete → pictorial →
 * abstract) and the conventions in the header of generators/more.ts.
 *
 * SCAFFOLD: the land 11 maths workstream writes these. Until then the
 * skills use the stand-in generator in generators/index.ts.
 */
import type { SkillId } from '../skills';
import type { Generator } from './helpers';

export const L11: Partial<Record<SkillId, Generator>> = {};
