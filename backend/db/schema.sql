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

-- Goals
CREATE TABLE IF NOT EXISTS goals (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT         NOT NULL,
  description  TEXT         DEFAULT '',
  target_date  VARCHAR(100) DEFAULT '',
  achieved     BOOLEAN      DEFAULT FALSE,
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

-- Backlog tasks
CREATE TABLE IF NOT EXISTS backlog_tasks (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text       TEXT        NOT NULL,
  note       TEXT        DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_backlog_user_id ON backlog_tasks(user_id);

-- Journal entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry      TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_journal_user_id ON journal_entries(user_id);

-- Wins
CREATE TABLE IF NOT EXISTS wins (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category   VARCHAR(20) NOT NULL CHECK (category IN ('physical', 'mental', 'spiritual')),
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wins_user_id ON wins(user_id);

-- Time-blocking events
CREATE TABLE IF NOT EXISTS time_blocking_events (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slot_id     VARCHAR(10)  NOT NULL,
  event_date  DATE         NOT NULL DEFAULT CURRENT_DATE,
  title       TEXT         NOT NULL,
  description TEXT         DEFAULT '',
  color       VARCHAR(50)  DEFAULT '',
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tbe_user_date ON time_blocking_events(user_id, event_date);

-- Addiction check-ins & streak
CREATE TABLE IF NOT EXISTS addiction_checkins (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stayed_clean BOOLEAN     NOT NULL,
  checked_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON addiction_checkins(user_id);

CREATE TABLE IF NOT EXISTS addiction_streaks (
  user_id      INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  streak       INTEGER DEFAULT 0,
  last_checkin DATE
);
