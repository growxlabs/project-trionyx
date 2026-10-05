import { toolCallPart, activityName, ChainMockModel } from './tool-call';
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { MockLanguageModelV3 } from 'ai/test';
import { getDbClient, warrantyReadsRepository, operationalChangesRepository, readInventoryAttention, serialsRepository, dealerNetworkRepository, enquiryReadsRepository } from '@trionyx/database';
import { createWarrantyExecutiveService } from '@trionyx/api';
import type { SafeUser } from '@trionyx/types';
import { searchWarranties, getWarrantySummary, getWarrantyExceptions, getExecutiveOverview, getRecentOperationalChanges, operationalWindow } from '../tools/warranty-executive';
import { warrantyExecutiveResponseSchema } from '../responses/warranty-executive';
import { runTrix } from '../trix-agent';
const db = getDbClient('file::memory:');
const now = new Date('2026-10-04T06:00:00.000Z');
const md = { id: 'md', role: 'MANAGING_DIRECTOR', status: 'ACTIVE' } as SafeUser;
const context = { user: md, sessionId: 'private-session', authorize: async () => md };
const service = createWarrantyExecutiveService({
  list: query => warrantyReadsRepository.list(query, db), summary: query => warrantyReadsRepository.summary(query, db), exceptions: query => warrantyReadsRepository.exceptions(query, db), resolve: (query, kind) => warrantyReadsRepository.resolve(query, kind, db), changes: query => operationalChangesRepository.list(query, db, false),
  inventory: () => serialsRepository.getInventorySummary({ groupBy: 'status' }, db), inventoryAttention: limit => readInventoryAttention(limit, db), networkSummary: query => dealerNetworkRepository.summary(query, db), networkAttention: query => dealerNetworkRepository.exceptions(query, db), enquirySummary: query => enquiryReadsRepository.summary(query, db), enquiryAttention: query => enquiryReadsRepository.attention(query, db),
});
function model(toolName: string, input: unknown, extraText?: string) {
  return new ChainMockModel({ doGenerate: { content: [toolCallPart(randomUUID(), toolName, input), ...(extraText ? [{ type: 'text' as const, text: extraText }] : [])], finishReason: { unified: 'tool-calls', raw: undefined }, usage: { inputTokens: { total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined }, outputTokens: { total: 10, text: 10, reasoning: undefined } }, warnings: [] } });
}
const tables = ['warranties', 'products', 'serial_numbers', 'inventory_locations', 'dealers', 'distributors', 'users', 'contact_enquiries', 'serial_movements', 'dealer_distributor_history', 'audit_logs'];
const snapshot = () => Promise.all(tables.map(table => db.execute(`SELECT * FROM ${table} ORDER BY id`))).then(rows => JSON.stringify(rows));
let initial: string;
before(async () => {
  await db.batch([
    'CREATE TABLE products (id TEXT PRIMARY KEY,name TEXT,product_code TEXT,status TEXT)',
    "INSERT INTO products VALUES ('p1','Ceramic','CER','ACTIVE'),('p2','Graphene','GRA','ACTIVE'),('dup1','Duplicate','DU1','INACTIVE'),('dup2','Duplicate','DU2','INACTIVE')",
    'CREATE TABLE inventory_locations (id TEXT PRIMARY KEY,name TEXT,code TEXT,status TEXT)',
    "INSERT INTO inventory_locations VALUES ('l1','Hub','HUB','ACTIVE'),('l2','Old','OLD','INACTIVE')",
    'CREATE TABLE serial_numbers (id TEXT PRIMARY KEY,serial_number TEXT,product_id TEXT,location_id TEXT,status TEXT)',
    "INSERT INTO serial_numbers VALUES ('s1','TRX-001','p1','l1','AVAILABLE'),('s2','TRX-002','p1','l2','AVAILABLE'),('s3','TRX-003','p2','l1','TRANSFERRED'),('s4','TRX-004','p2','missing','INACTIVE')",
    'CREATE TABLE distributors (id TEXT PRIMARY KEY,business_name TEXT,status TEXT)',
    "INSERT INTO distributors VALUES ('dst','Distributor','ACTIVE')",
    'CREATE TABLE dealers (id TEXT PRIMARY KEY,business_name TEXT,status TEXT,distributor_id TEXT,state TEXT)',
    "INSERT INTO dealers VALUES ('d1','Studio','ACTIVE','dst','Telangana'),('d2','Unassigned','ACTIVE',NULL,'Goa'),('d3','Inactive','INACTIVE','dst','Goa')",
    'CREATE TABLE users (id TEXT PRIMARY KEY,name TEXT,status TEXT)',
    "INSERT INTO users VALUES ('md','MD','ACTIVE')",
    'CREATE TABLE contact_enquiries (id TEXT PRIMARY KEY,enquiry_code TEXT,status TEXT,assigned_to TEXT,created_at TEXT)',
    "INSERT INTO contact_enquiries VALUES ('e1','ENQ-1','NEW',NULL,'2026-10-04T00:00:00.000Z'),('e2','ENQ-2','IN_PROGRESS','md','2026-10-03T00:00:00.000Z'),('e3','ENQ-3','CLOSED',NULL,'2026-10-01T00:00:00.000Z')",
    'CREATE TABLE warranties (id TEXT PRIMARY KEY,serial_record_id TEXT,product_id TEXT,dealer_id TEXT,status TEXT,installation_date TEXT,warranty_start_date TEXT,warranty_end_date TEXT,activated_at TEXT,voided_at TEXT)',
    "INSERT INTO warranties VALUES ('w1','s1','p1','d1','ACTIVE','2026-10-01','2026-10-01','2027-10-01','2026-10-03T18:30:00.000Z',NULL),('w2','s2','p1','d2','ACTIVE','2025-09-01','2025-09-01','2026-09-01','2026-09-01T00:00:00.000Z',NULL),('w3','s3','p2',NULL,'VOID','2026-10-01','2026-10-01','2027-10-01','2026-10-02T00:00:00.000Z','2026-10-04T01:00:00.000Z'),('w4','s4','p2','d3','ACTIVE','2026-10-01','2026-10-01','2026-10-04','2026-10-03T18:29:59.999Z',NULL)",
    'CREATE TABLE serial_movements (id TEXT PRIMARY KEY,serial_record_id TEXT,type TEXT,created_at TEXT)',
    "INSERT INTO serial_movements VALUES ('m1','s1','RECEIVED','2026-10-04T03:00:00.000Z'),('m2','s2','TRANSFERRED','2026-10-03T00:00:00.000Z')",
    'CREATE TABLE dealer_distributor_history (id TEXT PRIMARY KEY,dealer_id TEXT,changed_at TEXT)',
    "INSERT INTO dealer_distributor_history VALUES ('h1','d1','2026-10-04T02:00:00.000Z')",
    'CREATE TABLE audit_logs (id TEXT PRIMARY KEY,event TEXT,metadata TEXT,created_at TEXT)',
    'CREATE TABLE _migrations (name TEXT UNIQUE)',
  ]);
  for (const [id, event, metadata, timestamp] of [
    ['a1','WARRANTY_ACTIVATED',{ warrantyId:'w1', customer:'private-customer', apiKey:'private-key' },'2026-10-03T18:30:00.000Z'],
    ['a2','WARRANTY_VOIDED',{ warrantyId:'w3', reason:'private-reason' },'2026-10-04T01:00:00.000Z'],
    ['a3','CONTACT_ENQUIRY_STATUS_CHANGED',{ enquiryId:'e2', phone:'private-phone' },'2026-10-04T03:00:00.000Z'],
    ['duplicate-assignment','DEALER_DISTRIBUTOR_ASSIGNED',{ dealerId:'d1' },'2026-10-04T02:00:00.000Z'],
    ['ignored','USER_LOGIN',{ apiKey:'private-key' },'2026-10-04T04:00:00.000Z'],
  ] as const) await db.execute({ sql:'INSERT INTO audit_logs VALUES (?,?,?,?)', args:[id,event,JSON.stringify(metadata),timestamp] });
  initial = await snapshot();
});
after(async () => { assert.equal(await snapshot(), initial, 'Phase 05 reads must preserve all business rows'); db.close(); });
test('warranty serial normalization, real dates and missing record', async () => {
  const result = await searchWarranties({ serialNumber:' trx-001 ' },md,service,now);
  assert.ok(result.success); if(result.success && result.response.type==='warranty_list') { const warranty=result.response.items[0]; assert.equal(warranty.warrantyId,'w1'); assert.equal(warranty.expiryDate,'2027-10-01'); }
  const missing=await searchWarranties({serialNumber:'TRX-ABSENT'},md,service,now);assert.ok(missing.success);if(missing.success&&missing.response.type==='warranty_list')assert.equal(missing.response.pageInfo.total,0);
});
for(const [label,input,total] of [
  ['active',{status:'ACTIVE'},2],['expired',{status:'EXPIRED'},1],['void',{status:'VOID'},1],['dealer',{dealerName:' studio '},1],['product',{productName:'CERAMIC'},2],['id',{warrantyId:'w1'},1],['serial',{serialNumber:'trx-003'},1],['UTC date',{registeredFrom:'2026-10-04',registeredTo:'2026-10-04'},0],['today India',{registeredPeriod:'today'},1],['month India',{registeredPeriod:'this_month'},3],['week India',{registeredPeriod:'this_week'},3],['last7',{registeredPeriod:'last_7_days'},3],['combined',{productId:'p1',dealerId:'d1',status:'ACTIVE'},1],
] as const)test(`warranty filters ${label}`,async()=>{const r=await searchWarranties(input,md,service,now);assert.ok(r.success);if(r.success&&r.response.type==='warranty_list')assert.equal(r.response.pageInfo.total,total);});
test('inclusive expiry date and stable warranty pagination',async()=>{
  const r=await searchWarranties({serialNumber:'TRX-004'},md,service,now);assert.ok(r.success);if(r.success&&r.response.type==='warranty_list')assert.equal(r.response.items[0].status,'ACTIVE');
  const a=await searchWarranties({limit:1},md,service,now),b=await searchWarranties({limit:1,page:2},md,service,now);assert.ok(a.success&&b.success);if(a.success&&b.success&&a.response.type==='warranty_list'&&b.response.type==='warranty_list'){assert.equal(a.response.pageInfo.total,4);assert.equal(a.response.pageInfo.hasMore,true);assert.notEqual(a.response.items[0].warrantyId,b.response.items[0].warrantyId);}
});
for(const input of [{serialNumber:''},{serialNumber:'a'},{serialNumber:'x\nkey'},{status:'APPROVED'},{limit:51},{page:0},{registeredFrom:'2026-02-30'},{registeredFrom:'2026-10-05',registeredTo:'2026-10-04'},{registeredPeriod:'today',registeredFrom:'2026-10-04'},{userId:'md'}])test(`invalid warranty input ${JSON.stringify(input)}`,async()=>{const r=await searchWarranties(input as never,md,service,now);assert.ok(!r.success);if(!r.success)assert.equal(r.errorCode,'TRIX_INVALID_REQUEST');});
test('exact target ambiguity, missing and conflicting identity',async()=>{for(const input of [{productName:'Duplicate'},{dealerName:'Absent'},{productId:'p1',productName:'Graphene'}]){const r=await searchWarranties(input,md,service,now);assert.ok(!r.success);if(!r.success)assert.match(r.errorCode,/AMBIGUOUS|NOT_FOUND/);}});
for(const groupBy of ['status','dealer','product','registration_period'] as const)test(`server warranty summary ${groupBy}`,async()=>{const r=await getWarrantySummary({groupBy},md,service,now);assert.ok(r.success);if(r.success&&r.response.type==='warranty_summary'){assert.equal(r.response.total,4);assert.equal(r.response.groups.reduce((s,g)=>s+g.count,0),4);if(groupBy==='status')assert.deepEqual(Object.fromEntries(r.response.groups.map(g=>[g.key,g.count])),{ACTIVE:2,EXPIRED:1,VOID:1});if(groupBy==='dealer')assert.ok(r.response.groups.some(g=>g.key==='UNASSIGNED'));}});
test('bounded grouped counts retain total and filters',async()=>{const r=await getWarrantySummary({groupBy:'product',registeredPeriod:'this_month',limit:1},md,service,now);assert.ok(r.success);if(r.success&&r.response.type==='warranty_summary'){assert.equal(r.response.total,3);assert.equal(r.response.groups.length,1);assert.equal(r.response.pageInfo.hasMore,true);}});
test('warranty attention flags inactive relationship without altering coverage',async()=>{const r=await getWarrantyExceptions({},md,service,now);assert.ok(r.success);if(r.success&&r.response.type==='warranty_exceptions')assert.deepEqual(r.response.items,[{recordId:'w4',rule:'INACTIVE_DEALER',severity:'WARNING'}]);});
test('all supported integrity rules detect corrupted fixture records',async()=>{
  const isolated=getDbClient('file::memory:');
  try{await isolated.batch(['CREATE TABLE warranties (id TEXT,serial_record_id TEXT,product_id TEXT,dealer_id TEXT,status TEXT,warranty_start_date TEXT,warranty_end_date TEXT,voided_at TEXT)','CREATE TABLE serial_numbers (id TEXT)','CREATE TABLE products (id TEXT)','CREATE TABLE dealers (id TEXT,status TEXT)',"INSERT INTO warranties VALUES ('a','absent','absent','absent','ACTIVE','2026-10-02','2026-10-01','2026-10-03'),('b','absent','absent',NULL,'ACTIVE','2026-10-01','2026-10-02',NULL),('c','absent','absent',NULL,'VOID','2026-10-01','2026-10-02',NULL)"]);const r=await warrantyReadsRepository.exceptions({},isolated);const rules=new Set(r.items.map(i=>i.rule));for(const rule of ['MISSING_SERIAL','MISSING_PRODUCT','MISSING_DEALER','DUPLICATE_ACTIVE','INVALID_DATE_ORDER','INVALID_VOID_STATE'])assert.ok(rules.has(rule as never));assert.equal(r.total,12);assert.equal((await warrantyReadsRepository.exceptions({limit:1},isolated)).items.length,1);}finally{isolated.close();}
});
test('executive overview returns exact current fixture counts and bounded approved attention',async()=>{
  const r=await getExecutiveOverview({period:'today'},md,service,now);assert.ok(r.success);if(r.success&&r.response.type==='executive_overview'){
    assert.deepEqual(r.response.inventory,{totalSerials:4,availableSerials:2});assert.deepEqual(r.response.dealers,{totalDealers:3,totalDistributors:1,activeDealers:2,unassignedDealers:1});assert.deepEqual(r.response.enquiries,{total:3,new:1,inProgress:1,closed:1,unassigned:2});assert.deepEqual(r.response.warranties,{total:4,active:2,expired:1,void:1,registeredToday:1});assert.deepEqual(Object.fromEntries(Object.entries(r.response.attention).map(([k,v])=>[k,v.total])),{inventory:3,dealers:1,enquiries:1,warranties:1});assert.equal(r.response.activity.total,5);assert.doesNotMatch(JSON.stringify(r),/private|customer|risk|revenue|coverage/);
  }
});
test('operational changes have global ordering, tie break, window, pagination and deduplication',async()=>{
  const r=await getRecentOperationalChanges({period:'last_7_days'},md,service,now);assert.ok(r.success);if(r.success&&r.response.type==='operational_changes'){assert.deepEqual(r.response.items.map(i=>i.id),['inventory:m1','audit:a3','assignment:h1','audit:a2','audit:a1','inventory:m2']);assert.equal(r.response.pageInfo.total,6);assert.doesNotMatch(JSON.stringify(r),/private|duplicate-assignment|USER_LOGIN/);}
  const r2=await getRecentOperationalChanges({period:'today',limit:1,page:2},md,service,now);assert.ok(r2.success);if(r2.success&&r2.response.type==='operational_changes'){assert.equal(r2.response.items[0].id,'audit:a3');assert.equal(r2.response.pageInfo.hasMore,true);}
  const r3=await getRecentOperationalChanges({module:'warranties',period:'today'},md,service,now);assert.ok(r3.success);if(r3.success&&r3.response.type==='operational_changes')assert.equal(r3.response.pageInfo.total,2);
});
test('missing history and malformed output return controlled errors',async()=>{
  const r=await getRecentOperationalChanges({},md,{...service,changes:async()=>{throw new Error('private-key');}},now);assert.ok(!r.success);if(!r.success){assert.equal(r.errorCode,'TRIX_OPERATIONAL_HISTORY_UNAVAILABLE');assert.doesNotMatch(r.message,/private/);}
  const invalid=await getWarrantySummary({groupBy:'status'},md,{...service,summary:async()=>({total:-1,groupsTotal:0,groups:[]})},now);assert.ok(!invalid.success);
});
test('relative windows resolve from server India calendar; explicit bounds remain UTC',()=>{
  assert.deepEqual(operationalWindow({period:'today'},now),{from:'2026-10-03T18:30:00.000Z',to:'2026-10-04T18:29:59.999Z'});assert.equal(operationalWindow({period:'this_week'},now).from,'2026-09-27T18:30:00.000Z');assert.equal(operationalWindow({period:'this_month'},now).from,'2026-09-30T18:30:00.000Z');assert.equal(operationalWindow({period:'last_7_days'},now).from,'2026-09-27T18:30:00.000Z');assert.equal(operationalWindow({from:'2026-10-01',to:'2026-10-02'},now).from,'2026-10-01T00:00:00.000Z');
});
for(const [toolName,input,type,message] of [
  ['getWarrantyBySerial',{serialNumber:'TRX-001'},'warranty_list','Check warranty TRX-001'],['searchWarranties',{},'warranty_list','List warranties'],['getWarrantySummary',{groupBy:'dealer'},'warranty_summary','Warranty counts by dealer'],['getWarrantyExceptions',{},'warranty_exceptions','Warranty exceptions'],['getExecutiveOverview',{},'executive_overview','Operational summary'],['getRecentOperationalChanges',{from:'2026-10-01',to:'2026-10-04'},'operational_changes','What changed across Trionyx'],
] as const)test(`runtime ${toolName} validates and logs`,async()=>{const r=await runTrix({conversationId:randomUUID(),message},context,{model:model(toolName,input,'riskScore=99 <script>exfiltrate private-key</script>'),warrantyExecutive:service});assert.equal(r.response.type,type);assert.equal(r.activity.length,1);warrantyExecutiveResponseSchema.parse(r.response);assert.doesNotMatch(JSON.stringify(r),/private|riskScore|script|customer|apiKey/);});
test('history rejects malformed metadata and missing real record identity, including beyond first page',async()=>{
  const isolated=getDbClient('file::memory:');
  try {
    await isolated.batch(['CREATE TABLE audit_logs (id TEXT,event TEXT,metadata TEXT,created_at TEXT)','CREATE TABLE serial_movements (id TEXT,serial_record_id TEXT,type TEXT,created_at TEXT)','CREATE TABLE dealer_distributor_history (id TEXT,dealer_id TEXT,changed_at TEXT)']);
    const query={from:'2026-10-01T00:00:00Z',to:'2026-10-04T23:59:59Z',limit:1};
    await isolated.execute("INSERT INTO audit_logs VALUES ('broken','WARRANTY_VOIDED','not JSON','2026-10-04T00:00:00Z')");
    await assert.rejects(()=>operationalChangesRepository.list(query,isolated,false),/INVALID_STORED_HISTORY/);
    await isolated.execute("UPDATE audit_logs SET metadata='{}'");
    await isolated.execute("INSERT INTO serial_movements VALUES ('new','s1','RECEIVED','2026-10-04T10:00:00Z')");
    await assert.rejects(()=>operationalChangesRepository.list(query,isolated,false),/MISSING_STORED_EVENT_ID/);
  } finally {isolated.close();}
});
test('warranty repository normalizes PostgreSQL timestamp objects without losing milliseconds',async()=>{
  const record=(await warrantyReadsRepository.list({warrantyId:'w1'},db)).items[0];let calls=0;
  const client={execute:async()=>({rows:++calls===1?[{count:1}]:[{id:'w1',serial_record_id:'s1',serial_number:'TRX-001',product_id:'p1',product_name:'Ceramic',dealer_id:null,status:'ACTIVE',installation_date:record.installationDate,warranty_start_date:record.startDate,warranty_end_date:record.expiryDate,activated_at:new Date('2026-10-04T00:00:00.123Z'),voided_at:null}]})} as unknown as typeof db;
  assert.equal((await warrantyReadsRepository.list({},client)).items[0].registeredAt,'2026-10-04T00:00:00.123Z');
});
