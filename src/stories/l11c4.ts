/**
 * Land 11, chapter 4: Broth for Breakfast.
 *
 * The Saucepan Man has set up his saucepans on the meadow and is selling
 * hot broth: seven pence a bowl. {name}'s friend pays with a ten pence
 * coin (he hears "ten spence", of course), so they need some change. They
 * count on from seven: eight, nine, ten, and a penny drops for every
 * number. Three pence change (the chapter's maths). The Old Woman tastes
 * the broth… broth with no bread? Tomorrow, the bread shop (and the old
 * rhyme: she gave them some broth without any bread). Next: The Bread Shop.
 */
import { C, defineStory, type Kit } from './kit';
import { numberTag, roundTag } from './bits';
import { snapSound } from './snapSchool';
import { clink, coin, priceSign } from './shoe';

export default defineStory({
  lines: {
    sell: { who: 'saucepan', text: 'Hot broth! Seven pence a bowl! Clank, clank!' },
    pay: { who: 'hero', text: 'One bowl, please. Here’s ten pence.' },
    eh: { who: 'saucepan', text: 'EH? TEN SPENCE? Oh, ten PENCE! Then you need some change.' },
    count: { who: 'narrator', text: 'Count on from seven. Eight, nine, ten. Three pence change!' },
    bread: { who: 'oldWoman', text: 'Mmm, lovely broth. But no bread? Tomorrow we’ll go to the bread shop!' },
  },

  async play(k: Kit) {
    k.landScene();
    k.music('cosy');
    k.ambient('dust', { count: 8 });

    const sauce = k.character('saucepan', { x: 20, y: 360, w: 240, z: 20 });
    const hero = k.character('hero', { x: 920, y: 390, w: 230, z: 21, flip: true });
    k.set([sauce, hero], { opacity: 0 });
    snapSound.clank(3);
    await k.all(k.enter(sauce, 'left'), k.enter(hero, 'right'));

    // ---- The broth, and its price.
    const bowl = k.keepsake('brothBowl', { x: 300, y: 380, w: 170, z: 22 });
    const sign = k.add(priceSign('7p', 'l11c4-price'), { x: 310, y: 250, w: 150, z: 22 });
    k.set([bowl, sign], { opacity: 0 });
    await k.all(k.appear(bowl, 0.35), k.wait(200).then(() => k.appear(sign, 0.35)));
    await k.all(k.say('sell', sauce), k.hop(sauce, 20, 2));

    // ---- Ten pence on the counter.
    const ten = k.add(coin(10), { x: 520, y: 260, w: 110, z: 24 });
    k.set(ten, { x: 400, y: 160, opacity: 0 });
    const paying = async () => {
      await k.wait(700);
      k.set(ten, { opacity: 1 });
      await k.to(ten, 0.6, { x: 0, y: 0, ease: 'power2.out' });
      clink();
      await k.pop(ten, 1.1);
    };
    await k.all(k.say('pay', hero), paying());
    await k.all(k.say('eh', sauce), k.shake(sauce, 5, 1));

    // ---- Counting on from seven: a penny for each number, up to ten.
    const start = k.add(roundTag(7, C.cream, 'l11c4-seven'), { x: 520, y: 100, w: 96, z: 24 });
    k.set(start, { opacity: 0 });
    const tags = [8, 9, 10].map((n, i) => {
      const t = k.add(roundTag(n, n === 10 ? C.goldLight : C.cream, `l11c4-tag-${n}`), { x: 640 + i * 110, y: 100, w: 96, z: 24 });
      k.set(t, { opacity: 0 });
      return t;
    });
    const pennies = [0, 1, 2].map((i) => {
      const p = k.add(coin(1), { x: 648 + i * 110, y: 230, w: 80, z: 24 });
      k.set(p, { opacity: 0 });
      return p;
    });
    const change = k.add(numberTag('3p', C.goldLight, 'l11c4-change'), { x: 700, y: 340, w: 130, z: 26 });
    k.set(change, { opacity: 0 });
    const counting = async () => {
      await k.appear(start, 0.3);
      await k.wait(900);
      for (let i = 0; i < 3; i++) {
        await k.appear(tags[i], 0.3);
        k.set(pennies[i], { opacity: 1, y: -60 });
        await k.to(pennies[i], 0.3, { y: 0, ease: 'bounce.out' });
        clink(i);
        await k.wait(420);
      }
      k.sfx.success();
      await k.appear(change, 0.35);
      k.sparkle(765, 380, 12, 120);
    };
    await k.all(k.say('count'), counting());
    await k.wait(1200);

    // The three pennies go to {name}'s friend, and the broth too.
    await k.all(
      ...pennies.map((p, i) => k.wait(i * 120).then(() => k.to(p, 0.6, { x: 330 - i * 110, y: 260, scale: 0.6, opacity: 0, ease: 'power2.in' }))),
      k.fade(ten, 0, 0.4),
      ...[start, ...tags, change, sign].map((t) => k.fade(t, 0, 0.4)),
    );
    await k.to(bowl, 0.7, { x: 560, y: 90, ease: 'power2.inOut' });
    await k.hop(hero, 24, 1);

    // ---- The Old Woman comes for a taste.
    const ow = k.character('oldWoman', { x: 360, y: 360, w: 240, z: 23 });
    k.set(ow, { opacity: 0 });
    await k.enter(ow, 'bottom', 0.6);
    await k.all(k.say('bread', ow), k.hop(ow, 16, 1));
    await k.wait(500);
  },
});
