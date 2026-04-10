-- Run once:
--   psql -U <your_user> -d <your_database> -f backend/db/migrations/add_activity_tracking.sql

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_activity_date DATE;
