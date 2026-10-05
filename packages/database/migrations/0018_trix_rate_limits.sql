BEGIN;
CREATE TABLE IF NOT EXISTS trix_request_limits (
  user_id TEXT NOT NULL REFERENCES users(id), scope TEXT NOT NULL CHECK(scope IN ('chat','actions')),
  window_start BIGINT NOT NULL, request_count INTEGER NOT NULL, PRIMARY KEY(user_id,scope));
ALTER TABLE trix_request_limits ENABLE ROW LEVEL SECURITY;
INSERT INTO _migrations(name) VALUES ('0018_trix_rate_limits') ON CONFLICT(name) DO NOTHING;
COMMIT;
