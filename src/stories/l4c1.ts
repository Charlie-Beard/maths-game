/**
 * Land 4, chapter 1: A Strange New Land.
 *
 * A grey school has arrived at the top of the tree, under a bruised sky,
 * with crows on the railings. The Saucepan Man hears "pool" and wants a
 * swim. Heels clack; a shape moves in the lit window; the door bangs open
 * and Dame Snap looms on the step, hating right answers. But {name}'s sums
 * are chalked up right anyway, and the first of her rules cracks. Behind
 * them, the gates begin to swing. Next: The Gates Clang Shut.
 */
import { C, defineStory, type Kit } from './kit';
import { chalkText, crackRule, gateLeaf, RULE_FOR, rulesBoard, slate, snapSound } from './snapSchool';

const BOARD = { x: 790, y: 70, w: 330 };

export default defineStory({
  lines: {
    arrive: { who: 'narrator', text: 'A strange new land had come to the top of the tree. A school!' },
    pool: { who: 'saucepan', text: 'A POOL? Oh, lovely! Where’s my swimming hat?' },
    school: { who: 'hero', text: 'Not a pool. A SCHOOL. And somebody’s watching us…' },
    snap: { who: 'dameSnap', text: 'New pupils! Sums all day long. And I HATE right answers!' },
    crack: { who: 'narrator', text: 'But {name} chalked every sum right. And one of her rules cracked!' },
    gates: { who: 'hero', text: 'Uh-oh. The gates are swinging shut behind us…' },
  },

  async play(k: Kit) {
    k.landScene();
    k.music('spooky');
    const dim = k.dim(0.22, '#14121c');
    k.light(690, 370, 70, { color: C.candle, strength: 0.5, flicker: true });
    k.ambient('dust', { count: 10, area: [0, 300, 1180, 380] });

    const hero = k.character('hero', { x: 30, y: 350, w: 250, z: 20 });
    const pan = k.character('saucepan', { x: 220, y: 340, w: 260, z: 21 });
    k.set([hero, pan], { opacity: 0 });

    // Into the yard: crows caw from the railings.
    await k.wait(300);
    snapSound.caw(2);
    k.fx.patter(4, 0.2);
    await k.enter(hero, 'left', 0.8);
    snapSound.clank(4);
    await k.all(k.enter(pan, 'left', 0.8), k.say('arrive'));

    // The Saucepan Man mishears.
    snapSound.clank(3);
    void k.to(k.part(pan, 'pots'), 0.12, { rotation: 6, yoyo: true, repeat: 5, ease: 'none' });
    await k.all(k.say('pool', pan), k.hop(pan, 30, 2));
    await k.shake(hero, 6, 1);

    // Somebody's watching: a push in on the lit window, heels clacking.
    const watched = k.say('school', hero);
    await k.wait(600);
    snapSound.heels(5, 0.32, 0.7);
    await k.camera({ zoom: 1.8, x: 680, y: 400 }, 1.4);
    await watched;

    // The door bangs open and she looms on the step.
    const snap = k.snap('loom', { x: 450, y: 170, w: 300, z: 12 });
    k.set(snap, { opacity: 0, scale: 0.6, transformOrigin: '50% 100%' });
    snapSound.slam();
    void k.quake(6);
    void k.camera({ zoom: 1.35, x: 600, y: 360 }, 0.6);
    await k.to(snap, 0.5, { opacity: 1, scale: 1, ease: 'back.out(1.4)' });
    snapSound.heels(3, 0.28);
    await k.wait(600);
    k.pose(snap, 'shriek');
    snapSound.ruler();
    void k.shake(snap, 4, 2);
    await k.say('snap', snap);

    // Cut back to the heroes, wide: she sweeps inside, and the chalk goes to work.
    k.pose(snap, 'point');
    void k.camera({}, 1.0);
    snapSound.heels(4, 0.22);
    await k.to(snap, 0.5, { opacity: 0, scale: 0.7, ease: 'power2.in' });
    snapSound.slam();
    k.remove(snap);

    const board = k.add(rulesBoard(), { ...BOARD, z: 22 });
    k.set(board, { opacity: 0 });
    void k.fade(dim, 0.12, 0.8);
    await k.appear(board, 0.4);
    // A slate, and the chalk writing his sums on it.
    const sl = k.add(slate(340, 190), { x: 410, y: 170, w: 340, z: 27 });
    k.set(sl, { opacity: 0 });
    await k.appear(sl, 0.3);
    const chalk = k.keepsake('chalk', { x: 300, y: 140, w: 130, z: 30 });
    k.set(chalk, { opacity: 0 });
    await k.appear(chalk, 0.3);
    const sums = ['4 + 3 = 7', '9 − 5 = 4'].map((s, i) => {
      const el = k.add(chalkText(s, { w: 300 }), { x: 430, y: 190 + i * 72, w: 300, z: 28 });
      k.set(el, { opacity: 0 });
      return el;
    });
    const told = k.say('crack');
    for (const [i, s] of sums.entries()) {
      snapSound.chalk(0.6);
      k.set(chalk, { x: 120, y: 30 + i * 72 });
      await k.all(k.fade(s, 1, 0.6), k.to(chalk, 0.6, { x: 330, ease: 'none' }));
      k.fx.pop();
      await k.wait(200);
    }
    void k.to(chalk, 0.5, { x: 0, y: 0, rotation: -20 });
    await crackRule(k, BOARD, RULE_FOR[1]);
    k.sparkle(560, 290, 12, 140);
    k.sfx.sparkle();
    void k.hop(hero, 40, 2);
    snapSound.clank(3);
    await k.hop(pan, 30, 2);
    await told;

    // Behind them, the gates start to swing.
    const left = k.add(gateLeaf('l'), { x: -20, y: 250, w: 260, z: 24 });
    const right = k.add(gateLeaf('r'), { x: 940, y: 250, w: 260, z: 24, flip: true });
    k.set(left, { scaleX: 0.15, transformOrigin: '0% 50%' });
    k.set(right, { scaleX: 0.15, transformOrigin: '100% 50%' });
    k.fx.creak();
    snapSound.caw(1);
    await k.all(
      k.to(left, 2.2, { scaleX: 0.6, ease: 'sine.in' }),
      k.to(right, 2.2, { scaleX: 0.6, ease: 'sine.in' }),
      k.say('gates', hero),
    );
    await k.wait(500);
  },
});
