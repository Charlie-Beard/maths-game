/**
 * Generators owned by workstream W1a (docs/ROADMAP.md). Add each skill's
 * generator to NUMBER; generators/index.ts picks them up.
 */
import type { SkillId } from '../skills';
import type { Generator } from './helpers';

export const NUMBER: Partial<Record<SkillId, Generator>> = {};
