
import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import { Loader2, HelpCircle, Plus } from 'lucide-react';
import { useSupportChat } from '@/hooks/useSupportChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SatisfactionRequest } from './SatisfactionRequest';
import { useTranslations } from '@/hooks/useTranslations';

interface SupportChatProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketChange?: () => void;
}

export const SupportChat = ({ isOpen, onClose, onTicketChange }: SupportChatProps) => {
  const { t } = useTranslations();
  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false);
  
  const {
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    isResolvingTicket,
    ticketId,
    showSatisfactionRequest,
    messagesEndRef,
    sendMessage,
    handleSatisfactionFeedback,
    createNewTicket
  } = useSupportChat(isOpen, onTicketChange);

  // Handle escape key to close modal
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !showNewTicketDialog) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose, showNewTicketDialog]);

  // Clean up dialog state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setShowNewTicketDialog(false);
    }
  }, [isOpen]);

  // Handle escape key for new ticket dialog
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showNewTicketDialog) {
        setShowNewTicketDialog(false);
      }
    };

    if (showNewTicketDialog) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showNewTicketDialog]);

  const handleFeedback = useCallback(async (isHelpful: boolean) => {
    const shouldClose = await handleSatisfactionFeedback(isHelpful);
    if (shouldClose) {
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  }, [handleSatisfactionFeedback, onClose]);

  const handleNewTicketClick = useCallback(() => {
    // Don't allow new ticket creation while loading
    if (isLoading) return;
    
    // If there's an active ticket, show confirmation dialog
    if (ticketId) {
      setShowNewTicketDialog(true);
    } else {
      // No active ticket, create new ticket directly
      createNewTicket();
    }
  }, [ticketId, createNewTicket, isLoading]);

  const handleConfirmNewTicket = useCallback(async () => {
    setShowNewTicketDialog(false);
    await createNewTicket();
  }, [createNewTicket]);

  // Memoize messages to prevent unnecessary re-renders
  const memoizedMessages = useMemo(() => messages.map((message) => (
    <ChatMessage key={message.id} message={message} />
  )), [messages]);

  if (!isOpen) return null;

  return (
    <>
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
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNewTicketClick}
                disabled={isLoading || isResolvingTicket || showNewTicketDialog}
                className="text-xs bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary hover:text-primary/80 transition-all duration-200"
              >
                {isLoading || isResolvingTicket ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Plus className="h-3 w-3 mr-1" />
                )}
                {isResolvingTicket ? t('support.chat.resolvingTicket') : t('support.chat.newTicket')}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
            </div>
          </div>
          {ticketId ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`w-fit ${
                isResolvingTicket 
                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700'
                  : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700'
              }`}>
                {t('support.chat.ticketNumber', { id: ticketId.slice(-8) })}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {isResolvingTicket ? t('support.chat.resolvingTicket') : t('support.chat.activeTicket')}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="w-fit bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700">
                {t('support.chat.readyToStart')}
              </Badge>
            </div>
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
              
              {isResolvingTicket && (
                <div className="flex justify-start">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-center gap-2 border border-blue-200 dark:border-blue-800">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      {t('support.chat.resolvingPreviousTicket')}
                    </span>
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

    {/* New Ticket Confirmation Dialog - Custom modal with proper z-index */}
    {showNewTicketDialog && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70"
          onClick={() => setShowNewTicketDialog(false)}
        />
        <div className="relative bg-background border rounded-lg shadow-lg p-6 w-full max-w-md">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">
                {t('support.chat.newTicketDialog.title')}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {t('support.chat.newTicketDialog.description')}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowNewTicketDialog(false)}
              >
                {t('support.chat.newTicketDialog.cancel')}
              </Button>
              <Button onClick={handleConfirmNewTicket}>
                {t('support.chat.newTicketDialog.confirm')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
