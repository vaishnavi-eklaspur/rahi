-- Rahi application schema (Postgres / Neon).
--
-- This file defines ONLY the table the application itself manages: `reports`.
-- The authentication tables (user, session, account, verification) are created
-- and migrated by Better Auth — run `npx @better-auth/cli@latest migrate` instead
-- of defining them here, so they always match the installed Better Auth version.
--
-- The database is OPTIONAL: Rahi runs without it (reports work via URL encoding).
-- Apply this only if you want short share links and saved-report history:
--   psql "$DATABASE_URL" -f db/schema.sql

CREATE TABLE IF NOT EXISTS reports (
  id          text        PRIMARY KEY,              -- short random share slug (8 chars)
  code        text        NOT NULL,                 -- the self-contained report code (answers)
  device      text,                                 -- anonymous device id (null when signed in)
  user_id     text,                                 -- Better Auth user id (null when anonymous)
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Listing a user's or a device's reports, newest first.
CREATE INDEX IF NOT EXISTS reports_user_id_created_at_idx ON reports (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS reports_device_created_at_idx  ON reports (device,  created_at DESC);
