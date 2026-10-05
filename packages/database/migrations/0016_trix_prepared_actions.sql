BEGIN;
CREATE TABLE IF NOT EXISTS trix_prepared_actions (id TEXT PRIMARY KEY, requested_by TEXT NOT NULL REFERENCES users(id), state TEXT NOT NULL CHECK (state IN ('PREPARED','CONFIRMED','EXECUTED','CANCELLED','EXPIRED','FAILED')), action_type TEXT NOT NULL CHECK (action_type IN ('DEALER_DISTRIBUTOR_ASSIGNMENT','ENQUIRY_ASSIGNMENT','ENQUIRY_STATUS_CHANGE','INVENTORY_TRANSFER')), payload TEXT NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL, completed_at TEXT, error_code TEXT);
CREATE INDEX IF NOT EXISTS idx_trix_prepared_owner_state ON trix_prepared_actions(requested_by,state,expires_at);
ALTER TABLE trix_prepared_actions ENABLE ROW LEVEL SECURITY;
INSERT INTO _migrations (name) VALUES ('0016_trix_prepared_actions') ON CONFLICT (name) DO NOTHING;
COMMIT;
