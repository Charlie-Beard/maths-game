/**
 * Activities for land 11, the Old Woman's Shoe. Register each factory here;
 * activities/index.ts picks them up. Kinds with no module fall back to
 * `choose`.
 */
import type { ActivityKind } from '../core/problem';
import type { ActivityFactory } from './types';

export const SET_L11: Partial<Record<ActivityKind, ActivityFactory>> = {};
