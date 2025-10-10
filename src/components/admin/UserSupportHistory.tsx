
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, Star, MessageSquare, User, Bot, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserSupportHistoryProps {
  userId: string;
}

interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_type: 'user' | 'ai' | 'admin';
  sender_id: string | null;
  message: string;
  message_type: string;
  metadata: any;
  created_at: string;
}

export const UserSupportHistory = ({ userId }: UserSupportHistoryProps) => {
  const { t, i18n } = useTranslation();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const { data: supportTickets, isLoading } = useQuery({
    queryKey: ['user-support-tickets', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          id,
          subject,
          category,
          status,
          priority,
          satisfaction_rating,
          is_resolved_by_ai,
          created_at,
          resolved_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch messages for selected ticket
  const { data: supportMessages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['support-messages', selectedTicketId],
    queryFn: async () => {
      if (!selectedTicketId) return [];
      
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', selectedTicketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as SupportMessage[];
    },
    enabled: !!selectedTicketId,
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'open': 'destructive',
      'in_progress': 'default',
      'waiting_user': 'outline',
      'resolved': 'secondary'
    };
    
    const statusLabels: Record<string, string> = {
      'open': t('adminDetails.supportHistory.status.open'),
      'in_progress': t('adminDetails.supportHistory.status.inProgress'),
      'waiting_user': t('adminDetails.supportHistory.status.waitingUser'),
      'resolved': t('adminDetails.supportHistory.status.resolved')
    };
    
    return <Badge variant={variants[status] || 'secondary'}>{statusLabels[status] || status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'low': 'secondary',
      'normal': 'outline',
      'high': 'default',
      'urgent': 'destructive'
    };
    
    const priorityLabels: Record<string, string> = {
      'low': t('adminDetails.supportHistory.priority.low'),
      'normal': t('adminDetails.supportHistory.priority.normal'),
      'high': t('adminDetails.supportHistory.priority.high'),
      'urgent': t('adminDetails.supportHistory.priority.urgent')
    };
    
    return <Badge variant={variants[priority] || 'outline'}>{priorityLabels[priority] || priority}</Badge>;
  };

  if (isLoading) {
    return <div className="text-center py-4">{t('adminDetails.supportHistory.loading')}</div>;
  }

  // Show message view when ticket is selected
  if (selectedTicketId) {
    const selectedTicket = supportTickets?.find(t => t.id === selectedTicketId);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedTicketId(null)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('adminDetails.supportHistory.backToTickets', 'Back to Tickets')}
          </Button>
        </div>

        {selectedTicket && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    #{selectedTicket.id.slice(-8)} • {selectedTicket.category}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {getStatusBadge(selectedTicket.status)}
                  {getPriorityBadge(selectedTicket.priority)}
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {t('adminDetails.supportHistory.messages', 'Messages')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 pr-4">
              {isLoadingMessages ? (
                <div className="text-center py-4 text-muted-foreground">
                  {t('adminDetails.supportHistory.loadingMessages', 'Loading messages...')}
                </div>
              ) : supportMessages && supportMessages.length > 0 ? (
                <div className="space-y-4">
                  {supportMessages.map((message) => (
                    <div 
                      key={message.id}
                      className={`flex gap-3 ${message.sender_type === 'user' ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender_type === 'user' 
                          ? 'bg-blue-100 dark:bg-blue-900' 
                          : message.sender_type === 'ai'
                          ? 'bg-purple-100 dark:bg-purple-900'
                          : 'bg-green-100 dark:bg-green-900'
                      }`}>
                        {message.sender_type === 'user' ? (
                          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        ) : message.sender_type === 'ai' ? (
                          <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div className={`flex-1 ${message.sender_type === 'user' ? 'mr-8' : 'ml-8'}`}>
                        <div className={`rounded-lg p-3 ${
                          message.sender_type === 'user'
                            ? 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800'
                            : message.sender_type === 'ai'
                            ? 'bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800'
                            : 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">
                              {message.sender_type === 'user' 
                                ? t('adminDetails.supportHistory.user', 'User')
                                : message.sender_type === 'ai'
                                ? t('adminDetails.supportHistory.ai', 'AI Assistant')
                                : t('adminDetails.supportHistory.admin', 'Admin')}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.created_at).toLocaleString(i18n.language === 'de' ? 'de-DE' : 'en-US', {
                                dateStyle: 'short',
                                timeStyle: 'short'
                              })}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                          {message.message_type === 'system' && (
                            <Badge variant="outline" className="text-xs mt-2">
                              {t('adminDetails.supportHistory.systemMessage', 'System Message')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {t('adminDetails.supportHistory.noMessages', 'No messages found for this ticket')}
                </p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show ticket list (default view)
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-4 w-4" />
        <h4 className="font-medium">{t('adminDetails.supportHistory.title', { count: supportTickets?.length || 0 })}</h4>
      </div>

      <ScrollArea className="h-80">
        <div className="space-y-3">
          {supportTickets?.map((ticket) => (
            <div 
              key={ticket.id} 
              className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
              onClick={() => setSelectedTicketId(ticket.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h5 className="font-medium">{ticket.subject}</h5>
                  <p className="text-sm text-muted-foreground">#{ticket.id.slice(-8)}</p>
                </div>
                <div className="flex flex-col gap-1">
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{t('adminDetails.supportHistory.category')}: {ticket.category}</span>
                <span>{t('adminDetails.supportHistory.created')}: {new Date(ticket.created_at).toLocaleDateString(i18n.language === 'de' ? 'de-DE' : 'en-US')}</span>
                {ticket.resolved_at && (
                  <span>{t('adminDetails.supportHistory.resolved')}: {new Date(ticket.resolved_at).toLocaleDateString(i18n.language === 'de' ? 'de-DE' : 'en-US')}</span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2">
                {ticket.is_resolved_by_ai && (
                  <Badge variant="outline" className="text-xs">🤖 {t('adminDetails.supportHistory.aiResolved')}</Badge>
                )}
                {ticket.satisfaction_rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs">{ticket.satisfaction_rating}/5</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {!supportTickets?.length && (
            <p className="text-muted-foreground text-center py-8">{t('adminDetails.supportHistory.noTickets')}</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
