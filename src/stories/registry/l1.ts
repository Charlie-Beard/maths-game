/** Stories for land 1 (workstreams W5-1 and W6). Add one line per story file. */
import type { Loader } from './types';

export const L1: Record<string, Loader> = {
  l1c1: () => import('../l1c1'),
};
