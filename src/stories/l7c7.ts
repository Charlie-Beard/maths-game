/**
 * Land 7, chapter 7: Story Spells.
 *
 * Fran (or Beth, if {name} climbs with Fran) reads the spellbook's
 * stories aloud. Thirteen lanterns glowed in the tower; five blew out.
 * "Blew out" means take away: thirteen take away five leaves eight (the
 * chapter's word problems). Then the quill starts to write by itself, in
 * spiky red letters: "ONE LANTERN. ONE FAIRY." Silky flutters in, puzzled.
 * The tower dims, a cage-shaped lantern is lowered on its chain, and the
 * heels clack louder and louder, closer and closer, and then stop, right
 * behind them. Dame Snap is not seen: this is the build-up, with dread
 * and no fright. Next: Silky is Taken!
 */
import { buddy, sting, sumStrip } from './bits';
import { defineStory, type Kit } from './kit';
import { cageLantern, plink, rulerShadow, rustle, snapSound, tornPage } from './spells';

export default defineStory({
  lines: {
    read: { who: 'fran', text: 'The spellbook tells stories. Is it add, or take away? Listen.' },
    story: { who: 'narrator', text: 'Thirteen lanterns glowed in the tower. Five blew out. How many still glow?' },
    answer: { who: 'narrator', text: 'Blew out means take away. Thirteen take away five leaves eight!' },
    quill: { who: 'narrator', text: 'Then the quill began to write all by itself, in spiky red letters.' },
    silky: { who: 'silky', text: 'Why is everyone staring? What lantern? What fairy?' },
    stop: { who: 'narrator', text: 'The clacking came closer and closer. Then it stopped. Right behind them.' },
  },

  async play(k: Kit) {
    // Fran hosts, unless the hero is Fran: then Beth does.
    const host = buddy(k, 'fran', 'beth');
    k.landScene();
    k.music('magic');
    k.ambient('fireflies', { count: 8 });
    const dim = k.dim(0.1, '#0b0818');

    const hostEl = k.character(host, { x: 20, y: 110, w: 230, z: 20 });
    const hero = k.character('hero', { x: 930, y: 110, w: 220, z: 20, flip: true });
    k.set([hostEl, hero], { opacity: 0 });
    await k.all(k.enter(hostEl, 'left', 0.8), k.enter(hero, 'right', 0.8));

    const book = k.keepsake('spellbook', { x: 505, y: 80, w: 170, z: 18 });
    k.set(book, { opacity: 0 });
    void k.appear(book, 0.4);
    await k.say('read', hostEl);

    // Thirteen lanterns, as stars: seven in the top row, six below.
    const lights = Array.from({ length: 13 }, (_, i) => {
      const row = i < 7 ? 0 : 1;
      const col = i < 7 ? i : i - 7;
      return k.prop('star', { x: 330 + col * 76 + row * 38, y: 290 + row * 90, w: 66, z: 18 });
    });
    lights.forEach((s) => k.set(s, { opacity: 0, scale: 0.3 }));
    const told = k.say('story', hostEl);
    for (const [i, s] of lights.entries()) {
      void k.to(s, 0.25, { opacity: 1, scale: 1, ease: 'back.out(2)' });
      plink(i);
      await k.wait(160);
    }
    await told;
    await k.wait(300);

    // Five blow out and drift away: take away.
    const answer = k.say('answer', hostEl);
    for (const s of lights.slice(8)) {
      void k.to(s, 1.4, { opacity: 0, y: -50, ease: 'sine.in' });
      await k.wait(300);
    }
    const sum = k.add(sumStrip('13 − 5 = 8', 'l7c7-sum'), { x: 430, y: 500, w: 320, z: 22 });
    k.set(sum, { opacity: 0 });
    await k.appear(sum, 0.4);
    k.sparkle(590, 380, 14, 200);
    await answer;
    await k.all(k.hop(hostEl, 30, 2), k.hop(hero, 30, 2));
    await k.wait(400);

    // The quill writes by itself. The tower grows dim.
    void k.fade(dim, 0.5, 2.5);
    const page = k.add(tornPage('l7c7-page', ['ONE LANTERN.', 'ONE FAIRY.']), { x: 390, y: 120, w: 400, z: 30 });
    k.set(page, { opacity: 0 });
    rustle();
    const wrote = k.say('quill');
    await k.fade(page, 1, 1.2);
    const quill = k.keepsake('quill', { x: 760, y: 150, w: 130, z: 31 });
    void k.hop(quill, 20, 3);
    snapSound.heels(3, 0.45, 0.5);
    await wrote;

    // Silky flutters in, puzzled.
    const silky = k.character('silky', { x: 80, y: 420, w: 220, z: 24 });
    k.set(silky, { opacity: 0 });
    void k.enter(silky, 'left', 0.7);
    await k.all(k.say('silky', silky), k.hop(silky, 20, 1));
    await k.wait(300);

    // A cage-shaped lantern is lowered on its chain; the heels grow loud.
    const cage = k.add(cageLantern('l7c7-cage'), { x: 490, y: -480, w: 200, z: 28 });
    snapSound.heels(8, 0.38, 1);
    void k.vanish(page, 0.8);
    void k.to(cage, 3.4, { y: 390, ease: 'sine.out' });
    const sh = k.add(rulerShadow('l7c7-ruler'), { x: 1200, y: 560, w: 560, z: 29, still: true });
    void k.to(sh, 3.4, { x: -820, ease: 'sine.out' });
    await k.wait(2200);
    void k.camera({ zoom: 1.25, x: 590, y: 200 }, 2.2);
    await k.wait(1400);
    k.silence();
    await k.wait(900);
    sting();
    await k.say('stop');
    await k.wait(900);
  },
});
