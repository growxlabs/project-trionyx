'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { PageSkeleton, type SkeletonLayout } from '@trionyx/ui';
import { useActiveOrg } from './OrgContext';

export function OrganizationContent({ children }: { children: ReactNode }) {
  const { isLoading } = useActiveOrg();
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const section = segments[0] || 'overview';
  let layout: SkeletonLayout = 'table';
  if (section === 'overview') layout = 'scorecard';
  else if (section === 'trix') layout = 'conversation';
  else if (section === 'guide') layout = 'guide';
  else if (section === 'settings') layout = 'appearance';
  else if (segments.includes('new') || segments.includes('edit')) layout = 'form';
  else if (segments.length > 1 && !['locations', 'movements'].includes(segments[1])) layout = section === 'products' ? 'product' : 'detail';

  // Keep view registration mounted so the secondary sidebar stays stable.
  return <>
    {isLoading && <PageSkeleton label={`${section} for selected organization`} layout={layout} columns={layout === 'scorecard' ? 4 : 6} summary={layout === 'table' && segments.length === 1} />}
    <div hidden={isLoading} style={isLoading ? undefined : { display: 'contents' }}>{children}</div>
  </>;
}
