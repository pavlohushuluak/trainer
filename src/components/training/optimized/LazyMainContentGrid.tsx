import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load the actual component
const MainContentGrid = React.lazy(() => 
  import('../MainContentGrid').then(module => ({ default: module.default }))
);

// Skeleton loader
const MainContentGridSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-32" />
        </CardTitle>
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-8 rounded-full" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-8 rounded-full" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
    
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-28" />
        </CardTitle>
        <Skeleton className="h-4 w-44" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 bg-muted rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-4 w-4 rounded" />
          </div>
        </div>
        <div className="p-3 bg-muted rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-4 w-4 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

interface LazyMainContentGridProps {
  pets: any[];
}

export const LazyMainContentGrid = React.memo(({ pets }: LazyMainContentGridProps) => {
  return (
    <Suspense fallback={<MainContentGridSkeleton />}>
      <MainContentGrid pets={pets} />
    </Suspense>
  );
});

LazyMainContentGrid.displayName = 'LazyMainContentGrid';