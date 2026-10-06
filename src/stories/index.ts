/**
 * Every story, loaded on demand: chapter stories by chapter id (l1c1 …
 * l10c8; chapter 8 is a land finale), plus 'opening' and 'ending'.
 *
 * Workstreams W5/W6 (docs/ROADMAP.md) add one file per story and list it
 * here. A chapter with no story just skips straight to its reward.
 */
import type { Story } from './kit';

type Loader = () => Promise<{ default: Story }>;

export const STORIES: Record<string, Loader> = {
  l1c1: () => import('./l1c1'),
};
