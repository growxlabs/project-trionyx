// Portable schema: Supabase/Postgres in production; isolated SQLite fixtures in tests.
export const AGENT_LOG_TABLE_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS agent_execution_logs (
    id TEXT PRIMARY KEY, session_id TEXT NOT NULL, conversation_id TEXT, user_id TEXT NOT NULL REFERENCES users(id),
    agent_name TEXT NOT NULL CHECK (agent_name = 'TRIX'), model_provider TEXT NOT NULL,
    model_name TEXT NOT NULL, timestamp TEXT NOT NULL, request_summary TEXT NOT NULL,
    tool_events TEXT NOT NULL, response_type TEXT NOT NULL CHECK (response_type IN ('pending', 'serial_record', 'inventory_list', 'inventory_summary', 'serial_movements', 'inventory_exceptions', 'message', 'dealer_list', 'dealer_detail', 'distributor_list', 'distributor_detail', 'dealer_network_summary', 'dealer_assignment_history', 'dealer_network_exceptions', 'enquiry_list', 'enquiry_detail', 'enquiry_summary', 'enquiry_attention', 'enquiry_changes', 'warranty_record', 'warranty_list', 'warranty_summary', 'warranty_exceptions', 'executive_overview', 'operational_changes', 'prepared_action')),
    error_code TEXT, error_summary TEXT, metrics TEXT
  );`,
  'CREATE INDEX IF NOT EXISTS idx_agent_execution_user_timestamp ON agent_execution_logs(user_id, timestamp);',
];
