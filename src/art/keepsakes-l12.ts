/**
 * Keepsakes for land 12, the Land of Music: one per chapter (ids from curriculum.ts),
 * their names (read aloud in the Treasure Room), and the emblem in the
 * middle of the land's seal. Drawn in a 200 × 200 box with keepsake-kit.ts.
 *
 * SCAFFOLD: stand-ins (the id written on a card) until the land 12 art
 * workstream draws them.
 */
import { C } from './palette';
import { piece, rect } from './paper';
import { text, type Draw } from './keepsake-kit';

const stub = (id: string) => [piece(rect(20, 60, 160, 80, 10), C.cream), text(100, 108, id, 18, C.ink)];

export const KEEPSAKES_L12: Record<string, Draw> = {
  baton: () => stub('baton'),
  triangleBell: () => stub('triangleBell'),
  trumpet: () => stub('trumpet'),
  pocketWatch: () => stub('pocketWatch'),
  showTicket: () => stub('showTicket'),
  drumstick: () => stub('drumstick'),
  muddyPrint: () => stub('muddyPrint'),
  bigDrum: () => stub('bigDrum'),
};

export const NAMES_L12: Record<string, string> = {
  baton: 'baton',
  triangleBell: 'triangleBell',
  trumpet: 'trumpet',
  pocketWatch: 'pocketWatch',
  showTicket: 'showTicket',
  drumstick: 'drumstick',
  muddyPrint: 'muddyPrint',
  bigDrum: 'bigDrum',
};

export const EMBLEM_L12: Draw = () => stub('land 12');
