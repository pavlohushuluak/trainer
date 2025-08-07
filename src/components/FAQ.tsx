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
    <section id="faq" className="py-4 md:py-8 bg-secondary/30">
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

      <div className="container mx-auto px-4">
        <div className="text-center mb-4 md:mb-8">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            {t('faq.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary">
                  <h3>{faq.question}</h3>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
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
