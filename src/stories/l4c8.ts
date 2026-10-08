/**
 * Land 4, chapter 8 (the land's finale): Escape from Dame Snap.
 *
 * Plays straight after the finale game, where his right answers cracked
 * every rule on her board and she stormed off. Five scenes, the scariest
 * of the game so far (PLAN.md §2: she looms, shrieks and snaps her ruler,
 * and never touches anyone):
 *
 *   1. Her classroom. Moon-Face and the other two children sit at little
 *      desks doing sums. Her very last rule, No escaping (half cracked at
 *      the end of l4c7), cracks right through, and the whole board crashes
 *      down. Everyone is free! The Saucepan Man hears "playtime".
 *   2. The iron gates, locked. Silky flutters in with the secret key (from
 *      l4c7), the padlock drops, the crows fly up and the gates swing
 *      open. Out they run, just as Dame Snap bursts out of the door.
 *   3. Down the ladder. She looms at the top on the edge of her land and
 *      shrieks "I will SNAP you up!", snapping her ruler in her rage: half
 *      of it tumbles past them. Then the land rumbles and moves on, up into
 *      the clouds, taking her with it.
 *   4. Home in Moon-Face's room, everyone safe: the snapped ruler (the
 *      keepsake) and the seal. Will she come back? Let her try.
 *   5. Dusk at the top of the tree, and something warm at last: bunting
 *      and balloons settle into the cloud. The Land of Birthdays.
 */
import { landSeal } from '../art/keepsakes';
import { moonRoom, tree } from '../art/scenery';
import { balloonArt, BRANCH, escapeBackdrop, LADDER, ladderArt, rulerHalf } from '../scenes/finale-art';
import { bell, C, cloud, defineStory, NOTE, now, tone, type Kit } from './kit';
import { at, flump, together, wave } from './bits';
import { classroom, crackRule, crowFlying, deskFront, gateLeaf, padlock, RULE_FOR, rulesBoard, snapSound } from './snapSchool';

// ------------------------------------------------------------------ sounds

/** A hand on a ladder rung: a small wooden clonk. */
function rung(i: number): void {
  tone(i % 2 ? 300 : 260, now(), { wave: 'triangle', peak: 0.1, attack: 0.003, decay: 0.08, glideTo: 180, lowpass: 1500 });
}

/** A key turning in the padlock: two dry clicks. */
function click(): void {
  const t = now();
  for (let i = 0; i < 2; i++) tone(1800 - i * 400, t + i * 0.16, { wave: 'square', peak: 0.04, attack: 0.002, decay: 0.04, lowpass: 3000 });
}

/** Far off, party music: a little tune on a bell, floating down from the cloud. */
function partyTune(): void {
  const t = now();
  [NOTE.C5, NOTE.C5, NOTE.D5, NOTE.C5, NOTE.F5, NOTE.E5].forEach((f, i) => bell(f, t + i * 0.3, 0.05, 0.8));
}

// --------------------------------------------------------------------- consts

/** The rules board in the classroom (it crashes down when the last rule breaks). */
const BOARD = { x: 370, y: 24, w: 440 };
/** The gates in the yard, closed, side by side. */
const GATE = { y: 300, w: 230 };

// -------------------------------------------------------------------- story

export default defineStory({
  lines: {
    broken: { who: 'narrator', text: 'Crack! Her very last rule broke in two. No escaping? Not any more!' },
    free: { who: 'moonface', text: 'We’re free! Out of these silly little desks, everybody!' },
    play: { who: 'saucepan', text: 'Eh? PLAYTIME? Ooh, lovely! Clank, clank!' },
    run: { who: 'hero', text: 'Not playtime. ESCAPE time! Quick, to the ladder!' },
    key: { who: 'silky', text: 'The gates are locked! Here, try the secret key!' },
    stop: { who: 'dameSnap', text: 'STOP! Come back here this INSTANT!' },
    snapup: { who: 'dameSnap', text: 'I will SNAP you up! Every last one of you!' },
    away: { who: 'narrator', text: 'Then, with a great rumble, her school moved on, up and away into the clouds.' },
    phew: { who: 'moonface', text: 'Phew! Home, and everybody safe and sound. What a day!' },
    prize: { who: 'narrator', text: '{name} won half of Dame Snap’s snapped ruler, and the seal of her school!' },
    back: { who: 'hero', text: 'Will she really come back for us, Moon-Face?' },
    ready: { who: 'moonface', text: 'Let her try! She can’t stand a child who’s good at sums.' },
    listen: { who: 'hero', text: 'Listen! Music… and a balloon! Something new is in the cloud.' },
    party: { who: 'moonface', text: 'Bunting and cake! The Land of Birthdays. Now THAT’S a land I like!' },
  },

  async play(k: Kit) {
    // The other two children, who were made to sit at desks with Moon-Face.
    const [sibA, sibB] = (['beth', 'joe', 'fran'] as const).filter((c) => c !== k.hero);

    // ------------------------------------------- scene 1: the last rule cracks
    k.backdrop(classroom({ name: 'l4c8-class' }));
    k.music('spooky');
    const dim = k.dim(0.28, '#14121c');
    k.light(590, 220, 300, { color: C.chalk, strength: 0.12 });
    k.ambient('dust', { count: 8, area: [0, 100, 1180, 500] });

    const cracked = [1, 2, 3, 4, 5, 6].map((n) => RULE_FOR[n]);
    const board = k.add(rulesBoard(cracked), { ...BOARD, z: 6 });
    k.set(board, { transformOrigin: '50% 100%' });
    const seats = [
      { id: sibA as string, x: 20 },
      { id: 'moonface', x: 330 },
      { id: sibB as string, x: 640 },
    ];
    const sitters = seats.map((s) => k.character(s.id, { x: s.x, y: 380, w: 230, z: 20 }));
    const desks = seats.map((s, i) => k.add(deskFront(`l4c8-${i}`, ['3 + 5', '9 − 4', '6 + 4'][i]), { x: s.x - 15, y: 590, w: 260, z: 24 }));
    const hero = k.character('hero', { x: 920, y: 360, w: 240, z: 22, flip: true });
    const chalk = k.keepsake('chalk', { x: 880, y: 300, w: 110, z: 26 });
    k.set(hero, { opacity: 0 });
    k.set(chalk, { opacity: 0, rotation: -30 });
    await k.enter(hero, 'right', 0.8);
    await k.appear(chalk, 0.3);

    // Her very last rule cracks right through…
    const told = k.say('broken');
    await k.wait(500);
    await crackRule(k, BOARD, RULE_FOR[7]);
    k.sparkle(590, 330, 14, 160);
    await told;
    // …and the whole board crashes down in a cloud of chalk.
    k.silence();
    void k.shake(board, 5, 2);
    snapSound.crack();
    await k.wait(400);
    k.fx.crash();
    void k.quake(9);
    await k.to(board, 0.6, { rotation: 12, y: 380, opacity: 0, ease: 'power2.in' });
    k.puff(590, 470, 260, C.chalk);
    k.puff(420, 520, 160, C.chalk);
    k.puff(760, 520, 180, C.chalk);
    k.remove(board);
    void k.fade(dim, 0.08, 0.8);

    // Everyone leaps up out of the little desks.
    k.music('adventure');
    k.fx.boing();
    await k.all(...sitters.map((s, i) => k.wait(i * 120).then(() => k.hop(s, 60, 1))), ...desks.map((d) => k.shake(d, 4, 1)));
    void wave(k, sitters[1], 'armL', 3);
    await k.say('free', sitters[1]);
    const pan = k.character('saucepan', { x: 900, y: 120, w: 200, z: 18, flip: true });
    k.set(pan, { opacity: 0 });
    snapSound.clank(5);
    await k.enter(pan, 'top', 0.5);
    void k.to(k.part(pan, 'pots'), 0.12, { rotation: 6, yoyo: true, repeat: 5, ease: 'sine.inOut' });
    await k.all(k.say('play', pan), k.hop(pan, 30, 2));
    void k.shake(hero, 5, 1);
    await k.say('run', hero);
    k.fx.patter(8, 0.1);
    await k.all(
      ...[...sitters, hero, pan].map((el, i) => k.wait(i * 80).then(() => k.exit(el, 'right', 0.6))),
      k.vanish(chalk),
    );

    // ------------------------------------------- scene 2: the gates
    let gl!: HTMLElement;
    let gr!: HTMLElement;
    let lock!: HTMLElement;
    let h2!: HTMLElement;
    let m2!: HTMLElement;
    let p2!: HTMLElement;
    await k.cut(() => {
      k.landScene(4);
      k.dim(0.2, '#14121c');
      k.light(690, 370, 70, { color: C.candle, strength: 0.5, flicker: true });
      // Behind the bars, waiting: the hero, Moon-Face and the Saucepan Man.
      h2 = k.character('hero', { x: 330, y: 330, w: 200, z: 20 });
      m2 = k.character('moonface', { x: 490, y: 320, w: 200, z: 19 });
      p2 = k.character('saucepan', { x: 640, y: 330, w: 200, z: 20, flip: true });
      gl = k.add(gateLeaf('l4c8-l'), { x: 360, y: GATE.y, w: GATE.w, z: 24 });
      gr = k.add(gateLeaf('l4c8-r'), { x: 360 + GATE.w, y: GATE.y, w: GATE.w, z: 24, flip: true });
      k.set(gl, { transformOrigin: '0% 50%' });
      k.set(gr, { transformOrigin: '100% 50%' });
      lock = k.add(padlock(), { x: 530, y: 410, w: 120, z: 27 });
    });
    snapSound.caw(2);
    void k.shake(gl, 3, 1);
    void k.shake(gr, 3, 1);
    // Silky flutters down with the secret key.
    const silky = k.character('silky', { x: 760, y: 140, w: 190, z: 30, flip: true });
    const key = k.keepsake('brassKey', { x: 740, y: 280, w: 100, z: 31 });
    k.set([silky, key], { opacity: 0, x: 300, y: -200 });
    k.fx.twinkle();
    await k.all(k.to([silky, key], 1, { opacity: 1, x: 0, y: 0, ease: 'sine.out' }));
    k.float(silky, 6, 1.6);
    await k.say('key', silky);
    // Into the lock it goes. Click, click… and the padlock drops.
    await k.to(key, 0.6, { x: -170, y: 150, rotation: 90, scale: 0.7, ease: 'power1.inOut' });
    click();
    await k.to(key, 0.25, { rotation: 180 });
    k.sfx.sparkle();
    k.sparkle(590, 470, 12, 120);
    void k.vanish(key);
    await k.to(lock, 0.5, { y: 360, rotation: 30, opacity: 0, ease: 'power2.in' });
    k.fx.thud();
    // The gates swing open, and the crows burst up off the railings.
    k.fx.creak();
    void k.to(gl, 1, { scaleX: 0.15, ease: 'sine.inOut' });
    void k.to(gr, 1, { scaleX: 0.15, ease: 'sine.inOut' });
    snapSound.caw(3);
    for (const [i, cx] of [120, 980, 300].entries()) {
      const crow = k.add(crowFlying(`l4c8-${i}`), { x: cx, y: 330 - i * 20, w: 120, z: 14, flip: i === 1 });
      void k.to(crow, 1.6, { x: i === 1 ? 300 : -300, y: -420, ease: 'power1.in' }).then(() => k.remove(crow));
    }
    await k.wait(900);
    // Out they run, towards us…
    k.fx.patter(8, 0.1);
    snapSound.clank(4);
    await k.all(
      ...[h2, m2, p2].map((el, i) => k.wait(i * 150).then(() => k.to(el, 0.9, { y: 560, scale: 1.6, opacity: 0, ease: 'power2.in' }))),
    );
    // …just as the school door bangs open.
    const snap = k.snap('shriek', { x: 530, y: 360, w: 130, z: 12 });
    k.set(snap, { opacity: 0, scale: 0.6, transformOrigin: '50% 100%' });
    snapSound.slam();
    void k.quake(5);
    await k.to(snap, 0.4, { opacity: 1, scale: 1, ease: 'back.out(1.6)' });
    k.music('spooky');
    snapSound.heels(4, 0.2);
    void k.camera({ zoom: 2, x: 595, y: 430 }, 0.8);
    await k.all(k.say('stop', snap), k.shake(snap, 4, 2));

    // ------------------------------------------- scene 3: she looms at the top of the ladder
    let land!: HTMLElement;
    let snap3!: HTMLElement;
    let feet!: HTMLElement[];
    let climbers!: HTMLElement[];
    await k.cut(() => {
      k.backdrop(escapeBackdrop('l4c8-sky', ['#2b2833', '#5d5b6b', C.duskSky]));
      k.add(ladderArt('l4c8-ladder', 10), { x: LADDER.x - 60, y: LADDER.top, w: 120, z: 4, still: true });
      snap3 = k.snap('loom', { x: 470, y: -70, w: 240, z: 7 });
      land = k.landFar(4, { x: 290, y: 18, w: 600, z: 6 });
      // Clouds at her feet, so she stands on the edge of her land.
      feet = [400, 520].map((x, i) => k.add(cloud(C.cloudShade, `l4c8-feet${i}`), { x, y: 110, w: 260, h: 200, z: 8 }));
      climbers = (['hero', 'moonface', 'saucepan'] as const).map((id, i) => k.character(id, { x: LADDER.x - 75, y: 200 + i * 140, w: 150, z: 20 - i }));
      k.set(snap3, { opacity: 0, y: 60 });
    });
    k.fx.wind(2);
    // Hand over hand, down they go.
    for (let i = 0; i < 6; i++) {
      rung(i);
      await together(k, climbers, 0.3, { y: `+=${i < 5 ? 34 : 20}`, ease: 'power1.inOut' });
    }
    // Clack, clack… and she rises up at the top of the ladder.
    snapSound.heels(4, 0.28, 0.8);
    await k.wait(900);
    snapSound.slam();
    await k.to(snap3, 0.7, { opacity: 1, y: 0, ease: 'back.out(1.3)' });
    void k.camera({ zoom: 1.55, x: 590, y: 170 }, 0.9);
    await k.wait(400);
    k.pose(snap3, 'shriek');
    k.sfx.ominous();
    void k.quake(4);
    await k.all(k.say('snapup', snap3), k.shake(snap3, 5, 3));

    // In her rage she snaps her ruler: half of it tumbles down past them.
    k.pose(snap3, 'stomp');
    k.fx.stomp(2, 0.3);
    await k.wait(300);
    snapSound.ruler();
    k.pose(snap3, 'defeated');
    void k.camera({}, 0.8);
    const half = k.add(rulerHalf('l4c8-half', true), { x: 640, y: 120, w: 54, h: 144, z: 30 });
    k.fx.whizz();
    await k.all(
      k.to(half, 1.4, { x: BRANCH[0] + 60 - 640, y: BRANCH[1] - 100 - 120, rotation: 520, ease: 'power1.in' }),
      ...climbers.map((c) => k.shake(c, 5, 1)),
    );
    k.fx.thud();
    k.puff(BRANCH[0] + 90, BRANCH[1] - 30, 90, C.cloud);

    // The land rumbles and moves on, up into the clouds, with her on it.
    k.fx.rumble(3);
    void k.quake(5);
    k.pose(snap3, 'shriek');
    const going = k.all(
      k.to([land, snap3, ...feet], 6, { y: '-=420', ease: 'power1.in' }),
      k.to([land, snap3, ...feet], 6, { scale: 0.5, ease: 'power1.in' }),
    );
    // And they hop down onto the branch, one after another.
    const hopDown = async () => {
      for (const [i, c] of climbers.entries()) {
        const [cx, cy] = at(c);
        rung(i);
        await k.to(c, 0.5, { x: `+=${BRANCH[0] - 60 - i * 120 - cx}`, y: `+=${BRANCH[1] - 180 - cy}`, ease: 'power1.inOut' });
      }
    };
    await k.all(k.say('away'), hopDown());
    await going;

    // ------------------------------------------- scene 4: home, everybody safe
    let m4!: HTMLElement;
    let h4!: HTMLElement;
    let p4!: HTMLElement;
    let all4!: HTMLElement[];
    await k.cut(() => {
      k.backdrop(moonRoom('l4c8-room'));
      k.light(590, 236, 230, { color: '#c9d4ff', strength: 0.25 });
      k.ambient('dust', { count: 12 });
      const a = k.character(sibA, { x: 20, y: 380, w: 210, z: 19 });
      h4 = k.character('hero', { x: 220, y: 370, w: 220, z: 20 });
      m4 = k.character('moonface', { x: 480, y: 360, w: 230, z: 21 });
      const b = k.character(sibB, { x: 730, y: 380, w: 210, z: 19, flip: true });
      p4 = k.character('saucepan', { x: 930, y: 360, w: 220, z: 20, flip: true });
      all4 = [a, h4, m4, b, p4];
    });
    k.music('cosy');
    flump();
    await together(k, all4, 0.3, { y: '+=10' });
    await together(k, all4, 0.3, { y: '-=10' });
    await k.say('phew', m4);
    const keep = k.keepsake(k.chapter?.keepsake ?? 'snappedRuler', { x: 515, y: 640, w: 150, z: 24 });
    const seal = k.add(landSeal(4), { x: 480, y: 70, w: 220, z: 30 });
    k.set([keep, seal], { opacity: 0 });
    k.fx.pop();
    await k.appear(keep, 0.4);
    k.fx.jingle();
    await k.appear(seal, 0.6);
    k.sparkle(590, 180, 16, 200);
    k.float(seal, 6, 2);
    snapSound.clank(3);
    await k.all(k.say('prize'), k.hop(h4, 36, 2), k.wait(300).then(() => k.hop(p4, 24, 2)));
    await k.say('back', h4);
    void k.blink(m4);
    await k.all(k.say('ready', m4), k.wait(400).then(() => k.hop(m4, 24, 1)));
    await k.wait(400);

    // ------------------------------------------- scene 5: the Land of Birthdays
    let h5!: HTMLElement;
    let m5!: HTMLElement;
    await k.cut(() => {
      k.backdrop(tree('l4c8-tree', { landN: 5 }));
      k.dim(0.15, '#2a2236');
      k.ambient('fireflies', { count: 10, area: [0, 300, 1180, 400] });
      h5 = k.character('hero', { x: 20, y: 470, w: 230, z: 40 });
      m5 = k.character('moonface', { x: 930, y: 470, w: 230, z: 40, flip: true });
    });
    k.music('dreamy');
    k.fx.wind(2);
    await k.wait(600);
    partyTune();
    // A balloon drifts down out of the cloud.
    const bal = k.add(balloonArt('l4c8-balloon', C.red), { x: 700, y: -140, w: 70, z: 30 });
    void k.to(bal, 6, { y: 300, x: -120, rotation: -8, ease: 'sine.out' });
    await k.wait(800);
    await k.all(k.say('listen', h5), k.hop(h5, 20, 1));
    void k.all(k.fade(h5, 0, 1.2), k.fade(m5, 0, 1.6));
    partyTune();
    await k.camera({ zoom: 1.9, x: 590, y: 110 }, 3);
    k.sfx.sparkle();
    k.sparkle(590, 120, 16, 220);
    await k.say('party', m5);
    k.fx.twinkle();
    await k.wait(1600);
  },
});
