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
                  <div className="bg-[#F5F5EE] border border-[var(--section-divider)] rounded-[8px] p-6 sm:p-10 relative overflow-hidden shadow-xs">
                    <WarrantyCheckForm />
                  </div>
                </div>

                {/* Right: Helpful Context Sidebar */}
                <aside className="lg:col-span-5 xl:col-span-4">
                  <div className="space-y-8 lg:sticky lg:top-32">
                    {/* Information Block - Start with the label */}
                    <div className="bg-[#075B50] border border-[rgba(255,255,235,0.12)] rounded-[8px] p-6 shadow-xs">
                      <div className="mb-3">
                        <div className="text-[11px] font-bold text-[#F26522] uppercase tracking-[0.12em] mb-1.5">
                          FIND YOUR NUMBER
                        </div>
                        <h3 className="text-[20px] font-semibold tracking-[-0.02em] leading-snug text-[#FFFFEB] m-0">
                          Start with the label.
                        </h3>
                      </div>

                      <p className="text-[13.5px] leading-relaxed text-[rgba(255,255,235,0.76)] mb-3.5">
                        Every authentic Trionyx coating bottle and retail packaging carton carries a registered serial code label with a scannable barcode.
                      </p>

                      {/* Real Support Visual Guide */}
                      <div className="relative w-full aspect-[4/3] rounded-[6px] overflow-hidden border border-[rgba(255,255,235,0.12)] bg-[#F3F0E8] flex items-center justify-center">
                        <Image
                          src="/images/warranty/serial-number-guide.jpg"
                          alt="Trionyx product bottle and packaging showing authentic serial number label location with highlighted indicator"
                          fill
                          sizes="(max-width: 768px) 100vw, 380px"
                          className="object-contain object-center"
                          priority
                        />
                      </div>

                      {/* Practical Identification Notes */}
                      <div className="mt-3.5 pt-3 border-t border-[rgba(255,255,235,0.12)] space-y-2 text-[12.5px] leading-normal">
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-[#FFFFEB] shrink-0">Label Location:</span>
                          <span className="text-[rgba(255,255,235,0.68)]">Printed on the rear barcode sticker of both the bottle and carton box.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-[#FFFFEB] shrink-0">Code Format:</span>
                          <span className="font-mono text-[11.5px] text-[#F26522] font-semibold">TRX-SN-YYYY-XXXX</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-[#FFFFEB] shrink-0">Coverage:</span>
                          <span className="text-[rgba(255,255,235,0.68)]">Warranties are registered and activated by authorized studio installers.</span>
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
