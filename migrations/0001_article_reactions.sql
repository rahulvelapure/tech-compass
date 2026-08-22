-- Article reactions.
--
-- Apply with wrangler once the D1 database exists and its id is filled into
-- wrangler.jsonc:
--
--   wrangler d1 migrations apply tech-compass-reactions --local
--   wrangler d1 migrations apply tech-compass-reactions --remote
--
-- The seeded editorial like baseline is NOT stored here. It is derived from
-- the slug in src/lib/reactions.seed.ts, so these tables hold genuine reader
-- reactions and nothing else, and an empty database still renders the correct
-- public totals.

-- One row per article. Created on first genuine reaction, not up front.
CREATE TABLE IF NOT EXISTS article_reaction_totals (
  slug             TEXT    PRIMARY KEY,
  genuine_likes    INTEGER NOT NULL DEFAULT 0,
  genuine_dislikes INTEGER NOT NULL DEFAULT 0,
  updated_at       TEXT    NOT NULL
);

-- One row per (article, reader). The composite primary key is the whole
-- duplicate-prevention mechanism: a second reaction from the same browser
-- updates this row rather than adding another, so refreshing the page or
-- clicking twice cannot inflate a counter.
--
-- visitor_id is a random opaque identifier from an httpOnly cookie. It is not
-- derived from an IP address, a user agent or anything else about the reader,
-- and it is not joined to any other table.
CREATE TABLE IF NOT EXISTS article_reaction_votes (
  slug       TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  reaction   TEXT NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (slug, visitor_id)
);

-- Supports the per-article analytics read (how many genuine reactions of each
-- kind an article has). The primary key already covers the per-visitor lookup
-- on the request path.
CREATE INDEX IF NOT EXISTS idx_article_reaction_votes_slug
  ON article_reaction_votes (slug, reaction);
