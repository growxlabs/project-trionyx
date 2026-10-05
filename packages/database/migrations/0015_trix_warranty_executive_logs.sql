-- PostgreSQL forward migration. SQLite equivalent is applied transactionally by migrateWarrantyExecutiveLogs.
BEGIN;
ALTER TABLE agent_execution_logs DROP CONSTRAINT IF EXISTS agent_execution_logs_response_type_check;
ALTER TABLE agent_execution_logs ADD CONSTRAINT agent_execution_logs_response_type_check CHECK (response_type IN (
  'pending', 'serial_record', 'inventory_list', 'inventory_summary', 'serial_movements', 'inventory_exceptions', 'message',
  'dealer_list', 'dealer_detail', 'distributor_list', 'distributor_detail', 'dealer_network_summary', 'dealer_assignment_history', 'dealer_network_exceptions',
  'enquiry_list', 'enquiry_detail', 'enquiry_summary', 'enquiry_attention', 'enquiry_changes', 'warranty_record', 'warranty_list', 'warranty_summary', 'warranty_exceptions', 'executive_overview', 'operational_changes'
));
ALTER TABLE agent_execution_logs ENABLE ROW LEVEL SECURITY;
INSERT INTO _migrations (name) VALUES ('0015_trix_warranty_executive_logs') ON CONFLICT (name) DO NOTHING;
COMMIT;
