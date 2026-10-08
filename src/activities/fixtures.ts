/** Every activity fixture (dev page ?scene=fixtures&kind=…). */
import type { ActivityKind, Problem } from '../core/problem';
import { FIXTURES_A } from './fixtures-a';
import { FIXTURES_B } from './fixtures-b';
import { FIXTURES_C } from './fixtures-c';
import { FIXTURES_L11 } from './fixtures-l11';
import { FIXTURES_L12 } from './fixtures-l12';
import { FIXTURES_L13 } from './fixtures-l13';
import { FIXTURES_L14 } from './fixtures-l14';

export const FIXTURES: Problem[] = [...FIXTURES_A, ...FIXTURES_B, ...FIXTURES_C, ...FIXTURES_L11, ...FIXTURES_L12, ...FIXTURES_L13, ...FIXTURES_L14];

export const fixturesFor = (kind: ActivityKind | null): Problem[] => FIXTURES.filter((p) => !kind || p.activity === kind);
