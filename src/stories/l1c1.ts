/**
 * Land 1, chapter 1: Into the Enchanted Wood.
 *
 * SCAFFOLD EXAMPLE: a short, complete story showing the kit in use. W5 may
 * rewrite it with the finished art.
 *
 * Dusk in the Enchanted Wood. The trees whisper "wisha-wisha". The
 * toadstools he counted pop up one by one in a ring, and a round, beaming
 * face peeps out from behind the great tree: Moon-Face! He waves them up
 * the tree. Next: Wisha-Wisha.
 */
import { C, circle, curve, defineStory, noiseBurst, now, piece, rect, svg, tone, type Kit } from './kit';

// ------------------------------------------------------------------ sounds

/** The trees whispering: soft breathy swells. */
function wisha(): void {
  const t = now();
  for (let i = 0; i < 2; i++) noiseBurst(t + i * 0.7, { freq: 1800, q: 0.7, peak: 0.05, attack: 0.25, decay: 0.45, sweepTo: 900 });
}

/** A toadstool popping up. */
function plip(n: number): void {
  const f = 500 + n * 60;
  tone(f, now(), { wave: 'triangle', peak: 0.08, attack: 0.005, decay: 0.12, glideTo: f * 1.5 });
}

// --------------------------------------------------------------------- art

function wood(): string {
  const trunks = [80, 260, 900, 1080].map((x, i) => piece(rect(x - 40 - i * 4, -20, 80 + i * 8, 760, 20), i % 2 ? C.barkDark : C.bark, { rough: 1.4 }));
  return svg({ w: 1180, h: 820, name: 'l1c1-wood', boil: false }, [
    piece(rect(-20, -20, 1220, 860), C.duskHigh, { edge: 'clean', shadow: false }),
    piece(rect(-20, 300, 1220, 300), C.duskSky, { rough: 2, shadow: false }),
    ...[0, 1, 2, 3, 4, 5].map((i) => piece(circle(i * 240, 120 + (i % 2) * 40, 170), i % 2 ? C.leafDark : C.greenDeep, { shadow: false })),
    ...trunks,
    // The great Faraway Tree in the middle, too big to fit.
    piece(curve([[470, 830], [520, 400], [540, -20], [660, -20], [680, 400], [730, 830]], 2), C.bark),
    piece(curve([[-20, 690], [300, 660], [600, 690], [900, 660], [1200, 690], [1200, 840], [-20, 840]], 2), C.leafDark),
  ]);
}

export default defineStory({
  lines: {
    hush: { who: 'narrator', text: 'Deep in the Enchanted Wood, the trees began to whisper.' },
    wisha: { who: 'hero', text: 'Wisha-wisha-wisha! Can you hear them?' },
    toads: { who: 'narrator', text: 'And all the toadstools {name} had counted popped up in a ring.' },
    who: { who: 'moonface', text: 'Hello down there! I’m Moon-Face. Come up, come up!' },
    next: { who: 'hero', text: 'Let’s climb the Faraway Tree, {name}!' },
  },

  async play(k: Kit) {
    k.backdrop(wood());
    k.music('dreamy');
    k.ambient('fireflies', { count: 12 });
    const hero = k.character('hero', { x: 140, y: 330, w: 280 });
    await k.enter(hero, 'left');
    await k.say('hush');
    wisha();
    await k.say('wisha', hero);

    // The toadstools pop up, one per beat, in a ring.
    const ring = [0, 1, 2, 3, 4].map((i) => k.prop('toadstool', { x: 420 + i * 80, y: 600 - Math.sin((i / 4) * Math.PI) * 40, w: 90, z: 20 }));
    ring.forEach((t) => k.set(t, { opacity: 0 }));
    for (const [i, t] of ring.entries()) {
      plip(i);
      await k.appear(t, 0.25);
    }
    await k.say('toads');

    // A round face peeps round the great tree.
    const mf = k.character('moonface', { x: 640, y: 120, w: 240, z: 5 });
    k.set(mf, { x: 200, opacity: 1 });
    await k.to(mf, 0.8, { x: 0, ease: 'back.out(1.4)' });
    k.light(760, 250, 220, { color: '#fff3c0', strength: 0.35 });
    await k.say('who', mf);
    await k.hop(hero, 40, 2);
    await k.say('next', hero);
    k.sparkle(730, 110, 16);
    await k.wait(800);
  },
});
