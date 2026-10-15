import { PageIntro } from '@/components/ui/PageIntro';

/** Title for the Explore pages (Blog, Gallery). */
export function ExploreHeader({ active }: { active: 'Blog' | 'Gallery' }) {
  return (
    <div className="site-container">
      <PageIntro title={`${active}.`} />
    </div>
  );
}
