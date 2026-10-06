/**
 * A stand-in for the cloud-save API (api/), served by intercepting the
 * game's requests, so browser tests never touch the real one. Jasper's
 * password here is "owl" (any capitals).
 *
 * Every test starts signed in (playwright.config.ts pre-seeds the sign-in
 * and points the game's API at an address nothing answers), so a test
 * that doesn't call `fakeCloud` simply plays offline, as on an iPad with
 * no internet. Tests of the password screen start signed out with
 * `test.use(signedOut)`.
 */
import type { Page } from '@playwright/test';

export interface FakeProfile {
  label: string;
  data: any;
  rev: number;
}

export type FakeCloud = Record<string, FakeProfile>;

/** What the game keeps on the device once the password has been given. */
export const AUTH_KEY = 'faraway-maths:auth';
export const AUTH = { token: 'test-jasper', who: 'jasper' };

/** `test.use(signedOut)`: start with no sign-in, at the password screen. */
export const signedOut = { storageState: { cookies: [], origins: [] } };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
};

/** `jasper` is Jasper's save; `others` are extra profiles (e.g. { demo: { label: 'Demo', data } }). */
export async function fakeCloud(page: Page, jasper?: object, others: Record<string, { label: string; data: object }> = {}): Promise<FakeCloud> {
  const cloud: FakeCloud = {};
  if (jasper) cloud.jasper = { label: 'Jasper', data: jasper, rev: 1 };
  for (const [id, p] of Object.entries(others)) cloud[id] = { ...p, rev: 1 };

  await page.route(/\/(login|profiles|profile\/[\w-]+)$/, async (route) => {
    const req = route.request();
    const json = (status: number, body: unknown) => route.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify(body) });
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    const path = new URL(req.url()).pathname;

    if (path.endsWith('/login')) {
      const ok = String(req.postDataJSON()?.password ?? '').trim().toLowerCase() === 'owl';
      return ok ? json(200, { token: AUTH.token, who: AUTH.who }) : json(401, { error: 'Wrong password' });
    }
    if (req.headers().authorization !== `Bearer ${AUTH.token}`) return json(401, { error: 'Please sign in' });
    if (path.endsWith('/profiles')) {
      const rest = Object.entries(cloud)
        .filter(([id]) => id !== 'jasper')
        .map(([id, p]) => ({ id, label: p.label }))
        .sort((a, b) => a.label.localeCompare(b.label));
      return json(200, { profiles: [{ id: 'jasper', label: 'Jasper' }, ...rest] });
    }

    const id = path.split('/').pop()!;
    const p = cloud[id];
    if (req.method() === 'GET') return json(200, { data: p?.data ?? null, rev: p?.rev ?? 0, label: p?.label ?? id, token: AUTH.token });
    if (req.method() === 'DELETE') {
      delete cloud[id];
      return json(200, { ok: true });
    }
    const body = req.postDataJSON();
    if (body.rev !== (p?.rev ?? 0)) return json(409, { data: p?.data ?? null, rev: p?.rev ?? 0, label: p?.label });
    cloud[id] = { label: body.label ?? p?.label ?? id, data: body.data, rev: body.rev + 1 };
    return json(200, { rev: body.rev + 1 });
  });
  return cloud;
}

/** Starts the page signed in, as if the password was typed on an earlier visit (for tests that began signed out). */
export async function signedIn(page: Page): Promise<void> {
  await page.addInitScript(
    ([key, auth]) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(auth));
    },
    [AUTH_KEY, AUTH] as const,
  );
}
