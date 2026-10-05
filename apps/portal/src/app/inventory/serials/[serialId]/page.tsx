import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { AUTH_CONFIG, requireInternalUser } from '@trionyx/auth';
import { serialsRepository } from '@trionyx/database';
import { InternalShell } from '../../../../components/shell/InternalShell';
import { SerialRecordView } from './SerialRecordView';

export const dynamic = 'force-dynamic';
export default async function SerialPage({ params }: { params: Promise<{ serialId: string }> }) {
  const token = (await cookies()).get(AUTH_CONFIG.cookieName)?.value;
  let auth;
  try { auth = await requireInternalUser(token); } catch { redirect('/login'); }
  const { serialId } = await params;
  const record = await serialsRepository.findById(serialId);
  if (!record) notFound();
  return <InternalShell user={auth.user}><SerialRecordView serialNumber={record.serialNumber} /></InternalShell>;
}
