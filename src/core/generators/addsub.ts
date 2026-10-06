/**
 * Generators owned by workstream W1b (docs/ROADMAP.md). Add each skill's
 * generator to ADDSUB; generators/index.ts picks them up.
 */
import type { SkillId } from '../skills';
import type { Generator } from './helpers';

export const ADDSUB: Partial<Record<SkillId, Generator>> = {};
