
import { useState } from 'react';
import { LegalModal } from '@/components/legal/LegalModal';
import { useTranslations } from '@/hooks/useTranslations';

const Datenschutz = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useTranslations();

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <LegalModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('legal.privacy.title')}
      subtitle={t('legal.privacy.subtitle')}
      autoOpen={true}
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.privacy.sections.responsible.title')}</h2>
          <div className="space-y-1">
            <p className="font-medium">{t('legal.privacy.sections.responsible.company')}</p>
            <p>{t('legal.privacy.sections.responsible.street')}</p>
            <p>{t('legal.privacy.sections.responsible.city')}</p>
            <p>{t('legal.privacy.sections.responsible.country')}</p>
            <p>{t('legal.privacy.sections.responsible.ceo')}</p>
            <p>{t('legal.privacy.sections.responsible.email')}: <a href="mailto:support@tiertrainer24.com" className="text-blue-600 hover:underline">support@tiertrainer24.com</a></p>
            <p>{t('legal.privacy.sections.responsible.web')}: <a href="https://www.tiertrainer24.com" className="text-blue-600 hover:underline">www.tiertrainer24.com</a>, <a href="https://www.tiertrainer1.com" className="text-blue-600 hover:underline">www.tiertrainer1.com</a></p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.privacy.sections.general.title')}</h2>
          <p>
            {t('legal.privacy.sections.general.content')}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.privacy.sections.dataTypes.title')}</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">{t('legal.privacy.sections.dataTypes.registration.title')}</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>{t('legal.privacy.sections.dataTypes.registration.firstName')}</li>
                <li>{t('legal.privacy.sections.dataTypes.registration.email')}</li>
                <li>{t('legal.privacy.sections.dataTypes.registration.petProfiles')}</li>
                <li>{t('legal.privacy.sections.dataTypes.registration.password')}</li>
                <li>{t('legal.privacy.sections.dataTypes.registration.chatHistory')}</li>
                <li>{t('legal.privacy.sections.dataTypes.registration.trainingDocs')}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">{t('legal.privacy.sections.dataTypes.automatic.title')}</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>{t('legal.privacy.sections.dataTypes.automatic.ipAddress')}</li>
                <li>{t('legal.privacy.sections.dataTypes.automatic.dateTime')}</li>
                <li>{t('legal.privacy.sections.dataTypes.automatic.browser')}</li>
                <li>{t('legal.privacy.sections.dataTypes.automatic.os')}</li>
                <li>{t('legal.privacy.sections.dataTypes.automatic.referrer')}</li>
                <li>{t('legal.privacy.sections.dataTypes.automatic.device')}</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.privacy.sections.purposes.title')}</h2>
          <p className="mb-2">{t('legal.privacy.sections.purposes.intro')}</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('legal.privacy.sections.purposes.services')}</li>
            <li>{t('legal.privacy.sections.purposes.analysis')}</li>
            <li>{t('legal.privacy.sections.purposes.trainingPlans')}</li>
            <li>{t('legal.privacy.sections.purposes.platform')}</li>
            <li>{t('legal.privacy.sections.purposes.payment')}</li>
            <li>{t('legal.privacy.sections.purposes.legal')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.privacy.sections.legalBasis.title')}</h2>
          <p className="mb-2">{t('legal.privacy.sections.legalBasis.intro')}</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('legal.privacy.sections.legalBasis.contract')}</li>
            <li>{t('legal.privacy.sections.legalBasis.consent')}</li>
            <li>{t('legal.privacy.sections.legalBasis.legitimateInterest')}</li>
            <li>{t('legal.privacy.sections.legalBasis.legalObligation')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.privacy.sections.paymentProviders.title')}</h2>
          <p className="mb-2">
            {t('legal.privacy.sections.paymentProviders.intro')}
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('legal.privacy.sections.paymentProviders.paypal')}</li>
            <li>{t('legal.privacy.sections.paymentProviders.stripe')}</li>
            <li>{t('legal.privacy.sections.paymentProviders.klarna')}</li>
            <li>{t('legal.privacy.sections.paymentProviders.applePay')}</li>
            <li>{t('legal.privacy.sections.paymentProviders.googlePay')}</li>
            <li>{t('legal.privacy.sections.paymentProviders.amazonPay')}</li>
          </ul>
          <p className="mt-2">
            {t('legal.privacy.sections.paymentProviders.note')}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.privacy.sections.cookies.title')}</h2>
          <div className="space-y-2">
            <p>
              {t('legal.privacy.sections.cookies.necessary')}
            </p>
            <p>
              {t('legal.privacy.sections.cookies.optional')}
            </p>
            <p>
              {t('legal.privacy.sections.cookies.withdrawal')}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.privacy.sections.dataProcessing.title')}</h2>
          <div className="space-y-2">
            <p>
              {t('legal.privacy.sections.dataProcessing.services')}
            </p>
            <p>
              {t('legal.privacy.sections.dataProcessing.noAdvertising')}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.privacy.sections.storage.title')}</h2>
          <div className="space-y-2">
            <p>
              {t('legal.privacy.sections.storage.duration')}
            </p>
            <p>
              {t('legal.privacy.sections.storage.deletion')}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.privacy.sections.rights.title')}</h2>
          <div className="space-y-2">
            <p className="mb-2">{t('legal.privacy.sections.rights.intro')}</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>{t('legal.privacy.sections.rights.information')}</li>
              <li>{t('legal.privacy.sections.rights.correction')}</li>
              <li>{t('legal.privacy.sections.rights.deletion')}</li>
              <li>{t('legal.privacy.sections.rights.restriction')}</li>
              <li>{t('legal.privacy.sections.rights.portability')}</li>
              <li>{t('legal.privacy.sections.rights.objection')}</li>
            </ul>
            <p className="mt-3">
              {t('legal.privacy.sections.rights.contact')}: <a href="mailto:support@tiertrainer24.com" className="text-blue-600 hover:underline">support@tiertrainer24.com</a>
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.privacy.sections.security.title')}</h2>
          <p>
            {t('legal.privacy.sections.security.content')}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.privacy.sections.ai.title')}</h2>
          <p>
            {t('legal.privacy.sections.ai.content')}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.privacy.sections.changes.title')}</h2>
          <div className="space-y-2">
            <p>
              {t('legal.privacy.sections.changes.intro')}
            </p>
            <p>
              👉 <a href="https://www.tiertrainer24.com/datenschutz" className="text-blue-600 hover:underline">www.tiertrainer24.com/datenschutz</a>
            </p>
          </div>
        </section>

        <section className="border-t pt-4">
          <p className="text-sm text-muted-foreground text-center">
            {t('legal.privacy.lastUpdated')}
          </p>
        </section>
      </div>
    </LegalModal>
  );
};

export default Datenschutz;
