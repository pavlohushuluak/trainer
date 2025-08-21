
export interface CompressionOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  maxSizeMB: number;
}

export interface CompressionProgress {
  progress: number;
  stage: 'loading' | 'compressing' | 'finalizing';
}

export const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  maxWidth: 1280,
  maxHeight: 720,
  quality: 0.8,
  maxSizeMB: 25 // Ziel: 25MB statt 50MB
};

export const compressVideo = async (
  file: File,
  options: CompressionOptions = DEFAULT_COMPRESSION_OPTIONS,
  onProgress?: (progress: CompressionProgress) => void
): Promise<File> => {

  // Check if MediaRecorder is supported
  if (!window.MediaRecorder) {
    console.warn('⚠️ MediaRecorder not supported, returning original file');
    return file;
  }

  // Wenn die Datei bereits klein genug ist, keine Komprimierung nötig
  if (file.size <= options.maxSizeMB * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('❌ Canvas context not available');
      reject(new Error('Canvas context not available'));
      return;
    }

    if (!canvas.captureStream) {
      console.error('❌ Canvas captureStream not supported');
      reject(new Error('Video compression not supported in this browser'));
      return;
    }

    onProgress?.({ progress: 10, stage: 'loading' });

    video.onloadedmetadata = () => {
      // Berechne neue Dimensionen
      const { width, height } = calculateDimensions(
        video.videoWidth,
        video.videoHeight,
        options.maxWidth,
        options.maxHeight
      );

      canvas.width = width;
      canvas.height = height;

      onProgress?.({ progress: 30, stage: 'compressing' });

      // Erstelle MediaRecorder für Komprimierung
      const stream = canvas.captureStream(30); // 30 FPS
      
      // Check for supported MIME types
      const supportedTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4'
      ];
      
      let selectedMimeType = 'video/webm';
      for (const mimeType of supportedTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: calculateBitrate(options.maxSizeMB, video.duration)
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        onProgress?.({ progress: 90, stage: 'finalizing' });

        const compressedBlob = new Blob(chunks, { type: selectedMimeType });
        const fileExtension = selectedMimeType.includes('webm') ? 'webm' : 'mp4';
        const compressedFile = new File([compressedBlob], 
          file.name.replace(/\.[^/.]+$/, `.${fileExtension}`), 
          { type: selectedMimeType }
        );



        onProgress?.({ progress: 100, stage: 'finalizing' });
        resolve(compressedFile);
      };

      mediaRecorder.onerror = (error) => {
        reject(error);
      };

      // Starte Aufnahme
      mediaRecorder.start();

      // Spiele Video ab und zeichne auf Canvas
      let currentTime = 0;
      const frameRate = 1 / 30; // 30 FPS

      const drawFrame = () => {
        if (currentTime >= video.duration) {
          mediaRecorder.stop();
          return;
        }

        video.currentTime = currentTime;
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, width, height);
          currentTime += frameRate;
          
          // Update progress
          const progress = 30 + (currentTime / video.duration) * 50;
          onProgress?.({ progress: Math.min(progress, 80), stage: 'compressing' });
          
          requestAnimationFrame(drawFrame);
        };
      };

      drawFrame();
    };

    video.onerror = (error) => {
      reject(new Error('Failed to load video for compression'));
    };

    video.src = URL.createObjectURL(file);
    video.load();
  });
};

const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  // Sorge für gerade Zahlen (wichtig für Video-Encoding)
  width = Math.floor(width / 2) * 2;
  height = Math.floor(height / 2) * 2;

  return { width, height };
};

const calculateBitrate = (maxSizeMB: number, durationSeconds: number): number => {
  // Berechne Bitrate basierend auf gewünschter Dateigröße
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const targetBitrate = (maxSizeBytes * 8) / durationSeconds; // bits per second
  
  // Mindest- und Höchstbitrate
  const minBitrate = 500000; // 500 kbps
  const maxBitrate = 2000000; // 2 Mbps
  
  return Math.max(minBitrate, Math.min(maxBitrate, targetBitrate));
};
