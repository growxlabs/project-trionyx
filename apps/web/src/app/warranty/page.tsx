import type { Metadata } from 'next';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';
import { WarrantyCheckForm } from '@/components/warranty/WarrantyCheckForm';
import { WarrantyFaqSection } from '@/components/warranty/WarrantyFaqSection';

export const metadata: Metadata = {
  title: 'Warranty Verification — Trionyx',
  description:
    'Verify the official warranty status and authenticity of your Trionyx professional surface protection products.',
};

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-[#FFFFEB] text-[#171714] flex flex-col">
      <PageFrame className="!bg-[#FFFFEB]">
        {/* Header */}
        <div className="relative isolate overflow-hidden">
          <HeaderShell />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Warranty Header & Floating Lookup Block */}
          <section className="px-5 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-14 sm:pb-20">
            {/* Warranty header / intro */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-10 mb-8 sm:mb-12">
              <div className="max-w-xl">
                <SectionEyebrow>WARRANTY</SectionEyebrow>
                <h1 className="section-heading text-[32px] sm:text-[40px] lg:text-[48px] tracking-[-0.025em] leading-[1.1] text-[#171714] m-0">
                  Check your Trionyx warranty.
                </h1>
              </div>
              <p className="body-copy max-w-md text-[#171714]/75 m-0 md:pb-1">
                Enter the serial number provided with your Trionyx product to verify its genuine registration, coverage term, and installation record.
              </p>
            </div>

            {/* Premium Floating Warranty Lookup Block */}
            <div
              className="w-full rounded-[28px] p-6 sm:p-10 lg:p-[56px_48px] shadow-sm"
              style={{ backgroundColor: '#075B50', borderRadius: '28px' }}
            >
              <WarrantyCheckForm />
            </div>
          </section>

          {/* Clean FAQ Accordion Section */}
          <WarrantyFaqSection />
        </main>

        {/* Footer */}
        <SiteFooter />
      </PageFrame>
    </div>
  );
}
