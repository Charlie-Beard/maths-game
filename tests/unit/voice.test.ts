import { describe, expect, it } from 'vitest';
import voices from '../../scripts/voice/elevenlabs.json';
import { ALL_CHAPTERS } from '../../src/core/curriculum';
import { CHARACTER_NAMES } from '../../src/core/names';
import { generic, lineId, voiceId } from '../../src/core/phrases';
import { GENERATORS } from '../../src/core/generators';
import { speechParts, speechText } from '../../src/core/problem';
import { makeRand } from '../../src/core/random';
import { SKILL_IDS, tierCount } from '../../src/core/skills';

describe('voice ids', () => {
  it('keep the narrator’s ids as they were', () => {
    expect(voiceId('Well done!')).toBe(lineId('Well done!'));
    expect(voiceId('Well done!', 'narrator')).toBe(lineId('Well done!'));
  });

  it('give the same words a different clip for each speaker', () => {
    const ids = ['narrator', 'moonface', 'silky', 'beth'].map((who) => voiceId('Hooray!', who));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// The nameless version is recorded too, and played for any name but the recorded one: it must still make sense.
describe('lines without a name', () => {
  it('leave out a name that only calls him', () => {
    expect(generic('Well done, {name}!')).toBe('Well done!');
    expect(generic('{name}, look!')).toBe('Look!');
    expect(generic('Quick, {name}, down the ladder!')).toBe('Quick, down the ladder!');
    expect(generic('Who will you climb the tree with, {name}?')).toBe('Who will you climb the tree with?');
  });

  it('say “you” for a name that’s part of the sentence', () => {
    expect(generic('{name} won a spinning top!')).toBe('You won a spinning top!');
    expect(generic('And {name} won the seal!')).toBe('And you won the seal!');
    expect(generic('A bun for {name}! Now, mind the windows.')).toBe('A bun for you! Now, mind the windows.');
    expect(generic('Five… none! {name} counted every hat.')).toBe('Five… none! You counted every hat.');
  });
});

describe('elevenlabs.json', () => {
  const speakers = voices.speakers as Record<string, { voice_id: string; speed?: number; stability?: number }>;

  // A character without a voice would quietly speak in the narrator's.
  it('has a voice for the narrator and every character', () => {
    for (const who of ['narrator', ...Object.keys(CHARACTER_NAMES)]) expect(speakers, who).toHaveProperty(who);
  });

  it('only lists real speakers, with sensible settings', () => {
    for (const [who, s] of Object.entries(speakers)) {
      expect(['narrator', ...Object.keys(CHARACTER_NAMES)], who).toContain(who);
      expect(s.voice_id, who).toMatch(/^\w{10,}$/);
      if (s.speed !== undefined) expect(s.speed, who).toBeGreaterThanOrEqual(0.7);
      if (s.speed !== undefined) expect(s.speed, who).toBeLessThanOrEqual(1.2);
      if (s.stability !== undefined) expect(s.stability, who).toBeGreaterThanOrEqual(0);
      if (s.stability !== undefined) expect(s.stability, who).toBeLessThanOrEqual(1);
    }
  });

  it('has a voice for every chapter’s host (they say the intro)', () => {
    for (const c of ALL_CHAPTERS) expect(speakers, `${c.id}: ${c.host}`).toHaveProperty(c.host);
  });
});

describe('speechParts', () => {
  it('splits a question into pieces and numbers, marking the one that ends a sentence', () => {
    expect(speechParts({ text: 'Moon-Face has {a} biscuits. He eats {b}. How many now?', vals: { a: 7, b: 2 } })).toEqual([
      { piece: 'Moon-Face has' },
      { value: 7, end: false },
      { piece: 'biscuits. He eats' },
      { value: 2, end: true },
      { piece: '. How many now?' },
    ]);
  });

  it('leaves a slot with no value as a piece', () => {
    expect(speechParts({ text: 'Well done, {name}!' })).toEqual([{ piece: 'Well done,' }, { piece: '{name}' }]);
  });

  // ElevenLabs can't record "?" on its own, and a piece that can't be recorded sends the whole question to the iPad's voice.
  it('leaves out bits with nothing to say', () => {
    expect(speechParts({ text: 'What is one more than {n}?', vals: { n: 5 } })).toEqual([{ piece: 'What is one more than' }, { value: 5, end: true }]);
    expect(speechParts({ text: '{a}, {b} and {c}.', vals: { a: 1, b: 2, c: 3 } }).filter((p) => 'piece' in p)).toEqual([{ piece: 'and' }]);
  });

  it('says money the way it’s spoken: “£2” is “2 pounds”', () => {
    expect(speechParts({ text: 'Can you find the £{n} coin?', vals: { n: 1 } })).toEqual([
      { piece: 'Can you find the' },
      { value: 1, end: false },
      { piece: 'pound coin?' },
    ]);
    expect(speechParts({ text: 'That’s £{n}!', vals: { n: 2 } })).toEqual([{ piece: 'That’s' }, { value: 2, end: false }, { piece: 'pounds!' }]);
  });

  it('every question and explanation can be stitched from recordable pieces', () => {
    for (const skill of SKILL_IDS) {
      for (let tier = 1; tier <= tierCount(skill); tier++) {
        for (let seed = 1; seed <= 40; seed++) {
          const p = GENERATORS[skill](tier, makeRand(seed));
          for (const s of [p.say, p.explain]) {
            for (const part of speechParts(s)) {
              if ('piece' in part) expect(part.piece, speechText(s)).toMatch(/[\p{L}\p{N}]/u);
              else expect(Number.isInteger(part.value) && (part.value as number) >= 0, speechText(s)).toBe(true);
            }
          }
        }
      }
    }
  });
});
