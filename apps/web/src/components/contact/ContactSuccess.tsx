'use client';

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
      <h2 id="contact-success-heading" ref={headingRef} tabIndex={-1} className={styles.heading}>
        Thank you. We&apos;ll be in touch shortly.
      </h2>

      <dl className={styles.receipt}>
        {enquiryCode && (
          <div>
            <dt>Reference</dt>
            <dd className={styles.reference}>{enquiryCode}</dd>
          </div>
        )}
        <div>
          <dt>What happens next</dt>
          <dd>A reply within 1–2 business days</dd>
        </div>
      </dl>

      <div className={styles.actions}>
        <Link href="/products" className="pill-button">
          Explore our products
        </Link>
        <button type="button" onClick={onReset} className="text-link">
          Send another enquiry
        </button>
      </div>
    </section>
  );
}
