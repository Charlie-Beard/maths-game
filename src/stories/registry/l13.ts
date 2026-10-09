/** Stories for land 13, the Land of Roundabouts, including its finale l13c8. Add one line per story file. */
import type { Loader } from './types';

export const L13: Record<string, Loader> = {
  l13c1: () => import('../l13c1'),
  l13c2: () => import('../l13c2'),
  l13c3: () => import('../l13c3'),
  l13c4: () => import('../l13c4'),
  l13c5: () => import('../l13c5'),
  l13c6: () => import('../l13c6'),
  l13c7: () => import('../l13c7'),
  l13c8: () => import('../l13c8'),
};
