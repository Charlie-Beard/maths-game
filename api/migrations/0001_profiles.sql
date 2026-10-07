-- Migration number: 0001
-- One saved game per profile: its whole progress + settings as JSON.
-- `rev` goes up by one on every save, so two devices can't overwrite
-- each other's changes unseen.
CREATE TABLE profiles (
  who TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  data TEXT NOT NULL,
  rev INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);

-- Jasper's profile, empty until his iPad sends its first save (any
-- progress already kept on the device is merged in then).
INSERT INTO profiles (who, label, data, rev, updated_at)
  VALUES ('jasper', 'Jasper', '{"v":1}', 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

-- The demo, for showing the game to people without touching his progress:
-- every chapter open, no name (so nobody is called "Jasper") and no
-- climbing partner chosen yet.
INSERT INTO profiles (who, label, data, rev, updated_at)
  VALUES ('demo', 'Demo', '{"v":1,"name":"","avatar":null,"unlockAll":true}', 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
