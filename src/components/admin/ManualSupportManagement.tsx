/**
 * @fileoverview Manual Support Management - Admin component to view and respond to manual support requests
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Mail, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  Send, 
  Search,
  AlertCircle,
  User,
  Calendar,
  Flag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';
import { ManualSupportMessage, SupportMessageStatus, SupportMessagePriority } from '@/types/manualSupport';
import { format } from 'date-fns';

export const ManualSupportManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  
  const [statusFilter, setStatusFilter] = useState<'all' | SupportMessageStatus>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ManualSupportMessage | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch manual support messages
  const { data: messages, isLoading } = useQuery({
    queryKey: ['admin-manual-support', statusFilter, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('manual_support_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Client-side search
      let filteredData = data || [];
      if (searchQuery.trim()) {
        filteredData = filteredData.filter((msg: ManualSupportMessage) =>
          msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      return filteredData as ManualSupportMessage[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds for new messages
  });

  // Update message status to in_progress
  const markAsInProgressMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('manual_support_messages')
        .update({
          status: 'in_progress' as SupportMessageStatus,
          admin_id: user?.id,
        })
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-manual-support'] });
      toast({
        title: t('adminManualSupport.notifications.statusUpdated'),
        description: t('adminManualSupport.notifications.statusUpdatedDescription'),
      });
    },
  });

  // Respond to message and mark as completed
  const respondMutation = useMutation({
    mutationFn: async ({ messageId, response }: { messageId: string; response: string }) => {
      // Get the message details for email
      const { data: messageData, error: fetchError } = await supabase
        .from('manual_support_messages')
        .select('*')
        .eq('id', messageId)
        .single();

      if (fetchError) throw fetchError;

      // Update the message in database
      const { error: updateError } = await supabase
        .from('manual_support_messages')
        .update({
          admin_response: response,
          admin_responded_at: new Date().toISOString(),
          admin_id: user?.id,
          status: 'completed' as SupportMessageStatus,
        })
        .eq('id', messageId);

      if (updateError) throw updateError;

      // Send email notification to user
      try {
        const { data: emailData, error: emailError } = await supabase.functions.invoke('send-manual-support-response', {
          body: {
            userEmail: messageData.user_email,
            userName: messageData.user_name,
            subject: messageData.subject,
            userMessage: messageData.message,
            adminResponse: response,
            priority: messageData.priority,
            requestId: messageId,
          }
        });

        if (emailError) {
          console.error('Error sending email notification:', emailError);
          // Don't fail the whole operation if email fails
          toast({
            title: t('adminManualSupport.notifications.responseSaved'),
            description: t('adminManualSupport.notifications.responseSavedNoEmail'),
            variant: "default",
          });
        } else {
          console.log('Email notification sent successfully:', emailData);
        }
      } catch (emailException) {
        console.error('Email notification exception:', emailException);
        // Continue even if email fails
      }

      return messageData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-manual-support'] });
      setIsDialogOpen(false);
      setSelectedMessage(null);
      setAdminResponse('');
      toast({
        title: t('adminManualSupport.notifications.responseSuccess'),
        description: t('adminManualSupport.notifications.responseSuccessDescription'),
        duration: 5000,
      });
    },
    onError: (error) => {
      console.error('Error responding to support request:', error);
      toast({
        title: t('adminManualSupport.notifications.responseError'),
        description: t('adminManualSupport.notifications.responseErrorDescription'),
        variant: "destructive",
      });
    },
  });

  const handleRespond = (message: ManualSupportMessage) => {
    setSelectedMessage(message);
    setAdminResponse('');
    setIsDialogOpen(true);
  };

  const handleSubmitResponse = () => {
    if (!selectedMessage || !adminResponse.trim()) {
      toast({
        title: t('adminManualSupport.notifications.missingResponse'),
        description: t('adminManualSupport.notifications.missingResponseDescription'),
        variant: "destructive",
      });
      return;
    }

    respondMutation.mutate({
      messageId: selectedMessage.id,
      response: adminResponse.trim(),
    });
  };

  const getPriorityColor = (priority: SupportMessagePriority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 animate-pulse',
    };
    return colors[priority];
  };

  const getStatusBadge = (status: SupportMessageStatus) => {
    const config = {
      active: { icon: Clock, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: t('adminManualSupport.statusBadges.active') },
      in_progress: { icon: Loader2, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: t('adminManualSupport.statusBadges.inProgress') },
      completed: { icon: CheckCircle2, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: t('adminManualSupport.statusBadges.completed') },
    };

    const { icon: Icon, color, label } = config[status];

    return (
      <Badge className={color}>
        <Icon className={`h-3 w-3 mr-1 ${status === 'in_progress' ? 'animate-spin' : ''}`} />
        {label}
      </Badge>
    );
  };

  const activeCount = messages?.filter(m => m.status === 'active').length || 0;
  const inProgressCount = messages?.filter(m => m.status === 'in_progress').length || 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{t('adminManualSupport.title')}</h2>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm lg:text-base">
            {t('adminManualSupport.subtitle')}
          </p>
        </div>
        
        <div className="flex gap-1.5 sm:gap-2 flex-shrink-0 flex-wrap">
          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-xs sm:text-sm flex-shrink-0">
            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
            {activeCount} {t('adminManualSupport.statistics.active')}
          </Badge>
          <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-xs sm:text-sm flex-shrink-0">
            <Loader2 className="h-3 w-3 mr-1 flex-shrink-0" />
            {inProgressCount} {t('adminManualSupport.statistics.inProgress')}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 sm:pt-6 px-3 sm:px-4 lg:px-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  placeholder={t('adminManualSupport.filters.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 sm:pl-10 text-sm h-9 sm:h-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
                className="text-xs sm:text-sm min-h-[36px] touch-manipulation"
              >
                {t('adminManualSupport.filters.all')}
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
                size="sm"
                className="text-xs sm:text-sm min-h-[36px] touch-manipulation"
              >
                {t('adminManualSupport.filters.active')}
              </Button>
              <Button
                variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('in_progress')}
                size="sm"
                className="text-xs sm:text-sm min-h-[36px] touch-manipulation"
              >
                <span className="hidden sm:inline">{t('adminManualSupport.filters.inProgress')}</span>
                <span className="sm:hidden">{t('adminManualSupport.filters.inProgressShort')}</span>
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('completed')}
                size="sm"
                className="text-xs sm:text-sm min-h-[36px] touch-manipulation"
              >
                <span className="hidden sm:inline">{t('adminManualSupport.filters.completed')}</span>
                <span className="sm:hidden">{t('adminManualSupport.filters.completedShort')}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : messages && messages.length > 0 ? (
        <div className="grid gap-3 sm:gap-4">
          {messages.map((message) => (
            <Card key={message.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                      {getStatusBadge(message.status)}
                      <Badge className={getPriorityColor(message.priority)}>
                        <Flag className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                        <span className="text-[10px] sm:text-xs">{message.priority.toUpperCase()}</span>
                      </Badge>
                    </div>
                    <CardTitle className="text-sm sm:text-base lg:text-lg truncate">{message.subject}</CardTitle>
                    <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 mt-1.5 sm:mt-2 text-xs sm:text-sm">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{message.user_name || message.user_email}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        {format(new Date(message.created_at), 'PPp')}
                      </span>
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {message.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsInProgressMutation.mutate(message.id)}
                        disabled={markAsInProgressMutation.isPending}
                        className="text-xs sm:text-sm h-9 sm:h-9 min-h-[36px] touch-manipulation"
                      >
                        {markAsInProgressMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin flex-shrink-0" />
                        ) : (
                          <>
                            <span className="hidden sm:inline">{t('adminManualSupport.buttons.startWorking')}</span>
                            <span className="sm:hidden">{t('adminManualSupport.buttons.startWorkingShort')}</span>
                          </>
                        )}
                      </Button>
                    )}
                    {(message.status === 'active' || message.status === 'in_progress') && (
                      <Button
                        size="sm"
                        onClick={() => handleRespond(message)}
                        className="text-xs sm:text-sm h-9 sm:h-9 min-h-[36px] touch-manipulation"
                      >
                        <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                        {t('adminManualSupport.buttons.respond')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t('adminManualSupport.labels.userMessage')}</p>
                    <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{message.message}</p>
                  </div>

                  {message.admin_response && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-primary font-medium mb-1">{t('adminManualSupport.labels.yourResponse')}</p>
                      <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{message.admin_response}</p>
                      {message.admin_responded_at && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
                          {t('adminManualSupport.labels.responded')} {format(new Date(message.admin_responded_at), 'PPp')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Mail className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">{t('adminManualSupport.emptyState.title')}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {searchQuery ? t('adminManualSupport.emptyState.noResults') : t('adminManualSupport.emptyState.noMessages')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Response Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">{t('adminManualSupport.dialog.title')}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {t('adminManualSupport.dialog.description', { userName: selectedMessage?.user_name || selectedMessage?.user_email })}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-muted p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm font-medium mb-1">{t('adminManualSupport.dialog.userRequestLabel')}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">{selectedMessage.subject}</p>
                <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium mb-2 block">{t('adminManualSupport.dialog.responseLabel')}</label>
                <Textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder={t('adminManualSupport.dialog.responsePlaceholder')}
                  rows={8}
                  maxLength={2000}
                  className="resize-none text-sm"
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  {t('adminManualSupport.labels.characterCount', { count: adminResponse.length })}
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs sm:text-sm">
                  {t('adminManualSupport.dialog.alert')}
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedMessage(null);
                setAdminResponse('');
              }}
              className="w-full sm:w-auto text-sm min-h-[44px] sm:min-h-[40px] touch-manipulation"
            >
              {t('adminManualSupport.buttons.cancel')}
            </Button>
            <Button
              onClick={handleSubmitResponse}
              disabled={!adminResponse.trim() || respondMutation.isPending}
              className="w-full sm:w-auto text-sm min-h-[44px] sm:min-h-[40px] touch-manipulation"
            >
              {respondMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin flex-shrink-0" />
                  {t('adminManualSupport.buttons.sending')}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2 flex-shrink-0" />
                  {t('adminManualSupport.buttons.sendResponse')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

