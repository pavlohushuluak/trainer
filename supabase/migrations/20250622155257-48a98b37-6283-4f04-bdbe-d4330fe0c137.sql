
-- Create storage bucket for community videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-videos',
  'community-videos',
  true,
  52428800, -- 50MB limit
  ARRAY['video/mp4', 'video/mov', 'video/avi', 'video/webm']
);

-- Add video support to community posts
ALTER TABLE public.community_posts 
ADD COLUMN video_url TEXT,
ADD COLUMN video_thumbnail_url TEXT,
ADD COLUMN video_duration INTEGER, -- in seconds
ADD COLUMN video_size INTEGER; -- in bytes

-- Create RLS policy for video storage
CREATE POLICY "Authenticated users can upload videos" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'community-videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Videos are publicly viewable" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'community-videos');

CREATE POLICY "Users can update their own videos" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'community-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own videos" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'community-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
