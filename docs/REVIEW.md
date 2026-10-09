# Review: phases 0 and 1

A review of the finished game (all 14 lands) against the rules in
[CLAUDE.md](../CLAUDE.md) and the design in [PLAN.md](PLAN.md). Phase 0 is
the baseline; phase 1 checks the rules that never bend. Later phases (the
maths, a play-through, audio, robustness) come next.

Findings are ranked **must fix** (breaks a rule where he plays), **should
fix**, **nice to have**, and **for the parent** (a choice about tone, not a
bug).

## Phase 0: baseline (2026-10-09, `main` at 8eeec19)

| Check | Result |
|---|---|
| `npm run typecheck` | Pass (7 s) |
| `npm test` | 424 / 424 pass, 24 files (11 s) |
| `npm run build` | Pass. `dist` is 1.7 MB. `main.js` is 685 kB (233 kB gzipped), over Vite's 500 kB warning; each story is already its own chunk |
| `npm run test:e2e` | 160 pass, 16 skipped on purpose (finales run at 1180 × 820 only). **26 minutes**, 22 of them in `finale.spec.ts` |

## Phase 1: the rules that never bend

How it was checked: a Playwright walk of 833 screen states at 1180 × 820
(every scene, every fixture of all 19 activity kinds at every help level,
eight chapters across the lands), a code search for each motion and touch
rule, a script over all 1,635 lines and 2,118 pieces in
`scripts/voice/lines.json`, and a read of every story and finale.

### Must fix

None. No rule is broken on an ordinary problem screen.

### Should fix

1. **The idle hint can talk over him while he counts.** `restartIdle()`
   (`src/scenes/play.ts:180`) is only restarted by a new question, an answer
   or closing the leave card. Taps inside an activity (counting dots,
   filling a ten frame, adding coins) don't restart it, so after 12 s Silky
   re-reads the question in the middle of a slow, careful count. Any touch
   on the activity should restart the timer.
2. **The 64 px answer rule fails on the coins activity.** The value on each
   coin (`drawCoin`, `src/activities/visual.ts:39`) is 26–57 px: the choice
   coins (`coins.ts:122`) are 37–57 px and the purse coins (`coins.ts:210`)
   are 26–40 px. The coins themselves are big enough to tap, and real coins
   *should* differ in size, so the fix is a bigger label (or a smallest coin
   size), not equal coins.

### Nice to have

3. **Two small calm-mode gaps.** Silky's wing flutter in `l2c7` (`flutter`,
   `src/stories/l2c7.ts:217`, 0.3 s × 40) has no `k.calm` check, unlike the
   same helper in `l1c7`. The reward screen's bump
   (`src/scenes/complete.ts:175`) also runs in calm mode. Everything else
   checked (the scene change, finale effects, goblin scurry, other story
   loops) already respects calm mode.
4. **The grown-ups' gear is 60 × 60** (`src/ui/gear.ts:14`), under 72. Being
   small and in a corner may be deliberate, to keep him away from it. If so,
   say so in a comment; if not, grow the hit area to 72 and keep the 60 px
   seal.
5. **The grown-ups' corner** has tabs, buttons and a select at 47–56 px high
   (`src/styles/parent.css:59, 77, 365`). It's for adults, but the rule says
   everything.
6. **The compare count tags** at help 2–3 are 34 px (`compare.ts:121`). They
   are labels, not his answer, so this is borderline.
7. **Dead CSS** from Wizard Words: `.tile.glowing` with endless
   `glow-pulse` / `hint-bounce` (`src/styles/ui.css:109, 119`). Nothing uses
   it; deleting it stops it coming back by accident.
8. **24 spoken sentences are over 14 words**, out of about 8,600. Most are
   "A new land has come to the top of the tree: The Land of X!" (split it:
   "…the top of the tree. It is the Land of X!"). Others: "Up they all went:
   past Dame Washalot's tub…", and "won the seal of the Land of Music, and a
   picture of the big drum" (in `lines.json` and in `src`). Changing a line
   means re-exporting the voice script before anything is recorded.
9. **Small wording:** "Who's got the pennies?" (`src/core/curriculum.ts:198`)
   could say pence; "Set the clock to 20 past 5" (`fixtures-c.ts`) reads
   better as "twenty past five".
10. **e2e speed:** 22 of the suite's 26 minutes are `finale.spec.ts`.
    Splitting it into several files (Playwright runs files in parallel)
    would make every PR faster.
11. **Bundle:** `main.js` is 685 kB. It's cached offline after the first
    load, so this only matters for the first visit and updates.

### Checked and clean

- **No failing:** no lives, timers, countdowns or game over. The "wrong"
  sound is a soft two-note hum (`src/audio/sfx.ts:93`) and wrong answers
  wobble (`src/ui/anim.ts:40`).
- **No flashing:** the title candle (0.5–1.4 s drifts, skipped in calm mode)
  and the parent REC dot are the only flickers, and neither is on a problem
  screen.
- **No background motion while he answers:** the play scene and the
  activities start no endless loops. The finale's shake runs between
  answers, after a right one, and calm mode skips it.
- **No `steps()` eases or boil frames.** (`stepped()` in `ui/anim.ts` is now
  just a plain ease; only its name is left over.)
- **Touch only:** no hover, no `pointermove`, no drag-only actions; every
  tap goes through `ui/dom.ts`, which ignores drags and repeated taps.
- **Fixed stage:** no `vw`, `vh` or `@media`; only `src/stage.ts` scales.
- **Andika** everywhere.
- **`Rand`, not `Math.random`,** in `src/core` (except where it makes a
  seed, which is what it's for).
- **UK English:** no American spellings or words in anything he hears or
  reads. "TEN SPENCE?" is the Saucepan Man mishearing, on purpose.
- **Tap targets of 72 px or more and answer numbers of 64 px or more** on
  choice cards, the number pad and its answer box, and every other
  activity. (The clock hands and shape sides look thin, but their stroke is
  72 px.)
- **No hitting, slapping or hurting** anywhere in the stories or finales.
  No Dame Snap or scary art or sound ever reaches a problem screen.

### For the parent: tone

The story read found nothing cruel by the rule's definition, and several
moments it flagged are in PLAN.md on purpose ("I will SNAP you up!", Silky
taken at the end of land 7, Dame Snap shut in her detention cupboard).
These are worth a look by someone who knows him:

- **Chapters that end on fear.** `l1c8` ("Somebody with a ruler…", the very
  first land), `l4c7`, `l7c8`, `l10c7`, `l11c8`, `l12c8` and `l13c8` (the
  goblin gloats, then black). These are often the last thing before he
  stops for the day. One option: keep the cliffhanger, then add one warm
  last beat (Moon-Face's lamp, "Silky's dewdrop is still glowing").
- **"You might never get home!"** (`l1c8.ts:202`) and "stuck here for
  ever!" (`l7c8`): fear of being left behind.
- **"No child could EVER do it!"** (`l10c6.ts:28`, `l10c8.ts:178`,
  `curriculum.ts:186`). Dame Snap means it as a dare, but he hears "you
  can't".
- **Dame Snap's chapter intros** (`src/scenes/intro.ts`, for `l4c8`, `l7c8`,
  `l10c8`) go dark with an ominous sound and "Nobody leaves my school until
  every sum is done!" just before the problems start.
- **Moon-Face is told off for smiling** with "One HUNDRED lines!"
  (`l4c4.ts:44`, `l4c5.ts:22`).
- **"Oh, only the wind"** in the opening film, when the noise is real.
  Grown-ups saying a scary thing isn't real can cost trust.
- **Wording for Dame Snap's fate** varies: "locked in the cupboard"
  (`l10c8`), "beaten for good" (`finale-lands.ts:129, 220`), "gone for good"
  (`l11c1.ts:23`). One gentle phrase used everywhere ("far, far away") would
  be calmer and consistent.
- **Small story threads:** the Red Goblin is named in `l13c8` before he's
  introduced (`l12c6` would be the place). Silky is away from `l7c8` to
  `l10c8` and the Saucepan Man is gone after `l13c8`; one line at the start
  of each next land ("Silky is safe, and we're coming") would bridge it.
