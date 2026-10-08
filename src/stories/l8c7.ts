/**
 * Land 8, chapter 7: Pennies and Pounds.
 *
 * Beth (or Joe, if he climbs with Beth) points at the toy train on the
 * counter: ten pence. Five 2p coins march in and the tag counts them, two,
 * four, six, eight, ten. Beth swaps them for two 5p coins: five and five is
 * ten too (the chapter's coins, in 2s, 5s and 10s). Mr Oom Boom Boom rings
 * it up, the train toots, the dewdrop glows, and the toy box creaks like a
 * toy winding down. Time to go. Next: The Toy Train Home.
 */
import { C, defineStory, type Kit } from './kit';
import { buddy, numberTag, tick } from './bits';
import { clink, coin, counter, dewdrop, toot, toyTrain } from './toys';

export default defineStory({
  lines: {
    train_beth: { who: 'beth', text: 'Look at the toy train! It costs ten pence.' },
    train_joe: { who: 'joe', text: 'Look at the toy train! It costs ten pence.' },
    twos: { who: 'narrator', text: 'Two, four, six, eight, ten. Five two pence coins buy the train!' },
    fives_beth: { who: 'beth', text: 'Or two five pence coins. Five and five is ten too!' },
    fives_joe: { who: 'joe', text: 'Or two five pence coins. Five and five is ten too!' },
    sold: { who: 'oomboom', text: 'Sold! Oom boom boom! Look after her.' },
    choo: { who: 'hero', text: 'Choo choo! The dewdrop is glowing!' },
    creak: { who: 'narrator', text: 'Then the toy box creaked. The land was winding down. Time to ride the train home!' },
  },

  async play(k: Kit) {
    const host = buddy(k, 'beth', 'joe');
    k.landScene();
    k.music('cosy');
    const hostEl = k.character(host, { x: 20, y: 352, z: 20 });
    const hero = k.character('hero', { x: 905, y: 352, z: 20, flip: true });
    const dew = dewdrop(k);
    const desk = k.add(counter(), { x: 240, y: 480, w: 700, z: 13 });
    const train = k.add(toyTrain(), { x: 330, y: 360, w: 380, z: 14 });
    const price = k.add(numberTag('10p', C.pink, 'l8c7-price'), { x: 560, y: 300, w: 100, z: 15 });
    k.set([desk, train, price], { opacity: 0 });
    await k.all(k.enter(hostEl, 'left'), k.enter(hero, 'right'));
    void k.appear(desk, 0.3);
    void k.appear(train, 0.4);
    void k.appear(price, 0.4);
    await k.say(`train_${host}`, hostEl);

    // ---- Five 2p coins in a row: the tag counts in twos.
    const twos = Array.from({ length: 5 }, (_, i) => k.add(coin(2), { x: 300 + i * 100, y: 100, w: 84, z: 22 }));
    const counts = Array.from({ length: 5 }, (_, i) => k.add(numberTag(String((i + 1) * 2), C.goldLight, `l8c7-two-${i}`), { x: 276 + i * 100, y: 190, w: 100, z: 22 }));
    [...twos, ...counts].forEach((e) => k.set(e, { opacity: 0 }));
    const laying = async () => {
      await k.wait(1000);
      for (let i = 0; i < 5; i++) {
        clink(i);
        tick(i);
        void k.appear(twos[i], 0.25);
        await k.appear(counts[i], 0.25);
        await k.wait(380);
      }
    };
    await k.all(k.say('twos'), laying());

    // ---- Swap for two 5p coins: five and five.
    void k.all(...twos.map((c) => k.fade(c, 0, 0.4)), ...counts.map((c) => k.fade(c, 0, 0.4)));
    const fives = [0, 1].map((i) => k.add(coin(5), { x: 410 + i * 200, y: 100, w: 110, z: 22 }));
    const ten = k.add(numberTag('5 + 5', C.sky, 'l8c7-fives'), { x: 475, y: 200, w: 230, z: 23 });
    [...fives, ten].forEach((e) => k.set(e, { opacity: 0 }));
    const swapping = async () => {
      await k.wait(1200);
      clink(0);
      await k.appear(fives[0], 0.3);
      await k.wait(300);
      clink(2);
      await k.appear(fives[1], 0.3);
      await k.wait(300);
      await k.appear(ten, 0.3);
    };
    await k.all(k.say(`fives_${host}`, hostEl), swapping());

    // ---- Sold! The train toots and the dewdrop glows.
    const ob = k.character('oomboom', { x: 650, y: 250, w: 200, z: 12 });
    k.set(ob, { opacity: 0 });
    void k.all(...fives.map((c) => k.fade(c, 0, 0.4)), k.fade(ten, 0, 0.4));
    void k.appear(ob, 0.5);
    await k.say('sold', ob);
    toot();
    k.sfx.reveal();
    await k.all(k.say('choo', hero), dew.glow(), k.hop(train, 14, 2), k.hop(hero, 22, 1));

    // ---- The land creaks like a toy winding down.
    k.fx.creak();
    void k.quake(5);
    await k.all(k.say('creak'), k.shake(train, 4, 2), k.shake(hostEl, 4, 2));
    await k.wait(400);
  },
});
