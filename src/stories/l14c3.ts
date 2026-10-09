/**
 * Land 14, chapter 3: The Goblin Kitchen.
 *
 * Dame Washalot came down the goblin hole too, and she has found the
 * goblins' kitchen: the cauldron bubbling, and dirty pots everywhere. She
 * can't help herself. A big measuring jug fills with goblin soup, glug,
 * glug, past two, past four… to six. Six litres (the chapter's reading a
 * jug in steps of two). A jug of goblin soup is the keepsake. Then Joe (or
 * Beth, if he climbs with Joe) feels a hot wind from one tunnel and a cold
 * one from the other. Next: Hot Caves, Cold Caves.
 */
import { C, defineStory, type Kit } from './kit';
import { buddy, numberTag, tick } from './bits';
import { cave, goblinSound, jugArt } from './goblinCave';

/** The soup line, litre by litre, so the jug can be refilled one step at a time. */
const LEVELS = [0, 1, 2, 3, 4, 5, 6];

export default defineStory({
  lines: {
    pots: { who: 'washalot', text: 'Look at these goblin pots! Dirty, dirty! And jugs and jugs of soup.' },
    pour: { who: 'narrator', text: 'Glug, glug, glug. Up came the soup. Past two, past four… up to six.' },
    six: { who: 'hero', text: 'Six litres of goblin soup!' },
    greedy: { who: 'washalot', text: 'Six litres, for one little goblin? Greedy things!' },
    wind_joe: { who: 'joe', text: 'Feel that! A hot wind from this tunnel, and a cold one from that tunnel.' },
    wind_beth: { who: 'beth', text: 'Feel that! A hot wind from this tunnel, and a cold one from that tunnel.' },
  },

  async play(k: Kit) {
    cave(k, { cauldron: true });
    k.music('sneaky');
    k.light(1000, 640, 200, { color: '#f6a040', strength: 0.3, flicker: true });
    k.ambient('dust', { count: 10 });

    const wash = k.character('washalot', { x: 30, y: 380, w: 240, z: 20 });
    const hero = k.character('hero', { x: 680, y: 390, w: 230, z: 20, flip: true });
    await k.all(k.enter(wash, 'left'), k.enter(hero, 'right'));
    k.fx.splash();
    void k.shake(wash, 4, 2);
    await k.say('pots', wash);

    // The jug, filling a litre at a time.
    const jugs = LEVELS.map((l) => {
      const j = k.add(jugArt(`l14c3-jug${l}`, l, { max: 10, step: 2 }), { x: 400, y: 150, w: 220, z: 14 });
      k.set(j, { opacity: 0 });
      return j;
    });
    await k.fade(jugs[0], 1, 0.4);
    const filling = async () => {
      await k.wait(400);
      for (let i = 1; i < LEVELS.length; i++) {
        k.fx.bubbles(2);
        k.set(jugs[i], { opacity: 1 });
        k.set(jugs[i - 1], { opacity: 0 });
        if (i % 2 === 0) tick(i / 2 - 1);
        await k.wait(i % 2 === 0 ? 900 : 500);
      }
    };
    await k.all(k.say('pour'), filling());

    // Six litres!
    const tag = k.add(numberTag('6', C.goldLight, 'l14c3-6'), { x: 640, y: 190, w: 120, z: 22 });
    k.set(tag, { opacity: 0 });
    goblinSound.ding(2);
    await k.appear(tag, 0.3);
    k.sparkle(590, 300, 12, 120);
    await k.all(k.say('six', hero), k.hop(hero, 28, 2));

    // A jug of goblin soup for the treasure room.
    const jug = k.keepsake(k.chapter?.keepsake ?? 'goblinJug', { x: 230, y: 250, w: 150, z: 24 });
    k.set(jug, { opacity: 0 });
    k.sfx.sparkle();
    await k.appear(jug, 0.4);
    await k.all(k.say('greedy', wash), k.shake(wash, 4, 2));

    // A hot wind, and a cold one: Joe (or Beth) has felt them both.
    void k.all(k.fade(tag, 0, 0.4), k.fade(jug, 0, 0.4), ...jugs.map((j) => k.fade(j, 0, 0.4)));
    const who = buddy(k, 'joe', 'beth');
    const b = k.character(who, { x: 420, y: 380, w: 230, z: 22 });
    k.set(b, { opacity: 0 });
    k.fx.wind(2);
    await k.all(k.fade(b, 1, 0.4), k.hop(b, 24));
    await k.all(k.say(`wind_${who}` as 'wind_joe', b), k.shake(hero, 3, 2));
    await k.wait(600);
  },
});
