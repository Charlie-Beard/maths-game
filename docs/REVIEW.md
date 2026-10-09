# Review

A review of the finished game (all 14 lands) against the rules in
[CLAUDE.md](../CLAUDE.md) and the design in [PLAN.md](PLAN.md).

- **Phase 0:** the baseline.
- **Phase 1:** the rules that never bend.
- **Phase 2:** the maths. That covers the generators, the curriculum, mastery and Silky's help.
- **Phase 3:** a play-through: every screen, and the pacing.
- **Still to do:** audio, and robustness.

Each finding says what was done about it: **fixed**, **left** (with the
reason), or **open** (a choice still to make).

## Phase 0: baseline (2026-10-09, `main` at 8eeec19)

| Check | Result |
|---|---|
| `npm run typecheck` | Pass (7 s) |
| `npm test` | 424 / 424 pass, 24 files (11 s) |
| `npm run build` | Pass. `dist` is 1.7 MB. `main.js` is 685 kB (233 kB gzipped), over Vite's 500 kB warning. Each story is already its own chunk. |
| `npm run test:e2e` | 160 pass, 16 skipped on purpose (finales run at 1180 × 820 only). **25 minutes**, 22 of them in `finale.spec.ts`. |

## Phase 1: the rules that never bend

**How it was checked:**
- A Playwright walk of 833 screen states at 1180 × 820: every scene, every fixture of all 19 activity kinds at every help level, and eight chapters across the lands.
- A code search for each motion and touch rule.
- A script over every spoken line in `scripts/voice/lines.json`.
- A read of every story and finale.

No rule is broken on an ordinary problem screen.

**Fixed:**
- **The idle hint talked over a slow count.** Taps inside an activity didn't restart the 12 s timer, so Silky re-read the question in the middle of counting. Now any touch on the activity holds the hint (`src/scenes/play.ts`).
- **The grown-ups' gear** is now a 72 px tap area round its small 60 px seal. **The grown-ups' corner's** tabs, buttons, choices and select are 72 px tall.
- **Coin labels** are as big as the coin face allows (about 20% bigger). Coins keep their real relative sizes, which is how he learns to tell them apart. So a small coin's label can't reach the 64 px of an answer number; the amount he answers with is on the price tag or the cards.
- **Unused letter-tile CSS** from Wizard Words, with endless glow and bounce loops, has been removed.
- **The longest spoken sentences** have been split. The voice script is re-exported.

**Left, with the reason:**
- **The compare count tags** (34 px, at help 2–3) are labels, not answers or buttons.
- **The finale's stage shake** happens between answers (after a right one), never while he's answering.
- **Calm mode** has since been removed altogether, at the parent's request.

**Checked and clean:**
- **No failing:** no lives, timers, buzzers or game over.
- **No flashing**, and no endless motion on problem screens.
- **No `steps()` eases** or boil frames.
- **Touch:** no hover, and no drag-only actions.
- **Layout:** no `vw`, `vh` or `@media`.
- **Text:** Andika everywhere, and UK English throughout.
- **Randomness:** `Rand`, not `Math.random`, in `src/core`.
- **Stories:** no hitting or hurting. Scary scenes never reach a problem screen.

**Tone:** the parent has reviewed the scary moments flagged in the stories (cliffhanger endings, "NO child has EVER finished my sums", Dame Snap's intros) and is happy with them as they are.

## Phase 2: the maths

**How it was checked:**
- **Generators:** 2,000 problems for every tier of all 62 skills (about 240,000). Each answer was recomputed from the written sum, the spoken numbers or the picture. The choices, the tier spec, dull problems and variety were also checked.
- **Curriculum and mastery:** every chapter checked against its skills' `needs`. Then five simulated children (strong, typical, struggling, erratic, quick-tapping) played the whole game through the real round and mastery code.
- **Silky's help:** each activity driven in the browser, wrong three times, then the final hint followed.

### Fixed

**Mastery** (`src/core/mastery.ts`)
- **A mastered skill dropped a tier on any one slip,** even one wrong answer among the five focus problems of a chapter. That was 95–100% of all tier drops in the simulation, and it made tiers swing up and down. Now only a slip on a *due* review drops the tier. Other slips still send it back to box 1, so it comes up for review again soon.
- **One answer could drop a tier twice.** This happened when the "Silky helped twice" rule and the review-slip rule both fired.
- **The review slot repeated one skill.** When nothing was due, the most overdue skill always came first. A right answer that wasn't due left its date alone, so the same skill was the review problem chapter after chapter (61 of 83 review slots, for one simulated child). Now it's the mastered skill he practised longest ago.

**Generators**
- **turns, tier 4:** the explanation said "Left and right are turns, not steps". But the path is walked turn-then-step, and the right flag depends on it. Now the question and the explanation both say "turn, then step".
- **time, tier 5:** more than half the problems offered impossible choices like "4 past 8". That distractor is now the hands swapped, which is a real clock reading.
- **shapes-2d, tier 2:** "This window has gone topsy-turvy!" sometimes showed a square turned 90° or 180°, which looks upright. Now the turn always shows.
- **add-5, add-10, sub-10:** picking the total first made "1 + 1" a quarter of all add-5 problems. Now every pair is equally likely.
- **bonds-10:** "How many more to fill it?" with a full tin (answer 0) was nearly one problem in five. 0 and 10 now come only now and then.
- **word-problems, tier 4:** 14% of the two-step stories gave back exactly what came, so the answer was just the first number. Now it's under 1%.
- Unit tests cover each of these.

**Silky's help** (`src/scenes/play.ts`, `src/activities/`)
- **Quick taps raced up the ladder.** Four wrong taps on different cards a quarter of a second apart reached level 3 (Silky shows the answer) in about one second, skipping levels 1 and 2. After a wrong answer, other answers now wait 1 s, long enough to see the wobble and hear the help. There is an e2e test for this.
- **choose, help 1, showed nothing on text-only problems.** It made the (empty) picture glow. Now the written sum sits on a gold band.
- **choose word cards** ("odd", "even") were up to 240 px tall from y 600, so they were cut off at the bottom of the stage. They are now at most 160 tall.
- **measure, putting things in order:**
  - Help 2 did nothing if he had already picked one. Now it starts again from the first one, put in place for him.
  - Help 3 could point past a wrong pick. Now wrong picks are taken back first.
- **clock, setting the time:** after help 3 the "+" buttons kept glowing when the hands were already right. Now each glows only while its hand has a way to go.
- **coins, paying:** asking Silky again at help 3 swept his coins off the counter. Now it leaves them.

- **Skills he hasn't mastered never came back after their land.** Review used only mastered skills, so a struggling child could leave 13–20 skills behind for good (typical children 7–9). Now the review slot and Practice with Silky take mastered skills that are due first. Next come skills he has played but not mastered (least recently practised first, so they take turns), then the other mastered skills. In the simulation the skills left behind fell to 4–5 for a struggling child and 1–2 for a typical one, all from the last lands.

### Left, with the reason

- **Curriculum order is sound.** Every skill's `needs` come first, every skill is used, and no skill starts above tier 1.
- **Nobody got stuck.** Every simulated child finished all 112 chapters. The final help level always makes the answer reachable. There's no dead end, and nothing locks.
- **Low-value cases kept as real maths:** ×1 in the times tables, "5 ÷ 5", and "just before 1 is 0".

### Open: design choices for the parent

These are design choices backed by the simulation, not bugs:

1. **Few skills reach "mastered".** Mastery needs at least 8 problems on a skill, and most skills get about 20 in the whole game. Typical children master about 25–36 of 56. The bar could be lower (6 problems), or Practice could lean on skills that are nearly mastered.
2. **"Mastered" can mean a low tier.** The bar is the current chapter's ceiling, so `add-10` can be mastered at tier 3 of 5. 24 skills never have a chapter whose ceiling reaches their top tier.
3. **Chapter floors override a struggling child's tier.** A chapter with floor 3 plays tier 3 even when his tier for that skill is 1. PLAN.md says "a skill he finds hard simply stays concrete for longer", and floors cut against that. The simulated struggling child played above his own tier on 140–173 problems.
4. **Help 2 gives the answer away in a few activities:**
   - `compare`: the scales tip.
   - `share`: counts under the plates.
   - `groups`: the running totals.
   - `tensOnes` read mode: the sum is finished.
   - `measure` with two things: the wrong one is washed out.

   In these, help 3 adds nothing new. Gentler versions: show the counts without the total, or tip the scales only partway.
5. **With only two choices** (odd/even, two cards), help 2 has no wrong card to take away, so it adds nothing.
6. **Asking Silky first** gets "Hmm, have another look", although he hasn't answered yet.

## Phase 3: play-through

**How it was checked:**
- **Screens:** screenshots at 1180 × 820 and 1180 × 760, put together into 57 contact sheets. They cover every scene, the map for all 14 lands, the first problems of every land, every activity fixture (at help 0 and help 3), every finale, and story frames.
- **Pacing:** the real flow played with a simulated voice (about 2.5 words a second) on a virtual clock. Spoken lengths are estimates; everything else is measured.

### Pacing (measured, with estimated speech)

| | |
|---|---|
| Returning day, open to first problem | 3 taps, about 5 s |
| New child, open to first problem | 5 taps, about 16 s (the opening film is 119 s, or 1 tap to skip) |
| Right answer to next question | about 4 s typical, up to about 7 s (the working line) |
| Ordinary chapter, all right first time | about 37 s of play, plus the story |
| Stories | ordinary 20–43 s (median 30 s); finales 67–120 s; the ending 144 s; Skip on every one |
| Reward screen | Next can be tapped at once; the voice runs about 5–11 s |

- **Shape:** every chapter has the same shape: intro, 8 problems, story, reward.
- **Daily limit:** "Come back tomorrow" is gentle and said once. Replays and Practice stay open after it.
- **Errors:** none from the game, and no stuck screens.

### Fixed

- **Three story lines were cut off mid-sentence** (land 9, chapters 2–4): the next line started before the first finished. Now each first line finishes.
- **Silky's working was said twice:** once when she helps, then again when he taps the answer. Now it's said once.
- **The idle hint repeated forever** (every 12 s) if he walked away. Now it repeats at most twice per question.
- **The story safety cut-off** (180 s for long stories) was close to the ending's 144 s. Slower recorded voices could have hit it. Now it's 240 s (90 s for ordinary stories).
- **Answer rows ran off the finale desk:** four clock cards reached x 1083, over the ladder strip. And on the fraction fixtures a "half" card sat behind the child's portrait. Answer rows now stay between x 160 and 1030.
- **Map seals crowded the tree:** they sat on Silky's hammock, against stop 6's badge, and on the Treasures button. Four hooks were moved into clear space. (The title banner covering the land, noted in the roadmap, was already fixed.)
- **Low contrast:**
  - The reward screen's gold keepsake name sat on the gold glow. It now has a dark halo.
  - The dark finale intros (Dame Snap's) had a dim brown land line on near-black. It's now pale.

### Left, with the reason

- **The measure dial overlaps the scale's base.** It reads as the scale's face.
- **Silky sits over the finale's progress strip.** She covers part of the ladder or trunk. The climbers stay visible, and moving her would break where she always is.
- **Story captions cover the actors' feet** in a few frames. That's the caption band's fixed place.
- **Plain-equation problems leave the picture box empty.** That's by design for the abstract tiers.

### Fixed after the parent's go-ahead

- **The progress dots grew from 8 to 9 or 10** when a problem Silky helped with came back at the end. Now the row is always the chapter's own count (8, or a finale's 10). An extra problem is a small star just after the row, so the dots never move.
- **The working line couldn't be skipped**, and it runs up to about 7 s. Now a tap anywhere ends the working (and any praise) and moves on. The answer is already counted.
- **Finale gaps of 6–17 s:**
  - Finales no longer add random praise; the beat after each answer is the praise.
  - The desk comes and goes faster, and two fixed pauses are gone.
  - With the working now skippable, the gap between finale problems is mostly the beat itself.
  - The climax after the last answer stays as it is: it's the payoff, not waiting.
- **The daily limit line ran straight on from a cliffhanger story.** Now it waits a moment, and it says "The story goes on tomorrow!"
- **Leaving mid-chapter started it again with new numbers.** Now his place is kept on that iPad, and picking the chapter again carries on from the same problem. Finishing the chapter clears it. Finales start again, since their set piece builds step by step.

## Still to do

- **Phase 4, audio and voice:** check every spoken line is exported, and check pronunciation of numbers.
- **Phase 5, robustness:**
  - the save
  - leaving and coming back mid-problem
  - memory over 20 chapters
  - speed on an older iPad
- **e2e speed:** split `finale.spec.ts` (22 of the suite's 25 minutes) into several files so they run in parallel.
