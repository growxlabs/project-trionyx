import { z } from 'zod';
import { preparedActionSchema } from '@trionyx/validation';
export const preparedActionResponseSchema=z.object({type:z.literal('prepared_action'),action:preparedActionSchema}).strict();
export type PreparedActionResult={success:true;response:z.infer<typeof preparedActionResponseSchema>}|{success:false;errorCode:string;message:string};
