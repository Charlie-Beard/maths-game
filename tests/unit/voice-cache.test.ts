import { beforeEach, describe, expect, it, vi } from 'vitest';
import { voiceId } from '../../src/core/phrases';

// Decoded clips are big, so the voice keeps only the most recently used couple
// of minutes of them. Fake the audio engine, the network and the page.
const decoded = vi.hoisted(() => ({ seconds: 3 }));
vi.mock('../../src/audio/engine', () => ({
  audio: () => ({ decodeAudioData: async () => ({ duration: decoded.seconds }) }),
  buses: {},
}));

const texts = Array.from({ length: 100 }, (_, i) => `Story line number ${i}.`);
const ids = texts.map((t) => voiceId(t));

describe('voice clip cache', () => {
  let fetched: string[];
  beforeEach(() => {
    fetched = [];
    vi.stubGlobal('document', { baseURI: 'http://game.test/' });
    vi.stubGlobal('window', {});
    vi.stubGlobal('fetch', async (url: string) => {
      if (url.endsWith('manifest.json')) return { ok: true, json: async () => ({ lines: ids, pieces: [], numbers: [] }) };
      fetched.push(url);
      return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) };
    });
  });

  it('lets go of old clips, keeps recent ones, and never fetches a kept one twice', async () => {
    vi.resetModules();
    const { voice } = await import('../../src/audio/voice');
    // 100 clips of 3 s each is 300 s: far over the limit.
    for (const t of texts) await voice.preload({ lines: [t] });
    expect(fetched).toHaveLength(100);

    // The latest are still there: no new fetch.
    fetched.length = 0;
    await voice.preload({ lines: texts.slice(-10) });
    expect(fetched).toHaveLength(0);

    // The first has gone: it is fetched again.
    await voice.preload({ lines: [texts[0]] });
    expect(fetched).toHaveLength(1);
  });

  it('keeps a clip that keeps being used', async () => {
    vi.resetModules();
    const { voice } = await import('../../src/audio/voice');
    await voice.preload({ lines: [texts[0]] });
    for (const t of texts.slice(1)) {
      await voice.preload({ lines: [t] });
      await voice.preload({ lines: [texts[0]] }); // used again after every other line
    }
    fetched.length = 0;
    await voice.preload({ lines: [texts[0]] });
    expect(fetched).toHaveLength(0);
  });
});
