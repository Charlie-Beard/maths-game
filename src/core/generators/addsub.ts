/**
 * Generators owned by workstream W1b (docs/ROADMAP.md): adding and taking
 * away, from part-whole within 10 up to 2-digit sums. The generators live
 * in generators/addsub/; generators/index.ts picks them up from ADDSUB.
 */
import type { SkillId } from '../skills';
import type { Generator } from './helpers';
import { wordProblems } from './addsub/stories';
import { add2d1d, add2d2d, addTens, missing100, sub2d1d, sub2d2d } from './addsub/to100';
import { doubles5, factFamily10, fluency10, missing10, partWhole10 } from './addsub/within10';
import { add20, bonds20, bridgeAdd, bridgeSub, doubles20, missing20, sub20 } from './addsub/within20';

export const ADDSUB: Partial<Record<SkillId, Generator>> = {
  'part-whole-10': partWhole10,
  'missing-10': missing10,
  'fact-family-10': factFamily10,
  'fluency-10': fluency10,
  'doubles-5': doubles5,
  'add-20': add20,
  'sub-20': sub20,
  'bonds-20': bonds20,
  'doubles-20': doubles20,
  'bridge-add': bridgeAdd,
  'bridge-sub': bridgeSub,
  'missing-20': missing20,
  'word-problems': wordProblems,
  'add-2d1d': add2d1d,
  'sub-2d1d': sub2d1d,
  'add-tens': addTens,
  'add-2d2d': add2d2d,
  'sub-2d2d': sub2d2d,
  'missing-100': missing100,
};
