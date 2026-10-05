/** Engineering verification, not an authenticated MD acceptance test.
 * Load existing server env with node --env-file; never print connection strings or records.
 * No business-data writes. --migrate applies only the reviewed telemetry migration.
 */
import { getDbClient, getDatabaseUrl, isPostgresUrl, dealerNetworkRepository, dealersRepository, distributorsRepository } from '../packages/database/src';
import { migrateDealerNetworkLogs } from '../packages/database/src/agentLogMigration';
import { AGENT_LOG_TABLE_STATEMENTS } from '../packages/database/src/agentLogSchema';

async function main() {
  if (!isPostgresUrl(getDatabaseUrl())) throw new Error('POSTGRES_NOT_CONFIGURED');
  const db = getDbClient();
  try {
    if (process.argv.includes('--telemetry')) {
      const executions = await db.execute(`SELECT timestamp, response_type, error_code, tool_events
        FROM agent_execution_logs ORDER BY timestamp DESC LIMIT 20`);
      // The runtime's telemetry contains counts/filter names, never record payloads or sessions.
      console.log('Recent sanitized TRIX telemetry:', JSON.stringify(executions.rows));
      return;
    }
    const facts = await db.execute(`SELECT
      (SELECT COUNT(*) FROM dealers) AS dealers,
      (SELECT COUNT(*) FROM distributors) AS distributors,
      (SELECT COUNT(*) FROM dealer_distributor_history) AS history,
      (SELECT COUNT(*) FROM users WHERE role = 'MANAGING_DIRECTOR' AND status = 'ACTIVE') AS active_mds`);
    console.log('Postgres domain counts:', JSON.stringify(facts.rows[0]));
    const collected: Array<string | { sql: string; args?: unknown[] }> = [];
    const inspectedClient = { execute: async (statement: string | { sql: string; args?: unknown[] }) => { collected.push(statement); return db.execute(statement as Parameters<typeof db.execute>[0]); } } as unknown as typeof db;
    for (const groupBy of ['distributor', 'dealer_status', 'state', 'assignment_status'] as const) {
      const result = await dealerNetworkRepository.summary({ groupBy }, inspectedClient);
      console.log(`summary=${groupBy};totalDealers=${result.totalDealers};groupsReturned=${result.groups.length}`);
    }
    const unassigned = await dealersRepository.list({ hasDistributor: false, limit: 1 }, db);
    const distributors = await distributorsRepository.list({ limit: 1 }, db);
    const history = await dealerNetworkRepository.history({ limit: 1 }, db);
    const exceptions = await dealerNetworkRepository.exceptions({ limit: 1 }, inspectedClient);
    console.log(`unassigned=${unassigned.total};distributors=${distributors.total};history=${history.total};exceptions=${exceptions.total}`);
    for (const statement of collected) {
      const sql = typeof statement === 'string' ? statement : statement.sql;
      const args = typeof statement === 'string' ? [] : statement.args;
      const plan = await db.execute({ sql: `EXPLAIN ${sql}`, args: args as never });
      console.log('query-plan:', plan.rows.map(row => Object.values(row).join(' ')).join('\n'));
    }
    if (process.argv.includes('--migrate')) {
      await db.batch(AGENT_LOG_TABLE_STATEMENTS, 'write');
      await migrateDealerNetworkLogs(db, true);
      console.log('Telemetry migration applied.');
    }
    const constraint = await db.execute("SELECT pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid = 'agent_execution_logs'::regclass AND conname = 'agent_execution_logs_response_type_check'");
    console.log(`phase03TelemetrySupported=${String(constraint.rows[0]?.definition ?? '').includes('dealer_network_summary')}`);
    const columns = await db.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'agent_execution_logs' AND column_name = 'conversation_id'");
    console.log(`conversationColumnPresent=${columns.rows.length === 1}`);
  } finally { db.close(); }
}
main().catch(() => { console.error('TRIX_PHASE03_VERIFICATION_FAILED (details suppressed to protect server credentials)'); process.exitCode = 1; });
