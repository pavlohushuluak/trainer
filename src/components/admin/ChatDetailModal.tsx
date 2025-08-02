
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MessageCircle, Bot, User, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ChatDetailModalProps {
  chat: {
    id: string;
    title: string | null;
    created_at: string;
    updated_at: string;
    profile_email: string | null;
    pet_profiles: { name: string; species: string } | null;
    subscription_tier: string | null;
    subscription_status: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChatDetailModal = ({ chat, open, onOpenChange }: ChatDetailModalProps) => {
  const { t } = useTranslation();
  const { data: messages } = useQuery({
    queryKey: ['chat-messages', chat?.id],
    queryFn: async () => {
      if (!chat?.id) return [];
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', chat.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!chat?.id && open,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE');
  };

  const getSubscriptionBadge = (chat: ChatDetailModalProps['chat']) => {
    if (!chat?.subscription_status) {
      return <Badge variant="secondary">{t('adminChats.subscriptionBadges.free')}</Badge>;
    }
    
    switch (chat.subscription_status) {
      case 'active':
        return <Badge variant="default">{chat.subscription_tier || t('adminChats.subscriptionBadges.premium')}</Badge>;
      case 'trialing':
        return <Badge variant="outline">{t('adminChats.subscriptionBadges.trial')}</Badge>;
      default:
        return <Badge variant="secondary">{t('adminChats.subscriptionBadges.inactive')}</Badge>;
    }
  };

  if (!chat) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {t('adminChats.chatDetail.title')}: {chat.title || t('adminChats.chatDetail.unnamedSession')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Chat Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium mb-2">{t('adminChats.chatDetail.userInfo')}</h4>
              <div className="space-y-1 text-sm">
                <p>{t('adminChats.chatDetail.email')}: {chat.profile_email || t('adminChats.chatList.unknown')}</p>
                <p>{t('adminChats.chatDetail.subscriptionStatus')}: {getSubscriptionBadge(chat)}</p>
                {chat.pet_profiles && (
                  <p>{t('adminChats.chatDetail.pet')}: {chat.pet_profiles.name} ({chat.pet_profiles.species})</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">{t('adminChats.chatDetail.sessionDetails')}</h4>
              <div className="space-y-1 text-sm">
                <p>{t('adminChats.chatDetail.created')}: {formatDate(chat.created_at)}</p>
                <p>{t('adminChats.chatDetail.lastActive')}: {formatDate(chat.updated_at)}</p>
                <p>{t('adminChats.chatDetail.sessionId')}: {chat.id}</p>
                <p>{t('adminChats.chatList.messages')}: {messages?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              {t('adminChats.chatDetail.chatHistory')}
            </h4>
            <ScrollArea className="h-96 border rounded-lg p-4">
              <div className="space-y-4">
                {messages?.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <div className="flex-shrink-0">
                      {message.role === 'user' ? (
                        <User className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Bot className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={message.role === 'user' ? 'default' : 'secondary'}>
                          {message.role === 'user' ? t('adminChats.chatDetail.user') : t('adminChats.chatDetail.ai')}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(message.created_at)}
                        </span>
                        {message.tokens_used && (
                          <Badge variant="outline" className="text-xs">
                            {message.tokens_used} {t('adminChats.chatDetail.tokens')}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm bg-white p-3 rounded border">
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {!messages?.length && (
                  <p className="text-muted-foreground text-center py-8">
                    {t('adminChats.chatDetail.noMessages')}
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
