import { StatusPage } from '@trionyx/ui';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';

export default function NotFound() {
  return <PageFrame><HeaderShell /><main className="site-container"><StatusPage kind="not-found" embedded /></main><SiteFooter /></PageFrame>;
}
