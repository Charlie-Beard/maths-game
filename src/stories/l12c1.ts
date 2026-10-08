/**
 * Land 12, chapter 1: Oom-Pah-Pah!
 *
 * A new land at the top of the tree, and it's Mr Oom Boom Boom's own: the
 * Land of Music, where everything goes in threes. He shows {name} his
 * pride and joy, the big drum on its stand (remember it: the goblins take
 * it in chapter 6), and gives {name} a conductor's baton. One wave of it
 * and the band plays oom-pah-pah: three bars of three beats, counted in
 * threes as the notes pop up (3, 6, 9), the chapter's counting in 3s.
 * Then the Saucepan Man clanks in, having heard "bar" as a chocolate bar.
 * Next: Three Beats to a Bar.
 */
import { defineStory, type Kit } from './kit';
import { wave } from './bits';
import { barsOfThree, boom, boomDrum, clank, drumOnStand, oomPah } from './music';

export default defineStory({
  lines: {
    hello: { who: 'oomboom', text: 'Oom boom boom! Welcome to MY land, {name}! Here, all the music goes in threes.' },
    drum: { who: 'oomboom', text: 'And that is my big drum. The biggest, boomiest drum in all the lands!' },
    baton: { who: 'narrator', text: 'He gave {name} a baton. Wave it, and the band plays!' },
    count: { who: 'narrator', text: 'Oom-pah-pah! Three beats in every bar. Three bars: three, six, nine beats!' },
    next: { who: 'saucepan', text: 'EH? A BAR? A chocolate bar? Wait for me! Clank, clank!' },
  },

  async play(k: Kit) {
    k.landScene();
    k.music('adventure');
    const drum = drumOnStand(k, 'l12c1-drum');

    const oom = k.character('oomboom', { x: 30, y: 352, z: 20 });
    const hero = k.character('hero', { x: 900, y: 352, z: 20, flip: true });
    boom(3, 0.35);
    await k.all(k.enter(oom, 'left'), k.enter(hero, 'right'));
    await k.say('hello', oom);

    // ---- His pride and joy: the big drum.
    await k.all(k.say('drum', oom), (async () => {
      await k.wait(1200);
      await boomDrum(k, drum, 3);
    })());

    // ---- A baton for {name}.
    const baton = k.keepsake(k.chapter?.keepsake ?? 'baton', { x: 420, y: 160, w: 160, z: 30 });
    k.set(baton, { opacity: 0 });
    k.fx.twinkle();
    await k.appear(baton, 0.4);
    k.sparkle(500, 240, 12, 120);
    const giving = async () => {
      await k.wait(800);
      await k.to(baton, 0.8, { x: 370, y: 200, rotation: -20, scale: 0.8, ease: 'power2.inOut' });
      baton.style.zIndex = '26';
    };
    await k.all(k.say('baton'), giving());

    // ---- One wave, and the band plays: three bars of three.
    k.silence();
    void k.to(baton, 0.3, { rotation: 10, yoyo: true, repeat: 3, ease: 'sine.inOut' });
    const notes = await barsOfThree(k, 3, { x: 320, y: 90, name: 'l12c1' });
    k.music('triumph');
    oomPah(2);
    await k.all(k.say('count'), wave(k, oom, 'armR', 2), k.hop(hero, 30, 2));
    await k.all(...notes.map((n) => k.fade(n, 0, 0.4)), k.fade(baton, 0, 0.4));

    // ---- Clank, clank: the Saucepan Man has heard "bar".
    const pan = k.character('saucepan', { x: 460, y: 380, w: 250, z: 24 });
    clank(6);
    await k.enter(pan, 'bottom', 0.8);
    await k.all(k.say('next', pan), k.hop(pan, 24, 2), (async () => clank(4))());
    await k.wait(500);
  },
});
