
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';

interface AGBModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AGBModal = ({ isOpen, onClose }: AGBModalProps) => {
  const { t } = useTranslation();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('legal.agb.title')}</DialogTitle>
          <p className="text-muted-foreground">{t('legal.agb.subtitle')}</p>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            <section className="border-b pb-4">
              <div className="space-y-1 text-sm">
                <p className="font-medium">{t('legal.agb.company.name')}</p>
                <p>{t('legal.agb.company.address')}</p>
                <p>{t('legal.agb.company.ceo')}</p>
                <p>{t('legal.agb.company.email')}</p>
                <p>{t('legal.agb.company.website')}</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-2">{t('legal.agb.sections.scope.title')}</h3>
              <p className="text-sm">
                {t('legal.agb.sections.scope.content')}
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">{t('legal.agb.sections.services.title')}</h3>
              <p className="text-sm mb-2">{t('legal.agb.sections.services.description')}</p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>{t('legal.agb.sections.services.features.ai')}</li>
                <li>{t('legal.agb.sections.services.features.communication')}</li>
                <li>{t('legal.agb.sections.services.features.plans')}</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">{t('legal.agb.sections.registration.title')}</h3>
              <p className="text-sm">
                {t('legal.agb.sections.registration.content')}
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">{t('legal.agb.sections.contract.title')}</h3>
              <div className="text-sm space-y-2">
                <p>{t('legal.agb.sections.contract.binding')}</p>
                <div>
                  <p className="font-medium">{t('legal.agb.sections.contract.trial.title')} {t('legal.agb.sections.contract.trial.period')}</p>
                  <p>{t('legal.agb.sections.contract.autoRenewal')}</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-2">{t('legal.agb.sections.pricing.title')}</h3>
              <p className="text-sm">
                {t('legal.agb.sections.pricing.content')}
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">{t('legal.agb.sections.delivery.title')}</h3>
              <p className="text-sm">
                {t('legal.agb.sections.delivery.content')}
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">{t('legal.agb.sections.disclaimer.title')}</h3>
              <p className="text-sm">
                <strong>{t('legal.agb.sections.disclaimer.important')}</strong> {t('legal.agb.sections.disclaimer.content')}
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">{t('legal.agb.sections.license.title')}</h3>
              <p className="text-sm">
                {t('legal.agb.sections.license.content')}
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">{t('legal.agb.sections.availability.title')}</h3>
              <p className="text-sm">
                {t('legal.agb.sections.availability.content')}
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">{t('legal.agb.sections.cancellation.title')}</h3>
              <div className="text-sm space-y-2">
                <p><strong>{t('legal.agb.sections.cancellation.right')}</strong> {t('legal.agb.sections.cancellation.period.content')}</p>
                <p>{t('legal.agb.sections.cancellation.email')}</p>
                <p className="bg-accent/50 p-2 rounded">
                  <strong>{t('legal.agb.sections.cancellation.note.title')}</strong> {t('legal.agb.sections.cancellation.expiry')}
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-2">{t('legal.agb.sections.privacy.title')}</h3>
              <p className="text-sm">
                {t('legal.agb.sections.privacy.content')}
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">{t('legal.agb.sections.jurisdiction.title')}</h3>
              <p className="text-sm">
                {t('legal.agb.sections.jurisdiction.content')}
              </p>
            </section>

            <div className="text-xs text-muted-foreground text-center pt-4 border-t">
              {t('legal.agb.lastUpdated')}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
