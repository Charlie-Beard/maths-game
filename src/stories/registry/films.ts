/** The opening and ending films (workstream W6-film). */
import type { Loader } from './types';

export const FILMS: Record<string, Loader> = {
  opening: () => import('../opening'),
};
