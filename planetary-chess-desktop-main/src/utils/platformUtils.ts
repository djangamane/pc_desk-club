/**
 * Platform utilities for desktop chess application
 * Optimized for desktop-only deployment
 */

// Global constants injected by Vite build process
declare const __DESKTOP_MODE__: boolean;

export const isDesktopMode = (): boolean => {
  // Always true for desktop-only builds
  if (typeof __DESKTOP_MODE__ !== 'undefined') {
    return __DESKTOP_MODE__;
  }
  
  // Desktop-only fallback
  return true;
};

/**
 * Desktop platform detection
 */
export const isDesktopEnvironment = (): boolean => {
  if (typeof window === 'undefined') return true; // SSR context defaults to desktop
  
  // Desktop indicators
  const hasKeyboard = !('ontouchstart' in window);
  const hasLargeScreen = window.innerWidth > 1024;
  const hasDesktopUserAgent = !(/Mobi|Android/i.test(navigator.userAgent));
  
  return hasKeyboard && hasLargeScreen && hasDesktopUserAgent;
};

/**
 * Legacy mobile mode function (deprecated but kept for compatibility)
 */
export const isMobileMode = (): boolean => {
  return false; // Always false for desktop-only build
};

/**
 * Legacy Capacitor module loader (deprecated but kept for compatibility)
 */
export const loadCapacitorModule = async <T>(
  moduleName: string,
  fallback?: T
): Promise<T | null> => {
  console.warn(`loadCapacitorModule is deprecated in desktop-only build: ${moduleName}`);
  return fallback || null;
};

/**
 * Execute code for desktop environment
 */
export const onDesktop = (callback: () => void): void => {
  if (isDesktopMode()) {
    callback();
  }
};

/**
 * Get desktop-specific configuration
 */
export const getPlatformConfig = () => ({
  isDesktop: true,
  isMobile: false,
  supportsKeyboard: true,
  supportsTouch: false,
  preferredInputMethod: 'mouse',
  // Desktop performance targets
  performance: {
    targetFPS: 144,
    minFPS: 60,
    maxRenderTime: 8, // ms for 120fps
    memoryLimit: 500 // MB
  }
});