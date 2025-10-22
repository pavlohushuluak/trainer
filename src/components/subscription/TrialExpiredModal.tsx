/**
 * @fileoverview Trial Expired Modal - Displays when user's free trial has expired
 * Automatically sets trial_confirm to true when modal opens
 * Shows professional notification about trial expiration and encourages user to subscribe
 * Sends email notification and redirects to homepage subscription cards
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from '@/hooks/useTranslations';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Crown, 
  Sparkles, 
  CheckCircle,
  MessageSquare,
  Camera,
  FileText,
  TrendingUp,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface TrialExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export const TrialExpiredModal = ({ isOpen, onClose, userEmail }: TrialExpiredModalProps) => {
  const { t } = useTranslations();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);

  // Update trial_confirm to true when modal opens and send email
  React.useEffect(() => {
    if (isOpen && !emailSent && userEmail) {
      console.log('🔔 Modal opened, updating trial_confirm and sending email...');
      
      const handleModalOpen = async () => {
        try {
          // Update trial_confirm to true immediately when modal shows
          console.log('🔄 Updating trial_confirm to true for user:', userEmail);
          
          const { error: updateError } = await supabase
            .from('subscribers')
            .update({ trial_confirm: true } as any)
            .eq('email', userEmail);

          if (updateError) {
            console.error('❌ Error updating trial_confirm:', updateError);
          } else {
            console.log('✅ trial_confirm updated to true successfully');
          }

          // Send email
          console.log('📧 Calling send-trial-expiration-email function with:', { userEmail });
          
          const { data, error } = await supabase.functions.invoke('send-trial-expiration-email', {
            body: { userEmail }
          });

          console.log('📧 Function response:', { data, error });

          if (error) {
            console.error('❌ Error sending trial expiration email:', error);
            throw error;
          }

          if (!data?.success) {
            console.error('❌ Function returned unsuccessful response:', data);
            throw new Error(data?.message || data?.error || 'Failed to send trial expiration email');
          }

          console.log('✅ Trial expiration email sent successfully:', data);
          setEmailSent(true);

          // Show subtle notification that email was sent
          toast({
            title: t('trialExpired.emailSent.title', 'Email Sent!'),
            description: t('trialExpired.emailSent.description', 'We have sent you details about continuing your training journey with our expert trainers.'),
            duration: 5000,
          });

        } catch (error: any) {
          console.error('❌ Error in modal open handler:', error);
          // Don't show error to user, email is secondary - they can still view plans
        }
      };

      handleModalOpen();
    }
  }, [isOpen, emailSent, userEmail, toast, t]);

  const handleViewPlansClick = () => {
    console.log('📊 User clicked Start Now button');
    
    // Close modal
    onClose();
    
    // Navigate to subscription section on /mein-tiertraining page
    navigate('/mein-tiertraining#subscription');
    
    // Scroll to subscription section after navigation
    setTimeout(() => {
      const subscriptionSection = document.getElementById('subscription');
      if (subscriptionSection) {
        subscriptionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleMaybeLater = () => {
    console.log('👋 User clicked Maybe Later, closing modal...');
    onClose();
  };

  const lostFeatures = [
    {
      icon: MessageSquare,
      title: t('trialExpired.features.expertChat.title', 'Unlimited Expert Chat'),
      description: t('trialExpired.features.expertChat.description', 'Get professional training advice from real trainers anytime')
    },
    {
      icon: FileText,
      title: t('trialExpired.features.trainingPlans.title', 'Personalized Training Plans'),
      description: t('trialExpired.features.trainingPlans.description', 'Custom plans created by professional trainers for your pet')
    },
    {
      icon: Camera,
      title: t('trialExpired.features.imageAnalysis.title', 'Photo Analysis'),
      description: t('trialExpired.features.imageAnalysis.description', 'Send photos and get expert behavior insights from trainers')
    },
    {
      icon: TrendingUp,
      title: t('trialExpired.features.progressTracking.title', 'Progress Tracking'),
      description: t('trialExpired.features.progressTracking.description', 'Track your pet\'s development with trainer guidance')
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0">
        <div className="relative w-full">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white p-8 rounded-t-lg">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 shadow-xl border-4 border-white/30">
                <Clock className="h-10 w-10 text-white" />
              </div>
              
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                  <AlertCircle className="h-8 w-8" />
                  {t('trialExpired.modal.title', 'Your Free Trial Has Ended')}
                </DialogTitle>
                <DialogDescription className="text-white/90 text-lg">
                  {t('trialExpired.modal.subtitle', 'Continue your pet\'s training journey with our professional trainers')}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* What you'll miss section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                {t('trialExpired.modal.featuresTitle', 'Premium Features You\'ll Miss:')}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {lostFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="flex gap-3 p-4 rounded-lg bg-card border-2 border-border"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-foreground mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Benefits of subscribing */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <Crown className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t('trialExpired.modal.subscribeTitle', 'Subscribe Now & Get:')}
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{t('trialExpired.modal.benefit1', 'Unlimited access to professional training support')}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{t('trialExpired.modal.benefit2', 'Personalized training plans created by expert trainers')}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{t('trialExpired.modal.benefit3', '24/7 access to professional trainer chat support')}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{t('trialExpired.modal.benefit4', 'Cancel anytime, no commitment')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Pricing preview */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-center border border-border">
              <p className="text-sm text-muted-foreground mb-2">
                {t('trialExpired.modal.priceInfo', 'Plans starting from')}
              </p>
              <div className="text-3xl font-bold text-primary">
                9,99€
                <span className="text-base text-muted-foreground font-normal ml-2">
                  {t('trialExpired.modal.perMonth', '/ month')}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleMaybeLater}
                className="flex-1 min-h-[44px] sm:min-h-[40px]"
              >
                {t('trialExpired.modal.maybeLater', 'Maybe Later')}
              </Button>
              <Button
                onClick={handleViewPlansClick}
                className="flex-1 min-h-[44px] sm:min-h-[40px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Crown className="h-5 w-5 mr-2" />
                {t('trialExpired.modal.startNow', 'Jetzt starten')}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>

            {/* Footer note */}
            <div className="mt-6 pt-4 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                {t('trialExpired.modal.footer', 'Continue training with expert guidance from professional trainers. Cancel anytime with our 14-day money-back guarantee.')}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

