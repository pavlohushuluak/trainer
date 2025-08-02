
import { useState } from 'react';
import { LegalModal } from '@/components/legal/LegalModal';
import { useTranslations } from '@/hooks/useTranslations';

const AGB = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useTranslations();

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <LegalModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('legal.agb.title')}
      subtitle={t('legal.agb.subtitle')}
      autoOpen={true}
    >
      <div className="space-y-8">
        <section className="border-b pb-4">
          <div className="space-y-2">
            <p className="font-medium">{t('legal.agb.sections.company.name')}</p>
            <p>{t('legal.agb.sections.company.street')}</p>
            <p>{t('legal.agb.sections.company.city')}</p>
            <p>{t('legal.agb.sections.company.ceo')}</p>
            <p>{t('legal.agb.sections.company.email')}: <a href="mailto:support@tiertrainer24.com" className="text-blue-600 hover:underline">support@tiertrainer24.com</a></p>
            <p>{t('legal.agb.sections.company.web')}: <a href="https://www.tiertrainer24.com" className="text-blue-600 hover:underline">www.tiertrainer24.com</a>, <a href="https://www.tiertrainer1.com" className="text-blue-600 hover:underline">www.tiertrainer1.com</a></p>
            <p>{t('legal.agb.sections.company.vat')}</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.agb.sections.scope.title')}</h2>
          <p>
            {t('legal.agb.sections.scope.content')}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.agb.sections.services.title')}</h2>
          <p className="mb-3">
            {t('legal.agb.sections.services.intro')}
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('legal.agb.sections.services.aiAnalysis')}</li>
            <li>{t('legal.agb.sections.services.communication')}</li>
            <li>{t('legal.agb.sections.services.trainingPlans')}</li>
            <li>{t('legal.agb.sections.services.progressControl')}</li>
            <li>{t('legal.agb.sections.services.petProfiles')}</li>
          </ul>
          <p className="mt-3">
            {t('legal.agb.sections.services.availability')}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.agb.sections.registration.title')}</h2>
          <p>
            {t('legal.agb.sections.registration.content')}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.agb.sections.contract.title')}</h2>
          <p className="mb-3">
            {t('legal.agb.sections.contract.intro')}
          </p>
          <div className="space-y-3">
            <div>
              <h3 className="font-medium">{t('legal.agb.sections.contract.trial.title')}</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>{t('legal.agb.sections.contract.trial.period')}</li>
                <li>{t('legal.agb.sections.contract.trial.cancellation')}</li>
                <li>{t('legal.agb.sections.contract.trial.autoRenewal')}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium">{t('legal.agb.sections.contract.models.title')}</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>{t('legal.agb.sections.contract.models.monthly')}</li>
                <li>{t('legal.agb.sections.contract.models.semiAnnual')}</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.agb.sections.pricing.title')}</h2>
          <p className="mb-3">
            {t('legal.agb.sections.pricing.intro')}
          </p>
          <p className="mb-3">
            {t('legal.agb.sections.pricing.paymentMethods')}
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('legal.agb.sections.pricing.creditCard')}</li>
            <li>{t('legal.agb.sections.pricing.paypal')}</li>
            <li>{t('legal.agb.sections.pricing.klarna')}</li>
            <li>{t('legal.agb.sections.pricing.applePay')}</li>
            <li>{t('legal.agb.sections.pricing.googlePay')}</li>
            <li>{t('legal.agb.sections.pricing.amazonPay')}</li>
          </ul>
          <p className="mt-3">
            {t('legal.agb.sections.pricing.autoDebit')}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.agb.sections.delivery.title')}</h2>
          <p>
            {t('legal.agb.sections.delivery.content')}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.agb.sections.disclaimer.title')}</h2>
          <p className="mb-3">
            {t('legal.agb.sections.disclaimer.intro')}
          </p>
          <p>
            {t('legal.agb.sections.disclaimer.liability')}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.agb.sections.license.title')}</h2>
          <p>
            {t('legal.agb.sections.license.content')}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.agb.sections.availability.title')}</h2>
          <p>
            {t('legal.agb.sections.availability.content')}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.agb.sections.cancellation.title')}</h2>
          <h3 className="font-medium mb-2">{t('legal.agb.sections.cancellation.instruction')}</h3>
          <p className="mb-3">{t('legal.agb.sections.cancellation.right')}</p>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">{t('legal.agb.sections.cancellation.period.title')}</h4>
              <p>{t('legal.agb.sections.cancellation.period.content')}</p>
            </div>
            
            <div>
              <h4 className="font-medium">{t('legal.agb.sections.cancellation.exercise.title')}</h4>
              <p>{t('legal.agb.sections.cancellation.exercise.content')}</p>
            </div>
            
            <div className="bg-accent/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">{t('legal.agb.sections.cancellation.form.title')}</h4>
              <p className="text-sm mb-2">{t('legal.agb.sections.cancellation.form.subtitle')}</p>
              <div className="space-y-1 text-sm">
                <p>{t('legal.agb.sections.cancellation.form.company.name')}</p>
                <p>{t('legal.agb.sections.cancellation.form.company.street')}</p>
                <p>{t('legal.agb.sections.cancellation.form.company.city')}</p>
                <p>{t('legal.agb.sections.cancellation.form.company.email')}</p>
                <br />
                <p>{t('legal.agb.sections.cancellation.form.declaration')}</p>
                <p>{t('legal.agb.sections.cancellation.form.orderedOn')}</p>
                <p>{t('legal.agb.sections.cancellation.form.name')}</p>
                <p>{t('legal.agb.sections.cancellation.form.address')}</p>
                <p>{t('legal.agb.sections.cancellation.form.dateSignature')}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium">{t('legal.agb.sections.cancellation.note.title')}</h4>
              <p>
                {t('legal.agb.sections.cancellation.note.content')}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.agb.sections.privacy.title')}</h2>
          <p>
            {t('legal.agb.sections.privacy.content')}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.agb.sections.jurisdiction.title')}</h2>
          <div className="space-y-2">
            <p>{t('legal.agb.sections.jurisdiction.law')}</p>
            <p>{t('legal.agb.sections.jurisdiction.court')}</p>
            <p>{t('legal.agb.sections.jurisdiction.validity')}</p>
          </div>
        </section>

        <section className="border-t pt-4">
          <p className="text-sm text-muted-foreground text-center">
            {t('legal.agb.lastUpdated')}
          </p>
        </section>
      </div>
    </LegalModal>
  );
};

export default AGB;
