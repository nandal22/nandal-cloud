-- ──────────────────────────────────────────────────────────────
-- Nandal Cloud – Supabase Schema
-- Run this in the Supabase SQL editor (Project → SQL Editor)
-- ──────────────────────────────────────────────────────────────

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name         TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Folders table (supports nesting via parent_id)
CREATE TABLE IF NOT EXISTS folders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id  UUID REFERENCES folders(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Files metadata table
CREATE TABLE IF NOT EXISTS files (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  folder_id    UUID REFERENCES folders(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  size         BIGINT NOT NULL DEFAULT 0,
  mime_type    TEXT,
  extension    TEXT,
  github_path  TEXT NOT NULL,          -- path in GitHub repo
  github_sha   TEXT,                   -- SHA for update/delete
  is_encrypted BOOLEAN DEFAULT true,
  tags         TEXT[] DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Full-text search index on file name and tags
CREATE INDEX IF NOT EXISTS files_name_search ON files USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS files_user_folder ON files(user_id, folder_id);
CREATE INDEX IF NOT EXISTS folders_user_parent ON folders(user_id, parent_id);

-- Row Level Security (RLS) — users only see their own data
ALTER TABLE users   ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files   ENABLE ROW LEVEL SECURITY;

-- Note: Since we use service_role_key in the backend, RLS doesn't block our API.
-- These policies would apply to direct client connections.
CREATE POLICY "Users see own profile"  ON users   FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users manage own folders" ON folders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own files"   ON files   FOR ALL USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER files_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
