/**
 * Land 6, chapter 7: The Giant's Buttons.
 *
 * Fran (or Beth, if he climbs with Fran) has found two heaps of the
 * giant's buttons ("as big as tables" in the chapter's intro). The left heap is two
 * rows of ten and seven more (27); the right is three rows of ten and five
 * more (35). Count the tens first: three tens beat two tens, so 35 is more
 * than 27 (the chapter's comparing, and tens and ones). Then a great face
 * peers in: "Little crumbs! Come here, crumbs!" He thinks they are
 * crumbs, and he only wants to give them a biscuit, but he is HUGE. Quick:
 * hide in the teacup! Next: Hide in the Teacup! (the finale).
 */
import { C, defineStory, type Kit } from './kit';
import { buddy, tick } from './bits';
import { countTag, giantHead, meadow, peek, popRow, strip } from './giants';

export default defineStory({
  lines: {
    ask_fran: { who: 'fran', text: 'Look at all the giant’s buttons! Which pile has more?' },
    ask_beth: { who: 'beth', text: 'Look at all the giant’s buttons! Which pile has more?' },
    count: { who: 'narrator', text: 'Count the tens first. Two tens and seven. Three tens and five.' },
    more: { who: 'hero', text: 'Three tens beat two tens. Thirty-five is more than twenty-seven!' },
    crumbs: { who: 'giant', text: 'Ooh! Little crumbs! Talking crumbs! Come here, crumbs, I have a biscuit!' },
    run_fran: { who: 'fran', text: 'He thinks we’re crumbs! Quick, hide in the giant’s teacup!' },
    run_beth: { who: 'beth', text: 'He thinks we’re crumbs! Quick, hide in the giant’s teacup!' },
  },

  async play(k: Kit) {
    // Fran hosts, unless the hero is Fran: then Beth does.
    const host = buddy(k, 'fran', 'beth');
    k.backdrop(meadow('l6c7-meadow'));
    k.music('cosy');

    const hostEl = k.character(host, { x: 390, y: 330, w: 200, z: 20 });
    const hero = k.character('hero', { x: 600, y: 330, w: 200, z: 20, flip: true });
    await k.all(k.enter(hostEl, 'bottom'), k.enter(hero, 'bottom', 0.8));
    await k.say(`ask_${host}`, hostEl);

    // ---- Two heaps: rows of ten buttons, then the odd ones.
    const heap = async (x: number, tens: number, ones: number, label: string, color: string, startTick: number) => {
      for (let r = 0; r < tens; r++) await popRow(k, 'button', 10, x, 150 + r * 52, 36, 44, { startTick, gap: 35 });
      await popRow(k, 'button', ones, x, 150 + tens * 52, 36, 44, { startTick, gap: 60 });
      const t = k.add(countTag(label, color, `l6c7-tag-${label}`), { x: x + 130, y: 150 + (tens + 1) * 52 + 4, w: 90, z: 22 });
      await k.appear(t, 0.25);
    };
    const counting = async () => {
      await k.wait(300);
      await heap(30, 2, 7, '27', C.sky, 0);
      await k.wait(300);
      await heap(790, 3, 5, '35', C.pink, 2);
    };
    await k.all(k.say('count'), counting());

    const card = k.add(strip('35 > 27', C.leafLight, 'l6c7-card'), { x: 400, y: 560, z: 25 });
    k.set(card, { opacity: 0 });
    await k.all(k.say('more', hero), k.appear(card, 0.4));
    tick(8);
    void k.hop(hero, 36, 2);
    await k.wait(300);

    // ---- A great face peers in: he thinks they are crumbs.
    k.music('adventure');
    void k.fade(card, 0, 0.3);
    const giant = giantHead(k, { x: 440, y: -150, w: 320 });
    k.set(giant, { opacity: 0 });
    await peek(k, giant);
    void k.shake(hostEl, 6, 2);
    void k.shake(hero, 6, 2);
    await k.say('crumbs', giant);
    k.fx.stomp(2, 0.4);
    void k.quake(6);
    await k.say(`run_${host}`, hostEl);
    await k.wait(300);
  },
});
