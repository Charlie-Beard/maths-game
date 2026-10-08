/**
 * Land 7, chapter 2: Half a Spell.
 *
 * Silky is flustered: the Enchanter's spell has been cut in half, and it
 * took fourteen glowing stars to make. She deals them out, one for her and
 * one for {name}, until each has the same: seven and seven. Half of
 * fourteen is seven (the chapter's halves). As the second heap lands, a
 * long thin ruler-shaped shadow slides across the stones and is gone, with
 * a few clacks. Silky shivers. Hint two of Dame Snap, still only a shadow.
 * Next: Make Ten Magic.
 */
import { numberTag } from './bits';
import { C, defineStory, type Kit } from './kit';
import { plink, shadowPasses, spellChime } from './spells';

export default defineStory({
  lines: {
    oops: { who: 'silky', text: 'Oops! The Enchanter cut his spell in half. Fourteen stars to halve!' },
    deal: { who: 'silky', text: 'One for you, one for me. One for you, one for me.' },
    half: { who: 'narrator', text: 'Seven and seven. Half of fourteen is seven!' },
    shadow: { who: 'narrator', text: 'Then a long, thin shadow slid across the stones. It looked like a ruler.' },
    who: { who: 'silky', text: 'Brrr. Who was that? Come on. Moon-Face has a magic trick for us!' },
  },

  async play(k: Kit) {
    k.landScene();
    k.music('magic');
    k.ambient('fireflies', { count: 10 });

    const silky = k.character('silky', { x: 30, y: 300, w: 250, z: 20 });
    const hero = k.character('hero', { x: 930, y: 300, w: 230, z: 20, flip: true });
    k.set([silky, hero], { opacity: 0 });
    await k.all(k.enter(silky, 'left', 0.8), k.enter(hero, 'right', 0.8));
    await k.say('oops', silky);

    // Dealing fourteen stars, one for each of them, into two equal rows.
    const stars: HTMLElement[] = [];
    for (let i = 0; i < 14; i++) {
      const row = i % 2;
      const col = Math.floor(i / 2);
      const s = k.prop('star', { x: 320 + col * 76, y: 310 + row * 100, w: 66, z: 18 });
      k.set(s, { opacity: 0, scale: 0.3 });
      stars.push(s);
    }
    const dealing = k.say('deal', silky);
    for (const [i, s] of stars.entries()) {
      void k.to(s, 0.3, { opacity: 1, scale: 1, ease: 'back.out(2)' });
      plink(i);
      await k.wait(190);
    }
    await dealing;

    // The wand splits them: seven and seven.
    spellChime(5);
    const sevenA = k.add(numberTag('7', C.pink, 'l7c2-sevenA'), { x: 860, y: 300, w: 96, z: 19 });
    const sevenB = k.add(numberTag('7', C.sky, 'l7c2-sevenB'), { x: 860, y: 400, w: 96, z: 19 });
    k.set([sevenA, sevenB], { opacity: 0 });
    const line = k.light(590, 405, 330, { color: C.goldLight, strength: 0.3, z: 16 });
    void k.fade(line, 0.5, 0.6);
    void k.all(k.appear(sevenA, 0.4), k.appear(sevenB, 0.4));
    await k.all(k.say('half'), k.hop(silky, 30, 2));
    await k.wait(300);

    // A ruler-shaped shadow glides over the stones. Silky hugs herself.
    const sh = shadowPasses(k, 590, 'l7c2-ruler');
    await k.all(k.say('shadow'), sh);
    await k.all(k.say('who', silky), k.shake(silky, 4, 2));
    await k.wait(300);
  },
});
