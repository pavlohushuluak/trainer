
import { useToast } from "@/hooks/use-toast";

export const useVideoValidation = () => {
  const { toast } = useToast();

  const validateVideoFile = (file: File): boolean => {
    // Validate file type
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Ungültiges Dateiformat",
        description: "Bitte wähle eine MP4, MOV, AVI oder WebM Datei aus.",
        variant: "destructive"
      });
      return false;
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast({
        title: "Datei zu groß",
        description: "Das Video darf maximal 50MB groß sein.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  return { validateVideoFile };
};
