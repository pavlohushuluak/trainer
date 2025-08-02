
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRewards?: any;
}

export const ShareSuccessModal = ({ isOpen, onClose, userRewards }: ShareSuccessModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    pet_id: ""
  });

  // Get user's pets
  const { data: pets } = useQuery({
    queryKey: ['user-pets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('id, name, species')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && isOpen,
  });

  const shareSuccessMutation = useMutation({
    mutationFn: async (postData: typeof formData) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          title: postData.title.trim(),
          content: postData.content.trim(),
          category: 'success',
          post_type: 'success',
          pet_id: postData.pet_id || null
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast({
        title: t('community.shareSuccess.toasts.success'),
        description: t('community.shareSuccess.toasts.successDescription'),
      });
      onClose();
      setFormData({ title: "", content: "", pet_id: "" });
    },
    onError: (error) => {
      toast({
        title: t('community.shareSuccess.toasts.error'),
        description: t('community.shareSuccess.toasts.errorDescription'),
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: t('community.shareSuccess.toasts.missingFields'),
        description: t('community.shareSuccess.toasts.missingFieldsDescription'),
        variant: "destructive"
      });
      return;
    }
    shareSuccessMutation.mutate(formData);
  };

  const generateSuccessTitle = () => {
    if (userRewards) {
      const suggestions = [
        `${userRewards.current_streak} Tage Streak erreicht! 🔥`,
        `Level ${Math.floor((userRewards.total_points || 0) / 100)} erreicht! 🏆`,
        `${userRewards.total_points} Punkte gesammelt! ⭐`,
        "Neuen Meilenstein erreicht! 🎯"
      ];
      return suggestions[Math.floor(Math.random() * suggestions.length)];
    }
    return "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            {t('community.shareSuccess.title.label')}
          </DialogTitle>
        </DialogHeader>

        {/* Rewards Summary */}
        {userRewards && (
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Star className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-yellow-700">{userRewards.total_points || 0}</div>
                  <div className="text-xs text-yellow-600">{t('community.shareSuccess.rewards.points')}</div>
                </div>
                <div>
                  <Target className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-orange-700">{userRewards.current_streak || 0}</div>
                  <div className="text-xs text-orange-600">{t('community.shareSuccess.rewards.streak')}</div>
                </div>
                <div>
                  <Trophy className="h-5 w-5 text-red-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-red-700">
                    {Array.isArray(userRewards.badges) ? userRewards.badges.length : 0}
                  </div>
                  <div className="text-xs text-red-600">{t('community.shareSuccess.rewards.badges')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {pets && pets.length > 0 && (
            <div>
              <Label htmlFor="pet_id">{t('community.shareSuccess.pet.label')}</Label>
              <select 
                className="w-full p-2 border rounded-md"
                value={formData.pet_id} 
                onChange={(e) => setFormData({ ...formData, pet_id: e.target.value })}
              >
                <option value="">{t('community.shareSuccess.pet.noPet')}</option>
                {pets.map(pet => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} ({pet.species})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <Label htmlFor="title">{t('community.shareSuccess.title.label')}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={generateSuccessTitle() || t('community.shareSuccess.title.placeholder')}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => setFormData({ ...formData, title: generateSuccessTitle() })}
            >
              {t('community.shareSuccess.title.generateButton')}
            </Button>
          </div>

          <div>
            <Label htmlFor="content">{t('community.shareSuccess.content.label')}</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder={t('community.shareSuccess.content.placeholder')}
              className="min-h-[120px]"
              maxLength={2000}
            />
            <div className="text-xs text-gray-500 mt-1">
              {t('community.shareSuccess.content.charCount', { count: formData.content.length })}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('community.shareSuccess.buttons.shareLater')}
            </Button>
            <Button 
              type="submit" 
              disabled={shareSuccessMutation.isPending || !formData.title.trim() || !formData.content.trim()}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              {shareSuccessMutation.isPending ? t('community.shareSuccess.buttons.sharing') : t('community.shareSuccess.buttons.shareSuccess')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
