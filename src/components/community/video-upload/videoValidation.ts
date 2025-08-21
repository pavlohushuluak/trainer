
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/hooks/useTranslations";

export const useVideoValidation = () => {
  const { toast } = useToast();
  const { t } = useTranslations();

  const validateVideoFile = (file: File): boolean => {
    console.log('🔍 Validating video file:', {
      name: file.name,
      type: file.type,
      size: (file.size / (1024 * 1024)).toFixed(1) + 'MB'
    });

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ Invalid file type:', file.type);
      toast({
        title: t('community.videoUpload.validation.invalidFormat.title'),
        description: t('community.videoUpload.validation.invalidFormat.description'),
        variant: "destructive"
      });
      return false;
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      console.error('❌ File too large:', (file.size / (1024 * 1024)).toFixed(1) + 'MB');
      toast({
        title: t('community.videoUpload.validation.fileTooLarge.title'),
        description: t('community.videoUpload.validation.fileTooLarge.description'),
        variant: "destructive"
      });
      return false;
    }

    console.log('✅ Video file validation passed');
    return true;
  };

  return { validateVideoFile };
};
