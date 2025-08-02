
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { compressVideo, CompressionProgress, DEFAULT_COMPRESSION_OPTIONS } from "../utils/videoCompression";
import { useVideoValidation } from "./videoValidation";

export const useVideoUploadLogic = (onVideoSelect: (file: File | null) => void) => {
  const { toast } = useToast();
  const { validateVideoFile } = useVideoValidation();
  
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<CompressionProgress | null>(null);
  const [originalFileSize, setOriginalFileSize] = useState<number | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    if (!validateVideoFile(file)) return;

    setOriginalFileSize(file.size);

    // Entscheide ob Komprimierung nötig ist
    const shouldCompress = file.size > DEFAULT_COMPRESSION_OPTIONS.maxSizeMB * 1024 * 1024;

    if (shouldCompress) {
      setIsCompressing(true);
      
      try {
        
        const compressedFile = await compressVideo(
          file,
          DEFAULT_COMPRESSION_OPTIONS,
          (progress) => setCompressionProgress(progress)
        );

        // Create preview URL
        const url = URL.createObjectURL(compressedFile);
        setVideoPreviewUrl(url);
        onVideoSelect(compressedFile);

        toast({
          title: "Video komprimiert!",
          description: `Dateigröße reduziert von ${(file.size / (1024 * 1024)).toFixed(1)}MB auf ${(compressedFile.size / (1024 * 1024)).toFixed(1)}MB`,
        });

      } catch (error) {
        
        toast({
          title: "Komprimierung fehlgeschlagen",
          description: "Das Video wird in Originalgröße verwendet.",
          variant: "destructive"
        });

        // Fallback: Use original file
        const url = URL.createObjectURL(file);
        setVideoPreviewUrl(url);
        onVideoSelect(file);
      } finally {
        setIsCompressing(false);
        setCompressionProgress(null);
      }
    } else {
      // No compression needed
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
      onVideoSelect(file);
    }
  };

  const handleRemoveVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(null);
    }
    onVideoSelect(null);
    setOriginalFileSize(null);
  };

  const handleVideoLoadedMetadata = () => {
    // This function can be extended if needed for metadata handling
    
  };

  return {
    videoPreviewUrl,
    isCompressing,
    compressionProgress,
    originalFileSize,
    handleFileSelect,
    handleRemoveVideo,
    handleVideoLoadedMetadata
  };
};
