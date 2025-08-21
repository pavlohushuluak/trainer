import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { VideoUpload } from "./VideoUpload";
import { uploadVideo, VideoUploadResult } from "./utils/videoUpload";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePostModal = ({ isOpen, onClose }: CreatePostModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "hund",
    post_type: "question",
    pet_id: "none"
  });

  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

  // Get user's pets
  const { data: pets, isLoading: petsLoading } = useQuery({
    queryKey: ['user-pets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('id, name, species')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('❌ Error loading pets:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user && isOpen,
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: typeof formData & { video?: File }) => {
      if (!user) throw new Error('Not authenticated');

      // First create the post
      const { data: post, error: postError } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          title: postData.title.trim(),
          content: postData.content.trim(),
          category: postData.category,
          post_type: postData.post_type,
          pet_id: postData.pet_id === "none" ? null : postData.pet_id
        })
        .select()
        .single();

      if (postError) {
        console.error('❌ Error creating post:', postError);
        throw postError;
      }

      // If there's a video, upload it and update the post
      if (postData.video && post) {
        try {
          const videoResult: VideoUploadResult = await uploadVideo(
            postData.video,
            user.id,
            post.id
          );

          // Update post with video information
          const { error: updateError } = await supabase
            .from('community_posts')
            .update({
              video_url: videoResult.videoUrl,
              video_thumbnail_url: videoResult.thumbnailUrl,
              video_duration: Math.round(videoResult.duration || 0),
              video_size: videoResult.size
            })
            .eq('id', post.id);

          if (updateError) {
            console.error('❌ Error updating post with video:', updateError);
            throw updateError;
          }

        } catch (videoError) {
          // Delete the post if video upload fails
          await supabase.from('community_posts').delete().eq('id', post.id);
          throw videoError;
        }
      }
      
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast({
        title: t('community.createPost.toasts.success'),
        description: selectedVideo 
          ? t('community.createPost.toasts.successWithVideo')
          : t('community.createPost.toasts.successWithoutVideo'),
      });
      onClose();
      setFormData({
        title: "",
        content: "",
        category: "hund",
        post_type: "question",
        pet_id: "none"
      });
      setSelectedVideo(null);
    },
    onError: (error: any) => {
      toast({
        title: t('community.createPost.toasts.error'),
        description: error.message || t('community.createPost.toasts.errorDescription'),
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: t('community.createPost.toasts.missingFields'),
        description: t('community.createPost.toasts.missingFieldsDescription'),
        variant: "destructive"
      });
      return;
    }
    
    createPostMutation.mutate({ ...formData, video: selectedVideo || undefined });
  };

  const categories = [
    { value: "hund", label: t('community.createPost.category.dog') },
    { value: "katze", label: t('community.createPost.category.cat') },
    { value: "pferd", label: t('community.createPost.category.horse') },
    { value: "kleintiere", label: t('community.createPost.category.smallAnimals') },
    { value: "voegel", label: t('community.createPost.category.birds') },
    { value: "sonstige", label: t('community.createPost.category.other') }
  ];

  const postTypes = [
    { value: "question", label: t('community.createPost.postType.question'), icon: "❓" },
    { value: "tip", label: t('community.createPost.postType.tip'), icon: "💡" },
    { value: "success", label: t('community.createPost.postType.success'), icon: "🎉" },
    { value: "discussion", label: t('community.createPost.postType.discussion'), icon: "💬" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('community.createPost.label')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="post_type">{t('community.createPost.postType.label')}</Label>
              <Select 
                value={formData.post_type} 
                onValueChange={(value) => setFormData({ ...formData, post_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {postTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">{t('community.createPost.category.label')}</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="pet_id">{t('community.createPost.pet.label')}</Label>
            <Select 
              value={formData.pet_id} 
              onValueChange={(value) => setFormData({ ...formData, pet_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('community.createPost.pet.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('community.createPost.pet.noPet')}</SelectItem>
                {petsLoading && (
                  <SelectItem value="loading" disabled>
                    {t('community.createPost.pet.loading')}
                  </SelectItem>
                )}
                {pets && pets.map(pet => (
                  <SelectItem key={pet.id} value={pet.id}>
                    {pet.name} ({pet.species})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">{t('community.createPost.label')}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('community.createPost.title.placeholder')}
              maxLength={200}
            />
          </div>

          <div>
            <Label htmlFor="content">{t('community.createPost.content.label')}</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder={t('community.createPost.content.placeholder')}
              className="min-h-[120px]"
              maxLength={2000}
            />
            <div className="text-xs text-gray-500 mt-1">
              {t('community.createPost.content.charCount', { count: formData.content.length })}
            </div>
          </div>

          {/* Video Upload Section */}
          <VideoUpload 
            onVideoSelect={setSelectedVideo}
            selectedVideo={selectedVideo}
          />

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              {t('community.createPost.buttons.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={createPostMutation.isPending || !formData.title.trim() || !formData.content.trim()}
              className="w-full sm:w-auto"
            >
              {createPostMutation.isPending ? (
                selectedVideo ? t('community.createPost.buttons.uploadingVideo') : t('community.createPost.buttons.creating')
              ) : (
                t('community.createPost.buttons.publish')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
