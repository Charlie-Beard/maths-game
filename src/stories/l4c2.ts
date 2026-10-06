/**
 * Land 4, chapter 2: The Gates Clang Shut.
 *
 * Seen from outside, through the bars: the iron gates swing shut on the
 * children with a CLANG, and a great padlock bangs on. Dame Snap stomps up
 * behind them and snaps her ruler on the railings: nobody leaves until every
 * sum is right. When she has clacked away, Joe spots doubles chalked on the
 * lock. {name} does every one; the lock clicks, a rule cracks, and the gate
 * key pops out… straight into a crow's beak. Cheeky crow! Next: Desks in
 * Rows.
 *
 * Joe is the host. If Joe is the child he climbs with, Joe says the lines
 * and Beth stands with them.
 */
import { C, defineStory, type Kit } from './kit';
import { chalkText, crackRule, crowFlying, gateLeaf, padlock, RULE_FOR, rulesBoard, slate, snapSound } from './snapSchool';

const BOARD = { x: 30, y: 40, w: 300 };

export default defineStory({
  lines: {
    clang: { who: 'narrator', text: 'CLANG! The iron gates slammed shut behind them.' },
    nobody: { who: 'dameSnap', text: 'Nobody leaves my school. Not until every sum is right!' },
    doubles: { who: 'joe', text: 'Look, the lock has doubles on it. We can do doubles!' },
    click: { who: 'narrator', text: '{name} did every double. Click went the lock, and crack went a rule!' },
    crow: { who: 'joe', text: 'The key! Oi, crow! Come back with that!' },
    inside: { who: 'narrator', text: 'The crow flapped up to the roof. Inside, little desks waited in rows…' },
  },

  async play(k: Kit) {
    k.landScene();
    k.music('spooky');
    k.dim(0.2, '#14121c');
    k.light(690, 370, 60, { color: C.candle, strength: 0.45, flicker: true });

    const board = k.add(rulesBoard([RULE_FOR[1]]), { ...BOARD, z: 8 });
    const hero = k.character('hero', { x: 300, y: 330, w: 250, z: 18 });
    const sib = k.character(k.hero === 'joe' ? 'beth' : 'joe', { x: 600, y: 335, w: 245, z: 17 });
    const joe = k.hero === 'joe' ? hero : sib;
    k.set(board, { opacity: 0.9 });

    // The gates, seen from outside, swing shut across the picture.
    const left = k.add(gateLeaf('l'), { x: 290, y: 250, w: 300, z: 25 });
    const right = k.add(gateLeaf('r'), { x: 590, y: 250, w: 300, z: 25, flip: true });
    k.set(left, { scaleX: 0.12, transformOrigin: '0% 50%' });
    k.set(right, { scaleX: 0.12, transformOrigin: '100% 50%' });
    await k.wait(300);
    k.fx.creak();
    await k.all(k.to(left, 1.1, { scaleX: 1, ease: 'power2.in' }), k.to(right, 1.1, { scaleX: 1, ease: 'power2.in' }));
    snapSound.clang();
    void k.quake(7);
    const lock = k.add(padlock(), { x: 525, y: 520, w: 130, z: 27 });
    k.set(lock, { opacity: 0 });
    await k.all(k.shake(hero, 6, 2), k.shake(sib, 6, 2), k.appear(lock, 0.3));
    snapSound.caw(2);
    await k.say('clang');

    // She stomps up behind them and snaps her ruler on the railings.
    const snap = k.snap('stomp', { x: 760, y: 150, w: 330, z: 15 });
    k.set(snap, { x: 500, opacity: 1 });
    snapSound.heels(5, 0.26);
    await k.to(snap, 1.2, { x: 0, ease: 'power1.out' });
    k.pose(snap, 'shriek');
    snapSound.ruler();
    void k.quake(5);
    void k.camera({ zoom: 1.25, x: 760, y: 360 }, 0.9);
    await k.all(k.say('nobody', snap), k.shake(snap, 4, 2));

    // She clacks away. A door slams somewhere inside.
    k.pose(snap, 'point');
    void k.camera({}, 0.9);
    snapSound.heels(5, 0.24);
    await k.exit(snap, 'right', 1.0);
    snapSound.slam();
    k.remove(snap);
    await k.wait(300);

    // Joe spots doubles on the lock. {name} does them.
    await k.all(k.hop(joe, 30), k.say('doubles', joe));
    const sl = k.add(slate(300, 210), { x: 850, y: 40, w: 300, z: 26 });
    k.set(sl, { opacity: 0 });
    await k.appear(sl, 0.3);
    const told = k.say('click');
    for (const [i, s] of ['2 + 2 = 4', '3 + 3 = 6', '5 + 5 = 10'].entries()) {
      const el = k.add(chalkText(s, { w: 260, size: 46 }), { x: 870, y: 54 + i * 56, w: 260, z: 28 });
      k.set(el, { opacity: 0 });
      snapSound.chalk(0.4);
      await k.fade(el, 1, 0.4);
      k.fx.knock(1);
      void k.pop(lock, 1.08);
      await k.wait(250);
    }
    k.fx.pop();
    await k.to(lock, 0.15, { rotation: -8 });
    await crackRule(k, BOARD, RULE_FOR[2]);
    void k.hop(hero, 40);
    await k.hop(sib, 40);

    // Out pops the gate key… and a crow swoops down and takes it.
    const key = k.keepsake('gateKey', { x: 520, y: 470, w: 140, z: 29 });
    const glint = k.light(590, 540, 110, { color: C.goldLight, strength: 0.6, z: 28 });
    k.set([key, glint], { opacity: 0 });
    k.sfx.sparkle();
    await k.all(k.appear(key, 0.35), k.fade(glint, 0.6, 0.35), k.to([key, glint], 0.5, { y: -200, ease: 'back.out(1.6)' }));
    k.sparkle(590, 340, 10, 100);
    await told;
    const crow = k.add(crowFlying('swoop'), { x: 1180, y: 330, w: 170, z: 30, flip: true });
    snapSound.caw(2);
    await k.to(crow, 0.9, { x: -540, y: -60, ease: 'sine.inOut' });
    const said = k.say('crow', joe);
    await k.all(
      k.to(crow, 1.4, { x: -480, y: -190, ease: 'sine.inOut' }),
      k.to(key, 1.4, { x: 150, y: -330, scale: 0.6, rotation: 30, ease: 'sine.inOut' }),
      k.to(glint, 1.4, { x: 150, y: -330, opacity: 0.3, ease: 'sine.inOut' }),
      k.shake(joe, 6, 2),
    );
    snapSound.caw(1);
    await said;

    await k.all(k.say('inside'), k.camera({ zoom: 1.4, x: 600, y: 470 }, 3));
    await k.wait(400);
  },
});
