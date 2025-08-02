
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { PerformanceCache, withCache } from '@/utils/performance';

interface CachedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryFn'> {
  queryFn: () => Promise<T>;
  cacheKey?: string;
  cacheTTL?: number;
}

export function useCachedQuery<T>(
  queryKey: string[],
  options: CachedQueryOptions<T>
) {
  const { queryFn, cacheKey, cacheTTL = 5, ...queryOptions } = options;
  
  const finalCacheKey = cacheKey || queryKey.join('-');
  
  return useQuery({
    ...queryOptions,
    queryKey,
    queryFn: withCache(finalCacheKey, queryFn, cacheTTL),
    staleTime: cacheTTL * 60 * 1000, // Convert minutes to milliseconds
    gcTime: cacheTTL * 60 * 1000 * 2, // Keep in cache for 2x the stale time
  });
}
