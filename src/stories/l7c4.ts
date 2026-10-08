/**
 * Land 7, chapter 4: The Potion Bottles.
 *
 * The Enchanter lines his potions up on a ten-frame shelf: nine bottles
 * are in, six more wait. He is grumpy about it ("not too many!"), but the
 * trick is the same: one hops across to fill the ten, five are left, and
 * nine and six make fifteen (the chapter's bridging through ten, with
 * bottles). Then the hint: one bottle wears a spiky red label, "D.S." He
 * whips it behind his robe and says it is for a very bossy customer. A
 * hunch only; {name} wonders who D.S. is. Next: Spell it Backwards.
 */
import { sumStrip } from './bits';
import { C, defineStory, piece, raw, rect, svg, type Kit } from './kit';
import { cell, plink, spellChime, tenFrame } from './spells';

const FX = 300;
const FY = 280;

/** A cream luggage label with spiky red capitals on it (150 × 90). */
function spikyLabel(): string {
  return svg({ w: 150, h: 90, name: 'l7c4-label' }, [
    piece(rect(8, 8, 134, 74, 6), C.cream, { rough: 1 }),
    raw(`<text x="75" y="62" text-anchor="middle" font-family="Andika, sans-serif" font-weight="700" font-size="48" fill="#8b1c2c" transform="skewX(-12)" >D.S.</text>`),
  ]);
}

export default defineStory({
  lines: {
    mix: { who: 'enchanter', text: 'Mix the potions. But not too many! Fill the ten first.' },
    nine: { who: 'narrator', text: 'Nine bottles on the shelf, and six more waiting. One hops in to make ten.' },
    fifteen: { who: 'narrator', text: 'Ten, and five left over, makes fifteen. Nine and six is fifteen!' },
    label: { who: 'narrator', text: 'One bottle had a spiky red label. It said D.S.' },
    bossy: { who: 'enchanter', text: 'Not for you! That one is for a customer. A very bossy customer. Hmph!' },
    who: { who: 'hero', text: 'Who is D.S.? Come on, let us learn how to undo a spell.' },
  },

  async play(k: Kit) {
    k.landScene();
    k.music('magic');
    k.ambient('fireflies', { count: 10 });

    const ench = k.character('enchanter', { x: 20, y: 280, w: 260, z: 20 });
    const hero = k.character('hero', { x: 930, y: 290, w: 230, z: 20, flip: true });
    k.set([ench, hero], { opacity: 0 });
    await k.all(k.enter(ench, 'left', 0.8), k.enter(hero, 'right', 0.8));

    const frame = k.add(tenFrame('l7c4-frame', '#d9cfee'), { x: FX, y: FY, w: 560, z: 16 });
    k.set(frame, { opacity: 0 });
    void k.appear(frame, 0.4);
    await k.say('mix', ench);

    const all = [
      ...Array.from({ length: 9 }, (_, i) => {
        const [cx, cy] = cell(FX, FY, i);
        return k.prop('potion', { x: cx - 42, y: cy - 42, w: 84, z: 18 });
      }),
      ...Array.from({ length: 6 }, (_, i) => k.prop('potion', { x: 310 + i * 90, y: 580, w: 84, z: 18 })),
    ];
    all.forEach((p) => k.set(p, { opacity: 0, scale: 0.3 }));
    const told = k.say('nine', ench);
    for (const [i, p] of all.entries()) {
      void k.to(p, 0.25, { opacity: 1, scale: 1, ease: 'back.out(2)' });
      plink(i);
      await k.wait(140);
    }
    await k.wait(300);

    // One bottle hops across to fill the ten.
    const mover = all[9];
    const [cx, cy] = cell(FX, FY, 9);
    const bx = parseFloat(mover.style.left);
    const by = parseFloat(mover.style.top);
    spellChime(4);
    await k.all(
      k.to(mover, 0.4, { x: cx - 42 - bx, ease: 'none' }),
      k.to(mover, 0.2, { y: cy - 42 - by - 80, ease: 'power2.out' }).then(() => k.to(mover, 0.2, { y: cy - 42 - by, ease: 'power2.in' })),
    );
    k.sparkle(FX + 280, FY + 125, 18, 240);
    await told;

    const sum = k.add(sumStrip('9 + 6 = 15', 'l7c4-sum'), { x: 770, y: 585, w: 290, z: 22 });
    k.set(sum, { opacity: 0 });
    void k.appear(sum, 0.4);
    await k.all(k.say('fifteen', ench), k.hop(hero, 30, 2));
    await k.wait(300);

    // One bottle has a spiky red label. He hides it.
    const label = k.add(spikyLabel(), { x: 540, y: 520, w: 150, z: 26 });
    k.set(label, { opacity: 0 });
    const told2 = k.say('label', ench);
    await k.appear(label, 0.5);
    await k.pop(label, 1.2);
    await told2;
    await k.all(k.to(label, 0.5, { x: -330, y: -170, scale: 0.4, opacity: 0, ease: 'power2.in' }), k.say('bossy', ench), k.shake(ench, 6, 2));
    await k.say('who', hero);
    await k.wait(300);
  },
});
