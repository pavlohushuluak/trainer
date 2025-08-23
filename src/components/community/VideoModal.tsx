import React, { useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/useTranslations';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoTitle?: string;
  posterUrl?: string;
}

export const VideoModal = ({ isOpen, onClose, videoUrl, videoTitle, posterUrl }: VideoModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { t } = useTranslations();

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Pause video when modal closes
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90" style={{margin: '0'}}>
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white border border-white border-opacity-20"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Video container */}
        <div className="relative w-full max-w-6xl max-h-full">
          {/* Video title */}
          {videoTitle && (
            <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md text-sm">
              {videoTitle}
            </div>
          )}

          {/* Video element */}
          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterUrl}
            className="w-full h-auto max-h-[90vh] rounded-lg shadow-2xl"
            controls
            autoPlay
            preload="metadata"
            controlsList="nodownload"
          />
        </div>

        {/* Click outside to close overlay */}
        <div 
          className="absolute inset-0 -z-10" 
          onClick={onClose}
        />
      </div>
    </div>
  );
};
