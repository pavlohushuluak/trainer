import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load the actual component
const PetProfilesSection = React.lazy(() => 
  import('../../dashboard/PetProfilesSection')
);

// Skeleton loader for pet profiles
const PetProfileManagerSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2].map((i) => (
        <Card key={i} className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-20 rounded" />
              <Skeleton className="h-8 w-20 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

interface LazyPetProfileManagerProps {
  shouldOpenPetModal?: boolean;
}

export const LazyPetProfileManager = React.memo(({ shouldOpenPetModal = false }: LazyPetProfileManagerProps) => {
  return (
    <Suspense fallback={<PetProfileManagerSkeleton />}>
      <PetProfilesSection shouldOpenPetModal={shouldOpenPetModal} />
    </Suspense>
  );
});

LazyPetProfileManager.displayName = 'LazyPetProfileManager';