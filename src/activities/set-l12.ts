/**
 * Activities for land 12, the Land of Music (Mr Oom Boom Boom's land). Register each factory here;
 * activities/index.ts picks them up. Kinds with no module fall back to
 * `choose`.
 */
import type { ActivityKind } from '../core/problem';
import type { ActivityFactory } from './types';

export const SET_L12: Partial<Record<ActivityKind, ActivityFactory>> = {};
