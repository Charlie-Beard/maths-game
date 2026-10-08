/**
 * Land 12, chapter 5: Five Minutes to Showtime.
 *
 * Beth (or Fran) has two tickets for the big show at four o'clock. The
 * clock says twenty to four, so {name} counts on in fives to see how long
 * to wait: five, ten, fifteen, twenty minutes (the chapter's time to five
 * minutes). While everyone is looking at the clock (the camera close on
 * it), there's a snicker and a patter of tiny feet… and when the show
 * begins, Mr Oom Boom Boom turns to his big drum and the stand is EMPTY.
 * A little red cap darts away over the hill. Next: The Big Drum is Gone!
 */
import { defineStory, type Kit } from './kit';
import { buddy } from './bits';
import { boom, chimeTime, clock, countFives, drumOnStand, fanfare, goblin, snicker, tickTock, tiptoe } from './music';

export default defineStory({
  lines: {
    tickets_beth: { who: 'beth', text: 'Here, {name}! Tickets for the big show. It starts at four o’clock.' },
    tickets_fran: { who: 'fran', text: 'Here, {name}! Tickets for the big show. It starts at four o’clock.' },
    time: { who: 'narrator', text: 'The clock said twenty to four. How long until the show?' },
    count: { who: 'hero', text: 'Count on in fives! Five, ten, fifteen, twenty minutes. Four o’clock!' },
    show: { who: 'oomboom', text: 'Welcome to the big show! And now… my big drum!' },
    gone: { who: 'oomboom', text: 'Oh! WHERE is my big drum?' },
  },

  async play(k: Kit) {
    const sib = buddy(k, 'beth', 'fran');
    k.landScene();
    k.music('adventure');
    const drum = drumOnStand(k, 'l12c5-drum');
    const friend = k.character(sib, { x: 30, y: 352, z: 20 });
    const hero = k.character('hero', { x: 900, y: 352, z: 20, flip: true });
    await k.all(k.enter(friend, 'left'), k.enter(hero, 'right'));

    // ---- Two tickets for the big show.
    const ticket = k.keepsake(k.chapter?.keepsake ?? 'showTicket', { x: 420, y: 150, w: 190, z: 26 });
    k.set(ticket, { opacity: 0 });
    const giving = async () => {
      k.fx.twinkle();
      await k.appear(ticket, 0.4);
      k.sparkle(515, 240, 12, 120);
      await k.wait(1400);
      await k.to(ticket, 0.7, { x: 380, y: 80, scale: 0.6, opacity: 0, ease: 'power2.in' });
    };
    await k.all(k.say(`tickets_${sib}`, friend), giving());

    // ---- Twenty to four.
    const face = clock(k, 'l12c5-clock', { x: 150, y: 70, w: 240, hour: 3, minute: 40, fives: true, z: 18 });
    k.set(face, { opacity: 0 });
    tickTock(4);
    await k.appear(face, 0.5);
    await k.say('time');

    // ---- Close in on the clock and count on in fives. Behind everyone's
    // backs, something sneaks off with the drum.
    k.silence();
    await k.camera({ zoom: 1.8, x: 270, y: 230 }, 1.2);
    const sneaking = async () => {
      await k.wait(1400);
      snicker();
      tiptoe(8);
      await k.fade(drum, 0, 1.2);
      k.remove(drum);
    };
    const said = k.say('count', hero);
    const [tags] = await Promise.all([countFives(k, face, 3, 40, 60, 'l12c5', 0.6), sneaking()]);
    await said;
    chimeTime();
    await k.wait(400);

    // ---- Showtime! Back out to the whole stage.
    k.music('triumph');
    void k.all(k.fade(face, 0, 0.4), ...tags.map((t) => k.fade(t, 0, 0.4)));
    await k.camera({}, 1.0);
    const oom = k.character('oomboom', { x: 440, y: 380, w: 250, z: 24 });
    fanfare();
    boom(2, 0.3);
    await k.enter(oom, 'bottom', 0.7);
    await k.all(k.say('show', oom), k.hop(oom, 20, 1));

    // He turns to the stand… it's empty.
    k.silence();
    k.face(oom, true);
    await k.wait(700);
    k.fx.uhoh();
    void k.shake(oom, 8, 2);
    // A little red cap darts away over the hill.
    const cap = goblin(k, 'l12c5-goblin', { x: 880, y: 360, w: 90, z: 4, pose: 'run' });
    snicker();
    tiptoe(6);
    void k.to(cap, 1.6, { x: 360, ease: 'power1.in' });
    await k.all(k.say('gone', oom), k.shake(friend, 5, 1), k.shake(hero, 5, 1));
    await k.wait(600);
  },
});
