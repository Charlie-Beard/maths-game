/** Stories for land 14, the Land of the Red Goblins, including its finale l14c8. Add one line per story file. */
import type { Loader } from './types';

export const L14: Record<string, Loader> = {
  l14c1: () => import('../l14c1'),
  l14c2: () => import('../l14c2'),
  l14c3: () => import('../l14c3'),
  l14c4: () => import('../l14c4'),
  l14c5: () => import('../l14c5'),
  l14c6: () => import('../l14c6'),
  l14c7: () => import('../l14c7'),
  l14c8: () => import('../l14c8'),
};
