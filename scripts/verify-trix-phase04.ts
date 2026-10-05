/** Sanitized engineering reads; not a substitute for authenticated MD model/API acceptance. */
import { getDbClient, getDatabaseUrl, isPostgresUrl, contactEnquiriesRepository, enquiryReadsRepository } from '../packages/database/src';
import { migrateEnquiryLogs } from '../packages/database/src/agentLogMigration';
async function main() {
  if (!isPostgresUrl(getDatabaseUrl())) throw new Error('POSTGRES_NOT_CONFIGURED');
  const db = getDbClient();
  try {
    if (process.argv.includes('--telemetry')) {
      const result = await db.execute("SELECT timestamp,response_type,error_code,tool_events FROM agent_execution_logs ORDER BY timestamp DESC LIMIT 8");
      console.log('Sanitized recent telemetry:', JSON.stringify(result.rows)); return;
    }
    if (process.argv.includes('--migrate')) { await migrateEnquiryLogs(db, true); console.log('Forward telemetry migration applied; no business-data writes.'); }
    const counts = await db.execute('SELECT type,status,COUNT(*) AS count FROM contact_enquiries GROUP BY type,status ORDER BY type,status');
    console.log('Stored enquiry counts:',JSON.stringify(counts.rows));
    const captured: Array<string | {sql:string;args?:unknown[]}> = [];
    const inspected = { execute: async (statement: string | {sql:string;args?:unknown[]}) => { captured.push(statement); return db.execute(statement as Parameters<typeof db.execute>[0]); } } as typeof db;
    for (const groupBy of ['status','type','assignment_status','state'] as const) {
      const result = await enquiryReadsRepository.summary({groupBy},inspected);
      console.log(`groupBy=${groupBy};total=${result.total};groupsReturned=${result.groups.length}`);
    }
    const cutoff = new Date(Date.now()-24*3600000).toISOString();
    const aged = await contactEnquiriesRepository.list({createdBefore:cutoff,limit:1},inspected);
    const unassigned = await contactEnquiriesRepository.list({type:'DEALER_ENQUIRY',hasOwner:false,limit:1},inspected);
    const attention = await enquiryReadsRepository.attention({},inspected);
    const changes = await enquiryReadsRepository.changes({limit:1},inspected,true);
    console.log(`olderThan24Hours=${aged.total};unassignedDealerEnquiries=${unassigned.total};attention=${attention.total};auditChanges=${changes.total}`);
    // Validate stored dates and owner relationships without printing contact fields/messages/IDs.
    const sample = await contactEnquiriesRepository.list({limit:1},db);
    console.log(`sampleTimestampValid=${!sample.items.length || Number.isFinite(Date.parse(sample.items[0].createdAt))}`);
    for(const statement of captured) {
      const sql=typeof statement==='string'?statement:statement.sql;
      const args=typeof statement==='string'?[]:statement.args;
      const plan=await db.execute({sql:`EXPLAIN ${sql}`,args:args as never});
      // Plans can contain literal identifiers/filter values; report node structure/cost only.
      console.log('query-plan:',plan.rows.map(row=>String(Object.values(row)[0]).replace(/\(.*$/, '').trim()).filter(line=>line && !/Filter:|Cond:|Key:|Output:/.test(line)).join(' | '));
    }
    const constraint=await db.execute("SELECT pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid='agent_execution_logs'::regclass AND conname='agent_execution_logs_response_type_check'");
    console.log(`phase04TelemetrySupported=${String(constraint.rows[0]?.definition??'').includes('enquiry_summary')}`);
  } finally {db.close();}
}
main().catch(()=>{console.error('TRIX_PHASE04_VERIFICATION_FAILED (details suppressed)');process.exitCode=1;});
