-- Run once to add auth columns to the users table:
--   psql -U <your_user> -d <your_database> -f backend/db/migrations/add_auth_to_users.sql

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email         VARCHAR(255) UNIQUE NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT '';
