BEGIN;
ALTER TABLE agent_execution_logs ADD COLUMN IF NOT EXISTS metrics TEXT;
INSERT INTO _migrations(name) VALUES ('0017_trix_metrics') ON CONFLICT(name) DO NOTHING;
COMMIT;
