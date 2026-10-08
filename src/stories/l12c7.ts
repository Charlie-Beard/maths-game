/**
 * Land 12, chapter 7: Little Red Footprints.
 *
 * Fran (or Joe, if {name} climbs with Fran) follows the little red
 * footprints with {name}. Three goblins walk side by side, so the prints
 * come in threes: five steps make three, six, nine, twelve, fifteen
 * footprints (the chapter's counting in 3s). Then: boom… BOOM… boom,
 * somebody playing the big drum very badly, far off. Mr Oom Boom Boom
 * comes puffing up: they're marching to the edge of the land! {name}'s
 * pocket watch (Moon-Face's, from chapter 4) says quarter to six, and at
 * six the land moves on. After them! Next: The Grand Parade.
 */
import { C, defineStory, type Kit } from './kit';
import { buddy, roundTag } from './bits';
import { badBoom, boom, clock, drumless, footprint, tickTock, tiptoe } from './music';

export default defineStory({
  lines: {
    look_fran: { who: 'fran', text: 'Look, {name}! The footprints go in threes. One, two, three!' },
    look_joe: { who: 'joe', text: 'Look, {name}! The footprints go in threes. One, two, three!' },
    count: { who: 'narrator', text: 'Three, six, nine, twelve, fifteen footprints! Past the bandstand, and on, and on.' },
    listen: { who: 'hero', text: 'Shh! Listen. Can you hear that?' },
    drum: { who: 'narrator', text: 'Boom… BOOM… boom. Somebody was playing the big drum. Very badly!' },
    mine: { who: 'oomboom', text: 'That’s MY drum! They’re marching to the edge of the land!' },
    watch: { who: 'hero', text: 'My pocket watch says quarter to six.' },
    six: { who: 'oomboom', text: 'And at six o’clock, the land moves on! After them, quick!' },
  },

  async play(k: Kit) {
    const sib = buddy(k, 'fran', 'joe');
    k.landScene();
    // Late in the afternoon now: a warm, low light.
    k.dim(0.14, '#5a3a10');
    k.music('sneaky');
    const friend = k.character(sib, { x: 30, y: 352, z: 20 });
    const hero = k.character('hero', { x: 900, y: 352, z: 20, flip: true });
    await k.all(k.enter(friend, 'left'), k.enter(hero, 'right'));

    // ---- Five steps of three footprints, counted in threes.
    const steps = [0, 1, 2, 3, 4].map((i) => {
      const gx = 300 + i * 118;
      const gy = 636 - i * 16;
      const prints = [
        [0, 0],
        [36, -20],
        [72, 0],
      ].map(([dx, dy], j) => {
        const p = footprint(k, gx + dx, gy + dy - 40, 46, 30, j === 1 ? 4 : i % 2 ? 12 : -12);
        k.set(p, { opacity: 0 });
        return p;
      });
      return { gx, gy, prints };
    });
    const firstStep = async () => {
      await k.wait(1800);
      for (const p of steps[0].prints) {
        tiptoe(1);
        await k.appear(p, 0.25);
        await k.wait(250);
      }
    };
    await k.all(k.say(`look_${sib}`, friend), firstStep());

    const tags: HTMLElement[] = [];
    const counting = async () => {
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        if (i > 0) {
          tiptoe(3);
          await k.all(...s.prints.map((p, j) => k.wait(j * 90).then(() => k.appear(p, 0.22))));
        }
        const tag = k.add(roundTag((i + 1) * 3, C.goldLight, `l12c7-tag-${i}`), { x: s.gx + 20, y: s.gy - 136, w: 64, z: 32 });
        k.set(tag, { opacity: 0 });
        tags.push(tag);
        k.fx.pop();
        await k.appear(tag, 0.22);
        await k.wait(380);
      }
    };
    await k.all(k.say('count'), counting(), k.walk(friend, 40, 1.6, 4));
    await k.all(...tags.map((t) => k.fade(t, 0, 0.4)));

    // ---- Shh! Far off: boom… BOOM… boom.
    k.silence();
    await k.say('listen', hero);
    badBoom(6);
    await k.all(k.say('drum'), k.shake(friend, 4, 1), k.wait(400).then(() => badBoom(6)));

    // ---- Mr Oom Boom Boom puffs up: that's HIS drum.
    k.music('adventure');
    const oom = k.character('oomboom', { x: 450, y: 380, w: 250, z: 34 });
    drumless(k, oom);
    boom(1);
    await k.enter(oom, 'bottom', 0.6);
    await k.all(k.say('mine', oom), k.shake(oom, 8, 2));

    // ---- The pocket watch: quarter to six.
    const watch = clock(k, 'l12c7-watch', { x: 700, y: 120, w: 170, hour: 5, minute: 45, fives: true, z: 36 });
    k.set(watch, { opacity: 0 });
    tickTock(4);
    await k.appear(watch, 0.4);
    await k.all(k.say('watch', hero), k.pop(watch, 1.06));
    await k.all(k.say('six', oom), k.hop(oom, 24, 2), k.hop(friend, 20, 2));
    await k.all(k.fade(watch, 0, 0.3), ...steps.flatMap((s) => s.prints.map((p) => k.fade(p, 0, 0.5))));
    await k.wait(300);
  },
});
