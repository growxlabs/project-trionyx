import Link from 'next/link';
import { TrionyxLogo } from '../ui/TrionyxLogo';
import { companyContact } from '@/data/companyContact';
import styles from './SiteFooter.module.css';

const navigation = [
  { title: 'Explore', links: [
    { label: 'Our products', href: '/#graphene' },
    { label: 'About Trionyx', href: '/#about' },
    { label: 'Contact us', href: '/contact' },
  ] },
  { title: 'Partners & support', links: [
    { label: 'Distributor access', href: '/dealer-access' },
    { label: 'Warranty', href: '/warranty' },
    { label: 'Product enquiries', href: '/contact' },
  ] },
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h16m-6-6 6 6-6 6'} />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer id="site-footer" className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.intro}>
          <div>
            <h2 className={styles.headline}>Extraordinary surfaces.<br /><span>Lasting impressions.</span></h2>
          </div>
          <Link href="/contact" className={styles.cta}>Let’s talk Trionyx <Arrow diagonal /></Link>
        </div>

        <div className={styles.main}>
          <div className={styles.brand}>
            <Link href="/" aria-label="Trionyx home" className={styles.logo}>
              <TrionyxLogo variant="light" size="lg" priority={false} />
            </Link>
            <p>Advanced coatings and surface care.<br />Built around the details that matter.</p>
            <Link href="/#graphene" className={styles.brandLink}>Discover our products <Arrow /></Link>
          </div>

          {navigation.map((group) => (
            <nav key={group.title} aria-label={`Footer: ${group.title}`} className={styles.navigation}>
              <h3>{group.title}</h3>
              <ul>{group.links.map((link) => <li key={link.label}><Link href={link.href}>{link.label}</Link></li>)}</ul>
            </nav>
          ))}

          <div className={styles.contact}>
            <h3>Get in touch</h3>
            <a className={styles.email} href={companyContact.emailHref}>{companyContact.email}<Arrow diagonal /></a>
            <a className={styles.phone} href={companyContact.phoneHref}>{companyContact.phone}</a>
            <address>{companyContact.location.city}, {companyContact.location.region}<br />{companyContact.location.country}</address>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} Trionyx India Private Limited</p>
          <nav aria-label="Footer: Legal" className={styles.legal}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms &amp; Conditions</Link>
            <Link href="/cookies">Cookie Policy</Link>
          </nav>
        </div>
        <div className={styles.credit}>Technology &amp; digital partner <a href="https://growxlabs.tech/">GrowxLabs <Arrow diagonal /></a></div>
      </div>
    </footer>
  );
}
