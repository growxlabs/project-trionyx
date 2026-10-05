CREATE TABLE IF NOT EXISTS agent_execution_logs (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  agent_name TEXT NOT NULL CHECK (agent_name = 'TRIX'),
  model_provider TEXT NOT NULL,
  model_name TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  request_summary TEXT NOT NULL,
  tool_events TEXT NOT NULL,
  response_type TEXT NOT NULL CHECK (response_type IN ('pending', 'serial_record', 'inventory_list', 'inventory_summary', 'serial_movements', 'inventory_exceptions', 'message')),
  error_code TEXT,
  error_summary TEXT
);
CREATE INDEX IF NOT EXISTS idx_agent_execution_user_timestamp ON agent_execution_logs(user_id, timestamp);
-- No anon/authenticated policies. The server's database role owns telemetry access.
ALTER TABLE agent_execution_logs ENABLE ROW LEVEL SECURITY;
