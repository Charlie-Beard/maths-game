/**
 * Land 11, chapter 1: A House Made of a Shoe.
 *
 * The second adventure begins. Dame Snap is beaten and the party is over,
 * but new lands keep coming to the top of the Faraway Tree: this time, a
 * meadow with a great old boot in it. Moon-Face points it out from the
 * top of the tree, and down it settles into the cloud.
 *
 * In the meadow the Old Woman bustles out: she lives in the shoe with so
 * many children she can never count them. {name} makes a tally (the
 * chapter's maths): one mark for every child who runs out of the front
 * door, four upright and the fifth across them like a gate, then six,
 * seven. Seven! But there are lots more inside. Next: So Many Children!
 * (Joe's chapter: if Joe is the child he climbs with, Beth says the line.)
 */
import { tree, TREE_SPOTS } from '../art/scenery';
import { C, defineStory, type Kit } from './kit';
import { buddy, roundTag, wave } from './bits';
import { card, creak, giggle, kid, SHOE, showMark, tallyMarks, tallyWidth } from './shoe';

export default defineStory({
  lines: {
    look: { who: 'moonface', text: 'Dame Snap is gone for good. But new lands keep coming! Look, {name}. A shoe!' },
    hello: { who: 'oldWoman', text: 'Hello, my dears! I live in this shoe, with so many children. I can never count them!' },
    tally: { who: 'hero', text: 'Let’s make a tally. One mark for every child.' },
    count: { who: 'narrator', text: 'One, two, three, four. The fifth mark goes across, like a gate. Then six, seven!' },
    more: { who: 'oldWoman', text: 'Seven! Oh, clever you. But there are lots more inside…' },
    next_joe: { who: 'joe', text: 'Lots more? Then tomorrow we’ll count them in fives!' },
    next_beth: { who: 'beth', text: 'Lots more? Then tomorrow we’ll count them in fives!' },
  },

  async play(k: Kit) {
    const next = buddy(k, 'joe', 'beth');

    // ---- The top of the tree: a new land drifts down into the cloud.
    k.backdrop(tree('l11c1-tree'));
    k.music('dreamy');
    const box = TREE_SPOTS.cloud;
    const far = k.landFar(11, { x: box.x, y: box.y, w: box.w, z: 4 });
    k.set(far, { y: -200, opacity: 0 });
    const mf = k.character('moonface', { x: 120, y: 420, w: 240, z: 20 });
    const h1 = k.character('hero', { x: 860, y: 430, w: 230, z: 20, flip: true });
    k.set([mf, h1], { opacity: 0 });
    k.fx.twinkle();
    await k.all(k.to(far, 2.2, { y: 0, opacity: 1, ease: 'sine.out' }), k.camera({ zoom: 1.5, x: 590, y: 120 }, 2.2));
    await k.all(k.camera({}, 1), k.enter(mf, 'left'), k.enter(h1, 'right'));
    await k.all(k.say('look', mf), wave(k, mf, 'armR', 2));

    // ---- The meadow, and the Old Woman who lives in the shoe.
    let ow!: HTMLElement;
    let hero!: HTMLElement;
    await k.cut(() => {
      k.landScene();
      ow = k.character('oldWoman', { x: 20, y: 360, w: 240, z: 20 });
      hero = k.character('hero', { x: 230, y: 380, w: 220, z: 21 });
      k.set([ow, hero], { opacity: 0 });
    });
    k.music('cosy');
    k.ambient('dust', { count: 10 });
    await k.all(k.enter(ow, 'left'), k.wait(200).then(() => k.enter(hero, 'left')));
    creak();
    await k.all(k.say('hello', ow), wave(k, ow, 'armL', 2));

    // ---- The tally card, and seven children running out of the door.
    const CARD = { x: 470, y: 60, w: 440, h: 190 };
    const board = k.add(card(CARD.w, CARD.h, 'l11c1-card'), { x: CARD.x, y: CARD.y, w: CARD.w, z: 20 });
    k.set(board, { opacity: 0 });
    const marks = tallyMarks(k, CARD.x + 20 + (CARD.w - 140 - tallyWidth(7)) / 2, CARD.y + 40, 7, { name: 'l11c1' });
    await k.all(k.say('tally', hero), k.wait(600).then(() => k.appear(board, 0.4)));

    const SPOT = (i: number): number => 470 + i * 70;
    const kids = Array.from({ length: 7 }, (_, i) => {
      const el = k.add(kid(i, i % 3 === 0 ? 'wave' : 'stand'), { x: SHOE.door.x - 35, y: SHOE.door.y - 110, w: 70, z: 18 + i });
      k.set(el, { opacity: 0, scale: 0.6 });
      return el;
    });
    const total = k.add(roundTag(7, C.goldLight, 'l11c1-seven'), { x: CARD.x + CARD.w - 125, y: CARD.y + 50, w: 90, z: 26 });
    k.set(total, { opacity: 0 });
    const counting = async () => {
      await k.wait(200);
      for (let i = 0; i < 7; i++) {
        const el = kids[i];
        // Out of the door, and off to a place in the line.
        k.set(el, { opacity: 1 });
        giggle(1);
        void k.to(el, 0.5, { scale: 1, x: SPOT(i) - (SHOE.door.x - 35), y: 73, ease: 'power2.out' });
        await k.wait(i === 4 ? 650 : 450);
        await showMark(k, marks[i], i === 4);
        k.fx.pop();
        await k.wait(i === 4 ? 500 : 250);
      }
      k.sfx.success();
      await k.appear(total, 0.35);
      k.sparkle(CARD.x + CARD.w - 80, CARD.y + 95, 12, 120);
    };
    await k.all(k.say('count'), counting());
    await k.all(...kids.map((el, i) => k.hop(el, 26, 1 + (i % 2))));

    // ---- But there are lots more inside.
    creak();
    await k.all(k.say('more', ow), k.shake(ow, 4, 1));
    const friend = k.character(next, { x: 930, y: 380, w: 230, z: 30, flip: true });
    k.set(friend, { opacity: 0 });
    await k.enter(friend, 'right');
    await k.all(k.say(`next_${next}`, friend), k.hop(friend, 28, 1), k.hop(hero, 20, 1));
    await k.wait(500);
  },
});
