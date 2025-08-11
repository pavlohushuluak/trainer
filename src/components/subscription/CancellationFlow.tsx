
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Gift, TrendingDown, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';

interface CancellationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onCancelSubscription: () => void;
  subscriptionEnd?: string;
}

type CancellationStep = 'feedback' | 'offer' | 'downgrade' | 'final';

export const CancellationFlow = ({ 
  isOpen, 
  onClose, 
  onCancelSubscription,
  subscriptionEnd 
}: CancellationFlowProps) => {
  const [step, setStep] = useState<CancellationStep>('feedback');
  const [feedbackReason, setFeedbackReason] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const { toast } = useToast();
  const { t } = useTranslations();

  const handleGratismonthAccept = () => {
    toast({
      title: t('admin.cancellationFlow.toasts.freeMonthActivated.title'),
      description: t('admin.cancellationFlow.toasts.freeMonthActivated.description')
    });
    onClose();
  };

  const handleDowngrade = () => {
    toast({
      title: t('admin.cancellationFlow.toasts.downgradeSuccessful.title'),
      description: t('admin.cancellationFlow.toasts.downgradeSuccessful.description')
    });
    onClose();
  };

  const handleFinalCancellation = () => {
    onCancelSubscription();
    toast({
      title: t('admin.cancellationFlow.toasts.subscriptionCancelled.title'),
      description: t('admin.cancellationFlow.toasts.subscriptionCancelled.description', { subscriptionEnd: subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString('de-DE') : 'Ablaufdatum' })
    });
    onClose();
  };

  const resetFlow = () => {
    setStep('feedback');
    setFeedbackReason('');
    setFeedbackText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetFlow}>
      <DialogContent className="max-w-md">
        {step === 'feedback' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                {t('admin.cancellationFlow.ui.feedback.title')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {t('admin.cancellationFlow.ui.feedback.description')}
              </p>
              
              <div className="space-y-3">
                <Select value={feedbackReason} onValueChange={setFeedbackReason}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.cancellationFlow.ui.feedback.reasonPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="too-little-use">{t('admin.cancellationFlow.ui.feedback.reasons.tooLittleUse')}</SelectItem>
                    <SelectItem value="too-expensive">{t('admin.cancellationFlow.ui.feedback.reasons.tooExpensive')}</SelectItem>
                    <SelectItem value="missing-feature">{t('admin.cancellationFlow.ui.feedback.reasons.missingFeature')}</SelectItem>
                    <SelectItem value="technical-issues">{t('admin.cancellationFlow.ui.feedback.reasons.technicalIssues')}</SelectItem>
                    <SelectItem value="other">{t('admin.cancellationFlow.ui.feedback.reasons.other')}</SelectItem>
                  </SelectContent>
                </Select>

                {feedbackReason === 'other' && (
                  <Textarea
                    placeholder={t('admin.cancellationFlow.ui.feedback.otherPlaceholder')}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="min-h-[80px]"
                  />
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  {t('admin.cancellationFlow.ui.feedback.cancel')}
                </Button>
                <Button 
                  onClick={() => setStep('offer')} 
                  disabled={!feedbackReason}
                  className="flex-1"
                >
                  {t('admin.cancellationFlow.ui.feedback.continue')}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'offer' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                {t('admin.cancellationFlow.ui.offer.title')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('admin.cancellationFlow.ui.offer.description') }}>
              </p>
              
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">{t('admin.cancellationFlow.ui.offer.freeMonthOffer.title')}</span>
                  </div>
                  <p className="text-sm text-green-700">
                    {t('admin.cancellationFlow.ui.offer.freeMonthOffer.description')}
                  </p>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-2 pt-4">
                <Button onClick={handleGratismonthAccept} className="w-full bg-green-600 hover:bg-green-700">
                  {t('admin.cancellationFlow.ui.offer.activateFreeMonth')}
                </Button>
                <Button variant="outline" onClick={() => setStep('downgrade')} className="w-full">
                  {t('admin.cancellationFlow.ui.offer.cancelAnyway')}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'downgrade' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-blue-500" />
                {t('admin.cancellationFlow.ui.downgrade.title')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {t('admin.cancellationFlow.ui.downgrade.description')}
              </p>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{t('admin.cancellationFlow.ui.downgrade.basicPackage.title')}</CardTitle>
                  <CardDescription>{t('admin.cancellationFlow.ui.downgrade.basicPackage.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="text-2xl font-bold text-blue-600">{t('admin.cancellationFlow.ui.downgrade.basicPackage.price')} <span className="text-sm font-normal text-muted-foreground">{t('admin.cancellationFlow.ui.downgrade.basicPackage.perMonth')}</span></div>
                    <div className="text-sm text-green-600 font-medium">{t('admin.cancellationFlow.ui.downgrade.basicPackage.save')}</div>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>{t('admin.cancellationFlow.ui.downgrade.basicPackage.features.chats')}</li>
                    <li>{t('admin.cancellationFlow.ui.downgrade.basicPackage.features.profile')}</li>
                    <li>{t('admin.cancellationFlow.ui.downgrade.basicPackage.features.plans')}</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-2 pt-4">
                <Button onClick={handleDowngrade} className="w-full bg-blue-600 hover:bg-blue-700">
                  {t('admin.cancellationFlow.ui.downgrade.switchToBasic')}
                </Button>
                <Button variant="outline" onClick={() => setStep('final')} className="w-full">
                  {t('admin.cancellationFlow.ui.downgrade.cancelAnyway')}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'final' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                {t('admin.cancellationFlow.ui.final.title')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center space-y-3">
                <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('admin.cancellationFlow.ui.final.description', { subscriptionEnd: subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString('de-DE') : 'Ablaufdatum' }) }}>
                </p>
                <p className="text-lg">
                  {t('admin.cancellationFlow.ui.final.message')}
                </p>
              </div>
              
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-purple-700 text-center">
                    {t('admin.cancellationFlow.ui.final.info.email')}<br/>
                    {t('admin.cancellationFlow.ui.final.info.reminder')}
                  </p>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-2 pt-4">
                <Button onClick={handleFinalCancellation} variant="destructive" className="w-full">
                  {t('admin.cancellationFlow.ui.final.cancelFinally')}
                </Button>
                <Button variant="outline" onClick={resetFlow} className="w-full">
                  {t('admin.cancellationFlow.ui.final.dontCancel')}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
