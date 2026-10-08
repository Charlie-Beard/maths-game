# TODO: lands 11–14 (session 6, in progress)

These four lands come after Dame Snap is beaten: the Old Woman's Shoe, the
Land of Music, Roundabouts and the Red Goblins. The plan, the story arc and
who owns which files are in [docs/ROADMAP.md](docs/ROADMAP.md) under
"Session 6". The branch is `claude/new-lands`, and it has not been merged
into `main` yet.

## Done (on `claude/new-lands`)
- The foundation:
  - the curriculum for lands 11–14
  - 8 new skills
  - the `tally`, `turn`, `solid` and `measure` visual types
  - the ending film now plays after `l10c8`
  - 14 seal hooks on the map tree
  - stub files for each land
- The art for all four lands: the hosts (`oldWoman`, `whirligig` and `redGoblin`), the backdrops, the keepsakes and the seals.
- The maths for land 11 (`tally`, `change`) and land 12 (`count-3s`, `time-5`).

## Still to merge
1. **The land 13 maths (`turns`, `shapes-3d`) and the land 14 maths (`compare-measures`, `read-scales`).** Partial implementations are saved on `worktree-agent-afcf4f338c6789aa1` and `worktree-agent-aa41dfc1117779410`. Review and finish them, then merge.
2. **The stories.** The S-11 to S-14 agents push to the remote branches `s11-stories`, `s12-stories`, `s13-stories` and `s14-stories`. Merge each one into `claude/new-lands`. If a branch is missing, that land's stories still need writing (brief in ROADMAP.md).
   - Story 13 also fixes the helter-skelter being clipped at the top of land 13's far view.
   - Two unregistered story-helper drafts are saved on `worktree-agent-a3f846ff5d68b6f7e` (land 12) and `worktree-agent-aa6070d909c0d43d3` (land 14); the chapter stories still need writing.

## Checkpoint (2026-10-08)

- Land 13 maths/activity WIP: commit `b33a48c` on `worktree-agent-afcf4f338c6789aa1`.
- Land 14 maths/activity WIP: commit `5813666` on `worktree-agent-aa41dfc1117779410`.
- Story helper drafts: `7ac3f35` (land 12) and `6c6d944` (land 14).
- Typecheck and full unit tests passed on the maths branches. The Playwright runs were stopped before completion; rerun them after picking up the branches.
- Temporary `zz-shots.spec.ts` and `zz-dbg.spec.ts` files were intentionally not committed.

## Then
- Run `npm run typecheck`, `npm test` and `npx playwright test --workers=8 --fully-parallel`.
- Look at screenshots of each new land: the map, a chapter at every tier, and each story.
- Open a pull request from `claude/new-lands` to `main`.

## Known issues
- The `activities-c.spec.ts` test "real generated problems play: time, coins and shapes" already failed before this work began (at cfdc1ff). It isn't caused by the new lands. After a right answer on `?scene=skill`, the next problem never appears, so the play scene seems stuck waiting for the voice or the activity after a right answer. This needs looking into.
- `finale.spec.ts` "land 3" failed once under heavy load. It may be flaky.
- The three new characters (`oldWoman`, `whirligig`, `redGoblin`) have stand-in voices in `scripts/voice/elevenlabs.json`. A parent should choose real ones.
- The `describe()` function in `src/activities/visual.ts` gives a generic label for the new visual types.
