import type { Metadata } from 'next';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';
import { WarrantyCheckForm } from '@/components/warranty/WarrantyCheckForm';

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
            <div className="max-w-2xl mb-8 sm:mb-10">
              <SectionEyebrow>WARRANTY</SectionEyebrow>
              <h1 className="section-heading text-[32px] sm:text-[40px] lg:text-[48px] tracking-[-0.025em] leading-[1.1] text-[#171714] mb-4">
                Check your Trionyx warranty.
              </h1>
              <p className="body-copy max-w-lg">
                Enter the serial number provided with your Trionyx product to verify its genuine registration, coverage term, and installation record.
              </p>
            </div>

            {/* Premium Floating Warranty Lookup Block */}
            <div
              className="w-full max-w-4xl rounded-[28px] p-6 sm:p-10 lg:p-[56px_48px] shadow-sm"
              style={{ backgroundColor: '#075B50', borderRadius: '28px' }}
            >
              <WarrantyCheckForm />
            </div>
          </section>

          {/* FAQ Section */}
          <section className="bg-[#191918] text-[#FFFFEB]">
            <div className="px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
              <div className="max-w-2xl mb-12 sm:mb-16">
                <div className="text-[11px] font-bold text-[#F26522] uppercase tracking-[0.14em] mb-2">
                  FAQ
                </div>
                <h2 className="text-[28px] sm:text-[36px] lg:text-[40px] font-semibold tracking-[-0.025em] text-[#FFFFEB] mb-3 leading-[1.15]">
                  Frequently asked warranty questions.
                </h2>
                <p className="text-[15px] text-[rgba(255,255,235,0.72)] leading-relaxed max-w-lg">
                  Answers to common questions about product serial validation, installer registrations, and maintenance coverage.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
                <div className="space-y-2.5">
                  <h3 className="text-[17px] font-semibold text-[#FFFFEB] tracking-[-0.01em]">
                    When does my warranty become active?
                  </h3>
                  <p className="text-[14px] text-[rgba(255,255,235,0.72)] leading-relaxed">
                    Your warranty is officially activated by your authorized Trionyx detailing studio upon vehicle inspection and delivery. Activations typically reflect in the central registry within 24 hours of handover.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-[17px] font-semibold text-[#FFFFEB] tracking-[-0.01em]">
                    Can I service my warranty at another Trionyx studio?
                  </h3>
                  <p className="text-[14px] text-[rgba(255,255,235,0.72)] leading-relaxed">
                    Yes. Trionyx warranty registrations are nationwide digital records. Any certified Trionyx partner studio across India can pull up your vehicle history for routine maintenance washes and decontaminations.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-[17px] font-semibold text-[#FFFFEB] tracking-[-0.01em]">
                    What should I do if my serial number is not recognized?
                  </h3>
                  <p className="text-[14px] text-[rgba(255,255,235,0.72)] leading-relaxed">
                    Confirm you entered all digits correctly in the format <code className="font-mono text-[12px] bg-[#2A2A28] text-[#F26522] px-1.5 py-0.5 rounded">TRX-SN-YYYY-XXXX</code>. If your installation was recent, check with your installer to ensure the customer record was finalized in the dealer portal.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-[17px] font-semibold text-[#FFFFEB] tracking-[-0.01em]">
                    Is the warranty transferable if I sell my car?
                  </h3>
                  <p className="text-[14px] text-[rgba(255,255,235,0.72)] leading-relaxed">
                    Yes. Trionyx surface protection warranties remain attached to the vehicle identification number (VIN). The new owner can verify continuity through this portal provided recommended maintenance intervals were met.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <SiteFooter />
      </PageFrame>
    </div>
  );
}
