/* add email and password_hash columns if they don't exist */
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT '';
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_activity_date DATE;