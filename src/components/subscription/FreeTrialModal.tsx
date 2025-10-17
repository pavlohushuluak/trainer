/**
 * @fileoverview Free Trial Modal - Displays when free user hasn't used their trial yet
 * Shows detailed information about the 7-day trial for Plan 1 and allows user to start it
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from '@/hooks/useTranslations';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Gift, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  Calendar,
  MessageSquare,
  Camera,
  FileText,
  TrendingUp,
  Loader2
} from 'lucide-react';

interface FreeTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrialStarted: () => void;
}

export const FreeTrialModal = ({ isOpen, onClose, onTrialStarted }: FreeTrialModalProps) => {
  const { t } = useTranslations();
  const { toast } = useToast();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartTrial = async () => {
    setIsStarting(true);
    
    try {
      console.log('🎁 Starting free trial...');
      
      const { data, error } = await supabase.functions.invoke('start-free-trial', {
        body: {}
      });

      if (error) {
        console.error('❌ Error starting trial:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.message || 'Failed to start trial');
      }

      console.log('✅ Trial started successfully:', data);

      // Show success message
      toast({
        title: t('trial.success.title', 'Trial Started!'),
        description: t('trial.success.description', 'Your 7-day free trial has been activated. Enjoy all Plan 1 features!'),
        duration: 5000,
      });

      // Notify parent component
      onTrialStarted();
      
      // Close modal
      onClose();

    } catch (error) {
      console.error('❌ Error starting trial:', error);
      toast({
        title: t('trial.error.title', 'Error'),
        description: t('trial.error.description', 'Failed to start trial. Please try again or contact support.'),
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsStarting(false);
    }
  };

  const trialFeatures = [
    {
      icon: MessageSquare,
      title: t('trial.features.unlimitedChat.title', 'Unlimited AI Chat'),
      description: t('trial.features.unlimitedChat.description', 'Ask as many training questions as you need')
    },
    {
      icon: FileText,
      title: t('trial.features.trainingPlans.title', 'Personalized Training Plans'),
      description: t('trial.features.trainingPlans.description', 'Get custom training plans for your pet')
    },
    {
      icon: Camera,
      title: t('trial.features.imageAnalysis.title', 'Image Analysis'),
      description: t('trial.features.imageAnalysis.description', 'Upload photos for behavior analysis')
    },
    {
      icon: TrendingUp,
      title: t('trial.features.progressTracking.title', 'Progress Tracking'),
      description: t('trial.features.progressTracking.description', 'Monitor your pets development over time')
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-6">
        <div className="relative w-full">
          {/* Gradient background */}
          <div className="absolute inset-0"></div>
          
          {/* Content */}
          <div className="relative">
            {/* Header with icon */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full mb-4 shadow-lg">
                <Gift className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground" />
              </div>
              
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-2xl sm:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                  <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary animate-pulse" />
                  {t('trial.modal.title', 'Start Your Free Trial')}
                  <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary animate-pulse" />
                </DialogTitle>
              </DialogHeader>
            </div>

            {/* Trial duration badge */}
            <div className="flex justify-center mb-6">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-base sm:text-lg px-4 py-2 gap-2">
                <Calendar className="h-5 w-5" />
                {t('trial.modal.duration', '7 Days Free Access')}
              </Badge>
            </div>

            {/* Features list */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold text-foreground text-center mb-4">
                {t('trial.modal.featuresTitle', 'What You Get:')}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trialFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="flex gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
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

            {/* Important notice */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
                    {t('trial.modal.notice.title', 'No automatic charges')}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {t('trial.modal.notice.description', 'After 7 days, you\'ll return to the free plan. No credit card required, no automatic billing.')}
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isStarting}
                className="flex-1 min-h-[44px] sm:min-h-[40px]"
              >
                {t('trial.modal.cancel', 'Maybe Later')}
              </Button>
              <Button
                onClick={handleStartTrial}
                disabled={isStarting}
                className="flex-1 min-h-[44px] sm:min-h-[40px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {t('trial.modal.starting', 'Starting Trial...')}
                  </>
                ) : (
                  <>
                    <Gift className="h-5 w-5 mr-2" />
                    {t('trial.modal.start', 'Start Free Trial')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

