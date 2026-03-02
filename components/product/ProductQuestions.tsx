"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { ProductFAQ } from "@/types";

interface ProductQuestionsProps {
  faqs: ProductFAQ[];
  productName: string;
}

/**
 * ProductQuestions - FAQ Section with FAQPage Schema
 *
 * Optimized for Google Featured Snippets and AI assistants.
 * Injected FAQPage JSON-LD schema helps rank for question-based queries.
 */
export function ProductQuestions({ faqs, productName }: ProductQuestionsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // L9: Don't render if no FAQs provided
  if (faqs.length === 0) {
    return null;
  }

  // JSON-LD FAQPage Schema for Featured Snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Visual Component */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 my-8">
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all"
              itemScope
              itemType="https://schema.org/Question"
              itemProp="mainEntity"
            >
              {/* Question Button */}
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-5 py-4 text-left flex items-center justify-between bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span
                  className="font-medium text-gray-900 dark:text-white pr-4"
                  itemProp="name"
                >
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                )}
              </button>

              {/* Answer Panel */}
              {openIndex === index && (
                <div
                  id={`faq-answer-${index}`}
                  className="px-5 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
                  itemScope
                  itemType="https://schema.org/Answer"
                  itemProp="acceptedAnswer"
                >
                  <p
                    className="text-gray-700 dark:text-gray-300 leading-relaxed"
                    itemProp="text"
                  >
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Have more questions?{" "}
            <a
              href="/contact"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
