export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const faqs: readonly FaqItem[] = [
  {
    id: 'faq-brands',
    question: 'Which brands are available through Lakshmi Distributions?',
    answer: 'Lakshmi Distributions currently showcases products from Azoom and Hoggon.',
  },
  {
    id: 'faq-categories',
    question: 'What product categories are available?',
    answer: 'The current catalogue includes LED Lamps, Sun Control Ceramic Window Film, Paint Protection Film and Shumoff Damping.',
  },
  {
    id: 'faq-enquiry',
    question: 'Can I enquire about a specific product?',
    answer: 'Yes. Open the product or category you are interested in and use the enquiry/contact option to share your requirement.',
  },
  {
    id: 'faq-stock',
    question: 'Are all products always available in stock?',
    answer: 'Availability may vary. Contact Lakshmi Distributions for the latest availability of a specific product.',
  },
  {
    id: 'faq-dealers',
    question: 'Can dealers or businesses contact Lakshmi Distributions for bulk requirements?',
    answer: 'Yes. Dealers and business customers can share their requirement through the contact or enquiry flow.',
  },
  {
    id: 'faq-specifications',
    question: 'Can I get product specifications and images before buying?',
    answer: 'Yes. Product pages can include approved specifications and images where catalogue information is available.',
  },
];
