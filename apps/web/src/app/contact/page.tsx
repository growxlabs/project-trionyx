import type { Metadata } from 'next';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { ContactForm } from '@/components/contact';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { companyContact } from '@/data/companyContact';
import styles from './contact.module.css';

export const metadata: Metadata = {
  title: 'Contact — Trionyx',
  description:
    'Get in touch with Trionyx for product enquiries, dealer opportunities, distribution partnerships, or product support.',
};

export default function ContactPage() {
  return (
    <PageFrame>
      <HeaderShell />
      <main className="flex flex-1 flex-col">
        <section className={`site-container ${styles.contact}`} aria-labelledby="contact-heading">
          <div className={styles.intro}>
            <h1 id="contact-heading">Talk to Trionyx.</h1>

            <dl className={styles.details}>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={companyContact.phoneHref}>{companyContact.phone}</a>
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={companyContact.emailHref}>{companyContact.email}</a>
                </dd>
              </div>
              <div>
                <dt>Office</dt>
                <dd>
                  {companyContact.location.city}, {companyContact.location.region}, {companyContact.location.country}
                </dd>
              </div>
              <div>
                <dt>Response time</dt>
                <dd>Usually within 1–2 business days. For urgent product support, call us directly.</dd>
              </div>
            </dl>
          </div>

          <div className={styles.form}>
            <ContactForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </PageFrame>
  );
}
