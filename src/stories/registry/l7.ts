/** Stories for land 7 (workstreams W5-7 and W6). Add one line per story file. */
import type { Loader } from './types';

export const L7: Record<string, Loader> = {
  l7c1: () => import('../l7c1'),
  l7c2: () => import('../l7c2'),
  l7c3: () => import('../l7c3'),
  l7c4: () => import('../l7c4'),
  l7c5: () => import('../l7c5'),
  l7c6: () => import('../l7c6'),
  l7c7: () => import('../l7c7'),
};
