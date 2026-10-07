import type { Story } from '../kit';

export type Loader = () => Promise<{ default: Story }>;
