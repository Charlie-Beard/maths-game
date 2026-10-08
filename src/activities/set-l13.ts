/**
 * Activities for land 13, the Land of Roundabouts. Register each factory here;
 * activities/index.ts picks them up. Kinds with no module fall back to
 * `choose`.
 */
import type { ActivityKind } from '../core/problem';
import type { ActivityFactory } from './types';

export const SET_L13: Partial<Record<ActivityKind, ActivityFactory>> = {};
