
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';

interface TicketDetailDialogProps {
  selectedTicket: any;
  ticketMessages: any[];
  onClose: () => void;
  onFeedbackClick: () => void;
}

const getStatusBadge = (status: string) => {
  const { t } = useTranslation();
  
  const variants: Record<string, { variant: any; icon: any; label: string }> = {
    open: { variant: "default", icon: null, label: t('support.ticketDetail.status.open') },
    in_progress: { variant: "secondary", icon: null, label: t('support.ticketDetail.status.inProgress') },
    waiting_user: { variant: "outline", icon: null, label: t('support.ticketDetail.status.waitingUser') },
    resolved: { variant: "default", icon: null, label: t('support.ticketDetail.status.resolved') },
    closed: { variant: "secondary", icon: null, label: t('support.ticketDetail.status.closed') }
  };

  const config = variants[status] || variants.open;

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    technisch: "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300",
    abo: "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300",
    funktion: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300",
    training: "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300",
    allgemein: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
  };
  return colors[category] || colors.allgemein;
};

export const TicketDetailDialog = ({ 
  selectedTicket, 
  ticketMessages, 
  onClose, 
  onFeedbackClick 
}: TicketDetailDialogProps) => {
  const { t } = useTranslation();
  
  return (
    <Dialog open={!!selectedTicket} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{selectedTicket?.subject}</span>
            {selectedTicket && getStatusBadge(selectedTicket.status)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">{t('support.ticketDetail.ticketId')}:</span>
              <p>#{selectedTicket?.id.slice(-8)}</p>
            </div>
            <div>
              <span className="font-medium">{t('support.ticketDetail.created')}:</span>
              <p>{selectedTicket && new Date(selectedTicket.created_at).toLocaleString('de-DE')}</p>
            </div>
            <div>
              <span className="font-medium">{t('support.ticketDetail.category')}:</span>
              <Badge className={selectedTicket && getCategoryColor(selectedTicket.category)}>
                {selectedTicket?.category}
              </Badge>
            </div>
            <div>
              <span className="font-medium">{t('support.ticketDetail.priority')}:</span>
              <p>{selectedTicket?.priority}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">{t('support.ticketDetail.chatHistory')}</h4>
            <ScrollArea className="h-64 border rounded-lg p-3">
              <div className="space-y-3">
                {ticketMessages.map((message) => (
                  <div key={message.id} className={`flex ${
                    message.sender_type === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <div className={`max-w-[80%] p-2 rounded-lg text-sm ${
                      message.sender_type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.sender_type === 'ai'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-border'
                        : 'bg-green-50 dark:bg-green-900/20 border border-border'
                    }`}>
                      <div className="whitespace-pre-wrap">{message.message}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.sender_type === 'ai' ? '🤖' : message.sender_type === 'admin' ? '👨‍💻' : '👤'} • {new Date(message.created_at).toLocaleTimeString('de-DE')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {selectedTicket?.status === 'resolved' && !selectedTicket?.satisfaction_rating && (
            <div className="text-center">
              <Button onClick={onFeedbackClick}>
                {t('support.ticketDetail.giveFeedback')} ⭐
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
