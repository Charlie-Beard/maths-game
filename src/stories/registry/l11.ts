/** Stories for land 11, the Old Woman's Shoe, including its finale l11c8. Add one line per story file. */
import type { Loader } from './types';

export const L11: Record<string, Loader> = {
  l11c1: () => import('../l11c1'),
  l11c2: () => import('../l11c2'),
  l11c3: () => import('../l11c3'),
  l11c4: () => import('../l11c4'),
  l11c5: () => import('../l11c5'),
  l11c6: () => import('../l11c6'),
  l11c7: () => import('../l11c7'),
  l11c8: () => import('../l11c8'),
};
