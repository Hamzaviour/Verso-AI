-- Verso schema. Idempotent: safe to run repeatedly (npm run db:migrate).

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS outlets (
  id           text PRIMARY KEY,           -- slug, e.g. 'bbc'
  name         text NOT NULL,
  short        text NOT NULL,              -- 2-4 letter typographic mark
  homepage     text NOT NULL,
  feed_url     text NOT NULL,
  bias         real NOT NULL,              -- -1 (left) .. 1 (right), editorial estimate
  reliability  real NOT NULL,              -- 0 .. 1, editorial estimate
  last_fetched timestamptz,
  last_error   text
);

CREATE TABLE IF NOT EXISTS articles (
  id           bigserial PRIMARY KEY,
  outlet_id    text NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  url          text NOT NULL UNIQUE,
  title        text NOT NULL,
  description  text NOT NULL DEFAULT '',
  published_at timestamptz NOT NULL,
  fetched_at   timestamptz NOT NULL DEFAULT now(),
  embedding    vector(384),
  event_id     bigint
);
CREATE INDEX IF NOT EXISTS articles_published_idx ON articles (published_at DESC);
CREATE INDEX IF NOT EXISTS articles_event_idx ON articles (event_id);

CREATE TABLE IF NOT EXISTS events (
  id             bigserial PRIMARY KEY,
  title          text,                     -- neutral AI headline
  summary        jsonb,                    -- [{ text, sources: [articleId] }]
  claims         jsonb,                    -- [{ text, sources: [articleId], status }]
  loaded_terms   jsonb,                    -- [{ term, articleId, neutral, note }]
  topic          text,
  article_count  int NOT NULL DEFAULT 0,
  outlet_count   int NOT NULL DEFAULT 0,
  analyzed_count int NOT NULL DEFAULT 0,   -- article_count at last analysis
  first_seen     timestamptz NOT NULL DEFAULT now(),
  last_updated   timestamptz NOT NULL DEFAULT now(),
  analyzed_at    timestamptz
);
CREATE INDEX IF NOT EXISTS events_updated_idx ON events (last_updated DESC);

CREATE TABLE IF NOT EXISTS ingest_runs (
  id          bigserial PRIMARY KEY,
  started_at  timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  stats       jsonb
);
