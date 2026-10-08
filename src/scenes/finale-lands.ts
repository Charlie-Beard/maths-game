/**
 * What each land's finale looks like (docs/PLAN.md §4 "Land finales"): one
 * entry per land, so a W6-n agent can theme its land here without touching
 * the mechanics in finale.ts.
 *
 *   climb   (land 1)          up the trunk to Moon-Face's door
 *   escape  (2, 3, 5, 6, 8, 9, 11–14) down the ladder before the land moves on;
 *                              `hazard` says how the land threatens
 *   snap    (4, 7, 10)        Dame Snap at her board; each wave is a set of
 *                              rules to crack, cages to unlock or rulers
 *                              to snap
 *
 * Every line here is spoken (iPad voice until the recordings exist), so
 * keep them short: a 6-year-old is listening. `{name}` is his name.
 */
import type { FinaleKind } from '../core/curriculum';
import type { Mood } from '../audio/synth';
import { C } from '../art/palette';

/** How the land threatens them on the way down the ladder (never catching them). */
export type Hazard =
  /** The land spins round and round, ending upside down. */
  | 'spin'
  /** Someone (`chaser`) climbs down after them, always a few rungs behind. */
  | 'chase'
  /** A giant (`chaser`) peers over the edge and stomps: the ladder shakes. */
  | 'stomp'
  /** Toy soldiers (`chaser`) march to and fro along the land's edge. */
  | 'march'
  /** Balloons float up past them, and the land floats off on them. */
  | 'balloons'
  /** The snow melts: drips fall and the snowman (`chaser`) shrinks. */
  | 'melt';

/** What one wave of Dame Snap's board is made of. */
export interface SnapWave {
  kind: 'rules' | 'cages' | 'rulers';
  /** Heading chalked over the board, and said when the wave starts. */
  title: string;
  /** Rules, one per item (rules only). */
  rules?: string[];
  /** Who is locked in each cage (cages only; repeats if short). */
  captives?: string[];
  /** Items in the wave. The waves' counts add up to the chapter's problems. */
  count: number;
}

export interface FinaleLand {
  n: number;
  mode: FinaleKind;
  /** Folk who come with the hero (character ids, art/characters). */
  folk: string[];
  /** Music bed under the opening and the end (stopped before the first problem). */
  mood: Mood;
  /** escape: the sky behind the ladder, top to bottom, and the swirling clouds' colour. */
  sky?: [string, string, string];
  clouds?: string;
  hazard?: Hazard;
  chaser?: string;
  /** snap: the board's waves, and whether this time she's beaten for good. */
  waves?: SnapWave[];
  final?: boolean;
  lines: {
    /** Said at the start, before the first problem. */
    start: string;
    /** Said between problems, in turn (snap: these are Dame Snap's shrieks). */
    beats: string[];
    /** snap: what she shouts as she storms off (or is beaten). */
    exit?: string;
    /** Said at the very end, before the story. */
    end: string;
  };
}

const RULES_4 = ['NO talking', 'NO smiling', 'NO wiggling', 'NO giggling', 'NO singing', 'NO sweets', 'NO fun', 'SIT STILL', 'NO playing', 'NO fingers'];

export const FINALES: Record<number, FinaleLand> = {
  1: {
    n: 1,
    mode: 'climb',
    folk: ['saucepan'],
    mood: 'adventure',
    lines: {
      start: 'Climb up, {name}! Every right answer is one more step up the tree!',
      beats: ['Up we go!', 'Higher and higher!', 'Mind Dame Washalot’s water!', 'Shh! Don’t wake Mr Watzisname!', 'Nearly at the top!'],
      end: 'You made it! Come in, come in! Have a pop biscuit!',
    },
  },
  2: {
    n: 2,
    mode: 'escape',
    folk: ['moonface', 'saucepan'],
    mood: 'adventure',
    sky: [C.topsySky, '#e6c3dc', C.duskSky],
    clouds: '#f6e4ef',
    hazard: 'spin',
    lines: {
      start: 'The land is starting to spin! Quick, {name}, down the ladder!',
      beats: ['Round and round it goes!', 'Hold on tight!', 'One more rung down!', 'Don’t look up!', 'It’s going upside down!'],
      end: 'Jump! Phew! We’re safe on the tree. Bye-bye, Topsy-Turvy!',
    },
  },
  3: {
    n: 3,
    mode: 'escape',
    folk: ['silky', 'saucepan'],
    mood: 'sneaky',
    sky: ['#f4d7dc', C.candyPink, C.duskSky],
    clouds: '#fbe9ef',
    hazard: 'chase',
    chaser: 'jellyGoblin',
    lines: {
      start: 'The Jelly Goblin wants his goodies back! Down the ladder, quick!',
      beats: ['Wibble, wobble, here he comes!', 'Come back with my goodies!', 'Faster, {name}!', 'He’s too wobbly to catch us!', 'Down, down, down!'],
      end: 'Jump! He can’t reach us now. Bye-bye, Jelly Goblin!',
    },
  },
  4: {
    n: 4,
    mode: 'snap',
    folk: ['moonface', 'saucepan'],
    mood: 'spooky',
    waves: [{ kind: 'rules', title: 'MY RULES', rules: RULES_4, count: 10 }],
    final: false,
    lines: {
      start: 'Dame Snap’s rules are on the board. Every right answer cracks one. Ready, {name}?',
      beats: ['SILENCE!', 'Sit up STRAIGHT!', 'No talking in MY class!', 'Stop that at ONCE!', 'SNAP!', 'That’s… right. GRRR!'],
      exit: 'This isn’t over! I will SNAP you up!',
      end: 'She’s gone! Every rule is broken. Quick, down the tree!',
    },
  },
  5: {
    n: 5,
    mode: 'escape',
    folk: ['oomboom', 'silky'],
    mood: 'adventure',
    sky: ['#f6e3b4', C.goldLight, C.duskSky],
    clouds: C.icing,
    hazard: 'balloons',
    lines: {
      start: 'The party is ending, and the land is floating away! Down the ladder, everyone!',
      beats: ['Balloons everywhere!', 'Mind the streamers!', 'One more rung!', 'Hold on to your party hat!', 'Nearly down!'],
      end: 'Jump! What a party! Goodbye, Land of Birthdays!',
    },
  },
  6: {
    n: 6,
    mode: 'escape',
    folk: ['moonface', 'saucepan'],
    mood: 'sneaky',
    sky: [C.giantSky, '#d6dfe3', C.duskSky],
    clouds: C.cloud,
    hazard: 'stomp',
    chaser: 'giant',
    lines: {
      start: 'The giant is coming! The land is moving on! Down the ladder, quick and quiet!',
      beats: ['STOMP! Hold on!', 'Where have those little people gone?', 'Shh! Keep climbing!', 'The ladder’s wobbling!', 'He only wants a cuddle!'],
      end: 'Jump! Safe! Goodbye, giants!',
    },
  },
  7: {
    n: 7,
    mode: 'snap',
    folk: ['enchanter', 'moonface'],
    mood: 'spooky',
    waves: [{ kind: 'rulers', title: 'MY RULERS', count: 10 }],
    final: false,
    lines: {
      start: 'Dame Snap is here, with all her rulers! Every right answer snaps one. Ready, {name}?',
      beats: ['SNAP!', 'Not my rulers!', 'You again!', 'Stop that at ONCE!', 'I hate sums done WELL!', 'GRRR!'],
      exit: 'You haven’t won! I’ll take something you love!',
      end: 'She’s stormed off. But where is she going?',
    },
  },
  8: {
    n: 8,
    mode: 'escape',
    folk: ['oomboom', 'moonface'],
    mood: 'adventure',
    sky: ['#f2d2b8', '#e8b48c', C.duskSky],
    clouds: C.cloud,
    hazard: 'march',
    chaser: 'toySoldier',
    lines: {
      start: 'The toy soldiers are marching! The land is moving on! Down the ladder!',
      beats: ['Left, right! Left, right!', 'Quick march!', 'One more rung!', 'Attention! Hold on!', 'Nearly down!'],
      end: 'Jump! All safe! Goodbye, Land of Toys!',
    },
  },
  9: {
    n: 9,
    mode: 'escape',
    folk: ['moonface', 'saucepan'],
    mood: 'dreamy',
    sky: [C.snowSky, '#dce8f0', C.duskSky],
    clouds: C.snow,
    hazard: 'melt',
    chaser: 'snowman',
    lines: {
      start: 'The snow is melting and the land is going! Down the ladder, {name}!',
      beats: ['Drip, drip, drip!', 'Brr! Hold on!', 'The snowman is melting!', 'One more rung!', 'Nearly down!'],
      end: 'Jump! Safe and warm. Goodbye, Land of Snow!',
    },
  },
  10: {
    n: 10,
    mode: 'snap',
    folk: ['moonface', 'saucepan'],
    mood: 'spooky',
    waves: [
      { kind: 'rules', title: 'MY RULES', rules: ['NO fun', 'NO friends', 'NO fairies', 'NO escape'], count: 4 },
      { kind: 'cages', title: 'MY CAGES', captives: ['washalot', 'pixie', 'watzisname', 'silky'], count: 4 },
      { kind: 'rulers', title: 'MY RULERS', count: 4 },
    ],
    final: true,
    lines: {
      start: 'This is it, {name}. Break her rules, open the cages, snap her rulers!',
      beats: ['SILENCE!', 'NOT ONE child has EVER done that!', 'My rules! MY RULES!', 'Stop that at ONCE!', 'SNAP!', 'GRRR!'],
      exit: 'No! My rulers! My rules! Let me out of this cupboard!',
      end: 'You did it, {name}! Dame Snap is beaten for good!',
    },
  },

  // The second adventure. Each land's story workstream owns its own entry
  // below (and may change anything in it); the lines here are first drafts.

  11: {
    n: 11,
    mode: 'escape',
    folk: ['silky', 'saucepan'],
    mood: 'adventure',
    sky: ['#efd9bf', '#d9b48c', C.duskSky],
    clouds: C.cloud,
    hazard: 'chase',
    chaser: 'oldWoman',
    lines: {
      start: 'The shoe is walking away! Down the ladder, {name}!',
      beats: ['Come back for supper, dears!', 'Hold on tight!', 'One more rung!', 'Mind the laces!', 'Nearly down!'],
      end: 'Jump! Safe on the tree. Goodbye, Old Woman! Goodbye, children!',
    },
  },

  12: {
    n: 12,
    mode: 'escape',
    folk: ['oomboom', 'moonface'],
    mood: 'sneaky',
    sky: ['#cfe6e2', '#9fcfc8', C.duskSky],
    clouds: C.cloud,
    hazard: 'march',
    chaser: 'redGoblin',
    lines: {
      start: 'The goblins are marching off with the big drum! The land is going! Down, {name}!',
      beats: ['Boom! Boom! Boom!', 'Oom-pah-pah!', 'One more rung!', 'Hold on tight!', 'Nearly down!'],
      end: 'Jump! We’re safe. But the goblins still have my drum…',
    },
  },

  13: {
    n: 13,
    mode: 'escape',
    folk: ['moonface', 'silky'],
    mood: 'adventure',
    sky: ['#f6dcc4', '#eeb48a', C.duskSky],
    clouds: C.cloud,
    hazard: 'spin',
    lines: {
      start: 'The land is spinning away! Down the ladder, {name}!',
      beats: ['Round and round!', 'Hold on tight!', 'One more rung!', 'Don’t get dizzy!', 'Nearly down!'],
      end: 'Jump! Safe. But where is the Saucepan Man?',
    },
  },

  14: {
    n: 14,
    mode: 'escape',
    folk: ['moonface', 'saucepan'],
    mood: 'sneaky',
    sky: ['#4a2a2a', '#7a3a32', C.duskSky],
    clouds: '#d8c4bc',
    hazard: 'chase',
    chaser: 'redGoblin',
    lines: {
      start: 'The goblins are coming! Up and out, {name}! Down the ladder home!',
      beats: ['Come BACK here!', 'Clank! Clank! Faster!', 'One more rung!', 'They’re too slow!', 'Nearly down!'],
      end: 'Jump! Home at last! Goodbye, Red Goblins, for ever!',
    },
  },
};

/** The finale for a land (land 1's as a fallback). */
export const finaleFor = (n: number): FinaleLand => FINALES[n] ?? FINALES[1];

/** Every line the finales say (for the voice export, W8). */
export const FINALE_LINES: string[] = Object.values(FINALES).flatMap((f) => [
  f.lines.start,
  ...f.lines.beats,
  ...(f.lines.exit ? [f.lines.exit] : []),
  f.lines.end,
  ...(f.waves && f.waves.length > 1 ? f.waves.map((w) => waveLine(w)) : []),
]);

/** What's said when a new wave of the board starts. */
export function waveLine(w: SnapWave): string {
  return w.kind === 'rules' ? 'First, her rules!' : w.kind === 'cages' ? 'Now the cages! Let’s free the Folk!' : 'Now her rulers! Snap them all!';
}
