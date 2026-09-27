import type { Metadata } from 'next';
import { PageFrame, SectionFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';
import { WarrantyCheckForm } from '@/components/warranty/WarrantyCheckForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Warranty Verification — Trionyx',
  description:
    'Verify the official warranty status and authenticity of your Trionyx professional surface protection products.',
};

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#171714] flex flex-col">
      <PageFrame>
        {/* Header */}
        <div className="relative isolate overflow-hidden">
          <HeaderShell />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          <SectionFrame hasBottomBorder={false}>
            <div className="px-5 sm:px-6 lg:px-8 py-[var(--section-space)]">
              {/* Page Header */}
              <div className="max-w-2xl mb-12 lg:mb-16">
                <SectionEyebrow>WARRANTY</SectionEyebrow>
                <h1 className="section-heading text-[32px] sm:text-[40px] lg:text-[48px] tracking-[-0.025em] leading-[1.1] text-[#171714] mb-4">
                  Check your Trionyx warranty.
                </h1>
                <p className="body-copy max-w-lg">
                  Enter the serial number provided with your Trionyx product to verify its genuine registration, coverage term, and installation record.
                </p>
              </div>

              {/* Two-Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                {/* Left: Check Form */}
                <div className="lg:col-span-7 xl:col-span-8">
                  <div className="bg-[#FCFBF7] border border-[var(--section-divider)] rounded-[8px] p-6 sm:p-10 relative overflow-hidden shadow-xs">
                    <WarrantyCheckForm />
                  </div>
                </div>

                {/* Right: Helpful Context Sidebar */}
                <aside className="lg:col-span-5 xl:col-span-4">
                  <div className="space-y-8 lg:sticky lg:top-32">
                    {/* Information Block */}
                    <div className="bg-[#FCFBF7] border border-[var(--section-divider)] rounded-[8px] p-6">
                      <h3 className="text-[13px] font-bold text-[#171714] uppercase tracking-[0.1em] mb-4">
                        About Serial Numbers
                      </h3>
                      <p className="text-[14px] leading-relaxed text-[#171714]/75">
                        Every Trionyx coating bottle and surface protection kit is individually coded with a unique serial number in our central database before leaving the factory.
                      </p>
                      <div className="mt-4 pt-4 border-t border-[#171714]/08 space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F26522] mt-2 shrink-0" />
                          <span className="text-[13px] text-[#171714]/80">
                            <strong>Authenticity:</strong> Confirms genuine Trionyx engineered formulations.
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F26522] mt-2 shrink-0" />
                          <span className="text-[13px] text-[#171714]/80">
                            <strong>Dealer Backing:</strong> Warranties are activated by authorized installer studios upon vehicle application.
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Authorized Studio Notice */}
                    <div className="p-6 border border-[#171714]/10 rounded-[8px] bg-transparent">
                      <h4 className="text-[13px] font-semibold text-[#171714] uppercase tracking-wider mb-2">
                        Are you an authorized dealer?
                      </h4>
                      <p className="text-[13px] text-[#171714]/70 mb-4 leading-normal">
                        To register and activate a customer installation warranty, sign in to your Partner Portal account.
                      </p>
                      <Link
                        href="/dealer-access"
                        className="inline-flex items-center text-[13px] font-bold text-[#F26522] hover:text-[#D9531E] uppercase tracking-wider transition-colors"
                      >
                        Sign in to Dealer Portal →
                      </Link>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </SectionFrame>
        </main>

        {/* Footer */}
        <SiteFooter />
      </PageFrame>
    </div>
  );
}
