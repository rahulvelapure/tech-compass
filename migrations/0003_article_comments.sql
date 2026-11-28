-- Article comments and helpful upvotes.
--
-- Apply with wrangler:
--   wrangler d1 migrations apply tech-compass-reactions --local
--   wrangler d1 migrations apply tech-compass-reactions --remote
--
-- Stores first-party reader comments and 1-level replies per published article.
-- No user accounts or email addresses are collected. `visitor_id` holds the
-- opaque random `tc_reader` identifier solely so a reader can delete their own
-- recent comment and toggle helpful upvotes without duplicates; it is never
-- returned in any API or SSR payload.

CREATE TABLE IF NOT EXISTS article_comments (
  id          TEXT    PRIMARY KEY,
  slug        TEXT    NOT NULL,
  parent_id   TEXT,
  visitor_id  TEXT    NOT NULL,
  author_name TEXT    NOT NULL,
  author_role TEXT,
  body        TEXT    NOT NULL,
  upvotes     INTEGER NOT NULL DEFAULT 0,
  status      TEXT    NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden')),
  created_at  TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_article_comments_slug_status_created
  ON article_comments (slug, status, created_at);

CREATE TABLE IF NOT EXISTS article_comment_upvotes (
  comment_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (comment_id, visitor_id)
);

CREATE INDEX IF NOT EXISTS idx_article_comment_upvotes_visitor
  ON article_comment_upvotes (visitor_id, comment_id);
