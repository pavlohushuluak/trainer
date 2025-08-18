import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface CommentSectionProps {
  postId: string;
}

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, currentLanguage } = useTranslations();
  const [newComment, setNewComment] = useState("");

  const { data: comments, isLoading } = useQuery({
    queryKey: ['post-comments', postId],
    queryFn: async () => {
      // First get the comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Then get the profiles for each comment
      const commentsWithProfiles = await Promise.all(
        commentsData.map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', comment.user_id)
            .single();

          return {
            ...comment,
            profiles: profile
          };
        })
      );

      return commentsWithProfiles;
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast({
        title: t('community.comments.toasts.success'),
        description: t('community.comments.toasts.successDescription'),
      });
    },
    onError: (error) => {
      toast({
        title: t('community.comments.toasts.error'),
        description: t('community.comments.toasts.errorDescription'),
        variant: "destructive"
      });
    }
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    createCommentMutation.mutate(newComment);
  };

  if (isLoading) {
    return <div className="mt-4 text-center text-gray-500 dark:text-gray-400">{t('community.comments.loading')}</div>;
  }

  const commentCount = comments?.length ?? 0;
  
  return (
    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4 text-base sm:text-lg">
        {t('community.comments.title', { count: commentCount })}
      </h4>

      {/* Comments List */}
      <div className="space-y-4 mb-4 -mx-2 sm:mx-0">
        {comments?.map((comment) => {
          const authorName = comment.profiles 
            ? `${comment.profiles.first_name || ''} ${comment.profiles.last_name || ''}`.trim() || t('community.comments.unknownUser')
            : t('community.comments.unknownUser');

          return (
            <div key={comment.id} className="flex space-x-3 px-2 sm:px-0">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="text-xs">
                  {authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{authorName}</span>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span className="hidden sm:inline">
                        {formatDistanceToNow(new Date(comment.created_at), { 
                          addSuffix: true, 
                          locale: currentLanguage === 'de' ? de : enUS 
                        })}
                      </span>
                      <span className="sm:hidden">
                        {formatDistanceToNow(new Date(comment.created_at), { 
                          addSuffix: true, 
                          locale: currentLanguage === 'de' ? de : enUS 
                        }).replace(' ago', '').replace(' vor', '')}
                      </span>
                    </span>
                    {comment.is_solution && (
                      <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs flex-shrink-0">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">{t('community.comments.solution')}</span>
                        <span className="sm:hidden">✓</span>
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">{comment.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Comment Form */}
      {user && (
        <div className="flex space-x-3 px-2 sm:px-0">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="text-xs">DU</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2 min-w-0">
            <Textarea
              placeholder={t('community.comments.placeholder')}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none w-full"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || createCommentMutation.isPending}
                size="sm"
                className="w-full sm:w-auto"
              >
                {createCommentMutation.isPending ? t('community.comments.posting') : t('community.comments.comment')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
