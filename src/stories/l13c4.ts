/**
 * Land 13, chapter 4: Rolling Shapes.
 *
 * Joe (or Fran, if Joe is the hero) has caught the stripy ball, and lays
 * out the shapes from the fair's shape stall: some roll, some stack. The
 * sphere rolls away and back. Three cubes stack into a tower, counted one,
 * two, three. A cylinder does both: it stacks on its flat end, then tips
 * onto its curved side and rolls (the chapter's cube, sphere, cylinder).
 * Then the stripy ball rolls off again, right to the helter-skelter, and
 * Beth (or Fran) calls them up it. Next: The Helter-Skelter.
 */
import { C, defineStory, type Kit } from './kit';
import { buddy, roundTag } from './bits';
import { organ, roll, solid, tock } from './fair';

/** Where the ground is (the bottom of each shape), and the shapes' size. */
const FLOOR = 590;
const W = 130;
/** The shapes are drawn in a 160 box sitting on y = 142: on stage, their top-left y. */
const top = (s = 1): number => FLOOR - 142 * (W / 160) * s;
/** A cube's front face, on stage: how far up the next one sits. */
const CUBE = 80 * (W / 160);

export default defineStory({
  lines: {
    shapes: { who: 'joe', text: 'Some shapes roll, and some shapes stack. Let’s try them all!' },
    shapes_fran: { who: 'fran', text: 'Some shapes roll, and some shapes stack. Let’s try them all!' },
    sphere: { who: 'narrator', text: 'A sphere is round all over. It rolls and rolls, but it won’t stack.' },
    cubes: { who: 'narrator', text: 'Cubes have flat faces, so they stack. One, two, three!' },
    cylinder: { who: 'narrator', text: 'A cylinder can do both. It stacks on its flat ends, and rolls on its curved side.' },
    clever: { who: 'hero', text: 'Flat faces stack. Curved faces roll!' },
    next_beth: { who: 'beth', text: 'The ball has rolled to the helter-skelter! Come on, up we go!' },
    next_fran: { who: 'fran', text: 'The ball has rolled to the helter-skelter! Come on, up we go!' },
  },

  async play(k: Kit) {
    // Joe hosts (or Fran, if Joe is the hero); Beth calls them on (or Fran, if Beth is).
    const host = buddy(k, 'joe', 'fran');
    const caller = buddy(k, 'beth', 'fran');
    k.landScene();
    k.music('adventure');
    organ();

    const kid = k.character(host, { x: 30, y: 370, w: 230, z: 20 });
    const hero = k.character('hero', { x: 920, y: 380, w: 220, z: 20, flip: true });
    await k.all(k.enter(kid, 'left', 0.7), k.enter(hero, 'right', 0.7));
    await k.all(k.say(host === 'joe' ? 'shapes' : 'shapes_fran', kid), k.hop(kid, 24, 1));

    // ---- The sphere rolls away, and back.
    const sphere = k.add(solid('sphere', 'l13c4-sphere'), { x: 290, y: top(), w: W, z: 14 });
    k.set(sphere, { opacity: 0 });
    k.fx.pop();
    await k.appear(sphere, 0.35);
    const rolling = async () => {
      roll(1.2);
      await k.all(k.to(sphere, 1.2, { x: 420, rotation: 360, ease: 'sine.inOut' }));
      roll(1.2);
      await k.all(k.to(sphere, 1.2, { x: 0, rotation: 0, ease: 'sine.inOut' }));
    };
    await k.all(k.say('sphere'), rolling());

    // ---- Three cubes, stacked into a tower and counted.
    const cubes: HTMLElement[] = [];
    const tags: HTMLElement[] = [];
    const stacking = async () => {
      for (let i = 0; i < 3; i++) {
        const c = k.add(solid('cube', `l13c4-cube${i}`), { x: 470, y: top() - i * CUBE, w: W, z: 14 + i });
        cubes.push(c);
        k.set(c, { y: -300, opacity: 0 });
        await k.to(c, 0.5, { y: 0, opacity: 1, ease: 'power2.in' });
        tock(i);
        const t = k.add(roundTag(i + 1, C.goldLight, `l13c4-n${i + 1}`), { x: 610, y: FLOOR - 70 - i * CUBE, w: 60, z: 20 });
        tags.push(t);
        void k.appear(t, 0.25);
        await k.wait(450);
      }
    };
    await k.all(k.say('cubes'), stacking());
    await k.all(...tags.map((t) => k.fade(t, 0, 0.3)));

    // ---- The cylinder: one stacks on another, then tips onto its side and rolls.
    const cylA = k.add(solid('cylinder', 'l13c4-cylA'), { x: 680, y: top(), w: W, z: 14 });
    const cylB = k.add(solid('cylinder', 'l13c4-cylB'), { x: 680, y: top() - 90 * (W / 160), w: W, z: 15 });
    k.set([cylA, cylB], { opacity: 0 });
    const both = async () => {
      await k.appear(cylA, 0.3);
      k.set(cylB, { y: -260 });
      await k.to(cylB, 0.5, { y: 0, opacity: 1, ease: 'power2.in' });
      tock(1);
      await k.wait(900);
      // Tip the top one over onto its curved side, then roll it along.
      await k.to(cylB, 0.5, { rotation: 90, x: 70, y: 90 * (W / 160) - 8, ease: 'power2.in' });
      tock(0);
      roll(1.4);
      // Rolling on its curved side, away from us: it just trundles along (no tumbling).
      await k.to(cylB, 1.4, { x: 230, ease: 'power1.out' });
    };
    await k.all(k.say('cylinder'), both());
    await k.all(k.say('clever', hero), k.hop(hero, 30, 1));

    // ---- The stripy ball rolls off to the helter-skelter, and Beth calls them up it.
    const ball = k.keepsake('rollingBall', { x: 1200, y: 520, w: 100, z: 24 });
    roll(2.4);
    await k.all(k.to(ball, 2.6, { x: -1050, ease: 'power1.out' }), k.to(ball, 2.6, { rotation: -1080, ease: 'power1.out' }));
    void k.fade(sphere, 0, 0.3);
    const call = k.character(caller, { x: 250, y: 330, w: 210, z: 13 });
    k.set(call, { opacity: 0 });
    await k.enter(call, 'top', 0.6);
    await k.all(k.say(`next_${caller}`, call), k.hop(call, 24, 1));
    await k.wait(400);
  },
});
