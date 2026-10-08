/**
 * Land 9, chapter 7: Icicles to Count.
 *
 * Mr Snowman is proud of his icicles: two rows of ten and four more, so
 * twenty-four. Then five more drop from the ledge, and twenty-four and
 * five make twenty-nine (the chapter's adding tens and ones). The strongest
 * icicle becomes the teeth of the key, and the last piece of the plan is in
 * place. {name} reads the whole map aloud, piece by piece: the tree, the
 * key, the sledge, the gate, six o'clock and quarter past. THE PLAN IS
 * READY. But a drip lands on Mr Snowman's hat… and another… the sun is
 * coming out. Next: The Big Thaw.
 */
import { C, circle, defineStory, piece, poly, svg, type Kit } from './kit';
import { sumStrip, tick } from './bits';
import { dewdrop, drip, flourish, mapBoard, type MapKind } from './snow';

const ORDER: MapKind[] = ['tree', 'cage', 'key', 'sledge', 'gates', 'six', 'quarter', 'teeth'];

/** A drop of meltwater (30 × 40). */
const drop = (n: number): string => svg({ w: 30, h: 40, name: `l9c7-drop-${n}`, boil: false }, [piece(circle(15, 26, 10), C.ice, { edge: 'cut', fibre: false, shadow: false }), piece(poly([[15, 2], [24, 22], [6, 22]]), C.ice, { edge: 'cut', fibre: false, shadow: false })]);

export default defineStory({
  lines: {
    icicles: { who: 'snowman', text: 'My icicles! Two rows of ten, and four more. Count them with me!' },
    count: { who: 'narrator', text: 'Ten, twenty, twenty-one, twenty-two, twenty-three, twenty-four. Then five more fall: twenty-nine!' },
    teeth: { who: 'snowman', text: 'The strongest icicle makes the teeth of our key. Now the plan is ready!' },
    plan: { who: 'hero', text: 'Tree, key, sledge, gate, six o’clock, quarter past. We can save Silky!' },
    melt: { who: 'snowman', text: 'Drip, drip. Oh dear, is it getting warm? I think the snow is melting!' },
  },

  async play(k: Kit) {
    k.landScene();
    k.ambient('snow', { count: 16, z: 40 });
    k.music('cosy');

    const snowman = k.character('snowman', { x: 30, y: 352, z: 20 });
    const hero = k.character('hero', { x: 890, y: 352, z: 20, flip: true });
    await k.all(k.enter(snowman, 'left'), k.enter(hero, 'right'));
    const dew = dewdrop(k);

    // ---- Two full rows of ten icicles, and a short row of four.
    const spot = (i: number): [number, number] => [280 + (i % 10) * 62, 30 + Math.floor(i / 10) * 74];
    const make = (i: number): HTMLElement => {
      const [x, y] = spot(i);
      const e = k.prop('icicle', { x, y, w: 64, z: 15 });
      k.set(e, { opacity: 0 });
      return e;
    };
    const icicles: HTMLElement[] = [];
    const total = k.add(sumStrip('20 + 4', 'l9c7-sum-a'), { x: 450, y: 262, w: 270, z: 25 });
    const total2 = k.add(sumStrip('24 + 5 = 29', 'l9c7-sum-b'), { x: 405, y: 262, w: 370, z: 25 });
    [total, total2].forEach((t) => k.set(t, { opacity: 0 }));
    void k.say('icicles', snowman);
    for (let i = 0; i < 24; i++) {
      const e = make(i);
      icicles.push(e);
      await k.appear(e, 0.15);
      if (i % 10 === 9 || i >= 20) tick(i >= 20 ? i - 14 : i / 10);
      await k.wait(i < 20 ? 60 : 280);
    }
    await k.wait(500);

    // ---- Five more drop from the ledge: twenty-four and five make twenty-nine.
    const counting = async () => {
      await k.appear(total, 0.3);
      await k.wait(1800);
      for (let i = 24; i < 29; i++) {
        const e = make(i);
        icicles.push(e);
        const [, y] = spot(i);
        k.set(e, { opacity: 1, y: -y - 100 });
        await k.to(e, 0.4, { y: 0, ease: 'power2.in' });
        tick(i - 18);
        await k.pop(e, 1.2);
        await k.wait(150);
      }
      await k.fade(total, 0, 0.2);
      await k.appear(total2, 0.3);
      await dew.glow();
    };
    await k.all(k.say('count'), counting());
    await k.wait(300);

    // ---- The best icicle becomes the key's teeth: the plan is ready.
    await k.all(k.say('teeth', snowman), flourish(k, snowman, 'armR'));
    await k.all(...icicles.map((e) => k.fade(e, 0, 0.5)), k.fade(total2, 0, 0.4));
    const plan = mapBoard(k, 7);
    k.set(plan.board, { opacity: 0 });
    Object.values(plan.pieces).forEach((el) => k.set(el!, { opacity: 0 }));
    await k.fade(plan.board, 1, 0.5);
    await k.all(...Object.entries(plan.pieces).filter(([kind]) => kind !== 'teeth').map(([, el]) => k.fade(el!, 1, 0.4)));
    await plan.reveal();
    await k.wait(300);

    // ---- {name} reads the whole plan, piece by piece.
    const reading = async () => {
      await k.wait(300);
      for (const kind of ORDER) {
        const el = plan.pieces[kind]!;
        if (kind === 'cage') continue;
        void k.pop(el, 1.15);
        await k.wait(kind === 'tree' ? 450 : 380);
      }
      await dew.glow();
      k.sparkle(590, 290, 16, 200);
    };
    await k.all(k.say('plan', hero), reading());

    // ---- Drip, drip: the sun is coming out.
    const sun = k.light(1000, 90, 420, { color: C.goldLight, strength: 0, z: 36 });
    const dripping = async () => {
      void k.fade(sun, 1, 2.5);
      for (let i = 0; i < 4; i++) {
        const [dx] = [[110], [150], [90], [130]][i];
        const d = k.add(drop(i), { x: dx, y: 380, w: 22, z: 30 });
        drip();
        await k.to(d, 0.7, { y: '+=150', opacity: 0, ease: 'power2.in' });
        d.remove();
        await k.wait(250);
      }
    };
    await k.all(k.say('melt', snowman), dripping(), k.shake(snowman, 4, 3));
    await k.wait(600);
  },
});
