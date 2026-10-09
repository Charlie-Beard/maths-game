# Up the Faraway Tree: notes for agents

A Magic Faraway Tree maths game for one 6-year-old (autistic, possibly
ADHD) on an iPad in landscape, in torn paper. Read
[docs/PLAN.md](docs/PLAN.md) (the design) and
[docs/ROADMAP.md](docs/ROADMAP.md) (your workstream's brief) before
changing anything. The engine is shared with Wizard Words
(`charlie-beard/spelling-game`): when in doubt about how something is done,
look at how that repo does it.

## Commands

```bash
npm install
npm run dev            # http://localhost:5173  (?scene=map|chapter|story|practice|album|parent|skill|fixtures &id=l1c1 &seed=7)
                       # the dev server starts signed in (offline); add ?login to see the password screen
npm run typecheck
npm test               # Vitest: src/core (pure logic)
npm run test:e2e       # Playwright at 1180×820 and 1180×760 (in the cloud: PW_CHROMIUM=/opt/pw-browsers/chromium)
npm run build
```

All of typecheck, `npm test` and `npm run test:e2e` must pass before a PR.
Look at screenshots of anything visual you change, using Playwright at
1180 × 820.

## Rules that never bend

- **One fixed stage, 1180 × 820, landscape only.** Place everything with
  `place(el, x, y, w, h)` in stage coordinates. No responsive layouts.
- **Touch only:** tap targets of 72 px or more, no hover, and a tap path for
  everything (drags are optional extras).
- **No failing:** no lives, no timers, no buzzers, no "game over". Wrong
  answers wobble and help steps up (PLAN.md §5).
- **No flashing**, and no background motion while he's answering. (There
  is no calm mode: the parent decided it isn't needed.)
- **Scary is fine, cruel isn't** (PLAN.md §2). Dame Snap looms, shrieks,
  stomps and snaps rulers, but she never hits, slaps or hurts anyone.
  Nobody is lost for good. Scary scenes appear only in stories and
  finales, never on an ordinary problem screen.
- **Original art only:** torn paper via `src/art/paper.ts`. No film
  stills, no logos, no actor likenesses, no film fonts.
- **UK English** in everything he hears or reads ("maths", "colour",
  "take away", "Mum"). Short sentences: a 6-year-old is listening.
- **Andika** for all text. Numbers he answers with are 64 px or more.

## Code conventions

- TypeScript, strict, no framework. GSAP for motion through `ui/anim.ts`
  (`sm`, `stepped`), moving smoothly at the screen's own rate. No `steps()`
  eases and no boil frames: held frames read as flicker on the iPad.
- `src/core/` is **pure** (no DOM, no audio) and unit-tested. Randomness
  comes in as a `Rand` (`core/random.ts`), never `Math.random`, so problems
  are repeatable.
- Scenes extend `Scene` (`ui/scene.ts`): build DOM in `build()`, use
  `this.tap()`, `this.later()` and `this.sleep()` so cleanup is automatic.
- Comments explain *why* and describe the design in plain words, as the
  existing files do. Match the surrounding style.
- **Spoken text:** use `{name}` for the child's name and `{slots}` for
  numbers in questions (`Speech` in `core/problem.ts`). Story lines are
  listed up front in `defineStory({ lines })`, so the voice export can find
  them.
- Registries (`activities/index.ts`, `stories/index.ts`,
  `generators/index.ts`) get append-only edits, to keep parallel PRs
  mergeable.
- Search for `SCAFFOLD` to find stand-ins waiting for a workstream.

## Map of the code

| Where | What |
|---|---|
| `src/core/skills.ts` | The 48 skills, their tiers (the spec for generators) and prerequisites |
| `src/core/generators/` | (tier, rand) → Problem, one per skill |
| `src/core/problem.ts` | Problem, Visual, Speech, ActivityKind, PropId |
| `src/core/mastery.ts` | Per-skill tiers, scores, mastery, Leitner review |
| `src/core/round.ts` | Building a chapter's 8 problems; playing a round with help levels |
| `src/core/curriculum.ts` | 10 lands × 8 chapters: the order of the whole game |
| `src/core/progress.ts` | The save: chapters, skills, rewards, settings |
| `src/activities/` | How he answers: one module per ActivityKind (`choose` is the fallback) |
| `src/scenes/` | Title, choose, map, intro, play, story, complete, album, parent |
| `src/stories/` | `kit.ts` (the puppet-show kit) and one script per story |
| `src/art/` | Paper engine, palette, characters, props, scenery |
| `src/audio/` | Web Audio engine, sfx, synth (story sounds and music), voice |
| `src/save/local.ts` | The `Profile` interface scenes use |
| `src/cloud/`, `api/` | The cloud save: `CloudProfile` (device first, synced) and its Cloudflare Worker |
