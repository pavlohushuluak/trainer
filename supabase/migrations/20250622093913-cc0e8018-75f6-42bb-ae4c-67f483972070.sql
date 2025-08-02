
-- Community Posts Tabelle für Beiträge (Fragen, Tipps, Erfolgsgeschichten)
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES public.pet_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  post_type TEXT NOT NULL DEFAULT 'question',
  is_solved BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Kommentar-System
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Like/Herz-System
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Community-Benachrichtigungen
CREATE TABLE public.community_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies für Community Posts
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community posts are publicly readable" 
  ON public.community_posts 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own posts" 
  ON public.community_posts 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
  ON public.community_posts 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
  ON public.community_posts 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies für Comments
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are publicly readable" 
  ON public.post_comments 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments" 
  ON public.post_comments 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
  ON public.post_comments 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
  ON public.post_comments 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies für Likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are publicly readable" 
  ON public.post_likes 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Users can like posts" 
  ON public.post_likes 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" 
  ON public.post_likes 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies für Notifications
ALTER TABLE public.community_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
  ON public.community_notifications 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can create notifications" 
  ON public.community_notifications 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.community_notifications 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = recipient_id);

-- Trigger für automatische Zähler-Updates
CREATE OR REPLACE FUNCTION update_post_counters() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'post_comments' THEN
      UPDATE public.community_posts 
      SET comments_count = comments_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_TABLE_NAME = 'post_likes' THEN
      UPDATE public.community_posts 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'post_comments' THEN
      UPDATE public.community_posts 
      SET comments_count = comments_count - 1 
      WHERE id = OLD.post_id;
    ELSIF TG_TABLE_NAME = 'post_likes' THEN
      UPDATE public.community_posts 
      SET likes_count = likes_count - 1 
      WHERE id = OLD.post_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger anwenden
CREATE TRIGGER update_comments_count
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_counters();

CREATE TRIGGER update_likes_count
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_counters();

-- Kategorien für Posts (Check Constraint)
ALTER TABLE public.community_posts 
ADD CONSTRAINT community_posts_category_check 
CHECK (category IN ('general', 'training', 'health', 'behavior', 'success', 'question'));

-- Post-Typen (Check Constraint)
ALTER TABLE public.community_posts 
ADD CONSTRAINT community_posts_type_check 
CHECK (post_type IN ('question', 'tip', 'success', 'discussion'));

-- Notification-Typen (Check Constraint)
ALTER TABLE public.community_notifications 
ADD CONSTRAINT community_notifications_type_check 
CHECK (type IN ('comment', 'like', 'solution', 'mention'));
