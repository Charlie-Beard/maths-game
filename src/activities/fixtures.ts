/** Every activity fixture (dev page ?scene=fixtures&kind=…). */
import type { ActivityKind, Problem } from '../core/problem';
import { FIXTURES_A } from './fixtures-a';
import { FIXTURES_B } from './fixtures-b';
import { FIXTURES_C } from './fixtures-c';

export const FIXTURES: Problem[] = [...FIXTURES_A, ...FIXTURES_B, ...FIXTURES_C];

export const fixturesFor = (kind: ActivityKind | null): Problem[] => FIXTURES.filter((p) => !kind || p.activity === kind);
