/**
 * Land 14, chapter 1: Down the Goblin Hole.
 *
 * The goblins carried the Saucepan Man off as the Land of Roundabouts spun
 * away (l13c8). Now their own land is at the top of the tree. Moon-Face and
 * {name} creep down the rope ladder into the goblin caves. Two goblin sacks
 * hang on a big pan balance: which one is heavier? The beam tips, the heavy
 * side goes down, and the heavy sack spills goblin gold (the chapter's
 * keepsake). Then pit, pat… something is creeping up behind them. It's only
 * the Angry Pixie, who wasn't going to be left out. Next: Sacks of Gold.
 */
import { defineStory, type Kit } from './kit';
import { together } from './bits';
import { balance, cave, goblinSound, ropeLadder, sackArt } from './goblinCave';

export default defineStory({
  lines: {
    down: { who: 'narrator', text: 'Down the rope ladder they crept, into the goblin caves. The Saucepan Man was down here somewhere.' },
    sacks: { who: 'moonface', text: 'Goblin sacks, on goblin scales. Which one is heavier, {name}?' },
    heavy: { who: 'hero', text: 'That one! The heavy side goes down. The light side goes up.' },
    gold: { who: 'narrator', text: 'The heavy sack was full of goblin gold!' },
    creep: { who: 'narrator', text: 'Pit, pat. Pit, pat. Something was creeping up behind them…' },
    pixie: { who: 'pixie', text: 'Shh! It’s only me! You weren’t going without the Angry Pixie, were you?' },
  },

  async play(k: Kit) {
    cave(k);
    k.music('sneaky');
    k.ambient('dust', { count: 10 });

    // A second rope ladder hangs right in the middle of the shot, down from the hole.
    const rope = k.add(ropeLadder(620, 'l14c1-rope'), { x: 470, y: -40, w: 110, z: 9 });
    const bal = balance(k, 590, 330, 12);
    k.set([...bal.parts, rope], { opacity: 0 });

    // ---- Down the rope ladder, one after the other.
    const mf = k.character('moonface', { x: 395, y: 360, w: 230, z: 20 });
    const hero = k.character('hero', { x: 395, y: 380, w: 230, z: 21 });
    k.set([mf, hero], { y: -720 });
    await k.fade(rope, 1, 0.4);
    const told = k.say('down');
    goblinSound.creep(4);
    await k.to(mf, 2, { y: 0, ease: 'sine.inOut' });
    await k.to(mf, 0.7, { x: -250, ease: 'power1.inOut' });
    goblinSound.creep(4);
    await k.to(hero, 2, { y: 0, ease: 'sine.inOut' });
    await k.to(hero, 0.7, { x: 480, ease: 'power1.inOut' });
    k.face(hero, true);
    await told;
    void k.fade(rope, 0, 0.6);

    // ---- Two goblin sacks on the balance: a little one and a big fat one.
    const small = k.add(sackArt('l14c1-small', '#b9a477', 0.62), { x: 0, y: 0, w: 150, z: 16 });
    const big = k.add(sackArt('l14c1-big', '#a98d5e', 1), { x: 0, y: 0, w: 190, z: 16 });
    k.set([small, big], { opacity: 0 });
    bal.load(small, 'L', 150);
    bal.load(big, 'R', 190);
    await k.all(...bal.parts.map((p) => k.fade(p, 1, 0.5)));
    await k.all(k.fade(small, 1, 0.3), k.fade(big, 1, 0.3));
    await k.say('sacks', mf);

    // The beam tips: the heavy side goes down.
    goblinSound.clink();
    const tipping = bal.tilt(1, 1.4);
    await k.all(k.say('heavy', hero), tipping);
    goblinSound.ding(2);
    k.sparkle(760, 420, 12, 120);

    // The heavy sack spills its gold.
    const gold = k.keepsake(k.chapter?.keepsake ?? 'goldSack', { x: 690, y: 250, w: 150, z: 30 });
    k.set(gold, { opacity: 0 });
    goblinSound.clink();
    await k.appear(gold, 0.4);
    k.sfx.sparkle();
    await k.all(k.say('gold'), k.hop(hero, 26, 2), k.wait(150).then(() => k.hop(mf, 22)));

    // ---- Pit, pat… something creeping up from the left tunnel.
    void k.fade(gold, 0, 0.5);
    k.music('sneaky');
    const pixie = k.character('pixie', { x: -30, y: 410, w: 190, z: 24 });
    k.set(pixie, { x: -240 });
    goblinSound.creep(6);
    await k.say('creep');
    await k.all(k.shake(mf, 5, 2), k.shake(hero, 5, 2));
    await k.to(pixie, 0.7, { x: 0, ease: 'back.out(1.4)' });
    k.fx.boing();
    await together(k, [mf, hero], 0.18, { y: '-=30' });
    await together(k, [mf, hero], 0.22, { y: '+=30' });
    await k.all(k.say('pixie', pixie), k.hop(pixie, 22, 2));
    await k.wait(600);
  },
});
