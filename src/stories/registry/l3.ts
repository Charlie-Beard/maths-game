/** Stories for land 3 (workstreams W5-3 and W6). Add one line per story file. */
import type { Loader } from './types';

export const L3: Record<string, Loader> = {
  l3c1: () => import('../l3c1'),
  l3c2: () => import('../l3c2'),
  l3c3: () => import('../l3c3'),
  l3c4: () => import('../l3c4'),
  l3c5: () => import('../l3c5'),
};
