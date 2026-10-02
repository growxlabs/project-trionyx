import Link from 'next/link';
import type { ReactNode } from 'react';
import { TrionyxLogo } from '../ui/TrionyxLogo';
import { companyContact } from '@/data/companyContact';

const linkClass =
  'inline-flex min-h-10 items-center text-[15px] leading-[1.5] text-[#C5C2B9] transition-colors duration-150 hover:text-[#F26522] focus-visible:rounded-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F26522]';

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
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#B5B2A9] sm:mb-5">
        {title}
      </h2>
      <ul className="m-0 list-none p-0 space-y-3 sm:space-y-3.5">
        {children}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer id="site-footer" className="bg-[#171714] text-[#F5F4EE]">
      {/* Main Footer Content */}
      <div className="mx-auto w-full max-w-[1440px] px-6 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="flex flex-col gap-12 sm:gap-14 xl:flex-row xl:items-start xl:justify-between xl:gap-16 2xl:gap-24">
          {/* Brand Column */}
          <div className="w-full xl:w-[320px] 2xl:w-[360px] xl:shrink-0">
            <Link
              href="/"
              aria-label="Trionyx home"
              className="inline-flex items-center rounded-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F26522]"
            >
              <TrionyxLogo variant="light" size="md" priority={false} />
            </Link>
          </div>

          {/* Navigation Columns:
              - Mobile (<640px): 1 column (Explore, Legal, Company, Contact stacked)
              - Tablet / Narrow Desktop (640px - 1279px): Clean 2 x 2 grid
              - Desktop (>=1280px): 4 columns across in a single row
          */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-14 sm:gap-y-12 lg:gap-x-20 lg:gap-y-12 xl:grid-cols-4 xl:gap-x-12 xl:gap-y-0 xl:flex-1 xl:max-w-[880px] 2xl:max-w-[960px]">
            <FooterColumn title="EXPLORE">
              <li><Link href="/#graphene" className={linkClass}>Products</Link></li>
              <li><Link href="/dealer-access" className={linkClass}>Distributor</Link></li>
              <li><Link href="/warranty" className={linkClass}>Warranty</Link></li>
            </FooterColumn>

            <FooterColumn title="LEGAL">
              <li><Link href="/privacy" className={linkClass}>Privacy Policy</Link></li>
              <li><Link href="/terms" className={linkClass}>Terms &amp; Conditions</Link></li>
              <li><Link href="/cookies" className={linkClass}>Cookie Policy</Link></li>
            </FooterColumn>

            <FooterColumn title="COMPANY">
              <li><Link href="/#about" className={linkClass}>About</Link></li>
              <li><Link href="/contact" className={linkClass}>Contact</Link></li>
            </FooterColumn>

            <FooterColumn title="CONTACT">
              <li><a href={companyContact.phoneHref} className={linkClass}>{companyContact.phone}</a></li>
              <li><a href={companyContact.emailHref} className={linkClass}>{companyContact.email}</a></li>
              <li className="pt-1 text-[15px] leading-[1.5] text-[#C5C2B9]">
                <span className="block whitespace-nowrap">{companyContact.location.city}, {companyContact.location.region}</span>
                <span className="block">{companyContact.location.country}</span>
              </li>
            </FooterColumn>
          </div>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div>
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-6 py-6 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <p className="m-0 text-[15px] leading-[1.5] text-[#C5C2B9]">
            © {new Date().getFullYear()} Trionyx India Private Limited
          </p>
          <p className="m-0 text-[12px] leading-[1.4] text-[#B5B2A9] md:text-right">
            Technology &amp; Digital Partner by{' '}
            <a
              href="https://growxlabs.tech/"
              className="transition-colors duration-150 hover:text-[#F26522] focus-visible:rounded-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F26522]"
            >
              GrowxLabs
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
