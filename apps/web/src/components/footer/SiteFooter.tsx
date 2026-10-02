import Link from 'next/link';
import type { ReactNode } from 'react';
import { TrionyxLogo } from '../ui/TrionyxLogo';
import { companyContact } from '@/data/companyContact';

const linkClass =
  'inline-flex min-h-11 items-center text-[14px] leading-5 text-[#C5C2B9] transition-colors duration-150 hover:text-[#F26522] focus-visible:rounded-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F26522]';

function FooterColumn({
  title,
  children,
  className = '',
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <nav aria-label={title} className={className}>
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A6A297] sm:mb-5">
        {title}
      </h2>
      <ul className="m-0 list-none p-0">
        {children}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer id="site-footer" className="bg-[#171714] text-[#F5F4EE]">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 sm:gap-y-12 xl:grid-cols-12 xl:gap-x-7 xl:gap-y-0">
          <div className="sm:col-span-2 xl:col-span-4">
            <Link
              href="/"
              aria-label="Trionyx home"
              className="inline-flex items-center rounded-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F26522]"
            >
              <TrionyxLogo variant="light" size="md" priority={false} />
            </Link>
            <p className="mb-0 mt-5 max-w-[320px] text-[14px] leading-6 text-[#B5B2A9]">
              Automotive protection, coating, care and related products.
            </p>
          </div>

          <FooterColumn title="Explore" className="xl:col-span-2">
            <li><Link href="/#graphene" className={linkClass}>Products</Link></li>
            <li><Link href="/dealer-access" className={linkClass}>Distributor</Link></li>
            <li><Link href="/warranty" className={linkClass}>Warranty</Link></li>
          </FooterColumn>

          <FooterColumn title="Legal" className="xl:col-span-2">
            <li><Link href="/privacy" className={linkClass}>Privacy Policy</Link></li>
            <li><Link href="/terms" className={linkClass}>Terms &amp; Conditions</Link></li>
            <li><Link href="/cookies" className={linkClass}>Cookie Policy</Link></li>
          </FooterColumn>

          <FooterColumn title="Company" className="xl:col-span-2">
            <li><Link href="/#about" className={linkClass}>About</Link></li>
            <li><Link href="/contact" className={linkClass}>Contact</Link></li>
          </FooterColumn>

          <FooterColumn title="Contact" className="xl:col-span-2">
            <li><a href={companyContact.phoneHref} className={linkClass}>{companyContact.phone}</a></li>
            <li><a href={companyContact.emailHref} className={`${linkClass} break-all`}>{companyContact.email}</a></li>
            <li className="pt-2 text-[14px] leading-6 text-[#C5C2B9]">
              <span className="block whitespace-nowrap">{companyContact.location.city}, {companyContact.location.region}</span>
              <span className="block text-[#8C897E]">{companyContact.location.country}</span>
            </li>
          </FooterColumn>
        </div>
      </div>

      <div className="border-t border-white/[0.12]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-6 py-5 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <p className="m-0 text-[12px] leading-5 text-[#A6A297]">
            © {new Date().getFullYear()} Trionyx India Private Limited
          </p>
          <p className="m-0 text-[12px] leading-5 text-[#A6A297] md:text-right">
            Technology &amp; Digital Partner by GrowxLabs
          </p>
        </div>
      </div>
    </footer>
  );
}
