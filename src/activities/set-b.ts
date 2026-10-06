/**
 * Activities owned by workstream W2b: compare, tensOnes, groups, share, fraction.
 * Register each factory here; activities/index.ts picks them up.
 */
import type { ActivityKind } from '../core/problem';
import type { ActivityFactory } from './types';

export const SET_B: Partial<Record<ActivityKind, ActivityFactory>> = {};
