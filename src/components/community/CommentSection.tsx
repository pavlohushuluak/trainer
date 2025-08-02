import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface CommentSectionProps {
  postId: string;
}

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
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
    return <div className="mt-4 text-center text-gray-500">{t('community.comments.loading')}</div>;
  }

  return (
    <div className="mt-6 pt-4 border-t">
      <h4 className="font-medium text-gray-900 mb-4">
        {t('community.comments.title', { count: comments?.length || 0 })}
      </h4>

      {/* Comments List */}
      <div className="space-y-4 mb-4">
        {comments?.map((comment) => {
          const authorName = comment.profiles 
            ? `${comment.profiles.first_name || ''} ${comment.profiles.last_name || ''}`.trim() || t('community.comments.unknownUser')
            : t('community.comments.unknownUser');

          return (
            <div key={comment.id} className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900">{authorName}</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: de })}
                  </span>
                  {comment.is_solution && (
                    <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t('community.comments.solution')}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Comment Form */}
      {user && (
        <div className="flex space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">DU</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder={t('community.comments.placeholder')}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || createCommentMutation.isPending}
                size="sm"
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
