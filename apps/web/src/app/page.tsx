import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { HeroSection } from '@/components/hero/HeroSection';
import { AboutSection } from '@/components/about/AboutSection';
import { GrapheneSection } from '@/components/graphene/GrapheneSection';
import { BrandStory } from '@/components/story/BrandStory';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { FAQSection } from '@/components/faq/FAQSection';
import { SiteFooter } from '@/components/footer/SiteFooter';

export default function HomePage() {
  return (
    <PageFrame>
      <HeaderShell appearance="overlay" />
      <HeroSection />
      <main className="flex flex-1 flex-col">
        <AboutSection />
        <GrapheneSection />
        <BrandStory />
        <ReviewsSection />
        <FAQSection />
      </main>
      <SiteFooter />
    </PageFrame>
  );
}
