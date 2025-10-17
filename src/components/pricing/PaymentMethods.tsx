
import { CreditCard, Smartphone, Shield } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export const PaymentMethods = () => {
  const { t } = useTranslations();
  return (
    <div className="text-center mt-6 sm:mt-8 mb-3 sm:mb-4 px-3 sm:px-4">
      <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 text-foreground">{t('pricing.paymentMethods.title')}</h3>
      <div className="flex justify-center items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 flex-wrap">
        <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200">
          <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">{t('pricing.paymentMethods.methods.creditCards')}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200">
          <svg className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-.551 3.585a.344.344 0 0 1-.341.29zm0 0"/>
            <path d="M23.576 7.936a.641.641 0 0 0-.735-.518c-.706.111-1.54.111-2.421.111h-2.19c-.524 0-.968.382-1.05.9l-.551 3.585a.344.344 0 0 1-.341.29H7.076"/>
          </svg>
          <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">{t('pricing.paymentMethods.methods.paypal')}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200">
          <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">{t('pricing.paymentMethods.methods.mobilePay')}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">{t('pricing.paymentMethods.methods.sslEncrypted')}</span>
        </div>
      </div>
      <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-3 sm:mt-4 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
        {t('pricing.paymentMethods.description')}
      </p>
    </div>
  );
};
