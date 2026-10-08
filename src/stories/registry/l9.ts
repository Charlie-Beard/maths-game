/** Stories for land 9 (workstreams W5-9 and W6). Add one line per story file. */
import type { Loader } from './types';

export const L9: Record<string, Loader> = {
  l9c1: () => import('../l9c1'),
  l9c2: () => import('../l9c2'),
  l9c3: () => import('../l9c3'),
  l9c4: () => import('../l9c4'),
  l9c5: () => import('../l9c5'),
  l9c6: () => import('../l9c6'),
  l9c7: () => import('../l9c7'),
};
