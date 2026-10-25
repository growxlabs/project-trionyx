import { PageSkeleton } from '@trionyx/ui';

export default function Loading() {
  return <main className="site-container" style={{ paddingTop: 48, paddingBottom: 48 }}><PageSkeleton label="page" layout="guide" /></main>;
}
