/** The land finale stories, l1c8 … l10c8 (workstream W6). Add one line per story file. */
import type { Loader } from './types';

export const FINALES: Record<string, Loader> = {
  l1c8: () => import('../l1c8'),
  l2c8: () => import('../l2c8'),
  l3c8: () => import('../l3c8'),
  l4c8: () => import('../l4c8'),
  l5c8: () => import('../l5c8'),
  l6c8: () => import('../l6c8'),
  l7c8: () => import('../l7c8'),
  l8c8: () => import('../l8c8'),
  l9c8: () => import('../l9c8'),
  l10c8: () => import('../l10c8'),
};
