
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "./PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CommunityFeedProps {
  selectedCategory: string;
  selectedPostType: string;
}

export const CommunityFeed = ({ selectedCategory, selectedPostType }: CommunityFeedProps) => {
  const { t } = useTranslation();
  const { data: posts, isLoading, error, refetch } = useQuery({
    queryKey: ['community-posts', selectedCategory, selectedPostType],
    queryFn: async () => {
      
      let query = supabase
        .from('community_posts')
        .select(`
          *,
          pet_profiles!community_posts_pet_id_fkey (
            name,
            species
          )
        `)
        .order('created_at', { ascending: false });

      // Debug: Check what categories and post types exist in the database
      const { data: allPosts, error: debugError } = await supabase
        .from('community_posts')
        .select('category, post_type, title')
        .limit(5);
      

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (selectedPostType !== 'all') {
        query = query.eq('post_type', selectedPostType);
      }

      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
  });


  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-6 border rounded-lg">
            <div className="flex items-center space-x-4 mb-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('community.feed.loadingError.title')}</h3>
        <p className="text-gray-600 mb-4">
          {error instanceof Error ? error.message : t('community.feed.loadingError.description')}
        </p>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
        >
          {t('community.feed.loadingError.retryButton')}
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          {t('community.feed.loadingError.reloadButton')}
        </button>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🐾</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('community.feed.emptyState.title')}</h3>
        <p className="text-gray-600 mb-4">
          {selectedCategory !== 'all' || selectedPostType !== 'all' 
            ? t('community.feed.emptyState.filteredDescription')
            : t('community.feed.emptyState.description')
          }
        </p>
        {(selectedCategory !== 'all' || selectedPostType !== 'all') && (
          <button 
            onClick={() => {
              // This will be handled by the parent component to reset filters
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {t('community.feed.emptyState.showAllButton')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};
