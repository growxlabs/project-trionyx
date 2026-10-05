/** Sanitized engineering verification. Does not replace authenticated MD acceptance. */
import { getDbClient, getDatabaseUrl, isPostgresUrl, warrantyReadsRepository, operationalChangesRepository, readInventoryAttention, serialsRepository, dealerNetworkRepository, enquiryReadsRepository } from '../packages/database/src';
import { createWarrantyExecutiveService } from '../packages/api/src/services/warrantyExecutive';
import { migrateWarrantyExecutiveLogs } from '../packages/database/src/agentLogMigration';
import { warrantyExecutiveResponseSchema } from '../packages/ai/src/responses/warranty-executive';
import { operationalWindow } from '../packages/ai/src/tools/warranty-executive';
async function main() {
  if (!isPostgresUrl(getDatabaseUrl())) throw new Error('POSTGRES_NOT_CONFIGURED');
  const db = getDbClient();
  try {
    if (process.argv.includes('--telemetry')) {
      const rows = await db.execute('SELECT timestamp,response_type,error_code,tool_events FROM agent_execution_logs ORDER BY timestamp DESC LIMIT 8');
      console.log('Sanitized telemetry:',JSON.stringify(rows.rows)); return;
    }
    if (process.argv.includes('--migrate')) { await migrateWarrantyExecutiveLogs(db,true); console.log('Phase 05 telemetry migration applied; no business writes.'); }
    const captured: Array<string | {sql:string;args?:unknown[]}> = [];
    const inspected = { execute: async (statement: string | {sql:string;args?:unknown[]}) => { captured.push(statement); return db.execute(statement as Parameters<typeof db.execute>[0]); } } as typeof db;
    const service = createWarrantyExecutiveService({
      list: query => warrantyReadsRepository.list(query,inspected), summary: query => warrantyReadsRepository.summary(query,inspected), exceptions: query => warrantyReadsRepository.exceptions(query,inspected), resolve: (query,kind) => warrantyReadsRepository.resolve(query,kind,inspected), changes: query => operationalChangesRepository.list(query,inspected,true),
      inventory: () => serialsRepository.getInventorySummary({groupBy:'status'},inspected), inventoryAttention: limit => readInventoryAttention(limit,inspected), networkSummary: query => dealerNetworkRepository.summary(query,inspected), networkAttention: query => dealerNetworkRepository.exceptions(query,inspected), enquirySummary: query => enquiryReadsRepository.summary(query,inspected), enquiryAttention: query => enquiryReadsRepository.attention(query,inspected),
    });
    const now = new Date(), today = operationalWindow({period:'today'},now);
    for(const groupBy of ['status','dealer','product','registration_period'] as const) { const result=await service.summary({groupBy}); console.log(`warranty group=${groupBy};total=${result.total};groups=${result.groupsTotal}`); }
    const sample=await service.list({limit:1});console.log(`warrantySampleValid=${!sample.items.length||Number.isFinite(Date.parse(sample.items[0].registeredAt))}`);
    const overview=warrantyExecutiveResponseSchema.parse({type:'executive_overview',...await service.overview(today,today,now)});
    if(overview.type==='executive_overview')console.log('Current real counts:',JSON.stringify({inventory:overview.inventory,dealers:overview.dealers,enquiries:overview.enquiries,warranties:overview.warranties,attention:Object.fromEntries(Object.entries(overview.attention).map(([key,value])=>[key,value.total])),activityCount:overview.activity.total}));
    console.log(`last7DaysEvents=${(await service.changes({...operationalWindow({period:'last_7_days'},now),limit:1})).total}`);
    const unique=new Map(captured.map(statement=>[typeof statement==='string'?statement:statement.sql,statement]));
    for(const statement of unique.values()) {
      const sql=typeof statement==='string'?statement:statement.sql,args=typeof statement==='string'?[]:statement.args;
      const plan=await db.execute({sql:`EXPLAIN ${sql}`,args:args as never});
      console.log('query-plan:',plan.rows.map(row=>String(Object.values(row)[0]).replace(/\(.*$/,'').trim()).filter(line=>line&&!/Filter:|Cond:|Key:|Output:/.test(line)).join(' | '));
    }
    const constraint=await db.execute("SELECT pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid='agent_execution_logs'::regclass AND conname='agent_execution_logs_response_type_check'");console.log(`phase05TelemetrySupported=${String(constraint.rows[0]?.definition??'').includes('executive_overview')}`);
  }finally{db.close();}
}
main().catch(()=>{console.error('TRIX_PHASE05_VERIFICATION_FAILED (details suppressed)');process.exitCode=1;});
