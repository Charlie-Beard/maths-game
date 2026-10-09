/**
 * Generators for land 13, the Land of Roundabouts: `turns`, `shapes-3d`.
 * Each follows its skill's tiers in core/skills.ts (concrete → pictorial →
 * abstract) and the conventions in the header of generators/more.ts.
 *
 * Conventions the activities (`turn`, `solid`) rely on:
 *
 * - **Every answer is a picture he can tap.** The words are strings only so
 *   the checker can compare them.
 *   `turns` answers a direction ('up' | 'right' | 'down' | 'left', drawn as
 *   arrows), a way round ('clockwise' | 'anticlockwise', drawn as curved
 *   arrows round a little clock) or a flag colour ('blue' | 'gold' | 'green'
 *   | 'pink', tapped on the grid).
 *   `shapes-3d` answers a SolidId (drawn as solids), a number (cards), or a
 *   ShapeId (drawn as flat shapes).
 * - `turn` visual: `facing` is degrees clockwise from up (0 up, 90 right,
 *   180 down, 270 left); `turn` is 90, 180 or 270 in the `dir` ('cw' |
 *   'acw'). `show: 'before-after'` draws a faded start and a bold end and
 *   asks which way it went. With a `grid`, `moves` are followed from the
 *   start square: 'forward' steps one square; 'left' and 'right' turn a
 *   quarter that way and then step one square.
 * - `solid` visual: `solids` are drawn big. A "find it" question ("Tap the
 *   cone") has visual `none`, so the pictures on the cards are the choices.
 * - Counting questions say "flat faces" (a cylinder has 2, a cone 1, a
 *   sphere none) and use the corners (vertices) and edges of the three
 *   solids with flat faces and straight edges (cube, cuboid, pyramid).
 *
 * Numbers in speech are always in {slots}.
 */
import type { Answer, Problem, ShapeId, SolidId, Speech } from '../problem';
import type { Rand } from '../random';
import type { SkillId } from '../skills';
import { choicesFor, type Generator } from './helpers';

// ---------------------------------------------------------------------------
// Turns

export const DIRS = ['up', 'right', 'down', 'left'] as const;
export type Dir = (typeof DIRS)[number];

export const angleOf = (d: Dir): number => DIRS.indexOf(d) * 90;
export const dirAt = (deg: number): Dir => DIRS[(((Math.round(deg / 90) % 4) + 4) % 4) as 0 | 1 | 2 | 3];

/** Where something facing `facing` ends up after a turn. */
export const turnedTo = (facing: Dir, turn: number, dir: 'cw' | 'acw'): Dir => dirAt(angleOf(facing) + (dir === 'cw' ? turn : -turn));

const POINTS: Record<Dir, string> = { up: 'up', right: 'to the right', down: 'down', left: 'to the left' };
const AMOUNT: Record<number, string> = { 90: 'a quarter turn', 180: 'a half turn', 270: 'three quarters of a turn' };
const WAY = { cw: 'clockwise', acw: 'anticlockwise' } as const;

/** Picks likely wrong directions first (turned the wrong way, did not turn, a different amount), then any. */
function dirChoices(answer: Dir, facing: Dir, turn: number, dir: 'cw' | 'acw', count: number, r: Rand): Dir[] {
  const other = dir === 'cw' ? 'acw' : 'cw';
  const likely: Dir[] = [turnedTo(facing, turn, other), facing, turnedTo(facing, turn === 180 ? 90 : 180, dir), turnedTo(facing, 90, dir), turnedTo(facing, 270, dir)];
  const out: Dir[] = [answer];
  for (const d of likely) if (out.length < count && !out.includes(d)) out.push(d);
  for (const d of r.shuffle([...DIRS])) if (out.length < count && !out.includes(d)) out.push(d);
  return r.shuffle(out);
}

/** "The arrow points up. It turns a quarter turn clockwise. Which way does it point now?" */
function whichWay(tier: number, r: Rand): Problem {
  const facing = r.pick<Dir>([...DIRS]);
  const turn = tier === 1 ? r.pick([90, 90, 180]) : tier === 2 ? 90 : r.pick([270, 270, 270, 180, 90]);
  const dir: 'cw' | 'acw' = tier === 1 ? 'cw' : r.pick(['cw', 'acw']);
  const answer = turnedTo(facing, turn, dir);
  const how = tier === 1 ? ', the way a clock goes' : ` ${WAY[dir]}`;
  const say: Speech = { text: `The arrow points ${POINTS[facing]}. It turns ${AMOUNT[turn]}${how}. Which way does it point now?` };
  return {
    skill: 'turns',
    tier,
    activity: 'turn',
    say,
    answer,
    choices: dirChoices(answer, facing, turn, dir, tier === 1 ? 3 : 4, r),
    visual: { type: 'turn', facing: angleOf(facing), turn, dir },
    explain: { text: `The arrow turns ${AMOUNT[turn]} ${WAY[dir]}. It points ${POINTS[answer]}!` },
    key: `turns:way:${facing}:${turn}:${dir}`,
  };
}

/** "The faded arrow is where it started. Did it turn clockwise or anticlockwise?" */
function clockOrNot(r: Rand): Problem {
  const facing = r.pick<Dir>([...DIRS]);
  const dir: 'cw' | 'acw' = r.pick(['cw', 'acw']);
  const answer = WAY[dir];
  return {
    skill: 'turns',
    tier: 2,
    activity: 'turn',
    say: { text: 'The arrow had a quarter turn. The faded arrow is where it started. Did it turn clockwise or anticlockwise?' },
    answer,
    choices: r.shuffle<Answer>(['clockwise', 'anticlockwise']),
    visual: { type: 'turn', facing: angleOf(facing), turn: 90, dir, show: 'before-after' },
    explain: { text: dir === 'cw' ? 'It went the way a clock goes. That is clockwise!' : 'It went the other way to a clock’s hands. That is anticlockwise!' },
    key: `turns:which:${facing}:${dir}`,
  };
}

type Move = 'forward' | 'left' | 'right';
const FLAGS = ['blue', 'gold', 'green', 'pink'] as const;
const COLS = 5;
const ROWS = 5;

function walk(col: number, row: number, facing: Dir, moves: Move[]): { col: number; row: number } | null {
  let f = angleOf(facing);
  for (const m of moves) {
    if (m === 'left') f -= 90;
    if (m === 'right') f += 90;
    const d = dirAt(f);
    col += d === 'right' ? 1 : d === 'left' ? -1 : 0;
    row += d === 'down' ? 1 : d === 'up' ? -1 : 0;
    if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return null;
  }
  return { col, row };
}

const swapLR = (m: Move): Move => (m === 'left' ? 'right' : m === 'right' ? 'left' : m);

/** Follow the arrows on a little paving path: forwards, left, right. */
function followPath(r: Rand): Problem {
  let facing: Dir = 'up';
  let start = { col: 2, row: 4 };
  let moves: Move[] = ['forward', 'right', 'forward'];
  let end = walk(start.col, start.row, facing, moves)!;
  for (let attempt = 0; attempt < 60; attempt++) {
    const f = r.pick<Dir>(['up', 'up', 'right', 'down', 'left']);
    const s = { col: r.int(0, COLS - 1), row: r.int(0, ROWS - 1) };
    const n = r.int(2, 4);
    const m: Move[] = Array.from({ length: n }, () => r.pick<Move>(['forward', 'forward', 'left', 'right']));
    if (!m.some((x) => x !== 'forward')) continue;
    const e = walk(s.col, s.row, f, m);
    if (!e || (e.col === s.col && e.row === s.row)) continue;
    facing = f;
    start = s;
    moves = m;
    end = e;
    break;
  }
  // Likely mistakes: left and right swapped, forgetting to turn, stopping a move early.
  const cells: { col: number; row: number }[] = [];
  const free = (c: { col: number; row: number } | null): c is { col: number; row: number } =>
    !!c && !(c.col === start.col && c.row === start.row) && !(c.col === end.col && c.row === end.row) && !cells.some((o) => o.col === c.col && o.row === c.row);
  const tries = [
    walk(start.col, start.row, facing, moves.map(swapLR)),
    walk(start.col, start.row, facing, moves.map(() => 'forward' as Move)),
    walk(start.col, start.row, facing, moves.slice(0, -1)),
  ];
  for (const c of tries) if (cells.length < 3 && free(c)) cells.push(c);
  for (let i = 0; i < 80 && cells.length < 3; i++) {
    const c = { col: r.int(0, COLS - 1), row: r.int(0, ROWS - 1) };
    if (free(c)) cells.push(c);
  }
  const colours = r.shuffle([...FLAGS]);
  const flags = [end, ...cells].map((c, i) => ({ id: colours[i] as string, col: c.col, row: c.row }));
  const answer = flags[0].id;
  const route = moves.map((m) => (m === 'forward' ? 'f' : m === 'left' ? 'l' : 'r')).join('');
  return {
    skill: 'turns',
    tier: 4,
    activity: 'turn',
    say: { text: 'Start at the arrow. Follow the cards, one at a time. Left and right mean turn, then step. Which flag do you land on?' },
    answer,
    choices: r.shuffle(flags.map((f) => f.id as Answer)),
    visual: { type: 'turn', facing: angleOf(facing), moves, grid: { cols: COLS, rows: ROWS, col: start.col, row: start.row, flags } },
    explain: { text: `Forwards is one step. Left and right mean turn, then one step. You land on the ${answer} flag!` },
    key: `turns:path:${facing}:${start.col}${start.row}:${route}`,
  };
}

export function turns(tier: number, r: Rand): Problem {
  if (tier === 2 && r.chance(0.5)) return clockOrNot(r);
  if (tier >= 4) return followPath(r);
  return whichWay(tier, r);
}

// ---------------------------------------------------------------------------
// 3D shapes

/** The facts about each solid: flat faces, straight or curved edges, and corners (vertices). */
export const SOLID_FACTS: Record<SolidId, { faces: number; edges: number; corners: number }> = {
  cube: { faces: 6, edges: 12, corners: 8 },
  cuboid: { faces: 6, edges: 12, corners: 8 },
  pyramid: { faces: 5, edges: 8, corners: 5 },
  cylinder: { faces: 2, edges: 2, corners: 0 },
  cone: { faces: 1, edges: 1, corners: 1 },
  sphere: { faces: 0, edges: 0, corners: 0 },
};

const LIKE: Record<SolidId, string> = {
  cube: 'like a dice',
  cuboid: 'like a cereal box',
  sphere: 'like a ball',
  cylinder: 'like a tin of beans',
  cone: 'like a party hat',
  pyramid: 'like a pyramid in Egypt',
};

/** What children muddle each solid with, most likely first. */
const MIXUPS: Record<SolidId, SolidId[]> = {
  cube: ['cuboid', 'pyramid', 'cylinder', 'sphere', 'cone'],
  cuboid: ['cube', 'pyramid', 'cylinder', 'cone', 'sphere'],
  sphere: ['cylinder', 'cone', 'cube', 'cuboid', 'pyramid'],
  cylinder: ['cone', 'cuboid', 'sphere', 'cube', 'pyramid'],
  cone: ['pyramid', 'cylinder', 'sphere', 'cube', 'cuboid'],
  pyramid: ['cone', 'cuboid', 'cube', 'cylinder', 'sphere'],
};

const BASIC_SOLIDS: SolidId[] = ['cube', 'sphere', 'cylinder', 'cone'];
const ALL_SOLIDS: SolidId[] = ['cube', 'cuboid', 'sphere', 'cylinder', 'cone', 'pyramid'];

function findSolid(tier: 1 | 2, r: Rand): Problem {
  const pool = tier === 1 ? BASIC_SOLIDS : ALL_SOLIDS;
  const target = tier === 1 ? r.pick(pool) : r.pick<SolidId>(['cuboid', 'pyramid', 'cuboid', 'pyramid', 'cube', 'cone', 'cylinder', 'sphere']);
  const options = [target, ...MIXUPS[target].filter((s) => pool.includes(s))];
  const count = tier === 1 ? 3 : 4;
  return {
    skill: 'shapes-3d',
    tier,
    activity: 'solid',
    say: { text: `Tap the ${target}.` },
    answer: target,
    choices: r.shuffle(options.slice(0, count) as Answer[]),
    visual: { type: 'none' },
    explain: { text: `That is a ${target}, ${LIKE[target]}!` },
    key: `shapes-3d:find:${target}`,
  };
}

function countFaces(r: Rand): Problem {
  const solid = r.pick<SolidId>(['cube', 'cuboid', 'pyramid', 'cube', 'cuboid', 'pyramid', 'cylinder', 'cone']);
  const n = SOLID_FACTS[solid].faces;
  return {
    skill: 'shapes-3d',
    tier: 3,
    activity: 'solid',
    say: { text: `How many flat faces does this ${solid} have? Count them.` },
    answer: n,
    choices: choicesFor(n, r, { min: 1, max: 8, likely: [n - 1, n + 1, 4] }),
    visual: { type: 'solid', solids: [solid], ask: 'faces' },
    explain: { text: `A ${solid} has {n} flat ${n === 1 ? 'face' : 'faces'}!`, vals: { n } },
    key: `shapes-3d:faces:${solid}`,
  };
}

function countParts(r: Rand): Problem {
  const solid = r.pick<SolidId>(['cube', 'cuboid', 'pyramid']);
  const what = r.pick<'edges' | 'corners'>(['edges', 'corners']);
  const f = SOLID_FACTS[solid];
  const n = what === 'edges' ? f.edges : f.corners;
  const other = what === 'edges' ? f.corners : f.edges;
  return {
    skill: 'shapes-3d',
    tier: 4,
    activity: 'solid',
    say:
      what === 'edges'
        ? { text: `How many edges does this ${solid} have? An edge is where two faces meet.` }
        : { text: `How many corners does this ${solid} have? Corners are called vertices too.` },
    answer: n,
    choices: choicesFor(n, r, { min: 1, max: 14, likely: [n - 1, n + 1, other, f.faces] }),
    visual: { type: 'solid', solids: [solid], ask: what },
    explain: { text: what === 'edges' ? `A ${solid} has {n} edges!` : `A ${solid} has {n} corners, or vertices!`, vals: { n } },
    key: `shapes-3d:${what}:${solid}`,
  };
}

/** Which flat shape is the face you can see? (A cylinder or cone lies on its side so a round end faces him.) */
const FACE_SHAPE: { solid: SolidId; shape: ShapeId; lying?: boolean }[] = [
  { solid: 'cube', shape: 'square' },
  { solid: 'cuboid', shape: 'rectangle' },
  { solid: 'pyramid', shape: 'triangle' },
  { solid: 'cylinder', shape: 'circle', lying: true },
  { solid: 'cone', shape: 'circle', lying: true },
];

function faceShape(r: Rand): Problem {
  const f = r.pick(FACE_SHAPE);
  const options: ShapeId[] = r.shuffle(['square', 'rectangle', 'triangle', 'circle'] as ShapeId[]).filter((s) => s !== f.shape);
  const count = r.pick([3, 4]);
  const a = f.shape;
  return {
    skill: 'shapes-3d',
    tier: 5,
    activity: 'solid',
    say: { text: `Look at the gold face of the ${f.solid}. What flat shape is it?` },
    answer: a,
    choices: r.shuffle<Answer>([a, ...options.slice(0, count - 1)]),
    visual: { type: 'solid', solids: [f.solid], face: true, lying: f.lying },
    explain: { text: `The gold face of the ${f.solid} is a ${a}!` },
    key: `shapes-3d:face:${f.solid}`,
  };
}

export function shapes3d(tier: number, r: Rand): Problem {
  if (tier <= 2) return findSolid(tier as 1 | 2, r);
  if (tier === 3) return countFaces(r);
  if (tier === 4) return countParts(r);
  return faceShape(r);
}

export const L13: Partial<Record<SkillId, Generator>> = {
  turns,
  'shapes-3d': shapes3d,
};
