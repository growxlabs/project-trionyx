import Link from 'next/link';
import type { ReactNode } from 'react';
import { TrionyxLogo } from '../ui/TrionyxLogo';
import { companyContact } from '@/data/companyContact';

const linkClass =
  'inline-flex min-h-11 items-center text-[14px] text-[#C5C2B9] transition-colors duration-150 hover:text-[#F26522] focus-visible:rounded-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F26522]';

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
      <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#B5B2A9] sm:mb-4">
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
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-x-7 gap-y-9 px-5 py-12 sm:grid-cols-2 sm:gap-y-10 sm:px-6 sm:py-14 md:grid-cols-12 md:gap-x-8 lg:px-8 lg:py-16">
        <div className="col-span-1 sm:col-span-2 md:col-span-5">
          <Link href="/" aria-label="Trionyx home" className="inline-flex items-center rounded-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F26522]">
            <TrionyxLogo variant="light" size="md" priority={false} />
          </Link>
          <p className="mb-0 mt-4 max-w-[270px] text-[14px] leading-[1.65] text-[#B5B2A9]">
            Automotive protection, coating, care and related products.
          </p>
        </div>

        <FooterColumn title="Explore" className="col-span-1 md:col-span-2">
          <li><Link href="/#graphene" className={linkClass}>Products</Link></li>
          <li><Link href="/dealer-access" className={linkClass}>Dealer Access</Link></li>
          <li><Link href="/warranty" className={linkClass}>Warranty</Link></li>
        </FooterColumn>

        <FooterColumn title="Company" className="col-span-1 md:col-span-2">
          <li><Link href="/#about" className={linkClass}>About</Link></li>
          <li><Link href="/contact" className={linkClass}>Contact</Link></li>
        </FooterColumn>

        <FooterColumn title="Contact" className="col-span-1 sm:col-span-2 md:col-span-3">
          <li><a href={companyContact.phoneHref} className={linkClass}>{companyContact.phone}</a></li>
          <li><a href={companyContact.emailHref} className={`${linkClass} break-all`}>{companyContact.email}</a></li>
          <li className="py-2 text-[14px] leading-6 text-[#C5C2B9]">
            {companyContact.location.city}, {companyContact.location.region}
            <br />{companyContact.location.country}
          </li>
        </FooterColumn>
      </div>

      <div className="border-t border-white/[0.12]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-5 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="m-0 text-[11px] leading-5 text-[#B5B2A9]">
            © {new Date().getFullYear()} Trionyx India Private Limited
          </p>
          <p className="m-0 text-[11px] leading-5 text-[#B5B2A9] md:text-right">
            Technology &amp; Digital Partner by GrowxLabs
          </p>
        </div>
      </div>
    </footer>
  );
}
