/** Stories for land 10 (workstreams W5-10 and W6). Add one line per story file. */
import type { Loader } from './types';

export const L10: Record<string, Loader> = {
  l10c1: () => import('../l10c1'),
  l10c2: () => import('../l10c2'),
  l10c3: () => import('../l10c3'),
  l10c4: () => import('../l10c4'),
  l10c5: () => import('../l10c5'),
};
