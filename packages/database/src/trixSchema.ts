import { PREPARED_ACTION_TABLE_STATEMENTS } from './preparedActionSchema';

export const TRIX_CONVERSATION_TABLE_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS trix_conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_trix_conversations_user ON trix_conversations(user_id, updated_at)`,
  `CREATE TABLE IF NOT EXISTS trix_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES trix_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    result_payload TEXT,
    activity TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_trix_messages_conversation ON trix_messages(conversation_id, created_at)`,
];

export const TRIX_TABLE_STATEMENTS = [
  ...PREPARED_ACTION_TABLE_STATEMENTS,
  `CREATE TABLE IF NOT EXISTS trix_request_limits (
    user_id TEXT NOT NULL REFERENCES users(id), scope TEXT NOT NULL CHECK(scope IN ('chat','actions')),
    window_start BIGINT NOT NULL, request_count INTEGER NOT NULL, PRIMARY KEY(user_id,scope))`,
  ...TRIX_CONVERSATION_TABLE_STATEMENTS,
];

