/**
 * The player's save, kept on this device.
 *
 * SCAFFOLD: workstream W7 adds the cloud save (a port of Wizard Words'
 * cloud/api.ts + cloud/profile.ts and its Worker in api/). It implements
 * the same `Profile` interface, so scenes don't change.
 */
import { defaultProgress, restore, type Progress } from '../core/progress';

export interface Profile {
  /** The profile's id ('jasper', 'demo', …). */
  readonly id: string;
  readonly progress: Progress;
  /** Saves after a change to `progress`. */
  save(): void;
  /** Replaces the progress (start again). */
  reset(): void;
  /** Called when the progress changes from outside (another device, later). */
  onChange(fn: () => void): () => void;
}

const key = (id: string) => `faraway-maths:v1:${id}`;

const reducedMotion = (): boolean => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export class LocalProfile implements Profile {
  readonly id: string;
  progress: Progress;
  private listeners = new Set<() => void>();

  constructor(id = 'jasper') {
    this.id = id;
    let raw: unknown = null;
    try {
      raw = JSON.parse(localStorage.getItem(key(id)) ?? 'null');
    } catch {
      raw = null;
    }
    this.progress = raw ? restore(raw, reducedMotion()) : defaultProgress(reducedMotion());
  }

  save(): void {
    try {
      localStorage.setItem(key(this.id), JSON.stringify(this.progress));
    } catch {
      /* storage full or blocked: play carries on */
    }
  }

  reset(): void {
    const keep = this.progress;
    this.progress = { ...defaultProgress(reducedMotion(), keep.name), settings: keep.settings, unlockAll: keep.unlockAll, unlockedTo: keep.unlockedTo };
    this.save();
    this.listeners.forEach((fn) => fn());
  }

  onChange(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

/** Asks the browser to keep the save even when storage is low. */
export function requestPersistence(): void {
  void navigator.storage?.persist?.().catch(() => {});
}
