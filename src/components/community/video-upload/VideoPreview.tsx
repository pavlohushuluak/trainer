
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, X, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

interface VideoPreviewProps {
  videoPreviewUrl: string;
  selectedVideo: File;
  originalFileSize: number | null;
  onRemoveVideo: () => void;
  onVideoLoadedMetadata: () => void;
}

export const VideoPreview = ({
  videoPreviewUrl,
  selectedVideo,
  originalFileSize,
  onRemoveVideo,
  onVideoLoadedMetadata
}: VideoPreviewProps) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden max-w-sm mx-auto">
        <video
          ref={videoRef}
          src={videoPreviewUrl}
          className="w-full h-auto max-h-80 object-cover"
          onLoadedMetadata={onVideoLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
        
        {/* Play/Pause Overlay */}
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 cursor-pointer"
          onClick={togglePlayPause}
        >
          {!isPlaying && (
            <div className="bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 rounded-full p-3">
              <Play className="h-8 w-8 text-gray-800 dark:text-gray-200" />
            </div>
          )}
        </div>

        {/* Remove Button */}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2"
          onClick={onRemoveVideo}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p className="font-medium">{selectedVideo.name}</p>
        <div className="flex items-center justify-center gap-2">
          <span>{(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB</span>
          {originalFileSize && originalFileSize > selectedVideo.size && (
            <>
              <span className="text-muted-foreground/60">•</span>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <Zap className="h-3 w-3" />
                <span className="text-xs">
                  {t('community.videoUpload.preview.compressed', { percent: ((originalFileSize - selectedVideo.size) / originalFileSize * 100).toFixed(0) })}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
