/**
 * One player's saved game: kept on this device, so the game works offline,
 * and synced with the cloud, so it follows them to other devices.
 *
 * Every save is written here straight away and sent to the cloud a moment
 * later. Changes made elsewhere (another iPad, a grown-up's phone) come in
 * when the app opens, comes back to the front, or every couple of minutes
 * (and from another tab on the same device, straight away).
 * If both sides changed, they are merged (core/merge.ts), so nothing is lost.
 *
 * The copy on this device lives under the same key the on-device save used
 * before sign-in existed (`faraway-maths:v1:<id>`). A copy found there with
 * no sync record is one from before: it is treated as unsent, so the first
 * sync merges it into the cloud profile.
 */
import { mergeProgress, same } from '../core/merge';
import { defaultProgress, restore, type Progress } from '../core/progress';
import type { Profile } from '../save/local';
import { fetchProfile, JASPER, SignedOut, storeProfile, type Remote } from './api';

const dataKey = (id: string) => `faraway-maths:v1:${id}`;
const syncKey = (id: string) => `faraway-maths:sync:${id}`;
const baseKey = (id: string) => `faraway-maths:base:${id}`;
/** When this device last started the profile again, so another tab takes the fresh copy instead of merging its old play back in. */
const resetKey = (id: string) => `faraway-maths:reset:${id}`;

const PUSH_DELAY_MS = 1500;
const PULL_EVERY_MS = 2 * 60 * 1000;

interface SyncInfo {
  /** The cloud revision this device last agreed with (0: never synced). */
  rev: number;
  /** Changed here since then. */
  dirty: boolean;
}

/** synced: the cloud has everything · pending: changes still to send · offline: couldn't reach it */
export type SyncState = 'synced' | 'pending' | 'offline';

function read(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null');
  } catch {
    return null;
  }
}

/** Whether it was written. */
function write(key: string, value: unknown): boolean {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    /* storage full or blocked: the live copy and the cloud still have it */
    return false;
  }
}

/** What else this device keeps per profile: a chapter left part way (save/resume.ts) and the lands seen arriving (scenes/map.ts). */
const extraKeys = (id: string) => [`faraway-maths:resume:${id}`, `faraway-maths:land-seen:${id}`];


/** A blank save. Only Jasper's starts with his name in it. */
export function freshProgress(id = JASPER): Progress {
  return defaultProgress(id === JASPER ? undefined : '');
}

/** Loads a saved copy of profile `id`, filling gaps from a blank one (so a demo without a name stays nameless). */
function load(raw: unknown, id: string): Progress {
  if (!raw || typeof raw !== 'object') return freshProgress(id);
  const p = restore(raw);
  if (typeof (raw as { name?: unknown }).name !== 'string') p.name = freshProgress(id).name;
  return p;
}

/** Overwrites the live copy in place, so every scene holding it sees the change. */
function replace(target: Progress, src: Progress): void {
  const { settings, ...rest } = structuredClone(src);
  Object.assign(target, rest);
  Object.assign(target.settings, settings);
}

const open = new Map<string, CloudProfile>();

/** Called when the cloud stops accepting this device's sign-in. */
let signedOut: () => void = () => {};
export function onSignedOut(fn: () => void): void {
  signedOut = fn;
}

export class CloudProfile implements Profile {
  /** The profile's id (`jasper`, `demo`, …). */
  readonly id: string;
  /** This device already had a copy when the profile was opened. */
  readonly cached: boolean;
  /** The live copy the game reads and changes. */
  readonly progress: Progress;
  state: SyncState;
  private sync_: SyncInfo;
  /** The copy agreed with the cloud at `sync_.rev`, to merge against. */
  private base: Progress | null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private running: Promise<void> | null = null;
  private again = false;
  private listeners = new Set<() => void>();
  /** The last Start again this tab knows of (resetKey). */
  private resetAt: unknown;

  /** One instance per player, shared by everything on this device. */
  static for(id: string): CloudProfile {
    let p = open.get(id);
    if (!p) open.set(id, (p = new CloudProfile(id)));
    return p;
  }

  /** Clears a deleted profile's copy from this device. */
  static forget(id: string): void {
    open.delete(id);
    // All of it, so a new profile given the same name starts clean.
    for (const key of [dataKey(id), syncKey(id), baseKey(id), resetKey(id), ...extraKeys(id)]) write(key, null);
  }

  private constructor(id: string) {
    this.id = id;
    const saved = read(dataKey(id));
    this.progress = load(saved, id);
    this.cached = !!saved;
    const info = read(syncKey(id)) as SyncInfo | null;
    // No sync record but a save: it's from before sign-in, so send it up.
    this.sync_ = info && Number.isInteger(info.rev) ? info : { rev: 0, dirty: !!saved };
    const base = read(baseKey(id));
    this.base = base ? load(base, id) : null;
    if (!info && saved) this.persist();
    this.resetAt = read(resetKey(id));
    this.state = this.sync_.dirty ? 'pending' : 'synced';
  }

  /** Runs `fn` whenever the progress or sync state changes. */
  onChange(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /** Saves on this device now, and to the cloud shortly. */
  save(): void {
    this.sync_.dirty = true;
    this.persist();
    this.setState('pending');
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.sync(), PUSH_DELAY_MS);
  }

  /** Starts again: clears what was played, keeping the name, settings and unlocks. */
  reset(): void {
    const keep = this.progress;
    const fresh: Progress = {
      ...freshProgress(this.id),
      name: keep.name,
      settings: { ...keep.settings },
      unlockAll: keep.unlockAll,
      unlockedTo: keep.unlockedTo,
    };
    replace(this.progress, fresh);
    // A chapter left part way would otherwise carry on from before, and the
    // lands would not arrive again as he climbs back up.
    for (const key of extraKeys(this.id)) write(key, null);
    write(resetKey(this.id), (this.resetAt = Date.now()));
    this.save();
    this.listeners.forEach((fn) => fn());
  }

  /**
   * Another tab of the game on this device saved. Its copy is merged in, so
   * neither tab writes over the other's play (they share one copy on the
   * device). Written back only if this tab had something the other lacked,
   * so the two tabs don't keep answering each other.
   */
  fromOtherTab(): void {
    const saved = read(dataKey(this.id));
    if (!saved) return;
    const theirs = load(saved, this.id);
    const info = read(syncKey(this.id)) as SyncInfo | null;
    const resetAt = read(resetKey(this.id));
    if (resetAt !== this.resetAt) {
      // The other tab started again: its fresh copy wins, or merging would
      // bring back everything that was cleared.
      this.resetAt = resetAt;
      this.sync_.dirty = true;
      replace(this.progress, theirs);
      this.listeners.forEach((fn) => fn());
      this.setState('pending');
      return;
    }
    const merged = mergeProgress(this.base ?? freshProgress(this.id), this.progress, theirs);
    const ours = !same(merged, theirs);
    // Changes the other tab hasn't sent yet are this tab's to send too.
    this.sync_.dirty = this.sync_.dirty || !!info?.dirty || ours;
    if (!same(merged, this.progress)) {
      replace(this.progress, merged);
      this.listeners.forEach((fn) => fn());
    }
    if (ours) this.persist();
    if (this.sync_.dirty) this.setState('pending');
  }

  /** Brings this device and the cloud up to date with each other. Never throws. */
  sync(): Promise<void> {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    if (this.running) {
      this.again = true;
      return this.running;
    }
    this.running = this.run().finally(() => {
      this.running = null;
      if (this.again) {
        this.again = false;
        void this.sync();
      }
    });
    return this.running;
  }

  private async run(): Promise<void> {
    try {
      const remote = await fetchProfile(this.id);
      if (remote.rev !== this.sync_.rev) this.absorb(remote);
      for (let tries = 0; this.sync_.dirty && tries < 4; tries++) {
        const sent = structuredClone(this.progress);
        const res = await storeProfile(this.id, sent, this.sync_.rev);
        if (res.ok) {
          this.sync_.rev = res.rev;
          this.base = sent;
          // Anything saved while it was on its way goes next time round.
          this.sync_.dirty = !same(this.progress, sent);
          this.persist(true);
        } else {
          this.absorb(res.remote);
        }
      }
      this.setState(this.sync_.dirty ? 'pending' : 'synced');
    } catch (e) {
      if (e instanceof SignedOut) signedOut();
      this.setState('offline');
    }
  }

  /** Takes in the cloud's copy, merged with anything changed here since the last sync. */
  private absorb(remote: Remote): void {
    const theirs = remote.data ? load(remote.data, this.id) : null;
    if (!theirs) {
      // Nothing in the cloud yet: this device's copy becomes the first.
      this.sync_ = { rev: remote.rev, dirty: true };
      this.base = null;
      this.persist(true);
      return;
    }
    const merged = this.sync_.dirty || !this.base ? mergeProgress(this.base ?? freshProgress(this.id), this.progress, theirs) : theirs;
    this.sync_ = { rev: remote.rev, dirty: !same(merged, theirs) };
    this.base = theirs;
    replace(this.progress, merged);
    this.persist(true);
    this.listeners.forEach((fn) => fn());
  }

  /**
   * Writes the copy, then the base, then the sync record, stopping at the
   * first that fails (storage full). The sync record says which cloud
   * revision the copy matches, so it must never get ahead of the copy:
   * an old copy marked "up to date" would hide newer play, and later be
   * sent up over it.
   */
  private persist(withBase = false): void {
    if (!write(dataKey(this.id), this.progress)) return;
    if (withBase && !write(baseKey(this.id), this.base)) return;
    write(syncKey(this.id), this.sync_);
  }

  private setState(s: SyncState): void {
    if (s === this.state) return;
    this.state = s;
    this.listeners.forEach((fn) => fn());
  }
}

/** Keeps the signed-in player's save in sync while the app is open. */
export function keepInSync(profile: CloudProfile): void {
  const sync = () => {
    if (!document.hidden) void profile.sync();
  };
  // Going to the background (the home button, the app switcher) can be the
  // last moment the iPad lets the game run for a long while: a save still
  // waiting out its short delay is sent now. It stays on the device anyway.
  const flush = () => {
    if (profile.state !== 'synced') void profile.sync();
  };
  document.addEventListener('visibilitychange', () => (document.hidden ? flush() : sync()));
  window.addEventListener('pagehide', flush);
  window.addEventListener('online', sync);
  // Another tab of the game saved this profile.
  window.addEventListener('storage', (e) => {
    if (e.key === dataKey(profile.id)) profile.fromOtherTab();
  });
  setInterval(sync, PULL_EVERY_MS);
  sync();
}
