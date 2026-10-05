import {ensureDatabaseReady} from '../db';
import type {Client} from '@libsql/client';
/** Atomic, shared across workers. Fixed authenticated scopes keep storage bounded. */
export async function consumeTrixRateLimit(userId:string,scope:'chat'|'actions',client?:Client,now=Date.now()) {
  const db=client??await ensureDatabaseReady();
  const windowStart=Math.floor(now/60000)*60000;
  const result=await db.execute({sql:`INSERT INTO trix_request_limits(user_id,scope,window_start,request_count) VALUES (?,?,?,1)
    ON CONFLICT(user_id,scope) DO UPDATE SET
      request_count=CASE WHEN trix_request_limits.window_start=excluded.window_start THEN trix_request_limits.request_count+1 ELSE 1 END,
      window_start=excluded.window_start RETURNING request_count`,args:[userId,scope,windowStart]});
  return Number(result.rows[0]?.request_count)<=(scope==='chat'?30:60);
}
