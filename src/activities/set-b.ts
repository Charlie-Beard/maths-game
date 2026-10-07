/**
 * Activities owned by workstream W2b: compare, tensOnes, groups, share, fraction.
 * Register each factory here; activities/index.ts picks them up.
 */
import type { ActivityKind } from '../core/problem';
import { compare } from './compare';
import { fraction } from './fraction';
import { groups } from './groups';
import { share } from './share';
import { tensOnes } from './tensOnes';
import type { ActivityFactory } from './types';

export const SET_B: Partial<Record<ActivityKind, ActivityFactory>> = { compare, tensOnes, groups, share, fraction };
