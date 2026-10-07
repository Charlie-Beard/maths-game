/**
 * Development-only art lab (lab.html): a gallery for reviewing the art.
 *
 *   ?set=lands                     every land: far view and scene
 *   ?set=lands&land=4&view=scene   one land's scene at stage size (1180 × 820)
 *   ?set=lands&land=4&view=far     one land's far view, doubled
 *   ?set=lands&view=far            every far view together
 *   ?set=tree&land=4&marks=1       the map tree, with its stops and seal hooks
 *   ?set=chars | props | keepsakes the cut-out characters, props, keepsakes
 *   &p=moonface,silky              only these names; &size=210 card width
 *
 * Not part of the production build (vite.config.ts only builds index.html).
 */
import '@fontsource/andika/latin-400.css';
import '@fontsource/andika/latin-700.css';
import './styles/base.css';
import './styles/paper.css';
import './styles/lab.css';
import { characters } from './art/characters';
import { installGrain } from './art/grain';
import { LAND_ART } from './art/lands';
import { prop } from './art/props';
import { TREE_HOOKS, TREE_PLACES, tree } from './art/scenery';
import { LANDS } from './core/curriculum';
import { PROP_IDS } from './core/problem';

installGrain();
const params = new URLSearchParams(location.search);
const set = params.get('set') ?? 'lands';
const only = params.get('p')?.split(',');
const size = Number(params.get('size') ?? 210);
const landN = Number(params.get('land') ?? 0);
const view = params.get('view');
const root = document.getElementById('lab')!;
document.body.classList.add('still');

const SETS = ['lands', 'tree', 'chars', 'props', 'keepsakes'];
const nav = (): string =>
  `<nav class="lab-nav">${SETS.map((s) => `<a href="?set=${s}" class="${s === set ? 'on' : ''}">${s}</a>`).join('')}${
    set === 'lands' || set === 'tree'
      ? LANDS.map((l) => `<a href="?set=${set}&land=${l.n}${set === 'lands' ? '&view=scene' : '&marks=1'}" class="${l.n === landN ? 'on' : ''}">${l.n}</a>`).join('')
      : ''
  }</nav>`;

/** A grid of small cards, one per named picture. */
function grid(all: Record<string, () => string>): string {
  const names = Object.keys(all).filter((n) => !only || only.includes(n));
  return `${nav()}<div class="lab-grid">${names
    .map((n) => `<figure class="lab-card" style="width:${size}px">${all[n]()}<figcaption>${n}</figcaption></figure>`)
    .join('')}</div>`;
}

function lands(): string {
  const art = LAND_ART[landN];
  if (art && view === 'scene') return `<div class="lab-full">${art.scene(`lab-scene-${landN}`)}</div>`;
  if (art && view === 'far') return `<div class="lab-full far-only">${art.far(`lab-far-${landN}`)}</div>`;
  const ns = landN ? [landN] : LANDS.map((l) => l.n);
  if (view === 'far') {
    // Every far view side by side, as they would sit in the map's cloud.
    return `<div class="lab-grid">${ns.map((n) => `<figure class="lab-card far" style="width:560px">${LAND_ART[n].far(`lab-far-${n}`)}<figcaption>${n}</figcaption></figure>`).join('')}</div>`;
  }
  return `${nav()}<div class="lab-grid">${ns
    .filter((n) => LAND_ART[n])
    .map(
      (n) =>
        `<figure class="lab-card"><div class="lab-land"><div class="far">${LAND_ART[n].far(`lab-far-${n}`)}</div><div>${LAND_ART[n].scene(
          `lab-scene-${n}`,
        )}</div></div><figcaption>${n}. ${LANDS[n - 1].title}</figcaption></figure>`,
    )
    .join('')}</div>`;
}

function treeView(): string {
  const marks =
    params.get('marks') === '1'
      ? TREE_PLACES.map((p, i) => `<div class="lab-mark" title="${p.label}" style="left:${p.x}px;top:${p.y}px">${i + 1}</div>`).join('') +
        TREE_HOOKS.map((p, i) => `<div class="lab-mark hook" style="left:${p.x}px;top:${p.y}px">${i + 1}</div>`).join('')
      : '';
  return `<div class="lab-full">${tree('lab-tree', { landN: landN || undefined })}${marks}</div>`;
}

/**
 * Keepsakes may not exist yet (another workstream draws them), so look the
 * module up with a glob, which is simply empty when the file is missing.
 */
async function keepsakes(): Promise<string> {
  const found = import.meta.glob('./art/keepsakes.ts');
  const load = Object.values(found)[0];
  if (!load) return `${nav()}<p style="padding:16px">No art/keepsakes.ts yet.</p>`;
  const mod = (await load()) as Record<string, unknown>;
  // Use the first export that is a record of drawing functions.
  for (const v of Object.values(mod)) {
    if (v && typeof v === 'object' && Object.values(v).length && Object.values(v).every((f) => typeof f === 'function')) {
      return grid(v as Record<string, () => string>);
    }
  }
  return `${nav()}<p style="padding:16px">art/keepsakes.ts has no record of drawings to show.</p>`;
}

async function render(): Promise<string> {
  switch (set) {
    case 'tree':
      return treeView();
    case 'chars':
      return grid(characters);
    case 'props':
      return grid(Object.fromEntries(PROP_IDS.map((id) => [id, () => prop(id)])));
    case 'keepsakes':
      return keepsakes();
    default:
      return lands();
  }
}

void render().then((html) => {
  root.innerHTML = html;
  document.body.dataset.ready = '1';
});
