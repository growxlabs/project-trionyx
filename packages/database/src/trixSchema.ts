import { PREPARED_ACTION_TABLE_STATEMENTS } from './preparedActionSchema';

export const TRIX_TABLE_STATEMENTS = [
  ...PREPARED_ACTION_TABLE_STATEMENTS,
  `CREATE TABLE IF NOT EXISTS trix_request_limits (
    user_id TEXT NOT NULL REFERENCES users(id), scope TEXT NOT NULL CHECK(scope IN ('chat','actions')),
    window_start BIGINT NOT NULL, request_count INTEGER NOT NULL, PRIMARY KEY(user_id,scope))`,
];
