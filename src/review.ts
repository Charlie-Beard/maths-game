/**
 * Development-only voice review (/review.html): listen to every recorded
 * clip, mark the wrong ones with a note on what's wrong, and switch a clip
 * to one of its earlier takes. Served by scripts/voice/review-server.ts;
 * verdicts are saved to scripts/voice/review.json. Ported from Wizard Words.
 *
 * Pieces and numbers are only ever heard joined up, so each one can also be
 * played inside a whole question ("in a question"), stitched the same way
 * audio/voice.ts does it in the game.
 */
import '@fontsource/andika/latin-700.css';
import { CHARACTER_NAMES } from './core/names';
import { lineId } from './core/phrases';
import { speechParts, type Speech } from './core/problem';

type Kind = 'lines' | 'pieces' | 'numbers';
interface Take {
  label: string;
  hash: string;
}
interface Clip {
  id: string;
  hash: string;
  takes: Take[];
}
interface Qa {
  hash: string;
  flags: string[];
  hints: string[];
}
interface Verdict {
  verdict: 'ok' | 'bad';
  note?: string;
  hash: string;
  at: string;
}
interface State {
  clips: Record<Kind, Clip[]>;
  order: Record<Kind, string[]>;
  lines: Record<string, { text: string; speaker: string; where: string; risky?: string }>;
  pieces: Record<string, { text: string; example: string; speech?: Speech }>;
  manifest: { pieces: string[]; numbers: number[] };
  qa: Record<string, Qa>;
  review: Record<string, Verdict>;
}

const TABS: [Kind, string][] = [
  ['lines', 'Lines'],
  ['pieces', 'Question pieces'],
  ['numbers', 'Numbers'],
];

let state: State;
let kind: Kind = (sessionStorage.getItem('review-kind') as Kind) || 'lines';
let rows: Clip[] = [];
let sel = 0;
let playing: HTMLAudioElement | null = null;
/** Bumped to stop a stitched question that's playing. */
let stitchToken = 0;

const $ = <T extends HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector(sel) as T;
const list = $<HTMLOListElement>('#list');
const filter = $<HTMLSelectElement>('#filter');
const who = $<HTMLSelectElement>('#who');
const autoplay = $<HTMLInputElement>('#autoplay');
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
const key = (c: Clip) => `${kind}/${c.id}`;
const speakerName = (id: string) => (id === 'narrator' ? 'Narrator' : (CHARACTER_NAMES[id] ?? id));

async function api<T>(path: string, body?: unknown): Promise<T> {
  const r = await fetch(`/__voice/${path}`, body ? { method: 'POST', body: JSON.stringify(body) } : {});
  if (!r.ok) throw new Error(`${path}: ${r.status} ${await r.text()}`);
  return r.json();
}

/** The verdict, if it was given for the clip as it is now. */
const verdictOf = (c: Clip): Verdict | undefined => {
  const v = state.review[key(c)];
  return v && v.hash === c.hash ? v : undefined;
};
const qaOf = (k: string, hash: string): Qa | undefined => {
  const q = state.qa[k];
  return q && q.hash === hash ? q : undefined;
};

const clipUrl = (k: Kind, id: string, hash = '', take?: string) => `/__voice/audio/${k}/${id}${take ? `/${take}` : ''}.mp3?h=${hash}`;

function playUrl(url: string): Promise<void> {
  playing?.pause();
  const a = (playing = new Audio(url));
  return new Promise((resolve) => {
    a.onended = a.onerror = a.onpause = () => resolve();
    a.play().catch(() => resolve());
  });
}

function play(c: Clip, take?: Take) {
  stitchToken++;
  void playUrl(clipUrl(kind, c.id, take?.hash ?? c.hash, take?.label));
}

/** A question for a piece or number: the piece's own example, or a stock one for a number. */
function exampleOf(c: Clip): Speech | undefined {
  if (kind === 'pieces') return state.pieces[c.id]?.speech;
  if (kind === 'numbers') {
    const [n, at] = c.id.split('-');
    return at === 'end'
      ? { text: 'How many altogether? {n}.', vals: { n: Number(n) } }
      : { text: 'Moon-Face has {n} pop biscuits.', vals: { n: Number(n) } };
  }
  return undefined;
}

/** Plays a question the way the game does: pieces and number clips back to back. */
async function playStitched(s: Speech) {
  const token = ++stitchToken;
  for (const p of speechParts(s)) {
    if (token !== stitchToken) return;
    if ('piece' in p) {
      const id = lineId(p.piece);
      if (!state.manifest.pieces.includes(id)) continue;
      await playUrl(clipUrl('pieces', id));
    } else if (typeof p.value === 'number' && state.manifest.numbers.includes(p.value)) {
      await playUrl(clipUrl('numbers', `${p.value}-${p.end ? 'end' : 'mid'}`));
    }
  }
}

function describe(c: Clip): { name: string; sub: string } {
  if (kind === 'numbers') {
    const [n, at] = c.id.split('-');
    return { name: n, sub: at === 'end' ? 'ending a sentence: “…It is 7.”' : 'mid-sentence: “Moon-Face has 7 pop biscuits.”' };
  }
  if (kind === 'pieces') {
    const p = state.pieces[c.id];
    return { name: p?.text ?? c.id, sub: p ? `e.g. “${p.example}”` : '' };
  }
  const l = state.lines[c.id];
  return { name: l?.text ?? c.id, sub: l ? `${speakerName(l.speaker)} · ${l.where}` : '' };
}

function rowHtml(c: Clip, i: number): string {
  const { name, sub } = describe(c);
  const v = verdictOf(c);
  const old = state.review[key(c)];
  const q = qaOf(key(c), c.hash);
  const risky = kind === 'lines' ? state.lines[c.id]?.risky : undefined;
  const chips = [
    ...(risky ? [`<span class="chip">Listen closely: ${esc(risky)}</span>`] : []),
    ...(q?.flags ?? []).map((f) => `<span class="chip flag">${esc(f)}</span>`),
    ...(q?.hints ?? []).map((h) => `<span class="chip">${esc(h)}</span>`),
  ];
  const takes = c.takes.map((t, n) => {
    const tq = qaOf(`${key(c)}#${t.label}`, t.hash);
    const warn = tq?.flags.length ? ` <span class="warn" title="${esc(tq.flags.join('\n'))}">⚑${tq.flags.length}</span>` : '';
    const same = t.hash === c.hash ? ' (in use)' : '';
    return `<span class="take"><button data-act="take" data-n="${n}">▶ ${n + 1} ${esc(t.label)}${same}${warn}</button>${
      same ? '' : `<button data-act="use" data-n="${n}" title="Use this take instead">Use</button>`
    }</span>`;
  });
  return `<li class="row ${i === sel ? 'sel' : ''} ${v?.verdict ?? ''}" data-i="${i}">
    <button class="play" data-act="play" title="Play (Space)">▶</button>
    <div>
      <div class="name">${esc(name)}</div>
      ${sub ? `<div class="sub">${esc(sub)}</div>` : ''}
      ${chips.length ? `<div class="chips">${chips.join('')}</div>` : ''}
      ${exampleOf(c) ? `<button class="stitch" data-act="stitch" title="Play it in a whole question (Q)">▶ in a question</button>` : ''}
      ${takes.length ? `<div class="takes">Other takes: ${takes.join('')}</div>` : ''}
    </div>
    <div class="judge">
      <button class="ok" data-act="ok" aria-pressed="${v?.verdict === 'ok'}">✓ Right</button>
      <button class="bad" data-act="bad" aria-pressed="${v?.verdict === 'bad'}">✗ Wrong</button>
      <input class="note" placeholder="What's wrong? e.g. too shouty" value="${esc(v?.note ?? '')}" />
      ${old && !v ? `<div class="stale">Changed since you marked it ${old.verdict === 'ok' ? 'right' : 'wrong'}${old.note ? ` (“${esc(old.note)}”)` : ''}. Listen again.</div>` : ''}
    </div>
  </li>`;
}

function sortRows(): Clip[] {
  const order = state.order[kind];
  const pos = (c: Clip) => {
    const i = order.indexOf(c.id);
    return i < 0 ? order.length : i;
  };
  let byOrder = [...state.clips[kind]].sort((a, b) => pos(a) - pos(b) || a.id.localeCompare(b.id));
  if (kind === 'lines' && who.value) byOrder = byOrder.filter((c) => state.lines[c.id]?.speaker === who.value);
  const f = filter.value;
  if (f === 'todo') return byOrder.filter((c) => !verdictOf(c));
  if (f === 'bad') return byOrder.filter((c) => verdictOf(c)?.verdict === 'bad');
  if (f === 'order') return byOrder;
  // Suspects first: flagged and unchecked, then unchecked, then marked wrong, then right.
  const rank = (c: Clip) => {
    const v = verdictOf(c);
    if (v) return v.verdict === 'bad' ? 2 : 3;
    return qaOf(key(c), c.hash)?.flags.length ? 0 : 1;
  };
  return byOrder.sort((a, b) => rank(a) - rank(b));
}

function renderTabs() {
  $('.tabs').innerHTML = TABS.map(([k, label]) => {
    const all = state.clips[k];
    const done = all.filter((c) => {
      const v = state.review[`${k}/${c.id}`];
      return v && v.hash === c.hash;
    }).length;
    const bad = all.filter((c) => {
      const v = state.review[`${k}/${c.id}`];
      return v && v.hash === c.hash && v.verdict === 'bad';
    }).length;
    return `<button role="tab" data-kind="${k}" aria-selected="${k === kind}">${label} <small>${done}/${all.length} checked${bad ? `, ${bad} wrong` : ''}</small></button>`;
  }).join('');
}

/** Re-sorts and redraws everything; keeps the same clip selected if it's still shown. */
function render() {
  const keep = rows[sel]?.id;
  rows = sortRows();
  const i = rows.findIndex((c) => c.id === keep);
  sel = i >= 0 ? i : Math.min(sel, Math.max(0, rows.length - 1));
  list.className = kind;
  $('#who-label').hidden = kind !== 'lines';
  list.innerHTML = rows.length ? rows.map(rowHtml).join('') : '<li class="empty">Nothing here.</li>';
  renderTabs();
}

/** Redraws one row in place, so the list doesn't jump while you work through it. */
function redraw(i: number) {
  const el = list.children[i];
  if (!el || !rows[i]) return;
  el.outerHTML = rowHtml(rows[i], i);
  renderTabs();
}

function select(i: number, scroll = true) {
  if (i < 0 || i >= rows.length) return;
  const prev = sel;
  sel = i;
  list.children[prev]?.classList.remove('sel');
  list.children[sel]?.classList.add('sel');
  if (scroll) list.children[sel]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  if (autoplay.checked && prev !== sel) play(rows[sel]);
}

async function judge(i: number, verdict: 'ok' | 'bad' | null) {
  const c = rows[i];
  const note = $<HTMLInputElement>('.note', list.children[i]).value;
  const v = await api<Verdict | null>('review', { key: key(c), verdict, note });
  if (v) state.review[key(c)] = v;
  else delete state.review[key(c)];
  redraw(i);
}

async function useTake(i: number, n: number) {
  const c = rows[i];
  state = await api<State>('use', { key: key(c), take: c.takes[n].label });
  render();
  const j = rows.findIndex((r) => r.id === c.id);
  if (j >= 0) {
    select(j, false);
    play(rows[j]);
  }
}

function stitch(c: Clip | undefined) {
  const s = c && exampleOf(c);
  if (s) void playStitched(s);
}

list.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const row = t.closest<HTMLElement>('.row');
  if (!row) return;
  const i = Number(row.dataset.i);
  const act = t.closest<HTMLElement>('[data-act]')?.dataset;
  if (i !== sel) select(i, false);
  if (!act) return;
  const c = rows[i];
  if (act.act === 'play') play(c);
  else if (act.act === 'stitch') stitch(c);
  else if (act.act === 'take') play(c, c.takes[Number(act.n)]);
  else if (act.act === 'use') void useTake(i, Number(act.n));
  else if (act.act === 'ok' || act.act === 'bad') {
    const current = verdictOf(c)?.verdict;
    void judge(i, current === act.act ? null : act.act).then(() => {
      if (act.act === 'bad' && current !== 'bad') $<HTMLInputElement>('.note', list.children[i]).focus();
    });
  }
});

// A note is saved when you leave the box or press Enter.
list.addEventListener('change', (e) => {
  const t = e.target as HTMLElement;
  if (!t.classList.contains('note')) return;
  const i = Number(t.closest<HTMLElement>('.row')!.dataset.i);
  void judge(i, verdictOf(rows[i])?.verdict ?? 'bad');
});

$('.tabs').addEventListener('click', (e) => {
  const k = (e.target as HTMLElement).closest<HTMLElement>('[data-kind]')?.dataset.kind as Kind | undefined;
  if (!k || k === kind) return;
  kind = k;
  sessionStorage.setItem('review-kind', k);
  sel = 0;
  rows = [];
  render();
  window.scrollTo({ top: 0 });
});
for (const el of [filter, who]) {
  el.addEventListener('change', () => {
    sel = 0;
    rows = [];
    render();
  });
}

document.addEventListener('keydown', (e) => {
  const inNote = (e.target as HTMLElement).classList?.contains('note');
  if (inNote) {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
      select(sel + 1);
    } else if (e.key === 'Escape') (e.target as HTMLInputElement).blur();
    return;
  }
  if (e.target instanceof HTMLSelectElement || e.metaKey || e.ctrlKey || e.altKey) return;
  const c = rows[sel];
  if (e.key === 'ArrowDown' || e.key === 'j') select(sel + 1);
  else if (e.key === 'ArrowUp' || e.key === 'k') select(sel - 1);
  else if ((e.key === ' ' || e.key === 'Enter') && c) play(c);
  else if (e.key === 'q' && c) stitch(c);
  else if (e.key === 'y' && c) void judge(sel, 'ok').then(() => select(sel + 1));
  else if (e.key === 'n' && c) {
    void judge(sel, 'bad').then(() => $<HTMLInputElement>('.note', list.children[sel]).focus());
  } else if (/^[1-9]$/.test(e.key) && c?.takes[Number(e.key) - 1]) play(c, c.takes[Number(e.key) - 1]);
  else return;
  e.preventDefault();
});

api<State>('state').then((s) => {
  state = s;
  // Everyone who has a recorded line, narrator first.
  const speakers = [...new Set(s.clips.lines.map((c) => s.lines[c.id]?.speaker).filter(Boolean))];
  speakers.sort((a, b) => (a === 'narrator' ? -1 : b === 'narrator' ? 1 : speakerName(a).localeCompare(speakerName(b))));
  who.innerHTML += speakers.map((id) => `<option value="${esc(id)}">${esc(speakerName(id))}</option>`).join('');
  render();
});
