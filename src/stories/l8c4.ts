/**
 * Land 8, chapter 4: Twos and Tens.
 *
 * Mr Oom Boom Boom drums in twos: every beat lays down a pair of gold
 * discs, and a tag counts two, four, six, eight, ten. Then the big booms
 * count in tens: ten, twenty, thirty, one little drum each. Then he stops
 * and listens, and tells them the clue: Dame Snap's land will come back, and
 * it comes when it is coldest, after the snow. The dewdrop glows. The cold
 * is quiet, not frightening. Next: Fives on Parade (a marching sound).
 */
import { C, circle, defineStory, piece, svg, type Kit } from './kit';
import { roundTag, tick } from './bits';
import { boom, dewdrop } from './toys';

/** A pair of gold drum-beat discs (120 × 60). */
function pair(n: number): string {
  return svg({ w: 120, h: 60, name: `l8c4-pair-${n}`, boil: false }, [
    piece(circle(32, 30, 22), C.toyYellow, { rough: 0.6 }),
    piece(circle(88, 30, 22), C.toyYellow, { rough: 0.6 }),
  ]);
}

export default defineStory({
  lines: {
    twos: { who: 'oomboom', text: 'Oom boom boom! My drum beats in twos. Two, four, six, eight, ten!' },
    tens: { who: 'oomboom', text: 'Now the big booms. Ten, twenty, thirty!' },
    clue: { who: 'oomboom', text: 'Listen. Dame Snap’s land will come back. It comes when it is coldest, after the snow.' },
    brave: { who: 'hero', text: 'Then we will be ready. We will get Silky back!' },
    dew: { who: 'narrator', text: 'Silky’s dewdrop glowed softly, like a promise.' },
    next: { who: 'oomboom', text: 'Now, hear that marching? Captain Tin is calling you!' },
  },

  async play(k: Kit) {
    k.landScene();
    k.music('cosy');
    const ob = k.character('oomboom', { x: 20, y: 352, z: 20 });
    const hero = k.character('hero', { x: 905, y: 352, z: 20, flip: true });
    const dew = dewdrop(k);
    await k.all(k.enter(ob, 'left'), k.enter(hero, 'right'));

    // ---- Twos: each beat lays down a pair, and the running total follows.
    const pairs = Array.from({ length: 5 }, (_, i) => k.add(pair(i), { x: 330 + i * 110, y: 640, w: 100, z: 16 }));
    const tags = Array.from({ length: 5 }, (_, i) => k.add(roundTag((i + 1) * 2, i % 2 ? C.goldLight : C.pink, `l8c4-tag-${i}`), { x: 345 + i * 110, y: 545, w: 78, z: 18 }));
    [...pairs, ...tags].forEach((e) => k.set(e, { opacity: 0 }));
    const drumming = async (arms: SVGGElement[]) => {
      await k.wait(1500);
      for (let i = 0; i < 5; i++) {
        boom();
        void k.pop(ob, 1.04);
        void k.to(arms, 0.08, { rotation: 8 }).then(() => k.to(arms, 0.2, { rotation: 0 }));
        void k.appear(pairs[i], 0.25);
        await k.appear(tags[i], 0.25);
        await k.wait(380);
      }
    };
    const arms = [...k.pivot(k.part(ob, 'armL')), ...k.pivot(k.part(ob, 'armR'))];
    await k.all(k.say('twos', ob), drumming(arms));
    await k.wait(300);

    // ---- Tens: three big booms, one little drum each.
    void k.all(...pairs.map((p) => k.fade(p, 0, 0.4)), ...tags.map((t) => k.fade(t, 0, 0.4)));
    const drums = [0, 1, 2].map((i) => k.keepsake('drum', { x: 400 + i * 150, y: 560, w: 130, z: 16 }));
    const tenTags = [10, 20, 30].map((n, i) => k.add(roundTag(n, [C.pink, C.goldLight, C.sky][i], `l8c4-ten-${n}`), { x: 425 + i * 150, y: 470, w: 80, z: 18 }));
    [...drums, ...tenTags].forEach((e) => k.set(e, { opacity: 0 }));
    const booming = async () => {
      await k.wait(1100);
      for (let i = 0; i < 3; i++) {
        boom(true);
        void k.quake(4);
        void k.appear(drums[i], 0.3);
        await k.appear(tenTags[i], 0.3);
        tick(i * 2);
        await k.wait(500);
      }
    };
    await k.all(k.say('tens', ob), booming());
    await k.wait(300);

    // ---- The clue: the room goes quiet and cold, and the dewdrop answers.
    void k.all(...drums.map((d) => k.fade(d, 0, 0.4)), ...tenTags.map((t) => k.fade(t, 0, 0.4)));
    k.music('dreamy');
    const cold = k.dim(0, '#27406b');
    void k.fade(cold, 0.22, 0.8);
    await k.say('clue', ob);
    await k.all(k.say('brave', hero), k.hop(hero, 14, 1));
    await k.all(k.say('dew'), dew.glow(), k.fade(cold, 0, 1.2));
    k.music('cosy');
    await k.say('next', ob);
    k.fx.patter(6, 0.14);
    await k.wait(500);
  },
});
