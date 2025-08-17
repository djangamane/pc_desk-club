/**
 * Asset optimization utilities for desktop chess application
 * Handles responsive image loading, asset caching, and optimization
 */

import React from 'react';

export interface ImageLoadingOptions {
  lazy?: boolean;
  placeholder?: string;
  fallback?: string;
  sizes?: string;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
  priority?: boolean;
}

export interface AssetCacheEntry {
  url: string;
  blob: Blob;
  timestamp: number;
  size: number;
  type: string;
}

// Asset cache manager
class AssetCache {
  private cache = new Map<string, AssetCacheEntry>();
  private maxSize = 50 * 1024 * 1024; // 50MB
  private currentSize = 0;

  async get(url: string): Promise<Blob | null> {
    const entry = this.cache.get(url);
    if (!entry) return null;

    // Check if entry is still valid (24 hours)
    const isExpired = Date.now() - entry.timestamp > 24 * 60 * 60 * 1000;
    if (isExpired) {
      this.delete(url);
      return null;
    }

    return entry.blob;
  }

  async set(url: string, blob: Blob): Promise<void> {
    const size = blob.size;
    
    // Don't cache if too large
    if (size > this.maxSize * 0.1) return;

    // Make room if needed
    while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
      this.evictOldest();
    }

    const entry: AssetCacheEntry = {
      url,
      blob,
      timestamp: Date.now(),
      size,
      type: blob.type
    };

    this.cache.set(url, entry);
    this.currentSize += size;
  }

  delete(url: string): boolean {
    const entry = this.cache.get(url);
    if (entry) {
      this.cache.delete(url);
      this.currentSize -= entry.size;
      return true;
    }
    return false;
  }

  private evictOldest(): void {
    let oldestUrl = '';
    let oldestTime = Date.now();

    for (const [url, entry] of this.cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestUrl = url;
      }
    }

    if (oldestUrl) {
      this.delete(oldestUrl);
    }
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  getStats() {
    return {
      entries: this.cache.size,
      totalSize: this.currentSize,
      maxSize: this.maxSize,
      utilization: (this.currentSize / this.maxSize) * 100
    };
  }
}

export const assetCache = new AssetCache();

// Image format detection and optimization
export const getOptimalImageFormat = (): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  // Check WebP support
  if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
    return 'webp';
  }

  // Check AVIF support
  if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
    return 'avif';
  }

  return 'png';
};

// Responsive image loading hook
export const useResponsiveImage = (
  src: string,
  options: ImageLoadingOptions = {}
) => {
  const [imageState, setImageState] = React.useState({
    src: options.placeholder || '',
    isLoading: true,
    hasError: false,
    isLoaded: false
  });

  const [shouldLoad, setShouldLoad] = React.useState(!options.lazy);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  // Intersection observer for lazy loading
  React.useEffect(() => {
    if (!options.lazy || shouldLoad) return;

    const img = imgRef.current;
    if (!img) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observerRef.current?.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    observerRef.current.observe(img);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [options.lazy, shouldLoad]);

  // Load image when shouldLoad becomes true
  React.useEffect(() => {
    if (!shouldLoad || !src) return;

    let cancelled = false;

    const loadImage = async () => {
      try {
        setImageState(prev => ({ ...prev, isLoading: true, hasError: false }));

        // Check cache first
        const cachedBlob = await assetCache.get(src);
        if (cachedBlob && !cancelled) {
          const objectUrl = URL.createObjectURL(cachedBlob);
          setImageState({
            src: objectUrl,
            isLoading: false,
            hasError: false,
            isLoaded: true
          });
          return;
        }

        // Load image
        const response = await fetch(src);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const blob = await response.blob();
        if (cancelled) return;

        // Cache the blob
        await assetCache.set(src, blob);

        // Create object URL and update state
        const objectUrl = URL.createObjectURL(blob);
        setImageState({
          src: objectUrl,
          isLoading: false,
          hasError: false,
          isLoaded: true
        });

      } catch (error) {
        if (cancelled) return;
        
        console.warn('Image loading failed:', src, error);
        setImageState({
          src: options.fallback || '',
          isLoading: false,
          hasError: true,
          isLoaded: false
        });
      }
    };

    loadImage();

    return () => {
      cancelled = true;
    };
  }, [shouldLoad, src, options.fallback]);

  return {
    ...imageState,
    imgRef,
    shouldLoad
  };
};

// Optimized image component
export const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  options?: ImageLoadingOptions;
  onLoad?: () => void;
  onError?: () => void;
}> = ({ src, alt, className, style, options = {}, onLoad, onError }) => {
  const { src: imageSrc, isLoading, hasError, isLoaded, imgRef } = useResponsiveImage(src, options);

  React.useEffect(() => {
    if (isLoaded && onLoad) onLoad();
    if (hasError && onError) onError();
  }, [isLoaded, hasError, onLoad, onError]);

  const imageStyle: React.CSSProperties = {
    ...style,
    opacity: isLoaded ? 1 : 0.7,
    transition: 'opacity 0.3s ease',
    ...(isLoading && { filter: 'blur(2px)' })
  };

  return React.createElement('img', {
    ref: imgRef,
    src: imageSrc,
    alt: alt,
    className: className,
    style: imageStyle,
    loading: options.lazy ? 'lazy' : 'eager',
    decoding: 'async'
  });
};

// Asset preloader for critical resources
export const useAssetPreloader = () => {
  const [preloadedAssets, setPreloadedAssets] = React.useState<Set<string>>(new Set());
  const [isPreloading, setIsPreloading] = React.useState(false);

  const preloadAsset = React.useCallback(async (url: string, priority = false) => {
    if (preloadedAssets.has(url)) return;

    try {
      setIsPreloading(true);

      // Check cache first
      const cached = await assetCache.get(url);
      if (cached) {
        setPreloadedAssets(prev => new Set([...prev, url]));
        return;
      }

      // Create link element for preloading
      const link = document.createElement('link');
      link.rel = priority ? 'preload' : 'prefetch';
      link.href = url;
      link.as = 'image';

      // Add to document head
      document.head.appendChild(link);

      // Also fetch and cache
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        await assetCache.set(url, blob);
      }

      setPreloadedAssets(prev => new Set([...prev, url]));
      
      // Clean up link element
      setTimeout(() => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      }, 1000);

    } catch (error) {
      console.warn('Asset preload failed:', url, error);
    } finally {
      setIsPreloading(false);
    }
  }, [preloadedAssets]);

  const preloadAssets = React.useCallback(async (urls: string[]) => {
    const promises = urls.map(url => preloadAsset(url));
    await Promise.allSettled(promises);
  }, [preloadAsset]);

  return {
    preloadAsset,
    preloadAssets,
    preloadedAssets,
    isPreloading
  };
};

// Bundle size analyzer
export const analyzeBundleSize = () => {
  const getResourceSizes = () => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    return resources.map(resource => ({
      name: resource.name,
      size: resource.transferSize || 0,
      type: resource.initiatorType,
      duration: resource.duration
    })).sort((a, b) => b.size - a.size);
  };

  const getTotalBundleSize = () => {
    const resources = getResourceSizes();
    return resources.reduce((total, resource) => {
      if (resource.type === 'script' || resource.type === 'link') {
        return total + resource.size;
      }
      return total;
    }, 0);
  };

  const getImageSizes = () => {
    const resources = getResourceSizes();
    return resources.filter(resource => 
      resource.type === 'img' || 
      resource.name.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)
    );
  };

  return {
    getResourceSizes,
    getTotalBundleSize,
    getImageSizes,
    getCacheStats: assetCache.getStats.bind(assetCache)
  };
};

// Performance-aware asset loading
export const usePerformantAssetLoading = () => {
  const [connectionType, setConnectionType] = React.useState<string>('unknown');
  const [isSlowConnection, setIsSlowConnection] = React.useState(false);

  React.useEffect(() => {
    // Check connection type if available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const updateConnection = () => {
        setConnectionType(connection.effectiveType || 'unknown');
        setIsSlowConnection(connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
      };

      updateConnection();
      connection.addEventListener('change', updateConnection);

      return () => {
        connection.removeEventListener('change', updateConnection);
      };
    }
  }, []);

  const getOptimalImageQuality = React.useCallback(() => {
    if (isSlowConnection) return 0.6;
    if (connectionType === '3g') return 0.8;
    return 1.0;
  }, [isSlowConnection, connectionType]);

  const shouldPreloadImages = React.useCallback(() => {
    return !isSlowConnection && connectionType !== '3g';
  }, [isSlowConnection, connectionType]);

  return {
    connectionType,
    isSlowConnection,
    getOptimalImageQuality,
    shouldPreloadImages
  };
};