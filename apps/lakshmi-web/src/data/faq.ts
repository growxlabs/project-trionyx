export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const faqs: readonly FaqItem[] = [
  {
    id: 'faq-brands',
    question: 'Which brands are available through Lakshmi Distributions?',
    answer: 'Lakshmi Distributions is the authorized national distributor for Aozoom premium automotive lighting and Hogonn advanced surface protection films, window films, and acoustic damping materials.',
  },
  {
    id: 'faq-categories',
    question: 'What product categories are available in the catalogue?',
    answer: 'Our current distribution catalogue includes high-performance Automotive LED Lamps, Sun Control Ceramic Window Films, Paint Protection Films (PPF), and Shumoff Acoustic Damping solutions.',
  },
  {
    id: 'faq-enquiry',
    question: 'How do I place a trade enquiry for a specific product?',
    answer: 'You can explore our product catalogue and click "Trade Enquiry" on any item, or contact our sales desk directly via the Contact page with your required part numbers and quantity.',
  },
  {
    id: 'faq-stock',
    question: 'Are all products available for immediate dispatch?',
    answer: 'Core fast-moving SKUs are maintained in ready stock at our central warehouse. Bulk quantities or specialized technical lines can be scheduled with priority fulfillment.',
  },
  {
    id: 'faq-dealers',
    question: 'Can new retailers or detailing studios apply for dealership?',
    answer: 'Yes. We actively onboard verified automotive accessory retailers, multi-brand workshops, and certified detailing studios across India with wholesale pricing and marketing support.',
  },
  {
    id: 'faq-specifications',
    question: 'Can I access technical data sheets and test specifications?',
    answer: 'Yes. Full technical specifications, lumen output curves, VLT percentages, thickness ratings, and dimensional diagrams are provided on product pages or on request.',
  },
  {
    id: 'faq-dispatch',
    question: 'What are the typical dispatch and transit timelines across India?',
    answer: 'Orders confirmed before 2:00 PM IST are processed and dispatched within 24 to 48 hours via express freight partners with end-to-end tracking to tier-1 and tier-2 hubs nationwide.',
  },
  {
    id: 'faq-authenticity',
    question: 'Are all products guaranteed genuine with manufacturer warranty?',
    answer: 'Yes. Every unit supplied through Lakshmi Distributions is 100% genuine, serial-tracked, and backed by manufacturer-authorized replacement and warranty coverage.',
  },
];
