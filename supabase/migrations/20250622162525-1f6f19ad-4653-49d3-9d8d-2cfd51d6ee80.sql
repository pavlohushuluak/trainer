
-- Überprüfe und korrigiere die RLS Policies für community_posts
-- Erlaube das Lesen aller Posts (auch die ohne user_id für Demo-Zwecke)
DROP POLICY IF EXISTS "Community posts are publicly readable" ON public.community_posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.community_posts;

-- Neue Policy: Alle authentifizierten Benutzer können alle Posts lesen
CREATE POLICY "All authenticated users can read posts" 
  ON public.community_posts 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Policy: Benutzer können ihre eigenen Posts erstellen (mit ihrer user_id)
CREATE POLICY "Users can create their own posts" 
  ON public.community_posts 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Benutzer können ihre eigenen Posts bearbeiten
CREATE POLICY "Users can update their own posts" 
  ON public.community_posts 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Benutzer können ihre eigenen Posts löschen
CREATE POLICY "Users can delete their own posts" 
  ON public.community_posts 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Überprüfe auch die RLS Policies für Kommentare und Likes
DROP POLICY IF EXISTS "Comments are publicly readable" ON public.post_comments;
DROP POLICY IF EXISTS "Likes are publicly readable" ON public.post_likes;

CREATE POLICY "All authenticated users can read comments" 
  ON public.post_comments 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can read likes" 
  ON public.post_likes 
  FOR SELECT 
  TO authenticated
  USING (true);
