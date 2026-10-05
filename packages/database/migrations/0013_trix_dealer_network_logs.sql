-- Forward-only telemetry upgrade; no business data changes.
ALTER TABLE agent_execution_logs ADD COLUMN IF NOT EXISTS conversation_id TEXT;
ALTER TABLE agent_execution_logs DROP CONSTRAINT IF EXISTS agent_execution_logs_response_type_check;
ALTER TABLE agent_execution_logs ADD CONSTRAINT agent_execution_logs_response_type_check
  CHECK (response_type IN ('pending', 'serial_record', 'inventory_list', 'inventory_summary', 'serial_movements', 'inventory_exceptions', 'message', 'dealer_list', 'dealer_detail', 'distributor_list', 'distributor_detail', 'dealer_network_summary', 'dealer_assignment_history', 'dealer_network_exceptions'));
ALTER TABLE agent_execution_logs ENABLE ROW LEVEL SECURITY;
INSERT INTO _migrations (name) VALUES ('0013_trix_dealer_network_logs') ON CONFLICT (name) DO NOTHING;
