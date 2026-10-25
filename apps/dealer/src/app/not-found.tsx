import { cookies } from 'next/headers';
import { AUTH_CONFIG, DISTRIBUTOR_AUTH_CONFIG, requireDistributorSession } from '@trionyx/auth';
import { StatusPage } from '@trionyx/ui';
import { DistributorShell } from '@/components/shell/DealerShell';

export default async function NotFound() {
  const cookieStore = await cookies();
  const token = cookieStore.get(DISTRIBUTOR_AUTH_CONFIG.cookieName)?.value || cookieStore.get(AUTH_CONFIG.cookieName)?.value;
  const auth = await requireDistributorSession(token).catch(() => null);
  if (!auth) return <StatusPage kind="not-found" brand="Distributor workspace" homeHref="/login" homeLabel="Go to sign in" />;
  return <DistributorShell user={auth.user} distributor={auth.distributor}><StatusPage kind="not-found" embedded homeHref="/overview" homeLabel="Back to overview" /></DistributorShell>;
}
