'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import styles from './ContactSuccess.module.css';

export function ContactSuccess({ enquiryCode, onReset }: { enquiryCode: string; onReset: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }, []);

  return (
    <section className={styles.success} aria-labelledby="contact-success-heading">
      <div className={styles.topline}>
        <span>TRIONYX / CONTACT</span>
        <span className={styles.status}><span /> Enquiry received</span>
      </div>

      <div className={styles.artwork} aria-hidden="true">
        <div className={styles.orbit} />
        <Image src="/images/contact/enquiry-received.png" alt="" width={1024} height={1024} sizes="(max-width: 640px) 240px, 300px" className={styles.envelope} />
      </div>

      <div className={styles.content}>
        <h2 id="contact-success-heading" ref={headingRef} tabIndex={-1} className={styles.heading}>Message <span className="serif-accent">received.</span></h2>
        <p className={styles.description}>Thank you for reaching out. Our team will be in touch<br className={styles.desktopBreak} /> to help you with the next steps.</p>

        <div className={styles.receipt}>
          {enquiryCode && <div><span className={styles.label}>Your enquiry reference</span><strong className={styles.reference}>{enquiryCode}</strong></div>}
          <div><span className={styles.label}>What happens next</span><span className={styles.response}>A reply within 1–2 business days</span></div>
        </div>

        <div className={styles.actions}>
          <Link href="/#graphene" className={styles.primary}>Explore our products <span aria-hidden="true">↗</span></Link>
          <button type="button" onClick={onReset} className={styles.secondary}>Submit another enquiry <span aria-hidden="true">↗</span></button>
        </div>
      </div>
    </section>
  );
}
