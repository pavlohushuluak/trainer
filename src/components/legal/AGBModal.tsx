
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AGBModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AGBModal = ({ isOpen, onClose }: AGBModalProps) => {
  const { t } = useTranslation();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden"
        aria-labelledby="agb-modal-title"
        aria-describedby="agb-modal-subtitle"
      >
        {/* Fixed Header */}
        <DialogHeader className="px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle 
                id="agb-modal-title"
                className="text-2xl font-bold text-left"
              >
                {t('legal.agb.title')}
              </DialogTitle>
              <p 
                id="agb-modal-subtitle"
                className="text-muted-foreground mt-1"
              >
                {t('legal.agb.subtitle')}
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              aria-label={t('legal.close')}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{t('legal.close')}</span>
            </Button>
          </div>
        </DialogHeader>
        
        {/* Scrollable Content */}
        <ScrollArea className="flex-1 max-h-[calc(90vh-120px)]">
          <div className="px-6 py-6 space-y-6">
            <section className="border-b pb-4">
              <div className="space-y-1 text-sm">
                <p className="font-medium">{t('legal.agb.company.name')}</p>
                <p>{t('legal.agb.company.address')}</p>
                <p>{t('legal.agb.company.ceo')}</p>
                <p>{t('legal.agb.company.email')}: <a href="mailto:support@tiertrainer24.com" className="text-blue-600 hover:underline">support@tiertrainer24.com</a></p>
                <p>{t('legal.agb.company.website')}: <a href="https://www.tiertrainer24.com" className="text-blue-600 hover:underline">www.tiertrainer24.com</a>, <a href="https://www.tiertrainer1.com" className="text-blue-600 hover:underline">www.tiertrainer1.com</a></p>
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
                <p>{t('legal.agb.sections.cancellation.right')}</p>
                <p>{t('legal.agb.sections.cancellation.email')}</p>
                <p>{t('legal.agb.sections.cancellation.expiry')}</p>
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
          </div>
        </ScrollArea>
        
        {/* Fixed Footer with Close Button */}
        <div className="px-6 py-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex justify-end">
            <Button 
              onClick={onClose} 
              variant="outline"
              aria-label={t('legal.close')}
            >
              {t('legal.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
