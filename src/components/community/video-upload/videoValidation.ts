
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/hooks/useTranslations";

export const useVideoValidation = () => {
  const { toast } = useToast();
  const { t } = useTranslations();

  const validateVideoFile = (file: File): boolean => {
    // Validate file type
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
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
      toast({
        title: t('community.videoUpload.validation.fileTooLarge.title'),
        description: t('community.videoUpload.validation.fileTooLarge.description'),
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  return { validateVideoFile };
};
