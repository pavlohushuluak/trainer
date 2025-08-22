
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { SupportChat } from './SupportChat';
import { useTranslations } from '@/hooks/useTranslations';

export const SupportButton = () => {
  const { t } = useTranslations();
  const { user } = useAuth();
  const { hasActiveSubscription } = useSubscriptionStatus();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Only show for premium users
  if (!user || !hasActiveSubscription) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
        <Button
          onClick={() => setIsChatOpen(true)}
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-semibold animate-pulse-soft"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          {t('navigation.help')}
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
