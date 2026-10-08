/**
 * Generators for land 12, the Land of Music (Mr Oom Boom Boom's land): `count-3s`, `time-5`.
 * Each follows its skill's tiers in core/skills.ts (concrete → pictorial →
 * abstract) and the conventions in the header of generators/more.ts.
 *
 * SCAFFOLD: the land 12 maths workstream writes these. Until then the
 * skills use the stand-in generator in generators/index.ts.
 */
import type { SkillId } from '../skills';
import type { Generator } from './helpers';

export const L12: Partial<Record<SkillId, Generator>> = {};
