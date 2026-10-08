/**
 * Keepsakes for land 13, the Land of Roundabouts: one per chapter (ids from curriculum.ts),
 * their names (read aloud in the Treasure Room), and the emblem in the
 * middle of the land's seal. Drawn in a 200 × 200 box with keepsake-kit.ts.
 *
 * SCAFFOLD: stand-ins (the id written on a card) until the land 13 art
 * workstream draws them.
 */
import { C } from './palette';
import { piece, rect } from './paper';
import { text, type Draw } from './keepsake-kit';

const stub = (id: string) => [piece(rect(20, 60, 160, 80, 10), C.cream), text(100, 108, id, 18, C.ink)];

export const KEEPSAKES_L13: Record<string, Draw> = {
  carouselHorse: () => stub('carouselHorse'),
  compass: () => stub('compass'),
  spinningCup: () => stub('spinningCup'),
  rollingBall: () => stub('rollingBall'),
  helterMat: () => stub('helterMat'),
  signpost: () => stub('signpost'),
  goblinRope: () => stub('goblinRope'),
  roundaboutTicket: () => stub('roundaboutTicket'),
};

export const NAMES_L13: Record<string, string> = {
  carouselHorse: 'carouselHorse',
  compass: 'compass',
  spinningCup: 'spinningCup',
  rollingBall: 'rollingBall',
  helterMat: 'helterMat',
  signpost: 'signpost',
  goblinRope: 'goblinRope',
  roundaboutTicket: 'roundaboutTicket',
};

export const EMBLEM_L13: Draw = () => stub('land 13');
