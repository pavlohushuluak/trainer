
export interface ThumbnailGenerationResult {
  thumbnailUrl: string;
  thumbnailBlob: Blob;
}

export const generateVideoThumbnail = async (
  videoFile: File,
  timeOffset: number = 1 // Sekunde im Video für Screenshot
): Promise<ThumbnailGenerationResult> => {

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    video.onloadedmetadata = () => {
      // Set canvas dimensions to video dimensions (max 480x270 for efficiency)
      const maxWidth = 480;
      const maxHeight = 270;
      const aspectRatio = video.videoWidth / video.videoHeight;

      let thumbnailWidth = video.videoWidth;
      let thumbnailHeight = video.videoHeight;

      if (thumbnailWidth > maxWidth) {
        thumbnailWidth = maxWidth;
        thumbnailHeight = thumbnailWidth / aspectRatio;
      }

      if (thumbnailHeight > maxHeight) {
        thumbnailHeight = maxHeight;
        thumbnailWidth = thumbnailHeight * aspectRatio;
      }

      canvas.width = thumbnailWidth;
      canvas.height = thumbnailHeight;

      // Seek to the desired time
      video.currentTime = Math.min(timeOffset, video.duration - 0.1);
    };

    video.onseeked = () => {
      try {
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to generate thumbnail blob'));
            return;
          }

          // Create object URL for immediate use
          const thumbnailUrl = URL.createObjectURL(blob);
          


          resolve({
            thumbnailUrl,
            thumbnailBlob: blob
          });
        }, 'image/jpeg', 0.8); // JPEG with 80% quality
      } catch (error) {
        reject(error);
      }
    };

    video.onerror = (error) => {
      reject(new Error('Failed to load video for thumbnail generation'));
    };

    // Load video
    video.src = URL.createObjectURL(videoFile);
    video.load();
  });
};

export const uploadThumbnail = async (
  thumbnailBlob: Blob,
  userId: string,
  postId: string
): Promise<string> => {
  const { supabase } = await import("@/integrations/supabase/client");
  

  const fileName = `${userId}/${postId}/thumbnail.jpg`;

  // Upload thumbnail to Supabase Storage
  const { data, error } = await supabase.storage
    .from('community-videos')
    .upload(fileName, thumbnailBlob, {
      upsert: true,
      contentType: 'image/jpeg'
    });

  if (error) {
    throw new Error(`Thumbnail-Upload fehlgeschlagen: ${error.message}`);
  }



  // Get public URL
  const { data: urlData } = supabase.storage
    .from('community-videos')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
};
