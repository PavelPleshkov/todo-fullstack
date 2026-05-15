-- Table used by apps/backend/src/tasks.service.ts
-- Apply once per database; see docs/local-database.md

CREATE TABLE IF NOT EXISTS tasks (
  id          SERIAL PRIMARY KEY,
  text        TEXT NOT NULL,
  isdone      BOOLEAN NOT NULL DEFAULT FALSE,
  deleted     BOOLEAN NOT NULL DEFAULT FALSE,
  date        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);