import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const faqsData = [
  {
    q: "How do I choose the correct size?",
    a: "We provide an interactive size chart on all product detail pages. Since many of our luxury ethnic sets have a comfort fit, we recommend selecting your exact bust measurement. For western wear maxis, go with your standard size."
  },
  {
    q: "Do you offer blouse stitching customizations?",
    a: "Yes! All our sarees come with premium unstitched blouse fabric. Once you place an order, you can contact our concierge support with your custom measurements, and our boutique tailors will custom-stitch the blouse for an additional nominal charge."
  },
  {
    q: "What is your return and exchange policy?",
    a: "We offer a 14-day hassle-free return and exchange policy on all unworn items with tags intact. Please note that wedding collections and custom-stitched blouse orders are final sale and cannot be returned."
  },
  {
    q: "How long does shipping take?",
    a: "Standard shipping takes 3-7 business days within the country. International shipments take 7-14 business days. Custom tailored garments will require an additional 5-7 stitching days before dispatch."
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-16 text-center">
        <span className="text-[10px] font-bold tracking-widest text-brand-blush-dark uppercase">Support Concierge</span>
        <h1 className="font-serif text-3xl font-bold mt-2 text-brand-charcoal dark:text-white">Frequently Asked Questions</h1>
        <div className="h-0.5 w-16 bg-brand-blush-dark mx-auto mt-4"></div>
      </div>

      <div className="space-y-4">
        {faqsData.map((faq, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-brand-charcoal/20 rounded-2xl border border-brand-beige-dark/15 overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => toggleFAQ(idx)}
              className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
            >
              <span className="font-serif text-xs sm:text-sm font-bold text-brand-charcoal dark:text-white">{faq.q}</span>
              {openIndex === idx ? <FiChevronUp className="text-brand-blush-dark" /> : <FiChevronDown className="text-brand-blush-dark" />}
            </button>

            {openIndex === idx && (
              <div className="px-6 pb-6 pt-1 border-t border-brand-beige-dark/10">
                <p className="text-xs text-brand-charcoal/70 dark:text-brand-cream-light/70 leading-relaxed font-light">
                  {faq.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
