
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';

interface ImpressumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImpressumModal = ({ isOpen, onClose }: ImpressumModalProps) => {
  const { t } = useTranslation();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('legal.impressum.title')}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            <section>
              <h3 className="font-semibold mb-3">{t('legal.impressum.sections.legalInfo.title')}</h3>
              <div className="space-y-1">
                <p className="font-medium">{t('legal.impressum.sections.legalInfo.company')}</p>
                <p>{t('legal.impressum.sections.legalInfo.street')}</p>
                <p>{t('legal.impressum.sections.legalInfo.city')}</p>
                <p>{t('legal.impressum.sections.legalInfo.country')}</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-3">{t('legal.impressum.sections.representation.title')}</h3>
              <p>{t('legal.impressum.sections.representation.ceo')}</p>
            </section>

            <section>
              <h3 className="font-semibold mb-3">{t('legal.impressum.sections.contact.title')}</h3>
              <div className="space-y-1">
                <p>{t('legal.impressum.sections.contact.email')}: <a href="mailto:support@tiertrainer24.com" className="text-blue-600 hover:underline">support@tiertrainer24.com</a></p>
                <p>{t('legal.impressum.sections.contact.website1')}: <a href="https://www.tiertrainer24.com" className="text-blue-600 hover:underline">https://www.tiertrainer24.com</a></p>
                <p>{t('legal.impressum.sections.contact.website2')}: <a href="https://www.tiertrainer1.com" className="text-blue-600 hover:underline">https://www.tiertrainer1.com</a></p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-3">{t('legal.impressum.sections.registry.title')}</h3>
              <div className="space-y-1">
                <p>{t('legal.impressum.sections.registry.registered')}</p>
                <p>{t('legal.impressum.sections.registry.court')}</p>
                <p>{t('legal.impressum.sections.registry.number')}</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-3">{t('legal.impressum.sections.responsible.title')}</h3>
              <div className="space-y-1">
                <p>{t('legal.impressum.sections.responsible.name')}</p>
                <p>{t('legal.impressum.sections.responsible.street')}</p>
                <p>{t('legal.impressum.sections.responsible.city')}</p>
                <p>{t('legal.impressum.sections.responsible.country')}</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-3">{t('legal.impressum.sections.dispute.title')}</h3>
              <div className="space-y-2">
                <p>{t('legal.impressum.sections.dispute.description')}</p>
                <p><a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://ec.europa.eu/consumers/odr/</a></p>
                <p>{t('legal.impressum.sections.dispute.emailInfo')}</p>
              </div>
            </section>

            <div className="text-xs text-muted-foreground text-center pt-4 border-t">
              {t('legal.impressum.lastUpdated')}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
