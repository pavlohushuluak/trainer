
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, History, HelpCircle, Heart, Home, ArrowLeft, Shield, Mail } from 'lucide-react';
import { TicketHistory } from '@/components/support/TicketHistory';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAuthOperations } from '@/hooks/auth/useAuthOperations';
import { AuthErrorDisplay } from '@/components/auth/AuthErrorDisplay';
import { useStickyHeader } from '@/hooks/useStickyHeader';
import { cn } from '@/lib/utils';
import { SupportChat } from '@/components/support/SupportChat';
import { ManualSupportModal } from '@/components/support/ManualSupportModal';
import { useTranslations } from '@/hooks/useTranslations';
import { usePetProfiles } from '@/hooks/usePetProfiles';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { requestCache } from '@/utils/requestCache';
import { useGTM } from '@/hooks/useGTM';

const Support = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { signOut } = useAuthOperations();
  const { isScrolled } = useStickyHeader();
  const { t } = useTranslations();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isManualSupportOpen, setIsManualSupportOpen] = useState(false);
  const { fetchTickets } = useSupportTickets();
  const { trackSupportChatStart, trackSupportFAQClick } = useGTM();
  
  // Wrapper function that clears cache before fetching tickets
  const refreshTickets = useCallback(async () => {
    // Clear the cache to ensure fresh data
    requestCache.clear();
    await fetchTickets();
  }, [fetchTickets]);

  const {
    pets,
    loading: petsLoading,
    error: petsError,
    primaryPet,
    isInitialized: petsInitialized,
    fetchPets
  } = usePetProfiles();

  // Debug pet data fetching
  console.log('🎯 SUPPORT PAGE PET DATA DEBUG:', {
    loading,
    user: !!user,
    userId: user?.id,
    petsLoading,
    pets: pets ? pets.length : 'undefined',
    petsError,
    isInitialized: petsInitialized,
    petsData: pets,
    timestamp: new Date().toISOString()
  });

  // Manual fetch if needed
  React.useEffect(() => {
    if (user?.id && !petsLoading && (!pets || pets.length === 0) && !petsError) {
      console.log('🔐 Support: Manually triggering pet fetch');
      fetchPets();
    }
  }, [user?.id, petsLoading, pets, petsError, fetchPets]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">

      {/* Auth Error Display */}
      <AuthErrorDisplay />

      {/* Main Content */}
      <div className="flex-1 p-3 sm:p-4 lg:p-6 xl:p-8">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">

          {/* Hero Section */}
          <div className="text-center space-y-2 sm:space-y-3 lg:space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-primary/10 rounded-full mb-2 sm:mb-3 lg:mb-4">
              <Shield className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              {t('support.title')}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-3 sm:px-0">
              {t('support.subtitle')}
            </p>
          </div>

          {/* Support Options */}
          <div className="grid md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border hover:border-primary/20 bg-gradient-to-br from-background to-muted/5">
              <CardHeader className="pb-3 sm:pb-4 px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
                <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
                  <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors flex-shrink-0">
                    <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-foreground truncate">
                    {t('support.chatSupport.title')}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6 space-y-3 sm:space-y-4">
                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed">
                  {t('support.chatSupport.description')}
                </p>
                <Button
                  className="w-full min-h-[44px] sm:h-11 lg:h-12 text-xs sm:text-sm lg:text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-200 shadow-md hover:shadow-lg touch-manipulation"
                  onClick={() => {
                    trackSupportChatStart();
                    setIsChatOpen(true);
                  }}
                >
                  <MessageCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span>{t('support.chatSupport.button')}</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border hover:border-primary/20 bg-gradient-to-br from-background to-muted/5 cursor-pointer touch-manipulation"
              onClick={() => {
                trackSupportFAQClick();
                navigate('/#faq');
                // Scroll to FAQ section after navigation
                setTimeout(() => {
                  const faqSection = document.getElementById('faq');
                  if (faqSection) {
                    faqSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 100);
              }}>
              <CardHeader className="pb-3 sm:pb-4 px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
                <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
                  <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors flex-shrink-0">
                    <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-foreground truncate">
                    {t('support.faq.title')}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6 space-y-3 sm:space-y-4">
                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed">
                  {t('support.faq.description')}
                </p>
                <Button
                  variant="outline"
                  className="w-full min-h-[44px] sm:h-11 lg:h-12 text-xs sm:text-sm lg:text-base font-medium border hover:border-primary hover:bg-primary/5 transition-all duration-200 touch-manipulation"
                >
                  <HelpCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span>{t('support.faq.button')}</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Motivational Section */}
          <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-primary/20 rounded-full mb-3 sm:mb-4 lg:mb-6">
                <Heart className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 lg:mb-4 text-foreground">
                {t('support.motivation.title')}
              </h3>
              <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto px-2 sm:px-0">
                {t('support.motivation.description')}
              </p>
            </CardContent>
          </Card>

          {/* Ticket History */}
          <TicketHistory />

        </div>
      </div>

      {/* Support Chat Modal */}
      <SupportChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onTicketChange={refreshTickets}
        onManualSupportClick={() => setIsManualSupportOpen(true)}
      />

      {/* Manual Support Modal */}
      <ManualSupportModal
        isOpen={isManualSupportOpen}
        onClose={() => setIsManualSupportOpen(false)}
      />
    </div>
  );
};

export default Support;
