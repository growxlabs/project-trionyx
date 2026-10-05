import { randomUUID, createHash } from 'node:crypto';
import { ensureDatabaseReady, withDatabaseTransaction, preparedActionsRepository as repository, type DatabaseClient, type ActionRecordKind } from '@trionyx/database';
import { preparedActionSchema, actionSnapshotSchema, prepareDealerDistributorInputSchema, prepareEnquiryAssignmentInputSchema, prepareEnquiryStatusInputSchema, prepareInventoryTransferInputSchema, confirmPreparedActionSchema, cancelPreparedActionSchema, type PreparedAction, type ActionReference, type ActionSnapshot } from '@trionyx/validation';
import type { SafeUser } from '@trionyx/types';
import { dealersService } from './dealers';
import { contactEnquiriesService } from './contactEnquiries';
import { inventoryService } from './inventory';
export type PreparedActionContext = { user: SafeUser;sessionId:string;conversationId:string;authorize:()=>Promise<SafeUser> };
export class PreparedActionError extends Error { constructor(public code:string,message:string){super(message);} }
const fail=(code:string,message:string):never=>{throw new PreparedActionError(code,message);};
const lifetime=10*60*1000;
function canonical(value:unknown):unknown {
  if(Array.isArray(value))return value.map(canonical);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>[key,canonical(item)]));
  return value;
}
function digest(action: Omit<PreparedAction,'previewDigest'> | PreparedAction) {
  const { state:_state,errorCode:_error,previewDigest:_digest,...immutable } = action as PreparedAction;
  void _state;void _error;void _digest;
  return createHash('sha256').update(JSON.stringify(canonical(immutable))).digest('hex');
}
const mutationServices = {
  dealer: async (action:PreparedAction,actorId:string,client:DatabaseClient)=>dealersService.assignDistributor(action.currentState[0].id,{newDistributorId:action.proposedChange.destination!.id,reason:action.proposedChange.reason!},actorId,client),
  owner: async (action:PreparedAction,actorId:string,client:DatabaseClient)=>contactEnquiriesService.assign(action.currentState[0].id,action.proposedChange.destination!.id,actorId,client),
  status: async (action:PreparedAction,actorId:string,client:DatabaseClient)=>contactEnquiriesService.updateStatus(action.currentState[0].id,action.proposedChange.status!,actorId,client),
  inventory: async (action:PreparedAction,actorId:string,client:DatabaseClient)=>inventoryService.transferSerials({serialNumbers:action.currentState.map(record=>record.label),sourceLocationId:action.currentState[0].locationId!,destinationLocationId:action.proposedChange.destination!.id,notes:action.proposedChange.reason,reference:`TRIX:${action.preparationId}`},actorId,client),
};
export function createPreparedActionsService(deps: {
  client?:()=>Promise<DatabaseClient>; transaction?:typeof withDatabaseTransaction; now?:()=>Date;
  postgres?:boolean; mutations?:typeof mutationServices;
}={}) {
  const client=deps.client??ensureDatabaseReady,transaction=deps.transaction??withDatabaseTransaction,now=deps.now??(()=>new Date()),mutations=deps.mutations??mutationServices;
  async function auth(context:PreparedActionContext) {
    if(context.user.role!=='MANAGING_DIRECTOR'||context.user.status!=='ACTIVE')fail('TRIX_UNAUTHORIZED','Active Managing Director access is required.');
    let current:SafeUser;
    try{current=await context.authorize();}catch{fail('TRIX_UNAUTHORIZED','The Managing Director session is no longer valid.');}
    if(current!.role!=='MANAGING_DIRECTOR'||current!.status!=='ACTIVE'||current!.id!==context.user.id)fail('TRIX_UNAUTHORIZED','The Managing Director session is no longer valid.');
    return current!;
  }
  async function resolve(kind:ActionRecordKind,reference:ActionReference,db:DatabaseClient):Promise<ActionSnapshot> {
    let records;
    try{records=await repository.resolve(kind,reference,db);}catch{fail('TRIX_ACTION_PREPARATION_FAILED','The supplied record reference is invalid or unavailable.');}
    if(records!.length!==1)fail('TRIX_ACTION_PREPARATION_FAILED',records!.length?'Multiple records match. Supply an exact record ID or code.':'No matching record was found. Supply its stored ID or code.');
    const record=actionSnapshotSchema.parse(records![0]);
    if(record.assignmentId&&!record.assignmentLabel)fail('TRIX_ACTION_PREPARATION_FAILED','The current assignment cannot be resolved.');
    if(kind==='serial'&&(!record.locationId||!record.locationLabel))fail('TRIX_ACTION_PREPARATION_FAILED','The current inventory location cannot be resolved.');
    return record;
  }
  function validPlan(action:Pick<PreparedAction,'actionType'|'currentState'|'proposedChange'>) {
    const first=action.currentState[0], destination=action.proposedChange.destination;
    if(destination&&destination.status!=='ACTIVE')fail('TRIX_ACTION_PREPARATION_FAILED','The proposed destination or owner must be active.');
    if(action.actionType==='DEALER_DISTRIBUTOR_ASSIGNMENT'&&first.assignmentId===destination?.id)fail('TRIX_ACTION_PREPARATION_FAILED','The dealer already has this distributor.');
    if(action.actionType==='ENQUIRY_ASSIGNMENT'&&first.assignmentId===destination?.id)fail('TRIX_ACTION_PREPARATION_FAILED','The enquiry already has this owner.');
    if(action.actionType==='ENQUIRY_STATUS_CHANGE'&&first.status===action.proposedChange.status)fail('TRIX_ACTION_PREPARATION_FAILED','The enquiry already has this status.');
    if(action.actionType==='INVENTORY_TRANSFER'&&(action.currentState.some(record=>record.status!=='AVAILABLE'||!record.locationId||record.locationId!==first.locationId)||first.locationId===destination?.id))fail('TRIX_ACTION_PREPARATION_FAILED','All serials must be AVAILABLE at one source different from the destination.');
  }
  async function load(id:string,context:PreparedActionContext,db:DatabaseClient,lock=false) {
    const row=await repository.get(id,context.user.id,db,lock,deps.postgres);
    if(!row)fail('TRIX_ACTION_NOT_FOUND','This preparation was not found.');
    let action:PreparedAction;
    try{action=preparedActionSchema.parse(JSON.parse(String(row!.payload)));}catch{fail('TRIX_ACTION_PREPARATION_FAILED','The stored preparation is invalid.');}
    if(action!.preparationId!==id||action!.requestedBy!==context.user.id||action!.previewDigest!==digest(action!))fail('TRIX_ACTION_PREPARATION_FAILED','The stored preparation is invalid.');
    return {...action!,state:row!.state as PreparedAction['state'],errorCode:row!.error_code?String(row!.error_code):null};
  }
  async function expire(action:PreparedAction,context:PreparedActionContext,db:DatabaseClient) {
    if(action.state==='PREPARED'&&Date.parse(action.expiresAt)<=now().getTime()) {
      await repository.transition(action.preparationId,context.user.id,'PREPARED','EXPIRED','TRIX_ACTION_EXPIRED',now().toISOString(),db);
      action.state='EXPIRED';action.errorCode='TRIX_ACTION_EXPIRED';
    }
    return action;
  }
  return {
    async prepare(actionType:PreparedAction['actionType'],input:unknown,context:PreparedActionContext) {
      await auth(context);
      try {return await transaction(await client(),async db=>{
        let records:ActionSnapshot[],destination:ActionSnapshot|null=null,status:PreparedAction['proposedChange']['status']=null,reason:string|null=null,kind:PreparedAction['target']['kind'];
        if(actionType==='DEALER_DISTRIBUTOR_ASSIGNMENT') {const query=prepareDealerDistributorInputSchema.parse(input);records=[await resolve('dealer',query.dealerReference,db)];destination=await resolve('distributor',query.distributorReference,db);reason=query.reason??'Managing Director requested this assignment through TRIX.';kind='dealer';}
        else if(actionType==='ENQUIRY_ASSIGNMENT') {const query=prepareEnquiryAssignmentInputSchema.parse(input);records=[await resolve('enquiry',query.enquiryReference,db)];destination=await resolve('owner',query.ownerReference,db);kind='enquiry';}
        else if(actionType==='ENQUIRY_STATUS_CHANGE') {const query=prepareEnquiryStatusInputSchema.parse(input);records=[await resolve('enquiry',query.enquiryReference,db)];status=query.proposedStatus;kind='enquiry';}
        else if(actionType==='INVENTORY_TRANSFER') {const query=prepareInventoryTransferInputSchema.parse(input);records=[];for(const serial of [...query.serialNumbers].map(value=>value.toUpperCase()).sort())records.push(await resolve('serial',{code:serial},db));destination=await resolve('location',query.destinationLocationReference,db);reason=query.reason??null;kind='inventory';}
        else return fail('TRIX_ACTION_NOT_SUPPORTED','Only the four approved preparation actions are supported.');
        const action = {preparationId:randomUUID(),actionType,requestedBy:context.user.id,conversationId:context.conversationId,createdAt:now().toISOString(),expiresAt:new Date(now().getTime()+lifetime).toISOString(),state:'PREPARED' as const,title:{DEALER_DISTRIBUTOR_ASSIGNMENT:'Change dealer distributor',ENQUIRY_ASSIGNMENT:'Assign enquiry owner',ENQUIRY_STATUS_CHANGE:'Change enquiry status',INVENTORY_TRANSFER:'Transfer inventory serials'}[actionType],target:{kind,records:records.map(({id,label})=>({id,label}))},currentState:records,proposedChange:{destination,status,reason},confirmationRequired:true as const,errorCode:null,consequences:actionType==='INVENTORY_TRANSFER'?'All listed serials move together to the destination. Movement history and a business audit event will be recorded.':'Only the displayed assignment or status changes. The normal business audit records the previous and new values.'};
        validPlan(action);
        const prepared=preparedActionSchema.parse({...action,previewDigest:digest(action)});
        await repository.create(prepared,JSON.stringify(prepared),db);
        return prepared;
      });}catch(error){if(error instanceof PreparedActionError)throw error;return fail('TRIX_ACTION_PREPARATION_FAILED','The action could not be safely prepared. No business records were changed.');}
    },
    async view(id:string,context:PreparedActionContext) {
      await auth(context);
      return transaction(await client(),async db=>expire(await load(id,context,db,true),context,db));
    },
    async cancel(input:unknown,context:PreparedActionContext) {
      await auth(context);const query=cancelPreparedActionSchema.parse(input);
      return transaction(await client(),async db=>{
        const action=await expire(await load(query.preparationId,context,db,true),context,db);
        if(action.state==='PREPARED') {await repository.transition(action.preparationId,context.user.id,'PREPARED','CANCELLED',null,now().toISOString(),db);action.state='CANCELLED';}
        return action;
      });
    },
    async confirm(input:unknown,context:PreparedActionContext) {
      await auth(context);const query=confirmPreparedActionSchema.safeParse(input);
      if(!query.success)fail('TRIX_ACTION_CONFIRMATION_REQUIRED','Use the application confirmation control for the exact displayed preparation.');
      const database=await client();
      try {
        const result=await transaction(database,async db=>{
          const action=await expire(await load(query.data!.preparationId,context,db,true),context,db);
          if(action.state==='EXPIRED')return {action,error:'TRIX_ACTION_EXPIRED'};
          if(action.state!=='PREPARED')return {action,error:action.state==='EXECUTED'?'TRIX_ACTION_ALREADY_EXECUTED':'TRIX_ACTION_CONFIRMATION_REQUIRED'};
          if(action.previewDigest!==query.data!.previewDigest)fail('TRIX_ACTION_CONFIRMATION_REQUIRED','The confirmed preview does not match the stored preparation.');
          const sourceKind:ActionRecordKind=action.target.kind==='inventory'?'serial':action.target.kind;
          const destinationKind:ActionRecordKind=action.actionType==='DEALER_DISTRIBUTOR_ASSIGNMENT'?'distributor':action.actionType==='ENQUIRY_ASSIGNMENT'?'owner':'location';
          const locks:Array<{kind:ActionRecordKind;id:string}>=action.currentState.map(record=>({kind:sourceKind,id:record.id}));
          if(action.proposedChange.destination)locks.push({kind:destinationKind,id:action.proposedChange.destination.id});
          for(const lock of locks.sort((a,b)=>`${a.kind}:${a.id}`.localeCompare(`${b.kind}:${b.id}`)))await repository.lock(lock.kind,lock.id,db,deps.postgres);
          for(const previous of action.currentState){let current;try{current=await resolve(sourceKind,{id:previous.id},db);}catch{fail('TRIX_ACTION_STALE','A source record is no longer available. Prepare the action again.');}if(JSON.stringify(previous)!==JSON.stringify(current!))fail('TRIX_ACTION_STALE','The record changed after preparation. Prepare the action again.');}
          if(action.proposedChange.destination){let current;try{current=await resolve(destinationKind,{id:action.proposedChange.destination.id},db);}catch{fail('TRIX_ACTION_STALE','The destination is no longer available. Prepare the action again.');}if(JSON.stringify(current!)!==JSON.stringify(action.proposedChange.destination))fail('TRIX_ACTION_STALE','The destination changed after preparation. Prepare the action again.');}
          validPlan(action);await auth(context);
          if(Date.parse(action.expiresAt)<=now().getTime())fail('TRIX_ACTION_EXPIRED','This preparation expired before execution. Prepare it again.');
          if(!await repository.transition(action.preparationId,context.user.id,'PREPARED','CONFIRMED',null,now().toISOString(),db))fail('TRIX_ACTION_CONFIRMATION_REQUIRED','This preparation is no longer available for confirmation.');
          action.state='CONFIRMED';
          if(action.actionType==='DEALER_DISTRIBUTOR_ASSIGNMENT')await mutations.dealer(action,context.user.id,db);
          else if(action.actionType==='ENQUIRY_ASSIGNMENT')await mutations.owner(action,context.user.id,db);
          else if(action.actionType==='ENQUIRY_STATUS_CHANGE')await mutations.status(action,context.user.id,db);
          else await mutations.inventory(action,context.user.id,db);
          await repository.transition(action.preparationId,context.user.id,'CONFIRMED','EXECUTED',null,now().toISOString(),db);action.state='EXECUTED';
          return {action,error:null};
        });
        if(result.error)fail(result.error,result.error==='TRIX_ACTION_ALREADY_EXECUTED'?'This action was already executed. No second mutation occurred.':'This preparation has expired or is no longer available for confirmation.');
        return result.action;
      } catch(error) {
        const code=error instanceof PreparedActionError?error.code:'TRIX_ACTION_EXECUTION_FAILED';
        if(['TRIX_ACTION_STALE','TRIX_ACTION_EXECUTION_FAILED','TRIX_UNAUTHORIZED','TRIX_ACTION_EXPIRED'].includes(code)) {
          // A failed business transaction is rolled back before workflow failure is recorded.
          await transaction(database,async db=>{
            const row=await repository.get(query.data!.preparationId,context.user.id,db,true,deps.postgres);
            if(row?.state==='PREPARED'){const action=await load(query.data!.preparationId,context,db);const terminal=code==='TRIX_ACTION_EXPIRED'?'EXPIRED':'FAILED';await repository.transition(action.preparationId,context.user.id,'PREPARED',terminal,code,now().toISOString(),db);action.state=terminal;action.errorCode=code;}
          });
        }
        if(error instanceof PreparedActionError)throw error;
        return fail('TRIX_ACTION_EXECUTION_FAILED','The action could not be executed. No business changes were committed. Prepare it again.');
      }
    },
  };
}
export const preparedActionsService=createPreparedActionsService();
