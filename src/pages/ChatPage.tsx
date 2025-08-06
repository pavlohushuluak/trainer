import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatModal } from '@/components/ChatModal';
import MainNavigation from '@/components/layout/MainNavigation';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslations } from '@/hooks/useTranslations';

const ChatPage = () => {
  const { user } = useAuth();
  const { t } = useTranslations();
  const [showChatModal, setShowChatModal] = useState(true);

  // Fetch user's pets
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

  if (!user) {
    return (
      <div className="bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('chat.page.loginRequired.title')}</h1>
          <p className="text-muted-foreground">{t('chat.page.loginRequired.description')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <MainNavigation user={user} />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <MessageCircle className="h-8 w-8 text-primary" />
            {t('chat.page.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('chat.page.subtitle')}
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t('chat.page.startChat.title')}</h2>
            <Button onClick={() => setShowChatModal(true)}>
              <MessageCircle className="h-4 w-4 mr-2" />
              {t('chat.page.startChat.button')}
            </Button>
          </div>
          
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              {t('chat.page.startChat.description')}
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              {(t('chat.page.startChat.features', { returnObjects: true }) as string[]).map((feature: string, index: number) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {showChatModal && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
        />
      )}
    </div>
  );
};

export default ChatPage;