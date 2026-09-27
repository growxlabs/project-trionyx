import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell, type LegalSection } from '@/components/legal/LegalPageShell';
import { companyContact } from '@/data/companyContact';

export const metadata: Metadata = {
  title: 'Privacy Policy — Trionyx India',
  description:
    'How Trionyx handles information across the website, dealer access, enquiries and warranty services.',
};

const privacySections: LegalSection[] = [
  {
    id: 'about-trionyx',
    number: '01',
    title: 'About Trionyx',
    content: (
      <>
        <p>
          Trionyx India Private Limited (&ldquo;Trionyx&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;)
          engineers and supplies advanced surface protection coatings, specialty ceramic formulations, borophene surface
          treatments, and precision automotive care chemistries across India.
        </p>
        <p>
          This Privacy Policy articulates our transparent principles and operational practices regarding the collection,
          safeguarding, utilization, and disclosure of information gathered through our public website
          (trionyxindia.vercel.app / trionyx.in), our authorized dealer portal, commercial enquiry channels, and public
          warranty verification services.
        </p>
        <p>
          We operate under a strict principle of data minimization: we collect only information that is functionally
          essential to verify product authenticity, process authorized commercial transactions, service dealer accounts,
          and fulfill professional trade communications.
        </p>
      </>
    ),
  },
  {
    id: 'information-we-collect',
    number: '02',
    title: 'Information We Collect',
    content: (
      <>
        <p>
          The types of information processed depend directly upon your interaction with our digital platforms:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-[#171714]/85">
          <li>
            <strong>Trade &amp; Customer Enquiries:</strong> When you initiate contact regarding product formulations,
            dealer partnerships, or distribution networks, we collect your full name, business or detailing studio name,
            contact telephone number, corporate email address, operating city, state, territory, and submitted message.
          </li>
          <li>
            <strong>Authorized Dealer Credentials:</strong> For verified dealership accounts, we record registered legal entity
            names, proprietor or designated director details, verified business phone numbers, operational addresses, tax
            identifiers (GSTIN), and authentication credentials.
          </li>
          <li>
            <strong>Discrete Product Identifiers:</strong> When verifying or registering a factory warranty, we process
            the discrete physical <strong>Serial Number</strong> printed on the product packaging, along with the certified
            installation milestone date and the servicing authorized dealer identifier.
          </li>
          <li>
            <strong>Technical Telemetry:</strong> Standard network request telemetry generated automatically during server
            interactions, including internet protocol (IP) addresses, browser user-agent headers, and temporary session
            identifiers required for anti-abuse rate limiting and server diagnostic security.
          </li>
        </ul>
        <p className="pt-1">
          Trionyx does <em>not</em> collect personal biometric data, consumer financial credit profiles, or sensitive
          personal categories through our digital platform.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-collect-information',
    number: '03',
    title: 'How We Collect Information',
    content: (
      <>
        <p>
          We collect information directly from you or through verified operational interactions:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-[#171714]/85">
          <li>
            <strong>Direct Submissions:</strong> Information provided voluntarily through our public Contact form, Dealer
            Access applications, or customer support communication channels.
          </li>
          <li>
            <strong>Authorized Detailing Network:</strong> Information recorded when an authorized Trionyx detailing studio
            registers a physical coating installation and logs an active product warranty card.
          </li>
          <li>
            <strong>Platform Interactions:</strong> Technical telemetry captured automatically when you navigate pages, submit
            queries, or query the public warranty verification engine.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'how-we-use-information',
    number: '04',
    title: 'How We Use Information',
    content: (
      <>
        <p>
          Information collected by Trionyx is deployed exclusively for legitimate, defined operational and commercial purposes:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-[#171714]/85">
          <li>
            <strong>Trade Communication:</strong> Evaluating and responding promptly to distribution inquiries, dealership
            onboarding requests, and technical formulation inquiries.
          </li>
          <li>
            <strong>Dealership Administration:</strong> Authenticating studio access, processing stock allocations, verifying
            inventory movements, and coordinating logistics with territorial distributors.
          </li>
          <li>
            <strong>Warranty Administration:</strong> Maintaining the permanent serial-number registry to validate genuine
            factory coatings, calculate term expirations, and enable customer self-service verification.
          </li>
          <li>
            <strong>System Security &amp; Fraud Prevention:</strong> Enforcing rate-limiting thresholds (e.g. public serial lookup
            safeguards), mitigating automated bot scraping, and preserving platform availability.
          </li>
          <li>
            <strong>Statutory Compliance:</strong> Satisfying mandatory accounting, taxation (GST compliance), and commercial
            record-keeping standards under Indian law.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'dealer-portal-information',
    number: '05',
    title: 'Dealer Portal Information',
    content: (
      <>
        <p>
          The Trionyx Dealer Portal is a private, authenticated workspace restricted exclusively to contracted detailing
          studios, certified applicators, and regional distribution partners.
        </p>
        <p>
          Information maintained within this environment includes business contact details, serial assignment ledgers,
          commercial support tickets, and warranty registration history. Access is strictly authenticated via cryptographically
          hashed credentials and secured HTTP-only session tokens. Commercial operational records within the dealer portal are
          governed jointly by this Privacy Policy and individual dealership distribution contracts.
        </p>
      </>
    ),
  },
  {
    id: 'contact-enquiry-information',
    number: '06',
    title: 'Contact & Enquiry Information',
    content: (
      <>
        <p>
          When you submit an enquiry via our website, your information is transmitted over encrypted channels directly to our
          central operational repository. We do not maintain public directories of enquiry submitters.
        </p>
        <p>
          Enquiry records are reviewed by designated Trionyx commercial personnel. We never license, rent, monetize, or sell
          contact enquiry details to third-party telemarketing agencies or promotional lists.
        </p>
      </>
    ),
  },
  {
    id: 'warranty-information',
    number: '07',
    title: 'Warranty Information & Privacy Safeguards',
    content: (
      <>
        <p>
          The Trionyx warranty verification engine is intentionally engineered with privacy-by-design principles:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-[#171714]/85">
          <li>
            <strong>Serial-Centric Model:</strong> Warranty records are linked directly to unique physical packaging Serial
            Numbers, rather than assembling centralized consumer surveillance profiles.
          </li>
          <li>
            <strong>Strict Sanitization on Public Verification:</strong> The public lookup tool at{' '}
            <Link href="/warranty" className="text-[#F26522] underline font-medium hover:text-[#171714] transition-colors">
              /warranty
            </Link>{' '}
            displays only product name, serial number, installation date, warranty expiration date, and servicing dealer.
          </li>
          <li>
            <strong>No Private Data Leakage:</strong> Customer personal addresses, phone numbers, vehicle registration
            numbers, wholesale unit costs, and distributor commercial margins are strictly barred from public display.
          </li>
          <li>
            <strong>Lookup Protection:</strong> Public checks are rate-limited per IP address to prevent brute-force serial
            scanning.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'cookies-analytics',
    number: '08',
    title: 'Cookies & Analytics',
    content: (
      <>
        <p>
          Trionyx minimizes cookie usage. We utilize strictly necessary session cookies essential for dealer authentication,
          security tokens, and system preference detection.
        </p>
        <p>
          We do not deploy cross-site advertising trackers or behavioral targeting pixels. For an exhaustive description
          of our technical cookie framework, please consult our dedicated{' '}
          <Link href="/cookies" className="text-[#F26522] underline font-medium hover:text-[#171714] transition-colors">
            Cookie Policy
          </Link>.
        </p>
      </>
    ),
  },
  {
    id: 'how-information-is-shared',
    number: '09',
    title: 'How Information Is Shared',
    content: (
      <>
        <p>
          Trionyx does not trade, sell, or disclose information to outside entities except under clearly delimited
          circumstances:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-[#171714]/85">
          <li>
            <strong>Certified Channel Partners:</strong> If an enquiry originates in an authorized distributor&rsquo;s exclusive
            territory, relevant trade contact information may be shared to coordinate fulfillment and local technical support.
          </li>
          <li>
            <strong>Infrastructure Service Providers:</strong> Trusted enterprise service providers (such as secure cloud
            hosting facilities and database providers) operating under strict contractual obligations of confidentiality and
            data protection.
          </li>
          <li>
            <strong>Legal &amp; Regulatory Mandate:</strong> Where required by applicable Indian law, valid judicial subpoena,
            or regulatory directive to protect legal rights, prevent fraudulent activity, or ensure safety.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'data-retention',
    number: '10',
    title: 'Data Retention',
    content: (
      <>
        <p>
          We retain operational data only for periods reasonable and necessary to fulfill the purposes set out in this Policy:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-[#171714]/85">
          <li>
            <strong>Warranty Records:</strong> Retained for the full duration of the active factory warranty term plus an
            administrative archival window to support audits and product traceability.
          </li>
          <li>
            <strong>Dealer Account Data:</strong> Maintained for the active duration of commercial dealership agreements and
            applicable statutory tax and accounting retention horizons.
          </li>
          <li>
            <strong>General Enquiries:</strong> Maintained for periods necessary to conclude business correspondence and resolve
            follow-up inquiries.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'security',
    number: '11',
    title: 'Data Security & Protection Safeguards',
    content: (
      <>
        <p>
          Trionyx implements rigorous technical and organizational measures to safeguard data against unauthorized access,
          alteration, disclosure, or destruction:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-[#171714]/85">
          <li>Transport Layer Security (TLS 1.3) encryption for all web and API data transmissions.</li>
          <li>Cryptographically salted and hashed authentication credentials using modern hashing algorithms.</li>
          <li>Role-based access control (RBAC) ensuring internal staff access data solely on a verified need-to-know basis.</li>
          <li>Immutable operational audit logs recording administrative modifications, status adjustments, and warranty revocations.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'your-choices',
    number: '12',
    title: 'Your Choices & Requests',
    content: (
      <>
        <p>
          You possess reasonable control over your contact information:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-[#171714]/85">
          <li>
            <strong>Review &amp; Correction:</strong> You may request the review, update, or correction of your business
            contact information by contacting our administrative team.
          </li>
          <li>
            <strong>Dealer Profile Updates:</strong> Authorized dealers may update operational studio addresses and contact
            numbers directly through the Dealer Portal or via their assigned distributor representative.
          </li>
          <li>
            <strong>Communications Opt-Out:</strong> You may opt out of non-essential trade announcements at any time by
            submitting a written request to our contact address.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'third-party-services',
    number: '13',
    title: 'Third-Party Services & External Links',
    content: (
      <>
        <p>
          Our platform may reference external resources, certification bodies, or mapping tools for geographic convenience.
          Trionyx exercises no operational control over external websites, and this Privacy Policy does not govern third-party
          platforms. We recommend reviewing the privacy notices of any external site you visit.
        </p>
      </>
    ),
  },
  {
    id: 'changes-to-policy',
    number: '14',
    title: 'Changes to this Policy',
    content: (
      <>
        <p>
          We may update this Privacy Policy from time to time to reflect operational modifications, technological advancements,
          or evolving legal requirements.
        </p>
        <p>
          When modifications occur, the revised date at the top of this document will be updated. Significant operational changes
          will be communicated directly through authorized dealer channels where appropriate.
        </p>
      </>
    ),
  },
  {
    id: 'contact-details',
    number: '15',
    title: 'Contact & Grievance Details',
    content: (
      <>
        <p>
          For questions, concerns, or requests regarding this Privacy Policy or our operational data handling, please contact
          our compliance desk:
        </p>

        {/* Restrained Information Block (#F5F5EE, subtle border, 6px radius) */}
        <div className="bg-[#F5F5EE] border border-[#171714]/12 rounded-[6px] p-5 sm:p-6 mt-4 max-w-lg space-y-3 text-[14px]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#68665F] block">
              Corporate Entity
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
              Registered Office Region
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

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      eyebrow="LEGAL"
      title="Privacy Policy"
      supportingLine="How Trionyx handles information across the website, dealer access, enquiries and warranty services."
      lastUpdated="September 27, 2026"
      sections={privacySections}
      currentPath="/privacy"
    />
  );
}
