/**
 * Activities owned by workstream W2a: count, tenFrame, numberLine, partWhole, numberPad.
 * Register each factory here; activities/index.ts picks them up.
 */
import type { ActivityKind } from '../core/problem';
import type { ActivityFactory } from './types';

export const SET_A: Partial<Record<ActivityKind, ActivityFactory>> = {};
