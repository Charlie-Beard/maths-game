/**
 * Grown-ups' corner (reached through the gear, top left, and a sum).
 * Ported from Wizard Words' corner:
 *
 *   Progress  chapters, keepsakes, cards and seals; every skill's tier,
 *             score, mastery and when it was last practised, by land or
 *             by strand
 *   Levels    unlock every chapter, unlock up to a chapter, or lock the
 *             ones after a chapter again
 *   Settings  the player's name, who he climbs with, volume, calm mode, the idle hint, new
 *             chapters per day, start again
 *   Profiles  switch between Jasper, a demo and others; add or delete
 *             (Jasper's can never be deleted)
 *
 * The header shows who is playing, whether the cloud has everything, and
 * sign out (tap twice). Everything applies to the profile being played.
 */
import { setVolumes } from '../audio/engine';
import { sfx } from '../audio/sfx';
import { setPlayerName } from '../audio/voice';
import { characterArt } from '../art/characters';
import { C } from '../art/palette';
import { parchment } from '../art/ui';
import { activeProfile, createProfile, deleteProfile, JASPER, listProfiles, type ProfileInfo } from '../cloud/api';
import { CloudProfile, freshProgress, type SyncState } from '../cloud/profile';
import { ALL_CHAPTERS, AVATARS, LANDS, type Avatar } from '../core/curriculum';
import { currentIndex, type Progress } from '../core/progress';
import { SKILL_IDS, SKILLS, tierCount, type SkillId, type Strand } from '../core/skills';
import { setCalm } from '../ui/anim';
import { h, place } from '../ui/dom';
import { Scene } from '../ui/scene';
import { AVATAR_NAMES } from './choose';

type Tab = 'progress' | 'levels' | 'settings' | 'profiles';

const TAB_NAMES: Record<Tab, string> = {
  progress: 'Progress',
  levels: 'Levels',
  settings: 'Settings',
  profiles: 'Profiles',
};

const SYNC_TEXT: Record<SyncState, string> = {
  synced: 'Saved to the cloud ✓',
  pending: 'Saving to the cloud…',
  offline: 'Offline: saved on this iPad for now',
};

const STRAND_NAMES: Record<Strand, string> = {
  number: 'Number and place value',
  addsub: 'Adding and taking away',
  multdiv: 'Groups, times tables and sharing',
  fractions: 'Fractions',
  measure: 'Measures: time, money and length',
  geometry: 'Shapes',
};

/** The land where each skill is first a chapter's focus. */
const SKILL_LAND: Partial<Record<SkillId, number>> = {};
for (const c of ALL_CHAPTERS) for (const s of c.skills) SKILL_LAND[s] ??= c.land;

// ---------------------------------------------------------------------------
// Levels: which chapters can be played (the grown-up controls).

/** A chapter can be played: done, unlocked by a grown-up, or reached. */
export function isUnlocked(p: Progress, index: number): boolean {
  const c = ALL_CHAPTERS[index];
  return p.unlockAll || !!p.chapters[c.id]?.done || index <= Math.max(currentIndex(p), p.unlockedTo);
}

/** Every chapter up to and including `index` can be played. */
export function unlockTo(p: Progress, index: number): void {
  p.unlockedTo = Math.max(p.unlockedTo, index);
}

/**
 * Locks every chapter after `index` again, so the next one to play is no
 * further on than `index + 1`. Keepsakes, cards and seals already won are
 * kept; the chapters just count as not done.
 */
export function relockAfter(p: Progress, index: number): void {
  p.unlockAll = false;
  p.unlockedTo = Math.min(p.unlockedTo, index);
  for (const c of ALL_CHAPTERS.slice(index + 1)) {
    const rec = p.chapters[c.id];
    if (rec) rec.done = false;
  }
}

/** "today", "yesterday", "3 days ago" (or "not yet"). */
export function whenText(ms: number, now = Date.now()): string {
  if (!ms) return 'not yet';
  const d = Math.round((new Date(now).setHours(0, 0, 0, 0) - new Date(ms).setHours(0, 0, 0, 0)) / 86_400_000);
  if (d <= 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 14) return `${d} days ago`;
  if (d < 60) return `${Math.round(d / 7)} weeks ago`;
  return new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** Which way the skills table is grouped (kept while the corner is open again). */
let groupBy: 'land' | 'strand' = 'land';

export class ParentScene extends Scene {
  readonly hidesGear = true;
  private body!: HTMLElement;
  private tabs = new Map<Tab, HTMLButtonElement>();
  private readonly me: ProfileInfo = activeProfile();
  /** Every profile, from the cloud (just this one if offline). */
  private profiles: Promise<ProfileInfo[]> = listProfiles().catch(() => [this.me]);

  build(): void {
    const r = this.root;
    r.classList.add('parent');
    r.style.background = C.night;
    r.append(place(h('div', { html: parchment(1160, 800, 'parent-sheet', C.cream, 1) }), 10, 10, 1160, 800));

    const head = place(h('div', { class: 'p-head' }), 50, 34, 1080, 70);
    head.append(h('h1', {}, 'Grown-ups’ corner'));
    const status = h('small', { class: 'p-sync' });
    const profile = this.app.profile as { state?: SyncState; onChange: (fn: () => void) => () => void };
    const showStatus = () => (status.textContent = profile.state ? SYNC_TEXT[profile.state] : '');
    this.onCleanup(profile.onChange(showStatus));
    showStatus();
    const signOut = this.confirmButton('Sign out', 'Tap again to sign out', 'p-signout', () => {
      signOut.textContent = 'Signing out…';
      void this.app.signOut();
    });
    const picker = h('select', { 'aria-label': 'Profile' }, [h('option', { value: this.me.id, selected: true }, this.me.label)]) as HTMLSelectElement;
    void this.profiles.then((list) => {
      if (!this.alive) return;
      picker.innerHTML = '';
      for (const p of list) picker.append(h('option', { value: p.id, selected: p.id === this.me.id }, p.label));
    });
    picker.addEventListener('change', () => void this.profiles.then((list) => this.switchTo(list.find((p) => p.id === picker.value)!)));
    const close = h('button', { class: 'p-btn primary' }, 'Back to the game');
    close.addEventListener('click', () => {
      sfx.tap();
      this.app.nav.map();
    });
    head.append(h('div', { class: 'p-account' }, [h('div', { class: 'p-signed' }, [h('label', {}, ['Playing as ', picker]), status]), signOut, close]));
    r.append(head);

    const tabs = place(h('div', { class: 'p-tabs' }), 50, 104, 1080, 72);
    (Object.keys(TAB_NAMES) as Tab[]).forEach((t) => {
      const b = h('button', { class: 'p-tab', 'data-tab': t }, TAB_NAMES[t]) as HTMLButtonElement;
      b.addEventListener('click', () => this.show(t));
      tabs.append(b);
      this.tabs.set(t, b);
    });
    r.append(tabs);

    this.body = place(h('div', { class: 'p-body' }), 50, 186, 1080, 594);
    r.append(this.body);
    this.show('progress');
  }

  private show(t: Tab): void {
    this.tabs.forEach((b, k) => b.classList.toggle('on', k === t));
    this.body.innerHTML = '';
    this.body.scrollTop = 0;
    this.body.dataset.tab = t;
    ({
      progress: () => this.progressTab(),
      levels: () => this.levelsTab(),
      settings: () => this.settingsTab(),
      profiles: () => void this.profilesTab(),
    })[t]();
  }

  /** A button that needs a second tap within 4 seconds (for anything that can't be undone). */
  private confirmButton(label: string, confirm: string, cls: string, fn: () => void): HTMLButtonElement {
    const b = h('button', { class: `p-btn ${cls}`.trim() }, label) as HTMLButtonElement;
    let armed = false;
    b.addEventListener('click', () => {
      if (!armed) {
        armed = true;
        b.textContent = confirm;
        this.later(4000, () => {
          armed = false;
          b.textContent = label;
        });
        return;
      }
      fn();
    });
    return b;
  }

  private switchTo(p: ProfileInfo): void {
    if (p.id === this.me.id) return;
    this.body.innerHTML = '';
    this.body.append(h('p', { class: 'p-note' }, `Switching to ${p.label}…`));
    void this.app.switchProfile(p);
  }

  // -------------------------------------------------------------------------

  private progressTab(): void {
    const p = this.app.profile.progress;
    const done = ALL_CHAPTERS.filter((c) => p.chapters[c.id]?.done).length;
    const next = ALL_CHAPTERS[currentIndex(p)];
    const keepsakes = new Set(ALL_CHAPTERS.map((c) => c.keepsake)).size;
    const hosts = new Set(ALL_CHAPTERS.map((c) => c.host)).size;
    const mastered = SKILL_IDS.filter((id) => p.skills[id]?.mastered).length;
    const stats = h('div', { class: 'p-stats' });
    for (const [label, value] of [
      ['Chapters finished', `${done} of ${ALL_CHAPTERS.length}`],
      ['Up next', done === ALL_CHAPTERS.length ? 'Everything is done!' : `${LANDS[next.land - 1].short}, ${next.kind === 'finale' ? 'the finale' : `chapter ${next.n}`}`],
      ['Skills mastered', `${mastered} of ${SKILL_IDS.length}`],
      ['Keepsakes', `${p.keepsakes.length} of ${keepsakes}`],
      ['Folk cards', `${p.cards.length} of ${hosts}`],
      ['Land seals', `${p.seals.length} of ${LANDS.length}`],
      ['Toffee shocks', String(p.toffees)],
      ['Last played', p.lastPlayed ? whenText(p.lastPlayed) : 'not yet'],
    ]) {
      stats.append(h('div', { class: 'p-stat' }, [h('span', {}, label), h('strong', {}, value)]));
    }
    this.body.append(h('h2', {}, 'How it’s going'), stats);

    // The skills, grouped by land (the order he meets them) or by strand.
    const byLand = h('button', { class: `p-seg${groupBy === 'land' ? ' on' : ''}` }, 'By land');
    const byStrand = h('button', { class: `p-seg${groupBy === 'strand' ? ' on' : ''}` }, 'By strand');
    const regroup = (g: typeof groupBy) => {
      groupBy = g;
      const top = this.body.scrollTop;
      this.show('progress');
      this.body.scrollTop = top;
    };
    byLand.addEventListener('click', () => regroup('land'));
    byStrand.addEventListener('click', () => regroup('strand'));
    this.body.append(h('div', { class: 'p-skills-head' }, [h('h2', {}, 'Skills'), h('div', { class: 'p-segs' }, [byLand, byStrand])]));
    this.body.append(
      h(
        'p',
        { class: 'p-note' },
        'Each skill has tiers, from objects to pictures to numbers only. The game moves up a tier after three right first time, and down if a tier is a struggle. The score is a rolling average of recent problems; a skill is mastered once it stays high, and then comes back now and then for review.',
      ),
    );

    const groups: { title: string; ids: SkillId[] }[] =
      groupBy === 'land'
        ? LANDS.map((l) => ({ title: `${l.n}. ${l.title}`, ids: SKILL_IDS.filter((id) => SKILL_LAND[id] === l.n) }))
        : (Object.keys(STRAND_NAMES) as Strand[]).map((s) => ({ title: STRAND_NAMES[s], ids: SKILL_IDS.filter((id) => SKILLS[id].strand === s) }));
    const table = h('table', { class: 'skill-table' });
    table.append(h('tr', {}, ['Skill', 'Tier', 'Score', 'Mastered', 'Seen', 'Last practised'].map((t) => h('th', {}, t))));
    for (const g of groups) {
      if (!g.ids.length) continue;
      table.append(h('tr', { class: 'p-group' }, [h('th', { colspan: 6 }, g.title)]));
      for (const id of g.ids) {
        const st = p.skills[id];
        const tierNow = st ? SKILLS[id].tiers[st.tier - 1] : undefined;
        table.append(
          h('tr', { class: st ? '' : 'unseen', 'data-skill': id }, [
            h('td', {}, [h('strong', {}, SKILLS[id].title), ...(tierNow ? [h('small', {}, tierNow)] : [])]),
            h('td', {}, st ? `${st.tier} of ${tierCount(id)}` : `– of ${tierCount(id)}`),
            h('td', {}, st ? `${Math.round(st.score * 100)}%` : '–'),
            h('td', {}, st?.mastered ? '★ Yes' : st ? 'Not yet' : '–'),
            h('td', {}, st ? String(st.seen) : '0'),
            h('td', {}, st ? whenText(st.last) : 'not yet'),
          ]),
        );
      }
    }
    this.body.append(table);
  }

  // -------------------------------------------------------------------------

  private settingsTab(): void {
    const target = this.app.profile;
    const p = target.progress;
    const s = p.settings;
    const save = () => target.save();

    const row = (label: string, control: HTMLElement, hint?: string) =>
      h('label', { class: 'p-row' }, [h('div', {}, [h('strong', {}, label), ...(hint ? [h('small', {}, hint)] : [])]), control]);

    const name = h('input', { type: 'text', value: p.name, placeholder: 'e.g. Sam', maxlength: 20, autocomplete: 'off', 'aria-label': 'Player’s name' }) as HTMLInputElement;
    name.addEventListener('input', () => {
      p.name = name.value;
      setPlayerName(p.name);
      save();
    });

    const vol = h('input', { type: 'range', min: 0, max: 100, value: Math.round(s.volume * 100), 'aria-label': 'Volume' }) as HTMLInputElement;
    vol.addEventListener('input', () => {
      s.volume = Number(vol.value) / 100;
      setVolumes({ master: s.volume });
      save();
    });
    vol.addEventListener('change', () => sfx.success());

    const calm = toggle(s.calm, 'Calm mode', (v) => {
      s.calm = v;
      setCalm(v);
      save();
    });

    const idle = select(
      [['0', 'Off'], ['8', 'After 8 seconds'], ['12', 'After 12 seconds'], ['20', 'After 20 seconds']],
      String(s.idleHintSeconds),
      'Idle hint',
      (v) => {
        s.idleHintSeconds = Number(v);
        save();
      },
    );

    const perDay = select(
      [['1', '1'], ['2', '2'], ['3', '3'], ['5', '5'], ['0', 'No limit']],
      String(s.newPerDay),
      'New chapters per day',
      (v) => {
        s.newPerDay = Number(v);
        save();
      },
    );

    const resetBtn = this.confirmButton('Start again', 'Tap again to really start again', 'danger', () => {
      target.reset();
      this.show('settings');
    });

    // Who he climbs with. The Choose scene only appears while this is
    // empty, so without this row the only way to change it was Start again,
    // which wipes everything. Big portraits (88 px wide) so they are easy to hit.
    const climb = h('div', { class: 'p-avatars', role: 'radiogroup', 'aria-label': 'Climbing with' });
    const picks = new Map<Avatar, HTMLElement>();
    const mark = () => picks.forEach((b, a) => {
      b.classList.toggle('on', p.avatar === a);
      b.setAttribute('aria-checked', String(p.avatar === a));
    });
    for (const a of AVATARS) {
      const b = h('button', { class: 'p-avatar', role: 'radio', 'aria-label': AVATAR_NAMES[a], 'data-avatar': a }, [
        h('span', { class: 'p-avatar-art', html: characterArt(a) }),
        h('span', {}, AVATAR_NAMES[a]),
      ]);
      b.addEventListener('click', () => {
        if (p.avatar === a) return;
        p.avatar = a;
        sfx.tap();
        save();
        mark();
      });
      picks.set(a, b);
      climb.append(b);
    }
    mark();

    this.body.append(
      row('Player’s name', name, 'Shown in the game. The recorded voices say “Jasper”; with any other name they say the line without it (“You won the seal!”).'),
      h('div', { class: 'p-row' }, [h('div', {}, [h('strong', {}, 'Climbing with'), h('small', {}, 'Who goes up the tree with him. Keeps all his progress.')]), climb]),
      row('Volume', vol),
      row('Calm mode', calm, 'Less movement: no flickering windows, shorter animations, no cloud parting when a land arrives.'),
      row('Say the question again', idle, 'If nothing is tapped for a while.'),
      row('New chapters per day', perDay, 'After that the map says “come back tomorrow”. Old chapters and practice with Silky are always open.'),
      row('Start again', resetBtn, 'Clears chapters, skills, keepsakes, cards, seals and the character choice. Keeps these settings and the levels.'),
    );
  }

  // -------------------------------------------------------------------------

  private levelsTab(): void {
    const target = this.app.profile;
    const p = target.progress;
    const redraw = () => {
      target.save();
      const top = this.body.scrollTop;
      this.show('levels');
      this.body.scrollTop = top;
    };
    const all = toggle(p.unlockAll, 'Unlock every chapter', (v) => {
      p.unlockAll = v;
      redraw();
    });
    this.body.append(
      h('label', { class: 'p-row' }, [h('div', {}, [h('strong', {}, 'Unlock every chapter'), h('small', {}, 'Any chapter can be played from the map, and every land visited.')]), all]),
      h('p', { class: 'p-note' }, 'Or open chapters up to a point, or lock them again after one. Locking keeps keepsakes, cards and seals already won; the chapters just need playing again.'),
    );
    for (const land of LANDS) {
      const list = h('div', { class: 'p-levels' });
      for (const c of land.chapters) {
        const i = ALL_CHAPTERS.indexOf(c);
        const done = !!p.chapters[c.id]?.done;
        const open = isUnlocked(p, i);
        const actions: HTMLElement[] = [];
        if (!open) {
          const b = h('button', { class: 'p-btn small' }, 'Unlock up to here');
          b.addEventListener('click', () => {
            unlockTo(p, i);
            redraw();
          });
          actions.push(b);
        }
        // Only when something after it is open beyond the natural next chapter.
        if (p.unlockAll || p.unlockedTo > i || ALL_CHAPTERS.slice(i + 1).some((x) => p.chapters[x.id]?.done)) {
          actions.push(
            this.confirmButton('Lock the ones after', 'Tap again to lock', 'small', () => {
              relockAfter(p, i);
              redraw();
            }),
          );
        }
        list.append(
          h('div', { class: `p-level ${done ? 'done' : open ? 'open' : 'locked'}`, 'data-chapter': c.id }, [
            h('div', {}, [h('strong', {}, `${c.n}. ${c.title}`), h('small', {}, done ? 'Done ✓' : open ? 'Open' : 'Locked')]),
            h('div', { class: 'p-actions' }, actions),
          ]),
        );
      }
      this.body.append(h('h2', {}, `Land ${land.n}: ${land.title}`), list);
    }
  }

  // -------------------------------------------------------------------------

  private async profilesTab(): Promise<void> {
    this.body.append(
      h('p', { class: 'p-note' }, 'Each profile has its own progress and settings, saved in the cloud. Use a demo profile to show the game to people without touching Jasper’s progress. Whenever it isn’t Jasper’s, the profile’s name shows on a badge in the game.'),
    );
    const list = h('div', { class: 'p-profiles' }, [h('p', { class: 'p-note' }, 'Loading…')]);
    this.body.append(list);

    const name = h('input', { type: 'text', placeholder: 'e.g. Grandma', maxlength: 30, autocomplete: 'off', 'aria-label': 'New profile name' }) as HTMLInputElement;
    let unlocked = true;
    const unlockAll = toggle(unlocked, 'Every chapter unlocked', (v) => (unlocked = v));
    const add = h('button', { class: 'p-btn primary' }, 'Add profile');
    const note = h('p', { class: 'p-note' });
    add.addEventListener('click', async () => {
      const label = name.value.trim();
      if (!label) return name.focus();
      add.setAttribute('disabled', '');
      note.textContent = 'Adding…';
      try {
        await createProfile(label, { ...freshProgress(''), name: label, unlockAll: unlocked });
        this.profiles = listProfiles().catch(() => [this.me]);
        if (this.alive) this.show('profiles');
      } catch {
        note.textContent = 'Couldn’t add it. Check the internet and try again.';
        add.removeAttribute('disabled');
      }
    });
    this.body.append(
      h('h2', {}, 'Add a profile'),
      h('div', { class: 'p-row' }, [h('div', {}, [h('strong', {}, 'Name'), h('small', {}, 'Also the player’s name in the game (it can be changed in Settings).')]), name]),
      h('label', { class: 'p-row' }, [h('div', {}, [h('strong', {}, 'Every chapter unlocked'), h('small', {}, 'Good for showing the game off.')]), unlockAll]),
      h('div', { class: 'p-row' }, [note, add]),
    );

    const profiles = await this.profiles;
    if (!this.alive || !list.isConnected) return;
    list.innerHTML = '';
    if (profiles.length === 1 && profiles[0] === this.me) {
      list.append(h('p', { class: 'p-note' }, 'Can’t reach the cloud right now, so other profiles can’t be shown.'));
    }
    for (const p of profiles) {
      const actions: HTMLElement[] = [];
      if (p.id === this.me.id) actions.push(h('span', { class: 'p-playing' }, 'Playing now'));
      else {
        const play = h('button', { class: 'p-btn primary small' }, 'Play as this');
        play.addEventListener('click', () => this.switchTo(p));
        actions.push(play);
        // Jasper's own profile can never be deleted from here.
        if (p.id !== JASPER) {
          actions.push(
            this.confirmButton('Delete', 'Tap again to delete', 'danger small', async () => {
              try {
                await deleteProfile(p.id);
                CloudProfile.forget(p.id);
                this.profiles = listProfiles().catch(() => [this.me]);
                if (this.alive) this.show('profiles');
              } catch {
                note.textContent = 'Couldn’t delete it. Check the internet and try again.';
              }
            }),
          );
        }
      }
      list.append(h('div', { class: 'p-profile', 'data-profile': p.id }, [h('strong', {}, p.label), h('div', { class: 'p-actions' }, actions)]));
    }
  }
}

function toggle(on: boolean, label: string, fn: (v: boolean) => void): HTMLElement {
  const b = h('button', { class: `p-toggle${on ? ' on' : ''}`, role: 'switch', 'aria-checked': String(on), 'aria-label': label });
  b.addEventListener('click', (e) => {
    e.preventDefault();
    on = !on;
    b.classList.toggle('on', on);
    b.setAttribute('aria-checked', String(on));
    fn(on);
  });
  return b;
}

function select(options: [string, string][], value: string, label: string, fn: (v: string) => void): HTMLElement {
  const s = h('select', { 'aria-label': label }) as HTMLSelectElement;
  for (const [v, text] of options) s.append(h('option', { value: v, selected: v === value }, text));
  s.addEventListener('change', () => fn(s.value));
  return s;
}
