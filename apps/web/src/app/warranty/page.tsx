import type { Metadata } from 'next';
import Image from 'next/image';
import { PageFrame, SectionFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';
import { WarrantyCheckForm } from '@/components/warranty/WarrantyCheckForm';
import { DropletIcon, SunIcon, ShieldIcon, SparklesIcon } from '@/components/ui/Icons';
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
                {/* Left: Check Form & Verification Details */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-6 sm:space-y-8">
                  {/* Search Form Card */}
                  <div className="bg-[#F5F5EE] border border-[var(--section-divider)] rounded-[8px] p-6 sm:p-10 relative overflow-hidden shadow-xs">
                    <WarrantyCheckForm />
                  </div>

                  {/* Verification Protocol Card */}
                  <div className="bg-[#F5F5EE] border border-[var(--section-divider)] rounded-[8px] p-6 sm:p-8 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 pb-4 border-b border-[var(--section-divider)]">
                      <div>
                        <div className="text-[11px] font-bold text-[#F26522] uppercase tracking-[0.12em] mb-1">
                          VERIFICATION PROTOCOL
                        </div>
                        <h3 className="text-[19px] sm:text-[21px] font-semibold tracking-[-0.02em] text-[#171714] m-0">
                          How Trionyx verification works.
                        </h3>
                      </div>
                      <span className="self-start sm:self-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#075B50]/10 text-[#075B50] text-[11px] font-bold tracking-wide uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#075B50]" />
                        Central Registry
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <div className="w-8 h-8 rounded-[4px] bg-[#EFECE3] border border-[#171714]/08 flex items-center justify-center text-[#171714] font-mono font-bold text-[13px]">
                          01
                        </div>
                        <h4 className="text-[14px] font-semibold text-[#171714] m-0">
                          Serial Lookup
                        </h4>
                        <p className="text-[13px] leading-relaxed text-[#171714]/70 m-0">
                          Enter the unique registered code from your bottle label, carton box, or studio warranty card.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="w-8 h-8 rounded-[4px] bg-[#EFECE3] border border-[#171714]/08 flex items-center justify-center text-[#171714] font-mono font-bold text-[13px]">
                          02
                        </div>
                        <h4 className="text-[14px] font-semibold text-[#171714] m-0">
                          Batch Validation
                        </h4>
                        <p className="text-[13px] leading-relaxed text-[#171714]/70 m-0">
                          The system queries factory formulation batches to verify genuine chemical provenance and security tags.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="w-8 h-8 rounded-[4px] bg-[#EFECE3] border border-[#171714]/08 flex items-center justify-center text-[#171714] font-mono font-bold text-[13px]">
                          03
                        </div>
                        <h4 className="text-[14px] font-semibold text-[#171714] m-0">
                          Studio Activation
                        </h4>
                        <p className="text-[13px] leading-relaxed text-[#171714]/70 m-0">
                          Confirms installation date, remaining validity term, and authorized detailing studio record.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Coverage Standards Card */}
                  <div className="bg-[#F5F5EE] border border-[var(--section-divider)] rounded-[8px] p-6 sm:p-8 shadow-xs">
                    <div className="mb-6">
                      <div className="text-[11px] font-bold text-[#F26522] uppercase tracking-[0.12em] mb-1">
                        STANDARDS &amp; PROTECTION
                      </div>
                      <h3 className="text-[19px] sm:text-[21px] font-semibold tracking-[-0.02em] text-[#171714] mb-2">
                        What your registered warranty covers.
                      </h3>
                      <p className="text-[13.5px] leading-relaxed text-[#171714]/70 m-0 max-w-xl">
                        Trionyx coatings are engineered for severe climates and everyday driving conditions. Active registrations guarantee coverage across key degradation metrics:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="p-4 bg-[#FAF9F5] border border-[#171714]/08 rounded-[6px] space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-[4px] bg-[#075B50]/10 flex items-center justify-center text-[#075B50] shrink-0">
                            <DropletIcon size={15} color="inherit" />
                          </span>
                          <span className="text-[13.5px] font-semibold text-[#171714]">Hydrophobic Durability</span>
                        </div>
                        <p className="text-[12.5px] text-[#171714]/70 leading-normal pl-[38px] m-0">
                          Guarantees sustained contact angle and water-beading performance under prescribed maintenance regimens.
                        </p>
                      </div>

                      <div className="p-4 bg-[#FAF9F5] border border-[#171714]/08 rounded-[6px] space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-[4px] bg-[#075B50]/10 flex items-center justify-center text-[#075B50] shrink-0">
                            <SunIcon size={15} color="inherit" />
                          </span>
                          <span className="text-[13.5px] font-semibold text-[#171714]">UV &amp; Oxidation Defense</span>
                        </div>
                        <p className="text-[12.5px] text-[#171714]/70 leading-normal pl-[38px] m-0">
                          Inhibits clearcoat oxidation, yellowing, and thermal paint dullness under intense solar radiation.
                        </p>
                      </div>

                      <div className="p-4 bg-[#FAF9F5] border border-[#171714]/08 rounded-[6px] space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-[4px] bg-[#075B50]/10 flex items-center justify-center text-[#075B50] shrink-0">
                            <ShieldIcon size={15} color="inherit" />
                          </span>
                          <span className="text-[13.5px] font-semibold text-[#171714]">Chemical Etch Resistance</span>
                        </div>
                        <p className="text-[12.5px] text-[#171714]/70 leading-normal pl-[38px] m-0">
                          Prevents acid etching from environmental fallout, bird droppings, tree sap, and road salts.
                        </p>
                      </div>

                      <div className="p-4 bg-[#FAF9F5] border border-[#171714]/08 rounded-[6px] space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-[4px] bg-[#075B50]/10 flex items-center justify-center text-[#075B50] shrink-0">
                            <SparklesIcon size={15} color="inherit" />
                          </span>
                          <span className="text-[13.5px] font-semibold text-[#171714]">Gloss &amp; Depth Preservation</span>
                        </div>
                        <p className="text-[12.5px] text-[#171714]/70 leading-normal pl-[38px] m-0">
                          Protects deep optical reflections and high-gloss showroom finish without micro-hazing breakdown.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[var(--section-divider)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12.5px] text-[#171714]/65">
                      <span>Have questions regarding your coverage or installer registration?</span>
                      <Link
                        href="/contact"
                        className="text-[#F26522] hover:text-[#D9531E] font-semibold transition-colors shrink-0 inline-flex items-center gap-1"
                      >
                        Contact Trionyx Support →
                      </Link>
                    </div>
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

          {/* Section: Frequently Asked Questions */}
          <SectionFrame hasBottomBorder={false}>
            <div className="px-5 sm:px-6 lg:px-8 py-14 lg:py-18 border-t border-[var(--section-divider)]">
              <div className="max-w-2xl mb-12">
                <SectionEyebrow>FAQ</SectionEyebrow>
                <h2 className="section-heading text-[28px] sm:text-[34px] tracking-[-0.025em] text-[#171714] mb-3">
                  Frequently asked warranty questions.
                </h2>
                <p className="body-copy max-w-lg">
                  Answers to common questions about product serial validation, installer registrations, and maintenance coverage.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-2">
                  <h4 className="text-[16px] font-semibold text-[#171714]">
                    When does my warranty become active?
                  </h4>
                  <p className="text-[14px] text-[#171714]/70 leading-relaxed">
                    Your warranty is officially activated by your authorized Trionyx detailing studio upon vehicle inspection and delivery. Activations typically reflect in the central registry within 24 hours of handover.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[16px] font-semibold text-[#171714]">
                    Can I service my warranty at another Trionyx studio?
                  </h4>
                  <p className="text-[14px] text-[#171714]/70 leading-relaxed">
                    Yes. Trionyx warranty registrations are nationwide digital records. Any certified Trionyx partner studio across India can pull up your vehicle history for routine maintenance washes and decontaminations.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[16px] font-semibold text-[#171714]">
                    What should I do if my serial number is not recognized?
                  </h4>
                  <p className="text-[14px] text-[#171714]/70 leading-relaxed">
                    Confirm you entered all digits correctly in the format <code className="font-mono text-[12px] bg-[#EFECE3] px-1.5 py-0.5 rounded text-[#F26522]">TRX-SN-YYYY-XXXX</code>. If your installation was recent, check with your installer to ensure the customer record was finalized in the dealer portal.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[16px] font-semibold text-[#171714]">
                    Is the warranty transferable if I sell my car?
                  </h4>
                  <p className="text-[14px] text-[#171714]/70 leading-relaxed">
                    Yes. Trionyx surface protection warranties remain attached to the vehicle identification number (VIN). The new owner can verify continuity through this portal provided recommended maintenance intervals were met.
                  </p>
                </div>
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
