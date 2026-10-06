import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Generous timeout: seeded sweeps over every skill run slowly when agents share the machine.
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node', testTimeout: 30_000 },
});
