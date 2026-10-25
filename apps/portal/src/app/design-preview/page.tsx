import { notFound, redirect } from 'next/navigation';
import { StatusPage } from '@trionyx/ui';
import { InternalShell } from '@/components/shell/InternalShell';
import { getServerActiveOrg } from '@/lib/serverOrg';

export default async function DesignPreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (process.env.NODE_ENV !== 'development') notFound();
  const auth = await getServerActiveOrg().catch(() => null);
  if (!auth) redirect('/login');
  const { state } = await searchParams;
  return <InternalShell user={auth.user} activeOrg={auth.activeOrg} memberships={auth.memberships}>
    <nav aria-label="Design preview" className="flex flex-wrap gap-4 text-sm border-b border-[var(--border)] pb-4">
      <span>Local design preview</span><a href="/design-preview?state=404">404 page</a><a href="/design-preview?state=error">Error page</a>
    </nav>
    <StatusPage embedded kind={state === 'error' ? 'error' : 'not-found'} brand={auth.activeOrg.name} homeHref="/overview" homeLabel="Back to overview" />
  </InternalShell>;
}
