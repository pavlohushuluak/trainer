/**
 * @fileoverview Manual Support Modal - Professional modal for submitting manual support requests
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mail,
  Send,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  Flag,
  X,
  Eye,
  EyeOff,
  ChevronDown,
  MessageSquare,
  History,
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';
import { ManualSupportMessage, CreateManualSupportMessage, SupportMessagePriority, SupportMessageStatus } from '@/types/manualSupport';
import { format } from 'date-fns';

interface ManualSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualSupportModal = ({ isOpen, onClose }: ManualSupportModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslations();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<SupportMessagePriority>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'new' | 'messages'>('new');
  const [isPollingActive, setIsPollingActive] = useState(false);

  // Reset to messages tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('new');
    }
  }, [isOpen]);

  // Fetch user's support messages
  const { data: allMessages, isLoading } = useQuery({
    queryKey: ['user-manual-support-messages', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('manual_support_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ManualSupportMessage[];
    },
    enabled: !!user && isOpen,
    refetchInterval: (query) => {
      if (!isOpen) {
        setIsPollingActive(false);
        return false;
      }
      
      // Check if there are any active or in_progress messages
      const messages = query.state.data as ManualSupportMessage[] | undefined;
      const hasActiveMessages = messages?.some(
        m => m.status === 'active' || m.status === 'in_progress'
      );
      
      // Update polling state
      if (hasActiveMessages !== isPollingActive) {
        setIsPollingActive(hasActiveMessages || false);
        
        if (hasActiveMessages) {
          console.log('📡 Manual Support: Started polling for active messages (every 20 seconds)');
        } else {
          console.log('✅ Manual Support: Stopped polling - all messages completed');
        }
      }
      
      // Poll every 20 seconds if there are active messages, otherwise stop polling
      return hasActiveMessages ? 20 * 1000 : false;
    },
  });

  // Statistics
  const stats = useMemo(() => {
    if (!allMessages) return { total: 0, active: 0, inProgress: 0, completed: 0, unviewed: 0 };

    return {
      total: allMessages.length,
      active: allMessages.filter(m => m.status === 'active').length,
      inProgress: allMessages.filter(m => m.status === 'in_progress').length,
      completed: allMessages.filter(m => m.status === 'completed').length,
      unviewed: allMessages.filter(m => m.status === 'completed' && !m.viewed_by_user).length,
    };
  }, [allMessages]);

  // Track previous messages to detect new responses
  const [previousMessages, setPreviousMessages] = useState<ManualSupportMessage[]>([]);

  // Notify user when admin responds
  useEffect(() => {
    if (!allMessages || !previousMessages.length) {
      if (allMessages) setPreviousMessages(allMessages);
      return;
    }

    // Check for newly completed messages
    const newlyCompleted = allMessages.filter(msg => {
      const prevMsg = previousMessages.find(pm => pm.id === msg.id);
      return prevMsg && 
             prevMsg.status !== 'completed' && 
             msg.status === 'completed' &&
             msg.admin_response;
    });

    // Show notification for each newly completed message
    newlyCompleted.forEach(msg => {
      console.log('🎉 Manual Support: New response received!', {
        subject: msg.subject,
        respondedAt: msg.admin_responded_at,
        previousStatus: previousMessages.find(pm => pm.id === msg.id)?.status,
        newStatus: msg.status
      });

      toast({
        title: `✅ ${t('support.manualSupport.notifications.responseReceived')}`,
        description: t('support.manualSupport.notifications.responseReceivedDescription', { subject: msg.subject }),
        duration: 8000,
      });

      // Auto-switch to messages tab if user is on new request tab
      if (activeTab === 'new') {
        setActiveTab('messages');
      }
    });

    // Update previous messages
    setPreviousMessages(allMessages);
  }, [allMessages, previousMessages, toast, activeTab]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Auto-mark completed messages as viewed when expanded
  useEffect(() => {
    if (!allMessages) return;

    const markAsViewed = async (messageId: string) => {
      try {
        await supabase
          .from('manual_support_messages')
          .update({ viewed_by_user: true })
          .eq('id', messageId);
        
        queryClient.invalidateQueries({ queryKey: ['user-manual-support-messages'] });
      } catch (error) {
        console.error('Error marking message as viewed:', error);
      }
    };

    // Mark expanded completed messages as viewed
    expandedIds.forEach((id) => {
      const msg = allMessages.find(m => m.id === id);
      if (msg && msg.status === 'completed' && !msg.viewed_by_user) {
        markAsViewed(id);
      }
    });
  }, [expandedIds, allMessages, queryClient]);

  const toggleExpanded = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  // Toggle viewed status
  const toggleViewedMutation = useMutation({
    mutationFn: async ({ messageId, viewed }: { messageId: string; viewed: boolean }) => {
      const { error } = await supabase
        .from('manual_support_messages')
        .update({ viewed_by_user: viewed })
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-manual-support-messages'] });
    },
  });

  // Submit support request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a subject and message.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newMessage: CreateManualSupportMessage = {
        subject: subject.trim(),
        message: message.trim(),
        priority,
      };

      const { error } = await supabase
        .from('manual_support_messages')
        .insert({
          user_id: user.id,
          user_email: user.email || '',
          user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          ...newMessage,
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['user-manual-support-messages'] });

      setSubject('');
      setMessage('');
      setPriority('normal');
      setActiveTab('messages'); // Switch to messages tab after submission

      toast({
        title: t('support.manualSupport.notifications.submittedSuccess'),
        description: t('support.manualSupport.notifications.submittedDescription'),
      });
    } catch (error) {
      console.error('Error submitting support request:', error);
      toast({
        title: t('support.manualSupport.notifications.submittedError'),
        description: t('support.manualSupport.notifications.submittedErrorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (priority: SupportMessagePriority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 animate-pulse',
    };

    const labels = {
      low: t('support.manualSupport.messages.priorityBadges.low'),
      normal: t('support.manualSupport.messages.priorityBadges.normal'),
      high: t('support.manualSupport.messages.priorityBadges.high'),
      urgent: t('support.manualSupport.messages.priorityBadges.urgent'),
    };

    return (
      <Badge className={`${colors[priority]} text-xs`}>
        <Flag className="h-3 w-3 mr-1" />
        {labels[priority]}
      </Badge>
    );
  };

  const getStatusBadge = (status: SupportMessageStatus) => {
    const config = {
      active: { icon: Clock, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: t('support.manualSupport.messages.statusBadges.active') },
      in_progress: { icon: Loader2, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: t('support.manualSupport.messages.statusBadges.inProgress') },
      completed: { icon: CheckCircle2, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: t('support.manualSupport.messages.statusBadges.completed') },
    };

    const { icon: Icon, color, label } = config[status];

    return (
      <Badge className={`${color} text-xs`}>
        <Icon className={`h-3 w-3 mr-1 ${status === 'in_progress' ? 'animate-spin' : ''}`} />
        {label}
      </Badge>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[100] p-3 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <Card 
        className="w-full max-w-3xl max-h-[90vh] min-h-[600px] flex flex-col bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="pb-3 px-4 py-4 sm:px-5 sm:py-4 lg:px-6 shrink-0 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-b rounded-t-md">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex-shrink-0 shadow-lg">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-xl font-bold truncate bg-gradient-to-r from-purple-700 to-pink-700 dark:from-purple-300 dark:to-pink-300 bg-clip-text text-transparent">
                  {t('support.manualSupport.modalTitle')}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                  {t('support.manualSupport.newRequest.description')}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {stats.unviewed > 0 && (
                <Badge className="bg-red-500 text-white text-xs animate-pulse shadow-lg">
                  {t('support.manualSupport.unreadBadge', { count: stats.unviewed })}
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose} 
                className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Statistics Bar */}
          {stats.total > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50">
                <MessageSquare className="h-3 w-3 mr-1" />
                {stats.total} {t('support.manualSupport.statistics.total')}
              </Badge>
              {stats.active > 0 && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  <Clock className="h-3 w-3 mr-1" />
                  {stats.active} {t('support.manualSupport.statistics.active')}
                </Badge>
              )}
              {stats.inProgress > 0 && (
                <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  {stats.inProgress} {t('support.manualSupport.statistics.inProgress')}
                </Badge>
              )}
              {stats.completed > 0 && (
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {stats.completed} {t('support.manualSupport.statistics.completed')}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'new' | 'messages')} className="h-full flex flex-col">
            <div className="px-4 pt-3 sm:px-5 lg:px-6 shrink-0 bg-background">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="new" className="text-xs sm:text-sm">
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  {t('support.manualSupport.tabs.newRequest')}
                </TabsTrigger>
                <TabsTrigger value="messages" className="text-xs sm:text-sm">
                  <History className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  {t('support.manualSupport.tabs.myMessages')}
                  {allMessages && allMessages.length > 0 && (
                    <Badge className="ml-2 bg-purple-500 text-white text-[10px] h-4 px-1">
                      {allMessages.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* New Request Tab */}
            <TabsContent value="new" className="flex-1 overflow-hidden m-0 data-[state=active]:flex data-[state=active]:flex-col">
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 sm:p-5 lg:p-6 min-h-full max-h-[60vh]">
                  {/* New Request Form */}
                  <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
                    <CardHeader className="pb-3 px-3 py-3 sm:px-4 sm:py-4">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Send className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                        {t('support.manualSupport.newRequest.title')}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {t('support.manualSupport.newRequest.description')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="subject" className="text-xs sm:text-sm font-medium">{t('support.manualSupport.newRequest.subjectRequired')}</Label>
                          <Input
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder={t('support.manualSupport.newRequest.subjectPlaceholder')}
                            required
                            maxLength={200}
                            className="mt-1.5 text-sm h-10"
                          />
                        </div>

                        <div>
                          <Label htmlFor="priority" className="text-xs sm:text-sm font-medium">{t('support.manualSupport.newRequest.priority')}</Label>
                          <Select value={priority} onValueChange={(value) => setPriority(value as SupportMessagePriority)}>
                            <SelectTrigger id="priority" className="mt-1.5 h-10 text-sm">
                              <SelectValue placeholder={t('support.manualSupport.newRequest.priorityPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent position="popper" sideOffset={5} className="z-[200]">
                              <SelectItem value="low">{t('support.manualSupport.newRequest.priorityLevels.low')}</SelectItem>
                              <SelectItem value="normal">{t('support.manualSupport.newRequest.priorityLevels.normal')}</SelectItem>
                              <SelectItem value="high">{t('support.manualSupport.newRequest.priorityLevels.high')}</SelectItem>
                              <SelectItem value="urgent">{t('support.manualSupport.newRequest.priorityLevels.urgent')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="message" className="text-xs sm:text-sm font-medium">{t('support.manualSupport.newRequest.messageRequired')}</Label>
                          <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t('support.manualSupport.newRequest.messagePlaceholder')}
                            required
                            rows={6}
                            maxLength={2000}
                            className="mt-1.5 resize-none text-sm"
                          />
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {t('support.manualSupport.newRequest.characterCount', { count: message.length })}
                          </p>
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmitting || !subject.trim() || !message.trim()}
                          className="w-full h-11 text-sm sm:text-base font-medium bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                              {t('support.manualSupport.newRequest.submitting')}
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                              {t('support.manualSupport.newRequest.submitButton')}
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="flex-1 overflow-hidden m-0 data-[state=active]:flex data-[state=active]:flex-col">
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 sm:p-5 lg:p-6 min-h-full max-h-[60vh]">
                  {/* Polling Indicator */}
                  {isPollingActive && (
                    <Alert className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                      <AlertDescription className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                        {t('support.manualSupport.messages.pollingIndicator')}
                      </AlertDescription>
                    </Alert>
                  )}

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : allMessages && allMessages.length > 0 ? (
                    <div className="space-y-3">
                      {allMessages.map((msg) => (
                        <Collapsible
                          key={msg.id}
                          open={expandedIds.has(msg.id)}
                          onOpenChange={() => toggleExpanded(msg.id)}
                        >
                          <Card
                            className={`transition-all hover:shadow-md ${
                              !msg.viewed_by_user && msg.status === 'completed'
                                ? 'border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 shadow-lg'
                                : ''
                            }`}
                          >
                            <CollapsibleTrigger asChild>
                              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors px-4 py-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                      {getStatusBadge(msg.status)}
                                      {getPriorityBadge(msg.priority)}
                                      {!msg.viewed_by_user && msg.status === 'completed' && (
                                        <Badge className="bg-red-500 text-white text-[10px] animate-pulse">
                                          {t('support.manualSupport.messages.newResponse')}
                                        </Badge>
                                      )}
                                    </div>
                                    <CardTitle className="text-sm sm:text-base font-semibold truncate">
                                      {msg.subject}
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-1">
                                      {format(new Date(msg.created_at), 'MMM d, yyyy • h:mm a')}
                                    </CardDescription>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {msg.status === 'completed' && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleViewedMutation.mutate({
                                            messageId: msg.id,
                                            viewed: !msg.viewed_by_user,
                                          });
                                        }}
                                        className="h-7 w-7 p-0"
                                        disabled={toggleViewedMutation.isPending}
                                      >
                                        {msg.viewed_by_user ? (
                                          <Eye className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                          <EyeOff className="h-4 w-4 text-purple-600" />
                                        )}
                                      </Button>
                                    )}
                                    <ChevronDown
                                      className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                                        expandedIds.has(msg.id) ? 'rotate-180' : ''
                                      }`}
                                    />
                                  </div>
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <Separator />
                              <CardContent className="px-4 py-4 space-y-4">
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">{t('support.manualSupport.messages.yourMessage')}</Label>
                                  <div className="mt-1.5 p-3 bg-muted/50 rounded-lg border">
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                      {msg.message}
                                    </p>
                                  </div>
                                </div>

                                {msg.status === 'active' && (
                                  <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                    <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <AlertDescription className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                                      {t('support.manualSupport.messages.statusAlerts.active')}
                                    </AlertDescription>
                                  </Alert>
                                )}

                                {msg.status === 'in_progress' && (
                                  <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                                    <Loader2 className="h-4 w-4 animate-spin text-yellow-600 dark:text-yellow-400" />
                                    <AlertDescription className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
                                      {t('support.manualSupport.messages.statusAlerts.inProgress')}
                                    </AlertDescription>
                                  </Alert>
                                )}

                                {msg.admin_response && (
                                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-2 border-purple-200 dark:border-purple-700 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <Label className="text-xs sm:text-sm font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" />
                                        {t('support.manualSupport.messages.responseTitle')}
                                      </Label>
                                      {msg.admin_responded_at && (
                                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                                          {format(new Date(msg.admin_responded_at), 'MMM d, h:mm a')}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                      {msg.admin_response}
                                    </p>
                                  </div>
                                )}
                              </CardContent>
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <MessageSquare className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 className="text-base sm:text-lg font-semibold mb-2">{t('support.manualSupport.messages.emptyState.title')}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                          {t('support.manualSupport.messages.emptyState.description')}
                        </p>
                        <Button
                          onClick={() => setActiveTab('new')}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {t('support.manualSupport.messages.emptyState.button')}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

