import Link from 'next/link';
import type { ReactNode } from 'react';
import { TrionyxLogo } from '../ui/TrionyxLogo';
import { companyContact } from '@/data/companyContact';

const linkClass =
  'inline-flex items-center text-[14px] text-[#C5C2B9] transition-colors duration-150 hover:text-[#F26522] focus-visible:rounded-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F26522]';

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
      <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8C897E] sm:mb-6">
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
            <p className="mb-0 mt-5 max-w-[320px] text-[14px] leading-[1.7] text-[#B5B2A9]">
              Automotive protection, coating, care and related products.
            </p>
          </div>

          {/* Navigation Columns:
              - Mobile (<640px): 1 column (Explore, Legal, Company, Contact stacked)
              - Tablet / Narrow Desktop (640px - 1279px): Clean 2 x 2 grid
              - Desktop (>=1280px): 4 columns across in a single row
          */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-14 sm:gap-y-12 lg:gap-x-20 lg:gap-y-12 xl:grid-cols-4 xl:gap-x-12 xl:gap-y-0 xl:flex-1 xl:max-w-[880px] 2xl:max-w-[960px]">
            <FooterColumn title="EXPLORE">
              <li><Link href="/#graphene" className={linkClass}>Products</Link></li>
              <li><Link href="/dealer-access" className={linkClass}>Dealer Access</Link></li>
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
              <li className="pt-1 text-[14px] leading-relaxed text-[#C5C2B9]">
                <span className="block whitespace-nowrap">{companyContact.location.city}, {companyContact.location.region}</span>
                <span className="block text-[#8C897E]">{companyContact.location.country}</span>
              </li>
            </FooterColumn>
          </div>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div className="border-t border-white/[0.12]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-6 py-6 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-[11px] leading-5 text-[#8C897E]">
            <p className="m-0">
              © {new Date().getFullYear()} Trionyx India Private Limited
            </p>
            <nav aria-label="Legal footer links" className="flex items-center gap-3 text-[#8C897E]">
              <Link href="/privacy" className="hover:text-[#F5F4EE] transition-colors">Privacy</Link>
              <span>·</span>
              <Link href="/terms" className="hover:text-[#F5F4EE] transition-colors">Terms</Link>
              <span>·</span>
              <Link href="/cookies" className="hover:text-[#F5F4EE] transition-colors">Cookies</Link>
              <span>·</span>
              <Link href="/warranty" className="hover:text-[#F5F4EE] transition-colors">Warranty</Link>
            </nav>
          </div>
          <p className="m-0 text-[11px] leading-5 text-[#8C897E] md:text-right">
            Technology &amp; Digital Partner by GrowxLabs
          </p>
        </div>
      </div>
    </footer>
  );
}
