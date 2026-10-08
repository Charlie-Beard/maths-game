/**
 * Land 5, chapter 8 (the land's finale): The Birthday Wish.
 *
 * Plays straight after the escape, and follows on from l5c7, which ends
 * with the ground rumbling just after his wish. Six short scenes:
 *
 *   1. The party lawn, rumbling. Silky: grab the party things! The
 *      balloons float up out of the grass, ten in a row and four more,
 *      fourteen (the land's teen numbers), and gather in a bunch in the
 *      hero's hand. Mr Oom Boom Boom drums everyone to the ladder.
 *   2. Down the ladder, floating as light as feathers on their balloons.
 *   3. The one dark thread (PLAN.md §3's dramatic irony, set up in l5c6):
 *      back on the empty lawn, a thin ink-black shadow taps the birthday
 *      list with the tip of a ruler. Tap, tap, tap. Only a shadow, and
 *      brief. Nobody saw.
 *   4. Safe on the branch at the top of the tree, they wave goodbye as the
 *      land floats away on its own balloons.
 *   5. Home in Moon-Face's room the party carries on: happy birthday! The
 *      birthday badge (the keepsake) and the seal.
 *   6. Dusk at the top of the tree. THUMP. THUMP. The tree shakes, and a
 *      new land settles into the cloud: boots as big as houses and a
 *      teacup as big as a pond. Giants!
 */
import { landSeal } from '../art/keepsakes';
import { sceneSvg, sky, hills, bunting } from '../art/lands/common';
import { moonRoom, tree } from '../art/scenery';
import { balloonArt, BRANCH, escapeBackdrop, LADDER, ladderArt } from '../scenes/finale-art';
import { C, defineStory, ink, NOTE, noiseBurst, now, piece, raw, rect, svg, tone, bell, type Kit } from './kit';
import { flump, numberTag, tick, together, wave } from './bits';

// ------------------------------------------------------------------ sounds

/** Mr Oom Boom Boom's drum: oom, boom, boom. */
function drum(times = 3): void {
  const t = now();
  for (let i = 0; i < times; i++) {
    tone(i === 0 ? 90 : 120, t + i * 0.32, { peak: 0.24, decay: 0.28, glideTo: 50 });
    noiseBurst(t + i * 0.32, { freq: 400, type: 'lowpass', peak: 0.1, decay: 0.12 });
  }
}

/** A hand on a ladder rung: a small wooden clonk. */
function rung(i: number): void {
  tone(i % 2 ? 300 : 260, now(), { wave: 'triangle', peak: 0.08, attack: 0.003, decay: 0.08, glideTo: 180, lowpass: 1500 });
}

/** The shadow: two low, creeping notes and a breath of air. Quiet. */
function creep(): void {
  const t = now();
  tone(NOTE.E3, t, { wave: 'triangle', peak: 0.07, attack: 0.08, decay: 0.5, lowpass: 900 });
  tone(NOTE.D3 * 1.06, t + 0.5, { wave: 'triangle', peak: 0.07, attack: 0.08, decay: 0.8, lowpass: 900 });
  noiseBurst(t, { freq: 600, q: 2, peak: 0.03, attack: 0.4, decay: 0.9, sweepTo: 300 });
}

/** The tip of a ruler tapping on paper. */
function tapTap(): void {
  tone(1400, now(), { wave: 'triangle', peak: 0.05, attack: 0.002, decay: 0.05, lowpass: 2500 });
}

/** A giant's footstep, far above: deep and slow. */
function thump(): void {
  const t = now();
  tone(48, t, { peak: 0.3, attack: 0.01, decay: 0.6, glideTo: 30 });
  noiseBurst(t, { freq: 180, type: 'lowpass', peak: 0.2, decay: 0.45 });
}

/** A happy birthday tune on bells. */
function birthdayTune(): void {
  const t = now();
  [NOTE.C5, NOTE.C5, NOTE.D5, NOTE.C5, NOTE.F5, NOTE.E5].forEach((f, i) => bell(f, t + i * 0.28, 0.06, 0.9));
}

// --------------------------------------------------------------------- art

const FLAGS = [C.red, C.gold, C.blue, C.green, C.pink, C.purple];
const BALLOONS = [C.red, C.gold, C.blue, C.green, C.pink, C.purple, C.orange];

/** The empty party lawn at evening, the birthday list on its post. */
function emptyLawn(): string {
  return sceneSvg('l5c8-lawn', [
    ...sky([
      [C.duskHigh, 0],
      ['#c99a6a', 260],
      ['#d9b47f', 460],
    ]),
    hills(470, 40, '#c9a46a', 581),
    ...bunting([-20, 80], [600, 70], 60, FLAGS, 28),
    hills(560, 24, '#7f9c58', 582, { step: 80 }),
    // A dropped party hat and a few streamers on the grass.
    piece(rect(-20, 600, 1220, 240), '#7f9c58', { rough: 0.6 }),
    ...[[200, 690], [420, 740], [640, 700]].map(([x, y], i) => ink([[x, y], [x + 30, y - 10], [x + 60, y + 6], [x + 90, y - 4]], { width: 5, color: FLAGS[i] })),
    // The post the birthday list is pinned to.
    piece(rect(916, 60, 18, 560, 4), C.wood, { edge: 'cut' }),
    piece(rect(890, 610, 70, 14, 4), C.brownDark, { edge: 'cut' }),
  ]);
}

/** The birthday list: a scroll of names (scribbles), one line ringed in red. */
function birthdayList(): string {
  return svg({ w: 160, h: 220, name: 'l5c8-list' }, [
    piece(rect(10, 16, 140, 196, 6), C.cream, { rough: 0.8 }),
    piece(rect(4, 6, 152, 18, 8), C.sand, { edge: 'cut' }),
    piece(rect(4, 202, 152, 16, 8), C.sand, { edge: 'cut' }),
    raw(`<text x="80" y="54" font-family="Andika, sans-serif" font-weight="700" font-size="20" fill="${C.redDark}" text-anchor="middle">Birthdays</text>`),
    ...[78, 104, 130, 156, 182].map((y, i) => ink([[30, y], [60 + (i % 3) * 14, y - 2], [90 + (i % 2) * 20, y + 1], [128, y - 1]], { width: 3, color: C.slate, wobble: 1.2 })),
    ink([[22, 128], [80, 116], [138, 126], [132, 142], [74, 146], [20, 136], [26, 124]], { width: 2.5, color: C.red }),
  ]);
}

/** The tip of her ruler, poking in from the side: 200 × 40, ink-black. */
function rulerTip(): string {
  return svg({ w: 200, h: 40, name: 'l5c8-tip', boil: false }, [piece(rect(0, 8, 196, 24, 2), C.snapInk, { edge: 'cut', fibre: false })]);
}

// -------------------------------------------------------------------- story

export default defineStory({
  lines: {
    rumble: { who: 'narrator', text: 'Rumble, rumble! The party was ending, and the Land of Birthdays was moving on.' },
    grab: { who: 'silky', text: 'Quick! Grab the party things! The balloons, the presents, everything!' },
    count: { who: 'hero', text: 'Ten balloons in a row… and four more. Fourteen balloons! Hold on tight!' },
    drum: { who: 'oomboom', text: 'Oom boom boom! Follow the drum, everybody. To the ladder!' },
    float: { who: 'narrator', text: 'Down the ladder they floated, as light as feathers, holding their balloons.' },
    list: { who: 'narrator', text: 'But on the empty lawn, a thin shadow tapped the birthday list. Tap. Tap. Tap.' },
    bye: { who: 'oomboom', text: 'Goodbye, Land of Birthdays! Oom boom BOOM!' },
    away: { who: 'narrator', text: 'And the Land of Birthdays floated away into the sky, on its own balloons.' },
    happy: { who: 'moonface', text: 'The party isn’t over yet! Happy birthday, {name}! Pop biscuits for everyone!' },
    prize: { who: 'narrator', text: '{name} won a birthday badge, and the seal of the Land of Birthdays!' },
    thump: { who: 'narrator', text: 'Then… THUMP. THUMP. The whole tree shook, right down to its roots.' },
    boots: { who: 'hero', text: 'Look up there! Boots as big as houses, and a teacup as big as a pond!' },
    giants: { who: 'moonface', text: 'Giants! Big boots, big cups… and BIG numbers, I expect!' },
  },

  async play(k: Kit) {
    // ------------------------------------------- scene 1: grab the balloons
    k.landScene(5);
    k.music('adventure');
    const oom = k.character('oomboom', { x: 40, y: 350, w: 240, z: 20 });
    const silky = k.character('silky', { x: 340, y: 330, w: 210, z: 21 });
    const hero = k.character('hero', { x: 900, y: 360, w: 240, z: 20, flip: true });
    k.set([oom, silky, hero], { opacity: 0 });
    await k.all(k.enter(oom, 'left'), k.enter(hero, 'right'), k.wait(200).then(() => k.enter(silky, 'top')));
    k.float(silky, 6, 1.6);
    k.fx.rumble(2.5);
    void k.quake(5);
    await k.all(k.say('rumble'), k.shake(hero, 4, 2));
    await k.say('grab', silky);

    // The balloons float up out of the grass: a row of ten, then four more.
    const balloons: HTMLElement[] = [];
    for (let i = 0; i < 14; i++) {
      const row = i < 10 ? 0 : 1;
      const x = 250 + (row ? i - 10 : i) * 62;
      const el = k.add(balloonArt(`l5c8-b${i}`, BALLOONS[i % BALLOONS.length]), { x, y: 100 + row * 150, w: 60, z: 25 });
      k.set(el, { opacity: 0, y: 500 });
      balloons.push(el);
    }
    const ten = k.add(numberTag('10', C.goldLight, 'l5c8-ten'), { x: 880, y: 130, w: 110, z: 26 });
    const four = k.add(numberTag('4', C.sky, 'l5c8-four'), { x: 520, y: 280, w: 110, z: 26 });
    const fourteen = k.add(numberTag('14', C.pink, 'l5c8-fourteen'), { x: 870, y: 130, w: 120, z: 27 });
    k.set([ten, four, fourteen], { opacity: 0 });
    const rise = async () => {
      for (const [i, b] of balloons.entries()) {
        tick(i % 10);
        void k.to(b, 0.6, { y: 0, opacity: 1, ease: 'back.out(1.2)' });
        await k.wait(i === 9 ? 700 : 260);
        if (i === 9) await k.appear(ten, 0.3);
      }
      await k.appear(four, 0.3);
      await k.wait(500);
      k.sfx.sparkle();
      void k.fade(ten, 0, 0.3);
      void k.fade(four, 0, 0.3);
      await k.appear(fourteen, 0.4);
    };
    await k.all(k.say('count', hero), rise());
    balloons.forEach((b, i) => k.float(b, 5, 1.6 + (i % 4) * 0.2));
    // Into a bunch in the hero's hand.
    void k.fade(fourteen, 0, 0.4);
    k.fx.whizz();
    await k.all(...balloons.map((b, i) => k.to(b, 0.8, { x: `+=${960 + (i % 5) * 24 - (250 + (i < 10 ? i : i - 10) * 62)}`, y: `+=${170 + Math.floor(i / 5) * 30 - (100 + (i < 10 ? 0 : 150))}`, ease: 'power2.inOut' })));
    drum(3);
    void k.hop(oom, 24, 2);
    await k.say('drum', oom);
    drum(3);
    k.fx.patter(6, 0.12);
    await k.all(k.exit(oom, 'right', 0.9), k.exit(silky, 'right', 0.9), k.exit(hero, 'right', 0.9), ...balloons.map((b) => k.to(b, 0.9, { x: '+=500', ease: 'power2.in' })));

    // ------------------------------------------- scene 2: floating down the ladder
    let land!: HTMLElement;
    let climbers!: HTMLElement[];
    let bunches!: HTMLElement[][];
    let underLand!: HTMLElement[];
    const SKY: [string, string, string] = ['#f6e3b4', C.goldLight, C.duskSky];
    const buildLadder = (name: string) => {
      k.backdrop(escapeBackdrop(name, SKY));
      k.add(ladderArt(`${name}-ladder`, 10), { x: LADDER.x - 60, y: LADDER.top, w: 120, z: 4, still: true });
      // The land rides on its own balloons, tucked under its cloud.
      underLand = [330, 420, 520, 640, 760, 830].map((x, i) => k.add(balloonArt(`${name}-u${i}`, BALLOONS[(i + 2) % BALLOONS.length]), { x, y: 120 + (i % 2) * 20, w: 56, z: 5 }));
      land = k.landFar(5, { x: 290, y: 18, w: 600, z: 6 });
    };
    /** A climber with three balloons above their hand, moving as one. */
    const climber = (id: string, x: number, y: number, z: number): [HTMLElement, HTMLElement[]] => {
      const el = k.character(id, { x, y, w: 150, z });
      const bs = [0, 1, 2].map((i) => k.add(balloonArt(`l5c8-${id}-${i}`, BALLOONS[(i * 2 + z) % BALLOONS.length]), { x: x + 95 + i * 22, y: y - 120 + (i % 2) * 16, w: 50, z: z - 1 }));
      return [el, bs];
    };
    await k.cut(() => {
      buildLadder('l5c8-sky');
      const made = [climber('hero', LADDER.x - 75, 190, 22), climber('oomboom', LADDER.x - 75, 330, 20), climber('silky', LADDER.x - 75, 470, 18)];
      climbers = made.map((m) => m[0]);
      bunches = made.map((m) => m[1]);
    });
    k.music('dreamy');
    k.fx.wind(3);
    const floatDown = async () => {
      for (let i = 0; i < 5; i++) {
        rung(i);
        await k.all(...climbers.map((c, j) => together(k, [c, ...bunches[j]], 0.7, { y: '+=36', ease: 'sine.inOut' })));
      }
    };
    await k.all(k.say('float'), floatDown());
    await k.wait(300);

    // ------------------------------------------- scene 3: the shadow and the list
    let shadow!: HTMLElement;
    let tip!: HTMLElement;
    await k.cut(() => {
      k.backdrop(emptyLawn());
      k.dim(0.25, '#2a2236');
      k.add(birthdayList(), { x: 845, y: 120, w: 160, z: 10 });
      // Dame Snap, as nothing but a thin ink-black shadow, waiting off stage.
      shadow = k.snap('point', { x: 960, y: 110, w: 300, z: 11, flip: true });
      shadow.style.filter = 'brightness(0)';
      k.set(shadow, { scaleX: 0.85, opacity: 0.85, x: 360 });
      tip = k.add(rulerTip(), { x: 900, y: 226, w: 200, z: 12 });
      k.set(tip, { x: 360 });
    });
    k.silence();
    k.fx.rumble(1.5);
    await k.camera({ zoom: 1.35, x: 930, y: 280 }, 0.8);
    creep();
    const peek = async () => {
      await k.all(k.to(shadow, 0.9, { x: 0, ease: 'power1.out' }), k.to(tip, 0.9, { x: 60, ease: 'power1.out' }));
      for (let i = 0; i < 3; i++) {
        await k.to(tip, 0.12, { x: 0, ease: 'power1.in' });
        tapTap();
        await k.to(tip, 0.25, { x: 50, ease: 'power1.out' });
        await k.wait(300);
      }
      await k.all(k.to(shadow, 0.6, { x: 360, ease: 'power1.in' }), k.to(tip, 0.6, { x: 400, ease: 'power1.in' }));
    };
    await k.all(k.say('list'), peek());
    await k.wait(300);

    // ------------------------------------------- scene 4: the land floats away
    let h4!: HTMLElement;
    let o4!: HTMLElement;
    let s4!: HTMLElement;
    let held!: HTMLElement[];
    await k.cut(() => {
      buildLadder('l5c8-sky2');
      h4 = k.character('hero', { x: BRANCH[0] - 10, y: 520, w: 170, z: 22 });
      o4 = k.character('oomboom', { x: BRANCH[0] - 170, y: 510, w: 170, z: 21 });
      s4 = k.character('silky', { x: BRANCH[0] + 140, y: 470, w: 160, z: 21 });
      held = [0, 1, 2, 3].map((i) => k.add(balloonArt(`l5c8-held${i}`, BALLOONS[i]), { x: BRANCH[0] + 110 + i * 20, y: 390 + (i % 2) * 18, w: 50, z: 20 }));
    });
    k.music('cosy');
    k.float(s4, 6, 1.6);
    held.forEach((b, i) => k.float(b, 5, 1.5 + i * 0.2));
    drum(3);
    void wave(k, h4, 'armR', 3);
    await k.all(k.say('bye', o4), k.hop(o4, 20, 2));
    k.fx.wind(4);
    // Up and away: the land, its cloud and its balloons, smaller and smaller.
    const lift = [land, ...underLand];
    await k.all(k.to(lift, 6, { y: '-=380', ease: 'power1.in' }), k.to(lift, 6, { scale: 0.4, ease: 'power1.in' }), k.say('away'));
    k.fx.twinkle();
    k.sparkle(590, 60, 10, 120);
    await k.wait(400);

    // ------------------------------------------- scene 5: the party carries on
    let h5!: HTMLElement;
    let m5!: HTMLElement;
    let all5!: HTMLElement[];
    await k.cut(() => {
      k.backdrop(moonRoom('l5c8-room'));
      k.light(590, 236, 230, { color: '#c9d4ff', strength: 0.25 });
      k.ambient('dust', { count: 12 });
      const o = k.character('oomboom', { x: 20, y: 360, w: 230, z: 19 });
      h5 = k.character('hero', { x: 250, y: 370, w: 230, z: 20 });
      m5 = k.character('moonface', { x: 650, y: 350, w: 240, z: 21, flip: true });
      const s = k.character('silky', { x: 900, y: 330, w: 220, z: 20, flip: true });
      all5 = [o, h5, m5, s];
      [[120, 120], [1000, 100], [300, 80]].forEach(([x, y], i) => {
        const b = k.add(balloonArt(`l5c8-room${i}`, BALLOONS[i + 1]), { x, y, w: 60, z: 15 });
        k.float(b, 8, 2 + i * 0.3);
      });
    });
    flump();
    await together(k, all5, 0.3, { y: '+=10' });
    await together(k, all5, 0.3, { y: '-=10' });
    birthdayTune();
    void k.hop(m5, 24, 2);
    await k.say('happy', m5);
    const keep = k.keepsake(k.chapter?.keepsake ?? 'birthdayBadge', { x: 515, y: 600, w: 150, z: 24 });
    const seal = k.add(landSeal(5), { x: 480, y: 70, w: 220, z: 30 });
    k.set([keep, seal], { opacity: 0 });
    k.fx.pop();
    await k.appear(keep, 0.4);
    k.fx.jingle();
    await k.appear(seal, 0.6);
    k.sparkle(590, 180, 16, 200);
    k.confetti(24);
    k.float(seal, 6, 2);
    await k.all(k.say('prize'), k.hop(h5, 36, 2));
    await k.wait(500);

    // ------------------------------------------- scene 6: THUMP. Giants!
    let h6!: HTMLElement;
    let m6!: HTMLElement;
    await k.cut(() => {
      k.silence();
      k.backdrop(tree('l5c8-tree', { landN: 6 }));
      k.dim(0.2, '#2a2236');
      h6 = k.character('hero', { x: 20, y: 470, w: 230, z: 40 });
      m6 = k.character('moonface', { x: 930, y: 470, w: 230, z: 40, flip: true });
    });
    await k.wait(600);
    const thumps = async () => {
      for (let i = 0; i < 2; i++) {
        thump();
        void k.quake(7);
        await k.all(k.shake(h6, 4, 1), k.shake(m6, 4, 1));
        await k.wait(700);
      }
    };
    await k.all(k.say('thump'), thumps());
    k.music('sneaky');
    await k.say('boots', h6);
    void k.all(k.fade(h6, 0, 1.2), k.fade(m6, 0, 1.6));
    await k.camera({ zoom: 1.9, x: 590, y: 110 }, 3);
    thump();
    void k.quake(5);
    await k.say('giants', m6);
    thump();
    void k.quake(4);
    await k.wait(1600);
  },
});
