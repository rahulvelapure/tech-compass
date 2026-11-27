-- Article view counters.
--
-- Holds genuine reader view increments per article slug. The deterministic
-- baseline (2,000–8,000) is derived in src/lib/views.seed.ts and added at read
-- time so this table stores genuine increments only. No visitor identifier or
-- cookie is used or stored for views.

CREATE TABLE IF NOT EXISTS article_view_totals (
  slug          TEXT    PRIMARY KEY,
  genuine_views INTEGER NOT NULL DEFAULT 0,
  updated_at    TEXT    NOT NULL
);
