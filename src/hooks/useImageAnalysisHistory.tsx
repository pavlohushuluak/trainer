import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';

interface ImageAnalysisHistory {
  id: string;
  user_id: string;
  pet_id: string | null;
  image_url: string | null;
  analysis_result: any;
  created_at: string;
  updated_at: string;
  pet_profiles?: {
    name: string;
    species: string;
  } | null;
}

export const useImageAnalysisHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslations();
  const queryClient = useQueryClient();

  // Fetch image analysis history
  const { data: history = [], isLoading, error, refetch } = useQuery({
    queryKey: ['image-analysis-history', user?.id],
    queryFn: async (): Promise<ImageAnalysisHistory[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('image_analysis_history')
        .select(`
          *,
          pet_profiles(name, species)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000
  });

  // Save analysis to history
  const saveAnalysisMutation = useMutation({
    mutationFn: async (analysisData: {
      petId: string | null;
      imageUrl?: string;
      analysisResult: any;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('image_analysis_history')
        .insert({
          user_id: user.id,
          pet_id: analysisData.petId,
          image_url: analysisData.imageUrl || null,
          analysis_result: analysisData.analysisResult
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['image-analysis-history'] });
      toast({
        title: t('imageAnalysis.history.saved.title'),
        description: t('imageAnalysis.history.saved.description'),
      });
    },
    onError: () => {
      toast({
        title: t('imageAnalysis.history.saveError.title'),
        description: t('imageAnalysis.history.saveError.description'),
        variant: "destructive",
      });
    }
  });

  // Delete analysis from history
  const deleteAnalysisMutation = useMutation({
    mutationFn: async (analysisId: string) => {
      const { error } = await supabase
        .from('image_analysis_history')
        .delete()
        .eq('id', analysisId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['image-analysis-history'] });
      toast({
        title: t('imageAnalysis.history.deleted.title'),
        description: t('imageAnalysis.history.deleted.description'),
      });
    },
    onError: () => {
      toast({
        title: t('imageAnalysis.history.deleteError.title'),
        description: t('imageAnalysis.history.deleteError.description'),
        variant: "destructive",
      });
    }
  });

  const saveAnalysis = (petId: string | null, imageUrl: string | undefined, analysisResult: any) => {
    return saveAnalysisMutation.mutateAsync({
      petId,
      imageUrl,
      analysisResult
    });
  };

  const deleteAnalysis = (analysisId: string) => {
    return deleteAnalysisMutation.mutateAsync(analysisId);
  };

  return {
    history,
    isLoading,
    error,
    refetch,
    saveAnalysis,
    deleteAnalysis,
    isSaving: saveAnalysisMutation.isPending,
    isDeleting: deleteAnalysisMutation.isPending
  };
}; 