import { PREPARED_ACTION_TABLE_STATEMENTS } from './preparedActionSchema';
import type { Client } from '@libsql/client';
import { AGENT_LOG_TABLE_STATEMENTS } from './agentLogSchema';

export async function migrateDealerNetworkLogs(client: Client, postgres: boolean) {
  const name = '0013_trix_dealer_network_logs';
  const applied = await client.execute({ sql: 'SELECT name FROM _migrations WHERE name = ?', args: [name] });
  if (applied.rows.length) return;
  const types = "'pending', 'serial_record', 'inventory_list', 'inventory_summary', 'serial_movements', 'inventory_exceptions', 'message', 'dealer_list', 'dealer_detail', 'distributor_list', 'distributor_detail', 'dealer_network_summary', 'dealer_assignment_history', 'dealer_network_exceptions'";
  const marker = { sql: 'INSERT INTO _migrations (name) VALUES (?) ON CONFLICT (name) DO NOTHING', args: [name] };
  if (postgres) {
    await client.batch([
      'ALTER TABLE agent_execution_logs ADD COLUMN IF NOT EXISTS conversation_id TEXT',
      'ALTER TABLE agent_execution_logs DROP CONSTRAINT IF EXISTS agent_execution_logs_response_type_check',
      `ALTER TABLE agent_execution_logs ADD CONSTRAINT agent_execution_logs_response_type_check CHECK (response_type IN (${types}))`,
      'ALTER TABLE agent_execution_logs ENABLE ROW LEVEL SECURITY', marker,
    ], 'write');
  } else {
    // SQLite cannot alter a CHECK constraint. Rebuild only telemetry, copying every old row.
    const columns = await client.execute('PRAGMA table_info(agent_execution_logs)');
    const hasConversation = columns.rows.some(row => row.name === 'conversation_id');
    const hasMetrics = columns.rows.some(row => row.name === 'metrics');
    const oldColumns = 'id, session_id, user_id, agent_name, model_provider, model_name, timestamp, request_summary, tool_events, response_type, error_code, error_summary';
    await client.batch([
      AGENT_LOG_TABLE_STATEMENTS[0].replace('IF NOT EXISTS agent_execution_logs', 'agent_execution_logs_phase03'),
      `INSERT INTO agent_execution_logs_phase03 (${oldColumns}, conversation_id, metrics) SELECT ${oldColumns}, ${hasConversation ? 'conversation_id' : 'NULL'}, ${hasMetrics ? 'metrics' : 'NULL'} FROM agent_execution_logs`,
      'DROP TABLE agent_execution_logs',
      'ALTER TABLE agent_execution_logs_phase03 RENAME TO agent_execution_logs',
      AGENT_LOG_TABLE_STATEMENTS[1], marker,
    ], 'write');
  }
}
export async function migrateEnquiryLogs(client: Client, postgres: boolean) {
  const name = '0014_trix_enquiry_logs';
  const applied = await client.execute({ sql: 'SELECT name FROM _migrations WHERE name = ?', args: [name] });
  if (applied.rows.length) return;
  const types = "'pending', 'serial_record', 'inventory_list', 'inventory_summary', 'serial_movements', 'inventory_exceptions', 'message', 'dealer_list', 'dealer_detail', 'distributor_list', 'distributor_detail', 'dealer_network_summary', 'dealer_assignment_history', 'dealer_network_exceptions', 'enquiry_list', 'enquiry_detail', 'enquiry_summary', 'enquiry_attention', 'enquiry_changes'";
  const marker = { sql: 'INSERT INTO _migrations (name) VALUES (?) ON CONFLICT (name) DO NOTHING', args: [name] };
  if (postgres) {
    await client.batch([
      'ALTER TABLE agent_execution_logs ADD COLUMN IF NOT EXISTS conversation_id TEXT',
      'ALTER TABLE agent_execution_logs DROP CONSTRAINT IF EXISTS agent_execution_logs_response_type_check',
      `ALTER TABLE agent_execution_logs ADD CONSTRAINT agent_execution_logs_response_type_check CHECK (response_type IN (${types}))`,
      'ALTER TABLE agent_execution_logs ENABLE ROW LEVEL SECURITY', marker,
    ], 'write');
  } else {
    // SQLite cannot alter a CHECK constraint. Rebuild only telemetry, copying every old row.
    const columns = await client.execute('PRAGMA table_info(agent_execution_logs)');
    const hasConversation = columns.rows.some(row => row.name === 'conversation_id');
    const hasMetrics = columns.rows.some(row => row.name === 'metrics');
    const oldColumns = 'id, session_id, user_id, agent_name, model_provider, model_name, timestamp, request_summary, tool_events, response_type, error_code, error_summary';
    await client.batch([
      AGENT_LOG_TABLE_STATEMENTS[0].replace('IF NOT EXISTS agent_execution_logs', 'agent_execution_logs_phase04'),
      `INSERT INTO agent_execution_logs_phase04 (${oldColumns}, conversation_id, metrics) SELECT ${oldColumns}, ${hasConversation ? 'conversation_id' : 'NULL'}, ${hasMetrics ? 'metrics' : 'NULL'} FROM agent_execution_logs`,
      'DROP TABLE agent_execution_logs',
      'ALTER TABLE agent_execution_logs_phase04 RENAME TO agent_execution_logs',
      AGENT_LOG_TABLE_STATEMENTS[1], marker,
    ], 'write');
  }
}


export async function migrateWarrantyExecutiveLogs(client: Client, postgres: boolean) {
  const name = '0015_trix_warranty_executive_logs';
  const applied = await client.execute({ sql: 'SELECT name FROM _migrations WHERE name = ?', args: [name] });
  if (applied.rows.length) return;
  const types = "'pending', 'serial_record', 'inventory_list', 'inventory_summary', 'serial_movements', 'inventory_exceptions', 'message', 'dealer_list', 'dealer_detail', 'distributor_list', 'distributor_detail', 'dealer_network_summary', 'dealer_assignment_history', 'dealer_network_exceptions', 'enquiry_list', 'enquiry_detail', 'enquiry_summary', 'enquiry_attention', 'enquiry_changes', 'warranty_record', 'warranty_list', 'warranty_summary', 'warranty_exceptions', 'executive_overview', 'operational_changes'";
  const marker = { sql: 'INSERT INTO _migrations (name) VALUES (?) ON CONFLICT (name) DO NOTHING', args: [name] };
  if (postgres) {
    await client.batch([
      'ALTER TABLE agent_execution_logs ADD COLUMN IF NOT EXISTS conversation_id TEXT',
      'ALTER TABLE agent_execution_logs DROP CONSTRAINT IF EXISTS agent_execution_logs_response_type_check',
      `ALTER TABLE agent_execution_logs ADD CONSTRAINT agent_execution_logs_response_type_check CHECK (response_type IN (${types}))`,
      'ALTER TABLE agent_execution_logs ENABLE ROW LEVEL SECURITY', marker,
    ], 'write');
  } else {
    // SQLite cannot alter a CHECK constraint. Rebuild only telemetry, copying every old row.
    const columns = await client.execute('PRAGMA table_info(agent_execution_logs)');
    const hasConversation = columns.rows.some(row => row.name === 'conversation_id');
    const hasMetrics = columns.rows.some(row => row.name === 'metrics');
    const oldColumns = 'id, session_id, user_id, agent_name, model_provider, model_name, timestamp, request_summary, tool_events, response_type, error_code, error_summary';
    await client.batch([
      AGENT_LOG_TABLE_STATEMENTS[0].replace('IF NOT EXISTS agent_execution_logs', 'agent_execution_logs_phase05'),
      `INSERT INTO agent_execution_logs_phase05 (${oldColumns}, conversation_id, metrics) SELECT ${oldColumns}, ${hasConversation ? 'conversation_id' : 'NULL'}, ${hasMetrics ? 'metrics' : 'NULL'} FROM agent_execution_logs`,
      'DROP TABLE agent_execution_logs',
      'ALTER TABLE agent_execution_logs_phase05 RENAME TO agent_execution_logs',
      AGENT_LOG_TABLE_STATEMENTS[1], marker,
    ], 'write');
  }
}


export async function migratePreparedActionLogs(client: Client, postgres: boolean) {
  const name = '0016_trix_prepared_actions';
  const applied = await client.execute({ sql: 'SELECT name FROM _migrations WHERE name = ?', args: [name] });
  if (applied.rows.length) return;
  const types = "'pending', 'serial_record', 'inventory_list', 'inventory_summary', 'serial_movements', 'inventory_exceptions', 'message', 'dealer_list', 'dealer_detail', 'distributor_list', 'distributor_detail', 'dealer_network_summary', 'dealer_assignment_history', 'dealer_network_exceptions', 'enquiry_list', 'enquiry_detail', 'enquiry_summary', 'enquiry_attention', 'enquiry_changes', 'warranty_record', 'warranty_list', 'warranty_summary', 'warranty_exceptions', 'executive_overview', 'operational_changes', 'prepared_action'";
  const marker = { sql: 'INSERT INTO _migrations (name) VALUES (?) ON CONFLICT (name) DO NOTHING', args: [name] };
  if (postgres) {
    await client.batch([
      'ALTER TABLE agent_execution_logs ADD COLUMN IF NOT EXISTS conversation_id TEXT',
      'ALTER TABLE agent_execution_logs DROP CONSTRAINT IF EXISTS agent_execution_logs_response_type_check',
      `ALTER TABLE agent_execution_logs ADD CONSTRAINT agent_execution_logs_response_type_check CHECK (response_type IN (${types}))`,
      'ALTER TABLE agent_execution_logs ENABLE ROW LEVEL SECURITY', ...PREPARED_ACTION_TABLE_STATEMENTS, 'ALTER TABLE trix_prepared_actions ENABLE ROW LEVEL SECURITY', marker,
    ], 'write');
  } else {
    // SQLite cannot alter a CHECK constraint. Rebuild only telemetry, copying every old row.
    const columns = await client.execute('PRAGMA table_info(agent_execution_logs)');
    const hasConversation = columns.rows.some(row => row.name === 'conversation_id');
    const hasMetrics = columns.rows.some(row => row.name === 'metrics');
    const oldColumns = 'id, session_id, user_id, agent_name, model_provider, model_name, timestamp, request_summary, tool_events, response_type, error_code, error_summary';
    await client.batch([
      AGENT_LOG_TABLE_STATEMENTS[0].replace('IF NOT EXISTS agent_execution_logs', 'agent_execution_logs_phase06'),
      `INSERT INTO agent_execution_logs_phase06 (${oldColumns}, conversation_id, metrics) SELECT ${oldColumns}, ${hasConversation ? 'conversation_id' : 'NULL'}, ${hasMetrics ? 'metrics' : 'NULL'} FROM agent_execution_logs`,
      'DROP TABLE agent_execution_logs',
      'ALTER TABLE agent_execution_logs_phase06 RENAME TO agent_execution_logs',
      AGENT_LOG_TABLE_STATEMENTS[1], ...PREPARED_ACTION_TABLE_STATEMENTS, marker,
    ], 'write');
  }
}

export async function migrateTrixMetrics(client: Client, postgres: boolean) {
  const name = '0017_trix_metrics';
  const applied = await client.execute({sql:'SELECT name FROM _migrations WHERE name = ?',args:[name]});
  if (applied.rows.length) return migrateTrixRateLimits(client,postgres);
  const statements: Array<string | {sql:string;args:string[]}> = [];
  if(postgres) statements.push('ALTER TABLE agent_execution_logs ADD COLUMN IF NOT EXISTS metrics TEXT');
  else if(!(await client.execute('PRAGMA table_info(agent_execution_logs)')).rows.some(row=>row.name==='metrics')) statements.push('ALTER TABLE agent_execution_logs ADD COLUMN metrics TEXT');
  statements.push({sql:'INSERT INTO _migrations (name) VALUES (?) ON CONFLICT (name) DO NOTHING',args:[name]});
  await client.batch(statements,'write');
  await migrateTrixRateLimits(client,postgres);
}

export async function migrateTrixRateLimits(client:Client,postgres:boolean){
  const name='0018_trix_rate_limits';
  if((await client.execute({sql:'SELECT name FROM _migrations WHERE name = ?',args:[name]})).rows.length)return;
  const statements:Array<string|{sql:string;args:string[]}>= [`CREATE TABLE IF NOT EXISTS trix_request_limits (
    user_id TEXT NOT NULL REFERENCES users(id), scope TEXT NOT NULL CHECK(scope IN ('chat','actions')),
    window_start BIGINT NOT NULL, request_count INTEGER NOT NULL, PRIMARY KEY(user_id,scope))`];
  if(postgres)statements.push('ALTER TABLE trix_request_limits ENABLE ROW LEVEL SECURITY');
  statements.push({sql:'INSERT INTO _migrations (name) VALUES (?) ON CONFLICT (name) DO NOTHING',args:[name]});
  await client.batch(statements,'write');
}
