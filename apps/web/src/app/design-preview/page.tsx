import { notFound } from 'next/navigation';
import { StatusPage } from '@trionyx/ui';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';

export default async function DesignPreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (process.env.NODE_ENV !== 'development') notFound();
  const { state } = await searchParams;
  return <PageFrame><HeaderShell /><main className="site-container">
    <nav aria-label="Design preview" style={{ display: 'flex', flexWrap: 'wrap', gap: 20, padding: '20px 0', fontSize: 12 }}><span>Local design preview</span><a href="/design-preview?state=404">404 page</a><a href="/design-preview?state=error">Error page</a></nav>
    <StatusPage embedded kind={state === 'error' ? 'error' : 'not-found'} />
  </main><SiteFooter /></PageFrame>;
}
