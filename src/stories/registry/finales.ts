/** The land finale stories, l1c8 … l10c8 (workstream W6). Add one line per story file. */
import type { Loader } from './types';

export const FINALES: Record<string, Loader> = {
  l1c8: () => import('../l1c8'),
  l2c8: () => import('../l2c8'),
};
