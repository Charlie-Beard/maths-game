/**
 * Activities for land 14, the Land of the Red Goblins. Register each factory here;
 * activities/index.ts picks them up. Kinds with no module fall back to
 * `choose`.
 */
import type { ActivityKind } from '../core/problem';
import { measure } from './measure';
import type { ActivityFactory } from './types';

export const SET_L14: Partial<Record<ActivityKind, ActivityFactory>> = { measure };
