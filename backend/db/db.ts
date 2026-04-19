import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Cloud Run connects to Cloud SQL via a Unix socket injected by the Auth Proxy.
// Locally, fall back to standard TCP host/port.
const pool = new Pool({
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  ...(process.env.INSTANCE_UNIX_SOCKET
    ? { host: process.env.INSTANCE_UNIX_SOCKET }
    : {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
      }),
});

/** Creates milestones table if missing (older DBs may not have run the migration). */
export async function ensureMilestonesTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS milestones (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title       TEXT         NOT NULL,
      description TEXT         NOT NULL DEFAULT '',
      horizon     TEXT         NOT NULL CHECK (horizon IN ('long', 'mid', 'short')),
      achieved    BOOLEAN      NOT NULL DEFAULT FALSE,
      target_date TEXT         NOT NULL DEFAULT '',
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS milestones_user_id_idx ON milestones (user_id)`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS milestones_horizon_idx ON milestones (horizon)`,
  );
}

/** Adds journal_entries.entry_date for backdated entries (older DBs may lack this column). */
export async function ensureJournalEntryDateColumn(): Promise<void> {
  await pool.query(`
    ALTER TABLE journal_entries
      ADD COLUMN IF NOT EXISTS entry_date DATE
  `);
  await pool.query(`
    UPDATE journal_entries
    SET entry_date = created_at::date
    WHERE entry_date IS NULL
  `);
  await pool.query(`
    ALTER TABLE journal_entries
      ALTER COLUMN entry_date SET NOT NULL,
      ALTER COLUMN entry_date SET DEFAULT CURRENT_DATE
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_journal_user_entry_date
    ON journal_entries (user_id, entry_date DESC)
  `);
}

export default pool;
