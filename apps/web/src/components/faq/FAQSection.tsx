'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SectionFrame } from '@/components/frame';
import styles from './FAQSection.module.css';
import { SectionEyebrow } from '../ui/SectionEyebrow';

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
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <SectionFrame id="faq" className={styles.section} hasBottomBorder={false} aria-labelledby="faq-heading">
      <div className={styles.layout}>
        <header className={styles.heading}>
          <SectionEyebrow>FAQ</SectionEyebrow>
          <h2 id="faq-heading">Questions about Trionyx.</h2>
        </header>

        <div className={styles.list}>
          {questions.map(({ question, answer }, index) => {
            const isOpen = openIndex === index;
            const questionId = `faq-question-${index + 1}`;
            const answerId = `faq-answer-${index + 1}`;

            return (
              <div className={styles.item} key={question}>
                <h3 className={styles.questionHeading}>
                  <button
                    className={styles.question}
                    id={questionId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    <span>{question}</span>
                    <span className={`${styles.icon} ${isOpen ? styles.iconOpen : ''}`} aria-hidden="true">{isOpen ? '−' : '+'}</span>
                  </button>
                </h3>
                <div
                  className={`${styles.answerMotion} ${isOpen ? styles.answerOpen : ''}`}
                  id={answerId}
                  role="region"
                  aria-labelledby={questionId}
                  aria-hidden={!isOpen}
                  inert={!isOpen}
                >
                  <div className={styles.answerClip}>
                    <p className={styles.answer}>{answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionFrame>
  );
}
