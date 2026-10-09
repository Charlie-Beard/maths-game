import { expect, type Locator } from '@playwright/test';

/**
 * Waits until an element has finished moving into place: its centre stays
 * put (it may still "breathe" in size). Stop-motion animations hold still
 * between frames, which Playwright alone can mistake for having stopped.
 */
export async function settled(locator: Locator): Promise<void> {
  await expect(async () => {
    const a = await locator.boundingBox();
    await locator.page().waitForTimeout(300);
    const b = await locator.boundingBox();
    const moved = !a || !b ? Infinity : Math.hypot(a.x + a.width / 2 - (b.x + b.width / 2), a.y + a.height / 2 - (b.y + b.height / 2));
    expect(moved).toBeLessThan(2);
  }).toPass({ timeout: 15_000 });
  // After a wrong answer the play scene ignores answers for a moment.
  await expect(locator.page().locator('.scene.play[data-settling]')).toHaveCount(0, { timeout: 5_000 });
}

/*
 * After settled(), click with { force: true }: buttons that "breathe" (the
 * glowing next step) never hold perfectly still, so Playwright's own
 * stability check would wait forever. settled() already checked that the
 * button's centre has stopped moving.
 */
