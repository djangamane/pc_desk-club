import { useState, useEffect } from 'react';
import { ViewportInfo } from '../types/responsive';
import { RESPONSIVE_CONFIG } from '../config/responsive';

/**
 * Custom hook for viewport detection with breakpoint logic
 * Provides real-time viewport information and responsive breakpoint detection
 */
export const useViewport = (): ViewportInfo => {
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>(() => {
    // Initialize with current window dimensions or fallback values
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const height = typeof window !== 'undefined' ? window.innerHeight : 768;
    
    return {
      width,
      height,
      isMobile: width < RESPONSIVE_CONFIG.breakpoints.mobile,
      isTablet: width >= RESPONSIVE_CONFIG.breakpoints.mobile && width < RESPONSIVE_CONFIG.breakpoints.tablet,
      isDesktop: width >= RESPONSIVE_CONFIG.breakpoints.tablet && width < RESPONSIVE_CONFIG.breakpoints.desktop,
      isLargeDesktop: width >= RESPONSIVE_CONFIG.breakpoints.desktop,
    };
  });

  useEffect(() => {
    // Handle resize events with debouncing for performance
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        setViewportInfo({
          width,
          height,
          isMobile: width < RESPONSIVE_CONFIG.breakpoints.mobile,
          isTablet: width >= RESPONSIVE_CONFIG.breakpoints.mobile && width < RESPONSIVE_CONFIG.breakpoints.tablet,
          isDesktop: width >= RESPONSIVE_CONFIG.breakpoints.tablet && width < RESPONSIVE_CONFIG.breakpoints.desktop,
          isLargeDesktop: width >= RESPONSIVE_CONFIG.breakpoints.desktop,
        });
      }, 100); // 100ms debounce
    };

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Initial call to set correct values
    handleResize();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return viewportInfo;
};

/**
 * Hook variant that only returns the current layout mode
 */
export const useLayoutMode = (): 'mobile' | 'tablet' | 'desktop' | 'large-desktop' => {
  const { width } = useViewport();
  
  if (width < RESPONSIVE_CONFIG.breakpoints.mobile) {
    return 'mobile';
  } else if (width < RESPONSIVE_CONFIG.breakpoints.tablet) {
    return 'tablet';
  } else if (width < RESPONSIVE_CONFIG.breakpoints.desktop) {
    return 'desktop';
  } else {
    return 'large-desktop';
  }
};