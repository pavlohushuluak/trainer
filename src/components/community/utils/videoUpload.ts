
import { supabase } from "@/integrations/supabase/client";
import { generateVideoThumbnail, uploadThumbnail } from "./thumbnailGeneration";

export interface VideoUploadResult {
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  size: number;
}

export const uploadVideo = async (
  file: File,
  userId: string,
  postId: string
): Promise<VideoUploadResult> => {
 

  // Create unique filename with correct extension
  const fileExtension = getFileExtension(file);
  const fileName = `${userId}/${postId}/video.${fileExtension}`;

  // Upload video to Supabase Storage
  const { data, error } = await supabase.storage
    .from('community-videos')
    .upload(fileName, file, {
      upsert: true,
      contentType: file.type
    });

  if (error) {
    console.error('❌ Video upload error:', error);
    throw new Error(`Video-Upload fehlgeschlagen: ${error.message}`);
  }



  // Get public URL
  const { data: urlData } = supabase.storage
    .from('community-videos')
    .getPublicUrl(fileName);

  let thumbnailUrl: string | undefined;

  // Generate and upload thumbnail
  try {
    const thumbnailResult = await generateVideoThumbnail(file);
    thumbnailUrl = await uploadThumbnail(thumbnailResult.thumbnailBlob, userId, postId);
  } catch (thumbnailError) {
    console.error('⚠️ Thumbnail generation failed:', thumbnailError);
    // Continue without thumbnail - not a critical error
  }

  // Extract video duration
  let duration: number | undefined;
  try {
    duration = await getVideoDuration(file);
  } catch (durationError) {
    console.error('⚠️ Duration extraction failed:', durationError);
    // Continue without duration - not critical
  }

  return {
    videoUrl: urlData.publicUrl,
    thumbnailUrl,
    duration,
    size: file.size,
  };
};

export const deleteVideo = async (videoUrl: string): Promise<void> => {
  try {
    // Extract path from URL
    const url = new URL(videoUrl);
    const pathParts = url.pathname.split('/');
    const basePath = pathParts.slice(-3, -1).join('/'); // Get userId/postId
    
    // Delete both video and thumbnail
    const filesToDelete = [
      `${basePath}/video.${getFileExtensionFromUrl(videoUrl)}`,
      `${basePath}/thumbnail.jpg`
    ];

    const { error } = await supabase.storage
      .from('community-videos')
      .remove(filesToDelete);

    if (error) {
      throw error;
    }


  } catch (error) {
    throw error;
  }
};

// Helper function to get correct file extension
const getFileExtension = (file: File): string => {
  // Handle compressed videos (WebM format)
  if (file.type === 'video/webm') {
    return 'webm';
  }
  
  // For other formats, extract from filename
  const extension = file.name.split('.').pop();
  return extension || 'mp4';
};

// Helper function to get file extension from URL
const getFileExtensionFromUrl = (url: string): string => {
  const pathname = new URL(url).pathname;
  const extension = pathname.split('.').pop();
  return extension || 'mp4';
};

// Helper function to get video duration
const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    
    video.onloadedmetadata = () => {
      resolve(video.duration);
    };
    
    video.onerror = (error) => {
      reject(new Error('Failed to load video for duration extraction'));
    };
    
    video.src = URL.createObjectURL(file);
    video.load();
  });
};
