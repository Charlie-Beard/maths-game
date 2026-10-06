/** Stories for land 1 (workstreams W5-1 and W6). Add one line per story file. */
import type { Loader } from './types';

export const L1: Record<string, Loader> = {
  l1c1: () => import('../l1c1'),
  l1c2: () => import('../l1c2'),
  l1c3: () => import('../l1c3'),
  l1c4: () => import('../l1c4'),
  l1c5: () => import('../l1c5'),
  l1c6: () => import('../l1c6'),
};
