
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
import { ChatModal } from '@/components/ChatModal';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslations } from '@/hooks/useTranslations';

const Support = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { signOut } = useAuthOperations();
  const { isScrolled } = useStickyHeader();
  const { t } = useTranslations();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Fetch user's pets for ChatModal
  const { data: pets = [] } = useQuery({
    queryKey: ['user-pets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pets:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user,
  });

  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">

      {/* Auth Error Display */}
      <AuthErrorDisplay />

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-6">

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              {t('support.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('support.subtitle')}
            </p>
          </div>

        {/* Support Options */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <MessageCircle className="h-6 w-6" />
                {t('support.chatSupport.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('support.chatSupport.description')}
              </p>
              <Button 
                className="w-full"
                onClick={() => setIsChatOpen(true)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {t('support.chatSupport.button')}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <HelpCircle className="h-6 w-6" />
                {t('support.faq.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('support.faq.description')}
              </p>
              <Button variant="outline" className="w-full">
                <HelpCircle className="h-4 w-4 mr-2" />
                {t('support.faq.button')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Motivational Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6 text-center">
            <Heart className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">
              {t('support.motivation.title')}
            </h3>
            <p className="text-muted-foreground">
              {t('support.motivation.description')}
            </p>
          </CardContent>
        </Card>

        {/* Ticket History */}
        <TicketHistory />

      </div>
    </div>

    {/* Chat Modal */}
    {isChatOpen && (
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    )}
  </div>
  );
};

export default Support;
