-- Run once if the table is missing:
--   psql -U <your_user> -d <your_database> -f backend/db/migrations/create_milestones.sql

CREATE TABLE IF NOT EXISTS milestones (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT         NOT NULL,
  description TEXT         NOT NULL DEFAULT '',
  horizon     TEXT         NOT NULL CHECK (horizon IN ('long', 'mid', 'short')),
  achieved    BOOLEAN      NOT NULL DEFAULT FALSE,
  target_date TEXT         NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS milestones_user_id_idx ON milestones (user_id);
CREATE INDEX IF NOT EXISTS milestones_horizon_idx ON milestones (horizon);
