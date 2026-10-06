/**
 * Every story, loaded on demand: chapter stories by chapter id (l1c1 …
 * l10c8; chapter 8 is a land finale), plus 'opening' and 'ending'.
 *
 * Each land has its own registry file (registry/l1.ts …) so stories can be
 * written in parallel without clashing. A chapter with no story just skips
 * straight to its reward.
 */
import { FILMS } from './registry/films';
import { FINALES } from './registry/finales';
import { L1 } from './registry/l1';
import { L2 } from './registry/l2';
import { L3 } from './registry/l3';
import { L4 } from './registry/l4';
import { L5 } from './registry/l5';
import { L6 } from './registry/l6';
import { L7 } from './registry/l7';
import { L8 } from './registry/l8';
import { L9 } from './registry/l9';
import { L10 } from './registry/l10';
import type { Loader } from './registry/types';

export const STORIES: Record<string, Loader> = { ...FILMS, ...FINALES, ...L1, ...L2, ...L3, ...L4, ...L5, ...L6, ...L7, ...L8, ...L9, ...L10 };
