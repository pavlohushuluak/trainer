
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Calendar, CreditCard, X, Heart, Shield } from "lucide-react";
import { format, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { useTranslation } from "react-i18next";

interface CheckoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  planName: string;
  monthlyPrice: string;
  sixMonthPrice?: string;
  isYearly: boolean;
  loading: boolean;
}

export const CheckoutConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  planName,
  monthlyPrice,
  sixMonthPrice,
  isYearly,
  loading
}: CheckoutConfirmationModalProps) => {
  const { t } = useTranslation();
  const trialEndDate = addDays(new Date(), 7);
  const price = isYearly && sixMonthPrice ? sixMonthPrice : monthlyPrice;
  const interval = isYearly ? t('pricing.confirmation.sixMonths') : t('pricing.confirmation.month');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-primary" />
            {t('pricing.confirmation.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Heute keine Zahlung */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-green-600" />
              <div>
                <div className="text-lg font-bold text-green-600">
                  {t('pricing.confirmation.todayFree')}
                </div>
                <div className="text-sm text-green-700">
                  {t('pricing.confirmation.sevenDaysFree')}
                </div>
              </div>
            </div>
          </div>

          {/* Plan Details */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">
              {t('pricing.confirmation.youStart')} {planName}
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-blue-600" />
                <span>{t('pricing.confirmation.trainingFor')} {planName === "1 Tier" ? "1 Tier" : planName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-blue-600" />
                <span>{t('pricing.confirmation.textVoiceImages')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-blue-600" />
                <span>{t('pricing.confirmation.individualPlans')}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <div className="font-medium text-orange-900">
                  {t('pricing.confirmation.subscriptionStarts')} {format(trialEndDate, "dd. MMMM yyyy", { locale: de })}
                </div>
                <div className="text-sm text-orange-700 mt-1">
                  {t('pricing.confirmation.thenPrice')} {price}€/{interval} • {t('pricing.confirmation.cancelBefore')}
                </div>
              </div>
            </div>
          </div>

          {/* Kündigung Info */}
          <div className="text-center text-xs text-gray-600 bg-gray-50 p-3 rounded">
            {t('pricing.confirmation.cancellationInfo')}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              {t('common.cancel')}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {loading ? t('pricing.confirmation.preparing') : t('pricing.confirmation.startFreeNow')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
