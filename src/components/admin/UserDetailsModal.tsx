
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserWithDetails } from './types';
import { UserChatHistory } from './UserChatHistory';
import { UserSupportHistory } from './UserSupportHistory';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface UserDetailsModalProps {
  user: UserWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserDetailsModal = ({ user, open, onOpenChange }: UserDetailsModalProps) => {
  const [newNote, setNewNote] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: userNotes } = useQuery({
    queryKey: ['user-notes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_notes')
        .select(`
          *,
          admin_profiles:profiles!user_notes_admin_id_fkey(email)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const addNote = useMutation({
    mutationFn: async () => {
      if (!user || !newNote.trim()) return;

      const { error } = await supabase
        .from('user_notes')
        .insert({
          user_id: user.id,
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          note: newNote.trim(),
          is_internal: true
        });

      if (error) throw error;

      await supabase
        .from('admin_activity_log')
        .insert({
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          action: 'note_added',
          target_user_id: user.id
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notes'] });
      setNewNote('');
      toast({
        title: t('adminDetails.toasts.noteAdded'),
        description: t('adminDetails.toasts.noteSaved')
      });
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const getStatusBadge = (user: UserWithDetails) => {
    const sub = user.subscription;
    if (!sub) return <Badge variant="secondary">{t('adminDetails.statusBadges.noSubscription')}</Badge>;
    
    if (sub.subscribed) {
      return <Badge variant="default">{t('adminDetails.statusBadges.active')}</Badge>;
    }
    
    if (sub.subscription_status === 'trialing') {
      return <Badge variant="outline">{t('adminDetails.statusBadges.trial')}</Badge>;
    }
    
    return <Badge variant="secondary">{t('adminDetails.statusBadges.inactive')}</Badge>;
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t('adminDetails.title', { email: user.email })}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t('adminDetails.tabs.overview')}</TabsTrigger>
            <TabsTrigger value="chats">{t('adminDetails.tabs.chats')}</TabsTrigger>
            <TabsTrigger value="support">{t('adminDetails.tabs.support')}</TabsTrigger>
            <TabsTrigger value="notes">{t('adminDetails.tabs.notes')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">{t('adminDetails.subscriptionInfo.title')}</h4>
                <div className="space-y-1 text-sm">
                  <p>{t('adminDetails.subscriptionInfo.status')}: {getStatusBadge(user)}</p>
                  {user.subscription?.subscription_tier && (
                    <p>{t('adminDetails.subscriptionInfo.plan')}: {user.subscription.subscription_tier}</p>
                  )}
                  {user.subscription?.subscription_end && (
                    <p>{t('adminDetails.subscriptionInfo.subscriptionEnds')}: {formatDate(user.subscription.subscription_end)}</p>
                  )}
                  {user.subscription?.trial_end && (
                    <p>{t('adminDetails.subscriptionInfo.trialEnds')}: {formatDate(user.subscription.trial_end)}</p>
                  )}
                  {user.subscription?.is_test_user && (
                    <p className="text-orange-600 font-medium">{t('adminDetails.subscriptionInfo.testUser')}</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">{t('adminDetails.accountDetails.title')}</h4>
                <div className="space-y-1 text-sm">
                  <p>{t('adminDetails.accountDetails.registered')}: {formatDate(user.created_at)}</p>
                  {user.subscription?.country && (
                    <p>{t('adminDetails.accountDetails.country')}: {user.subscription.country}</p>
                  )}
                  {user.subscription?.last_activity && (
                    <p>{t('adminDetails.accountDetails.lastActivity')}: {formatDate(user.subscription.last_activity)}</p>
                  )}
                </div>
              </div>
            </div>

            {user.subscription?.admin_notes && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">{t('adminDetails.adminNotes.title')}</h4>
                <p className="text-sm bg-gray-50 p-3 rounded">
                  {user.subscription.admin_notes}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chats" className="mt-4">
            <UserChatHistory userId={user.id} />
          </TabsContent>

          <TabsContent value="support" className="mt-4">
            <UserSupportHistory userId={user.id} />
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <div className="space-y-4">
              {/* Notizen hinzufügen */}
              <div>
                <h4 className="font-medium mb-2">{t('adminDetails.addNote.title')}</h4>
                <div className="space-y-2">
                  <Textarea
                    placeholder={t('adminDetails.addNote.placeholder')}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <Button 
                    onClick={() => addNote.mutate()}
                    disabled={!newNote.trim() || addNote.isPending}
                    size="sm"
                  >
                    {addNote.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {t('adminDetails.addNote.button')}
                  </Button>
                </div>
              </div>

              {/* Notizen-Historie */}
              {userNotes && userNotes.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">{t('adminDetails.noteHistory.title')}</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {userNotes.map((note) => (
                      <div key={note.id} className="text-sm bg-gray-50 p-3 rounded">
                        <p>{note.note}</p>
                        <p className="text-muted-foreground mt-1">
                          {formatDate(note.created_at)} {t('adminDetails.noteHistory.by')} {(note as any).admin_profiles?.email}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
