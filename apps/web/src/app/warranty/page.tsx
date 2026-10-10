import type { Metadata } from 'next';
import Image from 'next/image';
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
    <div className="min-h-screen bg-[#F5F5EE] text-[#171714] flex flex-col">
      <PageFrame>
        {/* Shared image backdrop for the header and compact hero. Menus remain unclipped. */}
        {/* Sticky header across entire warranty screen - never hides while scrolling */}
        <HeaderShell appearance="overlay" />

        {/* Shared image backdrop for compact hero positioned directly beneath header */}
        <div className="relative isolate z-10 -mt-16 md:-mt-20 h-[240px] bg-[#17191C] sm:h-[300px] lg:h-[320px]">
          <Image
            src="/images/warranty/trionyx-warranty-car.png"
            alt="Glossy graphite car with water beading on its hood and subtle orange studio lighting"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1440px) 96vw, 1440px"
            className="object-cover object-center"
            preload
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,10,12,0.92)_0%,rgba(8,10,12,0.72)_24%,rgba(8,10,12,0.08)_62%,rgba(8,10,12,0.12)_100%)]" />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          <SectionFrame hasBottomBorder={false}>
            <div className="px-5 sm:px-6 lg:px-8 pt-8 lg:pt-10 pb-[var(--section-space)]">
              {/* Page Header */}
              <div className="max-w-2xl mb-8 lg:mb-10">
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
                  <div className="bg-[#F5F5EE] border border-[var(--section-divider)] rounded-[8px] p-6 sm:p-10 relative overflow-hidden shadow-xs">
                    <WarrantyCheckForm />
                  </div>
                </div>

                {/* Right: Helpful Context Sidebar */}
                <aside className="lg:col-span-5 xl:col-span-4">
                  <div className="space-y-8 lg:sticky lg:top-32">
                    {/* Information Block */}
                    <div className="bg-[#F5F5EE] border border-[var(--section-divider)] rounded-[8px] p-6 shadow-xs">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[13px] font-bold text-[#171714] uppercase tracking-[0.1em]">
                          Locating Your Serial Number
                        </h3>
                        <span className="text-[10px] font-mono font-semibold text-[#F26522] bg-[#F26522]/10 px-2 py-0.5 rounded-[4px] uppercase tracking-wider">
                          Label Guide
                        </span>
                      </div>

                      <p className="text-[13.5px] leading-relaxed text-[#171714]/75 mb-3.5">
                        Every authentic Trionyx coating bottle and retail packaging carton carries a registered serial code label with a scannable barcode.
                      </p>

                      {/* Real Support Visual Guide */}
                      <div className="relative w-full aspect-[4/3] rounded-[6px] overflow-hidden border border-[#171714]/12 bg-[#EFECE3] shadow-xs group">
                        <Image
                          src="/images/warranty/serial-number-guide.jpg"
                          alt="Trionyx product bottle and packaging showing authentic serial number label location with highlighted indicator"
                          fill
                          sizes="(max-width: 768px) 100vw, 380px"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          priority
                        />
                      </div>

                      {/* Practical Identification Notes (No Decorative Dots) */}
                      <div className="mt-3.5 pt-3 border-t border-[#171714]/08 space-y-2 text-[12.5px] text-[#171714]/80 leading-normal">
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-[#171714] shrink-0">Label Location:</span>
                          <span>Printed on the rear barcode sticker of both the bottle and carton box.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-[#171714] shrink-0">Code Format:</span>
                          <span className="font-mono text-[11.5px] text-[#F26522] font-semibold">TRX-SN-YYYY-XXXX</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-[#171714] shrink-0">Coverage:</span>
                          <span>Warranties are registered and activated by authorized studio installers.</span>
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
