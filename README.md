# Up the Faraway Tree 🌳

A **Magic Faraway Tree** maths adventure for iPad, in the same hand-torn
paper, stop-motion style as [Wizard Words](https://github.com/charlie-beard/spelling-game).
It's built for one child (aged 6) who can add within 10 and loves the
scary bits, and it runs from there to the end of Year 2 maths over about
six months.

> Non-commercial fan project. All artwork is original: no film images, no
> official logos, no film typeface.

**Status: planned and scaffolded.** A first chapter is playable end to end
with stand-in art. See:

- [docs/PLAN.md](docs/PLAN.md): the full design (story, lands, maths,
  difficulty, cutscenes, rewards and screens)
- [docs/ROADMAP.md](docs/ROADMAP.md): build sessions, workstreams and
  agent briefs
- [CLAUDE.md](CLAUDE.md): conventions for whoever (or whatever) works on
  the code

## The game in one paragraph

He climbs the Faraway Tree with Beth, Joe or Fran. Ten lands come to the
top of the tree one after another (the Enchanted Wood, Topsy-Turvy,
Goodies, Dame Snap's School, Birthdays, Giants, Spells, Toys, Snow, and
Dame Snap's Prison), each with 7 chapters and a finale. Every chapter is 8
spoken maths problems answered by counting, ten frames, number lines,
bundles of sticks, clocks or coins, followed by a paper-puppet story. Each
land ends with a longer finale story, as the land moves on. Difficulty
adapts **per skill** (objects → pictures → numbers), and mastered skills
come back as spaced review. There's no failing, no timer, and Silky the
fairy helps whenever he's stuck.

## Development

```bash
npm install
npm run dev          # http://localhost:5173 (?scene=map, ?scene=chapter&id=l1c6, ?scene=story&id=l1c1, &seed=7)
npm test             # unit tests (skills, generators, mastery, rounds, curriculum, progress)
npm run test:e2e     # Playwright: a full chapter at iPad sizes
npm run build        # production build to dist/ (with offline service worker)
```

## Playing it (once it's built)

The same as Wizard Words: open it in Safari on the iPad, **Share → Add to
Home Screen**, and always play from that icon (full-screen and offline).
The gear in the top-left corner (answer a sum) opens the grown-ups'
corner.

### Switching on GitHub Pages (one time)

1. Merge into `main`.
2. Go to repo **Settings → Pages → Source: GitHub Actions**.
3. The **Deploy to GitHub Pages** workflow publishes every push to `main`,
   at `https://charlie-beard.github.io/maths-game/`.
