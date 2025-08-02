
-- Update the check constraint to allow the German animal categories
ALTER TABLE public.community_posts 
DROP CONSTRAINT IF EXISTS community_posts_category_check;

ALTER TABLE public.community_posts 
ADD CONSTRAINT community_posts_category_check 
CHECK (category IN ('hund', 'katze', 'pferd', 'kleintiere', 'voegel', 'sonstige', 'general', 'training', 'health', 'behavior', 'success', 'question'));
