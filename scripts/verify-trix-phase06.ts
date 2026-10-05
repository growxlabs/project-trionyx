/** Schema verification and disposable PostgreSQL TEMP fixtures, not live MD mutation acceptance. */
import { randomUUID } from 'node:crypto';
import { getDbClient,getDatabaseUrl,isPostgresUrl,withDatabaseTransaction,type DatabaseClient } from '../packages/database/src';
import { POSTGRES_TABLE_STATEMENTS } from '../packages/database/src/postgresSchema';
import { PREPARED_ACTION_TABLE_STATEMENTS } from '../packages/database/src/preparedActionSchema';
import { migratePreparedActionLogs } from '../packages/database/src/agentLogMigration';
import { createPreparedActionsService,PreparedActionError } from '../packages/api/src/services/preparedActions';
import type { SafeUser } from '../packages/types/src';
async function main() {
  if(process.argv.includes('--http')) {
    const url='http://localhost:3002/api/v1/internal/trix/actions';
    const get=await fetch(`${url}?preparationId=${randomUUID()}`);
    const post=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Origin:'http://localhost:3002'},body:JSON.stringify({operation:'confirm',preparationId:randomUUID(),confirm:true,previewDigest:'0'.repeat(64)})});
    if(get.status!==401||post.status!==401)throw new Error('AUTH_GATE_FAILED');
    console.log(`Unauthenticated view=${get.status}; confirmation=${post.status}; both denied before workflow access.`);return;
  }
  if(!isPostgresUrl(getDatabaseUrl()))throw new Error('POSTGRES_REQUIRED');
  const db=getDbClient();
  try {
    if(process.argv.includes('--targets')) {
      const locations=await db.execute('SELECT code,name,status FROM inventory_locations ORDER BY code LIMIT 10');
      const enquiries=await db.execute('SELECT enquiry_code,status FROM contact_enquiries ORDER BY enquiry_code LIMIT 5');
      console.log('Engineering read of operational references only:',JSON.stringify({locations:locations.rows,enquiries:enquiries.rows}));return;
    }
    if(process.argv.includes('--migrate')){await migratePreparedActionLogs(db,true);console.log('Applied workflow/telemetry migration only; no live business mutation.');}
    const security=await db.execute("SELECT relrowsecurity FROM pg_class WHERE oid='trix_prepared_actions'::regclass");
    console.log(`workflowRlsEnabled=${security.rows[0]?.relrowsecurity===true}`);
    const constraint=await db.execute("SELECT pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid='agent_execution_logs'::regclass AND conname='agent_execution_logs_response_type_check'");
    console.log(`preparedTelemetrySupported=${String(constraint.rows[0]?.definition).includes('prepared_action')}`);
    await withDatabaseTransaction(db,async temporary=>{
      // Every test business/workflow/log table shadows production only on this one connection and drops at commit.
      for(const statement of [...POSTGRES_TABLE_STATEMENTS,...PREPARED_ACTION_TABLE_STATEMENTS]) {
        if(statement.trim().startsWith('CREATE TABLE'))await temporary.execute(statement.replace('CREATE TABLE IF NOT EXISTS','CREATE TEMP TABLE').trim().replace(/;$/,'')+' ON COMMIT DROP');
      }
      for(const table of ['users','dealers','distributors','contact_enquiries','serial_numbers','serial_movements','dealer_distributor_history','audit_logs','agent_execution_logs','trix_prepared_actions']) {
        const row=await temporary.execute({sql:'SELECT relnamespace=pg_my_temp_schema() AS temporary FROM pg_class WHERE oid=to_regclass(?)',args:[table]});
        if(row.rows[0]?.temporary!==true)throw new Error('TEMP_ISOLATION_REQUIRED');
      }
      const now=new Date(),stamp=now.toISOString();
      await temporary.execute({sql:"INSERT INTO users (id,name,email,password_hash,role,status,updated_at) VALUES ('test-md','Test MD','md@test.invalid','fixture','MANAGING_DIRECTOR','ACTIVE',?),('test-owner','Test owner','owner@test.invalid','fixture','STAFF','ACTIVE',?)",args:[stamp,stamp]});
      await temporary.execute({sql:"INSERT INTO distributors (id,distributor_code,business_name,contact_person,phone,city,state,created_by,updated_by,updated_at) VALUES ('dst1','TEST-DST-1','Source distributor','Fixture','fixture','Fixture','Fixture','test-md','test-md',?),('dst2','TEST-DST-2','Destination distributor','Fixture','fixture','Fixture','Fixture','test-md','test-md',?)",args:[stamp,stamp]});
      await temporary.execute({sql:"INSERT INTO dealers (id,dealer_code,business_name,contact_person,phone,city,state,distributor_id,created_by,updated_by,updated_at) VALUES ('dealer','TEST-DLR','Test dealer','Fixture','fixture','Fixture','Fixture','dst1','test-md','test-md',?)",args:[stamp]});
      await temporary.execute({sql:"INSERT INTO contact_enquiries (id,enquiry_code,type,full_name,phone,status,updated_at) VALUES ('enquiry','TEST-ENQ','GENERAL_ENQUIRY','Fixture','fixture','NEW',?)",args:[stamp]});
      await temporary.execute("INSERT INTO product_categories (id,name,slug) VALUES ('cat','Fixture','fixture')");
      await temporary.execute("INSERT INTO products (id,product_code,name,slug,category_id) VALUES ('product','TEST-P','Fixture','fixture','cat')");
      await temporary.execute({sql:"INSERT INTO inventory_locations (id,code,name,updated_at) VALUES ('source','TEST-SOURCE','Source',?),('destination','TEST-DEST','Destination',?)",args:[stamp,stamp]});
      await temporary.execute({sql:"INSERT INTO serial_numbers (id,product_id,serial_number,location_id,updated_at) VALUES ('serial','product','TEST-SERIAL','source',?)",args:[stamp]});
      const transaction=async<T>(connection:DatabaseClient,run:(client:DatabaseClient)=>Promise<T>)=>{
        await connection.execute('SAVEPOINT phase06_operation');
        try{const result=await run(connection);await connection.execute('RELEASE SAVEPOINT phase06_operation');return result;}
        catch(error){await connection.execute('ROLLBACK TO SAVEPOINT phase06_operation');await connection.execute('RELEASE SAVEPOINT phase06_operation');throw error;}
      };
      const service=createPreparedActionsService({client:async()=>temporary,transaction,postgres:true,now:()=>now});
      const user={id:'test-md',role:'MANAGING_DIRECTOR',status:'ACTIVE'} as SafeUser;
      const context={user,sessionId:'temporary-fixture',conversationId:randomUUID(),authorize:async()=>user};
      const cases=[
        ['DEALER_DISTRIBUTOR_ASSIGNMENT',{dealerReference:{id:'dealer'},distributorReference:{id:'dst2'}}],
        ['ENQUIRY_ASSIGNMENT',{enquiryReference:{id:'enquiry'},ownerReference:{id:'test-owner'}}],
        ['ENQUIRY_STATUS_CHANGE',{enquiryReference:{id:'enquiry'},proposedStatus:'IN_PROGRESS'}],
        ['INVENTORY_TRANSFER',{serialNumbers:['TEST-SERIAL'],destinationLocationReference:{id:'destination'}}],
      ] as const;
      for(const [type,input] of cases){
        const action=await service.prepare(type,input,context);
        const confirm={preparationId:action.preparationId,confirm:true,previewDigest:action.previewDigest};
        if((await service.confirm(confirm,context)).state!=='EXECUTED')throw new Error('NOT_EXECUTED');
        try{await service.confirm(confirm,context);throw new Error('DUPLICATE_EXECUTED');}catch(error){if(!(error instanceof PreparedActionError)||error.code!=='TRIX_ACTION_ALREADY_EXECUTED')throw error;}
        console.log(`temporary ${type}: prepare/row-lock/confirm/idempotency passed`);
      }
      const audit=await temporary.execute('SELECT COUNT(*) AS count FROM audit_logs');
      const logs=await temporary.execute('SELECT COUNT(*) AS count FROM agent_execution_logs');
      if(Number(audit.rows[0].count)!==4||Number(logs.rows[0].count)<8)throw new Error('AUDIT_OR_TELEMETRY_MISSING');
      const stale=await service.prepare('ENQUIRY_STATUS_CHANGE',{enquiryReference:{id:'enquiry'},proposedStatus:'CLOSED'},context);
      await temporary.execute("UPDATE contact_enquiries SET status='NEW' WHERE id='enquiry'");
      try{await service.confirm({preparationId:stale.preparationId,confirm:true,previewDigest:stale.previewDigest},context);throw new Error('STALE_EXECUTED');}catch(error){if(!(error instanceof PreparedActionError)||error.code!=='TRIX_ACTION_STALE')throw error;}
      console.log('Temporary PostgreSQL fixture audit/logging/stale checks passed. All fixture tables drop at commit.');
    });
    const live=await db.execute('SELECT state,COUNT(*) AS count FROM trix_prepared_actions GROUP BY state ORDER BY state');
    console.log('Live workflow state counts only:',JSON.stringify(live.rows));
  }finally{db.close();}
}
main().catch(()=>{console.error('TRIX_PHASE06_VERIFICATION_FAILED (details suppressed)');process.exitCode=1;});
