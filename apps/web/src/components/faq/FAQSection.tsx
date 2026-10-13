import Link from 'next/link';
import styles from './FAQSection.module.css';

const questions = [
  {
    question: 'What products does Trionyx offer?',
    answer: (
      <>
        Trionyx offers automotive protection, coating, care and related product categories. Explore the Products section for the current range.
      </>
    ),
  },
  {
    question: 'How can I become a Trionyx dealer?',
    answer: (
      <>
        Use the <Link href="/contact">dealer enquiry option on the website</Link> to share your business details. The Trionyx team will review the enquiry and contact you regarding the next steps.
      </>
    ),
  },
  {
    question: 'How can I check product availability?',
    answer: (
      <>
        Product availability may vary by location and dealer network. Contact Trionyx or an authorized dealer for current availability.
      </>
    ),
  },
  {
    question: 'Where can I buy Trionyx products?',
    answer: (
      <>
        Trionyx products are available through its dealer and distribution network. Contact Trionyx to find the appropriate dealer or availability for your location.
      </>
    ),
  },
  {
    question: 'I am already a Trionyx dealer. How do I access my account?',
    answer: (
      <>
        Use <Link href="/dealer-access">Dealer Access</Link> to sign in to your authorized Trionyx dealer account.
      </>
    ),
  },
  {
    question: 'How can I contact Trionyx for product support or enquiries?',
    answer: (
      <>
        Use the <Link href="/contact">Contact page</Link> or the official Trionyx contact details provided on the website.
      </>
    ),
  },
];

export function FAQSection() {
  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-heading">
      <div className={`site-container ${styles.layout}`}>
        <div className={styles.intro}>
          <h2 id="faq-heading">Questions, answered</h2>
          <Link className="text-link" href="/contact">
            Ask a question <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className={styles.list}>
          {questions.map(({ question, answer }) => (
            <details key={question} className={styles.item} name="faq">
              <summary>
                <span>{question}</span>
                <span className={styles.icon} aria-hidden="true" />
              </summary>
              <p className={styles.answer}>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
