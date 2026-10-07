/**
 * The player's save: what scenes see of it.
 *
 * The save itself is `CloudProfile` (cloud/profile.ts): kept on this
 * device under `faraway-maths:v1:<id>`, so play never waits for the
 * internet, and synced with the cloud-save Worker (api/) so it follows
 * Jasper from device to device. Scenes only ever use this interface.
 */
import type { Progress } from '../core/progress';

export interface Profile {
  /** The profile's id ('jasper', 'demo', …). */
  readonly id: string;
  readonly progress: Progress;
  /** Saves after a change to `progress`. */
  save(): void;
  /** Replaces the progress (start again). */
  reset(): void;
  /** Called when the progress changes from outside (another device, a merge). */
  onChange(fn: () => void): () => void;
}

/** Asks the browser to keep the save even when storage is low. */
export function requestPersistence(): void {
  void navigator.storage?.persist?.().catch(() => {});
}
