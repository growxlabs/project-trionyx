import type { Client } from '@libsql/client';
import { getDbClient, getDatabaseUrl, isPostgresUrl } from '../db';
import { isoTimestamp } from './warrantyReads';
export type ActionRecordKind = 'dealer'|'distributor'|'enquiry'|'owner'|'serial'|'location';
export type ActionRecordReference = { id?: string; code?: string; name?: string };
const tables = { dealer:'dealers',distributor:'distributors',enquiry:'contact_enquiries',owner:'users',serial:'serial_numbers',location:'inventory_locations' } as const;
export const preparedActionsRepository = {
  async resolve(kind: ActionRecordKind, reference: ActionRecordReference, client: Client = getDbClient()) {
    const names = { dealer:'business_name',distributor:'business_name',enquiry:'enquiry_code',owner:'name',serial:'serial_number',location:'name' };
    const codes = { dealer:'dealer_code',distributor:'distributor_code',enquiry:'enquiry_code',owner:null,serial:'serial_number',location:'code' };
    if ((kind==='enquiry'&&reference.name) || (kind==='owner'&&reference.code)) throw new Error('INVALID_REFERENCE');
    const conditions=['1=1'],args:string[]=[];
    if(reference.id){conditions.push('r.id=?');args.push(reference.id);}
    if(reference.code){conditions.push(`UPPER(r.${codes[kind]})=UPPER(?)`);args.push(reference.code.trim());}
    if(reference.name){conditions.push(`LOWER(TRIM(r.${names[kind]}))=LOWER(?)`);args.push(reference.name.trim());}
    if(kind==='owner')conditions.push("r.role IN ('MANAGING_DIRECTOR','ADMIN','STAFF')");
    const assignment = kind==='dealer'?'r.distributor_id':kind==='enquiry'?'r.assigned_to':'NULL';
    const label = kind==='dealer'?'a.business_name':kind==='enquiry'?'a.name':'NULL';
    const join = kind==='dealer'?'LEFT JOIN distributors a ON a.id=r.distributor_id':kind==='enquiry'?'LEFT JOIN users a ON a.id=r.assigned_to':kind==='serial'?'LEFT JOIN inventory_locations a ON a.id=r.location_id':'';
    const rows=await client.execute({sql:`SELECT r.id,r.${names[kind]} AS label,r.status,r.updated_at,${assignment} AS assignment_id,${label} AS assignment_label,${kind==='serial'?'r.location_id':'NULL'} AS location_id,${kind==='serial'?'a.name':'NULL'} AS location_label FROM ${tables[kind]} r ${join} WHERE ${conditions.join(' AND ')} ORDER BY r.id LIMIT 2`,args});
    return rows.rows.map(row=>({id:String(row.id),label:String(row.label),status:String(row.status),updatedAt:isoTimestamp(row.updated_at),assignmentId:row.assignment_id?String(row.assignment_id):null,assignmentLabel:row.assignment_label?String(row.assignment_label):null,locationId:row.location_id?String(row.location_id):null,locationLabel:row.location_label?String(row.location_label):null}));
  },
  async lock(kind: ActionRecordKind, id: string, client: Client, postgres=isPostgresUrl(getDatabaseUrl())) {
    if(postgres)await client.execute({sql:`SELECT id FROM ${tables[kind]} WHERE id=? FOR UPDATE`,args:[id]});
  },
  async create(action: { preparationId:string;requestedBy:string;state:string;actionType:string;createdAt:string;expiresAt:string }, payload:string, client:Client=getDbClient()) {
    await client.execute({sql:'INSERT INTO trix_prepared_actions (id,requested_by,state,action_type,payload,created_at,expires_at) VALUES (?,?,?,?,?,?,?)',args:[action.preparationId,action.requestedBy,action.state,action.actionType,payload,action.createdAt,action.expiresAt]});
  },
  async get(id:string, userId:string, client:Client=getDbClient(), lock=false, postgres=isPostgresUrl(getDatabaseUrl())) {
    const rows=await client.execute({sql:`SELECT payload,state,error_code FROM trix_prepared_actions WHERE id=? AND requested_by=?${lock&&postgres?' FOR UPDATE':''}`,args:[id,userId]});
    return rows.rows[0]??null;
  },
  async transition(id:string,userId:string,from:string,to:string,errorCode:string|null,now:string,client:Client) {
    const result=await client.execute({sql:'UPDATE trix_prepared_actions SET state=?,error_code=?,completed_at=? WHERE id=? AND requested_by=? AND state=?',args:[to,errorCode,to==='CONFIRMED'?null:now,id,userId,from]});
    return result.rowsAffected===1;
  },
};
