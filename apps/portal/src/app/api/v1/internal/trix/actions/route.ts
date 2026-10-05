import { cookies } from 'next/headers';
import { randomUUID } from 'node:crypto';
import { AUTH_CONFIG, requireRole } from '@trionyx/auth';
import { apiError, apiSuccess, preparedActionsService, PreparedActionError } from '@trionyx/api';
import { cancelPreparedActionSchema } from '@trionyx/validation';
import { getDatabaseUrl,isPostgresUrl,consumeTrixRateLimit } from '@trionyx/database';
import {readBoundedTrixBody} from '@trionyx/ai';
export const runtime='nodejs';
async function context() {
  const token=(await cookies()).get(AUTH_CONFIG.cookieName)?.value;
  const auth=await requireRole(['MANAGING_DIRECTOR'],token);
  return {user:auth.user,sessionId:auth.session.id,conversationId:randomUUID(),authorize:async()=>(await requireRole(['MANAGING_DIRECTOR'],token)).user};
}
function failure(error:unknown) {
  if(error instanceof PreparedActionError)return apiError(error.code,error.message,error.code==='TRIX_UNAUTHORIZED'?403:error.code==='TRIX_ACTION_NOT_FOUND'?404:409);
  const code=error instanceof Error?error.message:'';
  if(code==='TRIX_REQUEST_TOO_LARGE')return apiError('INVALID_INPUT','Request is too large.',413);
  if(['UNAUTHENTICATED','FORBIDDEN'].includes(code))return apiError(code,'Managing Director access is required.',code==='UNAUTHENTICATED'?401:403);
  return apiError('TRIX_ACTION_EXECUTION_FAILED','The application could not complete this action safely. Reload the preview before continuing.',503);
}
export async function GET(request:Request) {
  try {
    const auth=await context();
    const query=cancelPreparedActionSchema.safeParse({preparationId:new URL(request.url).searchParams.get('preparationId')});
    if(!query.success)return apiError('TRIX_ACTION_NOT_FOUND','Supply a valid preparation ID.',400);
    if(!isPostgresUrl(getDatabaseUrl()))return apiError('DATABASE_NOT_CONFIGURED','TRIX requires the configured Trionyx database.',503);
    if(!await consumeTrixRateLimit(auth.user.id,'actions'))return apiError('TRIX_RATE_LIMITED','Too many action requests. Try again in a minute.',429);
    return apiSuccess(await preparedActionsService.view(query.data.preparationId,auth),200,{'Cache-Control':'no-store'});
  }catch(error){return failure(error);}
}
export async function POST(request:Request) {
  try {
    const auth=await context();
    if(request.headers.get('origin')!==new URL(request.url).origin)return apiError('FORBIDDEN','Access denied.',403);
    const text=await readBoundedTrixBody(request,2000);
    let body;try{body=JSON.parse(text);}catch{return apiError('INVALID_INPUT','Invalid confirmation request.',400);}
    if(!body||typeof body!=='object'||Array.isArray(body)||!['confirm','cancel'].includes(body.operation))return apiError('TRIX_ACTION_CONFIRMATION_REQUIRED','Use the application Confirm or Cancel control.',400);
    const {operation,...input}=body;
    if(!isPostgresUrl(getDatabaseUrl()))return apiError('DATABASE_NOT_CONFIGURED','TRIX requires the configured Trionyx database.',503);
    if(!await consumeTrixRateLimit(auth.user.id,'actions'))return apiError('TRIX_RATE_LIMITED','Too many action requests. Try again in a minute.',429);
    const action=operation==='confirm'?await preparedActionsService.confirm(input,auth):await preparedActionsService.cancel(input,auth);
    return apiSuccess(action,200,{'Cache-Control':'no-store'});
  }catch(error){return failure(error);}
}
