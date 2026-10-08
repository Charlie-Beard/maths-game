/**
 * Land 7, chapter 5: Spell it Backwards.
 *
 * Beth (or Joe, if {name} climbs with Beth) opens the great spellbook: to
 * undo a spell, go back to ten first. A little star-marker hops back along
 * a number line: fifteen take away eight; back five to ten, then back
 * three more to seven (the chapter's bridging back through ten). Turning
 * the page, she finds a torn scrap in spiky red handwriting: "DEAL: ONE
 * FAIRY." The Enchanter snatches it away and says it is nothing. Hint four
 * of Dame Snap: her hand, and a bargain. Next: The Missing Ingredient.
 */
import { buddy, jump, numberTag } from './bits';
import { C, defineStory, type Kit } from './kit';
import { hopArc, lineX, numberLine, rustle, snapSound, spellChime, tornPage } from './spells';

const LX = 190;
const LY = 520;
const LW = 800;

export default defineStory({
  lines: {
    back: { who: 'beth', text: 'To undo a spell, go back to ten first! Fifteen take away eight.' },
    hops: { who: 'narrator', text: 'Fifteen, back five to ten. Then back three more, to seven.' },
    seven: { who: 'narrator', text: 'Fifteen take away eight is seven!' },
    page: { who: 'narrator', text: 'Tucked in the spellbook was a torn page, in spiky red writing.' },
    snatch: { who: 'enchanter', text: 'Give me that! It is nothing! Nothing at all!' },
    hmm: { who: 'beth', text: 'I do not like this one bit. Come on, let us find the Saucepan Man.' },
  },

  async play(k: Kit) {
    // Beth hosts, unless the hero is Beth: then Joe does.
    const host = buddy(k, 'beth', 'joe');
    k.landScene();
    k.music('magic');
    k.ambient('fireflies', { count: 10 });

    const hostEl = k.character(host, { x: 20, y: 230, w: 230, z: 20 });
    const hero = k.character('hero', { x: 930, y: 230, w: 220, z: 20, flip: true });
    k.set([hostEl, hero], { opacity: 0 });
    await k.all(k.enter(hostEl, 'left', 0.8), k.enter(hero, 'right', 0.8));

    const book = k.keepsake('spellbook', { x: 505, y: 180, w: 170, z: 18 });
    k.set(book, { opacity: 0 });
    void k.appear(book, 0.4);
    await k.say('back', hostEl);

    // A number line, with a marker on 15.
    const line = k.add(numberLine('l7c5-line', 5, 15, [7, 10, 15]), { x: LX, y: LY, w: LW, z: 16 });
    k.set(line, { opacity: 0 });
    await k.appear(line, 0.4);
    const px = (n: number) => lineX(LX, LW, 5, 15, n);
    const markY = LY + 80 - 130;
    const marker = k.prop('star', { x: px(15) - 32, y: markY, w: 64, z: 22 });
    k.set(marker, { opacity: 0, scale: 0.4 });
    await k.to(marker, 0.3, { opacity: 1, scale: 1, ease: 'back.out(2)' });
    const told = k.say('hops', hostEl);

    const hop = async (from: number, to: number, label: string, color: string, name: string) => {
      const width = px(from) - px(to);
      const arc = k.add(hopArc(name, width, color), { x: px(to), y: LY + 80 - 40, w: width, z: 17 });
      k.set(arc, { opacity: 0 });
      void k.appear(arc, 0.3);
      spellChime(3);
      await jump(k, marker, px(to) - 32, markY, 50, 0.9);
      const tag = k.add(numberTag(label, color === C.red ? C.pink : C.sky, `l7c5-tag-${label}`), { x: px(to) + width / 2 - 55, y: LY - 60, w: 110, z: 23 });
      void k.pop(tag, 1.2);
      await k.wait(500);
    };
    await k.wait(300);
    await hop(15, 10, '−5', C.red, 'l7c5-arc1');
    await hop(10, 7, '−3', C.blue, 'l7c5-arc2');
    await told;
    k.sparkle(px(7), LY + 60, 14, 120);
    await k.all(k.say('seven'), k.hop(hero, 30, 2));
    await k.wait(300);

    // A torn page falls out of the spellbook.
    const page = k.add(tornPage('l7c5-page', ['DEAL:', 'ONE FAIRY']), { x: 410, y: 120, w: 360, z: 30 });
    k.set(page, { opacity: 0, y: -60 });
    rustle();
    void k.all(k.to(page, 0.8, { opacity: 1, y: 0, ease: 'power2.out' }), k.fade(line, 0.2, 0.5));
    await k.say('page');
    await k.wait(600);

    // The Enchanter grabs it.
    const ench = k.character('enchanter', { x: 660, y: 240, w: 260, z: 32, flip: true });
    snapSound.heels(2, 0.5, 0.3);
    await k.enter(ench, 'right', 0.5);
    rustle();
    void k.to(page, 0.4, { x: 600, y: 140, scale: 0.3, opacity: 0, ease: 'power2.in' });
    await k.all(k.say('snatch', ench), k.shake(ench, 6, 2));
    await k.exit(ench, 'right', 0.6);
    await k.say('hmm', hostEl);
    await k.wait(300);
  },
});
