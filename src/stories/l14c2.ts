/**
 * Land 14, chapter 2: Sacks of Gold.
 *
 * The Angry Pixie has caught up, and he can't resist the goblins' gold. He
 * heaves a sack onto their kitchen scale: the needle swings round to 6.
 * Six kilograms! The next sack only reaches 4. Six is more than four, so
 * the first sack is heavier (the chapter's reading scales and comparing).
 * A handful of goblin gold is the keepsake. Then, from further in: splish,
 * splosh. Somebody is washing up in the goblin kitchen, and there is only
 * one person who washes up like that. Next: The Goblin Kitchen.
 */
import { C, defineStory, type Kit } from './kit';
import { numberTag } from './bits';
import { cave, dialArt, dialAt, dialTo, goblinSound, sackArt, scalePan } from './goblinCave';

const DIAL = { x: 470, y: 250 };

export default defineStory({
  lines: {
    weigh: { who: 'pixie', text: 'Goblin gold! Heavy, heavy! Let’s put a sack on their scale.' },
    six: { who: 'narrator', text: 'Round swung the needle, and stopped at six. Six kilograms!' },
    four: { who: 'narrator', text: 'Then the next sack. Four kilograms.' },
    heavier: { who: 'hero', text: 'Six is more than four. So the first sack is heavier!' },
    splash: { who: 'narrator', text: 'Splish, splosh! Somebody was washing up, in the goblin kitchen…' },
    washalot: { who: 'pixie', text: 'Only one person washes up like that. Dame Washalot!' },
  },

  async play(k: Kit) {
    cave(k);
    k.music('sneaky');
    k.ambient('dust', { count: 10 });

    // The goblins' kitchen scale: a dial in kilograms, 0 to 10.
    k.add(scalePan(), { x: DIAL.x, y: DIAL.y - 110, w: 260, z: 12 });
    const dial = k.add(dialArt('l14c2-dial', { max: 10, step: 2, minor: 1, unit: 'kg' }), { x: DIAL.x, y: DIAL.y, w: 260, z: 12 });
    dialAt(k, dial, 10, 0);

    const pixie = k.character('pixie', { x: 40, y: 400, w: 220, z: 20 });
    const hero = k.character('hero', { x: 900, y: 380, w: 240, z: 20, flip: true });
    await k.all(k.enter(pixie, 'left'), k.enter(hero, 'right'));
    void k.hop(pixie, 20, 2);
    await k.say('weigh', pixie);

    // A fat sack thumps onto the pan, and the needle swings round to 6.
    const sackA = k.add(sackArt('l14c2-a', '#a98d5e', 1), { x: DIAL.x + 50, y: DIAL.y - 250, w: 160, z: 13 });
    k.set(sackA, { y: -420 });
    await k.to(sackA, 0.5, { y: 0, ease: 'power2.in' });
    goblinSound.clink();
    void k.shake(dial, 3, 1);
    const tag6 = k.add(numberTag('6 kg', C.goldLight, 'l14c2-6'), { x: 280, y: 160, w: 170, z: 22 });
    k.set(tag6, { opacity: 0 });
    const reading = async () => {
      await dialTo(k, dial, 10, 6, 1.4);
      goblinSound.ding(1);
      await k.appear(tag6, 0.3);
    };
    await k.all(k.say('six'), reading());

    // Off it comes, and on goes a thinner sack: 4.
    await k.all(k.to(sackA, 0.6, { x: -380, y: 300, scale: 0.8, ease: 'power1.inOut' }), dialTo(k, dial, 10, 0, 0.6));
    const sackB = k.add(sackArt('l14c2-b', '#b9a477', 0.7), { x: DIAL.x + 50, y: DIAL.y - 250, w: 160, z: 13 });
    k.set(sackB, { y: -420 });
    await k.to(sackB, 0.5, { y: 0, ease: 'power2.in' });
    goblinSound.clink();
    const tag4 = k.add(numberTag('4 kg', C.cream, 'l14c2-4'), { x: 740, y: 160, w: 170, z: 22 });
    k.set(tag4, { opacity: 0 });
    const reading2 = async () => {
      await dialTo(k, dial, 10, 4, 1.2);
      goblinSound.ding(0);
      await k.appear(tag4, 0.3);
    };
    await k.all(k.say('four'), reading2());

    // Six is more than four: the first sack wins.
    void k.pop(tag6, 1.25);
    k.sparkle(365, 200, 12, 110);
    await k.all(k.say('heavier', hero), k.hop(hero, 28, 2));

    // A handful of goblin gold for the treasure room.
    const gold = k.keepsake(k.chapter?.keepsake ?? 'goblinGold', { x: 200, y: 300, w: 150, z: 26 });
    k.set(gold, { opacity: 0 });
    k.sfx.sparkle();
    await k.appear(gold, 0.4);
    await k.wait(900);

    // Splish, splosh, from further in.
    void k.all(k.fade(tag6, 0, 0.4), k.fade(tag4, 0, 0.4), k.fade(gold, 0, 0.4));
    k.fx.splash();
    void k.shake(pixie, 4, 2);
    await k.say('splash');
    k.fx.bubbles(6);
    await k.all(k.say('washalot', pixie), k.hop(pixie, 22, 2), k.hop(hero, 18));
    await k.wait(500);
  },
});
