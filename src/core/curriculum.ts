/**
 * The whole game: 10 lands × 8 chapters. Chapter 8 of each land is its
 * finale. This is the source of truth for the order of the maths and the
 * story (docs/PLAN.md §3–4); tests/unit/curriculum.test.ts checks it.
 *
 * A chapter lists its focus skills and the tier range they're played at
 * (core/mastery.ts picks the tier within it). Story ids match chapter ids
 * (src/stories/l1c1.ts …).
 */
import type { SkillId } from './skills';

/** The child he climbs with (the film's three children). */
export type Avatar = 'beth' | 'joe' | 'fran';
export const AVATARS: readonly Avatar[] = ['beth', 'joe', 'fran'];

/**
 * Finale modes: climb up the tree, escape down before the land moves on,
 * or beat Dame Snap.
 */
export type FinaleKind = 'climb' | 'escape' | 'snap';

export interface Chapter {
  /** "l3c5". */
  id: string;
  land: number;
  /** 1..8 within the land. */
  n: number;
  title: string;
  /** Character id of the host (art/characters). */
  host: string;
  /** What the host says on the intro screen. May contain {name}. */
  intro: string;
  /** Focus skills, in the order they're introduced. */
  skills: SkillId[];
  /** Tier floor and ceiling for the focus skills. */
  tiers: [number, number];
  kind: 'chapter' | 'finale';
  finale?: FinaleKind;
  /** Number of problems (8, or more in finales). */
  problems: number;
  /** Keepsake id won here (art/keepsakes). */
  keepsake: string;
}

export interface Land {
  n: number;
  /** "l3". */
  id: string;
  title: string;
  /** Short name for the map and buttons. */
  short: string;
  /** Accent colour for curtains, banners and tags. */
  color: string;
  /** One line about the land, for the map and the grown-ups. */
  blurb: string;
  chapters: Chapter[];
}

type Def = [title: string, host: string, skills: SkillId[], tiers: [number, number], intro: string, keepsake: string];

function land(n: number, title: string, short: string, color: string, blurb: string, finale: FinaleKind, defs: Def[]): Land {
  return {
    n,
    id: `l${n}`,
    title,
    short,
    color,
    blurb,
    chapters: defs.map(([t, host, skills, tiers, intro, keepsake], i) => ({
      id: `l${n}c${i + 1}`,
      land: n,
      n: i + 1,
      title: t,
      host,
      intro,
      skills,
      tiers,
      kind: i === 7 ? 'finale' : 'chapter',
      finale: i === 7 ? finale : undefined,
      problems: i === 7 ? (n === 10 ? 12 : 10) : 8,
      keepsake,
    })),
  };
}

export const LANDS: Land[] = [
  land(1, 'The Enchanted Wood', 'The Wood', '#5f8a4e', 'Counting and adding within 10', 'climb', [
    ['Into the Enchanted Wood', 'fran', ['count-10'], [1, 2], 'Listen, {name}! The trees are whispering. Let’s count the toadstools!', 'toadstool'],
    ['Wisha-Wisha', 'beth', ['subitise', 'count-10'], [1, 2], 'Can you tell how many without counting? Have a quick look!', 'leaf'],
    ['The Angry Pixie’s Window', 'pixie', ['one-more'], [1, 2], 'Stop peeping! Oh, it’s you. Help me count my plant pots… and one more!', 'pixieCap'],
    ['Dame Washalot’s Washing', 'washalot', ['add-5'], [1, 2], 'Mind the water, dear! Help me add up my washing.', 'peg'],
    ['Mr Watzisname Snores', 'watzisname', ['add-5', 'add-10'], [1, 2], 'Zzz… wha? Oh! Help me count my snores… I mean my acorns.', 'nightcap'],
    ['The Saucepan Man', 'saucepan', ['add-10'], [1, 3], 'EH? Add? Did you say ADD? Help me add up my saucepans!', 'saucepan'],
    ['Silky’s Pop Biscuits', 'silky', ['add-10', 'count-10'], [2, 3], 'Pop biscuits for everyone! But how many do we need?', 'popBiscuit'],
    ['Up to Moon-Face’s Room', 'moonface', ['add-10', 'one-more', 'count-10'], [2, 3], 'Climb up, climb up! Every sum is a step closer to my room!', 'moonLamp'],
  ]),
  land(2, 'The Land of Topsy-Turvy', 'Topsy-Turvy', '#9a5aa0', 'Taking away within 10', 'escape', [
    ['Upside-Down Land', 'topsy', ['one-less'], [1, 2], 'Ereh emoclew! I mean… welcome here! Everything goes backwards… even counting!', 'upsideHat'],
    ['Hats on Feet', 'topsy', ['one-less', 'compare-10'], [1, 2], 'Who has more hats? Who has fewer? Let’s find out!', 'shoeHat'],
    ['Take Away Teacups', 'moonface', ['sub-10'], [1, 2], 'The teacups keep falling off the ceiling! How many are left?', 'teacup'],
    ['The Back-to-Front Bakery', 'saucepan', ['sub-10', 'shapes-2d'], [1, 2], 'Buns that bake themselves back into dough! How many are left?', 'bun'],
    ['The Wobbly Windows', 'beth', ['shapes-2d', 'compare-10'], [1, 3], 'The windows are all the wrong way up. What shapes are they?', 'window'],
    ['Walking on Ceilings', 'joe', ['sub-10'], [2, 4], 'We’re upside down! Let’s count backwards along the ceiling!', 'upsideBoot'],
    ['The Topsy-Turvy Tea Party', 'silky', ['sub-10', 'add-10'], [2, 4], 'Tea comes out of the cups and into the pot! Add some, take some away…', 'teapot'],
    ['The Land Starts to Spin!', 'moonface', ['sub-10', 'one-less', 'add-10'], [2, 4], 'The land is moving on! Quick, back to the ladder!', 'spinningTop'],
  ]),
  land(3, 'The Land of Goodies', 'Goodies', '#d07a8a', 'Number bonds to 10', 'escape', [
    ['Toffee Shock Trees', 'silky', ['bonds-10'], [1, 2], 'The toffee shocks go fizz-bang-POP! How many more make 10?', 'toffee'],
    ['The Lemonade Fountain', 'saucepan', ['part-whole-10'], [1, 2], 'Lemonade! Lemonade! Two jugs make one big one!', 'lemonade'],
    ['Pop Biscuit Pairs', 'fran', ['bonds-10'], [1, 3], 'Pop biscuits come in pairs that make 10. Can you find them?', 'biscuitTin'],
    ['Google Buns', 'moonface', ['missing-10'], [1, 2], 'Google Buns have sherbet inside! But some are missing…', 'googleBun'],
    ['The Jelly Hill', 'joe', ['missing-10', 'fact-family-10'], [1, 2], 'A wobbly hill made of jelly! Let’s find the missing numbers.', 'jelly'],
    ['Sugar Mice', 'beth', ['fact-family-10'], [1, 3], 'The sugar mice live in families of sums. Who belongs?', 'sugarMouse'],
    ['Too Many Treats', 'silky', ['bonds-10', 'missing-10'], [3, 4], 'Oh dear, I think we’ve eaten too many treats… one more go!', 'lolly'],
    ['The Jelly Goblin', 'jellyGoblin', ['bonds-10', 'missing-10', 'fact-family-10'], [2, 4], 'Who’s been eating MY goodies? Come back here!', 'goblinSpoon'],
  ]),
  land(4, 'Dame Snap’s School', 'Dame Snap', '#3b3640', 'Adding and taking away within 10, fast and sure', 'snap', [
    ['A Strange New Land', 'saucepan', ['fluency-10'], [1, 2], 'A SCHOOL? At the top of the tree? Oh, I don’t like the look of this…', 'chalk'],
    ['The Gates Clang Shut', 'joe', ['fluency-10', 'doubles-5'], [1, 2], 'The gates have locked behind us! We’ll have to be clever, {name}.', 'gateKey'],
    ['Desks in Rows', 'beth', ['doubles-5'], [1, 3], 'Everything here is in pairs. Doubles, doubles everywhere!', 'inkwell'],
    ['Rule Number One: No Fun', 'fran', ['odd-even'], [1, 2], 'Dame Snap says odd numbers aren’t allowed! That’s silly. Let’s find them.', 'rulebook'],
    ['Lines on the Blackboard', 'moonface', ['odd-even', 'fluency-10'], [1, 2], 'She’s making me write lines! Help me with my sums, {name}!', 'blackboard'],
    ['Detention!', 'pixie', ['fluency-10'], [2, 3], 'DETENTION? Me? I’ll show her! Quick, help me with these.', 'bell'],
    ['The Secret Key', 'silky', ['fluency-10', 'doubles-5', 'missing-10'], [3, 4], 'I’ve found a key! But it only works if the sums are right…', 'brassKey'],
    ['Escape from Dame Snap', 'dameSnap', ['fluency-10', 'doubles-5', 'missing-10'], [2, 4], 'SILENCE! Nobody leaves my school until every sum is done!', 'snappedRuler'],
  ]),
  land(5, 'The Land of Birthdays', 'Birthdays', '#d8a43f', 'Teen numbers and adding within 20', 'escape', [
    ['Whose Birthday?', 'oomboom', ['teens'], [1, 2], 'Oom boom boom! There’s a birthday today! But whose?', 'partyHat'],
    ['Candles in Tens', 'silky', ['teens'], [1, 3], 'Ten candles in a row… and some more. How old is the cake?', 'candle'],
    ['Pass the Parcel', 'joe', ['count-20'], [1, 2], 'When the music stops, count the layers!', 'parcel'],
    ['Party Bags', 'beth', ['add-20'], [1, 2], 'Fill the party bags! How many sweets altogether?', 'partyBag'],
    ['Musical Chairs', 'saucepan', ['sub-20'], [1, 2], 'EH? MUSICAL HAIRS? Oh, chairs! How many are left?', 'chair'],
    ['The Biggest Cake', 'moonface', ['bonds-20', 'add-20'], [1, 2], 'A cake as tall as the tree! How many slices make 20?', 'cakeSlice'],
    ['Make a Wish', 'fran', ['add-20', 'sub-20'], [2, 3], 'Close your eyes and make a wish, {name}! But first, some sums…', 'wishingStar'],
    ['The Birthday Wish', 'silky', ['teens', 'add-20', 'sub-20', 'bonds-20'], [2, 3], 'The party’s ending and the land is moving! Run!', 'birthdayBadge'],
  ]),
  land(6, 'The Land of Giants', 'Giants', '#7c6a52', 'Numbers to 100: tens and ones', 'escape', [
    ['Footprints as Big as Ponds', 'giant', ['count-10s'], [1, 2], 'FEE FI… oh, sorry. Hello, little one! Can you count in tens? I count in tens!', 'footprint'],
    ['Bundles of Sticks', 'moonface', ['tens-ones'], [1, 2], 'The giant ties his firewood in bundles of ten. Let’s count it!', 'bundle'],
    ['The Giant’s Kitchen', 'saucepan', ['tens-ones', 'count-100'], [1, 3], 'A SAUCEPAN as big as a HOUSE! I’m in love!', 'giantSpoon'],
    ['Counting to a Hundred', 'joe', ['count-100'], [1, 3], 'Giants count to a hundred before breakfast. Can we?', 'hundredSquare'],
    ['Giant Steps', 'beth', ['measure-length'], [1, 2], 'How long is a giant’s shoelace? Let’s measure it in footsteps!', 'shoelace'],
    ['Bigger or Smaller?', 'giant', ['compare-100'], [1, 3], 'Is my number bigger, or is yours? Let’s see!', 'scales'],
    ['The Giant’s Buttons', 'fran', ['compare-100', 'tens-ones'], [3, 4], 'Buttons as big as tables! Tens of them!', 'giantButton'],
    ['Hide in the Teacup!', 'giant', ['tens-ones', 'count-100', 'compare-100'], [2, 4], 'WHERE have those little people gone? I only want to give them a cuddle!', 'giantTeacup'],
  ]),
  land(7, 'The Land of Spells', 'Spells', '#4f6aa0', 'Adding and taking away across 10', 'snap', [
    ['The Enchanter’s Tower', 'enchanter', ['doubles-20'], [1, 2], 'Welcome to my tower. Every spell needs a double!', 'wand'],
    ['Half a Spell', 'silky', ['doubles-20'], [2, 3], 'Oops! The Enchanter cut his spell in half. Can you halve it back?', 'halfMoon'],
    ['Make Ten Magic', 'moonface', ['bridge-add'], [1, 2], 'The magic trick: fill the ten first! Then add the rest.', 'magicHat'],
    ['The Potion Bottles', 'enchanter', ['bridge-add'], [1, 3], 'Mix the potions… but not too many! Fill to ten first.', 'potion'],
    ['Spell it Backwards', 'beth', ['bridge-sub'], [1, 2], 'To undo a spell, go back to ten first!', 'spellbook'],
    ['The Missing Ingredient', 'saucepan', ['missing-20', 'bridge-sub'], [1, 2], 'EH? A MISSING INGREDIENT? It’s not in my saucepans!', 'cauldron'],
    ['Story Spells', 'fran', ['word-problems'], [1, 3], 'The spellbook tells stories. Is it add or take away?', 'quill'],
    ['Silky is Taken!', 'dameSnap', ['bridge-add', 'bridge-sub', 'missing-20', 'word-problems'], [2, 3], 'You again! This time I’m taking the fairy. SNAP!', 'silkyRibbon'],
  ]),
  land(8, 'The Land of Toys', 'Toys', '#b5583b', 'Groups, times tables and money', 'escape', [
    ['Wind-Up Land', 'toySoldier', ['count-2s-5s'], [1, 2], 'Attention! Left-right, left-right! Count our boots in twos!', 'windUpKey'],
    ['Soldiers in Rows', 'toySoldier', ['groups'], [1, 2], 'Fall in! Equal groups, please! How many altogether?', 'soldier'],
    ['The Toy Box', 'joe', ['groups', 'arrays'], [1, 2], 'The toys are packed in rows. How many in the box?', 'toyBox'],
    ['Twos and Tens', 'oomboom', ['times-2', 'times-10'], [1, 2], 'Oom boom boom! The drum beats in twos and tens!', 'drum'],
    ['Fives on Parade', 'toySoldier', ['times-5'], [1, 2], 'Five soldiers in every row! Quick march!', 'medal'],
    ['The Toy Shop', 'oomboom', ['coins'], [1, 2], 'Everything’s for sale! Have you got the right coins?', 'coinPurse'],
    ['Pennies and Pounds', 'beth', ['coins', 'times-2', 'times-5', 'times-10'], [2, 4], 'Can we buy the toy train? Let’s count our money!', 'pound'],
    ['The Toy Train Home', 'moonface', ['groups', 'times-2', 'times-5', 'times-10', 'coins'], [2, 3], 'All aboard! The land is moving and the train is our way out!', 'trainTicket'],
  ]),
  land(9, 'The Land of Snow', 'Snow', '#8fb4d8', 'Sharing, fractions and time', 'escape', [
    ['A Land of Snow', 'snowman', ['share'], [1, 2], 'Brr! Hello! Shall we share out the snowballs fairly?', 'snowflake'],
    ['Snowball Sharing', 'joe', ['share'], [1, 3], 'Everyone gets the same. That’s the rule of the snow!', 'snowball'],
    ['Sledges in Groups', 'fran', ['group-div'], [1, 2], 'Two on every sledge! How many sledges do we need?', 'sledge'],
    ['Half an Ice-Pie', 'saucepan', ['fractions'], [1, 2], 'An ICE-PIE? Cut it in HALF? Fair’s fair!', 'icePie'],
    ['The Frozen Clock Tower', 'moonface', ['time'], [1, 2], 'The clock tower has frozen! What time does it say?', 'clock'],
    ['Quarter Past Snow', 'beth', ['time', 'fractions'], [2, 4], 'Quarter past, quarter to… quarters of the pie, too!', 'mittens'],
    ['Icicles to Count', 'snowman', ['add-2d1d', 'sub-2d1d'], [1, 2], 'Long rows of icicles. Lots of tens, and some more!', 'icicle'],
    ['The Big Thaw', 'moonface', ['share', 'fractions', 'time', 'add-2d1d'], [2, 3], 'The snow is melting! The land is going! And we have a plan to save Silky…', 'snowGlobe'],
  ]),
  land(10, 'Dame Snap’s Prison', 'The Prison', '#2a2530', 'Adding and taking away to 100, and everything mixed', 'snap', [
    ['Dame Snap’s Return', 'moonface', ['add-tens'], [1, 2], 'Her land is back. Silky is in there, {name}. Are you ready?', 'lantern'],
    ['Through the Bars', 'joe', ['add-2d1d', 'sub-2d1d'], [2, 4], 'The bars are numbered! Find the right one to squeeze through.', 'bar'],
    ['The Corridor of Rules', 'beth', ['add-2d2d'], [1, 2], 'Every rule on the wall is a sum. Break the rules, {name}!', 'rule'],
    ['Lock after Lock', 'pixie', ['add-2d2d', 'sub-2d2d'], [1, 2], 'Locks! Locks everywhere! Good thing I’m good at picking them.', 'padlock'],
    ['The Folk in Cages', 'washalot', ['sub-2d2d', 'missing-100'], [1, 2], 'Oh, my dear! Get us out of here!', 'cageKey'],
    ['The Hardest Sum', 'saucepan', ['missing-100', 'word-problems'], [1, 4], 'She says this is the hardest sum in the world. HA! Not for you!', 'goldStar'],
    ['Silky’s Cell', 'fran', ['add-2d2d', 'sub-2d2d', 'times-5', 'fractions'], [2, 3], 'I can hear Silky singing! She’s behind that door!', 'silkyWing'],
    ['The Last Snap', 'dameSnap', ['add-2d2d', 'sub-2d2d', 'missing-100', 'bridge-add', 'times-10'], [2, 3], 'NO child has EVER finished my sums. NOT ONE!', 'crown'],
  ]),
];

export const ALL_CHAPTERS: Chapter[] = LANDS.flatMap((l) => l.chapters);

export function findChapter(id: string): { land: Land; chapter: Chapter } | null {
  for (const land of LANDS) {
    const chapter = land.chapters.find((c) => c.id === id);
    if (chapter) return { land, chapter };
  }
  return null;
}

/** The chapter before this one in the game (null for the very first). */
export function previousChapter(id: string): Chapter | null {
  const i = ALL_CHAPTERS.findIndex((c) => c.id === id);
  return i > 0 ? ALL_CHAPTERS[i - 1] : null;
}
