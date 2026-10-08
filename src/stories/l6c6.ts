/**
 * Land 6, chapter 6: Bigger or Smaller?
 *
 * Giant Rumbletum has brought out his scales. In one pan he puts his
 * number, 64; in the other, the hero's number, 46. Same two digits, but
 * which is bigger? Look at the tens: six tens beat four tens, so the
 * scales tip down on the 64 side and a card says 64 > 46 (the chapter's
 * comparing numbers to 100). "The tens go first!" Then the giant remembers
 * his buttons. Next: The Giant's Buttons.
 */
import { C, curve, defineStory, ink, piece, raw, rect, svg, type Kit } from './kit';
import { giantHead, meadow, peek, strip } from './giants';

const PIVOT_X = 470;
const PIVOT_Y = 270;
const HALF = 240;

/** The stand: a post and a foot, with the pivot on top (300 × 330). */
function stand(): string {
  return svg({ w: 300, h: 330, name: 'l6c6-stand', boil: false }, [
    piece(curve([[60, 322], [80, 290], [220, 290], [240, 322]], 1), C.brassDark),
    piece(rect(138, 30, 24, 270, 4), C.brass),
    piece(curve([[120, 40], [150, 10], [180, 40]], 1), C.brassDark),
  ]);
}

/** The beam (2 × HALF wide). It turns about its middle. */
function beam(): string {
  return svg({ w: HALF * 2 + 40, h: 50, name: 'l6c6-beam', boil: false }, [
    piece(rect(10, 16, HALF * 2 + 20, 18, 8), C.brass),
    piece(rect(0, 8, 30, 34, 10), C.brassDark, { edge: 'cut' }),
    piece(rect(HALF * 2 + 10, 8, 30, 34, 10), C.brassDark, { edge: 'cut' }),
    piece(rect(HALF + 4, 6, 32, 38, 16), C.brassDark, { edge: 'cut' }),
  ]);
}

/** A hanging pan with a number card in it (240 × 200). */
function pan(n: number): string {
  return svg({ w: 240, h: 200, name: `l6c6-pan-${n}`, boil: false }, [
    ink([[120, 0], [24, 130]], { width: 3, color: C.brassDark }),
    ink([[120, 0], [216, 130]], { width: 3, color: C.brassDark }),
    piece(rect(68, 70, 104, 66, 8), C.cream, { rough: 0.8 }),
    raw(`<text x="120" y="122" text-anchor="middle" font-family="Andika, sans-serif" font-size="56" font-weight="700" fill="${C.ink}">${n}</text>`),
    piece(curve([[8, 128], [232, 128], [210, 170], [30, 170]], 1), C.brass),
  ]);
}

export default defineStory({
  lines: {
    ask: { who: 'giant', text: 'My number is sixty-four. Yours is forty-six. Which is bigger?' },
    look: { who: 'narrator', text: 'Look at the tens first. Six tens are more than four tens.' },
    answer: { who: 'hero', text: 'Sixty-four is bigger than forty-six!' },
    next: { who: 'giant', text: 'Yes! The tens go first. Now come and see my giant buttons!' },
  },

  async play(k: Kit) {
    k.backdrop(meadow('l6c6-meadow'));
    k.music('magic');

    k.add(stand(), { x: PIVOT_X - 150, y: PIVOT_Y - 20, z: 11 });
    const beamEl = k.add(beam(), { x: PIVOT_X - HALF - 20, y: PIVOT_Y - 25, z: 12 });
    // Pans hang from the beam's ends; they stay level and just rise and fall.
    const left = k.add(pan(64), { x: PIVOT_X - HALF - 120, y: PIVOT_Y, w: 240, z: 13 });
    const right = k.add(pan(46), { x: PIVOT_X + HALF - 120, y: PIVOT_Y, w: 240, z: 13 });
    const hero = k.character('hero', { x: 860, y: 380, z: 20, flip: true });
    const giant = giantHead(k, { x: 740, y: -140, w: 400 });
    k.set([left, right, hero, giant], { opacity: 0 });
    await k.all(k.fade(left, 1, 0.4), k.fade(right, 1, 0.4), k.enter(hero, 'right'));
    await peek(k, giant);
    await k.say('ask', giant);

    // ---- The scales tip towards the bigger number.
    const tilt = async () => {
      await k.wait(300);
      const drop = Math.sin((9 * Math.PI) / 180) * HALF;
      await k.all(
        k.to(beamEl, 1.4, { rotation: -9, transformOrigin: '50% 50%', ease: 'sine.inOut' }),
        k.to(left, 1.4, { y: drop, ease: 'sine.inOut' }),
        k.to(right, 1.4, { y: -drop, ease: 'sine.inOut' }),
      );
    };
    await k.all(k.say('look'), tilt());

    const card = k.add(strip('64 > 46', C.leafLight, 'l6c6-card'), { x: 280, y: 60, z: 25 });
    k.set(card, { opacity: 0 });
    await k.all(k.say('answer', hero), k.appear(card, 0.4));
    void k.hop(hero, 40, 2);
    await k.say('next', giant);
    await k.wait(300);
  },
});
