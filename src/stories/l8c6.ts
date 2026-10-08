/**
 * Land 8, chapter 6: The Toy Shop.
 *
 * Behind his counter, Mr Oom Boom Boom shows a teddy that costs 7p. The hero
 * lays down a 5p coin, then a 2p coin, and the tag adds them: five and two
 * make seven (the chapter's coins). Exactly right! The teddy is his, and the
 * dewdrop glows. Then a toy train in the window, which costs more. Next:
 * Pennies and Pounds.
 */
import { C, defineStory, type Kit } from './kit';
import { numberTag } from './bits';
import { clink, coin, counter, dewdrop, toyTrain } from './toys';

export default defineStory({
  lines: {
    shop: { who: 'oomboom', text: 'Oom boom boom! Welcome to my toy shop. Everything has a price.' },
    price: { who: 'oomboom', text: 'This teddy costs seven pence. Have you got the right coins?' },
    pay: { who: 'narrator', text: '{name} put down five pence. Then two pence. Five and two make seven.' },
    yes: { who: 'oomboom', text: 'Exactly right! One teddy, all yours!' },
    teddy: { who: 'hero', text: 'A teddy for when we find Silky!' },
    train: { who: 'oomboom', text: 'See that toy train in the window? It costs more than seven!' },
  },

  async play(k: Kit) {
    k.landScene();
    k.music('cosy');
    const ob = k.character('oomboom', { x: 20, y: 300, z: 14 });
    const hero = k.character('hero', { x: 905, y: 352, z: 20, flip: true });
    const dew = dewdrop(k);
    k.add(counter(), { x: 150, y: 430, w: 700, z: 18 });
    const train = k.add(toyTrain(), { x: 230, y: 20, w: 260, z: 12 });
    const trainTag = k.add(numberTag('10p', C.pink, 'l8c6-train-price'), { x: 300, y: 130, w: 110, z: 13 });
    k.set([train, trainTag], { opacity: 0 });
    await k.all(k.enter(ob, 'left'), k.enter(hero, 'right'));
    await k.say('shop', ob);

    // ---- The teddy on the counter, with its price.
    const teddy = k.prop('teddy', { x: 420, y: 340, w: 130, z: 19 });
    const price = k.add(numberTag('7p', C.goldLight, 'l8c6-price'), { x: 560, y: 350, w: 110, z: 19 });
    k.set([teddy, price], { opacity: 0 });
    void k.appear(teddy, 0.4);
    void k.appear(price, 0.4);
    await k.say('price', ob);

    // ---- Five pence, then two pence: seven.
    const five = k.add(coin(5), { x: 720, y: 310, w: 90, z: 22 });
    const two = k.add(coin(2), { x: 820, y: 310, w: 90, z: 22 });
    const sum = k.add(numberTag('7p', C.sky, 'l8c6-sum'), { x: 760, y: 200, w: 110, z: 23 });
    k.set([five, two, sum], { opacity: 0 });
    const paying = async () => {
      await k.wait(900);
      clink(0);
      await k.appear(five, 0.3);
      await k.wait(700);
      clink(1);
      await k.appear(two, 0.3);
      await k.wait(500);
      await k.appear(sum, 0.35);
    };
    await k.all(k.say('pay'), paying());
    await k.all(k.say('yes', ob), k.hop(ob, 26, 2), k.pop(teddy, 1.2));

    // ---- The teddy is his; the dewdrop glows.
    await k.all(k.say('teddy', hero), dew.glow(), k.hop(hero, 22, 1), k.to(teddy, 1.2, { x: 440, y: 60, ease: 'sine.inOut' }));

    // ---- The train in the window.
    void k.appear(train, 0.5);
    void k.appear(trainTag, 0.5);
    await k.say('train', ob);
    await k.wait(400);
  },
});
