-- Same logic as ensureJournalEntryDateColumn() in db/db.ts (runs automatically on server start).
-- Use this file only if you need to apply the change manually (e.g. without starting the API).
ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS entry_date DATE;

UPDATE journal_entries
SET entry_date = created_at::date
WHERE entry_date IS NULL;

ALTER TABLE journal_entries
  ALTER COLUMN entry_date SET NOT NULL,
  ALTER COLUMN entry_date SET DEFAULT CURRENT_DATE;

CREATE INDEX IF NOT EXISTS idx_journal_user_entry_date ON journal_entries (user_id, entry_date DESC);
