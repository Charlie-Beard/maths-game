/**
 * Exports everything the game says to scripts/voice/lines.json, for
 * generate.py to record with ElevenLabs.
 *
 *   npx tsx scripts/voice/export.ts
 *
 *   lines    whole lines, each in its speaker's voice: phrases, praise,
 *            names, chapter intros (by their host), story lines, finales.
 *            'hero' story lines are recorded once for each child.
 *   pieces   the fixed words of every question and explanation, found by
 *            playing every generator at every tier with many seeds, each
 *            with the words around it in one example, so generate.py can
 *            say it the way it sounds mid-sentence.
 *   numbers  0–100 (and any bigger ones the generators use), each said
 *            mid-sentence and sentence-final.
 *
 * Lines with {name} are recorded twice: with DEFAULT_NAME and without.
 */
import { writeFileSync } from 'node:fs';
import { KEEPSAKE_NAMES } from '../../src/art/keepsakes';
import { ALL_CHAPTERS, AVATARS, LANDS } from '../../src/core/curriculum';
import { GENERATORS } from '../../src/core/generators';
import { CHARACTER_NAMES } from '../../src/core/names';
import { DEFAULT_NAME, generic, landLine, lineId, personalise, PHRASES, PRAISE, voiceId } from '../../src/core/phrases';
import { speechParts, speechText, type Speech } from '../../src/core/problem';
import { makeRand } from '../../src/core/random';
import { SKILL_IDS, tierCount } from '../../src/core/skills';
import { FINALE_LINES } from '../../src/scenes/finale-lands';
import { STORIES } from '../../src/stories';

/**
 * Seeds per skill and tier. Some pieces come from rare combinations (a
 * single "1 balloon" with one particular giver), so it takes many: 30000
 * found every piece that 60000 did (about 25 s). Check again with SEEDS=60000
 * after adding generators.
 */
const SEEDS = Number(process.env.SEEDS) || 30000;

// ------------------------------------------------------------------ lines

interface LineOut {
  id: string;
  text: string;
  speaker: string;
  /** Where it's said, for the review page: "phrase", "intro l1c3", "story l2c1" … */
  where: string;
  /** Why ElevenLabs might say it wrong: worth hearing first (generate.py --risky). */
  risky?: string;
}
const lines: LineOut[] = [];

/**
 * Words text-to-speech often gets wrong: sounds rather than words (it may
 * spell "Zzz" or "Hmph" out, or skip it), and shouted CAPITALS, which it
 * can read as letters ("EH" → "E. H."). Fix them with say_as in
 * elevenlabs.json once heard.
 */
const SOUNDS = /^(h+m+p?h?|u+h+m*|e+r+m+|b+r+|s+h+|p+s+t|t+u+t|g+r+|z{2,}|ugh|eek)$/i;
function risky(text: string): string | undefined {
  const words = text.match(/[A-Za-z][A-Za-z'’-]*/g) ?? [];
  const why = [
    ...words.filter((w) => SOUNDS.test(w)).map((w) => `sound “${w}”`),
    ...words.filter((w) => w.length >= 2 && w === w.toUpperCase()).map((w) => `capitals “${w}”`),
    ...(text.match(/[^\w\s.,!?’‘'\-…:;"“”()]/g) ?? []).map((c) => `symbol “${c}”`),
    ...(/(\w)\1\1/.test(text) ? ['stretched letters'] : []),
  ];
  return why.length ? [...new Set(why)].join(', ') : undefined;
}

const push = (text: string, speaker: string, where: string) => {
  const id = voiceId(text, speaker);
  if (!lines.some((l) => l.id === id)) lines.push({ id, text, speaker, where, ...(risky(text) ? { risky: risky(text) } : {}) });
};
const add = (template: string, speaker: string, where: string) => {
  if (template.includes('{name}')) {
    push(personalise(template, DEFAULT_NAME), speaker, where);
    push(generic(template), speaker, where);
  } else push(template, speaker, where);
};

Object.values(PHRASES).forEach((t) => add(t, 'narrator', 'phrase'));
PRAISE.forEach((t) => add(t, 'narrator', 'praise'));
LANDS.forEach((l) => {
  add(l.title, 'narrator', 'land');
  add(landLine(l.title), 'narrator', 'land');
});
Object.values(KEEPSAKE_NAMES).forEach((t) => add(t, 'narrator', 'keepsake'));
Object.values(CHARACTER_NAMES).forEach((t) => add(t, 'narrator', 'card'));
ALL_CHAPTERS.forEach((c) => add(c.intro, c.host, `intro ${c.id}`));
FINALE_LINES.forEach((t) => add(t, 'narrator', 'finale'));

for (const [id, load] of Object.entries(STORIES)) {
  const story = (await load()).default;
  for (const l of Object.values(story.lines)) {
    for (const who of l.who === 'hero' ? AVATARS : [l.who]) add(l.text, who, `story ${id}`);
  }
}

// ---------------------------------------------------- pieces and numbers

interface PieceOut {
  id: string;
  text: string;
  /** The words around it in one example sentence (unspoken context). */
  before: string;
  after: string;
  /** One whole example, for the review page (which can play it stitched together). */
  example: string;
  speech?: Speech;
}
const pieces = new Map<string, PieceOut>();
const numbers = new Set<number>();
/** Slot values that aren't whole numbers 0 and up: recorded as pieces. */
const words = new Set<string>();
const odd = new Set<string>();

const take = (s: Speech) => {
  const parts = speechParts(s);
  const said = parts.map((p) => ('piece' in p ? personalise(p.piece, DEFAULT_NAME) : String(p.value)));
  parts.forEach((p, i) => {
    if ('value' in p) {
      if (typeof p.value === 'number' && Number.isInteger(p.value) && p.value >= 0) numbers.add(p.value);
      else if (typeof p.value === 'number') odd.add(String(p.value));
      else words.add(p.value);
      return;
    }
    // A {name} slot left in the text is the child's name: a line, not a piece.
    if (p.piece === '{name}') return;
    const text = said[i];
    const id = lineId(text);
    if (!pieces.has(id)) {
      pieces.set(id, { id, text, before: said.slice(0, i).join(' '), after: said.slice(i + 1).join(' '), example: speechText(s), speech: s });
    }
  });
};

for (const skill of SKILL_IDS) {
  for (let tier = 1; tier <= tierCount(skill); tier++) {
    for (let seed = 1; seed <= SEEDS; seed++) {
      const p = GENERATORS[skill](tier, makeRand(seed * 7919 + tier));
      take(p.say);
      take(p.explain);
    }
  }
}
for (const w of words) {
  const id = lineId(w);
  if (!pieces.has(id)) pieces.set(id, { id, text: w, before: '', after: '', example: w });
}

const top = Math.max(100, ...numbers);
const numberList = Array.from({ length: top + 1 }, (_, n) => n);

// ------------------------------------------------------------------ write

writeFileSync(
  new URL('./lines.json', import.meta.url),
  JSON.stringify({ lines, pieces: [...pieces.values()], numbers: numberList }, null, 1) + '\n',
);

const chars = (xs: { text: string }[]) => xs.reduce((n, x) => n + x.text.length, 0);
const bySpeaker = new Map<string, number>();
lines.forEach((l) => bySpeaker.set(l.speaker, (bySpeaker.get(l.speaker) ?? 0) + 1));
console.log(`${lines.length} lines (${chars(lines)} characters)`);
console.log('  ' + [...bySpeaker].sort((a, b) => b[1] - a[1]).map(([s, n]) => `${s} ${n}`).join(', '));
console.log(`${pieces.size} pieces (${chars([...pieces.values()])} characters), ${words.size} of them slot words`);
console.log(`${numberList.length * 2} number clips (0–${top}, mid and end)`);
if (odd.size) console.log(`Not recordable as numbers (said by the iPad): ${[...odd].join(', ')}`);
const flagged = lines.filter((l) => l.risky);
console.log(`${flagged.length} risky lines (${chars(flagged)} characters): hear them first with generate.py --risky`);
