
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';

interface WiderrufsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WiderrufsModal = ({ isOpen, onClose }: WiderrufsModalProps) => {
  const { t } = useTranslation();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{t('legal.cancellation.title')}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold mb-2">{t('legal.cancellation.sections.right.title')}</h3>
              <p>{t('legal.cancellation.sections.right.content')}</p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">{t('legal.cancellation.sections.period.title')}</h3>
              <p>{t('legal.cancellation.sections.period.content')}</p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">{t('legal.cancellation.sections.exercise.title')}</h3>
              <p className="mb-2">{t('legal.cancellation.sections.exercise.description')}</p>
              <div className="bg-accent/50 p-3 rounded">
                <p className="font-medium">{t('legal.cancellation.sections.exercise.company.name')}</p>
                <p>{t('legal.cancellation.sections.exercise.company.street')}</p>
                <p>{t('legal.cancellation.sections.exercise.company.city')}</p>
                <p>{t('legal.cancellation.sections.exercise.company.email')}</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-2">{t('legal.cancellation.sections.form.title')}</h3>
              <div className="bg-gray-50 p-4 rounded border">
                <p className="mb-3">{t('legal.cancellation.sections.form.description')}</p>
                <div className="space-y-2">
                  <p>{t('legal.cancellation.sections.form.to')}</p>
                  <p>{t('legal.cancellation.sections.form.email')}</p>
                  <br />
                  <p>{t('legal.cancellation.sections.form.declaration')}</p>
                  <p>_________________________________</p>
                  <p>{t('legal.cancellation.sections.form.orderedOn')}: ___________________</p>
                  <p>{t('legal.cancellation.sections.form.consumerName')}: ___________________</p>
                  <p>{t('legal.cancellation.sections.form.consumerAddress')}: ___________________</p>
                  <p>{t('legal.cancellation.sections.form.consumerSignature')}: ___________________</p>
                  <p>{t('legal.cancellation.sections.form.date')}: ___________________</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-2">{t('legal.cancellation.sections.consequences.title')}</h3>
              <p>{t('legal.cancellation.sections.consequences.content')}</p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">{t('legal.cancellation.sections.expiry.title')}</h3>
              <p className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <strong>{t('legal.cancellation.sections.expiry.important')}</strong> {t('legal.cancellation.sections.expiry.content')}
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
