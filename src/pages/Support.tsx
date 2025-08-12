
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, History, HelpCircle, Heart, Home, ArrowLeft, Shield } from 'lucide-react';
import { TicketHistory } from '@/components/support/TicketHistory';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAuthOperations } from '@/hooks/auth/useAuthOperations';
import { AuthErrorDisplay } from '@/components/auth/AuthErrorDisplay';
import { useStickyHeader } from '@/hooks/useStickyHeader';
import { cn } from '@/lib/utils';
import { SupportChat } from '@/components/support/SupportChat';
import { useTranslations } from '@/hooks/useTranslations';

const Support = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { signOut } = useAuthOperations();
  const { isScrolled } = useStickyHeader();
  const { t } = useTranslations();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">

      {/* Auth Error Display */}
      <AuthErrorDisplay />

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              {t('support.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('support.subtitle')}
            </p>
          </div>

        {/* Support Options */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-br from-background to-muted/5">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {t('support.chatSupport.title')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {t('support.chatSupport.description')}
              </p>
              <Button 
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={() => setIsChatOpen(true)}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                {t('support.chatSupport.button')}
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-br from-background to-muted/5 cursor-pointer"
                onClick={() => {
                  navigate('/#faq');
                  // Scroll to FAQ section after navigation
                  setTimeout(() => {
                    const faqSection = document.getElementById('faq');
                    if (faqSection) {
                      faqSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <HelpCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {t('support.faq.title')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {t('support.faq.description')}
              </p>
              <Button 
                variant="outline" 
                className="w-full h-12 text-base font-medium border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200"
              >
                <HelpCircle className="h-5 w-5 mr-2" />
                {t('support.faq.button')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Motivational Section */}
        <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-6">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              {t('support.motivation.title')}
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl mx-auto">
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
    />
  </div>
  );
};

export default Support;
