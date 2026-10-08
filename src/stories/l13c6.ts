/**
 * Land 13, chapter 6: Left, Right, Forwards.
 *
 * Fran (or Joe, if Fran is the hero) holds up a map of the fair: a grid of
 * paths from a star to the big wheel. A counter that shows which way it
 * faces follows the arrow cards: forwards two squares, turn right (a
 * quarter turn, clockwise), forwards three, and there's the big wheel (the
 * chapter's directions and turns). Then they ride to the very top, and
 * from up there {name} spots little red caps hiding by the carousel.
 * Next: Goblins at the Fair.
 */
import { defineStory, type Kit } from './kit';
import { buddy, tick } from './bits';
import { arrowCard, boxes, cellOnMap, fairMap, organ, peeper, walker, type Way } from './fair';

/** The map card on stage. */
const MAP = { x: 330, y: 30, w: 520 };
/** The walker (70 across) centred on a square of the map. */
const WALK = 70;
const spot = (col: number, row: number): [number, number] => {
  const [x, y] = cellOnMap(col, row);
  return [MAP.x + x - WALK / 2, MAP.y + y - WALK / 2];
};

export default defineStory({
  lines: {
    follow_fran: { who: 'fran', text: 'Follow the arrows to the big wheel! Forwards, left and right.' },
    follow_joe: { who: 'joe', text: 'Follow the arrows to the big wheel! Forwards, left and right.' },
    two: { who: 'narrator', text: 'Forwards two squares. One, two.' },
    right: { who: 'narrator', text: 'Now turn right. That’s a quarter turn, clockwise.' },
    three: { who: 'narrator', text: 'Forwards three squares. One, two, three. The big wheel!' },
    top: { who: 'hero', text: 'Right at the top! I can see the whole fair from up here.' },
    caps: { who: 'hero', text: 'Wait… what are those little red caps, hiding by the carousel?' },
  },

  async play(k: Kit) {
    const host = buddy(k, 'fran', 'joe');
    k.landScene();
    k.music('adventure');
    organ();

    // A pile of boxes by the carousel: something will peep over it later.
    k.add(boxes('l13c6-boxes'), { x: 860, y: 430, w: 200, z: 16 });
    const hero = k.character('hero', { x: 20, y: 380, w: 230, z: 20 });
    const kid = k.character(host, { x: 920, y: 380, w: 220, z: 20, flip: true });
    await k.all(k.enter(hero, 'left', 0.7), k.enter(kid, 'right', 0.7));

    // ---- The map, the counter on the star, and the first arrow cards.
    const map = k.add(fairMap('l13c6-map'), { ...MAP, z: 12 });
    k.set(map, { opacity: 0 });
    k.sfx.page();
    await k.appear(map, 0.45);
    const [sx, sy] = spot(0, 2);
    const w = k.add(walker('l13c6-walker'), { x: sx, y: sy, w: WALK, z: 16 });
    k.set(w, { opacity: 0 });
    await k.appear(w, 0.3);
    await k.say(`follow_${host}`, kid);

    const cards: HTMLElement[] = [];
    const card = async (way: Way, i: number): Promise<void> => {
      const c = k.add(arrowCard(way, `l13c6-card-${way}-${i}`), { x: 370 + i * 110, y: 440, w: 100, z: 18 });
      cards.push(c);
      k.set(c, { opacity: 0 });
      k.sfx.tap();
      await k.appear(c, 0.25);
    };
    /** Moves the walker along the grid, one square at a time, counting. */
    const step = async (cells: [number, number][]) => {
      for (const [i, [c, r]] of cells.entries()) {
        const [x, y] = spot(c, r);
        tick(i);
        await k.to(w, 0.5, { x: x - sx, y: y - sy, ease: 'power2.inOut' });
        await k.wait(250);
      }
    };

    // Forwards two: up the left side.
    const one = async () => {
      await card('forwards', 0);
      await card('forwards', 1);
      await step([
        [0, 1],
        [0, 0],
      ]);
    };
    await k.all(k.say('two'), one());

    // Turn right: a quarter turn, clockwise.
    const two = async () => {
      await card('right', 2);
      k.fx.boing();
      await k.to(w, 0.8, { rotation: 90, ease: 'power2.inOut' });
    };
    await k.all(k.say('right'), two());

    // Forwards three: along the top, to the big wheel.
    const three = async () => {
      await card('forwards', 3);
      await step([
        [1, 0],
        [2, 0],
        [3, 0],
      ]);
      k.sparkle(MAP.x + cellOnMap(3, 0)[0], MAP.y + cellOnMap(3, 0)[1], 14, 140);
      k.sfx.success();
    };
    await k.all(k.say('three'), three());

    // ---- Up the big wheel, right to the top.
    await k.all(k.fade(map, 0, 0.4), k.fade(w, 0, 0.4), ...cards.map((c) => k.fade(c, 0, 0.3)));
    // The two of them, small, in the top seat of the wheel (its rim is at about y 290).
    await k.all(k.to(hero, 1.6, { x: 470, y: -150, scale: 0.42, ease: 'sine.inOut' }), k.to(kid, 1.6, { x: -280, y: -150, scale: 0.42, ease: 'sine.inOut' }));
    k.fx.creak();
    await k.all(k.say('top', hero), k.camera({ zoom: 1.5, x: 620, y: 300 }, 1.6));

    // ---- Red caps, peeping over the boxes by the carousel.
    const caps = [
      peeper(k, { x: 880, y: 440, w: 90, z: 15 }),
      peeper(k, { x: 960, y: 420, w: 90, z: 15, flip: true }),
    ];
    k.set(caps, { y: 80 });
    await k.camera({ zoom: 1.6, x: 940, y: 480 }, 1.4);
    k.fx.sneak();
    await k.all(...caps.map((c, i) => k.wait(i * 300).then(() => k.to(c, 0.6, { y: 0, ease: 'power2.out' }))));
    await k.say('caps', hero);
    // They see they've been seen, and duck down.
    await k.all(...caps.map((c) => k.to(c, 0.3, { y: 80, ease: 'power2.in' })));
    await k.camera({}, 1.0);
    await k.wait(400);
  },
});
