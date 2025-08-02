
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChatModal } from '@/components/ChatModal';
import { useTranslation } from 'react-i18next';

export const SupportButton = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
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
    <>
      <div className="fixed bottom-20 right-6 z-50">
        <Button
          onClick={() => setIsChatOpen(true)}
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          {t('training.supportButton.title')}
        </Button>
      </div>

      {/* Chat Modal */}
      {isChatOpen && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          pets={pets}
        />
      )}
    </>
  );
};
