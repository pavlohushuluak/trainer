
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
  const { t, i18n } = useTranslation();
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
    return new Date(dateString).toLocaleString(i18n.language === 'de' ? 'de-DE' : 'en-US');
  };

  const getSubscriptionBadge = (chat: ChatDetailModalProps['chat']) => {
    if (!chat?.subscription_status) {
      return <Badge variant="secondary">{t('adminChats.subscriptionBadges.free')}</Badge>;
    }
    
    const getTierName = (tier: string | null) => {
      if (!tier) return t('adminChats.subscriptionBadges.premium');
      
      const tierNames: Record<string, string> = {
        'plan1': t('adminChats.subscriptionBadges.plan1'),
        'plan2': t('adminChats.subscriptionBadges.plan2'),
        'plan3': t('adminChats.subscriptionBadges.plan3'),
        'plan4': t('adminChats.subscriptionBadges.plan4'),
        'plan5': t('adminChats.subscriptionBadges.plan5')
      };
      
      return tierNames[tier] || tier;
    };
    
    switch (chat.subscription_status) {
      case 'active':
        return <Badge variant="default">{getTierName(chat.subscription_tier)}</Badge>;
      case 'trialing':
        return <Badge variant="outline">{t('adminChats.subscriptionBadges.trial')}</Badge>;
      default:
        return <Badge variant="secondary">{t('adminChats.subscriptionBadges.inactive')}</Badge>;
    }
  };

  if (!chat) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="break-words">{t('adminChats.chatDetail.title')}: {chat.title || t('adminChats.chatDetail.unnamedSession')}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Chat Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium mb-2 text-sm sm:text-base">{t('adminChats.chatDetail.userInfo')}</h4>
              <div className="space-y-1 text-xs sm:text-sm">
                <p className="break-words">{t('adminChats.chatDetail.email')}: {chat.profile_email || t('adminChats.chatList.unknown')}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span>{t('adminChats.chatDetail.subscriptionStatus')}:</span>
                  {getSubscriptionBadge(chat)}
                </div>
                {chat.pet_profiles && (
                  <p className="break-words">{t('adminChats.chatDetail.pet')}: {t('adminChats.chatDetail.petInfo', { 
                    name: chat.pet_profiles.name, 
                    species: chat.pet_profiles.species 
                  })}</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2 text-sm sm:text-base">{t('adminChats.chatDetail.sessionDetails')}</h4>
              <div className="space-y-1 text-xs sm:text-sm">
                <p className="break-words">{t('adminChats.chatDetail.created')}: {formatDate(chat.created_at)}</p>
                <p className="break-words">{t('adminChats.chatDetail.lastActive')}: {formatDate(chat.updated_at)}</p>
                <p className="break-words">{t('adminChats.chatDetail.sessionId')}: {chat.id}</p>
                <p>{t('adminChats.chatList.messages')}: {messages?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2 text-sm sm:text-base">
              <MessageCircle className="h-4 w-4" />
              {t('adminChats.chatDetail.chatHistory')}
            </h4>
            <ScrollArea className="border rounded-lg p-3 sm:p-4">
              <div className="space-y-3 sm:space-y-4">
                {messages?.map((message) => (
                  <div key={message.id} className="flex gap-2 sm:gap-3">
                    <div className="flex-shrink-0">
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      ) : (
                        <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <Badge variant={message.role === 'user' ? 'default' : 'secondary'} className="w-fit">
                          {message.role === 'user' ? t('adminChats.chatDetail.user') : t('adminChats.chatDetail.ai')}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(message.created_at)}
                        </span>
                        {message.tokens_used && (
                          <Badge variant="outline" className="text-xs w-fit">
                            {message.tokens_used} {t('adminChats.chatDetail.tokens')}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm bg-white p-2 sm:p-3 rounded border">
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {!messages?.length && (
                  <p className="text-muted-foreground text-center py-8 text-sm">
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
