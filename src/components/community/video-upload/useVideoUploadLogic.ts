
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/hooks/useTranslations";
import { compressVideo, CompressionProgress, DEFAULT_COMPRESSION_OPTIONS } from "../utils/videoCompression";
import { useVideoValidation } from "./videoValidation";

export const useVideoUploadLogic = (onVideoSelect: (file: File | null) => void) => {
  const { toast } = useToast();
  const { t } = useTranslations();
  const { validateVideoFile } = useVideoValidation();
  
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<CompressionProgress | null>(null);
  const [originalFileSize, setOriginalFileSize] = useState<number | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    console.log('🎬 Video file selected:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    if (!validateVideoFile(file)) return;

    setOriginalFileSize(file.size);

    // Decide if compression is needed
    const shouldCompress = file.size > DEFAULT_COMPRESSION_OPTIONS.maxSizeMB * 1024 * 1024;

    console.log('📊 Compression decision:', {
      shouldCompress,
      fileSizeMB: (file.size / (1024 * 1024)).toFixed(1),
      maxSizeMB: DEFAULT_COMPRESSION_OPTIONS.maxSizeMB
    });

    if (shouldCompress) {
      setIsCompressing(true);
      
      try {
        console.log('🔄 Starting video compression...');
        
        const compressedFile = await compressVideo(
          file,
          DEFAULT_COMPRESSION_OPTIONS,
          (progress) => {
            console.log('📈 Compression progress:', progress);
            setCompressionProgress(progress);
          }
        );

        console.log('✅ Video compression completed:', {
          originalSize: (file.size / (1024 * 1024)).toFixed(1) + 'MB',
          compressedSize: (compressedFile.size / (1024 * 1024)).toFixed(1) + 'MB',
          compressionRatio: ((1 - compressedFile.size / file.size) * 100).toFixed(1) + '%'
        });

        // Create preview URL
        const url = URL.createObjectURL(compressedFile);
        setVideoPreviewUrl(url);
        onVideoSelect(compressedFile);

        toast({
          title: t('community.videoUpload.logic.compressionSuccess.title'),
          description: t('community.videoUpload.logic.compressionSuccess.description', {
            originalSize: (file.size / (1024 * 1024)).toFixed(1),
            compressedSize: (compressedFile.size / (1024 * 1024)).toFixed(1)
          }),
        });

      } catch (error) {
        console.error('❌ Video compression failed:', error);
        
        toast({
          title: t('community.videoUpload.logic.compressionFailed.title'),
          description: t('community.videoUpload.logic.compressionFailed.description'),
          variant: "destructive"
        });

        // Fallback: Use original file
        console.log('🔄 Using original file as fallback');
        const url = URL.createObjectURL(file);
        setVideoPreviewUrl(url);
        onVideoSelect(file);
      } finally {
        setIsCompressing(false);
        setCompressionProgress(null);
      }
    } else {
      // No compression needed
      console.log('✅ No compression needed, using original file');
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
