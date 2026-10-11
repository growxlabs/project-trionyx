import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerActiveOrg } from '@/lib/serverOrg';
import { InternalShell } from '../../components/shell/InternalShell';
import { TrixConversation } from './TrixConversation';

export const dynamic = 'force-dynamic';
export default async function TrixPage() {
  let auth;
  try { auth = await getServerActiveOrg(); }
  catch { redirect('/login'); }
  if (auth.user.role !== 'MANAGING_DIRECTOR') {
    return <InternalShell user={auth.user}>
      <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">
        <h1 className="text-3xl font-semibold">TRIX access restricted</h1>
        <p className="mt-4 text-[var(--text-secondary)]">TRIX is available only to the Managing Director. Your current account has the {auth.user.role === 'ADMIN' ? 'Administrator' : 'Distributor'} role.</p>
        <Link href="/login" className="mt-6 inline-block rounded-md bg-[var(--accent)] px-4 py-2 font-semibold text-[var(--background)]">Sign in as Managing Director</Link>
      </main>
    </InternalShell>;
  }
  return <InternalShell user={auth.user}><TrixConversation /></InternalShell>;
}
