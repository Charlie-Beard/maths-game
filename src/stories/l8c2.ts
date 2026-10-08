/**
 * Land 8, chapter 2: Soldiers in Rows.
 *
 * "Fall in!" Captain Tin marches three rows of five soldiers onto the
 * nursery floor. A row at a time they stamp into place, and a tag at the end
 * of each row adds it up: five, ten, fifteen (equal groups, and the chapter's
 * "how many altogether?"). The dewdrop glows. Next: The Toy Box.
 */
import { C, defineStory, type Kit } from './kit';
import { numberTag, tick } from './bits';
import { dewdrop } from './toys';

export default defineStory({
  lines: {
    fallin: { who: 'toySoldier', text: 'Fall in! Soldiers, make three rows of five.' },
    rows: { who: 'narrator', text: 'Tramp, tramp. One row of five. Another row of five. And one more row of five.' },
    add: { who: 'toySoldier', text: 'Equal groups! Five, ten, fifteen. How many altogether?' },
    total: { who: 'narrator', text: 'Fifteen soldiers!' },
    proud: { who: 'hero', text: 'I think Silky would be proud of us.' },
    next: { who: 'toySoldier', text: 'Now, what is in that big toy box? Let us look!' },
  },

  async play(k: Kit) {
    k.landScene();
    k.music('cosy');
    const tin = k.character('toySoldier', { x: 20, y: 352, z: 20 });
    const hero = k.character('hero', { x: 905, y: 352, z: 20, flip: true });
    const dew = dewdrop(k);
    await k.all(k.enter(tin, 'left'), k.enter(hero, 'right'));
    await k.say('fallin', tin);

    // ---- Three rows of five, one row at a time.
    const ROW_Y = [520, 610, 700];
    const rows = ROW_Y.map((y) => Array.from({ length: 5 }, (_, i) => k.prop('soldier', { x: 340 + i * 96, y, w: 88, z: 16 })));
    const sums = [5, 10, 15].map((n, r) => k.add(numberTag(String(n), [C.pink, C.goldLight, C.sky][r], `l8c2-tag-${n}`), { x: 820, y: ROW_Y[r] + 4, w: 90, z: 18 }));
    rows.flat().forEach((s) => k.set(s, { opacity: 0 }));
    sums.forEach((t) => k.set(t, { opacity: 0 }));
    const filling = async () => {
      await k.wait(500);
      for (let r = 0; r < 3; r++) {
        k.fx.patter(5, 0.1);
        await k.all(...rows[r].map((s, i) => k.wait(i * 90).then(() => k.enter(s, 'left', 0.5))));
        tick(r * 2);
        await k.appear(sums[r], 0.3);
        await k.wait(500);
      }
    };
    await k.all(k.say('rows'), filling());

    // ---- Adding the equal groups.
    await k.all(k.say('add', tin), ...sums.map((t, i) => k.wait(1400 + i * 600).then(() => k.pop(t, 1.25))));
    await k.say('total');
    void k.all(...rows.flat().map((s, i) => k.wait((i % 5) * 60).then(() => k.hop(s, 16, 1))));
    await k.all(k.say('proud', hero), dew.glow());
    await k.say('next', tin);
    await k.wait(400);
  },
});
