/**
 * Land 14, chapter 6: Clank! Clank!
 *
 * Deep in the dark, Silky's glow-worm lights up four tunnels, each with a
 * number over it: 10, 20, ?, 40. One has lost its number. Counting in
 * tens, {name} finds it: 30 (the chapter's missing numbers to 100), and
 * the clanking comes from tunnel thirty. Cut inside: a goblin cage hangs
 * from the roof, and in it, the Saucepan Man! He mishears, of course ("a
 * biscuit?"). The glow-worm in its jar is the keepsake. But the cage has a
 * great iron padlock on it. Next: The Saucepan Man is Free!
 */
import { C, defineStory, type Kit } from './kit';
import { numberTag, tick } from './bits';
import { cageBack, cageFront, cave, goblinSound, padlock, tunnelArt } from './goblinCave';

const TUNNELS = [150, 400, 650, 900];
const SIGNS = ['10', '20', '?', '40'];

export default defineStory({
  lines: {
    signs: { who: 'silky', text: 'Four tunnels. Ten, twenty… and this one has lost its number.' },
    missing: { who: 'hero', text: 'Ten, twenty, thirty, forty! The missing number is thirty!' },
    clank: { who: 'narrator', text: 'And the clanking came from tunnel thirty. Clank, clank, CLANK!' },
    teapot: { who: 'saucepan', text: 'EH? Who’s there? Go away, goblins! I’m NOT a teapot!' },
    us: { who: 'hero', text: 'It’s us! We’ve come to rescue you!' },
    rescue: { who: 'saucepan', text: 'EH? A BISCUIT? Oh, a RESCUE! Hooray! But they’ve locked me in…' },
  },

  async play(k: Kit) {
    cave(k, { dim: 0.5, color: '#0b0606' });
    k.music('sneaky');

    // Four tunnels along the back, and a sign over each.
    TUNNELS.forEach((x, i) => k.add(tunnelArt(`l14c6-t${i}`), { x: x - 80, y: 210, w: 160, z: 8 }));
    const signs = TUNNELS.map((x, i) => {
      const s = k.add(numberTag(SIGNS[i], C.sand, `l14c6-s${i}`), { x: x - 55, y: 150, w: 110, z: 12 });
      k.set(s, { opacity: 0 });
      return s;
    });

    // Silky's glow-worm lights the way.
    const silky = k.character('silky', { x: 880, y: 380, w: 220, z: 36 });
    const jar = k.keepsake(k.chapter?.keepsake ?? 'glowWorm', { x: 860, y: 520, w: 100, z: 37 });
    const glow = k.light(910, 300, 260, { color: '#d8f59a', strength: 0.45, z: 35 });
    const hero = k.character('hero', { x: 30, y: 420, w: 220, z: 36 });
    k.float(silky, 8, 2.2);
    await k.all(k.enter(silky, 'right'), k.enter(jar, 'right'), k.enter(hero, 'left'));
    k.fx.twinkle();

    // Tunnel by tunnel the light finds the numbers.
    const lighting = async () => {
      for (const [i, s] of signs.entries()) {
        await k.to(glow, 0.6, { x: TUNNELS[i] - 910, ease: 'sine.inOut' });
        await k.appear(s, 0.3);
        await k.wait(250);
      }
    };
    await k.all(k.say('signs', silky), lighting());

    // Ten, twenty, thirty, forty: the missing one is thirty.
    const counting = async () => {
      for (const [i, s] of signs.entries()) {
        tick(i);
        await k.pop(s, 1.2);
        await k.wait(i === 2 ? 450 : 300);
      }
      const thirty = k.add(numberTag('30', C.goldLight, 'l14c6-30'), { x: TUNNELS[2] - 55, y: 150, w: 110, z: 13 });
      k.set(thirty, { opacity: 0 });
      void k.fade(signs[2], 0, 0.25);
      await k.appear(thirty, 0.35);
      goblinSound.ding(3);
      k.sparkle(TUNNELS[2], 190, 14, 120);
    };
    await k.all(k.say('missing', hero), counting());

    // Clank, clank, CLANK, from tunnel thirty.
    goblinSound.clank(3);
    void k.to(glow, 0.6, { x: TUNNELS[2] - 910 });
    await k.all(k.say('clank'), k.camera({ zoom: 1.8, x: TUNNELS[2], y: 280 }, 1.6));

    // ---- Inside: a goblin cage hangs from the roof, and in it…
    let sauce!: HTMLElement;
    let h2!: HTMLElement;
    let s2!: HTMLElement;
    let lock!: HTMLElement;
    await k.cut(() => {
      cave(k, { dim: 0.42, color: '#0b0606' });
      k.light(590, 300, 300, { color: '#d8f59a', strength: 0.32, z: 35 });
      k.add(cageBack('l14c6-back'), { x: 460, y: 40, w: 260, z: 14 });
      sauce = k.character('saucepan', { x: 490, y: 150, w: 200, z: 15 });
      k.add(cageFront('l14c6-front'), { x: 460, y: 40, w: 260, z: 16 });
      lock = k.add(padlock('l14c6-lock'), { x: 555, y: 250, w: 70, z: 17 });
      h2 = k.character('hero', { x: 60, y: 420, w: 230, z: 36 });
      s2 = k.character('silky', { x: 870, y: 380, w: 220, z: 36 });
      k.keepsake(k.chapter?.keepsake ?? 'glowWorm', { x: 850, y: 520, w: 100, z: 37 });
    });
    k.float(s2, 8, 2.2);
    goblinSound.clank(4);
    void k.shake(sauce, 6, 3);
    await k.say('teapot', sauce);
    await k.all(k.say('us', h2), k.hop(h2, 30, 2));
    goblinSound.clank(2);
    await k.all(k.say('rescue', sauce), k.hop(sauce, 16, 2));
    // The padlock rattles: still locked.
    goblinSound.clink();
    await k.shake(lock, 4, 2);
    await k.wait(600);
  },
});
