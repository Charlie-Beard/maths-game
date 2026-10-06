/**
 * Two devices (each with its own storage and copy of the game code) syncing
 * through the real worker code, over an in-memory database.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ALL_CHAPTERS } from '../../src/core/curriculum';
import { finishChapter, recordOutcome, type Progress } from '../../src/core/progress';
import migration from '../../api/migrations/0001_profiles.sql?raw';
import { fetchVia, testEnv } from './fake-api';

type Api = typeof import('../../src/cloud/api');
type Profiles = typeof import('../../src/cloud/profile');

let env: ReturnType<typeof testEnv>;
let online = true;

interface Device {
  store: Map<string, string>;
  api: Api;
  profiles: Profiles;
  /** Runs `fn` on this device (its storage is the one in use until it finishes). */
  on<T>(fn: () => T | Promise<T>): Promise<T>;
}

async function device(seed: Record<string, unknown> = {}): Promise<Device> {
  vi.resetModules();
  const api = await import('../../src/cloud/api');
  const profiles = await import('../../src/cloud/profile');
  const store = new Map(Object.entries(seed).map(([k, v]) => [k, JSON.stringify(v)]));
  const storage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
  };
  return {
    store,
    api,
    profiles,
    async on(fn) {
      (globalThis as { localStorage?: unknown }).localStorage = storage;
      return fn();
    },
  };
}

let clock = Date.parse('2026-10-06T09:00:00Z');

/** Plays chapter `i`: 8 problems on its first skill, all right first time, then the reward. */
function playChapter(p: Progress, i: number): void {
  const c = ALL_CHAPTERS[i];
  for (let k = 0; k < 8; k++) recordOutcome(p, { skill: c.skills[0], tier: c.tiers[0], wrong: 0, at: (clock += 1000) });
  finishChapter(p, c, (clock += 1000));
}

beforeEach(() => {
  env = testEnv();
  online = true;
  vi.stubGlobal('fetch', fetchVia(env, () => online));
  // Saves are pushed after a short delay; these tests sync by hand instead.
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('cloud sync', () => {
  it('signs in with the password and remembers who it is', async () => {
    const ipad = await device();
    expect(await ipad.on(() => ipad.api.signIn('nope'))).toEqual({ ok: false, reason: 'wrong' });
    expect(await ipad.on(() => ipad.api.getAuth())).toBeNull();
    expect(await ipad.on(() => ipad.api.signIn('OWL'))).toEqual({ ok: true, who: 'jasper' });
    expect(await ipad.on(() => ipad.api.getAuth()?.who)).toBe('jasper');
    expect(ipad.store.has('faraway-maths:auth')).toBe(true);
    online = false;
    expect(await ipad.on(() => ipad.api.signIn('owl'))).toEqual({ ok: false, reason: 'offline' });
  });

  it('moves the save from before sign-in into Jasper’s cloud profile', async () => {
    const before = {
      v: 1,
      name: 'Jasper',
      avatar: 'joe',
      seenOpening: true,
      cards: ['moonface'],
      keepsakes: ['acorn'],
      toffees: 8,
      chapters: { l1c1: { plays: 1, done: true, firstDone: 5 } },
      settings: { newPerDay: 3 },
    };
    const ipad = await device({ 'faraway-maths:v1:jasper': before });
    await ipad.on(() => ipad.api.signIn('owl'));
    const jasper = await ipad.on(() => ipad.profiles.CloudProfile.for('jasper'));
    expect(jasper.cached).toBe(true);
    expect(jasper.state).toBe('pending');
    expect(jasper.progress.cards).toEqual(['moonface']);
    await ipad.on(() => jasper.sync());
    expect(jasper.state).toBe('synced');
    const saved = JSON.parse(env.DB.rows.get('jasper')!.data);
    expect(saved).toMatchObject({ avatar: 'joe', seenOpening: true, cards: ['moonface'], keepsakes: ['acorn'], toffees: 8 });
    expect(saved.chapters.l1c1.done).toBe(true);
    expect(saved.settings.newPerDay).toBe(3);
  });

  it('merges the save from before sign-in into a cloud profile that already has play in it', async () => {
    // Jasper played on the laptop (signed in), then the iPad, which had an old on-device save, signs in.
    const laptop = await device();
    await laptop.on(() => laptop.api.signIn('owl'));
    const onLaptop = await laptop.on(() => laptop.profiles.CloudProfile.for('jasper'));
    await laptop.on(() => {
      playChapter(onLaptop.progress, 0);
      onLaptop.save();
      return onLaptop.sync();
    });
    const ipad = await device({ 'faraway-maths:v1:jasper': { v: 1, cards: ['silky'], toffees: 3, chapters: { l1c2: { plays: 2, done: true } } } });
    await ipad.on(() => ipad.api.signIn('owl'));
    const onIpad = await ipad.on(() => ipad.profiles.CloudProfile.for('jasper'));
    await ipad.on(() => onIpad.sync());
    expect(onIpad.state).toBe('synced');
    expect(onIpad.progress.chapters.l1c1?.done).toBe(true);
    expect(onIpad.progress.chapters.l1c2?.plays).toBe(2);
    expect(onIpad.progress.cards).toEqual(expect.arrayContaining(['silky', ALL_CHAPTERS[0].host]));
    expect(onIpad.progress.toffees).toBe(8);
  });

  it('merges Jasper’s offline play with a grown-up’s changes from another device', async () => {
    const ipad = await device();
    await ipad.on(() => ipad.api.signIn('owl'));
    const onIpad = await ipad.on(() => ipad.profiles.CloudProfile.for('jasper'));
    await ipad.on(() => {
      playChapter(onIpad.progress, 0);
      onIpad.save();
      return onIpad.sync();
    });
    expect(env.DB.rows.get('jasper')!.rev).toBe(1);

    // A grown-up, on a phone signed in as Jasper, sees his progress and changes settings.
    const phone = await device();
    await phone.on(() => phone.api.signIn('owl'));
    const onPhone = await phone.on(() => phone.profiles.CloudProfile.for('jasper'));
    await phone.on(() => onPhone.sync());
    expect(onPhone.progress.cards).toEqual(onIpad.progress.cards);
    await phone.on(() => {
      onPhone.progress.settings.newPerDay = 3;
      onPhone.progress.settings.idleHintSeconds = 20;
      onPhone.save();
      return onPhone.sync();
    });

    // Meanwhile the iPad was offline, and Jasper played another chapter.
    online = false;
    await ipad.on(() => {
      playChapter(onIpad.progress, 1);
      onIpad.save();
      return onIpad.sync();
    });
    expect(onIpad.state).toBe('offline');
    online = true;
    const changed = vi.fn();
    onIpad.onChange(changed);
    await ipad.on(() => onIpad.sync());

    expect(onIpad.state).toBe('synced');
    expect(changed).toHaveBeenCalled();
    expect(onIpad.progress.settings.newPerDay).toBe(3);
    expect(onIpad.progress.settings.idleHintSeconds).toBe(20);
    expect(onIpad.progress.chapters[ALL_CHAPTERS[1].id]?.done).toBe(true);
    expect(onIpad.progress.toffees).toBe(16);

    // And the phone catches up.
    await phone.on(() => onPhone.sync());
    expect(onPhone.progress.chapters[ALL_CHAPTERS[1].id]?.done).toBe(true);
    expect(onPhone.progress.toffees).toBe(onIpad.progress.toffees);
    expect(onPhone.progress.skills).toEqual(onIpad.progress.skills);
  });

  it('keeps the same settings object, so open screens keep editing the live copy', async () => {
    const a = await device();
    await a.on(() => a.api.signIn('owl'));
    const pa = await a.on(() => a.profiles.CloudProfile.for('jasper'));
    const settings = pa.progress.settings;
    const b = await device();
    await b.on(() => b.api.signIn('owl'));
    const pb = await b.on(() => b.profiles.CloudProfile.for('jasper'));
    await b.on(() => {
      pb.progress.settings.volume = 0.2;
      pb.save();
      return pb.sync();
    });
    await a.on(() => pa.sync());
    expect(pa.progress.settings).toBe(settings);
    expect(settings.volume).toBe(0.2);
  });

  it('starts again, keeping the name and settings, and the cloud hears of it', async () => {
    const ipad = await device();
    await ipad.on(() => ipad.api.signIn('owl'));
    const p = await ipad.on(() => ipad.profiles.CloudProfile.for('jasper'));
    const progress = p.progress;
    await ipad.on(() => {
      playChapter(p.progress, 0);
      p.progress.avatar = 'fran';
      p.progress.settings.volume = 0.3;
      p.save();
      return p.sync();
    });
    await ipad.on(() => {
      p.reset();
      return p.sync();
    });
    expect(p.progress).toBe(progress);
    expect(p.progress).toMatchObject({ chapters: {}, cards: [], toffees: 0, avatar: null, name: 'Jasper' });
    expect(p.progress.settings.volume).toBe(0.3);
    expect(JSON.parse(env.DB.rows.get('jasper')!.data)).toMatchObject({ chapters: {}, toffees: 0 });
  });

  it('keeps unsent progress on the device when the sign-in stops working', async () => {
    const ipad = await device();
    await ipad.on(() => ipad.api.signIn('owl'));
    const signedOut = vi.fn();
    ipad.profiles.onSignedOut(signedOut);
    const p = await ipad.on(() => ipad.profiles.CloudProfile.for('jasper'));
    env.AUTH_SECRET = 'rotated';
    await ipad.on(() => {
      playChapter(p.progress, 0);
      p.save();
      return p.sync();
    });
    expect(signedOut).toHaveBeenCalled();
    expect(JSON.parse(ipad.store.get('faraway-maths:v1:jasper')!).cards).toEqual(p.progress.cards);
    expect(JSON.parse(ipad.store.get('faraway-maths:sync:jasper')!).dirty).toBe(true);
  });

  it('picks up where it left off after the app is reopened', async () => {
    const ipad = await device();
    await ipad.on(() => ipad.api.signIn('owl'));
    const first = await ipad.on(() => ipad.profiles.CloudProfile.for('jasper'));
    await ipad.on(() => {
      playChapter(first.progress, 0);
      first.save();
      return first.sync();
    });
    // Reopen: same storage, fresh copy of the code.
    vi.resetModules();
    const profiles: Profiles = await import('../../src/cloud/profile');
    const again = await ipad.on(() => profiles.CloudProfile.for('jasper'));
    expect(again.progress.cards).toEqual(first.progress.cards);
    expect(again.state).toBe('synced');
    await ipad.on(() => again.sync());
    expect(again.state).toBe('synced');
    expect(env.DB.rows.get('jasper')!.rev).toBe(1);
  });

  it('opens the demo profile from the migration with every chapter open and no name', async () => {
    for (const [, who, label, data] of migration.matchAll(/VALUES \('(\w+)', '(\w+)', '(\{.*?\})'/g)) env.DB.rows.set(who, { label, data, rev: 1 });
    expect([...env.DB.rows.keys()]).toEqual(['jasper', 'demo']);
    const ipad = await device();
    await ipad.on(() => ipad.api.signIn('owl'));
    const demo = await ipad.on(() => ipad.profiles.CloudProfile.for('demo'));
    expect(demo.cached).toBe(false);
    await ipad.on(() => demo.sync());
    expect(demo.progress).toMatchObject({ name: '', avatar: null, unlockAll: true, toffees: 0 });
    const jasper = await ipad.on(() => ipad.profiles.CloudProfile.for('jasper'));
    await ipad.on(() => jasper.sync());
    expect(jasper.progress).toMatchObject({ name: 'Jasper', unlockAll: false });
  });

  it('keeps the demo profile apart from Jasper’s, on the same iPad', async () => {
    const before = { v: 1, name: 'Jasper', cards: ['moonface'], toffees: 5 };
    const ipad = await device({ 'faraway-maths:v1:jasper': before });
    await ipad.on(() => ipad.api.signIn('owl'));
    // A demo on the iPad before Jasper's save was ever opened there.
    const demo = await ipad.on(() => ipad.profiles.CloudProfile.for('demo'));
    expect(demo.progress.cards).toEqual([]);
    expect(demo.progress.name).toBe('');
    await ipad.on(() => {
      playChapter(demo.progress, 0);
      demo.save();
      return demo.sync();
    });
    const jasper = await ipad.on(() => ipad.profiles.CloudProfile.for('jasper'));
    expect(jasper.progress.cards).toEqual(['moonface']);
    expect(jasper.progress.toffees).toBe(5);
    await ipad.on(() => jasper.sync());
    expect(JSON.parse(env.DB.rows.get('jasper')!.data).toffees).toBe(5);
    expect(JSON.parse(env.DB.rows.get('demo')!.data).toffees).toBe(8);
    expect(env.DB.rows.get('demo')!.label).toBe('demo');
  });

  it('lists, creates and deletes profiles; a deleted one is forgotten on this device', async () => {
    const ipad = await device();
    await ipad.on(() => ipad.api.signIn('owl'));
    const id = await ipad.on(() => ipad.api.createProfile('Grandma Jo', { v: 1, name: 'Grandma Jo' }));
    expect(id).toBe('grandma-jo');
    expect(await ipad.on(() => ipad.api.createProfile('Grandma Jo', { v: 1 }))).toBe('grandma-jo-2');
    expect(await ipad.on(() => ipad.api.listProfiles())).toEqual([
      { id: 'jasper', label: 'Jasper' },
      { id: 'grandma-jo', label: 'Grandma Jo' },
      { id: 'grandma-jo-2', label: 'Grandma Jo' },
    ]);
    const p = await ipad.on(() => ipad.profiles.CloudProfile.for('grandma-jo'));
    await ipad.on(() => p.sync());
    expect(p.progress.name).toBe('Grandma Jo');
    expect(ipad.store.has('faraway-maths:v1:grandma-jo')).toBe(true);
    await ipad.on(() => ipad.api.deleteProfile('grandma-jo'));
    await ipad.on(() => ipad.profiles.CloudProfile.forget('grandma-jo'));
    expect(ipad.store.has('faraway-maths:v1:grandma-jo')).toBe(false);
    expect(env.DB.rows.has('grandma-jo')).toBe(false);
  });

  it('remembers which profile this device plays as', async () => {
    const ipad = await device();
    expect(await ipad.on(() => ipad.api.activeProfile())).toEqual({ id: 'jasper', label: 'Jasper' });
    await ipad.on(() => ipad.api.setActiveProfile({ id: 'demo', label: 'Demo' }));
    expect(await ipad.on(() => ipad.api.activeProfile())).toEqual({ id: 'demo', label: 'Demo' });
    expect(ipad.store.has('faraway-maths:active')).toBe(true);
  });
});
