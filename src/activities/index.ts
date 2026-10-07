/**
 * Which module shows each activity kind. Kinds not built yet fall back to
 * `choose`, which can show any problem. Workstream W2 (docs/ROADMAP.md)
 * adds one file per activity and registers it here.
 */
import type { ActivityKind, Problem } from '../core/problem';
import { choose } from './choose';
import { SET_A } from './set-a';
import { SET_B } from './set-b';
import { SET_C } from './set-c';
import type { Activity, ActivityContext, ActivityFactory } from './types';

const ACTIVITIES: Partial<Record<ActivityKind, ActivityFactory>> = {
  choose,
  count: choose,
  ...SET_A,
  ...SET_B,
  ...SET_C,
};

export function makeActivity(p: Problem, ctx: ActivityContext): Activity {
  return (ACTIVITIES[p.activity] ?? choose)(p, ctx);
}

export const builtActivities = (): ActivityKind[] => Object.keys(ACTIVITIES) as ActivityKind[];
