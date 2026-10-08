/**
 * Land 8, chapter 1: Wind-Up Land.
 *
 * The tree has stopped at the Land of Toys, and {name} is sad: Silky was
 * taken, and her dewdrop is quiet. Captain Tin winds his key (click, click,
 * click) and five toy soldiers march out. Each pair of boots comes down with
 * a tick, and the tags count them in twos: two, four, six, eight, ten (the
 * chapter's counting in 2s). The dewdrop glows. Next: Soldiers in Rows.
 */
import { C, defineStory, type Kit } from './kit';
import { roundTag, tick } from './bits';
import { dewdrop, windUp } from './toys';

export default defineStory({
  lines: {
    sad: { who: 'narrator', text: '{name} missed Silky very much. But the toys were here to cheer everyone up.' },
    cheer: { who: 'toySoldier', text: 'Chin up! Watch my soldiers march. Left, right, left, right!' },
    wind: { who: 'narrator', text: 'Click, click, click. Captain Tin wound his key, and out marched the soldiers.' },
    count: { who: 'toySoldier', text: 'Count our boots in twos! Two, four, six, eight, ten!' },
    glow: { who: 'hero', text: 'Look! Silky’s dewdrop is glowing!' },
    next: { who: 'toySoldier', text: 'Splendid! Now fall in, soldiers. Rows are next!' },
  },

  async play(k: Kit) {
    k.landScene();
    k.music('cosy');
    const tin = k.character('toySoldier', { x: 20, y: 352, z: 20 });
    const hero = k.character('hero', { x: 905, y: 352, z: 20, flip: true });
    const dew = dewdrop(k);
    await k.all(k.enter(tin, 'left'), k.enter(hero, 'right'));
    await k.say('sad');
    await k.say('cheer', tin);

    // ---- Click, click: the key turns and the soldiers march out in a line.
    const soldiers = Array.from({ length: 5 }, (_, i) => k.prop('soldier', { x: 350 + i * 100, y: 610, w: 100, z: 16 }));
    const tags = Array.from({ length: 5 }, (_, i) => k.add(roundTag((i + 1) * 2, i % 2 ? C.goldLight : C.pink, `l8c1-tag-${i}`), { x: 360 + i * 100, y: 520, w: 80, z: 18 }));
    soldiers.forEach((s) => k.set(s, { x: -560, opacity: 1 }));
    tags.forEach((t) => k.set(t, { opacity: 0 }));
    const key = k.pivot(k.part(tin, 'key'));
    const marching = soldiers.map(async (s, i) => {
      await k.wait(900 + i * 450);
      await k.walk(s, 560, 1.4, 4);
    });
    windUp();
    await k.all(k.say('wind'), k.to(key, 1.8, { rotation: 720, ease: 'none' }), ...marching);

    // ---- Boots in twos: each soldier's pair of boots adds two.
    const counting = async () => {
      await k.wait(1500);
      for (let i = 0; i < 5; i++) {
        tick(i);
        void k.hop(soldiers[i], 22, 1);
        await k.appear(tags[i], 0.25);
        await k.wait(420);
      }
    };
    await k.all(k.say('count', tin), counting());

    // ---- Silky's dewdrop shines.
    await k.all(k.say('glow', hero), dew.glow(), k.hop(hero, 24, 1));
    await k.all(k.say('next', tin), ...soldiers.map((s, i) => k.hop(s, 18, 1 + (i % 2))));
    await k.wait(500);
  },
});
