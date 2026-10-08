/**
 * Land 13, chapter 1: Round and Round.
 *
 * A new land at the top of the tree, and it's a fair. Mr Whirligig rings his
 * bell and spins the pinwheel on his hat: everything here goes round. His
 * magic arrow sits on a round board pointing up. A quarter turn, and it
 * points at him; a half turn, and it points the other way, at {name} (the
 * chapter's quarter and half turns, with a curved arrow for each). So
 * {name} wins the first ride on the carousel, and Silky flies in asking
 * which way round it goes. Next: Clockwise, Anticlockwise.
 */
import { defineStory, type Kit } from './kit';
import { arrow, arrowBoard, FAIR_CREAM, FAIR_GOLD, FAIR_TEAL, organ, ringBell, spinPinwheel, turn, turnArc, whirr, wordTag } from './fair';

/** The board's spot: the arrow turns about its middle (590, 290). */
const BOARD = { x: 450, y: 150, w: 280 };

export default defineStory({
  lines: {
    welcome: { who: 'whirligig', text: 'Roll up, roll up! Welcome to my fair, where everything goes round and round!' },
    arrow: { who: 'whirligig', text: 'This is my magic arrow. It points up. Now, a quarter turn!' },
    quarter: { who: 'narrator', text: 'A quarter turn. Now the arrow points at Mr Whirligig!' },
    half: { who: 'whirligig', text: 'And now a half turn, right round to the other side!' },
    you: { who: 'narrator', text: 'A half turn. Now it points the other way, at {name}!' },
    ride: { who: 'whirligig', text: 'The arrow has chosen! The first ride on my carousel is yours!' },
    next: { who: 'silky', text: 'But which way round does the carousel go? Let’s find out!' },
  },

  async play(k: Kit) {
    k.landScene();
    k.music('adventure');
    organ();

    const hero = k.character('hero', { x: 30, y: 380, w: 240, z: 20 });
    const wg = k.character('whirligig', { x: 900, y: 360, w: 260, z: 20 });
    await k.all(k.enter(wg, 'right', 0.8), k.wait(200).then(() => k.enter(hero, 'left', 0.7)));
    await k.all(k.say('welcome', wg), ringBell(k, wg, 3), k.wait(600).then(() => spinPinwheel(k, wg, 3, 1.6)));

    // ---- The magic arrow on its round board, pointing up.
    const board = k.add(arrowBoard('l13c1-board'), { ...BOARD, z: 12 });
    const arr = k.add(arrow('l13c1-arrow'), { ...BOARD, z: 14 });
    k.set([board, arr], { opacity: 0 });
    k.fx.pop();
    await k.all(k.appear(board, 0.4), k.wait(150).then(() => k.appear(arr, 0.4)));
    await k.say('arrow', wg);

    // ---- A quarter turn: up → right, at Mr Whirligig.
    const q = k.add(turnArc(0.25, FAIR_TEAL, 'l13c1-quarter'), { x: 420, y: 120, w: 340, z: 13 });
    const qTag = k.add(wordTag('a quarter turn', FAIR_CREAM, 'l13c1-qtag', 300), { x: 440, y: 24, w: 300, z: 16 });
    k.set([q, qTag], { opacity: 0 });
    whirr(1);
    await k.all(turn(k, arr, 0.25, 1.1), k.fade(q, 1, 0.8));
    k.fx.boing();
    void k.appear(qTag, 0.3);
    await k.all(k.say('quarter'), k.hop(wg, 24, 1));
    await k.all(k.fade(q, 0, 0.3), k.fade(qTag, 0, 0.3));

    // ---- A half turn: right → left, at the hero. Its curved arrow starts where the arrow points.
    await k.say('half', wg);
    const hArc = k.add(turnArc(0.5, FAIR_GOLD, 'l13c1-half'), { x: 420, y: 120, w: 340, z: 13 });
    const hTag = k.add(wordTag('a half turn', FAIR_CREAM, 'l13c1-htag', 300), { x: 440, y: 24, w: 300, z: 16 });
    k.set(hArc, { rotation: 90, opacity: 0 });
    k.set(hTag, { opacity: 0 });
    whirr(1.4);
    await k.all(turn(k, arr, 0.5, 1.5), k.fade(hArc, 1, 1));
    k.fx.boing();
    void k.appear(hTag, 0.3);
    k.sparkle(150, 480, 12, 120);
    await k.all(k.say('you'), k.hop(hero, 36, 2));

    // ---- The first ride on the carousel.
    await k.all(k.fade(hArc, 0, 0.3), k.fade(hTag, 0, 0.3), k.fade(board, 0, 0.4), k.fade(arr, 0, 0.4));
    const horse = k.keepsake(k.chapter?.keepsake ?? 'carouselHorse', { x: 280, y: 330, w: 190, z: 22 });
    k.set(horse, { opacity: 0 });
    k.fx.twinkle();
    await k.appear(horse, 0.4);
    k.float(horse, 6, 1.8);
    await k.all(k.say('ride', wg), ringBell(k, wg, 2), k.hop(hero, 30, 1));

    // ---- Silky flies in.
    const silky = k.character('silky', { x: 560, y: 120, w: 220, z: 24 });
    k.set(silky, { opacity: 0 });
    k.fx.twinkle();
    await k.enter(silky, 'top', 0.9);
    k.float(silky, 8, 2.4);
    await k.say('next', silky);
    await k.wait(500);
  },
});
