/**
 * Activities owned by workstream W2c: clock, coins, shape.
 * Register each factory here; activities/index.ts picks them up.
 */
import type { ActivityKind } from '../core/problem';
import { clock } from './clock';
import { coins } from './coins';
import { shape } from './shape';
import type { ActivityFactory } from './types';

export const SET_C: Partial<Record<ActivityKind, ActivityFactory>> = { clock, coins, shape };
