import {test,before} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {getDbClient,getDatabaseUrl,ensureDatabaseReady,usersRepository} from '@trionyx/database';
import {createSession,invalidateSession} from '../session';
import {requireRole} from '../guards';
before(async()=>{assert.equal(getDatabaseUrl(),'file::memory:','Session security fixtures must be isolated');await ensureDatabaseReady();});
async function fixture(){const id=randomUUID();const user=await usersRepository.create({name:'Session security fixture',email:`${id}@example.test`,passwordHash:'fixture-hash',role:'MANAGING_DIRECTOR',status:'ACTIVE'});return {user,...await createSession(user.id)};}
test('TRIX guard denies an expired session even for an active MD',async()=>{
  const f=await fixture();await getDbClient().execute({sql:'UPDATE sessions SET expires_at=? WHERE id=?',args:['2020-01-01T00:00:00.000Z',f.session.id]});await assert.rejects(requireRole(['MANAGING_DIRECTOR'],f.rawToken),/UNAUTHENTICATED/);
});
test('TRIX guard denies a revoked session',async()=>{const f=await fixture();await invalidateSession(f.rawToken);await assert.rejects(requireRole(['MANAGING_DIRECTOR'],f.rawToken),/UNAUTHENTICATED/);});
test('TRIX guard reloads role after conversation/session start',async()=>{
  const f=await fixture();assert.equal((await requireRole(['MANAGING_DIRECTOR'],f.rawToken)).user.id,f.user.id);await getDbClient().execute({sql:"UPDATE users SET role='ADMIN' WHERE id=?",args:[f.user.id]});await assert.rejects(requireRole(['MANAGING_DIRECTOR'],f.rawToken),/FORBIDDEN/);
});
test('TRIX guard rejects an MD disabled after session start',async()=>{
  const f=await fixture();await usersRepository.updateStatus(f.user.id,'DISABLED');await assert.rejects(requireRole(['MANAGING_DIRECTOR'],f.rawToken),/UNAUTHENTICATED/);
});
