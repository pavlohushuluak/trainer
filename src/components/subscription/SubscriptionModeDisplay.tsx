
import { Badge } from "@/components/ui/badge";
import { Crown, Clock, Lock, Loader2 } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

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
          className: 'bg-muted text-muted-foreground'
        };
      
      case 'free':
        return {
          icon: <Lock className="h-4 w-4" />,
          label: t('subscription.modeDisplay.freeMode'),
          variant: 'secondary' as const,
          className: 'bg-muted text-muted-foreground border-border'
        };
      
      case 'trial':
        return {
          icon: <Clock className="h-4 w-4" />,
          label: t('subscription.modeDisplay.sevenDayTrial', { 
            endDate: trialEnd ? new Date(trialEnd).toLocaleDateString(currentLanguage === 'de' ? 'de-DE' : 'en-US') : ''
          }),
          variant: 'outline' as const,
          className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
        };
      
      case 'trial_expired':
        return {
          icon: <Clock className="h-4 w-4" />,
          label: t('subscription.modeDisplay.trialExpired'),
          variant: 'destructive' as const,
          className: 'bg-destructive/10 text-destructive border-destructive/20'
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
          className: 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary-foreground dark:border-primary/30'
        };
      
      default:
        return {
          icon: <Lock className="h-4 w-4" />,
          label: t('subscription.modeDisplay.unknown'),
          variant: 'secondary' as const,
          className: 'bg-muted text-muted-foreground'
        };
    }
  };

  const display = getModeDisplay();

  return (
    <Badge 
      variant={display.variant}
      className={cn(
        "flex items-center gap-1 text-xs font-medium transition-colors",
        display.className
      )}
    >
      {display.icon}
      {display.label}
    </Badge>
  );
};
