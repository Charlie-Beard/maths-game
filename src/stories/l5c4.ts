/**
 * Land 5, chapter 4: Party Bags.
 *
 * Now everyone knows it's his birthday, so there are party bags to fill.
 * Beth (or Joe, if he climbs with Beth) drops eight toffees into a tray of
 * two rows of ten; the hero adds seven more: two fill the row to ten, and
 * five start the next. Ten and five make fifteen (the chapter's adding
 * within 20, by making ten). Whoosh, into the party bag! Up pops the Angry
 * Pixie, cross as ever… until he finds the bag is for him. "THANK YOU
 * VERY MUCH!" Then music: the Saucepan Man is playing musical chairs.
 * Next: Musical Chairs.
 */
import { balloon, bunting, hills, sceneSvg, sky } from '../art/lands/common';
import { C, circle, defineStory, noiseBurst, now, piece, rect, svg, tone, type Kit } from './kit';
import { numberTag } from './bits';

// ------------------------------------------------------------------ sounds

/** A toffee dropping into the tray: a soft woody plink, a little higher each time. */
function plink(n: number): void {
  const t = now();
  const f = 520 + (n % 10) * 40;
  tone(f, t, { wave: 'triangle', peak: 0.08, attack: 0.003, decay: 0.09, glideTo: f * 0.8 });
  noiseBurst(t, { freq: 2200, q: 3, peak: 0.025, decay: 0.03 });
}

/** Sweets rattling into a paper bag. */
function rustleIn(): void {
  const t = now();
  for (let i = 0; i < 9; i++) noiseBurst(t + i * 0.045, { freq: 2600 + (i % 3) * 500, q: 2, peak: 0.04, decay: 0.05 });
  noiseBurst(t, { freq: 1500, q: 0.7, peak: 0.05, attack: 0.05, decay: 0.4 });
}

/** A party blower toot (soft). */
function blower(): void {
  const t = now();
  tone(350, t, { wave: 'sawtooth', peak: 0.05, attack: 0.04, decay: 0.5, glideTo: 500, vibrato: [24, 16], lowpass: 1500 });
}

// --------------------------------------------------------------------- art

const FLAGS = [C.red, C.gold, C.blue, C.green, C.pink, C.purple];

/** The party lawn with the sweet table running across the front. */
function sweetTable(): string {
  return sceneSvg('l5c4-table', [
    ...sky([
      ['#f3d79a', 0],
      ['#f6e3b6', 260],
      ['#f8ead0', 420],
    ]),
    hills(470, 40, '#e9c98a', 541),
    ...bunting([-20, 60], [600, 50], 70, FLAGS, 30),
    ...bunting([580, 50], [1200, 64], 70, FLAGS, 30),
    ...balloon(110, 200, 40, C.green, 170),
    ...balloon(1070, 190, 40, C.red, 180),
    hills(560, 24, '#9cbf6a', 542, { step: 80 }),
    piece(rect(-20, 600, 1220, 240), C.white, { rough: 0.6 }),
    ...Array.from({ length: 15 }, (_, i) => piece(rect(-20 + i * 85, 600, 42, 240), C.sky, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 })),
  ]);
}

/** A tray with two rows of ten dents, for counting in tens. */
function tray(): string {
  const dents = [];
  for (let r = 0; r < 2; r++) for (let i = 0; i < 10; i++) dents.push(piece(circle(47 + i * 54, 44 + r * 62, 20), C.woodShade, { edge: 'cut', fibre: false, shadow: false, opacity: 0.45 }));
  return svg({ w: 580, h: 150, name: 'l5c4-tray' }, [piece(rect(6, 6, 568, 138, 14), C.wood, { rough: 0.7 }), piece(rect(16, 16, 548, 118, 10), C.tan, { edge: 'cut', fibre: false, shadow: false }), ...dents]);
}

// ------------------------------------------------------------------- story

export default defineStory({
  lines: {
    eight_beth: { who: 'beth', text: 'Party bags for everyone! Eight toffees in this one.' },
    eight_joe: { who: 'joe', text: 'Party bags for everyone! Eight toffees in this one.' },
    seven: { who: 'hero', text: 'And seven more from me! How many altogether?' },
    sum: { who: 'narrator', text: 'Two more make ten… and five more. Ten and five make fifteen toffees!' },
    pixie: { who: 'pixie', text: 'What’s all this noise? A party bag? For ME? Oh… THANK YOU VERY MUCH!' },
    next_beth: { who: 'beth', text: 'Hear that music? The Saucepan Man is playing musical chairs!' },
    next_joe: { who: 'joe', text: 'Hear that music? The Saucepan Man is playing musical chairs!' },
  },

  async play(k: Kit) {
    // Beth hosts, unless the hero is Beth: then Joe does.
    const host = k.hero === 'beth' ? 'joe' : 'beth';
    k.backdrop(sweetTable());
    k.music('cosy');

    const hostEl = k.character(host, { x: 30, y: 350, z: 20 });
    const hero = k.character('hero', { x: 890, y: 350, z: 20, flip: true });
    const TX = 300;
    const TY = 170;
    const trayEl = k.add(tray(), { x: TX, y: TY, w: 580, z: 12 });
    k.set(trayEl, { opacity: 0 });
    await k.all(k.enter(hostEl, 'left'), k.enter(hero, 'right'));
    k.fx.pop();
    await k.appear(trayEl, 0.35);

    // Slot i: the first row of ten, then the second.
    const slot = (i: number): [number, number] => [TX + 47 + (i % 10) * 54 - 27, TY + 44 + Math.floor(i / 10) * 62 - 27];
    const sweets: HTMLElement[] = [];
    const drop = async (i: number, fromX: number) => {
      const [x, y] = slot(i);
      const s = k.prop('toffee', { x, y, w: 54, z: 14 });
      k.set(s, { x: fromX - x, y: 200, scale: 0.6 });
      sweets.push(s);
      await k.to(s, 0.3, { x: 0, y: 0, scale: 1, ease: 'power2.out' });
      plink(i);
    };

    const eight = k.add(numberTag('8', C.goldLight, 'l5c4-tag-eight'), { x: TX + 160, y: TY - 82, w: 96, z: 16 });
    const seven = k.add(numberTag('7', C.sky, 'l5c4-tag-seven'), { x: TX + 420, y: TY - 82, w: 96, z: 16 });
    const fifteen = k.add(numberTag('15', C.pink, 'l5c4-tag-fifteen'), { x: TX + 230, y: TY - 90, w: 120, z: 17 });
    [eight, seven, fifteen].forEach((t) => k.set(t, { opacity: 0 }));

    // ---- Eight from the host.
    const hostDrops = async () => {
      for (let i = 0; i < 8; i++) {
        void drop(i, 160);
        await k.wait(190);
      }
      await k.appear(eight, 0.3);
    };
    await k.all(k.say(`eight_${host}`, hostEl), hostDrops());

    // ---- Seven more from the hero: two fill the row, five start the next.
    await k.say('seven', hero);
    const heroDrops = async () => {
      for (let i = 8; i < 15; i++) {
        void drop(i, 1020);
        await k.wait(i === 9 ? 700 : 260);
      }
      await k.appear(seven, 0.3);
      await k.wait(400);
      k.sfx.sparkle();
      void k.fade(eight, 0, 0.3);
      void k.fade(seven, 0, 0.3);
      await k.appear(fifteen, 0.4);
    };
    await k.all(k.say('sum'), heroDrops());

    // ---- Whoosh! Into the party bag.
    const bag = k.keepsake(k.chapter!.keepsake, { x: 510, y: 420, w: 160, z: 18 });
    k.set(bag, { opacity: 0 });
    await k.appear(bag, 0.35);
    k.fx.whizz();
    await k.all(
      ...sweets.map((s, i) => k.to(s, 0.4 + i * 0.02, { x: 590 - 27 - parseFloat(s.style.left), y: 500 - 27 - parseFloat(s.style.top), scale: 0.3, opacity: 0, ease: 'power2.in' })),
      k.fade(trayEl, 0, 0.5),
      k.fade(fifteen, 0, 0.5),
    );
    rustleIn();
    await k.pop(bag, 1.15);

    // ---- Up pops the Angry Pixie, very cross… then very pleased.
    const pixie = k.character('pixie', { x: 445, y: 280, w: 290, z: 15 });
    k.set(pixie, { y: 420 });
    const puff = k.part(pixie, 'puff');
    k.fx.boing();
    await k.all(k.to(pixie, 0.4, { y: 0, ease: 'back.out(1.6)' }), k.to(bag, 0.4, { y: 90, ease: 'power2.out' }));
    void k.shake(pixie, 6, 2);
    const talk = (async () => {
      await k.wait(1300);
      // The bag is for HIM: the cross lines melt away.
      k.set(puff, { opacity: 0 });
      await k.hop(pixie, 30, 1);
      blower();
      await k.pop(bag, 1.2);
    })();
    await k.all(k.say('pixie', pixie), talk);
    k.sparkle(590, 560, 14, 140);

    // ---- Musical chairs next.
    k.fx.jingle();
    k.confetti(18);
    await k.all(k.say(`next_${host}`, hostEl), k.hop(hero, 30, 2), k.hop(pixie, 20, 2));
    await k.wait(700);
  },
});
