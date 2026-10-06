/** Stories for land 2 (workstreams W5-2 and W6). Add one line per story file. */
import type { Loader } from './types';

export const L2: Record<string, Loader> = {
  l2c1: () => import('../l2c1'),
  l2c2: () => import('../l2c2'),
};
