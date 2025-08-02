interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class RequestCache {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 30000, // 30 seconds default
    retries: number = 2
  ): Promise<T> {
    // Check if we have a valid cached entry
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    // Check if there's already a pending request
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending;
    }

    // Create new request with retry logic
    const request = this.executeWithRetry(fetcher, retries).then((data) => {
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl
      });
      this.pendingRequests.delete(key);
      return data;
    }).catch((error) => {
      this.pendingRequests.delete(key);
      throw error;
    });

    this.pendingRequests.set(key, request);
    return request;
  }

  private async executeWithRetry<T>(
    fetcher: () => Promise<T>,
    retries: number,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await fetcher();
    } catch (error) {
      if (attempt <= retries && this.isRetryableError(error)) {
        // Exponential backoff: wait 2^attempt * 1000ms
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry(fetcher, retries, attempt + 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: any): boolean {
    // Retry on network errors or 5xx server errors
    if (error?.message?.includes('Failed to fetch') || 
        error?.message?.includes('ERR_INSUFFICIENT_RESOURCES') ||
        error?.code === 'NETWORK_ERROR') {
      return true;
    }
    
    // Check for HTTP status codes
    if (error?.status >= 500 && error?.status < 600) {
      return true;
    }
    
    return false;
  }

  clear(key?: string) {
    if (key) {
      this.cache.delete(key);
      this.pendingRequests.delete(key);
    } else {
      this.cache.clear();
      this.pendingRequests.clear();
    }
  }

  // Clear expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const requestCache = new RequestCache();

// Clean up expired entries every minute
setInterval(() => {
  requestCache.cleanup();
}, 60000); 