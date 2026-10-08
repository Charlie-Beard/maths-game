/**
 * Land 12, chapter 8 (the land's finale): The Grand Parade.
 *
 * Plays straight after the escape game, so everyone is already on the
 * ladder. Three scenes:
 *
 *   1. From the top of the ladder they watch the red goblins' "grand
 *      parade" along the edge of the land: nine goblins in threes (three,
 *      six, nine), banging the big drum very badly. Mr Oom Boom Boom
 *      shouts; the goblins snicker and march, one by one, down a goblin
 *      hole. Moon-Face knows them: goblins can pop up anywhere through
 *      those. The clock on the edge turns from five to six to six o'clock,
 *      and the Land of Music rises away with its last sad little tune.
 *   2. Home in Moon-Face's room. No drum, no boom. {name} wins the seal of
 *      the Land of Music and a picture of the big drum (the keepsake), to
 *      remember what they're looking for, and promises to find it.
 *   3. Night at the top of the tree: a new land of lights and fairground
 *      music arrives, the Land of Roundabouts. The Saucepan Man hears
 *      "bear". And from somewhere far below, very faint: boom… boom.
 *
 * The goblins are cartoon-menacing (PLAN.md §2): they snicker, shout and
 * march off with the drum, and never come near anyone. The drum isn't
 * lost for good: it comes home at the end of land 14.
 */
import { landSeal } from '../art/keepsakes';
import { moonRoom, tree, TREE_SPOTS } from '../art/scenery';
import { bell, C, defineStory, NOTE, now, type Kit } from './kit';
import { at, blackSheet, flump, roundTag, together } from './bits';
import {
  badBoom,
  boom,
  chimeTime,
  clock,
  drumless,
  EDGE,
  edgeSky,
  farewellTune,
  goblin,
  goblinBob,
  holeBack,
  holeFront,
  ladderTop,
  landEdge,
  runClock,
  snicker,
  tickTock,
  tiptoe,
} from './music';

/** A merry-go-round tune drifting up from far away (the Land of Roundabouts). */
function fairTune(): void {
  const t = now();
  [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.E5, NOTE.F5, NOTE.A5, NOTE.G5].forEach((f, i) => bell(f, t + i * 0.32, 0.045, 0.9));
}

export default defineStory({
  lines: {
    march: { who: 'narrator', text: 'Along the edge of the land came the red goblins’ grand parade.' },
    count: { who: 'narrator', text: 'Three, six, nine goblins! Banging the big drum. Very badly!' },
    stop: { who: 'oomboom', text: 'Stop! That’s MY drum! Give it back!' },
    goblin: { who: 'redGoblin', text: 'Hee hee! Our drum now! Down the goblin hole, everybody!' },
    hole: { who: 'moonface', text: 'A goblin hole! Goblins can pop up anywhere, through those.' },
    six: { who: 'moonface', text: 'Six o’clock! The land is moving on. Hold on tight!' },
    away: { who: 'narrator', text: 'And away went the Land of Music, playing one last, sad little tune.' },
    noboom: { who: 'oomboom', text: 'No drum, no boom. Oh dear, oh dear.' },
    prize: { who: 'narrator', text: '{name} won the seal of the Land of Music, and a picture of the big drum.' },
    promise: { who: 'hero', text: 'Don’t be sad, Mr Oom Boom Boom. We’ll find your drum. I promise.' },
    fair: { who: 'hero', text: 'Look! A new land, all lights and music. Is it a fair?' },
    bear: { who: 'saucepan', text: 'EH? A BEAR? Oh, a FAIR! The Land of Roundabouts! I love a fair!' },
    listen: { who: 'oomboom', text: 'Shh! Listen. Boom… boom… That’s my drum, somewhere far away.' },
  },

  async play(k: Kit) {
    // ------------------------------------- scene 1: the goblins' grand parade
    k.backdrop(edgeSky('l12c8-sky'));
    const edge = k.add(landEdge('l12c8-edge'), { x: 0, y: 0, w: 1000, h: 900, z: 4, still: true });
    const face = clock(k, 'l12c8-clock', { ...EDGE.clock, hour: 5, minute: 55, fives: true, z: 5 });
    const hb = k.add(holeBack('l12c8-hole'), { x: EDGE.hole.x, y: EDGE.ground - 35, w: EDGE.hole.w, z: 5, still: true });
    const hf = k.add(holeFront('l12c8-hole-front'), { x: EDGE.hole.x, y: EDGE.ground - 35, w: EDGE.hole.w, z: 14, still: true });
    k.add(ladderTop('l12c8-ladder'), { x: 720, y: 430, w: 600, z: 26, still: true });
    // Everyone is on the ladder, heads poking up through the cloud.
    const mf = k.character('moonface', { x: 680, y: 460, w: 190, z: 25, flip: true });
    const hero = k.character('hero', { x: 830, y: 470, w: 180, z: 27, flip: true });
    const oom = k.character('oomboom', { x: 975, y: 450, w: 195, z: 25, flip: true });
    drumless(k, oom);
    k.set([mf, hero, oom], { y: 120 });
    k.music('sneaky');
    k.fx.wind(2);
    await k.all(...[mf, hero, oom].map((el, i) => k.wait(i * 200).then(() => k.to(el, 0.6, { y: 0, ease: 'back.out(1.4)' }))));

    // Nine goblins in three threes, the first carrying the big drum.
    const GW = 84;
    const gobs = [0, 1, 2].flatMap((t) =>
      [0, 1, 2].map((j) =>
        goblin(k, `l12c8-gob-${t}-${j}`, {
          x: 400 - t * 160 - j * 48,
          y: EDGE.ground - GW * (340 / 240) * 0.96,
          w: GW,
          z: 12 - j,
          drum: t === 0 && j === 1,
        }),
      ),
    );
    k.set(gobs, { x: -700 });
    badBoom(6);
    tiptoe(12);
    await k.all(k.say('march'), ...gobs.map((g) => k.to(g, 3, { x: 0, ease: 'power1.out' })), goblinBob(k, gobs, 10, 0.3));

    // Count them in threes.
    const tags: HTMLElement[] = [];
    const counting = async () => {
      for (let t = 0; t < 3; t++) {
        const tag = k.add(roundTag((t + 1) * 3, C.goldLight, `l12c8-tag-${t}`), { x: 400 - t * 160 - 20, y: 330, w: 70, z: 30 });
        k.set(tag, { opacity: 0 });
        tags.push(tag);
        k.fx.pop();
        badBoom(2);
        await k.all(k.appear(tag, 0.25), goblinBob(k, gobs.slice(t * 3, t * 3 + 3), 2, 0.25));
        await k.wait(350);
      }
    };
    await k.all(k.say('count'), counting());
    await k.all(...tags.map((tg) => k.fade(tg, 0, 0.3)));

    k.music('spooky');
    await k.all(k.say('stop', oom), k.shake(oom, 8, 2));
    snicker();
    await k.all(k.say('goblin'), goblinBob(k, gobs, 6, 0.3));

    // One by one, down the goblin hole: the parade shuffles forward each time.
    const mouth = EDGE.hole.x + EDGE.hole.w / 2 - GW / 2;
    const parade = async () => {
      for (let i = 0; i < gobs.length; i++) {
        const dx = mouth - at(gobs[i])[0];
        const rest = gobs.slice(i);
        if (dx > 2) {
          tiptoe(2);
          await together(k, rest, Math.max(0.2, dx / 320), { x: `+=${dx}`, ease: 'none' });
        }
        if (i === 1) badBoom(3);
        else k.fx.whizz();
        await k.to(gobs[i], 0.35, { y: '+=170', ease: 'power2.in' });
        k.remove(gobs[i]);
      }
    };
    await k.all(k.say('hole', mf), parade());
    snicker();
    k.fx.thud();

    // ---- The clock on the edge: five to six… six o'clock.
    k.silence();
    tickTock(2);
    await runClock(k, face, 5, 60, 1.2);
    chimeTime();
    k.fx.rumble(2.5);
    void k.quake(4);
    await k.all(k.say('six', mf), k.shake(hero, 4, 1));
    // The land rises away, playing its last sad little tune.
    farewellTune();
    k.music('dreamy');
    const going = k.all(...[edge, face, hb, hf].map((el) => k.to(el, 6, { y: '-=900', ease: 'power1.in' })));
    await k.all(k.say('away'), going);
    await k.wait(400);

    // ------------------------------------- scene 2: home, with no drum
    let h2!: HTMLElement;
    let o2!: HTMLElement;
    let m2!: HTMLElement;
    await k.cut(() => {
      k.backdrop(moonRoom('l12c8-room'));
      k.light(590, 236, 230, { color: '#c9d4ff', strength: 0.25 });
      k.ambient('dust', { count: 12 });
      h2 = k.character('hero', { x: 110, y: 360, w: 240, z: 20 });
      o2 = k.character('oomboom', { x: 360, y: 340, w: 240, z: 19 });
      drumless(k, o2);
      m2 = k.character('moonface', { x: 880, y: 350, w: 250, z: 20, flip: true });
    });
    k.music('cosy');
    flump();
    await together(k, [h2, o2, m2], 0.3, { y: '+=10' });
    await together(k, [h2, o2, m2], 0.3, { y: '-=10' });
    boom(1, 0.4, true);
    await k.all(k.say('noboom', o2), k.to(o2, 0.8, { rotation: -5, ease: 'sine.inOut' }));

    const keep = k.keepsake(k.chapter?.keepsake ?? 'bigDrum', { x: 610, y: 500, w: 150, z: 24 });
    const seal = k.add(landSeal(12), { x: 480, y: 70, w: 220, z: 30 });
    k.set([keep, seal], { opacity: 0 });
    k.fx.pop();
    await k.appear(keep, 0.4);
    k.fx.jingle();
    await k.appear(seal, 0.6);
    k.sparkle(590, 180, 16, 200);
    k.float(seal, 6, 2);
    await k.all(k.say('prize'), k.hop(h2, 30, 2));
    await k.all(k.say('promise', h2), k.to(o2, 0.6, { rotation: 0, ease: 'back.out(2)' }));
    await k.hop(o2, 20, 1);
    await k.wait(300);

    // ------------------------------------- scene 3: a new land arrives
    let fair!: HTMLElement;
    let h3!: HTMLElement;
    let p3!: HTMLElement;
    let o3!: HTMLElement;
    const box = TREE_SPOTS.cloud;
    await k.cut(() => {
      k.silence();
      k.backdrop(tree('l12c8-tree'));
      fair = k.landFar(13, { x: box.x, y: box.y, w: box.w, z: 4 });
      k.dim(0.3, '#1c2440');
      h3 = k.character('hero', { x: 20, y: 470, w: 230, z: 40 });
      p3 = k.character('saucepan', { x: 470, y: 470, w: 230, z: 40 });
      o3 = k.character('oomboom', { x: 930, y: 470, w: 230, z: 40, flip: true });
      drumless(k, o3);
      k.set(fair, { y: -220, opacity: 0 });
    });
    k.music('dreamy');
    k.ambient('stars', { count: 20, area: [0, 0, 1180, 300] });
    k.fx.wind(3);
    fairTune();
    await k.to(fair, 3, { y: 0, opacity: 1, ease: 'sine.out' });
    k.light(590, 100, 260, { color: C.candle, strength: 0.25 });
    await k.say('fair', h3);
    await k.all(k.say('bear', p3), k.hop(p3, 26, 2));

    // Far, far below: boom… boom.
    k.silence();
    await k.wait(600);
    boom(2, 0.9, true);
    await k.wait(1600);
    boom(2, 0.9, true);
    await k.all(k.say('listen', o3), k.shake(o3, 3, 1));
    void k.all(k.fade(h3, 0, 1.2), k.fade(p3, 0, 1.2), k.fade(o3, 0, 1.4));
    await k.camera({ zoom: 1.8, x: 590, y: 110 }, 3);
    fairTune();
    boom(1, 0.9, true);
    await k.wait(1400);
    const black = k.add(blackSheet(), { x: 0, y: 0, w: 1180, h: 820, z: 90, still: true });
    k.set(black, { opacity: 0 });
    await k.to(black, 1.8, { opacity: 1, ease: 'none' });
    await k.wait(800);
  },
});
