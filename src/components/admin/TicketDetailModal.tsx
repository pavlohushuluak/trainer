
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, CheckCircle, AlertCircle, Star, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AdminTicket {
  id: string;
  user_id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  satisfaction_rating?: number;
  is_resolved_by_ai: boolean;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

interface AdminMessage {
  id: string;
  sender_type: 'user' | 'ai' | 'admin';
  sender_id?: string;
  message: string;
  created_at: string;
  metadata?: any;
}

interface TicketDetailModalProps {
  selectedTicket: AdminTicket | null;
  messages: AdminMessage[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  sending: boolean;
  onClose: () => void;
  onStatusChange: (ticketId: string, status: string) => void;
  onSendMessage: () => void;
}

export const TicketDetailModal = ({
  selectedTicket,
  messages,
  newMessage,
  setNewMessage,
  sending,
  onClose,
  onStatusChange,
  onSendMessage
}: TicketDetailModalProps) => {
  const { t } = useTranslation();
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      open: { variant: "destructive", icon: AlertCircle, label: t('adminSupport.tickets.status.open') },
      in_progress: { variant: "default", icon: Clock, label: t('adminSupport.tickets.status.inProgress') },
      waiting_user: { variant: "secondary", icon: Clock, label: t('adminSupport.tickets.status.waitingUser') },
      resolved: { variant: "outline", icon: CheckCircle, label: t('adminSupport.tickets.status.resolved') },
      closed: { variant: "secondary", icon: CheckCircle, label: t('adminSupport.tickets.status.closed') }
    };

    const config = variants[status] || variants.open;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: "text-red-600",
      high: "text-orange-600",
      normal: "text-blue-600",
      low: "text-gray-600"
    };
    return colors[priority] || colors.normal;
  };

  return (
    <Dialog open={!!selectedTicket} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{selectedTicket?.subject}</span>
            <div className="flex gap-2">
              {selectedTicket && getStatusBadge(selectedTicket.status)}
              <Select
                value={selectedTicket?.status}
                onValueChange={(status) => selectedTicket && onStatusChange(selectedTicket.id, status)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">{t('adminSupport.tickets.status.open')}</SelectItem>
                  <SelectItem value="in_progress">{t('adminSupport.tickets.status.inProgress')}</SelectItem>
                  <SelectItem value="waiting_user">{t('adminSupport.tickets.status.waitingUser')}</SelectItem>
                  <SelectItem value="resolved">{t('adminSupport.tickets.status.resolved')}</SelectItem>
                  <SelectItem value="closed">{t('adminSupport.tickets.status.closed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h4 className="font-medium mb-3">{t('adminSupport.ticketDetail.chatHistory')}</h4>
              <ScrollArea className="h-96 border rounded-lg p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${
                      message.sender_type === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender_type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : message.sender_type === 'ai'
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-green-50 border border-green-200'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm">{message.message}</div>
                        <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
                          {message.sender_type === 'ai' ? t('adminSupport.ticketDetail.messageSenders.ai') : 
                           message.sender_type === 'admin' ? t('adminSupport.ticketDetail.messageSenders.admin') : t('adminSupport.ticketDetail.messageSenders.user')}
                          <span>•</span>
                          <span>{new Date(message.created_at).toLocaleTimeString('de-DE')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Admin Reply */}
            <div className="space-y-3">
              <h4 className="font-medium">{t('adminSupport.ticketDetail.sendReply')}</h4>
              <Textarea
                placeholder={t('adminSupport.ticketDetail.replyPlaceholder')}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={4}
              />
              <Button 
                onClick={onSendMessage}
                disabled={!newMessage.trim() || sending}
                className="w-full"
              >
                {sending ? (
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {t('adminSupport.ticketDetail.sendMessage')}
              </Button>
            </div>
          </div>

          {/* Ticket Info */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t('adminSupport.ticketDetail.ticketDetails')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">{t('adminSupport.ticketDetail.user')}:</span>
                  <p>{selectedTicket?.profiles?.first_name} {selectedTicket?.profiles?.last_name}</p>
                  <p className="text-muted-foreground">{selectedTicket?.profiles?.email}</p>
                </div>
                <Separator />
                <div>
                  <span className="font-medium">{t('adminSupport.ticketDetail.category')}:</span>
                  <p>{selectedTicket?.category}</p>
                </div>
                <div>
                  <span className="font-medium">{t('adminSupport.ticketDetail.priority')}:</span>
                  <p className={selectedTicket && getPriorityColor(selectedTicket.priority)}>
                    {selectedTicket?.priority.toUpperCase()}
                  </p>
                </div>
                <div>
                  <span className="font-medium">{t('adminSupport.ticketDetail.created')}:</span>
                  <p>{selectedTicket && new Date(selectedTicket.created_at).toLocaleString('de-DE')}</p>
                </div>
                {selectedTicket?.resolved_at && (
                  <div>
                    <span className="font-medium">{t('adminSupport.ticketDetail.resolved')}:</span>
                    <p>{new Date(selectedTicket.resolved_at).toLocaleString('de-DE')}</p>
                  </div>
                )}
                {selectedTicket?.satisfaction_rating && (
                  <div>
                    <span className="font-medium">{t('adminSupport.ticketDetail.rating')}:</span>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(selectedTicket.satisfaction_rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                )}
                {selectedTicket?.is_resolved_by_ai && (
                  <Badge variant="outline" className="w-fit">
                    {t('adminSupport.ticketDetail.aiResolved')}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
