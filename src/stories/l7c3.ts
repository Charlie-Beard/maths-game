/**
 * Land 7, chapter 3: Make Ten Magic.
 *
 * Moon-Face shows his best trick on a big paper ten frame: eight stars
 * sit in it, five more wait below. Don't count on from eight: fill the ten
 * first! Two stars hop across to fill the frame, and three are left over:
 * ten and three make thirteen, so eight and five make thirteen (the
 * chapter's bridging through ten). Then he reaches into his magic hat for
 * a prize and pulls out a black feather. The heels clack, nearer now.
 * Hint three of Dame Snap: her crows, and her steps. Next: The Potion
 * Bottles.
 */
import { sumStrip } from './bits';
import { defineStory, type Kit } from './kit';
import { cell, plink, rustle, snapSound, spellChime, tenFrame } from './spells';

const FX = 300;
const FY = 290;

export default defineStory({
  lines: {
    trick: { who: 'moonface', text: 'Here is my best trick. Fill the ten first, then add the rest!' },
    eight: { who: 'narrator', text: 'Eight stars in the ten frame, and five more. Two hop in to make ten!' },
    thirteen: { who: 'narrator', text: 'Ten, and three left over, makes thirteen. Eight and five is thirteen!' },
    feather: { who: 'narrator', text: 'Moon-Face reached into his magic hat, and pulled out a black feather.' },
    notmine: { who: 'moonface', text: 'That is not part of the trick! Who put that there?' },
    ask: { who: 'hero', text: 'Clack, clack. Someone is coming. Let us ask the Enchanter about the potions.' },
  },

  async play(k: Kit) {
    k.landScene();
    k.music('magic');
    k.ambient('fireflies', { count: 10 });

    const mf = k.character('moonface', { x: 20, y: 290, w: 250, z: 20 });
    const hero = k.character('hero', { x: 930, y: 290, w: 230, z: 20, flip: true });
    k.set([mf, hero], { opacity: 0 });
    await k.all(k.enter(mf, 'left', 0.8), k.enter(hero, 'right', 0.8));

    const frame = k.add(tenFrame('l7c3-frame'), { x: FX, y: FY, w: 560, z: 16 });
    k.set(frame, { opacity: 0 });
    void k.appear(frame, 0.4);
    await k.say('trick', mf);

    // Eight in the frame, five waiting underneath.
    const inFrame = Array.from({ length: 8 }, (_, i) => {
      const [cx, cy] = cell(FX, FY, i);
      return k.prop('star', { x: cx - 40, y: cy - 40, w: 80, z: 18 });
    });
    const waiting = Array.from({ length: 5 }, (_, i) => k.prop('star', { x: 330 + i * 100, y: 580, w: 80, z: 18 }));
    [...inFrame, ...waiting].forEach((s) => k.set(s, { opacity: 0, scale: 0.3 }));
    const told = k.say('eight', mf);
    for (const [i, s] of [...inFrame, ...waiting].entries()) {
      void k.to(s, 0.25, { opacity: 1, scale: 1, ease: 'back.out(2)' });
      plink(i);
      await k.wait(150);
    }
    await k.wait(300);

    // Two hop across to fill the ten.
    for (const [j, s] of waiting.slice(0, 2).entries()) {
      const [cx, cy] = cell(FX, FY, 8 + j);
      const bx = parseFloat(s.style.left);
      const by = parseFloat(s.style.top);
      spellChime(3);
      await k.all(
        k.to(s, 0.35, { x: cx - 40 - bx, ease: 'none' }),
        k.to(s, 0.175, { y: cy - 40 - by - 70, ease: 'power2.out' }).then(() => k.to(s, 0.175, { y: cy - 40 - by, ease: 'power2.in' })),
      );
      await k.wait(150);
    }
    k.sparkle(FX + 280, FY + 125, 18, 240);
    await told;

    // Ten, and three more.
    const sum = k.add(sumStrip('8 + 5 = 13', 'l7c3-sum'), { x: 830, y: 585, w: 290, z: 22 });
    k.set(sum, { opacity: 0 });
    void k.appear(sum, 0.4);
    await k.all(k.say('thirteen', mf), k.hop(mf, 30, 2));
    await k.wait(300);

    // The prize from the hat is a black feather.
    const dim = k.dim(0, '#0b0818');
    void k.fade(dim, 0.25, 0.8);
    k.keepsake('magicHat', { x: 190, y: 470, w: 150, z: 24 });
    const feather = k.add(
      `<svg viewBox="0 0 60 160" xmlns="http://www.w3.org/2000/svg"><path d="M30 6 C58 40 52 110 30 154 C8 110 2 40 30 6Z" fill="#1c1822"/><path d="M30 14 L30 154" stroke="#4c4560" stroke-width="3" fill="none"/></svg>`,
      { x: 240, y: 470, w: 54, z: 25 },
    );
    k.set(feather, { opacity: 0 });
    const told2 = k.say('feather', mf);
    rustle();
    await k.appear(feather, 0.4);
    await k.to(feather, 2.6, { y: -80, x: 80, rotation: 40, ease: 'sine.inOut' });
    await told2;
    snapSound.heels(5, 0.42, 0.6);
    await k.all(k.say('notmine', mf), k.shake(mf, 6, 2));
    await k.say('ask', hero);
    await k.wait(300);
  },
});
