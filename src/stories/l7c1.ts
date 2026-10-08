/**
 * Land 7, chapter 1: The Enchanter's Tower.
 *
 * The Land of Spells settles in at the top of the tree, a crooked tower
 * in a purple mist. The Enchanter (grumpy, but kind underneath) shows
 * {name} his first lesson: every spell needs a double. Six stars glow in
 * a row; he waves his wand and six more appear below: six and six more
 * make twelve (the chapter's doubles to 20). Then, far off, a faint clack
 * of heels. The Enchanter flinches and says it is only the wind. That is
 * the first hint of Dame Snap: a sound, nothing more. Next: Half a Spell.
 */
import { numberTag, sumStrip } from './bits';
import { C, defineStory, type Kit } from './kit';
import { plink, snapSound, spellChime } from './spells';

export default defineStory({
  lines: {
    arrive: { who: 'narrator', text: 'A new land! A crooked tower stood in the purple mist, with glowing windows.' },
    welcome: { who: 'enchanter', text: 'Welcome to my tower. Every spell needs a double!' },
    six: { who: 'narrator', text: 'Six stars in a row. The Enchanter waved his wand, and six more appeared.' },
    twelve: { who: 'narrator', text: 'Six and six more. Double six makes twelve!' },
    wow: { who: 'hero', text: 'Twelve glowing stars! That is real magic.' },
    wind: { who: 'enchanter', text: 'Hmph. Only the wind. Now go and find Silky. My next spell is cut in half!' },
  },

  async play(k: Kit) {
    k.landScene();
    k.music('magic');
    k.ambient('fireflies', { count: 12 });

    const hero = k.character('hero', { x: 40, y: 300, w: 250, z: 20 });
    const ench = k.character('enchanter', { x: 900, y: 290, w: 260, z: 20, flip: true });
    k.set([hero, ench], { opacity: 0 });
    await k.all(k.enter(hero, 'left', 0.8), k.enter(ench, 'right', 0.8), k.say('arrive'));
    await k.say('welcome', ench);

    // Six stars in a row, glowing.
    const top = Array.from({ length: 6 }, (_, i) => k.prop('star', { x: 330 + i * 84, y: 320, w: 74, z: 18 }));
    top.forEach((s) => k.set(s, { opacity: 0, scale: 0.4 }));
    const told = k.say('six', ench);
    for (const [i, s] of top.entries()) {
      void k.to(s, 0.3, { opacity: 1, scale: 1, ease: 'back.out(2)' });
      plink(i);
      await k.wait(220);
    }
    await told;
    const six = k.add(numberTag('6', C.goldLight, 'l7c1-six'), { x: 190, y: 330, w: 110, z: 19 });
    void k.pop(six, 1.2);

    // The wand waves, and a second row of six drops in below.
    void k.hop(ench, 20, 1);
    spellChime(5);
    k.sparkle(560, 420, 16, 220);
    const bottom = Array.from({ length: 6 }, (_, i) => k.prop('star', { x: 330 + i * 84, y: 420, w: 74, z: 18 }));
    bottom.forEach((s) => k.set(s, { opacity: 0, y: -50 }));
    const twelve = k.say('twelve', ench);
    for (const s of bottom) {
      void k.to(s, 0.4, { opacity: 1, y: 0, ease: 'back.out(2)' });
      await k.wait(180);
    }
    await twelve;
    const sum = k.add(sumStrip('6 + 6 = 12', 'l7c1-sum'), { x: 430, y: 520, w: 320, z: 22 });
    k.set(sum, { opacity: 0 });
    await k.appear(sum, 0.4);
    k.sparkle(590, 540, 14, 160);
    await k.all(k.say('wow', hero), k.hop(hero, 40, 2));

    // Far off, heels. The Enchanter does not like it.
    await k.wait(500);
    snapSound.heels(4, 0.5, 0.35);
    await k.wait(700);
    await k.all(k.say('wind', ench), k.shake(ench, 6, 2));
    await k.wait(400);
  },
});
