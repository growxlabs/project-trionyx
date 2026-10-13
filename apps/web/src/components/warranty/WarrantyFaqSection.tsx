import type { ReactNode } from 'react';
import Link from 'next/link';
import styles from '../faq/FAQSection.module.css';

interface FaqItem {
  question: string;
  answer: ReactNode;
}

const FAQS: FaqItem[] = [
  {
    question: 'When does my warranty become active?',
    answer:
      'Your warranty is officially activated by your authorized Trionyx detailing studio upon vehicle inspection and delivery. Activations typically reflect in the central registry within 24 hours of handover.',
  },
  {
    question: 'What should I do if my serial number is not recognized?',
    answer: (
      <>
        Confirm you entered all digits correctly in the format{' '}
        <code className="rounded-md bg-[rgba(236,231,222,0.08)] px-1.5 py-0.5 font-mono text-[0.875em] text-[var(--color-text)]">
          TRX-SN-YYYY-XXXX
        </code>
        . If your installation was recent, check with your installer to ensure the customer record was finalized in the dealer portal.
      </>
    ),
  },
  {
    question: 'Can I service my warranty at another Trionyx studio?',
    answer:
      'Yes. Trionyx warranty registrations are nationwide digital records. Any certified Trionyx partner studio across India can pull up your vehicle history for routine maintenance washes and decontaminations.',
  },
  {
    question: 'Is the warranty transferable if I sell my car?',
    answer:
      'Yes. Trionyx surface protection warranties remain attached to the vehicle identification number (VIN). The new owner can verify continuity through this portal provided recommended maintenance intervals were met.',
  },
];

export function WarrantyFaqSection() {
  return (
    <section className={styles.section} aria-labelledby="warranty-faq-heading">
      <div className={`site-container ${styles.layout}`}>
        <div className={styles.intro}>
          <h2 id="warranty-faq-heading">Warranty questions</h2>
          <Link className="text-link" href="/contact">
            Contact support <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className={styles.list}>
          {FAQS.map((faq) => (
            <details key={faq.question} className={styles.item} name="warranty-faq">
              <summary>
                <span>{faq.question}</span>
                <span className={styles.icon} aria-hidden="true" />
              </summary>
              <p className={styles.answer}>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
