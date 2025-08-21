import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { uploadVideo } from './utils/videoUpload';
import { useToast } from '@/hooks/use-toast';

export const VideoUploadTest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const handleTestUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      console.log('🧪 Starting test upload...');
      
      // Create a test post ID
      const testPostId = `test-${Date.now()}`;
      
      const result = await uploadVideo(file, user.id, testPostId);
      
      console.log('✅ Test upload successful:', result);
      setUploadResult(result);
      
      toast({
        title: 'Test Upload Successful',
        description: `Video uploaded successfully. URL: ${result.videoUrl}`,
      });
      
    } catch (error: any) {
      console.error('❌ Test upload failed:', error);
      
      toast({
        title: 'Test Upload Failed',
        description: error.message || 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Please log in to test video upload functionality.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Upload Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            This component tests the video upload functionality with your Supabase storage bucket.
          </p>
          
          <input
            type="file"
            accept="video/*"
            onChange={handleTestUpload}
            disabled={isUploading}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
        </div>

        {isUploading && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Uploading video...</p>
          </div>
        )}

        {uploadResult && (
          <div className="space-y-2">
            <h4 className="font-medium">Upload Result:</h4>
            <div className="text-sm space-y-1">
              <p><strong>Video URL:</strong> <a href={uploadResult.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{uploadResult.videoUrl}</a></p>
              {uploadResult.thumbnailUrl && (
                <p><strong>Thumbnail URL:</strong> <a href={uploadResult.thumbnailUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{uploadResult.thumbnailUrl}</a></p>
              )}
              <p><strong>File Size:</strong> {(uploadResult.size / (1024 * 1024)).toFixed(2)} MB</p>
              {uploadResult.duration && (
                <p><strong>Duration:</strong> {uploadResult.duration.toFixed(1)} seconds</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
