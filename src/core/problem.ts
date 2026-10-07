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
  | 'numberPad';

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
  | { type: 'length'; lengths: number[]; unit: 'footsteps' | 'cm' };

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

/** Fills a speech's slots: "{a} and {b}" → "4 and 3". */
export function speechText(s: Speech): string {
  return s.text.replace(/\{(\w+)\}/g, (m, k: string) => (s.vals && k in s.vals ? String(s.vals[k]) : m));
}
