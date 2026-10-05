/** Read-only production review and safe aggregate telemetry. --migrate changes schema only. */
import {getDbClient,getDatabaseUrl,isPostgresUrl} from '../packages/database/src';
import {migrateTrixMetrics} from '../packages/database/src/agentLogMigration';
import {aggregateTrixMetrics,latencyPercentiles} from '../packages/ai/src/logging/metrics';
async function main(){
  const postgres=isPostgresUrl(getDatabaseUrl());
  const url=new URL(getDatabaseUrl());
  const env={postgres,production:process.env.NODE_ENV==='production',provider:process.env.TRIX_MODEL_PROVIDER??'openrouter',model:process.env.TRIX_MODEL??'anthropic/claude-sonnet-4.6',serverKeyPresent:Boolean(process.env.OPENROUTER_API_KEY?.trim()),publicProviderKeyPresent:Object.keys(process.env).some(key=>key.startsWith('NEXT_PUBLIC_')&&/(OPENROUTER|SERVICE_ROLE|DATABASE_URL|API_KEY)/.test(key)),portalHttps:Boolean(process.env.NEXT_PUBLIC_PORTAL_URL?.startsWith('https://')),remoteDatabase:!['localhost','127.0.0.1','[::1]'].includes(url.hostname)};
  console.log('Environment flags (no secret values):',JSON.stringify(env));
  if(!postgres)throw new Error('POSTGRES_REQUIRED');
  const db=getDbClient();try{
    if(process.argv.includes('--migrate')){await migrateTrixMetrics(db,true);console.log('Applied 0017 telemetry and 0018 rate-limit migrations; no business mutation.');}
    const migrations=await db.execute("SELECT name FROM _migrations WHERE name IN ('0012_trix_execution_logs','0013_trix_dealer_network_logs','0014_trix_enquiry_logs','0015_trix_warranty_executive_logs','0016_trix_prepared_actions','0017_trix_metrics','0018_trix_rate_limits') ORDER BY name");
    console.log('TRIX migration markers:',JSON.stringify(migrations.rows));
    const rls=await db.execute("SELECT relname,relrowsecurity FROM pg_class WHERE oid IN ('agent_execution_logs'::regclass,'trix_prepared_actions'::regclass,'trix_request_limits'::regclass)");
    console.log('Workflow/telemetry/limiter RLS:',JSON.stringify(rls.rows));
    const policies=await db.execute("SELECT tablename,roles,cmd FROM pg_policies WHERE schemaname='public' AND tablename IN ('agent_execution_logs','trix_prepared_actions','trix_request_limits')");
    console.log('Policies (no payload):',JSON.stringify(policies.rows));
    const role=await db.execute('SELECT rolbypassrls,rolsuper FROM pg_roles WHERE rolname=current_user');
    console.log('Server role privileges:',JSON.stringify(role.rows));
    const queryTimes:number[]=[];for(let i=0;i<20;i++){const start=performance.now();await db.execute('SELECT COUNT(*) AS count FROM trix_prepared_actions');queryTimes.push(performance.now()-start);}
    console.log('Observed PostgreSQL workflow count query latency:',JSON.stringify(latencyPercentiles(queryTimes)));
    const projected=await db.execute('SELECT request_summary,response_type,error_code,model_provider,model_name,tool_events,metrics FROM agent_execution_logs ORDER BY timestamp DESC LIMIT 1000');
    console.log('Safe aggregate telemetry (latest 1000 log records):',JSON.stringify(aggregateTrixMetrics(projected.rows)));
    const fixtureCounts=await db.execute("SELECT COUNT(*) AS fixture_users FROM users WHERE email LIKE '%@test.invalid' OR email LIKE '%@example.test'");
    console.log('Synthetic user marker count (review only):',JSON.stringify(fixtureCounts.rows));
  }finally{db.close();}
}
main().catch((error:unknown)=>{const code=error&&typeof error==='object'&&'code' in error&&typeof error.code==='string'&&/^[A-Z0-9_]{1,60}$/.test(error.code)?error.code:'UNAVAILABLE';console.error(`TRIX_PHASE07_REVIEW_FAILED code=${code} (details suppressed; verify database connectivity and trusted CA)`);process.exitCode=1;});
