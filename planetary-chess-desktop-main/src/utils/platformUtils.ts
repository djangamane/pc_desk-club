/**
 * Platform utilities for handling desktop vs mobile environments
 */

// Global constants injected by Vite build process
declare const __DESKTOP_MODE__: boolean;
declare const __MOBILE_MODE__: boolean;

export const isDesktopMode = (): boolean => {
  // Check build-time constant first
  if (typeof __DESKTOP_MODE__ !== 'undefined') {
    return __DESKTOP_MODE__;
  }
  
  // Fallback to runtime detection
  return !isMobileDevice();
};

export const isMobileMode = (): boolean => {
  // Check build-time constant first
  if (typeof __MOBILE_MODE__ !== 'undefined') {
    return __MOBILE_MODE__;
  }
  
  // Fallback to runtime detection
  return isMobileDevice();
};

/**
 * Runtime mobile device detection (fallback)
 */
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check for touch capability and screen size
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;
  
  return hasTouchScreen && isSmallScreen;
};

/**
 * Conditionally load Capacitor modules only in mobile mode
 */
export const loadCapacitorModule = async <T>(
  moduleName: string,
  fallback?: T
): Promise<T | null> => {
  if (!isMobileMode()) {
    return fallback || null;
  }
  
  try {
    const module = await import(moduleName);
    return module.default || module;
  } catch (error) {
    console.warn(`Failed to load mobile module ${moduleName}:`, error);
    return fallback || null;
  }
};

/**
 * Execute code only in desktop mode
 */
export const onDesktop = (callback: () => void): void => {
  if (isDesktopMode()) {
    callback();
  }
};

/**
 * Execute code only in mobile mode
 */
export const onMobile = (callback: () => void): void => {
  if (isMobileMode()) {
    callback();
  }
};

/**
 * Get platform-specific configuration
 */
export const getPlatformConfig = () => ({
  isDesktop: isDesktopMode(),
  isMobile: isMobileMode(),
  supportsKeyboard: isDesktopMode(),
  supportsTouch: isMobileMode(),
  preferredInputMethod: isDesktopMode() ? 'mouse' : 'touch'
});