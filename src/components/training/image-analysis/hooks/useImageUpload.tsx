
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface UseImageUploadProps {
  onUploadComplete: (result: any) => void;
  petName: string;
  petSpecies: string;
  canAnalyze: boolean;
  incrementUsage: () => Promise<boolean>;
}

export const useImageUpload = ({
  onUploadComplete,
  petName,
  petSpecies,
  canAnalyze,
  incrementUsage
}: UseImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  const validateFile = (file: File): boolean => {
    if (!canAnalyze) {
      toast({
        title: t('training.toasts.imageAnalysis.limitReached.title'),
        description: t('training.toasts.imageAnalysis.limitReached.description'),
        variant: "destructive"
      });
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: t('training.toasts.imageAnalysis.fileTooLarge.title'),
        description: t('training.toasts.imageAnalysis.fileTooLarge.description'),
        variant: "destructive"
      });
      return false;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: t('training.toasts.imageAnalysis.invalidFormat.title'),
        description: t('training.toasts.imageAnalysis.invalidFormat.description'),
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      setUploadError(null);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            resolve(result);
          } else {
            reject(new Error(t('training.toasts.imageAnalysis.fileReadError')));
          }
        };
        reader.onerror = () => reject(new Error(t('training.toasts.imageAnalysis.fileReadError')));
        reader.readAsDataURL(file);
      });

      
      const { data, error } = await supabase.functions.invoke('analyze-animal-image', {
        body: { 
          image: base64,
          petName: petName,
          petSpecies: petSpecies
        }
      });

      if (error) {
        console.error('❌ Analysis error:', error);
        throw new Error(error.message || t('training.toasts.imageAnalysis.analysisError.description'));
      }

      if (!data) {
        throw new Error(t('training.toasts.imageAnalysis.noDataError'));
      }

      
      
      // Update usage for free users
      console.log('🔍 useImageUpload - About to increment usage');
      const usageUpdated = await incrementUsage();
      console.log('🔍 useImageUpload - Usage increment result:', usageUpdated);
      if (!usageUpdated) {
        console.warn('⚠️ Usage counter could not be updated');
      }
      
      toast({
        title: t('training.toasts.imageAnalysis.analysisSuccess.title'),
        description: t('training.toasts.imageAnalysis.analysisSuccess.description', { petName }),
      });

      onUploadComplete(data);
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      const errorMessage = error.message || t('training.toasts.imageAnalysis.uploadError.description');
      setUploadError(errorMessage);
      
      toast({
        title: t('training.toasts.imageAnalysis.uploadError.title'),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetUpload = () => {
    setPreviewUrl(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    isUploading,
    previewUrl,
    uploadError,
    fileInputRef,
    handleFileSelect,
    handleUpload,
    triggerFileInput,
    resetUpload
  };
};
