/**
 * Land 12, chapter 4: When Does the Band Play?
 *
 * Moon-Face has read the band's sign: they play at ten past three. A big
 * brass clock says three o'clock (big hand on twelve, little hand on
 * three). {name} counts on in fives as the big hand moves: five, ten…
 * ten past three! (the chapter's time to five minutes). Right on time, the
 * band plays and the big drum booms on its stand. Moon-Face gives {name}
 * his gold pocket watch, and Beth (or Fran) runs up: the big show is at
 * four o'clock. Next: Five Minutes to Showtime.
 */
import { defineStory, type Kit } from './kit';
import { buddy } from './bits';
import { boomDrum, chimeTime, clock, countFives, drumOnStand, oomPah, tickTock } from './music';

export default defineStory({
  lines: {
    when: { who: 'moonface', text: 'The band plays at ten past three. But what time is it now?' },
    three: { who: 'narrator', text: 'The big hand is on twelve. The little hand is on three. Three o’clock!' },
    count: { who: 'hero', text: 'Count on in fives! Five, ten. Ten past three!' },
    band: { who: 'narrator', text: 'And right on time, the band began to play. Oom-pah-pah! Boom, boom!' },
    watch: { who: 'moonface', text: 'Here, {name}, take my pocket watch. Then you’ll never be late!' },
    next_beth: { who: 'beth', text: 'Hurry! The big show is at four o’clock! Don’t be late!' },
    next_fran: { who: 'fran', text: 'Hurry! The big show is at four o’clock! Don’t be late!' },
  },

  async play(k: Kit) {
    k.landScene();
    k.music('cosy');
    const drum = drumOnStand(k, 'l12c4-drum');
    const mf = k.character('moonface', { x: 30, y: 352, z: 20 });
    const hero = k.character('hero', { x: 900, y: 352, z: 20, flip: true });
    await k.all(k.enter(mf, 'left'), k.enter(hero, 'right'));
    await k.say('when', mf);

    // ---- The big brass clock: three o'clock.
    const face = clock(k, 'l12c4-clock', { x: 330, y: 56, w: 260, hour: 3, minute: 0, fives: true, z: 18 });
    k.set(face, { opacity: 0 });
    tickTock(4);
    await k.appear(face, 0.5);
    await k.all(k.say('three'), k.pop(face, 1.04));

    // ---- Count on in fives: five, ten… ten past three!
    k.silence();
    const said = k.say('count', hero);
    const tags = await countFives(k, face, 3, 0, 10, 'l12c4', 0.8);
    await said;
    chimeTime();

    // ---- Right on time: the band plays and the big drum booms.
    k.music('triumph');
    oomPah(3);
    await k.all(k.say('band'), boomDrum(k, drum, 4), k.hop(hero, 26, 2), k.hop(mf, 20, 2));
    await k.all(k.fade(face, 0, 0.4), ...tags.map((t) => k.fade(t, 0, 0.4)));

    // ---- Moon-Face's pocket watch, for {name}.
    k.music('cosy');
    const watch = k.keepsake(k.chapter?.keepsake ?? 'pocketWatch', { x: 400, y: 140, w: 180, z: 26 });
    k.set(watch, { opacity: 0 });
    const giving = async () => {
      k.fx.twinkle();
      await k.appear(watch, 0.4);
      k.sparkle(490, 230, 12, 120);
      tickTock(4);
      await k.wait(1000);
      await k.to(watch, 0.8, { x: 300, y: 60, scale: 0.7, ease: 'power2.inOut' });
    };
    await k.all(k.say('watch', mf), giving());

    // ---- Hurry! The big show is at four.
    const sib = buddy(k, 'beth', 'fran');
    const friend = k.character(sib, { x: 450, y: 380, w: 250, z: 28 });
    k.fx.patter(5, 0.1);
    await k.all(k.enter(friend, 'bottom', 0.7), k.fade(watch, 0, 0.4));
    await k.all(k.say(`next_${sib}`, friend), k.hop(friend, 24, 2));
    await k.wait(500);
  },
});
