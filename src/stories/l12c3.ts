/**
 * Land 12, chapter 3: Trumpets in Threes.
 *
 * Joe (or Beth, if {name} climbs with Joe) finds the trumpet flowers: three
 * in every pot, five pots in a row. Each pot toots in turn and they count
 * them in threes (3, 6, 9, 12, 15), the chapter's groups of three. Five
 * threes make fifteen! One flower turns into a real shiny trumpet for
 * {name}, who blows a fanfare. Moon-Face hurries up: when does the band
 * play? Next: When Does the Band Play?
 */
import { C, defineStory, type Kit } from './kit';
import { buddy, roundTag } from './bits';
import { blare, fanfare, L12, trumpetBunch } from './music';

export default defineStory({
  lines: {
    look_joe: { who: 'joe', text: 'Look! Trumpet flowers, three in every pot. How many trumpets altogether?' },
    look_beth: { who: 'beth', text: 'Look! Trumpet flowers, three in every pot. How many trumpets altogether?' },
    count: { who: 'narrator', text: 'Toot, toot, toot! Three, six, nine, twelve, fifteen trumpets!' },
    five: { who: 'hero', text: 'Five pots of three make fifteen!' },
    gift: { who: 'narrator', text: 'One flower turned into a real, shiny trumpet, just for {name}.' },
    next: { who: 'moonface', text: 'There you are! When does the band play? Let’s look at a clock!' },
  },

  async play(k: Kit) {
    const sib = buddy(k, 'joe', 'beth');
    k.landScene();
    k.music('adventure');
    const friend = k.character(sib, { x: 30, y: 352, z: 20 });
    const hero = k.character('hero', { x: 900, y: 352, z: 20, flip: true });
    await k.all(k.enter(friend, 'left'), k.enter(hero, 'right'));

    // ---- Five pots of trumpet flowers, three in each.
    const blooms = [L12.brass, L12.drumRed, L12.brassLight, L12.brass, L12.drumRed];
    const pots = blooms.map((b, i) => {
      const el = k.add(trumpetBunch(`l12c3-pot-${i}`, b), { x: 296 + i * 120, y: 470, w: 120, z: 18 });
      k.set(el, { opacity: 0, y: 30 });
      return el;
    });
    const growing = async () => {
      for (const p of pots) {
        k.fx.pop();
        void k.to(p, 0.4, { opacity: 1, y: 0, ease: 'back.out(1.6)' });
        await k.wait(200);
      }
    };
    await k.all(k.say(`look_${sib}`, friend), growing());

    // ---- Each pot toots in turn: count in threes.
    k.silence();
    const tags: HTMLElement[] = [];
    const tooting = async () => {
      for (let i = 0; i < pots.length; i++) {
        blare([392, 440, 494, 523, 587][i]);
        await k.to(pots[i], 0.15, { scale: 1.08, ease: 'power1.out' });
        await k.to(pots[i], 0.25, { scale: 1, ease: 'back.out(3)' });
        const tag = k.add(roundTag((i + 1) * 3, C.goldLight, `l12c3-tag-${i}`), { x: 320 + i * 120, y: 380, w: 72, z: 24 });
        k.set(tag, { opacity: 0 });
        tags.push(tag);
        await k.appear(tag, 0.25);
        await k.wait(420);
      }
    };
    await k.all(k.say('count'), tooting());
    k.music('triumph');
    await k.all(k.say('five', hero), k.hop(hero, 30, 2), k.pop(tags[4], 1.25));

    // ---- One flower becomes a real trumpet, for {name}.
    await k.all(...tags.map((t) => k.fade(t, 0, 0.3)), ...pots.filter((_, i) => i !== 2).map((p) => k.fade(p, 0, 0.4)));
    const horn = k.keepsake(k.chapter?.keepsake ?? 'trumpet', { x: 470, y: 150, w: 240, z: 26 });
    k.set(horn, { opacity: 0 });
    const turning = async () => {
      k.fx.twinkle();
      await k.all(k.fade(pots[2], 0, 0.4), k.appear(horn, 0.5));
      k.sparkle(590, 270, 14, 140);
      await k.wait(900);
      await k.to(horn, 0.8, { x: 200, y: 60, rotation: -12, ease: 'power2.inOut' });
      fanfare();
      await k.pop(horn, 1.15);
    };
    await k.all(k.say('gift'), turning());

    // ---- Moon-Face, hurrying: when does the band play?
    const mf = k.character('moonface', { x: 450, y: 380, w: 250, z: 28 });
    k.fx.patter(5, 0.1);
    await k.all(k.enter(mf, 'bottom', 0.7), k.fade(horn, 0, 0.4));
    await k.all(k.say('next', mf), k.shake(mf, 6, 2));
    await k.wait(500);
  },
});
