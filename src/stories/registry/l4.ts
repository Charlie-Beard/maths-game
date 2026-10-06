/** Stories for land 4 (workstreams W5-4 and W6). Add one line per story file. */
import type { Loader } from './types';

export const L4: Record<string, Loader> = {
  l4c1: () => import('../l4c1'),
  l4c2: () => import('../l4c2'),
  l4c3: () => import('../l4c3'),
  l4c4: () => import('../l4c4'),
  l4c5: () => import('../l4c5'),
  l4c6: () => import('../l4c6'),
};
