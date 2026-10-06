/** Stories for land 5 (workstreams W5-5 and W6). Add one line per story file. */
import type { Loader } from './types';

export const L5: Record<string, Loader> = {
  l5c1: () => import('../l5c1'),
  l5c2: () => import('../l5c2'),
};
