import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";

export const FAQ = () => {
  const { t } = useTranslations();

  const faqs = [
  {
    question: t('faq.questions.guarantee.question'),
    answer: t('faq.questions.guarantee.answer')
  },
  {
    question: t('faq.questions.animals.question'),
    answer: t('faq.questions.animals.answer')
  },
  {
    question: t('faq.questions.analysis.question'),
    answer: t('faq.questions.analysis.answer')
  },
  {
    question: t('faq.questions.success.question'),
    answer: t('faq.questions.success.answer')
  },
  {
    question: t('faq.questions.community.question'),
    answer: t('faq.questions.community.answer')
  },
  {
    question: t('faq.questions.pricing.question'),
    answer: t('faq.questions.pricing.answer')
  },
  {
    question: t('faq.questions.features.question'),
    answer: t('faq.questions.features.answer')
  },
  {
    question: t('faq.questions.devices.question'),
    answer: t('faq.questions.devices.answer')
  },
  {
    question: t('faq.questions.emergency.question'),
    answer: t('faq.questions.emergency.answer')
  }
];
  return (
    <section id="faq" className="pt-20 pb-4 bg-secondary/30">
      {/* Schema.org FAQ structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        })}
      </script>

      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 px-2 sm:px-0 leading-tight animate-fade-in-up">
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent animate-gradient-x">
              {t('faq.title')}
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-2 sm:px-4 leading-relaxed animate-fade-in-up delay-200">
            {t('faq.subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg sm:rounded-xl px-3 sm:px-4 md:px-6 animate-fade-in-up shadow-sm hover:shadow-md transition-shadow duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-3 sm:py-4 text-sm sm:text-base md:text-lg touch-manipulation">
                  <h3 className="leading-snug pr-2">{faq.question}</h3>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-xs sm:text-sm md:text-base pt-1 sm:pt-2 pb-3 sm:pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
