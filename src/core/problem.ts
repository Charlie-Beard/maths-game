/**
 * A problem: what the generators make and the activities show.
 *
 * Pure data, so it can be tested, logged and replayed. The `visual` says
 * what to draw (objects, a ten frame, a clock …); `activity` says how he
 * answers. An activity that isn't built yet falls back to `choose`, which
 * can show any problem, so every skill is playable from day one.
 */
import type { SkillId } from './skills';

/** Things to count and use in problems. Art for each is in art/props. */
export const PROP_IDS = [
  'popBiscuit',
  'toffee',
  'acorn',
  'saucepan',
  'toadstool',
  'apple',
  'cushion',
  'teacup',
  'hat',
  'googleBun',
  'jelly',
  'candle',
  'present',
  'balloon',
  'stick',
  'button',
  'potion',
  'star',
  'soldier',
  'teddy',
  'snowball',
  'sledge',
  'icicle',
  'key',
] as const;
export type PropId = (typeof PROP_IDS)[number];

export type ShapeId = 'circle' | 'square' | 'triangle' | 'rectangle' | 'pentagon' | 'hexagon' | 'oval' | 'star';

/** 3D shapes (land 13). */
export type SolidId = 'cube' | 'cuboid' | 'sphere' | 'cylinder' | 'cone' | 'pyramid';

/** A little grid to walk on (land 13, `turn`): the start square and the flags to land on. Rows count down from the top. */
export interface TurnGrid {
  cols: number;
  rows: number;
  col: number;
  row: number;
  flags: { id: string; col: number; row: number }[];
}

/** How he answers. Each has a module in src/activities. */
export type ActivityKind =
  | 'choose'
  | 'count'
  | 'tenFrame'
  | 'numberLine'
  | 'partWhole'
  | 'compare'
  | 'tensOnes'
  | 'groups'
  | 'share'
  | 'fraction'
  | 'clock'
  | 'coins'
  | 'shape'
  | 'numberPad'
  // The second adventure (lands 11–14). Until a module is registered for
  // one of these, `choose` shows the problem.
  | 'tally'
  | 'turn'
  | 'solid'
  | 'measure';

export interface ObjectGroup {
  prop: PropId;
  count: number;
  /** How many of them are crossed out / flying away (take away). */
  gone?: number;
}

/** What to draw. One case per kind of picture; extend as activities need. */
export type Visual =
  | { type: 'none' }
  | { type: 'objects'; groups: ObjectGroup[]; op?: '+' | '-'; layout?: 'row' | 'scatter' }
  | { type: 'dots'; count: number; pattern: 'dice' | 'frame' }
  | { type: 'tenFrame'; frames: number[]; add?: number; remove?: number; prop?: PropId }
  | { type: 'numberLine'; from: number; to: number; start: number; step?: number; marks?: number[] }
  | { type: 'partWhole'; whole: number | null; parts: (number | null)[]; model: 'cherry' | 'bar' }
  | { type: 'compare'; left: number; right: number; asObjects?: PropId }
  | { type: 'tensOnes'; tens: number; ones: number }
  | { type: 'groups'; groups: number; each: number; layout: 'groups' | 'array'; prop: PropId }
  | { type: 'share'; total: number; between: number; prop: PropId }
  | { type: 'fraction'; shape: 'circle' | 'rect'; parts: number; shaded: number; equal?: boolean }
  | { type: 'clock'; hour: number; minute: number }
  | { type: 'coins'; coins: number[]; target?: number }
  | { type: 'shape'; shape: ShapeId; turned?: number }
  | { type: 'length'; lengths: number[]; unit: 'footsteps' | 'cm' }
  // The second adventure (lands 11–14). Each is drawn by its own file in
  // src/activities/visuals/, owned by that land's workstream.
  /** A tally chart or pictogram: one row per thing counted (`per` = how many one picture stands for). */
  | { type: 'tally'; style: 'tally' | 'pictogram'; rows: { label: string; count: number; prop?: PropId }[]; per?: number }
  /** Something facing a way (0 = up, 90 = right …), and the turn it makes; or a path of moves. */
  | {
      type: 'turn';
      facing: number;
      turn?: number;
      dir?: 'cw' | 'acw';
      moves?: ('forward' | 'left' | 'right')[];
      /** 'turn' (default): the arrow and a curved arrow for the turn; 'before-after': a faded start and the bold end, no curve (which way did it turn?); 'arrow': just the arrow. */
      show?: 'turn' | 'before-after' | 'arrow';
      /** A grid to walk on (with `moves`): where he starts, and the flags he might land on. */
      grid?: TurnGrid;
    }
  /** One or more 3D shapes. */
  | {
      type: 'solid';
      solids: SolidId[];
      /** Draw the front face in gold, so he can say what shape it is. */
      face?: boolean;
      /** Lie a cylinder or cone on its side, so its round end faces him. */
      lying?: boolean;
      /** What is being counted (so help can number it). */
      ask?: 'faces' | 'edges' | 'corners';
    }
  /** A balance, kitchen scale, jug or thermometer, with its reading(s). */
  | { type: 'measure'; gauge: 'balance' | 'dial' | 'jug' | 'thermometer'; values: number[]; max: number; step: number; unit: 'kg' | 'l' | '°C'; labelEvery?: number };

export type Answer = number | string;

/**
 * Something said aloud. `text` may contain {slots}, filled from `vals`;
 * the voice records the fixed pieces between slots once and plays number
 * clips into the gaps (see audio/voice.ts).
 */
export interface Speech {
  text: string;
  vals?: Record<string, number | string>;
}

export interface Problem {
  skill: SkillId;
  tier: number;
  activity: ActivityKind;
  /** The question, spoken. */
  say: Speech;
  /** The written form, if this tier shows one: "4 + 3 = ?". */
  text?: string;
  answer: Answer;
  /** 3–4 options including the answer, for `choose`-style answering. */
  choices?: Answer[];
  visual: Visual;
  /** Read back after a right answer: "4 add 3 makes 7!". */
  explain: Speech;
  /** Identifies the maths, to avoid the same problem twice in a row. */
  key: string;
  /** True while this skill's generator isn't written yet (a stand-in problem). */
  placeholder?: boolean;
}

/** A piece of a question's speech: fixed words, or a slot's value. */
export type SpeechPart = { piece: string } | { value: number | string; end: boolean };

/**
 * Splits "Moon-Face has {a} biscuits." into pieces and slots, the way the
 * voice plays it back (and scripts/voice/export.ts records it). A slot's
 * `end` is true when it ends the sentence, so it gets a falling tone.
 *
 * "£{n}" is written before the number but said after it, so it becomes
 * "{n} pound(s)". Bits with no words ("?", ", ") are left out: there's
 * nothing to say, and the gap between clips is the pause.
 */
export function speechParts(s: Speech): SpeechPart[] {
  const text = s.text.replace(/£\{(\w+)\}/g, (m, k: string) => (s.vals?.[k] === undefined ? m : `{${k}} ${s.vals[k] === 1 ? 'pound' : 'pounds'}`));
  const out: SpeechPart[] = [];
  const said = (piece: string) => {
    if (/[\p{L}\p{N}]/u.test(piece)) out.push({ piece });
  };
  const re = /\{(\w+)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    said(text.slice(last, m.index).trim());
    const v = s.vals?.[m[1]];
    const rest = text.slice(m.index + m[0].length).trim();
    if (v !== undefined) out.push({ value: v, end: !rest || /^[.!?…]/.test(rest) });
    else out.push({ piece: m[0] });
    last = m.index + m[0].length;
  }
  said(text.slice(last).trim());
  return out;
}

/** Fills a speech's slots: "{a} and {b}" → "4 and 3". */
export function speechText(s: Speech): string {
  return s.text.replace(/\{(\w+)\}/g, (m, k: string) => (s.vals && k in s.vals ? String(s.vals[k]) : m));
}
