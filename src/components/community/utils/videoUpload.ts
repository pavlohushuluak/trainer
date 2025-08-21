
import { generateVideoThumbnail, uploadThumbnail } from "./thumbnailGeneration";

export interface VideoUploadResult {
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  size: number;
}

// Helper function to get file extension
function getFileExtension(file: File): string {
  return file.name.split('.').pop()?.toLowerCase() || 'mp4';
}

// Helper function to get file extension from URL
function getFileExtensionFromUrl(url: string): string {
  const path = url.split('/').pop() || '';
  return path.split('.').pop()?.toLowerCase() || 'mp4';
}

// Helper function to get video duration
async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    
    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      reject(new Error('Failed to get video duration'));
    };
    
    video.src = URL.createObjectURL(file);
  });
}

// New function to upload file via Edge Function
async function uploadFileViaEdgeFunction(file: File, userId: string, postId: string): Promise<{ publicUrl: string; filePath: string }> {
  const supabaseUrl = "https://vuzhlwyhcrsxqfysczsu.supabase.co";
  const functionUrl = `${supabaseUrl}/functions/v1/storage-upload`;
  
  console.log('🔗 Calling Edge Function for upload:', functionUrl);
  console.log('📤 Converting file to base64...');
  
  // Convert file to base64 efficiently
  const fileBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(fileBuffer);
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const fileData = btoa(binary);
  
  console.log('📤 Request payload:', {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    userId,
    postId,
    fileDataLength: fileData.length
  });

  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1emhsd3loY3JzeHFmeXNjenN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjU2NDQsImV4cCI6MjA2NTE0MTY0NH0.XXczMcxqEKgwNnRZOJmL02_FEcE5b3_by29qM1dYsX0'
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        userId,
        postId,
        fileData
      })
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Edge Function error response:', errorText);
      throw new Error(`Edge Function returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Edge Function response:', data);
    
    return {
      publicUrl: data.publicUrl,
      filePath: data.filePath
    };
  } catch (error) {
    console.error('❌ Edge Function call failed:', error);
    
    // Check if it's a network error (function not deployed)
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Edge Function not deployed. Please run: npx supabase functions deploy storage-upload');
    }
    
    throw error;
  }
}

// Fallback function using direct Supabase client (if Edge Function fails)
async function uploadWithSupabaseClient(file: File, userId: string, postId: string): Promise<VideoUploadResult> {
  console.log('🔄 Using fallback Supabase client upload...');
  
  const { supabase } = await import("@/integrations/supabase/client");
  
  // Generate file path
  const fileExtension = getFileExtension(file);
  const filePath = `${userId}/${postId}/video.${fileExtension}`;
  
  console.log('📁 Upload path:', filePath);
  
  // Upload to Supabase storage
  const { data, error } = await supabase.storage
    .from('community-videos')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type
    });
  
  if (error) {
    console.error('❌ Supabase upload error:', error);
    throw new Error(`Supabase upload failed: ${error.message}`);
  }
  
  console.log('✅ Supabase upload successful:', data);
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('community-videos')
    .getPublicUrl(filePath);
  
  return {
    videoUrl: urlData.publicUrl,
    size: file.size,
  };
}

export const uploadVideo = async (
  file: File,
  userId: string,
  postId: string
): Promise<VideoUploadResult> => {
  console.log('🚀 Starting video upload with custom credentials:', {
    fileName: file.name,
    fileSize: (file.size / (1024 * 1024)).toFixed(1) + 'MB',
    fileType: file.type,
    userId,
    postId
  });

  // Validate inputs
  if (!userId || !postId) {
    throw new Error('Invalid user ID or post ID provided');
  }

  if (!file || file.size === 0) {
    throw new Error('Invalid file provided');
  }

  // Validate file type
  const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
  if (!validVideoTypes.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Supported types: ${validVideoTypes.join(', ')}`);
  }

  // Validate file size (50MB limit)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds limit (50MB)`);
  }

  try {
    // Use fallback Supabase client upload directly (Edge Function has auth issues)
    console.log('🔄 Using Supabase client upload...');
    const result = await uploadWithSupabaseClient(file, userId, postId);
    
    // Add thumbnail and duration
    let thumbnailUrl: string | undefined;
    let duration: number | undefined;
    
    try {
      console.log('🖼️ Generating video thumbnail...');
      const thumbnailResult = await generateVideoThumbnail(file);
      console.log('✅ Thumbnail generated, uploading...');
      thumbnailUrl = await uploadThumbnail(thumbnailResult.thumbnailBlob, userId, postId);
      console.log('✅ Thumbnail uploaded:', thumbnailUrl);
    } catch (thumbnailError) {
      console.error('⚠️ Thumbnail generation failed:', thumbnailError);
      // Continue without thumbnail - not a critical error
    }
    
    try {
      console.log('⏱️ Extracting video duration...');
      duration = await getVideoDuration(file);
      console.log('✅ Video duration extracted:', duration + 's');
    } catch (durationError) {
      console.error('⚠️ Duration extraction failed:', durationError);
      // Continue without duration - not critical
    }
    
    return {
      ...result,
      thumbnailUrl,
      duration,
    };

  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
};

export const deleteVideo = async (videoUrl: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting video:', videoUrl);
    
    // Extract path from URL
    const url = new URL(videoUrl);
    const pathParts = url.pathname.split('/');
    const basePath = pathParts.slice(-3, -1).join('/'); // Get userId/postId
    
    // For now, we'll just log the deletion since we need to implement
    // a delete function in the Edge Function as well
    console.log('✅ Video deletion logged (delete function not yet implemented)');
    
    // TODO: Implement delete functionality in Edge Function
    
  } catch (error) {
    console.error('❌ Video deletion failed:', error);
    throw error;
  }
};
