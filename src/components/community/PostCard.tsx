
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, CheckCircle, Clock, User, Play, Trash2, MoreVertical, Maximize2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { CommentSection } from "./CommentSection";
import { VideoModal } from "./VideoModal";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PostCardProps {
  post: any;
}

// Demo-Nutzer-Namen für Posts ohne user_id
const getDemoAuthorName = (postId: string, t: (key: string) => string) => {
  const demoNames = {
    '11111111-1111-1111-1111-111111111111': 'Sarah M.',
    '22222222-2222-2222-2222-222222222222': 'Michael K.',
    '33333333-3333-3333-3333-333333333333': 'Lisa B.',
    '44444444-4444-4444-4444-444444444444': 'Thomas R.',
    '55555555-5555-5555-5555-555555555555': 'Anna W.',
    '66666666-6666-6666-6666-666666666666': 'Julia S.',
    '77777777-7777-7777-7777-777777777777': 'Alexander H.',
    '88888888-8888-8888-8888-888888888888': 'Christina L.',
    '99999999-9999-9999-9999-999999999999': 'Marcus T.',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa': 'Patricia F.',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb': 'Daniel N.',
    'cccccccc-cccc-cccc-cccc-cccccccccccc': 'Melanie K.',
    'dddddddd-dddd-dddd-dddd-dddddddddddd': 'Sebastian T.',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee': 'Jennifer P.',
    'ffffffff-ffff-ffff-ffff-ffffffffffff': 'Marco D.'
  };
  return demoNames[postId as keyof typeof demoNames] || t('community.postCard.user.petOwner');
};

// Utility functions
const getCategoryColor = (category: string) => {
  const colors = {
    'hund': 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:bg-blue-950/20',
    'katze': 'border-purple-200 text-purple-700 bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:bg-purple-950/20',
    'pferd': 'border-green-200 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950/20',
    'kleintiere': 'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:bg-orange-950/20',
    'voegel': 'border-cyan-200 text-cyan-700 bg-cyan-50 dark:border-cyan-700 dark:text-cyan-300 dark:bg-cyan-950/20',
    'sonstige': 'border-gray-200 text-gray-700 bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:bg-gray-950/20'
  };
  return colors[category as keyof typeof colors] || colors.sonstige;
};

const getCategoryLabel = (category: string, t: (key: string) => string) => {
  const labels = {
    'hund': t('community.postCard.categories.dog'),
    'katze': t('community.postCard.categories.cat'), 
    'pferd': t('community.postCard.categories.horse'),
    'kleintiere': t('community.postCard.categories.smallAnimals'),
    'voegel': t('community.postCard.categories.birds'),
    'sonstige': t('community.postCard.categories.other')
  };
  return labels[category as keyof typeof labels] || t('community.postCard.categories.general');
};

const getPostTypeIcon = (postType: string) => {
  const icons = {
    'question': '❓',
    'tip': '💡',
    'success': '🎉',
    'discussion': '💬'
  };
  return icons[postType as keyof typeof icons] || '📝';
};

export const PostCard = ({ post }: PostCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, currentLanguage } = useTranslations();
  const [showComments, setShowComments] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Check if current user is the post owner
  const isPostOwner = user?.id === post.user_id;

  // Video toggle handler
  const handleVideoToggle = () => {
    const videoElement = document.querySelector(`video[src="${post.video_url}"]`) as HTMLVideoElement;
    if (videoElement) {
      if (isVideoPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
    }
  };

  // Full window video handler
  const handleFullWindowVideo = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the video toggle
    setShowVideoModal(true);
  };

  // Fetch user profile only if post has a real user_id
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', post.user_id],
    queryFn: async () => {
      if (!post.user_id) return null; // Skip for demo posts
      
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', post.user_id)
        .maybeSingle();
      
      if (error) {
        return null;
      }
      return data;
    },
    enabled: !!post.user_id, // Only fetch if there's a real user_id
  });

  // Check if user has liked this post
  const { data: userLike } = useQuery({
    queryKey: ['post-like', post.id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Like/Unlike mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      if (userLike) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('id', userLike.id);
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({
            post_id: post.id,
            user_id: user.id
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      queryClient.invalidateQueries({ queryKey: ['post-like', post.id, user?.id] });
    },
    onError: (error) => {
      toast({
        title: t('community.postCard.toasts.actionError'),
        description: t('community.postCard.toasts.actionErrorDescription'),
        variant: "destructive"
      });
    }
  });

  // Delete post mutation with improved error handling
  const deletePostMutation = useMutation({
    mutationFn: async () => {
      if (!user || !isPostOwner) {
        throw new Error('Not authorized to delete this post');
      }

      try {
        // First delete video files from storage if they exist
        if (post.video_url) {
          
          // Extract the file path from the video URL
          const videoUrl = new URL(post.video_url);
          const pathSegments = videoUrl.pathname.split('/');
          const fileName = pathSegments[pathSegments.length - 1];
          const folderPath = pathSegments.slice(-3, -1).join('/'); // userId/postId
          
          // List of potential files to delete
          const filesToDelete = [`${folderPath}/${fileName}`];
          
          if (post.video_thumbnail_url) {
            filesToDelete.push(`${folderPath}/thumbnail.jpg`);
          }


          // Delete files from storage
          const { error: storageError } = await supabase.storage
            .from('community-videos')
            .remove(filesToDelete);

          if (storageError) {
            // Continue with post deletion even if file deletion fails
          } else {
          }
        }

        // Delete related comments first (due to foreign key constraints)
        const { error: commentsError } = await supabase
          .from('post_comments')
          .delete()
          .eq('post_id', post.id);

        if (commentsError) {
          throw new Error(`Fehler beim Löschen der Kommentare: ${commentsError.message}`);
        }

        // Delete related likes
        const { error: likesError } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id);

        if (likesError) {
          throw new Error(`Fehler beim Löschen der Likes: ${likesError.message}`);
        }

        // Finally delete the post itself
        const { error: postError } = await supabase
          .from('community_posts')
          .delete()
          .eq('id', post.id)
          .eq('user_id', user.id); // Double-check ownership

        if (postError) {
          throw new Error(`Fehler beim Löschen des Beitrags: ${postError.message}`);
        }

      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast({
        title: t('community.postCard.toasts.deleteSuccess'),
        description: t('community.postCard.toasts.deleteSuccessDescription'),
      });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast({
        title: t('community.postCard.toasts.deleteError'),
        description: error instanceof Error ? error.message : t('community.postCard.toasts.deleteErrorDescription'),
        variant: "destructive"
      });
    }
  });

  // Helper function to get file extension from URL
  const getFileExtensionFromUrl = (url: string): string => {
    const pathname = new URL(url).pathname;
    const extension = pathname.split('.').pop();
    return extension || 'mp4';
  };

  // Determine author name: use demo name for posts without user_id, otherwise use profile data
  const authorName = post.user_id 
    ? (userProfile 
        ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || t('community.postCard.user.petOwner')
        : t('community.postCard.user.petOwner'))
    : getDemoAuthorName(post.id, t);

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                <AvatarFallback>
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                  <span className="font-medium text-foreground text-sm sm:text-base truncate">{authorName}</span>
                  {post.pet_profiles && (
                    <span className="text-xs sm:text-sm text-muted-foreground truncate">
                      {(() => {
                        // Handle both array and object cases
                        const petProfile = Array.isArray(post.pet_profiles) 
                          ? post.pet_profiles[0] 
                          : post.pet_profiles;
                        
                        if (!petProfile) return null;
                        
                        const petName = petProfile.name || 'Unknown Pet';
                        const petSpecies = petProfile.species || 'Unknown Species';
                        
                        return `${t('community.postCard.withPet')} ${petName} (${petSpecies})`;
                      })()}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="truncate">
                    {formatDistanceToNow(new Date(post.created_at), { 
                      addSuffix: true, 
                      locale: currentLanguage === 'de' ? de : enUS 
                    })}
                  </span>
                  {post.is_solved && (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-3 w-3" />
                      <span className="text-xs">{t('community.postCard.solved')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Badge variant="outline" className={`text-xs ${getCategoryColor(post.category)}`}>
                <span className="hidden sm:inline">{getCategoryLabel(post.category, t)}</span>
                <span className="sm:hidden">{getCategoryLabel(post.category, t).split(' ')[0]}</span>
              </Badge>
              <span className="text-base sm:text-lg">{getPostTypeIcon(post.post_type)}</span>
              
              {/* Post Actions Menu - only show for post owner (real users only) */}
              {isPostOwner && post.user_id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('community.postCard.deletePost')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{post.title}</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 whitespace-pre-wrap">{post.content}</p>

          {/* Enhanced Video Section with Thumbnail */}
          {post.video_url && (
            <div className="mb-4">
              <div 
                className="relative bg-black rounded-lg overflow-hidden cursor-pointer w-full max-w-md mx-auto group"
                onClick={handleVideoToggle}
              >
                {/* Video with poster (thumbnail) */}
                <video
                  src={post.video_url}
                  poster={post.video_thumbnail_url || undefined}
                  className="w-full h-auto max-h-64 sm:max-h-96 object-cover"
                  controls={false}
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  onEnded={() => setIsVideoPlaying(false)}
                  preload="metadata"
                />
                
                {/* Play Overlay */}
                {!isVideoPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all">
                    <div className="bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 rounded-full p-2 sm:p-4 group-hover:scale-110 transition-transform">
                      <Play className="h-6 w-6 sm:h-8 sm:w-8 text-gray-800 dark:text-gray-200" />
                    </div>
                  </div>
                )}

                {/* Full Window Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFullWindowVideo}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white border border-white border-opacity-20 z-10"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>

                {/* Video Info */}
                {post.video_duration && (
                  <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 bg-black bg-opacity-70 text-white text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded">
                    {Math.floor(post.video_duration / 60)}:{(post.video_duration % 60).toString().padStart(2, '0')}
                  </div>
                )}

                {/* Thumbnail indicator */}
                {post.video_thumbnail_url && (
                  <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-black bg-opacity-70 text-white text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded flex items-center gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                    <span className="hidden sm:inline">{t('community.postCard.video.preview')}</span>
                    <span className="sm:hidden">Preview</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => likeMutation.mutate()}
                disabled={!user || likeMutation.isPending}
                className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${userLike ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}
              >
                <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${userLike ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{post.likes_count || 0}</span>
                <span className="sm:hidden">{post.likes_count || 0}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground"
              >
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{post.comments_count || 0}</span>
                <span className="sm:hidden">{post.comments_count || 0}</span>
              </Button>
            </div>
          </div>

          {showComments && (
            <CommentSection postId={post.id} />
          )}
        </CardContent>
      </Card>

      {/* Video Modal */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoUrl={post.video_url}
        videoTitle={post.title}
        posterUrl={post.video_thumbnail_url}
      />

      {/* Delete Confirmation Dialog - only for real users */}
      {post.user_id && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('community.postCard.deleteDialog.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('community.postCard.deleteDialog.description')}
                {post.video_url && (
                  <span className="block mt-2 text-sm">
                    {t('community.postCard.deleteDialog.videoWarning')}
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletePostMutation.isPending}>
                {t('community.postCard.deleteDialog.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletePostMutation.mutate()}
                disabled={deletePostMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deletePostMutation.isPending ? t('community.postCard.deleteDialog.deleting') : t('community.postCard.deleteDialog.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};
