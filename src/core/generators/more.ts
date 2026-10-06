/**
 * Generators owned by workstream W1c (docs/ROADMAP.md). Add each skill's
 * generator to MORE; generators/index.ts picks them up.
 */
import type { SkillId } from '../skills';
import type { Generator } from './helpers';

export const MORE: Partial<Record<SkillId, Generator>> = {};
