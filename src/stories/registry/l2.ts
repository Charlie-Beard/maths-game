/** Stories for land 2 (workstreams W5-2 and W6). Add one line per story file. */
import type { Loader } from './types';

export const L2: Record<string, Loader> = {
  l2c1: () => import('../l2c1'),
  l2c2: () => import('../l2c2'),
  l2c3: () => import('../l2c3'),
  l2c4: () => import('../l2c4'),
  l2c5: () => import('../l2c5'),
  l2c6: () => import('../l2c6'),
  l2c7: () => import('../l2c7'),
};
