
import { useState, useEffect } from 'react';
import { LegalModal } from '@/components/legal/LegalModal';
import { useTranslations } from '@/hooks/useTranslations';

const Impressum = () => {
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
          <h2 className="text-xl font-semibold mb-3">{t('legal.impressum.sections.legalInfo.title')}</h2>
          <div className="space-y-1">
            <p className="font-medium">{t('legal.impressum.sections.legalInfo.company')}</p>
            <p>{t('legal.impressum.sections.legalInfo.street')}</p>
            <p>{t('legal.impressum.sections.legalInfo.city')}</p>
            <p>{t('legal.impressum.sections.legalInfo.country')}</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.impressum.sections.representation.title')}</h2>
          <p>{t('legal.impressum.sections.representation.ceo')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.impressum.sections.vat.title')}</h2>
          <p>{t('legal.impressum.sections.vat.number')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.impressum.sections.contact.title')}</h2>
          <div className="space-y-1">
            <p>{t('legal.impressum.sections.contact.email')}: <a href="mailto:support@tiertrainer24.com" className="text-blue-600 hover:underline">support@tiertrainer24.com</a></p>
            <p>{t('legal.impressum.sections.contact.website1')}: <a href="https://www.tiertrainer24.com" className="text-blue-600 hover:underline">https://www.tiertrainer24.com</a></p>
            <p>{t('legal.impressum.sections.contact.website2')}: <a href="https://www.tiertrainer1.com" className="text-blue-600 hover:underline">https://www.tiertrainer1.com</a></p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.impressum.sections.registry.title')}</h2>
          <div className="space-y-1">
            <p>{t('legal.impressum.sections.registry.registered')}</p>
            <p>{t('legal.impressum.sections.registry.court')}</p>
            <p>{t('legal.impressum.sections.registry.number')}</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.impressum.sections.responsible.title')}</h2>
          <div className="space-y-1">
            <p>{t('legal.impressum.sections.responsible.name')}</p>
            <p>{t('legal.impressum.sections.responsible.street')}</p>
            <p>{t('legal.impressum.sections.responsible.city')}</p>
            <p>{t('legal.impressum.sections.responsible.country')}</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('legal.impressum.sections.dispute.title')}</h2>
          <div className="space-y-2">
            <p>{t('legal.impressum.sections.dispute.description')}</p>
            <p><a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://ec.europa.eu/consumers/odr/</a></p>
            <p>{t('legal.impressum.sections.dispute.emailInfo')}</p>
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

export default Impressum;
