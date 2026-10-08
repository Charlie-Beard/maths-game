/**
 * Land 13, chapter 2: Clockwise, Anticlockwise.
 *
 * Silky shows {name} the fair's clock: its hands always go round the same
 * way, and a curved arrow follows the big hand right round. That way is
 * clockwise. Then the spinning teacups (seen from above) whirl round the
 * other way, with the arrow mirrored: anticlockwise. {name} tries both and
 * gets dizzy, while Silky's brass compass spins. Then a clank from the
 * teacups: somebody is riding them. Next: The Spinning Teacups.
 */
import { defineStory, type Kit } from './kit';
import { clank, fairClock, FAIR_CREAM, FAIR_GOLD, FAIR_TEAL, organ, teacupRide, turnArc, whirr, wordTag } from './fair';

/** The clock, and then the teacups, sit here: their middle is (590, 280). */
const SPOT = { x: 470, y: 160, w: 240 };
const ARC = { x: 430, y: 120, w: 320 };

export default defineStory({
  lines: {
    look: { who: 'silky', text: 'Look at the clock, {name}. Its hands always go round this way.' },
    cw: { who: 'narrator', text: 'That way round is called clockwise. The same way as a clock!' },
    cups: { who: 'silky', text: 'But the teacups go round the other way. Watch!' },
    acw: { who: 'narrator', text: 'The other way round is called anticlockwise.' },
    dizzy: { who: 'hero', text: 'Clockwise… and anticlockwise! Whoa, I’m dizzy!' },
    next: { who: 'silky', text: 'Listen! Who’s that, clanking about on the teacups?' },
  },

  async play(k: Kit) {
    k.landScene();
    k.music('magic');
    organ();

    const silky = k.character('silky', { x: 40, y: 300, w: 240, z: 20 });
    const hero = k.character('hero', { x: 910, y: 380, w: 230, z: 20, flip: true });
    await k.all(k.enter(silky, 'left', 0.8), k.enter(hero, 'right', 0.7));
    k.float(silky, 8, 2.4);

    // ---- The clock: the big hand goes right round, and the arrow follows it.
    const clock = k.add(fairClock('l13c2-clock', 12, 0), { ...SPOT, z: 12 });
    k.set(clock, { opacity: 0 });
    k.fx.pop();
    await k.appear(clock, 0.4);
    const big = k.pivot(k.part(clock, 'minHand'));
    const little = k.pivot(k.part(clock, 'hourHand'));
    await k.say('look', silky);
    const cwArc = k.add(turnArc(1, FAIR_TEAL, 'l13c2-cw'), { ...ARC, z: 13 });
    const cwTag = k.add(wordTag('clockwise', FAIR_CREAM, 'l13c2-cwtag', 260), { x: 460, y: 30, w: 260, z: 16 });
    k.set([cwArc, cwTag], { opacity: 0 });
    k.fx.creak();
    await k.all(k.to(big, 2.4, { rotation: '+=360', ease: 'sine.inOut' }), k.to(little, 2.4, { rotation: '+=30', ease: 'sine.inOut' }), k.fade(cwArc, 1, 1.6));
    k.fx.twinkle();
    void k.appear(cwTag, 0.3);
    await k.say('cw');

    // ---- The teacups whirl round the other way.
    await k.all(k.fade(clock, 0, 0.4), k.fade(cwArc, 0, 0.4), k.fade(cwTag, 0, 0.4));
    const ride = k.add(teacupRide('l13c2-ride'), { x: 450, y: 140, w: 280, z: 12 });
    k.set(ride, { opacity: 0 });
    await k.all(k.appear(ride, 0.4), k.say('cups', silky));
    // The same curved arrow, mirrored: it now goes round the other way.
    const acwArc = k.add(turnArc(1, FAIR_GOLD, 'l13c2-acw'), { ...ARC, z: 13, flip: true });
    const acwTag = k.add(wordTag('anticlockwise', FAIR_CREAM, 'l13c2-acwtag', 300), { x: 440, y: 30, w: 300, z: 16 });
    k.set([acwArc, acwTag], { opacity: 0 });
    whirr(2.2);
    await k.all(k.to(ride, 2.6, { rotation: '-=360', ease: 'sine.inOut' }), k.fade(acwArc, 1, 1.6));
    k.fx.twinkle();
    void k.appear(acwTag, 0.3);
    await k.say('acw');

    // ---- He tries both ways round, and the compass spins.
    const compass = k.keepsake(k.chapter?.keepsake ?? 'compass', { x: 300, y: 430, w: 150, z: 22 });
    k.set(compass, { opacity: 0 });
    k.fx.boing();
    const wobble = async () => {
      await k.appear(compass, 0.3);
      await k.all(k.to(hero, 0.5, { rotation: 12, ease: 'sine.inOut' }), k.spin(compass, 1, 0.9));
      await k.all(k.to(hero, 0.6, { rotation: -12, ease: 'sine.inOut' }), k.to(compass, 0.9, { rotation: '-=360' }));
      await k.to(hero, 0.4, { rotation: 0, ease: 'sine.inOut' });
    };
    // (The wobble comes first: talking bobs the speaker's own rotation.)
    await wobble();
    await k.say('dizzy', hero);

    // ---- A clank from the teacups.
    await k.all(k.fade(acwArc, 0, 0.4), k.fade(acwTag, 0, 0.4));
    clank(4);
    void k.to(ride, 1.4, { rotation: '+=90' });
    await k.all(k.say('next', silky), k.wait(700).then(() => clank(3)));
    await k.wait(500);
  },
});
