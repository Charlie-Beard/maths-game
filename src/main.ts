import '@fontsource/andika/latin-400.css';
import '@fontsource/andika/latin-700.css';
import './styles/base.css';
import './styles/paper.css';
import './styles/ui.css';
import './styles/parent.css';
import './styles/story.css';
import './styles/faraway.css';
import './styles/activities-a.css';
import './styles/activities-b.css';
import './styles/activities-c.css';
import './styles/login.css';
import { installGrain } from './art/grain';
import { parchmentDefs, uiDefs } from './art/ui';
import { setVolumes, unlock } from './audio/engine';
import { loadManifest, setPlayerName } from './audio/voice';
import { Game } from './game';
import { LocalProfile } from './save/local';
import { Stage } from './stage';
import { setCalm } from './ui/anim';
import { Director } from './ui/director';
import { h } from './ui/dom';
import { installGear } from './ui/gear';
import type { App } from './ui/scene';
import { installRotateScreen } from './ui/rotate';

const stage = new Stage(document.getElementById('stage')!);
installRotateScreen(stage, document.getElementById('rotate')!);

installGrain();
document.body.insertAdjacentHTML('beforeend', uiDefs() + parchmentDefs());
stage.el.append(h('div', { class: 'vignette' }), h('div', { class: 'grain' }));

const director = new Director(stage.el);
const game = new Game();
// SCAFFOLD: saved on this device only until W7 adds the cloud save and sign-in.
const profile = new LocalProfile(new URLSearchParams(location.search).get('profile') ?? 'jasper');

const app: App = {
  stage,
  profile,
  get progress() {
    return profile.progress;
  },
  nav: game,
  save: () => profile.save(),
  go: (scene, t) => director.go(scene, t),
};
game.attach(app);
installGear(stage.el, () => game.parent());

// Audio can only start inside a tap on iPad.
let audioOn = false;
window.addEventListener(
  'pointerdown',
  () => {
    void unlock().then(() => {
      audioOn = true;
      applySettings();
    });
  },
  { once: true },
);
void loadManifest();

/** Puts the player's settings into effect. */
function applySettings(): void {
  const p = profile.progress;
  setCalm(p.settings.calm);
  setPlayerName(p.name);
  if (audioOn) setVolumes({ master: p.settings.volume });
}
applySettings();
profile.onChange(applySettings);

// Dev shortcuts: ?scene=map|choose|album|parent|chapter|practice|story&id=l1c1
//   ?scene=skill&id=add-10&tier=3   8 problems of one skill at one tier
//   ?scene=fixtures&kind=clock      the hand-made example problems for an activity
const q = new URLSearchParams(location.search);
const scene = q.get('scene');
if (scene === 'map') game.map();
else if (scene === 'choose') game.choose();
else if (scene === 'album') game.album();
else if (scene === 'parent') game.parent();
else if (scene === 'chapter') game.chapter(q.get('id') ?? 'l1c1');
else if (scene === 'practice') game.practice();
else if (scene === 'skill') game.skill(q.get('id') as never, Number(q.get('tier')) || 1);
else if (scene === 'fixtures') game.fixtures(q.get('kind') as never);
else if (scene === 'story') game.story(q.get('id') ?? 'l1c1', () => game.map());
else game.title();

// Offline support (production builds only).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => void navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
