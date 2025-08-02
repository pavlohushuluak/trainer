
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User, Search, Calendar, PawPrint, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ChatDetailModal } from './ChatDetailModal';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface ChatSession {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  pet_id: string | null;
  message_count: number;
  pet_profiles: {
    name: string;
    species: string;
  } | null;
  profile_email: string | null;
  subscription_tier: string | null;
  subscription_status: string | null;
}

export const ChatManagement = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  
  const LIMIT = 20;

  useEffect(() => {
    loadChatSessions(true);
  }, []);

  const loadChatSessions = async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    
    if (reset) {
      setLoading(true);
      setOffset(0);
      setChatSessions([]);
    } else {
      setLoadingMore(true);
    }
    
    setError(null);
    
    try {
      
      // Step 1: Load basic chat sessions first
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('id, title, created_at, updated_at, user_id, pet_id')
        .order('updated_at', { ascending: false })
        .range(currentOffset, currentOffset + LIMIT - 1);

      if (sessionsError) {
        console.error('Error fetching chat sessions:', sessionsError);
        throw sessionsError;
      }

      if (!sessions || sessions.length === 0) {
        setHasMore(false);
        if (reset) setChatSessions([]);
        return;
      }


      // Initialize sessions with basic data
      const processedSessions: ChatSession[] = sessions.map(session => ({
        ...session,
        message_count: 0,
        pet_profiles: null,
        profile_email: null,
        subscription_tier: null,
        subscription_status: null
      }));

      // Step 2: Load additional data in parallel with error handling
      const userIds = [...new Set(sessions.map(s => s.user_id))];
      const sessionIds = sessions.map(s => s.id);
      const petIds = sessions.filter(s => s.pet_id).map(s => s.pet_id);

      const [profilesResult, subscribersResult, messageCountsResult, petProfilesResult] = await Promise.allSettled([
        // Profiles
        supabase.from('profiles').select('id, email').in('id', userIds),
        // Subscribers 
        supabase.from('subscribers').select('user_id, subscription_tier, subscription_status').in('user_id', userIds),
        // Message counts
        supabase.from('chat_messages').select('session_id').in('session_id', sessionIds),
        // Pet profiles
        petIds.length > 0 ? supabase.from('pet_profiles').select('id, name, species').in('id', petIds) : Promise.resolve({ data: [] })
      ]);

      // Process results with fallbacks
      const profiles = profilesResult.status === 'fulfilled' ? profilesResult.value.data || [] : [];
      const subscribers = subscribersResult.status === 'fulfilled' ? subscribersResult.value.data || [] : [];
      const messageCounts = messageCountsResult.status === 'fulfilled' ? messageCountsResult.value.data || [] : [];
      const petProfiles = petProfilesResult.status === 'fulfilled' ? petProfilesResult.value.data || [] : [];

      // Log any failures
      if (profilesResult.status === 'rejected') console.warn('Failed to load profiles:', profilesResult.reason);
      if (subscribersResult.status === 'rejected') console.warn('Failed to load subscribers:', subscribersResult.reason);
      if (messageCountsResult.status === 'rejected') console.warn('Failed to load message counts:', messageCountsResult.reason);
      if (petProfilesResult.status === 'rejected') console.warn('Failed to load pet profiles:', petProfilesResult.reason);

      // Create lookup maps
      const profileMap = new Map(profiles.map(p => [p.id, p.email]));
      const subscriberMap = new Map(subscribers.map(s => [s.user_id, s]));
      const petMap = new Map(petProfiles.map(p => [p.id, p]));

      // Count messages per session
      const messageCountMap = new Map<string, number>();
      messageCounts.forEach(msg => {
        const count = messageCountMap.get(msg.session_id) || 0;
        messageCountMap.set(msg.session_id, count + 1);
      });

      // Step 3: Enhance sessions with additional data
      const enhancedSessions: ChatSession[] = processedSessions.map(session => ({
        ...session,
        message_count: messageCountMap.get(session.id) || 0,
        profile_email: profileMap.get(session.user_id) || null,
        subscription_tier: subscriberMap.get(session.user_id)?.subscription_tier || null,
        subscription_status: subscriberMap.get(session.user_id)?.subscription_status || null,
        pet_profiles: session.pet_id ? petMap.get(session.pet_id) || null : null
      }));

      if (reset) {
        setChatSessions(enhancedSessions);
      } else {
        setChatSessions(prev => [...prev, ...enhancedSessions]);
      }

      setOffset(currentOffset + sessions.length);
      setHasMore(sessions.length === LIMIT);

    } catch (error) {
      console.error('Error loading chat sessions:', error);
      const errorMessage = error instanceof Error ? error.message : t('adminChats.error.unknownError');
      setError(`${t('adminChats.error.title')}: ${errorMessage}`);
      toast({
        variant: "destructive",
        title: t('adminChats.error.title'),
        description: t('adminChats.error.message')
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadChatSessions(false);
    }
  };

  const filteredSessions = chatSessions.filter(session => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      session.profile_email?.toLowerCase().includes(searchLower) ||
      session.title?.toLowerCase().includes(searchLower) ||
      session.pet_profiles?.name?.toLowerCase().includes(searchLower)
    );
  });

  const getSubscriptionBadge = (session: ChatSession) => {
    if (!session.subscription_status) {
      return <Badge variant="secondary">{t('adminChats.subscriptionBadges.free')}</Badge>;
    }

    switch (session.subscription_status) {
      case 'active':
        return <Badge variant="default">{t('adminChats.subscriptionBadges.premium')}</Badge>;
      case 'trialing':
        return <Badge variant="outline">{t('adminChats.subscriptionBadges.trial')}</Badge>;
      case 'canceled':
        return <Badge variant="destructive">{t('adminChats.subscriptionBadges.canceled')}</Badge>;
      default:
        return <Badge variant="secondary">{t('adminChats.subscriptionBadges.unknown')}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{t('adminChats.loading')}</p>
        </div>
      </div>
    );
  }

  if (error && chatSessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              {t('adminChats.error.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => loadChatSessions(true)} variant="outline" className="w-full">
              {t('adminChats.error.retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('adminChats.title')}</h1>
        <Button onClick={() => loadChatSessions(true)} variant="outline" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {t('adminUsers.header.refresh')}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('adminChats.search.placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminChats.stats.totalChats')}</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chatSessions.length}{hasMore ? '+' : ''}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminChats.stats.activeUsers')}</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(chatSessions.map(s => s.user_id)).size}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminChats.stats.premiumUsers')}</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chatSessions.filter(s => s.subscription_status === 'active').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Sessions List */}
      <div className="space-y-4">
        {filteredSessions.map((session) => (
          <Card key={session.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      {session.title || t('adminChats.chatList.unnamedChat')}
                    </span>
                    {getSubscriptionBadge(session)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {session.profile_email || t('adminChats.chatList.unknown')}
                    </div>
                    
                    {session.pet_profiles && (
                      <div className="flex items-center gap-1">
                        <PawPrint className="h-3 w-3" />
                        {session.pet_profiles.name} ({session.pet_profiles.species})
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(session.updated_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {session.message_count} {t('adminChats.chatList.messages')}
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedChat(session)}
                >
                  {t('adminChats.chatList.showDetails')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Load More Button */}
        {hasMore && !searchTerm && (
          <div className="flex justify-center py-4">
            <Button 
              onClick={loadMore} 
              variant="outline" 
              disabled={loadingMore}
              className="flex items-center gap-2"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('adminChats.chatList.loading')}
                </>
              ) : (
                t('adminChats.chatList.loadMore')
              )}
            </Button>
          </div>
        )}
      </div>

      {filteredSessions.length === 0 && !loading && (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">{t('adminChats.chatList.noChatsFound')}</h3>
          <p className="text-muted-foreground">
            {searchTerm ? t('adminChats.chatList.noChatsMatching') : t('adminChats.chatList.noChatsYet')}
          </p>
        </div>
      )}

      {/* Chat Detail Modal */}
      {selectedChat && (
        <ChatDetailModal
          chat={selectedChat}
          open={!!selectedChat}
          onOpenChange={(open) => !open && setSelectedChat(null)}
        />
      )}
    </div>
  );
};
