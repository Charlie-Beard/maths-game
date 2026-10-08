/** Stories for land 6 (workstreams W5-6 and W6). Add one line per story file. */
import type { Loader } from './types';

export const L6: Record<string, Loader> = {
  l6c1: () => import('../l6c1'),
  l6c2: () => import('../l6c2'),
  l6c3: () => import('../l6c3'),
  l6c4: () => import('../l6c4'),
  l6c5: () => import('../l6c5'),
  l6c6: () => import('../l6c6'),
  l6c7: () => import('../l6c7'),
};
