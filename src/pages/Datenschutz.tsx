
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
      title={t('legal.impressum.title')}
      subtitle={t('legal.impressum.subtitle')}
      autoOpen={true}
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.impressum.sections.responsible.title')}</h2>
          <div className="space-y-1">
            <p className="font-medium">{t('legal.impressum.sections.responsible.company')}</p>
            <p>{t('legal.impressum.sections.responsible.street')}</p>
            <p>{t('legal.impressum.sections.responsible.city')}</p>
            <p>{t('legal.impressum.sections.responsible.country')}</p>
            <p>{t('legal.impressum.sections.responsible.ceo')}</p>
            <p>{t('legal.impressum.sections.responsible.email')}: <a href="mailto:support@tiertrainer24.com" className="text-blue-600 hover:underline">support@tiertrainer24.com</a></p>
            <p>{t('legal.impressum.sections.responsible.web')}: <a href="https://www.tiertrainer24.com" className="text-blue-600 hover:underline">www.tiertrainer24.com</a>, <a href="https://www.tiertrainer1.com" className="text-blue-600 hover:underline">www.tiertrainer1.com</a></p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.impressum.sections.general.title')}</h2>
          <p>
            {t('legal.impressum.sections.general.content')}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.impressum.sections.dataTypes.title')}</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">{t('legal.impressum.sections.dataTypes.registration.title')}</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>{t('legal.impressum.sections.dataTypes.registration.firstName')}</li>
                <li>{t('legal.impressum.sections.dataTypes.registration.email')}</li>
                <li>{t('legal.impressum.sections.dataTypes.registration.petProfiles')}</li>
                <li>{t('legal.impressum.sections.dataTypes.registration.password')}</li>
                <li>{t('legal.impressum.sections.dataTypes.registration.chatHistory')}</li>
                <li>{t('legal.impressum.sections.dataTypes.registration.trainingDocs')}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">{t('legal.impressum.sections.dataTypes.automatic.title')}</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>{t('legal.impressum.sections.dataTypes.automatic.ipAddress')}</li>
                <li>{t('legal.impressum.sections.dataTypes.automatic.dateTime')}</li>
                <li>{t('legal.impressum.sections.dataTypes.automatic.browser')}</li>
                <li>{t('legal.impressum.sections.dataTypes.automatic.os')}</li>
                <li>{t('legal.impressum.sections.dataTypes.automatic.referrer')}</li>
                <li>{t('legal.impressum.sections.dataTypes.automatic.device')}</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.impressum.sections.purposes.title')}</h2>
          <p className="mb-2">{t('legal.impressum.sections.purposes.intro')}</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('legal.impressum.sections.purposes.services')}</li>
            <li>{t('legal.impressum.sections.purposes.analysis')}</li>
            <li>{t('legal.impressum.sections.purposes.trainingPlans')}</li>
            <li>{t('legal.impressum.sections.purposes.platform')}</li>
            <li>{t('legal.impressum.sections.purposes.payment')}</li>
            <li>{t('legal.impressum.sections.purposes.legal')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.impressum.sections.legalBasis.title')}</h2>
          <p className="mb-2">{t('legal.impressum.sections.legalBasis.intro')}</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('legal.impressum.sections.legalBasis.contract')}</li>
            <li>{t('legal.impressum.sections.legalBasis.consent')}</li>
            <li>{t('legal.impressum.sections.legalBasis.legitimateInterest')}</li>
            <li>{t('legal.impressum.sections.legalBasis.legalObligation')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.impressum.sections.paymentProviders.title')}</h2>
          <p className="mb-2">
            {t('legal.impressum.sections.paymentProviders.intro')}
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('legal.impressum.sections.paymentProviders.paypal')}</li>
            <li>{t('legal.impressum.sections.paymentProviders.stripe')}</li>
            <li>{t('legal.impressum.sections.paymentProviders.klarna')}</li>
            <li>{t('legal.impressum.sections.paymentProviders.applePay')}</li>
            <li>{t('legal.impressum.sections.paymentProviders.googlePay')}</li>
            <li>{t('legal.impressum.sections.paymentProviders.amazonPay')}</li>
          </ul>
          <p className="mt-2">
            {t('legal.impressum.sections.paymentProviders.note')}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.impressum.sections.cookies.title')}</h2>
          <div className="space-y-2">
            <p>
              {t('legal.impressum.sections.cookies.necessary')}
            </p>
            <p>
              {t('legal.impressum.sections.cookies.optional')}
            </p>
            <p>
              {t('legal.impressum.sections.cookies.withdrawal')}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.impressum.sections.dataProcessing.title')}</h2>
          <div className="space-y-2">
            <p>
              {t('legal.impressum.sections.dataProcessing.services')}
            </p>
            <p>
              {t('legal.impressum.sections.dataProcessing.noAdvertising')}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.impressum.sections.storage.title')}</h2>
          <div className="space-y-2">
            <p>
              {t('legal.impressum.sections.storage.duration')}
            </p>
            <p>
              {t('legal.impressum.sections.storage.deletion')}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.impressum.sections.rights.title')}</h2>
          <div className="space-y-2">
            <p className="mb-2">{t('legal.impressum.sections.rights.intro')}</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>{t('legal.impressum.sections.rights.information')}</li>
              <li>{t('legal.impressum.sections.rights.correction')}</li>
              <li>{t('legal.impressum.sections.rights.deletion')}</li>
              <li>{t('legal.impressum.sections.rights.restriction')}</li>
              <li>{t('legal.impressum.sections.rights.portability')}</li>
              <li>{t('legal.impressum.sections.rights.objection')}</li>
            </ul>
            <p className="mt-3">
              {t('legal.impressum.sections.rights.contact')}: <a href="mailto:support@tiertrainer24.com" className="text-blue-600 hover:underline">support@tiertrainer24.com</a>
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.impressum.sections.security.title')}</h2>
          <p>
            {t('legal.impressum.sections.security.content')}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.impressum.sections.ai.title')}</h2>
          <p>
            {t('legal.impressum.sections.ai.content')}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.impressum.sections.changes.title')}</h2>
          <div className="space-y-2">
            <p>
              {t('legal.impressum.sections.changes.intro')}
            </p>
            <p>
              👉 <a href="https://www.tiertrainer24.com/datenschutz" className="text-blue-600 hover:underline">www.tiertrainer24.com/datenschutz</a>
            </p>
          </div>
        </section>

        <section className="border-t pt-4">
          <p className="text-sm text-muted-foreground text-center">
            {t('legal.impressum.lastUpdated')}
          </p>
        </section>
      </div>
    </LegalModal>
  );
};

export default Datenschutz;
