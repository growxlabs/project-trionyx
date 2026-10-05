-- PostgreSQL forward migration. SQLite equivalent is applied transactionally by migrateEnquiryLogs.
BEGIN;
ALTER TABLE agent_execution_logs DROP CONSTRAINT IF EXISTS agent_execution_logs_response_type_check;
ALTER TABLE agent_execution_logs ADD CONSTRAINT agent_execution_logs_response_type_check CHECK (response_type IN (
  'pending', 'serial_record', 'inventory_list', 'inventory_summary', 'serial_movements', 'inventory_exceptions', 'message',
  'dealer_list', 'dealer_detail', 'distributor_list', 'distributor_detail', 'dealer_network_summary', 'dealer_assignment_history', 'dealer_network_exceptions',
  'enquiry_list', 'enquiry_detail', 'enquiry_summary', 'enquiry_attention', 'enquiry_changes'
));
ALTER TABLE agent_execution_logs ENABLE ROW LEVEL SECURITY;
INSERT INTO _migrations (name) VALUES ('0014_trix_enquiry_logs') ON CONFLICT (name) DO NOTHING;
COMMIT;
