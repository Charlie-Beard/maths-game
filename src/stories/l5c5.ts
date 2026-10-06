/**
 * Land 5, chapter 5: Musical Chairs.
 *
 * The Saucepan Man is in charge of musical chairs, except he heard
 * "musical HAIRS" and turns up in his curliest wig. Not hairs, chairs!
 * Twelve gold chairs: a row of ten and two more. Each time the music
 * stops, a chair pops away: three times. Twelve take away three leaves
 * nine (the chapter's taking away within 20): a row of ten with one gap.
 * Moon-Face calls: he's baked the biggest cake ever. Next: The Biggest
 * Cake.
 */
import { band, bell, C, defineStory, NOTE, noiseBurst, now, piece, raw, rect, svg, tone, type Kit, type Pt } from './kit';
import { balloon, bunting, hills, sceneSvg, sky } from '../art/lands/common';

// ------------------------------------------------------------------ sounds

/** A bouncy oom-pah tune: `beats` beats, then it stops dead. */
function oompah(beats: number, gap = 0.22): void {
  const t = now();
  const tune = [NOTE.G4, NOTE.C5, NOTE.E5, NOTE.C5, NOTE.A4, NOTE.D5, NOTE.F5, NOTE.D5];
  for (let i = 0; i < beats; i++) {
    tone(i % 2 ? NOTE.G3 : NOTE.C3, t + i * gap, { wave: 'triangle', peak: 0.07, decay: gap * 0.8 });
    tone(tune[i % tune.length], t + i * gap + gap / 2, { wave: 'square', peak: 0.03, decay: gap * 0.6, lowpass: 2200 });
  }
}

/** The Saucepan Man's pots and pans clanking. */
function clank(times = 1): void {
  const t = now();
  for (let i = 0; i < times; i++) {
    bell(620 + (i % 2) * 180, t + i * 0.16, 0.05, 0.35);
    bell(470, t + i * 0.16 + 0.06, 0.04, 0.3);
    noiseBurst(t + i * 0.16, { freq: 4000, q: 4, peak: 0.035, decay: 0.08 });
  }
}

/** A chair popping out of the game: a soft cork-pop and a little whistle down. */
function chairPop(): void {
  const t = now();
  tone(600, t, { peak: 0.12, decay: 0.07, glideTo: 1200 });
  tone(900, t + 0.08, { wave: 'triangle', peak: 0.05, decay: 0.3, glideTo: 450 });
}

// --------------------------------------------------------------------- art

const FLAGS = [C.red, C.gold, C.blue, C.green, C.pink, C.purple];

/** The party lawn, with a wooden dance floor across the front. */
function lawn(): string {
  return sceneSvg('l5c5-lawn', [
    ...sky([
      ['#f3d79a', 0],
      ['#f6e3b6', 260],
      ['#f8ead0', 420],
    ]),
    hills(470, 40, '#e9c98a', 551),
    ...bunting([-20, 60], [600, 50], 70, FLAGS, 30),
    ...bunting([580, 50], [1200, 64], 70, FLAGS, 30),
    ...balloon(300, 170, 34, C.purple, 120),
    ...balloon(880, 160, 36, C.gold, 130),
    hills(560, 24, '#9cbf6a', 552, { step: 80 }),
    piece(rect(-20, 590, 1220, 260), C.honey, { rough: 0.6 }),
    ...[0, 1, 2, 3].map((i) => piece(rect(-20, 620 + i * 50, 1220, 3), C.honeyDark, { edge: 'cut', fibre: false, shadow: false, opacity: 0.5 })),
  ]);
}

/** The Saucepan Man's curliest wig: a golden cloud of curls. */
function wig(): string {
  const curls: Pt[] = [
    [20, 110], [10, 70], [30, 34], [70, 14], [110, 10], [150, 20], [182, 50], [190, 90], [180, 116],
  ];
  return svg({ w: 200, h: 130, name: 'l5c5-wig' }, [
    ...curls.map(([x, y], i) => piece(rect(x - 26, y - 26, 52, 52, 26), i % 2 ? C.goldLight : C.gold, { rough: 1.2 })),
    piece(rect(40, 30, 120, 70, 30), C.goldLight, { rough: 1.2 }),
    piece(band([[60, 100], [100, 92], [140, 100]], 10), C.pink, { edge: 'cut' }),
  ]);
}

/** A torn paper tag with a number on it. */
function tag(text: string, color: string, name: string): string {
  return svg({ w: 120, h: 80, name: `l5c5-tag-${name}`, boil: false }, [
    piece(rect(6, 6, 108, 68, 8), color, { rough: 0.7 }),
    raw(`<text x="60" y="56" font-family="Andika, sans-serif" font-weight="700" font-size="46" fill="${C.ink}" text-anchor="middle">${text}</text>`),
  ]);
}

// ------------------------------------------------------------------- story

export default defineStory({
  lines: {
    hairs: { who: 'saucepan', text: 'Musical HAIRS? Ooh, lovely! I’ll wear my curliest wig!' },
    chairs: { who: 'hero', text: 'Not hairs! CHAIRS! Musical chairs!' },
    twelve: { who: 'narrator', text: 'Twelve chairs: ten in a row and two more. When the music stops, a chair goes!' },
    nine: { who: 'saucepan', text: 'Twelve take away three… nine chairs left! And I’m still dancing!' },
    next: { who: 'hero', text: 'Moon-Face is calling us! He’s baked the biggest cake ever!' },
  },

  async play(k: Kit) {
    k.backdrop(lawn());
    k.music('cosy');

    const pan = k.character('saucepan', { x: 0, y: 330, z: 20 });
    const hero = k.character('hero', { x: 920, y: 340, z: 20, flip: true });
    const pots = k.part(pan, 'pots');
    const jangle = () => {
      clank(2);
      if (pots.length) void k.to(pots, 0.1, { rotation: 8 }).then(() => k.to(pots, 0.1, { rotation: -6 })).then(() => k.to(pots, 0.15, { rotation: 0 }));
    };

    // Twelve chairs (the chapter's keepsake): a row of ten, and two more underneath.
    const CX = 214;
    const chairs = Array.from({ length: 12 }, (_, i) =>
      k.keepsake(k.chapter!.keepsake, { x: CX + (i % 10) * 76, y: 470 + Math.floor(i / 10) * 100, w: 84, z: 24 }),
    );
    chairs.forEach((c) => k.set(c, { opacity: 0 }));

    // ---- In clanks the Saucepan Man… in a wig.
    void k.enter(hero, 'right');
    jangle();
    await k.enter(pan, 'left', 0.8);
    jangle();
    const w = k.add(wig(), { x: 88, y: 330, w: 190, z: 21 });
    k.set(w, { opacity: 0 });
    const putOn = (async () => {
      await k.wait(1200);
      k.fx.boing();
      k.set(w, { opacity: 1, y: -300 });
      await k.to(w, 0.45, { y: 0, ease: 'bounce.out' });
      await k.shake(w, 4, 2);
    })();
    await k.all(k.say('hairs', pan), putOn);

    // ---- Not hairs, chairs!
    const off = (async () => {
      await k.wait(700);
      k.fx.whizz();
      await k.to(w, 0.5, { y: -420, rotation: 40, ease: 'power2.in' });
      k.remove(w);
    })();
    await k.all(k.say('chairs', hero), off, k.hop(hero, 30, 1));

    // ---- Twelve chairs: ten in a row, and two more.
    const twelve = k.add(tag('12', C.goldLight, 'twelve'), { x: 530, y: 360, w: 120, z: 16 });
    const minus = k.add(tag('−3', C.sky, 'minus'), { x: 540, y: 360, w: 110, z: 16 });
    const nine = k.add(tag('9', C.pink, 'nine'), { x: 540, y: 360, w: 110, z: 16 });
    [twelve, minus, nine].forEach((t) => k.set(t, { opacity: 0 }));
    const setOut = async () => {
      for (const [i, c] of chairs.entries()) {
        k.fx.pop();
        void k.appear(c, 0.25);
        await k.wait(i === 9 ? 350 : 140);
      }
      await k.appear(twelve, 0.3);
    };
    await k.all(k.say('twelve'), setOut());

    // ---- Three times the music stops, and a chair pops away.
    k.silence();
    let dancing = true;
    void (async () => {
      while (dancing) {
        await k.to(pan, 0.25, { rotation: 4, ease: 'sine.inOut' });
        await k.to(pan, 0.25, { rotation: -4, ease: 'sine.inOut' });
      }
      await k.to(pan, 0.2, { rotation: 0 });
    })();
    void k.fade(twelve, 0, 0.3);
    for (const i of [11, 10, 9]) {
      oompah(5);
      await k.wait(5 * 220 + 100);
      chairPop();
      const c = chairs[i];
      k.puff(parseFloat(c.style.left) + 42, parseFloat(c.style.top) + 42, 100, C.cream);
      await k.to(c, 0.4, { y: -240, rotation: 180, scale: 0.3, opacity: 0, ease: 'power2.in' });
      k.remove(c);
    }
    await k.appear(minus, 0.3);
    await k.wait(300);
    void k.fade(minus, 0, 0.3);
    k.sfx.sparkle();
    await k.appear(nine, 0.35);
    jangle();
    await k.say('nine', pan);
    dancing = false;

    // ---- Off to Moon-Face and his cake.
    k.music('cosy');
    await k.all(k.say('next', hero), k.hop(hero, 30, 2));
    k.fx.jingle();
    k.confetti(16);
    jangle();
    await k.wait(900);
  },
});
