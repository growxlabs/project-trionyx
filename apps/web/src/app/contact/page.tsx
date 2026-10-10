import type { Metadata } from 'next';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SectionFrame } from '@/components/frame';
import { ContactForm } from '@/components/contact';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { PhoneIcon, MailIcon, MapPinIcon } from '@/components/ui/Icons';
import { companyContact } from '@/data/companyContact';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';

export const metadata: Metadata = {
  title: 'Contact — Trionyx',
  description:
    'Get in touch with Trionyx for product enquiries, dealer opportunities, distribution partnerships, or product support.',
};

export default function ContactPage() {
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
                <SectionEyebrow>CONTACT</SectionEyebrow>
                <h1 className="section-heading text-[32px] sm:text-[40px] lg:text-[48px] tracking-[-0.025em] leading-[1.1] text-[#171714] mb-4">
                  Talk to Trionyx.
                </h1>
                <p className="body-copy max-w-lg">
                  For product enquiries, dealer opportunities, distribution partnerships
                  or product support, send us your details.
                </p>
              </div>

              {/* Two-Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                {/* Left: Form */}
                <div className="lg:col-span-7 xl:col-span-8">
                  <div className="bg-[#F5F5EE] border border-[var(--section-divider)] rounded-[8px] p-6 sm:p-8 relative overflow-hidden">
                    <ContactForm />
                  </div>
                </div>

                {/* Right: Contact Details Sidebar */}
                <aside className="lg:col-span-5 xl:col-span-4">
                  <div className="space-y-8 lg:sticky lg:top-32">
                    {/* Direct Contact */}
                    <div>
                      <h3 className="text-[14px] font-semibold text-[#171714] mb-4 uppercase tracking-[0.05em]">
                        Reach us directly
                      </h3>
                      <div className="space-y-4">
                        <a
                          href={companyContact.phoneHref}
                          className="flex items-start gap-3 group"
                        >
                          <span className="w-9 h-9 rounded-[4px] bg-[#EFECE3] flex items-center justify-center shrink-0 mt-0.5">
                            <PhoneIcon size={16} color="muted" />
                          </span>
                          <div>
                            <p className="text-[13px] text-[#68665F] mb-0.5">Phone</p>
                            <p className="text-[15px] font-medium text-[#171714] group-hover:text-[#F26522] transition-colors">
                              {companyContact.phone}
                            </p>
                          </div>
                        </a>

                        <a
                          href={companyContact.emailHref}
                          className="flex items-start gap-3 group"
                        >
                          <span className="w-9 h-9 rounded-[4px] bg-[#EFECE3] flex items-center justify-center shrink-0 mt-0.5">
                            <MailIcon size={16} color="muted" />
                          </span>
                          <div>
                            <p className="text-[13px] text-[#68665F] mb-0.5">Email</p>
                            <p className="text-[15px] font-medium text-[#171714] group-hover:text-[#F26522] transition-colors">
                              {companyContact.email}
                            </p>
                          </div>
                        </a>

                        <div className="flex items-start gap-3">
                          <span className="w-9 h-9 rounded-[4px] bg-[#EFECE3] flex items-center justify-center shrink-0 mt-0.5">
                            <MapPinIcon size={16} color="muted" />
                          </span>
                          <div>
                            <p className="text-[13px] text-[#68665F] mb-0.5">Office</p>
                            <p className="text-[15px] font-medium text-[#171714] leading-snug">
                              {companyContact.location.city}, {companyContact.location.region}
                              <br />
                              <span className="text-[#68665F] font-normal">{companyContact.location.country}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-[rgba(23,23,20,0.07)]" />

                    {/* Response Time */}
                    <div>
                      <h3 className="text-[14px] font-semibold text-[#171714] mb-3 uppercase tracking-[0.05em]">
                        Response time
                      </h3>
                      <p className="text-[14px] text-[#68665F] leading-relaxed">
                        We typically respond within 1–2 business days.
                        For urgent product support, call us directly.
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-[rgba(23,23,20,0.07)]" />

                    {/* Dealer / Partner callout */}
                    <div className="bg-[#EFECE3] rounded-[6px] p-5">
                      <p className="text-[13px] font-semibold text-[#171714] mb-1.5">
                        Existing dealers
                      </p>
                      <p className="text-[13px] text-[#68665F] leading-relaxed">
                        If you are an existing Trionyx dealer, sign in to the{' '}
                        <a
                          href="/dealer-access"
                          className="text-[#F26522] font-medium hover:underline"
                        >
                          Dealer Portal
                        </a>{' '}
                        for account support and requests.
                      </p>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </SectionFrame>
        </main>

        <SiteFooter />
      </PageFrame>
    </div>
  );
}
