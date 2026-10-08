/** Stories for land 8 (workstreams W5-8 and W6). Add one line per story file. */
import type { Loader } from './types';

export const L8: Record<string, Loader> = {
  l8c1: () => import('../l8c1'),
  l8c2: () => import('../l8c2'),
  l8c3: () => import('../l8c3'),
  l8c4: () => import('../l8c4'),
  l8c5: () => import('../l8c5'),
  l8c6: () => import('../l8c6'),
  l8c7: () => import('../l8c7'),
};
