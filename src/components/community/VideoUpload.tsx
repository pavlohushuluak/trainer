
import React from "react";
import { Label } from "@/components/ui/label";
import { VideoCompressionProgress } from "./VideoCompressionProgress";
import { VideoPreview } from "./video-upload/VideoPreview";
import { VideoUploadArea } from "./video-upload/VideoUploadArea";
import { useVideoUploadLogic } from "./video-upload/useVideoUploadLogic";
import { useTranslation } from "react-i18next";

interface VideoUploadProps {
  onVideoSelect: (file: File | null) => void;
  selectedVideo: File | null;
}

export const VideoUpload = ({ onVideoSelect, selectedVideo }: VideoUploadProps) => {
  const { t } = useTranslation();
  const {
    videoPreviewUrl,
    isCompressing,
    compressionProgress,
    originalFileSize,
    handleFileSelect,
    handleRemoveVideo,
    handleVideoLoadedMetadata
  } = useVideoUploadLogic(onVideoSelect);

  // Show compression progress
  if (isCompressing && compressionProgress) {
    return (
      <div className="space-y-4">
        <Label>{t('community.videoUpload.compressing')}</Label>
        <VideoCompressionProgress 
          progress={compressionProgress}
          fileName={selectedVideo?.name || 'Video'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label>{t('community.videoUpload.label')}</Label>
      
      {!selectedVideo ? (
        <VideoUploadArea onFileSelect={handleFileSelect} />
      ) : (
        <VideoPreview
          videoPreviewUrl={videoPreviewUrl!}
          selectedVideo={selectedVideo}
          originalFileSize={originalFileSize}
          onRemoveVideo={handleRemoveVideo}
          onVideoLoadedMetadata={handleVideoLoadedMetadata}
        />
      )}
    </div>
  );
};
