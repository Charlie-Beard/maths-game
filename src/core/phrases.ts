/**
 * Everything the narrator says outside stories and questions. Pre-recorded
 * at the end (scripts/voice, ElevenLabs), with the iPad's own speech as a
 * fallback until then.
 */

export const PRAISE = [
  'Brilliant, {name}!',
  'Well done, {name}!',
  'That’s right!',
  'Super sums, {name}!',
  'You got it!',
  'Fantastic!',
  'Clever clogs!',
  'Moon-Face would be proud!',
  'Pop-biscuit perfect!',
  'Toffee-tastic!',
] as const;

export const PHRASES = {
  welcome: 'Welcome to the Faraway Tree, {name}!',
  choose: 'Who will you climb the tree with, {name}?',
  beth: 'Beth!',
  joe: 'Joe!',
  fran: 'Fran!',
  letsGo: 'Let’s climb, {name}!',
  tryAgain: 'Hmm, have another look.',
  listenAgain: 'Listen again…',
  showMe: 'Let’s look at it another way.',
  silkyHelp: 'Silky can help!',
  silkyHere: 'Let’s work it out together.',
  chapterDone: 'You finished the chapter, {name}!',
  newKeepsake: 'You found a keepsake!',
  newCard: 'You got a new card!',
  newSeal: 'You finished the whole land!',
  landMoving: 'The land is moving on! Quick, down the ladder!',
  practice: 'Let’s practise with Silky!',
  practiceDone: 'Lovely practising, {name}!',
  leaveAsk: 'Back to the tree?',
  turnSideways: 'Please turn the iPad sideways.',
  comeBackTomorrow: 'That’s all the new adventures for today. The story goes on tomorrow! You can play old ones, or practise with Silky.',
  allDone: 'Hooray! All done!',
} as const;

export type PhraseKey = keyof typeof PHRASES;

/** Announced when a new land arrives at the top of the tree. */
export const landLine = (title: string): string => `${title} has come to the top of the tree!`;

/** The player's name. Lines may contain {name}. */
export const DEFAULT_NAME = 'Jasper';

/** A line with the child's name in it. */
export function personalise(text: string, name: string): string {
  const n = name.trim();
  return n ? text.split('{name}').join(n) : generic(text);
}

/**
 * The same line without a name. A name that only calls him is left out
 * ("Well done, {name}!" → "Well done!"); one that's part of the sentence
 * becomes "you" ("{name} won the seal!" → "You won the seal!"). This is
 * also what's said, from the recording, when he has a name other than the
 * recorded DEFAULT_NAME.
 */
export function generic(text: string): string {
  const t = text
    .replace(/,\s*\{name\}(?=[!?.…,:]|$)/g, '')
    .replace(/(^|[.!?…]\s+)\{name\},\s*/g, '$1')
    .replace(/(^|[.!?…]\s+)\{name\}/g, '$1You')
    .replace(/\{name\}/g, 'you')
    .replace(/\s+([!?.…])/g, '$1');
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Stable id for any spoken line, used as its audio file name. */
export function lineId(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/**
 * Id of a line said in a speaker's voice. The same words can be said by
 * two characters ("Hooray!"), so a character's id includes who says it;
 * the narrator's is just the text's.
 */
export function voiceId(text: string, who = 'narrator'): string {
  return lineId(who === 'narrator' ? text : `${who}|${text}`);
}
