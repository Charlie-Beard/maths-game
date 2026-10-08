/**
 * Keepsakes for land 14, the Land of the Red Goblins: one per chapter (ids from curriculum.ts),
 * their names (read aloud in the Treasure Room), and the emblem in the
 * middle of the land's seal. Drawn in a 200 × 200 box with keepsake-kit.ts.
 *
 * SCAFFOLD: stand-ins (the id written on a card) until the land 14 art
 * workstream draws them.
 */
import { C } from './palette';
import { piece, rect } from './paper';
import { text, type Draw } from './keepsake-kit';

const stub = (id: string) => [piece(rect(20, 60, 160, 80, 10), C.cream), text(100, 108, id, 18, C.ink)];

export const KEEPSAKES_L14: Record<string, Draw> = {
  goldSack: () => stub('goldSack'),
  goblinGold: () => stub('goblinGold'),
  goblinJug: () => stub('goblinJug'),
  thermometer: () => stub('thermometer'),
  goblinScales: () => stub('goblinScales'),
  glowWorm: () => stub('glowWorm'),
  saucepanLid: () => stub('saucepanLid'),
  goblinHat: () => stub('goblinHat'),
};

export const NAMES_L14: Record<string, string> = {
  goldSack: 'goldSack',
  goblinGold: 'goblinGold',
  goblinJug: 'goblinJug',
  thermometer: 'thermometer',
  goblinScales: 'goblinScales',
  glowWorm: 'glowWorm',
  saucepanLid: 'saucepanLid',
  goblinHat: 'goblinHat',
};

export const EMBLEM_L14: Draw = () => stub('land 14');
