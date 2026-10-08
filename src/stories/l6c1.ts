/**
 * Land 6, chapter 1: Footprints as Big as Ponds.
 *
 * Giant Rumbletum's great face leans in from the top of the sky ("Fee,
 * fi… oh, sorry!") and shows off his footprints: ten of them in a row, each
 * one full of rainwater, each as big as a pond. The hero hops from footprint
 * to footprint, and a number lands on each one as he does: ten, twenty,
 * thirty … a hundred (the chapter's counting in tens). Ten tens make a
 * hundred. Rumbletum chuckles and sends him to Moon-Face, who is tying up
 * firewood. Next: Bundles of Sticks.
 */
import { C, defineStory, type Kit } from './kit';
import { jump, tick } from './bits';
import { countTag, giantHead, meadow, peek, pondPrint, splash } from './giants';

const TAGS = [C.goldLight, C.pink, C.sky, C.leafLight, C.sand];

export default defineStory({
  lines: {
    hello: { who: 'giant', text: 'Fee, fi… oh, sorry! Hello, little one. Do you like my footprints?' },
    count: { who: 'narrator', text: '{name} hopped from footprint to footprint. Ten, twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety, a hundred!' },
    tens: { who: 'hero', text: 'Ten footprints, and every one is a ten. Ten tens make a hundred!' },
    next: { who: 'giant', text: 'Ha ha, my feet make good ponds! Moon-Face is tying up my firewood. Go and count it!' },
  },

  async play(k: Kit) {
    k.backdrop(meadow('l6c1-meadow'));
    k.music('cosy');

    // Ten footprints across the grass, each full of rainwater.
    const cx = (i: number) => 110 + i * 105;
    const top = (i: number) => 470 + (i % 2) * 24;
    const prints = Array.from({ length: 10 }, (_, i) => k.add(pondPrint(`l6c1-print-${i}`), { x: cx(i) - 55, y: top(i), w: 110, z: 12, flip: i % 2 === 1 }));

    const giant = giantHead(k, { x: 720, y: -110 });
    k.set(giant, { opacity: 0 });
    const hero = k.character('hero', { x: cx(0) - 75, y: top(0) - 150, w: 150, z: 20 });
    await k.enter(hero, 'left', 0.7);

    await peek(k, giant);
    await k.say('hello', giant);

    // ---- Hop along the ponds, counting in tens.
    const hop = async () => {
      for (let i = 0; i < 10; i++) {
        if (i > 0) await jump(k, hero, cx(i) - 75, top(i) - 150, 70, 0.4);
        splash();
        tick(i);
        const tag = k.add(countTag((i + 1) * 10, TAGS[i % TAGS.length], `l6c1-tag-${i}`), { x: cx(i) - 40, y: top(i) + 45, w: 80, z: 15 });
        void k.appear(tag, 0.25);
        k.sparkle(cx(i), top(i) + 70, 5, 50);
        await k.wait(i === 9 ? 500 : 140);
      }
    };
    await k.all(k.say('count'), hop());

    await k.say('tens', hero);
    void k.hop(hero, 40, 2);
    await k.pop(prints[9], 1.08);
    await k.say('next', giant);
    await k.wait(400);
  },
});
