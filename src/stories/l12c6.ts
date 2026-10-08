/**
 * Land 12, chapter 6: The Big Drum is Gone!
 *
 * Mr Oom Boom Boom stands by the empty stand with only his drumsticks.
 * The drum was there at four o'clock; {name} reads the clock and counts on
 * in fives: twenty past four (the chapter's time to five minutes). It
 * can't be far… and then, boom, BOOM, boom: three red goblins come
 * sneaking past with the big drum, banging it badly. "It's OUR drum now!"
 * Mr Oom Boom Boom shouts after them, and they scuttle off. He gives
 * {name} a drumstick: they'll find it together. Fran (or Joe) spots little
 * red footprints. Next: Little Red Footprints.
 *
 * Scary, not cruel (PLAN.md §2): the goblins sneak, snicker and run off;
 * they never come near anyone.
 */
import { defineStory, type Kit } from './kit';
import { buddy } from './bits';
import { badBoom, clock, countFives, drumless, footprint, goblin, goblinBob, snicker, tickTock, tiptoe } from './music';

export default defineStory({
  lines: {
    gone: { who: 'oomboom', text: 'My big drum is gone! I only have my drumsticks left.' },
    when: { who: 'hero', text: 'It was there at four o’clock. Look at the clock now.' },
    count: { who: 'narrator', text: 'Five, ten, fifteen, twenty minutes. Twenty past four! It can’t be far away.' },
    goblins: { who: 'redGoblin', text: 'Hee hee! It’s OUR drum now! Boom! Boom!' },
    shout: { who: 'oomboom', text: 'Red goblins! Come back with my drum!' },
    sticks: { who: 'oomboom', text: 'Take a drumstick, {name}. We’ll find that drum together!' },
    next_fran: { who: 'fran', text: 'Look! Little red footprints. Let’s follow them!' },
    next_joe: { who: 'joe', text: 'Look! Little red footprints. Let’s follow them!' },
  },

  async play(k: Kit) {
    k.landScene();
    k.music('sneaky');
    const oom = k.character('oomboom', { x: 30, y: 352, z: 20 });
    drumless(k, oom);
    const hero = k.character('hero', { x: 900, y: 352, z: 20, flip: true });
    await k.all(k.enter(oom, 'left'), k.enter(hero, 'right'));
    await k.all(k.say('gone', oom), k.shake(oom, 4, 2));

    // ---- When did it go? The clock, counted on in fives from four o'clock.
    const face = clock(k, 'l12c6-clock', { x: 340, y: 60, w: 240, hour: 4, minute: 0, fives: true, z: 18 });
    k.set(face, { opacity: 0 });
    tickTock(4);
    await k.appear(face, 0.5);
    await k.say('when', hero);
    const said = k.say('count');
    const tags = await countFives(k, face, 4, 0, 20, 'l12c6', 0.6);
    await said;
    await k.all(k.fade(face, 0, 0.4), ...tags.map((t) => k.fade(t, 0, 0.4)));

    // ---- Boom… BOOM… boom! Three red goblins, sneaking past with the drum.
    k.music('spooky');
    const gobs = [
      goblin(k, 'l12c6-gob-a', { x: 270, y: 380, w: 130, z: 8 }),
      goblin(k, 'l12c6-gob-b', { x: 410, y: 372, w: 140, z: 9, drum: true }),
      goblin(k, 'l12c6-gob-c', { x: 570, y: 384, w: 126, z: 8 }),
    ];
    k.set(gobs, { x: -620 });
    badBoom(6);
    tiptoe(10);
    const creeping = k.all(...gobs.map((g) => k.to(g, 2.6, { x: 0, ease: 'power1.out' })), goblinBob(k, gobs, 8, 0.32));
    await creeping;
    snicker();
    await k.all(k.say('goblins'), goblinBob(k, gobs, 6, 0.3));

    await k.all(k.say('shout', oom), k.shake(oom, 8, 2));
    // They scuttle off, giggling.
    snicker();
    tiptoe(10);
    badBoom(4);
    await k.all(...gobs.map((g, i) => k.to(g, 1.4 + i * 0.1, { x: 900, ease: 'power2.in' })));
    gobs.forEach((g) => k.remove(g));

    // ---- A drumstick for {name}.
    k.music('cosy');
    const stick = k.keepsake(k.chapter?.keepsake ?? 'drumstick', { x: 420, y: 140, w: 180, z: 26 });
    k.set(stick, { opacity: 0 });
    const giving = async () => {
      k.fx.twinkle();
      await k.appear(stick, 0.4);
      k.sparkle(510, 230, 12, 120);
      await k.wait(1200);
      await k.to(stick, 0.8, { x: 320, y: 60, scale: 0.7, ease: 'power2.inOut' });
    };
    await k.all(k.say('sticks', oom), giving());

    // ---- Little red footprints, leading away.
    const sib = buddy(k, 'fran', 'joe');
    const friend = k.character(sib, { x: 450, y: 380, w: 240, z: 28 });
    await k.all(k.enter(friend, 'bottom', 0.7), k.fade(stick, 0, 0.4));
    const prints = [
      [330, 640],
      [700, 610],
      [770, 560],
    ].map(([x, y], i) => {
      const p = footprint(k, x, y, 64, 30, i % 2 ? 14 : -14);
      k.set(p, { opacity: 0 });
      return p;
    });
    const showing = async () => {
      for (const p of prints) {
        k.fx.pop();
        await k.appear(p, 0.3);
      }
    };
    await k.all(k.say(`next_${sib}`, friend), showing(), k.hop(friend, 20, 2));
    await k.wait(500);
  },
});
