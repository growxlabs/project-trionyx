BEGIN;

CREATE TABLE IF NOT EXISTS trix_conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_trix_conversations_user ON trix_conversations(user_id, updated_at);

CREATE TABLE IF NOT EXISTS trix_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES trix_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  result_payload TEXT,
  activity TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_trix_messages_conversation ON trix_messages(conversation_id, created_at);

ALTER TABLE trix_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trix_messages ENABLE ROW LEVEL SECURITY;

INSERT INTO _migrations (name) VALUES ('0020_trix_conversations') ON CONFLICT (name) DO NOTHING;

COMMIT;
