/**
 * Land 7, chapter 6: The Missing Ingredient.
 *
 * The recipe needs twelve toadstools; the cauldron has nine. The Saucepan
 * Man hears "missing ingredient" and checks his saucepans. {name} counts
 * on from nine instead: ten, eleven, twelve, so three are missing (the
 * chapter's missing numbers: nine and what makes twelve). The three pop
 * in and the cauldron glows. Then: tap, tap, tap. The tip of a long
 * wooden ruler pokes in at the door and taps the cauldron's rim, and the
 * Saucepan Man cheerfully says come in. Hint five of Dame Snap: her ruler,
 * very close. Next: Story Spells.
 */
import { numberTag, sumStrip } from './bits';
import { C, circle, defineStory, piece, svg, type Kit } from './kit';
import { bloop, plink, rulerTip, snapSound, spellChime } from './spells';

/** An empty place in the recipe (80 × 80): a faint ring. */
function slot(): string {
  return svg({ w: 80, h: 80, name: 'l7c6-slot', boil: false }, [piece(circle(40, 40, 32), C.cream, { edge: 'clean', fibre: false, shadow: false, opacity: 0.3 })]);
}

export default defineStory({
  lines: {
    missing: { who: 'saucepan', text: 'EH? A missing ingredient? It is not in my saucepans!' },
    need: { who: 'narrator', text: 'The recipe needs twelve toadstools. The cauldron has nine. How many are missing?' },
    count: { who: 'narrator', text: 'Count on from nine. Ten, eleven, twelve. Three more! Nine and three makes twelve.' },
    tap: { who: 'narrator', text: 'Tap, tap, tap. The tip of a long ruler poked in at the door.' },
    come: { who: 'saucepan', text: 'Come in, come in! Do you want to buy a saucepan?' },
    next: { who: 'hero', text: 'Let us read the spellbook with Fran. I want to know who that was.' },
  },

  async play(k: Kit) {
    k.landScene();
    k.music('magic');
    k.ambient('fireflies', { count: 10 });

    const pan = k.character('saucepan', { x: 20, y: 90, w: 230, z: 20 });
    const hero = k.character('hero', { x: 930, y: 90, w: 210, z: 20, flip: true });
    k.set([pan, hero], { opacity: 0 });
    await k.all(k.enter(pan, 'left', 0.8), k.enter(hero, 'right', 0.8));

    const cauldron = k.keepsake('cauldron', { x: 480, y: 90, w: 220, z: 18 });
    k.set(cauldron, { opacity: 0 });
    void k.appear(cauldron, 0.4);
    const glow = k.light(590, 250, 190, { color: '#9ee0a0', strength: 0, z: 17 });
    // He checks his pots.
    void k.to(k.part(pan, 'pots'), 0.12, { rotation: 6, yoyo: true, repeat: 5, ease: 'sine.inOut' });
    await k.all(k.say('missing', pan), k.hop(pan, 30, 2));

    // Twelve places; nine toadstools in the first nine.
    const slots = Array.from({ length: 12 }, (_, i) => k.add(slot(), { x: 112 + i * 80, y: 400, w: 80, z: 14 }));
    const nine = Array.from({ length: 9 }, (_, i) => k.prop('toadstool', { x: 115 + i * 80, y: 400, w: 74, z: 18 }));
    [...slots, ...nine].forEach((s) => k.set(s, { opacity: 0 }));
    const told = k.say('need');
    for (const s of slots) void k.fade(s, 1, 0.3);
    for (const [i, s] of nine.entries()) {
      void k.to(s, 0.25, { opacity: 1, scale: 1, ease: 'back.out(2)' });
      plink(i);
      await k.wait(120);
    }
    await told;
    const sum = k.add(sumStrip('9 + ? = 12', 'l7c6-sum'), { x: 430, y: 520, w: 320, z: 22 });
    k.set(sum, { opacity: 0 });
    await k.appear(sum, 0.4);

    // Counting on: ten, eleven, twelve.
    const counted = k.say('count', pan);
    await k.wait(900);
    for (let j = 0; j < 3; j++) {
      const t = k.add(numberTag(String(10 + j), C.goldLight, `l7c6-tag-${10 + j}`), { x: 100 + (9 + j) * 80, y: 330, w: 96, z: 24 });
      const s = k.prop('toadstool', { x: 115 + (9 + j) * 80, y: 400, w: 74, z: 18 });
      k.set([t, s], { opacity: 0, scale: 0.4 });
      void k.to([t, s], 0.3, { opacity: 1, scale: 1, ease: 'back.out(2)' });
      plink(j + 6);
      bloop(2);
      await k.wait(750);
    }
    const done = k.add(sumStrip('9 + 3 = 12', 'l7c6-sum-done'), { x: 430, y: 520, w: 320, z: 23 });
    k.set(done, { opacity: 0 });
    void k.appear(done, 0.4);
    spellChime(5);
    void k.fade(glow, 0.45, 0.8);
    k.sparkle(590, 220, 18, 200);
    await counted;
    await k.all(k.hop(hero, 40, 2), k.hop(pan, 30, 2));
    await k.wait(400);

    // Tap, tap, tap: the tip of a ruler at the door.
    const tip = k.add(rulerTip('l7c6-ruler'), { x: 1180, y: 250, w: 460, z: 30 });
    snapSound.heels(3, 0.4, 0.7);
    const tapping = k.say('tap');
    await k.to(tip, 0.9, { x: -330, ease: 'power2.out' });
    for (let i = 0; i < 3; i++) {
      snapSound.clank(1);
      await k.to(tip, 0.12, { x: -350, y: 4, ease: 'sine.inOut' });
      await k.to(tip, 0.15, { x: -330, y: 0, ease: 'sine.inOut' });
      await k.wait(200);
    }
    await tapping;
    await k.to(tip, 0.8, { x: 0, ease: 'power2.in' });
    k.remove(tip);
    await k.all(k.say('come', pan), k.hop(pan, 30, 1));
    await k.say('next', hero);
    await k.wait(300);
  },
});
