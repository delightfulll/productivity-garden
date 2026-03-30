-- Run this file once to set up your database schema:
--   psql -U <your_user> -d <your_database> -f backend/db/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100)  NOT NULL,
  bio          TEXT          DEFAULT '',
  focus_areas  TEXT[]        DEFAULT '{}',
  streak       INTEGER       DEFAULT 0,
  tasks_done   INTEGER       DEFAULT 0,
  wins         INTEGER       DEFAULT 0,
  journal_count INTEGER      DEFAULT 0,
  garden_level INTEGER       DEFAULT 1,
  xp           INTEGER       DEFAULT 0,
  xp_max       INTEGER       DEFAULT 500,
  created_at   TIMESTAMPTZ   DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text        TEXT          NOT NULL,
  date        VARCHAR(100)  DEFAULT 'No date',
  completed   BOOLEAN       DEFAULT FALSE,
  category    VARCHAR(20)   NOT NULL CHECK (category IN ('watering', 'sunlight', 'composting')),
  sort_order  INTEGER       DEFAULT 0,
  created_at  TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id       ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_category ON tasks(user_id, category);
