import { preparedActionsService, PreparedActionError, prepareDealerDistributorInputSchema, prepareEnquiryAssignmentInputSchema, prepareEnquiryStatusInputSchema, prepareInventoryTransferInputSchema, type PreparedActionContext } from '@trionyx/api';
import type { PreparedAction } from '@trionyx/validation';
import { z } from 'zod';
import { preparedActionResponseSchema, type PreparedActionResult } from '../responses/prepared-actions';
import { assertManagingDirector } from './lookup-serial';
export type PreparationCapability=Pick<typeof preparedActionsService,'prepare'>;
async function prepare<S extends z.ZodType>(schema:S,input:z.input<S>,type:PreparedAction['actionType'],context:PreparedActionContext,service:PreparationCapability):Promise<PreparedActionResult> {
  assertManagingDirector(context.user);
  const parsed=schema.safeParse(input);
  if(!parsed.success)return {success:false,errorCode:'TRIX_ACTION_PREPARATION_FAILED',message:'Supply valid exact records and proposed values for this preparation.'};
  try{return {success:true,response:preparedActionResponseSchema.parse({type:'prepared_action',action:await service.prepare(type,parsed.data,context)})};}
  catch(error){return {success:false,errorCode:error instanceof PreparedActionError?error.code:'TRIX_ACTION_PREPARATION_FAILED',message:error instanceof PreparedActionError?error.message:'The action could not be safely prepared. No business records were changed.'};}
}
export const prepareDealerDistributorAssignment=(input:z.input<typeof prepareDealerDistributorInputSchema>,context:PreparedActionContext,service:PreparationCapability=preparedActionsService)=>prepare(prepareDealerDistributorInputSchema,input,'DEALER_DISTRIBUTOR_ASSIGNMENT',context,service);
export const prepareEnquiryAssignment=(input:z.input<typeof prepareEnquiryAssignmentInputSchema>,context:PreparedActionContext,service:PreparationCapability=preparedActionsService)=>prepare(prepareEnquiryAssignmentInputSchema,input,'ENQUIRY_ASSIGNMENT',context,service);
export const prepareEnquiryStatusChange=(input:z.input<typeof prepareEnquiryStatusInputSchema>,context:PreparedActionContext,service:PreparationCapability=preparedActionsService)=>prepare(prepareEnquiryStatusInputSchema,input,'ENQUIRY_STATUS_CHANGE',context,service);
export const prepareInventoryTransfer=(input:z.input<typeof prepareInventoryTransferInputSchema>,context:PreparedActionContext,service:PreparationCapability=preparedActionsService)=>prepare(prepareInventoryTransferInputSchema,input,'INVENTORY_TRANSFER',context,service);
