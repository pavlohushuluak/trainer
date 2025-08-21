
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

interface VideoUploadAreaProps {
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const VideoUploadArea = ({ onFileSelect }: VideoUploadAreaProps) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
      <Upload className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
      <p className="text-foreground mb-4">
        {t('community.videoUpload.uploadArea.title')}
      </p>
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
        <Zap className="h-4 w-4 text-blue-500" />
        <span>{t('community.videoUpload.uploadArea.compression')}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {t('community.videoUpload.uploadArea.formats')}
      </p>
      <Input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/mov,video/avi,video/webm"
        onChange={onFileSelect}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
      >
        {t('community.videoUpload.uploadArea.selectButton')}
      </Button>
    </div>
  );
};
