
import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, HelpCircle } from 'lucide-react';
import { useSupportChat } from '@/hooks/useSupportChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SatisfactionRequest } from './SatisfactionRequest';
import { useTranslations } from '@/hooks/useTranslations';

interface SupportChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportChat = ({ isOpen, onClose }: SupportChatProps) => {
  const { t } = useTranslations();
  
  const {
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    ticketId,
    showSatisfactionRequest,
    messagesEndRef,
    sendMessage,
    handleSatisfactionFeedback
  } = useSupportChat(isOpen);

  // Handle escape key to close modal
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleFeedback = useCallback(async (isHelpful: boolean) => {
    const shouldClose = await handleSatisfactionFeedback(isHelpful);
    if (shouldClose) {
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  }, [handleSatisfactionFeedback, onClose]);

  // Memoize messages to prevent unnecessary re-renders
  const memoizedMessages = useMemo(() => messages.map((message) => (
    <ChatMessage key={message.id} message={message} />
  )), [messages]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[100] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <Card className="w-full max-w-2xl h-[600px] flex flex-col bg-background">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{t('support.chat.title')}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
          </div>
          {ticketId && (
            <Badge variant="outline" className="w-fit">
              {t('support.chat.ticketNumber', { id: ticketId.slice(-8) })}
            </Badge>
          )}
        </CardHeader>
        
        <Separator />
        
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-4 p-4">
              {memoizedMessages}
              
              {showSatisfactionRequest && (
                <SatisfactionRequest onFeedback={handleFeedback} />
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">{t('support.chat.thinking')}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <Separator />
          
          <ChatInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            onSendMessage={sendMessage}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};
