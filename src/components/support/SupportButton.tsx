
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SupportChat } from './SupportChat';
import { useTranslations } from '@/hooks/useTranslations';

export const SupportButton = () => {
  const { t } = useTranslations();
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

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

      {/* Support Chat Modal */}
      <SupportChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onTicketChange={() => {
          // Optional: Could implement ticket refresh here if needed
          // For now, this is a standalone component without ticket history
        }}
      />
    </>
  );
};
