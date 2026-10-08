/**
 * Keepsakes for land 11, the Old Woman's Shoe: one per chapter (ids from curriculum.ts),
 * their names (read aloud in the Treasure Room), and the emblem in the
 * middle of the land's seal. Drawn in a 200 × 200 box with keepsake-kit.ts.
 *
 * SCAFFOLD: stand-ins (the id written on a card) until the land 11 art
 * workstream draws them.
 */
import { C } from './palette';
import { piece, rect } from './paper';
import { text, type Draw } from './keepsake-kit';

const stub = (id: string) => [piece(rect(20, 60, 160, 80, 10), C.cream), text(100, 108, id, 18, C.ink)];

export const KEEPSAKES_L11: Record<string, Draw> = {
  bootLace: () => stub('bootLace'),
  tallyStick: () => stub('tallyStick'),
  sock: () => stub('sock'),
  brothBowl: () => stub('brothBowl'),
  loaf: () => stub('loaf'),
  nightlight: () => stub('nightlight'),
  redCap: () => stub('redCap'),
  shoeBuckle: () => stub('shoeBuckle'),
};

export const NAMES_L11: Record<string, string> = {
  bootLace: 'bootLace',
  tallyStick: 'tallyStick',
  sock: 'sock',
  brothBowl: 'brothBowl',
  loaf: 'loaf',
  nightlight: 'nightlight',
  redCap: 'redCap',
  shoeBuckle: 'shoeBuckle',
};

export const EMBLEM_L11: Draw = () => stub('land 11');
