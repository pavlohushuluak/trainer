
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ImpressumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImpressumModal = ({ isOpen, onClose }: ImpressumModalProps) => {
  const { t } = useTranslation();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden"
        aria-labelledby="impressum-modal-title"
        aria-describedby="impressum-modal-subtitle"
      >
        {/* Fixed Header */}
        <DialogHeader className="px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle 
                id="impressum-modal-title"
                className="text-2xl font-bold text-left"
              >
                {t('legal.impressum.title')}
              </DialogTitle>
              <p 
                id="impressum-modal-subtitle"
                className="text-muted-foreground mt-1"
              >
                {t('legal.impressum.subtitle')}
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
            <section>
              <h3 className="font-semibold mb-3">{t('legal.impressum.sections.responsible.title')}</h3>
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
              <h3 className="font-semibold mb-3">{t('legal.impressum.sections.general.title')}</h3>
              <p className="text-sm">
                {t('legal.impressum.sections.general.content')}
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-3">{t('legal.impressum.sections.dataTypes.title')}</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">{t('legal.impressum.sections.dataTypes.registration.title')}</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>{t('legal.impressum.sections.dataTypes.registration.firstName')}</li>
                    <li>{t('legal.impressum.sections.dataTypes.registration.email')}</li>
                    <li>{t('legal.impressum.sections.dataTypes.registration.petProfiles')}</li>
                    <li>{t('legal.impressum.sections.dataTypes.registration.password')}</li>
                    <li>{t('legal.impressum.sections.dataTypes.registration.chatHistory')}</li>
                    <li>{t('legal.impressum.sections.dataTypes.registration.trainingDocs')}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">{t('legal.impressum.sections.dataTypes.automatic.title')}</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
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
              <h3 className="font-semibold mb-3">{t('legal.impressum.sections.purposes.title')}</h3>
              <p className="text-sm mb-2">{t('legal.impressum.sections.purposes.intro')}</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                <li>{t('legal.impressum.sections.purposes.services')}</li>
                <li>{t('legal.impressum.sections.purposes.analysis')}</li>
                <li>{t('legal.impressum.sections.purposes.trainingPlans')}</li>
                <li>{t('legal.impressum.sections.purposes.platform')}</li>
                <li>{t('legal.impressum.sections.purposes.payment')}</li>
                <li>{t('legal.impressum.sections.purposes.legal')}</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-3">{t('legal.impressum.sections.legalBasis.title')}</h3>
              <p className="text-sm mb-2">{t('legal.impressum.sections.legalBasis.intro')}</p>
              <div className="space-y-2 text-sm">
                <p>{t('legal.impressum.sections.legalBasis.contract')}</p>
                <p>{t('legal.impressum.sections.legalBasis.consent')}</p>
                <p>{t('legal.impressum.sections.legalBasis.legitimateInterest')}</p>
                <p>{t('legal.impressum.sections.legalBasis.legalObligation')}</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-3">{t('legal.impressum.sections.paymentProviders.title')}</h3>
              <p className="text-sm mb-2">{t('legal.impressum.sections.paymentProviders.intro')}</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                <li>{t('legal.impressum.sections.paymentProviders.paypal')}</li>
                <li>{t('legal.impressum.sections.paymentProviders.stripe')}</li>
                <li>{t('legal.impressum.sections.paymentProviders.klarna')}</li>
                <li>{t('legal.impressum.sections.paymentProviders.applePay')}</li>
                <li>{t('legal.impressum.sections.paymentProviders.googlePay')}</li>
                <li>{t('legal.impressum.sections.paymentProviders.amazonPay')}</li>
              </ul>
              <p className="text-sm mt-2">{t('legal.impressum.sections.paymentProviders.note')}</p>
            </section>

            <section>
              <h3 className="font-semibold mb-3">{t('legal.impressum.sections.cookies.title')}</h3>
              <div className="space-y-2 text-sm">
                <p>{t('legal.impressum.sections.cookies.necessary')}</p>
                <p>{t('legal.impressum.sections.cookies.optional')}</p>
                <p>{t('legal.impressum.sections.cookies.withdrawal')}</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-3">{t('legal.impressum.sections.dataProcessing.title')}</h3>
              <div className="space-y-2 text-sm">
                <p>{t('legal.impressum.sections.dataProcessing.services')}</p>
                <p>{t('legal.impressum.sections.dataProcessing.noAdvertising')}</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-3">{t('legal.impressum.sections.storage.title')}</h3>
              <div className="space-y-2 text-sm">
                <p>{t('legal.impressum.sections.storage.duration')}</p>
                <p>{t('legal.impressum.sections.storage.deletion')}</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-3">{t('legal.impressum.sections.rights.title')}</h3>
              <p className="text-sm mb-2">{t('legal.impressum.sections.rights.intro')}</p>
              <div className="space-y-2 text-sm">
                <p>{t('legal.impressum.sections.rights.information')}</p>
                <p>{t('legal.impressum.sections.rights.correction')}</p>
                <p>{t('legal.impressum.sections.rights.deletion')}</p>
                <p>{t('legal.impressum.sections.rights.restriction')}</p>
                <p>{t('legal.impressum.sections.rights.portability')}</p>
                <p>{t('legal.impressum.sections.rights.objection')}</p>
                <p>{t('legal.impressum.sections.rights.contact')}: <a href="mailto:support@tiertrainer24.com" className="text-blue-600 hover:underline">support@tiertrainer24.com</a></p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-3">{t('legal.impressum.sections.security.title')}</h3>
              <p className="text-sm">{t('legal.impressum.sections.security.content')}</p>
            </section>

            <section>
              <h3 className="font-semibold mb-3">{t('legal.impressum.sections.ai.title')}</h3>
              <p className="text-sm">{t('legal.impressum.sections.ai.content')}</p>
            </section>

            <section>
              <h3 className="font-semibold mb-3">{t('legal.impressum.sections.changes.title')}</h3>
              <p className="text-sm">{t('legal.impressum.sections.changes.intro')}</p>
            </section>

            <section>
              <h3 className="font-semibold mb-3">{t('legal.impressum.sections.contact.title')}</h3>
              <div className="space-y-1 text-sm">
                <p>{t('legal.impressum.sections.contact.email')}: <a href="mailto:support@tiertrainer24.com" className="text-blue-600 hover:underline">support@tiertrainer24.com</a></p>
                <p>{t('legal.impressum.sections.contact.website1')}: <a href="https://www.tiertrainer24.com" className="text-blue-600 hover:underline">https://www.tiertrainer24.com</a></p>
                <p>{t('legal.impressum.sections.contact.website2')}: <a href="https://www.tiertrainer1.com" className="text-blue-600 hover:underline">https://www.tiertrainer1.com</a></p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-3">{t('legal.impressum.sections.registry.title')}</h3>
              <div className="space-y-1 text-sm">
                <p>{t('legal.impressum.sections.registry.registered')}</p>
                <p>{t('legal.impressum.sections.registry.court')}</p>
                <p>{t('legal.impressum.sections.registry.number')}</p>
              </div>
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
