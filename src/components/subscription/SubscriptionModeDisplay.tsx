
import { Badge } from "@/components/ui/badge";
import { Crown, Clock, Lock, Loader2 } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

interface SubscriptionModeDisplayProps {
  mode: string;
  subscriptionTier?: string;
  trialEnd?: string;
}

export const SubscriptionModeDisplay = ({ mode, subscriptionTier, trialEnd }: SubscriptionModeDisplayProps) => {
  const { t, currentLanguage } = useTranslations();
  
  const getModeDisplay = () => {
    switch (mode) {
      case 'loading':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          label: t('subscription.modeDisplay.loading'),
          variant: 'secondary' as const,
          className: 'bg-gray-100'
        };
      
      case 'free':
        return {
          icon: <Lock className="h-4 w-4" />,
          label: t('subscription.modeDisplay.freeMode'),
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-700'
        };
      
      case 'trial':
        return {
          icon: <Clock className="h-4 w-4" />,
          label: t('subscription.modeDisplay.sevenDayTrial', { 
            endDate: trialEnd ? new Date(trialEnd).toLocaleDateString(currentLanguage === 'de' ? 'de-DE' : 'en-US') : ''
          }),
          variant: 'outline' as const,
          className: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      
      case 'trial_expired':
        return {
          icon: <Clock className="h-4 w-4" />,
          label: t('subscription.modeDisplay.trialExpired'),
          variant: 'destructive' as const,
          className: 'bg-red-50 text-red-700'
        };
      
      case 'premium':
        const getTierDisplayName = (tier?: string) => {
          switch (tier) {
            case 'plan1': return t('subscription.modeDisplay.onePet');
            case 'plan2': return t('subscription.modeDisplay.twoPets');
            case 'plan3': return t('subscription.modeDisplay.threeFourPets');
            case 'plan4': return t('subscription.modeDisplay.fiveEightPets');
            case 'plan5': return t('subscription.modeDisplay.unlimited');
            default: return tier || t('subscription.modeDisplay.premium');
          }
        };
        
        return {
          icon: <Crown className="h-4 w-4" />,
          label: getTierDisplayName(subscriptionTier),
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      
      default:
        return {
          icon: <Lock className="h-4 w-4" />,
          label: t('subscription.modeDisplay.unknown'),
          variant: 'secondary' as const,
          className: 'bg-gray-100'
        };
    }
  };

  const display = getModeDisplay();

  return (
    <Badge 
      variant={display.variant}
      className={`flex items-center gap-1 text-xs ${display.className}`}
    >
      {display.icon}
      {display.label}
    </Badge>
  );
};
