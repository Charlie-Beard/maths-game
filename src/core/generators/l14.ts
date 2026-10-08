/**
 * Generators for land 14, the Land of the Red Goblins: `compare-measures`, `read-scales`.
 * Each follows its skill's tiers in core/skills.ts (concrete → pictorial →
 * abstract) and the conventions in the header of generators/more.ts.
 *
 * Conventions the activity and the picture rely on (visuals/measure.ts):
 *
 * - `compare-measures` is answered by **tapping the thing**, never by reading
 *   a word. The activity is `measure`. With two things the answer is `'left'`
 *   or `'right'`; with three (tier 4) he taps them in order and the answer is
 *   the order of their indexes, left to right, joined by commas ('1,0,2').
 *   The pictures carry `labelEvery: 0` (no marks) except the sacks on the
 *   shelf at tier 4, which have their weights on tags.
 *   Tier 1 is a balance of two sacks tilted by their weights; tier 2 two
 *   jugs of goblin soup; tier 3 two thermometers (hot and cold caves); tier 4
 *   three of any of them.
 * - `read-scales` has one value on the gauge, always exactly on a mark (a
 *   multiple of `step`), and the answer is that number: tiers 1 to 3 are a
 *   dial in kg (1s), a jug in litres (2s or 5s) and a thermometer in °C (10s),
 *   with every mark numbered; tier 4 leaves some marks without a number.
 * - Units are said in words with the number in a {slot}: "{n} kilograms",
 *   "{n} litres", "{n} degrees" (singular for 1). They are written on the
 *   picture and in `text` as kg, litres and °C.
 */
import type { Answer, Problem, Speech } from '../problem';
import type { Rand } from '../random';
import type { SkillId } from '../skills';
import type { Generator } from './helpers';

type Measure = Extract<Problem['visual'], { type: 'measure' }>;
type Unit = Measure['unit'];

/** A number and its unit, spoken: "{n} kilograms", "1 litre", "{n} degrees". */
function amount(unit: Unit, n: number, slot = 'n'): Speech {
  const one = n === 1;
  const word = unit === 'kg' ? (one ? 'kilogram' : 'kilograms') : unit === 'l' ? (one ? 'litre' : 'litres') : one ? 'degree' : 'degrees';
  return { text: `{${slot}} ${word}`, vals: { [slot]: n } };
}

/** The unit as written under a sum. */
const written = (unit: Unit): string => (unit === 'l' ? 'litres' : unit);

// ---------------------------------------------------------------------------
// compare-measures: heavier, fuller, hotter

type Gauge = 'balance' | 'jug' | 'thermometer';

/** `count` different values from a list, each at least `gap` apart. */
function spread(pool: readonly number[], count: number, gap: number, r: Rand): number[] {
  for (let tries = 0; tries < 200; tries++) {
    const pick = r.shuffle(pool).slice(0, count);
    if (pick.every((a, i) => pick.every((b, j) => i === j || Math.abs(a - b) >= gap))) return pick;
  }
  // Never reached with the pools used here; a spread from both ends keeps it safe.
  return [pool[0], pool[pool.length - 1], pool[Math.floor(pool.length / 2)]].slice(0, count);
}

const range = (lo: number, hi: number, by = 1): number[] => Array.from({ length: Math.floor((hi - lo) / by) + 1 }, (_, i) => lo + i * by);

const compareMeasures: Generator = (tier, r) => {
  const base = { skill: 'compare-measures' as SkillId, tier, activity: 'measure' as const };

  if (tier <= 3) {
    const gauge: Gauge = tier === 1 ? 'balance' : tier === 2 ? 'jug' : 'thermometer';
    // The weights, litres or degrees of the two things.
    const [a, b] = tier === 1 ? spread(range(1, 9), 2, 1, r) : tier === 2 ? spread(range(1, 9), 2, 2, r) : spread(range(5, 45, 5), 2, 10, r);
    const more = r.chance(0.5);
    const words =
      tier === 1
        ? { more: 'heavier', less: 'lighter', q: 'Which sack is', thing: 'sack' }
        : tier === 2
          ? { more: 'more full', less: 'less full', q: 'Which jug is', thing: 'jug' }
          : { more: 'hotter', less: 'colder', q: 'Which cave is', thing: 'cave' };
    const side = (a > b) === more ? 'left' : 'right';
    const explain =
      tier === 1
        ? more
          ? 'The sack that hangs lower is heavier.'
          : 'The sack that hangs higher is lighter.'
        : tier === 2
          ? more
            ? 'The jug with more soup is more full.'
            : 'The jug with less soup is less full.'
          : more
            ? 'The mercury goes higher, so it is hotter.'
            : 'The mercury stays lower, so it is colder.';
    return {
      ...base,
      say: { text: `${words.q} ${more ? words.more : words.less}? Tap it.` },
      answer: side,
      choices: ['left', 'right'],
      visual: { type: 'measure', gauge, values: [a, b], max: tier === 3 ? 50 : 10, step: tier === 3 ? 5 : 1, unit: tier === 1 ? 'kg' : tier === 2 ? 'l' : '°C', labelEvery: 0 },
      explain: { text: explain },
      key: `compare-measures:${tier}:${more ? 'more' : 'less'}:${a}v${b}`,
    };
  }

  // Tier 4: three things in order, tapped one by one.
  const gauge = r.pick<Gauge>(['balance', 'jug', 'thermometer']);
  const values = gauge === 'balance' ? spread(range(1, 9), 3, 1, r) : gauge === 'jug' ? spread(range(1, 9), 3, 2, r) : spread(range(5, 45, 5), 3, 10, r);
  const up = r.chance(0.5);
  const order = [0, 1, 2].sort((i, j) => (up ? values[i] - values[j] : values[j] - values[i]));
  const say =
    gauge === 'balance'
      ? up
        ? 'Tap the sacks from lightest to heaviest.'
        : 'Tap the sacks from heaviest to lightest.'
      : gauge === 'jug'
        ? up
          ? 'Tap the jugs from least full to most full.'
          : 'Tap the jugs from most full to least full.'
        : up
          ? 'Tap the caves from coldest to hottest.'
          : 'Tap the caves from hottest to coldest.';
  const explain =
    gauge === 'balance'
      ? 'The smallest number is the lightest sack.'
      : gauge === 'jug'
        ? 'The level of the soup goes up as the jug fills.'
        : 'The mercury climbs as it gets hotter.';
  const answer: Answer = order.join(',');
  return {
    ...base,
    say: { text: say },
    answer,
    visual: { type: 'measure', gauge, values, max: gauge === 'thermometer' ? 50 : 10, step: gauge === 'thermometer' ? 5 : 1, unit: gauge === 'balance' ? 'kg' : gauge === 'jug' ? 'l' : '°C', labelEvery: 0 },
    explain: { text: explain },
    key: `compare-measures:4:${gauge}:${up ? 'up' : 'down'}:${values.join('-')}`,
  };
};

// ---------------------------------------------------------------------------
// read-scales: kg, litres and °C

/** Choices that are all marks on the scale: the answer, its neighbours and the likely slips. */
function markChoices(answer: number, step: number, max: number, likely: number[], r: Rand): number[] {
  const out = new Set<number>([answer]);
  const ok = (n: number) => n % step === 0 && n >= step && n <= max && !out.has(n);
  for (const n of r.shuffle(likely)) if (out.size < 4 && ok(n)) out.add(n);
  for (let d = step; out.size < 4 && d <= max; d += step) {
    for (const n of r.shuffle([answer - d, answer + d])) if (out.size < 4 && ok(n)) out.add(n);
  }
  return r.shuffle([...out]);
}

interface Scale {
  gauge: 'dial' | 'jug' | 'thermometer';
  max: number;
  step: number;
  /** Marks per written number. */
  every: number;
}

const SCALES: Record<number, Scale[]> = {
  1: [{ gauge: 'dial', max: 10, step: 1, every: 1 }],
  2: [
    { gauge: 'jug', max: 10, step: 2, every: 1 },
    { gauge: 'jug', max: 12, step: 2, every: 1 },
    { gauge: 'jug', max: 20, step: 5, every: 1 },
  ],
  3: [
    { gauge: 'thermometer', max: 50, step: 10, every: 1 },
    { gauge: 'thermometer', max: 60, step: 10, every: 1 },
  ],
  4: [
    { gauge: 'jug', max: 20, step: 2, every: 5 },
    { gauge: 'jug', max: 20, step: 5, every: 2 },
    { gauge: 'thermometer', max: 100, step: 10, every: 2 },
    { gauge: 'thermometer', max: 50, step: 5, every: 2 },
    { gauge: 'dial', max: 20, step: 2, every: 5 },
  ],
};

const UNIT: Record<Scale['gauge'], Unit> = { dial: 'kg', jug: 'l', thermometer: '°C' };

const readScales: Generator = (tier, r) => {
  const sc = r.pick(SCALES[tier]);
  const unit = UNIT[sc.gauge];
  const marks = range(1, Math.floor(sc.max / sc.step)).map((i) => i * sc.step);
  // Not the top mark (it would run off the end of the jug or tube), and from tier 4
  // mostly marks with no number, so he has to count along.
  const usable = marks.filter((m) => m < sc.max || sc.gauge === 'dial');
  const bare = usable.filter((m) => (m / sc.step) % sc.every !== 0);
  const value = tier === 4 && bare.length && r.chance(0.75) ? r.pick(bare) : r.pick(usable);

  // Slips he might make: the next mark either way, and the nearest written numbers.
  const gap = sc.step * sc.every;
  const likely = [value - sc.step, value + sc.step, Math.floor(value / gap) * gap, Math.ceil(value / gap) * gap];
  const choices = markChoices(value, sc.step, sc.max, likely, r);

  const ask =
    tier === 4
      ? 'Not every mark has a number.'
      : sc.gauge === 'dial'
        ? 'The sack of gold is on the scale.'
        : sc.gauge === 'jug'
          ? 'The goblins made soup.'
          : 'This is the goblins’ cave.';
  const howMany = sc.gauge === 'dial' ? 'How many kilograms?' : sc.gauge === 'jug' ? 'How many litres of soup?' : 'How many degrees?';
  const reading = amount(unit, value);
  const noun = sc.gauge === 'dial' ? 'The pointer' : sc.gauge === 'jug' ? 'The soup' : 'The mercury';
  return {
    skill: 'read-scales',
    tier,
    activity: 'choose',
    say: { text: `${ask} ${howMany}` },
    text: `? ${written(unit)}`,
    answer: value,
    choices,
    visual: { type: 'measure', gauge: sc.gauge, values: [value], max: sc.max, step: sc.step, unit, labelEvery: sc.every },
    explain: { text: `${noun} is at ${reading.text}.`, vals: reading.vals },
    key: `read-scales:${tier}:${sc.gauge}:${sc.max}/${sc.step}/${sc.every}:${value}`,
  };
};

export const L14: Partial<Record<SkillId, Generator>> = {
  'compare-measures': compareMeasures,
  'read-scales': readScales,
};
