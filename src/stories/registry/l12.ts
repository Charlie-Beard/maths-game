/** Stories for land 12, the Land of Music (Mr Oom Boom Boom's land), including its finale l12c8. Add one line per story file. */
import type { Loader } from './types';

export const L12: Record<string, Loader> = {
  l12c1: () => import('../l12c1'),
  l12c2: () => import('../l12c2'),
  l12c3: () => import('../l12c3'),
  l12c4: () => import('../l12c4'),
  l12c5: () => import('../l12c5'),
  l12c6: () => import('../l12c6'),
  l12c7: () => import('../l12c7'),
  l12c8: () => import('../l12c8'),
};
