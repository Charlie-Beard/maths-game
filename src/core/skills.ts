/**
 * The skill catalogue: every small step of maths in the game, in teaching
 * order (UK Year 1 → Year 2, White Rose / NCETM small steps). Lands 11–14,
 * the second adventure after Dame Snap, finish off Year 2.
 *
 * Each skill has tiers that follow concrete → pictorial → abstract and grow
 * the numbers. Tier 1 is always the gentlest. What each tier means is
 * written here (for grown-ups and for whoever writes the generator); the
 * generator in core/generators turns a tier into actual problems.
 *
 * Mastery, review and tier changes are in core/mastery.ts.
 */

export type Strand = 'number' | 'addsub' | 'multdiv' | 'fractions' | 'measure' | 'geometry';

export interface Skill {
  id: SkillId;
  /** Shown to grown-ups. */
  title: string;
  strand: Strand;
  /** What each tier is, gentlest first. The length is the number of tiers. */
  tiers: readonly string[];
  /** Skills that must come earlier in the curriculum. */
  needs: readonly SkillId[];
}

export const SKILL_IDS = [
  // Land 1: the Enchanted Wood
  'count-10',
  'subitise',
  'one-more',
  'add-5',
  'add-10',
  // Land 2: Topsy-Turvy
  'one-less',
  'sub-10',
  'compare-10',
  'shapes-2d',
  // Land 3: Goodies
  'bonds-10',
  'part-whole-10',
  'missing-10',
  'fact-family-10',
  // Land 4: Dame Snap's School
  'fluency-10',
  'doubles-5',
  'odd-even',
  // Land 5: Birthdays
  'teens',
  'count-20',
  'add-20',
  'sub-20',
  'bonds-20',
  // Land 6: Giants
  'count-10s',
  'tens-ones',
  'count-100',
  'compare-100',
  'measure-length',
  // Land 7: Spells
  'doubles-20',
  'bridge-add',
  'bridge-sub',
  'missing-20',
  'word-problems',
  // Land 8: Toys
  'count-2s-5s',
  'groups',
  'arrays',
  'times-2',
  'times-10',
  'times-5',
  'coins',
  // Land 9: Snow
  'share',
  'group-div',
  'fractions',
  'time',
  'add-2d1d',
  'sub-2d1d',
  // Land 10: Dame Snap's Prison
  'add-tens',
  'add-2d2d',
  'sub-2d2d',
  'missing-100',
  // Land 11: the Old Woman's Shoe
  'tally',
  'change',
  // Land 12: Mr Oom Boom Boom's Land of Music
  'count-3s',
  'time-5',
  // Land 13: Roundabouts
  'turns',
  'shapes-3d',
  // Land 14: the Red Goblins
  'compare-measures',
  'read-scales',
] as const;

export type SkillId = (typeof SKILL_IDS)[number];

const s = (id: SkillId, title: string, strand: Strand, tiers: string[], needs: SkillId[] = []): Skill => ({ id, title, strand, tiers, needs });

export const SKILLS: Record<SkillId, Skill> = Object.fromEntries(
  [
    s('count-10', 'Count objects to 10', 'number', ['up to 5 objects in a row', 'up to 10 objects in a row', 'up to 10 objects scattered', 'match a count to its numeral']),
    s('subitise', 'See small amounts without counting', 'number', ['dice patterns 1–4', 'dice patterns 1–6', 'ten-frame patterns to 10'], ['count-10']),
    s('one-more', 'One more', 'number', ['one more with objects, to 6', 'one more on a number line, to 10', '"one more than 7" as numbers'], ['count-10']),
    s('add-5', 'Add within 5', 'addsub', ['two groups of objects to count', 'objects with the sum written', 'sum only'], ['count-10', 'one-more']),
    s('add-10', 'Add within 10', 'addsub', ['objects, totals to 5', 'objects, totals to 10', 'ten frames with the sum written', 'sum only (number line on request)', 'sum only, typed'], ['add-5']),
    s('one-less', 'One less', 'number', ['one less with objects, to 6', 'one less on a number line, to 10', '"one less than 7" as numbers'], ['one-more']),
    s('sub-10', 'Take away within 10', 'addsub', ['take away objects, from up to 5', 'take away objects, from up to 10', 'ten frames with the sum written', 'count back on a number line', 'sum only, typed'], ['add-10', 'one-less']),
    s('compare-10', 'More, fewer, the same', 'number', ['which group has more objects', 'more, fewer or the same', 'which number is bigger or smaller'], ['count-10']),
    s('shapes-2d', '2D shapes', 'geometry', ['circle, square, triangle, rectangle', 'any way round (turned and topsy-turvy)', 'pentagon, hexagon, and counting sides']),
    s('bonds-10', 'Number bonds to 10', 'addsub', ['ten frame: how many more to make 10', 'pairs of objects that make 10', 'pairs as numbers', 'typed'], ['add-10']),
    s('part-whole-10', 'Part-whole within 10', 'addsub', ['whole and one part as objects', 'part-whole model with numbers', 'bar model'], ['bonds-10']),
    s('missing-10', 'Missing numbers within 10', 'addsub', ['3 + ? = 7 with objects', '3 + ? = 7 as numbers', '? − 2 = 5 as numbers', 'mixed, typed'], ['part-whole-10', 'sub-10']),
    s('fact-family-10', 'Fact families within 10', 'addsub', ['two sums from one picture', 'which sum belongs to the family', 'all four facts'], ['part-whole-10']),
    s('fluency-10', 'Add and take away within 10, fast and sure', 'addsub', ['mixed + and − with objects', 'mixed, numbers only', 'mixed with missing numbers', 'mixed, typed'], ['missing-10']),
    s('doubles-5', 'Doubles to 5 + 5', 'addsub', ['doubles with objects (mirror)', 'doubles on ten frames', 'doubles as numbers'], ['add-10']),
    s('odd-even', 'Odd and even', 'number', ['pairs up, with one left over or not (objects)', 'odd or even to 10', 'odd or even to 20'], ['doubles-5']),
    s('teens', 'Teen numbers: ten and some more', 'number', ['a full ten frame and some more', 'match teen numerals', 'teens on a number line'], ['bonds-10']),
    s('count-20', 'Count and order to 20', 'number', ['count objects to 20', 'number before and after', 'order numbers to 20'], ['teens']),
    s('add-20', 'Add within 20 (no crossing 10)', 'addsub', ['12 + 3 with ten frames', 'on a number line', 'sum only', 'typed'], ['teens', 'add-10']),
    s('sub-20', 'Take away within 20 (no crossing 10)', 'addsub', ['17 − 4 with ten frames', 'count back on a number line', 'sum only', 'typed'], ['teens', 'sub-10']),
    s('bonds-20', 'Number bonds to 20', 'addsub', ['two ten frames', 'from bonds to 10 (3 + 7 → 13 + 7)', 'as numbers'], ['bonds-10', 'teens']),
    s('count-10s', 'Count in 10s', 'number', ['bundles of 10 to 50', 'bundles of 10 to 100', 'missing tens in a sequence'], ['teens']),
    s('tens-ones', 'Tens and ones to 100', 'number', ['build with bundles and sticks to 50', 'read a number of bundles and sticks to 100', 'partition: 47 = 40 + 7', 'typed'], ['count-10s']),
    s('count-100', 'Count and order to 100', 'number', ['number before and after', 'on a number line', 'hundred square: find the missing number'], ['tens-ones']),
    s('compare-100', 'Compare numbers to 100', 'number', ['which is bigger, with bundles', 'which is bigger, numbers', 'choose < > =', 'order three numbers'], ['tens-ones']),
    s('measure-length', 'Measure length', 'measure', ['longer or shorter', 'measure in giant footsteps', 'measure in cm with a ruler'], ['count-20']),
    s('doubles-20', 'Doubles and halves to 20', 'addsub', ['doubles to 10 + 10 with objects', 'doubles as numbers', 'halves of even numbers to 20'], ['doubles-5', 'teens']),
    s('bridge-add', 'Add crossing 10 (make ten)', 'addsub', ['8 + 5 on ten frames: fill the ten first', 'on a number line in two jumps', 'sum only', 'typed'], ['add-20', 'bonds-10']),
    s('bridge-sub', 'Take away crossing 10', 'addsub', ['13 − 5 on ten frames: back to ten first', 'on a number line in two jumps', 'sum only', 'typed'], ['sub-20', 'bridge-add']),
    s('missing-20', 'Missing numbers within 20', 'addsub', ['8 + ? = 15 with ten frames', 'as numbers', 'typed'], ['bridge-add', 'missing-10']),
    s('word-problems', 'Story problems', 'addsub', ['add, within 10', 'take away, within 20', 'add or take away? within 20', 'two steps, within 20'], ['bridge-sub']),
    s('count-2s-5s', 'Count in 2s and 5s', 'number', ['count pairs (socks, shoes) in 2s', 'count hands in 5s', 'missing numbers in a 2s or 5s sequence'], ['count-10s']),
    s('groups', 'Equal groups', 'multdiv', ['are the groups equal?', 'how many altogether? (repeated addition)', 'make equal groups'], ['count-2s-5s']),
    s('arrays', 'Arrays', 'multdiv', ['count rows and columns', 'write the array as a multiplication', 'build an array'], ['groups']),
    s('times-2', '2 times table', 'multdiv', ['groups of 2 with objects', 'the 2s as numbers', 'typed'], ['groups']),
    s('times-10', '10 times table', 'multdiv', ['bundles of 10', 'the 10s as numbers', 'typed'], ['groups', 'count-10s']),
    s('times-5', '5 times table', 'multdiv', ['hands of 5', 'the 5s as numbers', 'typed'], ['groups']),
    s('coins', 'Money', 'measure', ['know the coins (1p–£2)', 'count 1p, 2p and 5p coins to 20p', 'pay an amount to 20p', 'count to £1 with 10p and 20p'], ['count-2s-5s', 'times-10']),
    s('share', 'Share equally (÷)', 'multdiv', ['share objects between 2', 'share between 2, 3, 4 or 5', 'as a division sum'], ['groups']),
    s('group-div', 'Group (÷)', 'multdiv', ['how many groups of 2?', 'groups of 2, 5 or 10', 'as a division sum'], ['share', 'times-5']),
    s('fractions', 'Halves, quarters, thirds', 'fractions', ['which shape shows a half', 'halves and quarters of shapes', 'half or quarter of an amount', 'thirds'], ['share']),
    s('time', 'Tell the time', 'measure', ['o’clock', 'half past', 'quarter past', 'quarter to', 'to 5 minutes'], ['fractions']),
    s('add-2d1d', 'Add a 2-digit and a 1-digit number', 'addsub', ['34 + 5 with bundles (no crossing)', '34 + 5 as numbers', '36 + 7 crossing a ten, with a number line', 'typed'], ['tens-ones', 'bridge-add']),
    s('sub-2d1d', 'Take a 1-digit number from a 2-digit number', 'addsub', ['37 − 4 with bundles (no crossing)', 'as numbers', '43 − 7 crossing a ten, with a number line', 'typed'], ['tens-ones', 'bridge-sub']),
    s('add-tens', 'Add and take away tens', 'addsub', ['34 + 20 with bundles', '34 + 20 as numbers', '54 − 30 as numbers'], ['add-2d1d']),
    s('add-2d2d', 'Add two 2-digit numbers', 'addsub', ['34 + 25 with bundles (no crossing)', 'as numbers', '38 + 25 crossing a ten', 'typed'], ['add-tens']),
    s('sub-2d2d', 'Take away two 2-digit numbers', 'addsub', ['57 − 23 with bundles (no crossing)', 'as numbers', '52 − 27 crossing a ten', 'typed'], ['add-2d2d', 'sub-2d1d']),
    s('missing-100', 'Missing numbers to 100', 'addsub', ['30 + ? = 100 (tens)', '45 + ? = 50', '? − 20 = 35', 'typed'], ['add-2d2d']),
    // The second adventure (lands 11–14): the rest of Year 2.
    s('tally', 'Tally charts and pictograms', 'measure', ['count a tally (to 10)', 'tallies in fives (to 20)', 'read a pictogram (one picture is one)', 'a pictogram where one picture is 2, 5 or 10', 'how many more? compare two rows'], ['count-2s-5s']),
    s('change', 'Totals and change', 'measure', ['two prices to 20p: how much altogether?', 'change from 10p', 'change from 20p', 'change from 50p and £1'], ['coins', 'sub-20']),
    s('count-3s', 'Count in 3s', 'multdiv', ['count groups of 3 objects', 'count on in 3s: the missing number', '3s as numbers (4 threes are 12)', 'typed'], ['groups', 'count-2s-5s']),
    s('time-5', 'Time to 5 minutes', 'measure', ['5, 10, 20 and 25 past', '5, 10, 20 and 25 to', 'any 5-minute time', 'set the hands', 'how long? (later and earlier)'], ['time']),
    s('turns', 'Turns and directions', 'geometry', ['quarter or half turn: which way now?', 'clockwise or anticlockwise', 'three-quarter turns', 'follow the directions: forwards, left, right'], ['fractions', 'shapes-2d']),
    s('shapes-3d', '3D shapes', 'geometry', ['cube, sphere, cylinder, cone', 'cuboid and pyramid too', 'count the faces', 'count the edges and corners (vertices)', 'which 2D shape is on a face?'], ['shapes-2d']),
    s('compare-measures', 'Heavier, fuller, hotter', 'measure', ['heavier or lighter? (a balance)', 'more full or less full?', 'hotter or colder?', 'order three'], ['compare-100']),
    s('read-scales', 'Read scales: kg, litres and °C', 'measure', ['kitchen scale in 1s (kg)', 'jug in litres, in steps of 2 or 5', 'thermometer in 10s (°C)', 'unnumbered marks between the numbers'], ['compare-measures', 'count-2s-5s', 'count-10s']),
  ].map((k) => [k.id, k]),
) as Record<SkillId, Skill>;

export const tierCount = (id: SkillId): number => SKILLS[id].tiers.length;
