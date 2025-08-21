import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase configuration
const SUPABASE_URL = "https://vuzhlwyhcrsxqfysczsu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1emhsd3loY3JzeHFmeXNjenN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjU2NDQsImV4cCI6MjA2NTE0MTY0NH0.XXczMcxqEKgwNnRZOJmL02_FEcE5b3_by29qM1dYsX0";

// Create the main Supabase client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Storage bucket configuration
export const STORAGE_CONFIG = {
  BUCKET_NAME: 'community-videos',
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/mov', 'video/avi', 'video/webm'],
  COMPRESSION_THRESHOLD: 25 * 1024 * 1024, // 25MB
};

// Enhanced storage functions with better error handling
export const storageUtils = {
  // Check if storage is accessible
  async checkStorageAccess() {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) {
        console.error('❌ Storage access check failed:', error);
        return { accessible: false, error };
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_CONFIG.BUCKET_NAME);
      return { accessible: bucketExists, error: null };
    } catch (error) {
      console.error('❌ Storage access check failed:', error);
      return { accessible: false, error };
    }
  },

  // Get storage bucket info
  async getBucketInfo() {
    try {
      const { data, error } = await supabase.storage.getBucket(STORAGE_CONFIG.BUCKET_NAME);
      if (error) {
        console.error('❌ Failed to get bucket info:', error);
        return { bucket: null, error };
      }
      return { bucket: data, error: null };
    } catch (error) {
      console.error('❌ Failed to get bucket info:', error);
      return { bucket: null, error };
    }
  },

  // Test upload permissions
  async testUploadPermissions(userId: string) {
    try {
      // Try to list files in user's folder (this will fail if no permissions)
      const { data, error } = await supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .list(`${userId}/`, { limit: 1 });
      
      if (error) {
        console.warn('⚠️ Upload permission test failed:', error);
        return { hasPermission: false, error };
      }
      
      return { hasPermission: true, error: null };
    } catch (error) {
      console.warn('⚠️ Upload permission test failed:', error);
      return { hasPermission: false, error };
    }
  },

  // Validate file before upload
  validateFile(file: File) {
    const errors: string[] = [];
    
    if (!file) {
      errors.push('No file provided');
      return { valid: false, errors };
    }
    
    if (file.size === 0) {
      errors.push('File is empty');
    }
    
    if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
      errors.push(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds limit (${STORAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB)`);
    }
    
    if (!STORAGE_CONFIG.ALLOWED_VIDEO_TYPES.includes(file.type)) {
      errors.push(`File type ${file.type} is not supported. Allowed types: ${STORAGE_CONFIG.ALLOWED_VIDEO_TYPES.join(', ')}`);
    }
    
    return { valid: errors.length === 0, errors };
  },

  // Generate file path
  generateFilePath(userId: string, postId: string, fileExtension: string) {
    return `${userId}/${postId}/video.${fileExtension}`;
  },

  // Get public URL
  getPublicUrl(filePath: string) {
    const { data } = supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .getPublicUrl(filePath);
    return data.publicUrl;
  }
};

// Enhanced upload function with comprehensive error handling
export const uploadToStorage = async (
  file: File,
  userId: string,
  postId: string,
  onProgress?: (progress: number) => void
) => {
  console.log('🚀 Starting enhanced storage upload...');
  
  // Validate file
  const validation = storageUtils.validateFile(file);
  if (!validation.valid) {
    throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
  }
  
  // Check storage access
  const accessCheck = await storageUtils.checkStorageAccess();
  if (!accessCheck.accessible) {
    throw new Error('Storage is not accessible. Please check your configuration.');
  }
  
  // Check upload permissions
  const permissionCheck = await storageUtils.testUploadPermissions(userId);
  if (!permissionCheck.hasPermission) {
    console.warn('⚠️ Upload permission test failed, but continuing with upload...');
  }
  
  // Generate file path
  const fileExtension = file.name.split('.').pop() || 'mp4';
  const filePath = storageUtils.generateFilePath(userId, postId, fileExtension);
  
  console.log('📁 Upload path:', filePath);
  
  // Upload file
  const { data, error } = await supabase.storage
    .from(STORAGE_CONFIG.BUCKET_NAME)
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type
    });
  
  if (error) {
    console.error('❌ Upload failed:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
  
  console.log('✅ Upload successful:', data);
  
  // Get public URL
  const publicUrl = storageUtils.getPublicUrl(filePath);
  console.log('🔗 Public URL:', publicUrl);
  
  return {
    path: filePath,
    publicUrl,
    size: file.size,
    type: file.type
  };
};

// Delete file from storage
export const deleteFromStorage = async (filePath: string) => {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .remove([filePath]);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ File deleted successfully:', filePath);
    return true;
  } catch (error) {
    console.error('❌ Failed to delete file:', error);
    throw error;
  }
};
