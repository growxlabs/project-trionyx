import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
// Visual test: keep the WebGL ribbon available to restore after review.
// import { MeshGradientCanvas } from '@/components/hero/MeshGradientCanvas';
import { HeroSection } from '@/components/hero/HeroSection';
import { AboutSection } from '@/components/about/AboutSection';
import { BrandStory } from '@/components/story/BrandStory';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { WhyTrionyxSection } from '@/components/trust';
import { GrapheneSection } from '@/components/graphene/GrapheneSection';
import { FAQSection } from '@/components/faq/FAQSection';
import { SiteFooter } from '@/components/footer/SiteFooter';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F5F5EE] text-[#171714] flex flex-col">
      {/* 
        TRIONYX GLOBAL PAGE FRAME (Stripe-inspired architectural framing)
        - Max width: 1440px centered
        - Continuous 1px vertical rails: rgba(23, 23, 20, 0.07)
        - Responsive viewport gutters: 32px desktop, 24px tablet, 16px mobile
        - Main Canvas: #F5F5EE
      */}
      <PageFrame>
        {/* Hero and header zone. WebGL ribbon remains available for a future visual test. */}
        <div className="relative isolate overflow-hidden">
          {/* <MeshGradientCanvas /> */}
          {/* Header Shell (Terminates against rails with 1px horizontal rule) */}
          <HeaderShell />

          {/* Landing Page — Section 01: Hero */}
          <HeroSection />
        </div>

        {/* Landing Page Subsequent Sections */}
        <main className="flex-1 flex flex-col">
          {/* Section 02: About Trionyx */}
          <AboutSection />

          {/* Four chapters of the Trionyx brand story */}
          <BrandStory />

          {/* Section 03: Customer Reviews */}
          <ReviewsSection />

          {/* Section 04: Why Trionyx (Trust) */}
          <WhyTrionyxSection />

          {/* Section 05: Graphene */}
          <GrapheneSection />

          {/* Section 06: Frequently asked questions */}
          <FAQSection />
        </main>

        <SiteFooter />
      </PageFrame>
    </div>
  );
}
