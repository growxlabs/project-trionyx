import Link from 'next/link';
import { companyContact } from '@/data/companyContact';
import styles from './SiteFooter.module.css';

const navigation = [
  {
    title: 'Explore',
    links: [
      { label: 'Our products', href: '/#graphene' },
      { label: 'About Trionyx', href: '/#about' },
      { label: 'Contact us', href: '/contact' },
    ],
  },
  {
    title: 'Partners & support',
    links: [
      { label: 'Distributor access', href: '/dealer-access' },
      { label: 'Warranty', href: '/warranty' },
      { label: 'Product enquiries', href: '/contact' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer id="site-footer" className={styles.footer}>
      <div className={`site-container ${styles.grid}`}>
        <div className={styles.brand}>
          <p className={styles.tagline}>
            Extraordinary surfaces. <span>Lasting impressions.</span>
          </p>
        </div>

        {navigation.map((group) => (
          <nav key={group.title} aria-label={`Footer: ${group.title}`} className={styles.column}>
            <h2>{group.title}</h2>
            <ul>
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className={styles.column}>
          <h2>Get in touch</h2>
          <ul>
            <li>
              <a href={companyContact.emailHref}>{companyContact.email}</a>
            </li>
            <li>
              <a href={companyContact.phoneHref}>{companyContact.phone}</a>
            </li>
          </ul>
          <address>
            {companyContact.location.city}, {companyContact.location.region}, {companyContact.location.country}
          </address>
        </div>
      </div>

      <div className={styles.wordmark} aria-hidden="true">
        <div className="site-container">
          <span>Trionyx</span>
        </div>
      </div>

      <div className={`site-container ${styles.bottom}`}>
        <p>© {new Date().getFullYear()} Trionyx India Private Limited</p>
        <nav aria-label="Footer: Legal" className={styles.legal}>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/cookies">Cookies</Link>
        </nav>
        <p>
          Technology &amp; digital partner: <a href="https://growxlabs.tech/">GrowxLabs</a>
        </p>
      </div>
    </footer>
  );
}
