/**
 * Land 13, chapter 7: Goblins at the Fair.
 *
 * Evening at the fair. Moon-Face checks the clock: the fair shuts at six,
 * and the big hand sweeps round to the five: twenty-five past five (the
 * chapter's time to five minutes). Then he spots them: three red caps, one
 * peeping over a barrel (a cylinder) and two over a pile of boxes
 * (cuboids). The Saucepan Man clanks over for a look, and the goblins duck
 * out of sight: they can hear his saucepans. Where one was, they've left a
 * rope tied in a goblin knot. Then the ground starts to shake: the land is
 * starting to spin. Next: The Roundabout Spins Away (the finale).
 *
 * The goblins only peep and hide here (PLAN.md §2); nobody is grabbed yet.
 */
import { defineStory, type Kit } from './kit';
import { barrel, boxes, clank, fairClock, organ, peeper, snigger } from './fair';

export default defineStory({
  lines: {
    time: { who: 'moonface', text: 'The fair shuts at six o’clock. Look, it’s twenty-five past five now.' },
    shh: { who: 'moonface', text: 'Shh, {name}! Red goblins! Can you see their caps?' },
    caps: { who: 'narrator', text: 'Three red caps. One behind a cylinder, and two behind the cuboids.' },
    eh: { who: 'saucepan', text: 'EH? GOBLINS? Where? Let me have a look!' },
    loud: { who: 'moonface', text: 'Shh! They can hear your saucepans. Stay close to us.' },
    rope: { who: 'hero', text: 'They left a rope behind, tied in a funny goblin knot.' },
    spin: { who: 'moonface', text: 'The ground is shaking! The land is starting to spin!' },
  },

  async play(k: Kit) {
    k.landScene();
    // Evening: the light is going.
    const dusk = k.dim(0.12, '#3a1f40');
    k.music('sneaky');

    // The hiding places: a barrel (a cylinder) and a pile of boxes (cuboids).
    k.add(barrel('l13c7-barrel'), { x: 300, y: 420, w: 170, z: 16 });
    k.add(boxes('l13c7-boxes'), { x: 540, y: 410, w: 200, z: 16 });
    const caps = [
      peeper(k, { x: 340, y: 380, w: 90, z: 15 }),
      peeper(k, { x: 560, y: 420, w: 84, z: 15, flip: true }),
      peeper(k, { x: 640, y: 412, w: 84, z: 15 }),
    ];
    k.set(caps, { y: 110, opacity: 0 });

    const mf = k.character('moonface', { x: 20, y: 370, w: 240, z: 20 });
    const hero = k.character('hero', { x: 930, y: 390, w: 220, z: 20, flip: true });
    await k.all(k.enter(mf, 'left', 0.7), k.enter(hero, 'right', 0.7));
    organ();

    // ---- The clock: the big hand sweeps round to the five.
    const clock = k.add(fairClock('l13c7-clock', 5, 0), { x: 490, y: 30, w: 200, z: 18 });
    k.set(clock, { opacity: 0 });
    await k.appear(clock, 0.4);
    const big = k.pivot(k.part(clock, 'minHand'));
    const little = k.pivot(k.part(clock, 'hourHand'));
    const sweep = async () => {
      await k.wait(700);
      k.fx.creak();
      await k.all(k.to(big, 2, { rotation: 150, ease: 'sine.inOut' }), k.to(little, 2, { rotation: 12.5, ease: 'sine.inOut' }));
    };
    await k.all(k.say('time', mf), sweep());

    // ---- Red caps, peeping.
    k.fx.sneak();
    await k.all(...caps.map((c, i) => k.wait(i * 350).then(() => k.to(c, 0.7, { y: 0, opacity: 1, ease: 'power2.out' }))));
    snigger();
    await k.all(k.say('shh', mf), k.camera({ zoom: 1.3, x: 520, y: 470 }, 1.4));
    await k.say('caps');
    await k.camera({}, 0.8);

    // ---- The Saucepan Man clanks over for a look, and the caps duck down.
    const sauce = k.character('saucepan', { x: 730, y: 360, w: 230, z: 19 });
    k.set(sauce, { opacity: 0 });
    clank(6, 1.4);
    await k.enter(sauce, 'right', 0.8);
    void k.all(...caps.map((c) => k.to(c, 0.3, { y: 110, opacity: 0, ease: 'power2.in' })));
    await k.all(k.say('eh', sauce), k.hop(sauce, 24, 2), k.wait(400).then(() => clank(5, 1.4)));
    await k.say('loud', mf);

    // ---- They have gone, and left a rope tied in a goblin knot.
    const rope = k.keepsake(k.chapter?.keepsake ?? 'goblinRope', { x: 470, y: 350, w: 150, z: 22 });
    k.set(rope, { opacity: 0 });
    k.fx.twinkle();
    await k.appear(rope, 0.4);
    await k.all(k.say('rope', hero), k.pop(rope, 1.08));

    // ---- The ground shakes: the land is starting to spin.
    k.fx.rumble(2.5);
    void k.quake(6);
    void k.fade(dusk, 0.22, 1.5);
    void k.all(k.to(clock, 1.6, { rotation: 20, ease: 'sine.inOut' }));
    await k.all(k.say('spin', mf), k.shake(hero, 6, 2), k.shake(sauce, 6, 2));
    await k.wait(500);
  },
});
