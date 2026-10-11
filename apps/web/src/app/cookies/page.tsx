import type { Metadata } from 'next';
import { LegalPageShell, type LegalSection } from '@/components/legal/LegalPageShell';
import { companyContact } from '@/data/companyContact';

export const metadata: Metadata = {
  title: 'Cookie Policy — Trionyx India',
  description:
    'How Trionyx uses cookies and similar technologies across its digital services.',
};

const cookieSections: LegalSection[] = [
  {
    id: 'what-cookies-are',
    number: '01',
    title: 'What Cookies Are',
    content: (
      <>
        <p>
          Cookies are small text data files deposited onto your computer, tablet, or mobile browser by websites you visit.
          They are widely utilized across the internet to allow platforms to operate efficiently, preserve your security state,
          and retain navigational preferences across sessions.
        </p>
        <p>
          Trionyx adheres strictly to data minimization: we deploy cookies solely where technically and operationally essential
          to deliver secure, authentic digital experiences.
        </p>
      </>
    ),
  },
  {
    id: 'essential-cookies',
    number: '02',
    title: 'Essential Cookies',
    content: (
      <>
        <p>
          Essential cookies are strictly necessary for the technical operation, load distribution, and navigation of our public
          website. Without these cookies, basic platform capabilities cannot function reliably.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-[#171714]/85">
          <li>
            <strong>Session &amp; Routing Integrity:</strong> Ephemeral server tokens that maintain routing state and prevent
            cross-site request forgery during form submissions.
          </li>
          <li>
            <strong>Display Preferences:</strong> Lightweight local preference keys that remember system layout and contrast
            configurations across visits.
          </li>
        </ul>
        <p className="pt-1 text-[13.5px] text-[#68665F]">
          Because essential cookies are technically imperative to deliver requested web services, they do not require consent
          under standard international data protection regulations.
        </p>
      </>
    ),
  },
  {
    id: 'authentication-security-cookies',
    number: '03',
    title: 'Authentication & Security Cookies',
    content: (
      <>
        <p>
          For authorized detailing studios and operators accessing our restricted Dealer Portal, we deploy specialized security
          cookies:
        </p>
        <div className="bg-[#FFFFEB] border border-[#171714]/12 rounded-[6px] p-4 text-[13px] space-y-2">
          <div className="flex items-center justify-between font-mono text-[12px] font-bold text-[#F26522]">
            <span>trionyx_dealer_session</span>
            <span className="text-[#68665F] font-normal font-sans">HTTP-Only / Secure / SameSite</span>
          </div>
          <p className="text-[#171714]/80 m-0">
            Cryptographically signed session cookie maintaining authenticated state for certified detailing studio operators.
            This cookie prevents unauthorized credential spoofing and expires automatically upon session termination or manual
            logout.
          </p>
        </div>
      </>
    ),
  },
  {
    id: 'analytics-cookies',
    number: '04',
    title: 'Analytics Cookies',
    content: (
      <>
        <p>
          <strong>No Invasive Analytics:</strong> Trionyx does not deploy invasive commercial analytical tracking packages or
          third-party behavior-recording software on our public website.
        </p>
        <p>
          We do not record your individual browsing journeys, keystrokes, or screen recordings. Any high-level server traffic
          telemetry is aggregated strictly at the infrastructure level (e.g. total HTTP requests, error code counts, and network
          latency) solely to maintain platform speed and server uptime.
        </p>
      </>
    ),
  },
  {
    id: 'advertising-cookies',
    number: '05',
    title: 'Advertising & Tracking Cookies',
    content: (
      <>
        <p>
          <strong>Zero Commercial Ad Trackers:</strong> We do NOT employ third-party advertising cookies, retargeting beacons,
          Meta Pixels, Google Ads tracking tags, or cross-site profiling trackers.
        </p>
        <p>
          Visiting the Trionyx website will never result in cross-site behavioral retargeting or commercial advertising trackers
          following you across other web domains.
        </p>
      </>
    ),
  },
  {
    id: 'third-party-services',
    number: '06',
    title: 'Third-Party Services',
    content: (
      <>
        <p>
          Our platform utilizes enterprise font infrastructure (e.g. Google Fonts CDN) to serve our curated typography. These
          static content delivery networks do not deposit commercial tracking cookies or harvest personal data on our behalf.
        </p>
        <p>
          External links to third-party domains (such as Google Maps or external logistics tools) operate under their respective
          independent cookie practices upon navigation.
        </p>
      </>
    ),
  },
  {
    id: 'cookie-preferences',
    number: '07',
    title: 'Managing Cookie Preferences',
    content: (
      <>
        <p>
          You have the right and technical ability to manage or block cookies through your web browser preferences:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-[#171714]/85">
          <li>
            <strong>Google Chrome:</strong> Settings &rarr; Privacy and security &rarr; Third-party cookies.
          </li>
          <li>
            <strong>Apple Safari:</strong> Preferences &rarr; Privacy &rarr; Manage Website Data.
          </li>
          <li>
            <strong>Mozilla Firefox:</strong> Settings &rarr; Privacy &amp; Security &rarr; Cookies and Site Data.
          </li>
          <li>
            <strong>Microsoft Edge:</strong> Settings &rarr; Cookies and site permissions &rarr; Manage and delete cookies.
          </li>
        </ul>
        <p className="pt-1 text-[13.5px] text-[#68665F]">
          Note: If you disable all cookies in your browser settings, public browsing remains functional, but authenticated
          Dealer Portal sessions cannot be sustained.
        </p>
      </>
    ),
  },
  {
    id: 'changes-to-policy',
    number: '08',
    title: 'Changes to this Policy',
    content: (
      <>
        <p>
          We may update this Cookie Policy periodically to reflect technological adjustments or evolving legal frameworks. Any
          modifications will be published directly on this page with an updated revision date.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    number: '09',
    title: 'Contact Details',
    content: (
      <>
        <p>
          If you have questions or technical inquiries regarding our cookie management framework, please reach out to our team:
        </p>

        {/* Restrained Information Block */}
        <div className="bg-[#FFFFEB] border border-[#171714]/12 rounded-[6px] p-5 sm:p-6 mt-4 max-w-lg space-y-3 text-[14px]">
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
              Operating Region
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

export default function CookiePolicyPage() {
  return (
    <LegalPageShell
      eyebrow="LEGAL"
      title="Cookie Policy"
      supportingLine="How Trionyx uses cookies and similar technologies across its digital services."
      lastUpdated="September 27, 2026"
      sections={cookieSections}
      currentPath="/cookies"
    />
  );
}
