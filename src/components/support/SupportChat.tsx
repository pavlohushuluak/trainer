
import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import { Loader2, HelpCircle, Plus, Mail } from 'lucide-react';
import { useSupportChat } from '@/hooks/useSupportChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SatisfactionRequest } from './SatisfactionRequest';
import { useTranslations } from '@/hooks/useTranslations';
import { AnimatedDots } from '@/components/ui/animated-dots';
import { useGTM } from '@/hooks/useGTM';

interface SupportChatProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketChange?: () => void;
  onManualSupportClick?: () => void;
}

export const SupportChat = ({ isOpen, onClose, onTicketChange, onManualSupportClick }: SupportChatProps) => {
  const { t } = useTranslations();
  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false);
  const { trackSupportTicketCreate, trackSupportMessage, trackSupportFeedback } = useGTM();

  const {
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    isResolvingTicket,
    isSubmittingFeedback,
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
        className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[100] p-3 sm:p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <Card className="w-full max-w-2xl h-[85vh] sm:h-[600px] max-h-[600px] flex flex-col bg-background">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <CardTitle className="text-base sm:text-lg truncate">{t('support.chat.title')}</CardTitle>
              </div>
              <div className="flex items-between justify-between gap-2 flex-wrap">
                <div className='grid grid-cols-2 gap-2'>
                  {onManualSupportClick && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onManualSupportClick();
                      }}
                      className="text-xs sm:text-sm min-h-[40px] sm:min-h-[36px] px-2.5 sm:px-3 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 transition-all duration-200 touch-manipulation"
                    >
                      <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
                      <span className="hidden sm:inline whitespace-nowrap">{t('support.chat.manualSupport')}</span>
                      <span className="sm:hidden whitespace-nowrap">{t('support.chat.manualSupportShort')}</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewTicketClick}
                    disabled={isLoading || isResolvingTicket || showNewTicketDialog}
                    className="text-xs sm:text-sm min-h-[40px] sm:min-h-[36px] px-2.5 sm:px-3 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary hover:text-primary/80 transition-all duration-200 touch-manipulation whitespace-nowrap"
                  >
                    {isLoading || isResolvingTicket ? (
                      <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 animate-spin flex-shrink-0" />
                    ) : (
                      <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
                    )}
                    {isResolvingTicket ? t('support.chat.resolvingTicket') : t('support.chat.newTicket')}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0 hover:bg-muted touch-manipulation"
                >
                  ✕
                </Button>
              </div>
            </div>
            {ticketId ? (
              <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-0 flex-wrap">
                <Badge variant="outline" className={`w-fit text-[10px] sm:text-xs flex-shrink-0 ${isResolvingTicket
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700'
                    : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700'
                  }`}>
                  {t('support.chat.ticketNumber', { id: ticketId.slice(-8) })}
                </Badge>
                <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                  {isResolvingTicket ? t('support.chat.resolvingTicket') : t('support.chat.activeTicket')}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <Badge variant="outline" className="w-fit text-[10px] sm:text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700 flex-shrink-0">
                  {t('support.chat.readyToStart')}
                </Badge>
              </div>
            )}
          </CardHeader>

          <Separator />

          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden min-h-0">
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-3 sm:space-y-4 p-3 sm:p-4">
                {memoizedMessages}

                {showSatisfactionRequest && (
                  <SatisfactionRequest onFeedback={handleFeedback} disabled={isSubmittingFeedback} />
                )}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-2.5 sm:p-3 rounded-lg flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin flex-shrink-0" />
                      <span className="text-xs sm:text-sm">
                        <AnimatedDots text={t('support.chat.thinking')} />
                      </span>
                    </div>
                  </div>
                )}

                {isResolvingTicket && (
                  <div className="flex justify-start">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 sm:p-3 rounded-lg flex items-center gap-2 border border-blue-200 dark:border-blue-800">
                      <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                        <AnimatedDots text={t('support.chat.resolvingPreviousTicket')} />
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70"
            onClick={() => setShowNewTicketDialog(false)}
          />
          <div className="relative bg-background border rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold leading-tight">
                  {t('support.chat.newTicketDialog.title')}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 leading-relaxed">
                  {t('support.chat.newTicketDialog.description')}
                </p>
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowNewTicketDialog(false)}
                  className="w-full sm:w-auto min-h-[44px] sm:min-h-[40px] touch-manipulation"
                >
                  {t('support.chat.newTicketDialog.cancel')}
                </Button>
                <Button
                  onClick={handleConfirmNewTicket}
                  className="w-full sm:w-auto min-h-[44px] sm:min-h-[40px] touch-manipulation"
                >
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
