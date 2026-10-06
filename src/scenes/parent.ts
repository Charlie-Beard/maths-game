/**
 * The grown-ups' corner (behind the gear and a sum).
 *
 * SCAFFOLD: name, new chapters per day, calm mode, volume, unlock all,
 * start again, and a table of skills. W4 ports the full corner from Wizard
 * Words (profiles, cloud status, levels, idle hint) once W7's cloud save
 * is in.
 */
import { sfx } from '../audio/sfx';
import { setVolumes } from '../audio/engine';
import { setPlayerName } from '../audio/voice';
import { C } from '../art/palette';
import { SKILLS, tierCount, type SkillId } from '../core/skills';
import { setCalm } from '../ui/anim';
import { sealButton } from '../ui/components';
import { h, place } from '../ui/dom';
import { Scene } from '../ui/scene';

export class ParentScene extends Scene {
  readonly hidesGear = true;

  build(): void {
    const r = this.root;
    r.classList.add('parent');
    const p = this.app.progress;
    const panel = place(h('div', { class: 'parent-panel' }), 60, 30, 1060, 760);
    panel.append(h('h1', {}, 'Grown-ups’ corner'));

    const row = (label: string, control: HTMLElement) => h('label', { class: 'parent-row' }, [h('span', {}, label), control]);

    const name = h('input', { type: 'text', value: p.name, maxlength: '20' }) as HTMLInputElement;
    name.addEventListener('change', () => {
      p.name = name.value.trim();
      setPlayerName(p.name);
      this.app.save();
    });

    const perDay = h('select') as HTMLSelectElement;
    for (const [v, label] of [[1, '1'], [2, '2'], [3, '3'], [5, '5'], [0, 'No limit']] as const) {
      const o = h('option', { value: String(v) }, label) as HTMLOptionElement;
      o.selected = p.settings.newPerDay === v;
      perDay.append(o);
    }
    perDay.addEventListener('change', () => {
      p.settings.newPerDay = Number(perDay.value);
      this.app.save();
    });

    const calm = h('input', { type: 'checkbox' }) as HTMLInputElement;
    calm.checked = p.settings.calm;
    calm.addEventListener('change', () => {
      p.settings.calm = calm.checked;
      setCalm(calm.checked);
      this.app.save();
    });

    const volume = h('input', { type: 'range', min: '0', max: '1', step: '0.1', value: String(p.settings.volume) }) as HTMLInputElement;
    volume.addEventListener('change', () => {
      p.settings.volume = Number(volume.value);
      setVolumes({ master: p.settings.volume });
      this.app.save();
    });

    const unlock = h('input', { type: 'checkbox' }) as HTMLInputElement;
    unlock.checked = p.unlockAll;
    unlock.addEventListener('change', () => {
      p.unlockAll = unlock.checked;
      this.app.save();
    });

    let armed = false;
    const reset = h('button', { class: 'parent-danger' }, 'Start again');
    reset.addEventListener('click', () => {
      if (!armed) {
        armed = true;
        reset.textContent = 'Tap again to clear progress';
        return;
      }
      this.app.profile.reset();
      location.reload();
    });

    panel.append(
      row('Player’s name', name),
      row('New chapters per day', perDay),
      row('Calm mode (less movement)', calm),
      row('Volume', volume),
      row('Unlock every chapter', unlock),
      row('Clear what was played (keeps settings)', reset),
    );

    // Skills: tier and score, so a grown-up can see what to practise.
    const table = h('table', { class: 'skill-table' });
    table.append(h('tr', {}, [h('th', {}, 'Skill'), h('th', {}, 'Tier'), h('th', {}, 'Score'), h('th', {}, 'Seen'), h('th', {}, '')]));
    for (const [id, st] of Object.entries(p.skills) as [SkillId, NonNullable<(typeof p.skills)[SkillId]>][]) {
      table.append(
        h('tr', {}, [
          h('td', {}, SKILLS[id].title),
          h('td', {}, `${st.tier} / ${tierCount(id)}`),
          h('td', {}, `${Math.round(st.score * 100)}%`),
          h('td', {}, String(st.seen)),
          h('td', {}, st.mastered ? '★' : ''),
        ]),
      );
    }
    panel.append(h('h2', {}, 'Skills'), Object.keys(p.skills).length ? table : h('p', {}, 'Nothing played yet.'));
    r.append(panel);

    const close = sealButton('close', { x: 1090, y: 14, size: 72, color: C.slate, aria: 'Close' });
    this.tap(close, () => {
      sfx.tap();
      this.app.nav.map();
    });
    r.append(close);
  }
}
