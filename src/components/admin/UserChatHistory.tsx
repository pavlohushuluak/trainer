
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Bot, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserChatHistoryProps {
  userId: string;
}

export const UserChatHistory = ({ userId }: UserChatHistoryProps) => {
  const { t, i18n } = useTranslation();
  const { data: chatSessions, isLoading } = useQuery({
    queryKey: ['user-chat-sessions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
          id,
          title,
          created_at,
          updated_at,
          pet_profiles(name, species)
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: recentMessages } = useQuery({
    queryKey: ['user-recent-messages', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          role,
          content,
          created_at,
          session_id,
          chat_sessions(title, pet_profiles(name))
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-4">{t('adminDetails.chatHistory.loading')}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Chat Sessions Overview */}
      <div>
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          {t('adminDetails.chatHistory.sessionsTitle', { count: chatSessions?.length || 0 })}
        </h4>
        <div className="space-y-2">
          {chatSessions?.map((session) => (
            <div key={session.id} className="p-3 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{session.title || t('adminDetails.chatHistory.unnamedSession')}</p>
                  {session.pet_profiles && (
                    <p className="text-sm text-muted-foreground">
                      {t('adminDetails.chatHistory.withPet', { 
                        name: session.pet_profiles.name, 
                        species: session.pet_profiles.species 
                      })}
                    </p>
                  )}
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{t('adminDetails.chatHistory.created')}: {new Date(session.created_at).toLocaleDateString(i18n.language === 'de' ? 'de-DE' : 'en-US')}</p>
                  <p>{t('adminDetails.chatHistory.lastUpdated')}: {new Date(session.updated_at).toLocaleDateString(i18n.language === 'de' ? 'de-DE' : 'en-US')}</p>
                </div>
              </div>
            </div>
          ))}
          {!chatSessions?.length && (
            <p className="text-muted-foreground text-center py-4">{t('adminDetails.chatHistory.noSessions')}</p>
          )}
        </div>
      </div>

      {/* Recent Messages */}
      <div>
        <h4 className="font-medium mb-2">{t('adminDetails.chatHistory.recentMessages')}</h4>
        <ScrollArea className="h-64 border rounded-lg p-3">
          <div className="space-y-3">
            {recentMessages?.map((message) => (
              <div key={message.id} className="flex gap-2">
                <div className="flex-shrink-0">
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Bot className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={message.role === 'user' ? 'default' : 'secondary'}>
                      {message.role === 'user' ? t('adminDetails.chatHistory.user') : t('adminDetails.chatHistory.ai')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleString(i18n.language === 'de' ? 'de-DE' : 'en-US')}
                    </span>
                  </div>
                  <p className="text-sm break-words">
                    {message.content.length > 150 
                      ? `${message.content.substring(0, 150)}...` 
                      : message.content}
                  </p>
                  {(message as any).chat_sessions?.pet_profiles && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('adminDetails.chatHistory.session')}: {(message as any).chat_sessions.pet_profiles.name}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {!recentMessages?.length && (
              <p className="text-muted-foreground text-center py-4">{t('adminDetails.chatHistory.noMessages')}</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
