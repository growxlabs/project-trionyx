import { StatusPage } from '@trionyx/ui';
import { getServerActiveOrg } from '@/lib/serverOrg';
import { InternalShell } from '@/components/shell/InternalShell';

export default async function NotFound() {
  const auth = await getServerActiveOrg().catch(() => null);
  if (!auth) return <StatusPage kind="not-found" brand="Operations portal" homeHref="/login" homeLabel="Go to sign in" />;
  return <InternalShell user={auth.user} activeOrg={auth.activeOrg} memberships={auth.memberships}><StatusPage kind="not-found" embedded brand={auth.activeOrg.name} homeHref="/overview" homeLabel="Back to overview" /></InternalShell>;
}
