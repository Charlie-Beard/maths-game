/**
 * Land 12, chapter 2: Three Beats to a Bar.
 *
 * The Saucepan Man has come for a chocolate bar. {name} puts him right:
 * a bar of MUSIC, three beats in it. He hears "beetroots", then "beats",
 * and plays them on his saucepans: four bars of three pans, clang, ting,
 * ting, counted in threes (3, 6, 9, 12), the chapter's counting in 3s.
 * Mr Oom Boom Boom shouts "Bravo!" and gives {name} a little triangle.
 * Then from across the land the trumpet flowers start tooting.
 * Next: Trumpets in Threes.
 */
import { C, defineStory, type Kit } from './kit';
import { buddy, roundTag } from './bits';
import { beat, boom, clank, musicSheet, panTrio, ting } from './music';

export default defineStory({
  lines: {
    bar: { who: 'hero', text: 'Not a chocolate bar! A bar of music. Three beats: one, two, three!' },
    beets: { who: 'saucepan', text: 'Three BEETROOTS? Oh, BEATS! I can play beats on my saucepans!' },
    play: { who: 'narrator', text: 'Clang, ting, ting! Four bars of three beats. Three, six, nine, twelve!' },
    bravo: { who: 'oomboom', text: 'Bravo! A little triangle for you, {name}. Ting!' },
    next_joe: { who: 'joe', text: 'Listen! The trumpet flowers are tooting. In threes, of course!' },
    next_beth: { who: 'beth', text: 'Listen! The trumpet flowers are tooting. In threes, of course!' },
  },

  async play(k: Kit) {
    k.landScene();
    k.music('cosy');
    const pan = k.character('saucepan', { x: 30, y: 352, z: 20 });
    const hero = k.character('hero', { x: 900, y: 352, z: 20, flip: true });
    clank(5);
    await k.all(k.enter(pan, 'left'), k.enter(hero, 'right'));
    await k.all(k.say('bar', hero), k.shake(pan, 6, 1));
    clank(3);
    await k.all(k.say('beets', pan), k.hop(pan, 26, 2));

    // ---- Four bars of three saucepans: clang (the big one), ting, ting.
    k.silence();
    const SPOTS: [number, number][] = [
      [310, 96],
      [600, 96],
      [310, 246],
      [600, 246],
    ];
    const sheet = k.add(musicSheet(600, 300, 'l12c2-sheet'), { x: 292, y: 70, z: 21, still: true });
    k.set(sheet, { opacity: 0 });
    await k.fade(sheet, 1, 0.3);
    const rows = SPOTS.map(([x, y], i) => {
      const el = k.add(panTrio(`l12c2-pans-${i}`), { x, y, w: 210, z: 22 });
      k.set(el, { opacity: 0 });
      return el;
    });
    const tags: HTMLElement[] = [];
    const playing = async () => {
      for (let i = 0; i < rows.length; i++) {
        await k.appear(rows[i], 0.3);
        for (let b = 0; b < 3; b++) {
          if (b === 0) clank(1);
          else ting();
          beat(b);
          void k.to(k.part(pan, 'pots'), 0.1, { rotation: b % 2 ? 5 : -5, yoyo: true, repeat: 1 });
          await k.pop(rows[i], 1.06);
          await k.wait(150);
        }
        const [x, y] = SPOTS[i];
        const tag = k.add(roundTag((i + 1) * 3, C.goldLight, `l12c2-tag-${i}`), { x: x + 214, y: y + 24, w: 70, z: 24 });
        k.set(tag, { opacity: 0 });
        tags.push(tag);
        k.fx.pop();
        await k.appear(tag, 0.25);
        await k.wait(200);
      }
    };
    await playing();
    k.music('triumph');
    await k.all(k.say('play'), k.hop(hero, 30, 2), k.pop(tags[3], 1.25));
    await k.all(...[sheet, ...rows, ...tags].map((el) => k.fade(el, 0, 0.4)));

    // ---- Bravo! Mr Oom Boom Boom, with a little triangle.
    const oom = k.character('oomboom', { x: 450, y: 390, w: 250, z: 24 });
    boom(2, 0.3);
    await k.enter(oom, 'bottom', 0.7);
    const tri = k.keepsake(k.chapter?.keepsake ?? 'triangleBell', { x: 480, y: 150, w: 170, z: 30 });
    k.set(tri, { opacity: 0 });
    const giving = async () => {
      await k.appear(tri, 0.4);
      ting();
      k.sparkle(565, 230, 12, 120);
      await k.wait(1200);
      ting();
      await k.to(tri, 0.8, { x: 300, y: 80, scale: 0.7, rotation: 8, ease: 'power2.inOut' });
    };
    await k.all(k.say('bravo', oom), giving());

    // ---- Toot, toot: the trumpet flowers, across the land.
    const sib = buddy(k, 'joe', 'beth');
    const friend = k.character(sib, { x: 30, y: 352, z: 26 });
    await k.all(k.exit(pan, 'left', 0.5), k.fade(tri, 0, 0.4));
    await k.enter(friend, 'left', 0.6);
    await k.all(k.say(`next_${sib}`, friend), k.hop(friend, 24, 2));
    await k.wait(500);
  },
});
