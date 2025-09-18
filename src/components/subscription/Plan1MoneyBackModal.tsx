import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Heart, DollarSign, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';
import { useGTM } from '@/hooks/useGTM';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays } from 'date-fns';

interface Plan1MoneyBackModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionStart?: string;
  subscriptionTier?: string;
  userEmail?: string;
  onCancelSubscription: () => void;
}

export const Plan1MoneyBackModal = ({
  isOpen,
  onClose,
  subscriptionStart,
  subscriptionTier,
  userEmail,
  onCancelSubscription
}: Plan1MoneyBackModalProps) => {
  const { toast } = useToast();
  const { t } = useTranslations();
  const { trackSubscriptionCancel } = useGTM();
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate days remaining for money-back guarantee
  const daysRemaining = subscriptionStart 
    ? Math.max(0, 14 - differenceInDays(new Date(), new Date(subscriptionStart)))
    : 0;

  // Check if user is eligible for money-back guarantee
  const isEligibleForRefund = subscriptionTier === 'plan1' && daysRemaining > 0;

  const handleContinueUsing = () => {
    // Track that user chose to continue (not cancel)
    console.log('👍 User chose to continue using subscription');
    
    toast({
      title: t('subscription.plan1MoneyBack.continueUsing.title'),
      description: t('subscription.plan1MoneyBack.continueUsing.description'),
      duration: 5000,
    });
    
    onClose();
  };

  const handleRequestRefund = async () => {
    if (!isEligibleForRefund) {
      toast({
        title: t('subscription.plan1MoneyBack.error.notEligible.title'),
        description: t('subscription.plan1MoneyBack.error.notEligible.description'),
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('💰 Processing money-back guarantee refund for plan1 user...');
      
      // Call cancel-subscription with immediate refund
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          immediateRefund: true
        }
      });

      if (error) {
        console.error('Error processing refund:', error);
        throw error;
      }

      console.log('✅ Refund processed successfully:', data);

      // Track subscription cancellation with refund
      trackSubscriptionCancel(
        subscriptionTier || 'plan1',
        'tier1-monthly', // Plan1 is tier1
        'money_back_guarantee',
        true, // Immediate cancellation
        data?.refundAmount || 0
      );

      // Show success message
      toast({
        title: t('subscription.plan1MoneyBack.refund.success.title'),
        description: t('subscription.plan1MoneyBack.refund.success.description', { 
          refundAmount: data?.refundAmount ? (data.refundAmount / 100).toFixed(2) : '9.90'
        }),
        duration: 10000,
      });

      // Trigger parent cancellation callback
      onCancelSubscription();
      onClose();

    } catch (error) {
      console.error('Error requesting refund:', error);
      
      toast({
        title: t('subscription.plan1MoneyBack.error.refund.title'),
        description: t('subscription.plan1MoneyBack.error.refund.description'),
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isEligibleForRefund) {
    return null; // Don't show modal if not eligible
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-green-600" />
            {t('subscription.plan1MoneyBack.title')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Money-back guarantee info */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {t('subscription.plan1MoneyBack.guarantee.title')}
              </CardTitle>
              <CardDescription className="text-green-700">
                {t('subscription.plan1MoneyBack.guarantee.description', { days: daysRemaining })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">{t('subscription.plan1MoneyBack.guarantee.fullRefund')}</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{t('subscription.plan1MoneyBack.guarantee.processTime')}</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">{t('subscription.plan1MoneyBack.guarantee.emailConfirmation')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Two main options */}
          <div className="space-y-3">
            {/* Continue using option */}
            <Card className="border-blue-200 hover:border-blue-300 transition-colors cursor-pointer" 
                  onClick={handleContinueUsing}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Heart className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-800">
                      {t('subscription.plan1MoneyBack.options.continue.title')}
                    </h3>
                    <p className="text-sm text-blue-600">
                      {t('subscription.plan1MoneyBack.options.continue.description')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Request refund option */}
            <Card className="border-orange-200 hover:border-orange-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-800">
                      {t('subscription.plan1MoneyBack.options.refund.title')}
                    </h3>
                    <p className="text-sm text-orange-600">
                      {t('subscription.plan1MoneyBack.options.refund.description')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-4">
            <Button 
              onClick={handleContinueUsing}
              variant="default"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isProcessing}
            >
              <Heart className="h-4 w-4 mr-2" />
              {t('subscription.plan1MoneyBack.buttons.continueUsing')}
            </Button>
            
            <Button 
              onClick={handleRequestRefund}
              variant="outline"
              className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  {t('subscription.plan1MoneyBack.buttons.processing')}
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  {t('subscription.plan1MoneyBack.buttons.requestRefund')}
                </>
              )}
            </Button>
          </div>

          {/* Warning note */}
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-800">
                {t('subscription.plan1MoneyBack.warning.refundFinal')}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
