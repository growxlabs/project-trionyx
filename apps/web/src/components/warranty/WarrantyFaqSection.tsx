'use client';

import React, { useState } from 'react';

interface FaqItem {
  question: string;
  answer: React.ReactNode;
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
        <code className="font-mono text-[12px] bg-[#EFECE3] text-[#F26522] px-1.5 py-0.5 rounded">
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="bg-transparent text-[#171714]" aria-labelledby="warranty-faq-heading">
      <div className="max-w-[860px] mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="mb-10 sm:mb-12">
          <div className="text-[11px] font-bold text-[#F26522] uppercase tracking-[0.14em] mb-2.5">
            FAQ
          </div>
          <h2
            id="warranty-faq-heading"
            className="text-[28px] sm:text-[36px] lg:text-[40px] font-semibold tracking-[-0.025em] text-[#171714] m-0 leading-[1.15]"
          >
            Frequently asked warranty questions.
          </h2>
        </div>

        <div className="border-t border-[rgba(23,23,20,0.10)]">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            const questionId = `warranty-faq-q-${index}`;
            const answerId = `warranty-faq-a-${index}`;

            return (
              <div
                key={faq.question}
                className="border-b border-[rgba(23,23,20,0.10)]"
              >
                <h3 className="m-0 p-0 font-normal">
                  <button
                    type="button"
                    id={questionId}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => handleToggle(index)}
                    className="w-full py-5 sm:py-6 flex items-center justify-between gap-4 text-left group focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F26522] focus-visible:outline-offset-4 rounded-sm transition-colors"
                  >
                    <span className="text-[17px] sm:text-[19px] font-medium sm:font-semibold text-[#171714] tracking-[-0.015em] leading-snug group-hover:text-[#F26522] transition-colors">
                      {faq.question}
                    </span>
                    <span className="shrink-0 flex items-center justify-center w-8 h-8 -mr-1">
                      <svg
                        className={`w-5 h-5 transition-transform duration-200 ease-out ${
                          isOpen
                            ? 'rotate-45 text-[#F26522]'
                            : 'text-[rgba(23,23,20,0.40)] group-hover:text-[#171714]'
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </span>
                  </button>
                </h3>

                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={questionId}
                  className={`grid transition-[grid-template-rows,opacity] duration-250 ease-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pb-6 sm:pb-7 pr-8 sm:pr-12 text-[15px] sm:text-[16px] text-[#68665F] leading-[1.65] max-w-[760px]">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
