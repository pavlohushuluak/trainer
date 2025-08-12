
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import { CreatePostModal } from "@/components/community/CreatePostModal";
import { CommunityFilters } from "@/components/community/CommunityFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, MessageCircle, Heart } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useTranslations } from "@/hooks/useTranslations";
import { MainLayout } from "@/components/layout/MainLayout";

const Community = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPostType, setSelectedPostType] = useState<string>("all");
  const { t } = useTranslations();

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handlePostTypeChange = (postType: string) => {
    setSelectedPostType(postType);
  };

  return (
    <ProtectedRoute>
      <div>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <Users className="h-8 w-8 text-primary" />
                  {t('communityPage.title')}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {t('communityPage.description')}
                </p>
              </div>
              <Button 
                onClick={() => setShowCreatePost(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                {t('communityPage.newPost')}
              </Button>
            </div>

          {/* Community Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">1,247</div>
                <div className="text-sm text-muted-foreground">{t('communityPage.stats.members')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <MessageCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">3,892</div>
                <div className="text-sm text-muted-foreground">{t('communityPage.stats.posts')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">12,340</div>
                <div className="text-sm text-muted-foreground">{t('communityPage.stats.likes')}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <CommunityFilters 
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          selectedPostType={selectedPostType}
          onPostTypeChange={handlePostTypeChange}
        />

        {/* Community Feed */}
        <CommunityFeed 
          selectedCategory={selectedCategory}
          selectedPostType={selectedPostType}
        />

        {/* Create Post Modal */}
        <CreatePostModal 
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
        />
      </div>
      </div>
    </ProtectedRoute>
  );
};

export default Community;
