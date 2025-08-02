
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Video } from "lucide-react";
import { CompressionProgress } from "./utils/videoCompression";
import { useTranslation } from "react-i18next";

interface VideoCompressionProgressProps {
  progress: CompressionProgress;
  fileName: string;
}

export const VideoCompressionProgress = ({ 
  progress, 
  fileName 
}: VideoCompressionProgressProps) => {
  const { t } = useTranslation();
  const getStageText = (stage: CompressionProgress['stage']): string => {
    switch (stage) {
      case 'loading':
        return t('community.videoUpload.compressionProgress.stages.loading');
      case 'compressing':
        return t('community.videoUpload.compressionProgress.stages.compressing');
      case 'finalizing':
        return t('community.videoUpload.compressionProgress.stages.finalizing');
      default:
        return t('community.videoUpload.compressionProgress.stages.processing');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
            {progress.progress < 100 ? (
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            ) : (
              <Video className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{t('community.videoUpload.compressionProgress.title')}</h3>
            <p className="text-sm text-gray-600 truncate">{fileName}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{getStageText(progress.stage)}</span>
            <span className="text-gray-900 font-medium">{Math.round(progress.progress)}%</span>
          </div>
          <Progress value={progress.progress} className="h-2" />
        </div>

        {progress.stage === 'compressing' && (
          <p className="text-xs text-gray-500 mt-3 text-center">
            {t('community.videoUpload.compressionProgress.timeNote')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
