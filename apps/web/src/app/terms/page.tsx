import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell, type LegalSection } from '@/components/legal/LegalPageShell';
import { companyContact } from '@/data/companyContact';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Trionyx India',
  description:
    'Terms governing use of the Trionyx website, dealer access and related digital services.',
};

const termsSections: LegalSection[] = [
  {
    id: 'acceptance-of-terms',
    number: '01',
    title: 'Acceptance of Terms',
    content: (
      <>
        <p>
          These Terms &amp; Conditions (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you and
          Trionyx India Private Limited (&ldquo;Trionyx&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;)
          governing your access to and use of our public website (trionyxindia.vercel.app / trionyx.in), dealer portal,
          commercial enquiry systems, and public warranty verification services.
        </p>
        <p>
          By accessing or utilizing our platform, you confirm that you have read, understood, and agree to be bound by these
          Terms. If you do not agree with any provision herein, you must immediately discontinue use of the platform.
        </p>
      </>
    ),
  },
  {
    id: 'about-the-website',
    number: '02',
    title: 'About the Website',
    content: (
      <>
        <p>
          The Trionyx platform provides official technical formulation specifications, laboratory performance data, an
          authorized dealer network directory, commercial enquiry channels, and a central serial-number warranty verification
          lookup for Trionyx surface care and automotive protection formulations.
        </p>
      </>
    ),
  },
  {
    id: 'product-information',
    number: '03',
    title: 'Product Information & Technical Guidance',
    content: (
      <>
        <p>
          All product specifications, technical data sheets (TDS), chemical composition overviews, and application guidelines
          published on this website are provided for professional informational and guidance purposes.
        </p>
        <p>
          Trionyx formulations are precision chemical systems engineered specifically for application by trained, certified
          automotive detailers. Actual coating longevity, hydrophobic performance, and surface bonding depend directly on
          proper substrate preparation, ambient humidity and temperature conditions, application methodology, and subsequent
          maintenance routines.
        </p>
      </>
    ),
  },
  {
    id: 'enquiries',
    number: '04',
    title: 'Enquiries & Communications',
    content: (
      <>
        <p>
          When submitting enquiries through our website for trade distribution, dealership allocation, or customer support,
          you agree to provide truthful, accurate, and current business details.
        </p>
        <p>
          Submitting fraudulent requests, impersonating trade entities, or transmitting unsolicited marketing materials through
          our enquiry forms is strictly prohibited and may result in immediate administrative blocking.
        </p>
      </>
    ),
  },
  {
    id: 'dealer-access',
    number: '05',
    title: 'Dealer Access & Authorized Network',
    content: (
      <>
        <p>
          Access to the Trionyx Dealer Portal is restricted strictly to verified, contracted detailing studios, certified
          applicators, and territorial distributors approved by Trionyx India Private Limited.
        </p>
        <p>
          Trionyx reserves the absolute right to approve, reject, restrict, or suspend dealer portal credentials at its
          discretion if an account breaches dealership agreements, misrepresents product capabilities, or applies uncertified
          non-genuine formulations.
        </p>
      </>
    ),
  },
  {
    id: 'account-security',
    number: '06',
    title: 'Account Security & Credentials',
    content: (
      <>
        <p>
          Authorized dealers and operators are solely responsible for maintaining the confidentiality of their login credentials,
          passwords, and session tokens.
        </p>
        <p>
          You agree to immediately notify Trionyx upon becoming aware of any unauthorized access or security breach concerning
          your account. Trionyx cannot and will not be liable for any loss resulting from unauthorized access caused by failure to
          safeguard credentials.
        </p>
      </>
    ),
  },
  {
    id: 'warranty-information',
    number: '07',
    title: 'Warranty Information & Separate Terms',
    content: (
      <>
        <p>
          Warranty coverage is governed exclusively by the applicable Trionyx warranty policy established per product formulation.
        </p>
        <p>
          Factory warranties are anchored to individual verified Serial Numbers and valid dealer installation records. To
          verify an active warranty registration, review specific duration terms, or check genuine product registration,
          please visit our dedicated verification tool:
        </p>
        <div className="pt-2">
          <Link
            href="/warranty"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[#FCFBF7] border border-[#171714]/15 text-[#171714] text-[13.5px] font-semibold hover:border-[#F26522] hover:text-[#F26522] transition-colors"
          >
            Check Warranty Registry (/warranty) →
          </Link>
        </div>
        <p className="pt-2 text-[13.5px] text-[#68665F]">
          General Terms &amp; Conditions do not duplicate or alter specific warranty coverage terms, exclusion schedules, or
          claim procedures established in product warranty documentation.
        </p>
      </>
    ),
  },
  {
    id: 'intellectual-property',
    number: '08',
    title: 'Intellectual Property',
    content: (
      <>
        <p>
          All content, software, design systems, logos, brand marks, product names (including Trionyx™, Borophene, Graphene
          Pro, and Matrix series), formulation data, technical drawings, typography, graphics, and source code are the
          exclusive intellectual property of Trionyx India Private Limited or its licensors.
        </p>
        <p>
          No material from this website may be copied, reproduced, republished, uploaded, posted, transmitted, or distributed
          in any way without prior written authorization from Trionyx.
        </p>
      </>
    ),
  },
  {
    id: 'permitted-use',
    number: '09',
    title: 'Permitted Use',
    content: (
      <>
        <p>
          You are granted a limited, non-exclusive, revocable license to access and use the website for:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-[#171714]/85">
          <li>Reviewing technical formulation specifications and product documentation.</li>
          <li>Submitting genuine commercial enquiries regarding dealership or distribution.</li>
          <li>Performing authentic serial-number warranty lookups.</li>
          <li>Conducting authorized dealership operational workflows within the Dealer Portal.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'prohibited-use',
    number: '10',
    title: 'Prohibited Use',
    content: (
      <>
        <p>
          When using our website or digital services, you agree not to:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-[#171714]/85">
          <li>Engage in automated scraping, data extraction, web crawling, or harvesting of serial numbers or dealer profiles.</li>
          <li>Attempt to probe, scan, or breach system security vulnerabilities or circumvent rate limits.</li>
          <li>Transmit malicious code, viruses, trojans, or destructive computational payloads.</li>
          <li>Impersonate any individual, authorized studio, commercial entity, or Trionyx representative.</li>
          <li>Reverse-engineer, decompile, or disassemble any portion of the software or proprietary API endpoints.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'third-party-services',
    number: '11',
    title: 'Third-Party Services & Links',
    content: (
      <>
        <p>
          Our website may contain links to external third-party services, certifications, or mapping applications. These links
          are provided solely for user reference. Trionyx exercises no control over external platforms and assumes no
          responsibility for their content, privacy policies, or commercial practices.
        </p>
      </>
    ),
  },
  {
    id: 'website-availability',
    number: '12',
    title: 'Website Availability & Modifications',
    content: (
      <>
        <p>
          We strive to maintain continuous platform availability. However, access may be temporarily interrupted for scheduled
          maintenance, emergency security upgrades, or network infrastructure revisions.
        </p>
        <p>
          Trionyx reserves the right to modify, suspend, or discontinue any feature, endpoint, or service component at any
          time without prior notice.
        </p>
      </>
    ),
  },
  {
    id: 'disclaimers',
    number: '13',
    title: 'Disclaimers',
    content: (
      <>
        <p>
          Except where expressly provided in writing under an official Trionyx product warranty policy, the website, its
          content, and digital tools are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without
          warranties of any kind, whether express, statutory, or implied.
        </p>
        <p>
          Trionyx does not guarantee that website functions will be completely uninterrupted or error-free, that defects will be
          corrected immediately, or that our servers are entirely immune to unauthorized third-party interference.
        </p>
      </>
    ),
  },
  {
    id: 'limitation-of-liability',
    number: '14',
    title: 'Limitation of Liability',
    content: (
      <>
        <p>
          To the maximum extent permitted by applicable Indian law, Trionyx India Private Limited, its directors, officers,
          employees, or agents shall not be liable for any direct, indirect, incidental, punitive, or consequential damages
          resulting from your access to, use of, or inability to use this website, digital services, or data representations.
        </p>
      </>
    ),
  },
  {
    id: 'changes-to-terms',
    number: '15',
    title: 'Changes to Terms',
    content: (
      <>
        <p>
          Trionyx reserves the right to update or modify these Terms &amp; Conditions at any time. When revisions are enacted,
          the updated date at the top of this document will be revised accordingly.
        </p>
        <p>
          Your continued use of the website following the posting of amended Terms constitutes binding acceptance of those
          modifications.
        </p>
      </>
    ),
  },
  {
    id: 'governing-law',
    number: '16',
    title: 'Governing Law & Jurisdiction',
    content: (
      <>
        <p>
          These Terms &amp; Conditions and any dispute or claim arising out of or related to their subject matter or formation
          shall be governed by and construed in accordance with the laws of the Republic of India.
        </p>
        <p>
          You agree that the competent courts situated in Hyderabad, Telangana, India shall possess exclusive jurisdiction over
          any legal proceeding, controversy, or dispute arising out of or relating to these Terms or your use of the website.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    number: '17',
    title: 'Contact Details',
    content: (
      <>
        <p>
          For legal inquiries, formal notices, or commercial questions regarding these Terms, please contact our administrative
          office:
        </p>

        {/* Restrained Information Block */}
        <div className="bg-[#FCFBF7] border border-[#171714]/12 rounded-[6px] p-5 sm:p-6 mt-4 max-w-lg space-y-3 text-[14px]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#68665F] block">
              Legal Entity
            </span>
            <span className="font-semibold text-[#171714] text-[15px] block mt-0.5">
              Trionyx India Private Limited
            </span>
          </div>

          <div className="pt-2 border-t border-[#171714]/08 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#68665F] block">
                Official Email
              </span>
              <a
                href={companyContact.emailHref}
                className="font-medium text-[#171714] hover:text-[#F26522] transition-colors block mt-0.5"
              >
                {companyContact.email}
              </a>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#68665F] block">
                Telephone
              </span>
              <a
                href={companyContact.phoneHref}
                className="font-medium text-[#171714] hover:text-[#F26522] transition-colors block mt-0.5"
              >
                {companyContact.phone}
              </a>
            </div>
          </div>

          <div className="pt-2 border-t border-[#171714]/08">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#68665F] block">
              Jurisdiction &amp; Region
            </span>
            <p className="text-[#171714]/80 m-0 mt-0.5 text-[13px] leading-relaxed">
              {companyContact.location.city}, {companyContact.location.region}, {companyContact.location.country}
            </p>
          </div>
        </div>
      </>
    ),
  },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPageShell
      eyebrow="LEGAL"
      title="Terms & Conditions"
      supportingLine="Terms governing use of the Trionyx website, dealer access and related digital services."
      lastUpdated="September 27, 2026"
      sections={termsSections}
      currentPath="/terms"
    />
  );
}
