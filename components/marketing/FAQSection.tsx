"use client"

import { BlurReveal } from "@/components/auth/BlurReveal"
import { FAQAccordionItem } from "@/components/marketing/FAQAccordionItem"
import { faqs } from "@/assets/faqs/faqs"

export function FAQSection() {
  return (
    <section
      id="faq"
      className="faq-section scroll-mt-[5.5rem] bg-dheir-surface py-16 md:py-24"
      aria-labelledby="faq-heading"
    >
      <div className="marketing-container">
        <BlurReveal className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-dheir-blue">
            FAQ
          </p>
          <h2
            id="faq-heading"
            className="font-display mt-3 text-2xl font-bold tracking-tight text-dheir-ink md:text-[1.75rem]"
          >
            Questions importers ask
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-dheir-muted md:text-base">
            Clear answers on sourcing, shipping, timelines, and working with DHEIR
            from China to Nigeria.
          </p>
        </BlurReveal>

        <div className="faq-list mx-auto mt-10 max-w-3xl md:mt-12">
          {faqs.map((faq, index) => (
            <FAQAccordionItem
              key={faq.question}
              {...faq}
              defaultOpen={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
