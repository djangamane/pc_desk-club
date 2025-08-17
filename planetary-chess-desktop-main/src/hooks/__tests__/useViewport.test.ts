import { renderHook, act } from '@testing-library/react';
import { useViewport, useLayoutMode } from '../useViewport';
import { RESPONSIVE_CONFIG } from '../../config/responsive';
import { vi } from 'vitest';

// Mock window.innerWidth and window.innerHeight
const mockWindowDimensions = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

// Mock resize event
const mockResizeEvent = (width: number, height: number) => {
  mockWindowDimensions(width, height);
  window.dispatchEvent(new Event('resize'));
};

describe('useViewport', () => {
  beforeEach(() => {
    // Reset to default desktop size
    mockWindowDimensions(1024, 768);
  });

  afterEach(() => {
    // Clean up any pending timers
    vi.clearAllTimers();
  });

  describe('initial viewport detection', () => {
    it('should detect mobile viewport correctly', () => {
      mockWindowDimensions(500, 800);
      const { result } = renderHook(() => useViewport());
      
      expect(result.current.width).toBe(500);
      expect(result.current.height).toBe(800);
      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isLargeDesktop).toBe(false);
    });

    it('should detect tablet viewport correctly', () => {
      mockWindowDimensions(900, 600);
      const { result } = renderHook(() => useViewport());
      
      expect(result.current.width).toBe(900);
      expect(result.current.height).toBe(600);
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isLargeDesktop).toBe(false);
    });

    it('should detect desktop viewport correctly', () => {
      mockWindowDimensions(1200, 800);
      const { result } = renderHook(() => useViewport());
      
      expect(result.current.width).toBe(1200);
      expect(result.current.height).toBe(800);
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isLargeDesktop).toBe(false);
    });

    it('should detect large desktop viewport correctly', () => {
      mockWindowDimensions(1600, 1000);
      const { result } = renderHook(() => useViewport());
      
      expect(result.current.width).toBe(1600);
      expect(result.current.height).toBe(1000);
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isLargeDesktop).toBe(true);
    });
  });

  describe('breakpoint boundaries', () => {
    it('should handle mobile breakpoint boundary correctly', () => {
      const mobileBreakpoint = RESPONSIVE_CONFIG.breakpoints.mobile;
      
      // Just below mobile breakpoint
      mockWindowDimensions(mobileBreakpoint - 1, 600);
      const { result: mobileResult } = renderHook(() => useViewport());
      expect(mobileResult.current.isMobile).toBe(true);
      expect(mobileResult.current.isTablet).toBe(false);
      
      // At mobile breakpoint (should be tablet)
      mockWindowDimensions(mobileBreakpoint, 600);
      const { result: tabletResult } = renderHook(() => useViewport());
      expect(tabletResult.current.isMobile).toBe(false);
      expect(tabletResult.current.isTablet).toBe(true);
    });

    it('should handle tablet breakpoint boundary correctly', () => {
      const tabletBreakpoint = RESPONSIVE_CONFIG.breakpoints.tablet;
      
      // Just below tablet breakpoint
      mockWindowDimensions(tabletBreakpoint - 1, 600);
      const { result: tabletResult } = renderHook(() => useViewport());
      expect(tabletResult.current.isTablet).toBe(true);
      expect(tabletResult.current.isDesktop).toBe(false);
      
      // At tablet breakpoint (should be desktop)
      mockWindowDimensions(tabletBreakpoint, 600);
      const { result: desktopResult } = renderHook(() => useViewport());
      expect(desktopResult.current.isTablet).toBe(false);
      expect(desktopResult.current.isDesktop).toBe(true);
    });

    it('should handle desktop breakpoint boundary correctly', () => {
      const desktopBreakpoint = RESPONSIVE_CONFIG.breakpoints.desktop;
      
      // Just below desktop breakpoint
      mockWindowDimensions(desktopBreakpoint - 1, 600);
      const { result: desktopResult } = renderHook(() => useViewport());
      expect(desktopResult.current.isDesktop).toBe(true);
      expect(desktopResult.current.isLargeDesktop).toBe(false);
      
      // At desktop breakpoint (should be large desktop)
      mockWindowDimensions(desktopBreakpoint, 600);
      const { result: largeDesktopResult } = renderHook(() => useViewport());
      expect(largeDesktopResult.current.isDesktop).toBe(false);
      expect(largeDesktopResult.current.isLargeDesktop).toBe(true);
    });
  });

  describe('resize event handling', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should update viewport info on window resize', () => {
      mockWindowDimensions(1200, 800);
      const { result } = renderHook(() => useViewport());
      
      // Initial state should be desktop
      expect(result.current.isDesktop).toBe(true);
      
      // Resize to mobile
      act(() => {
        mockResizeEvent(500, 800);
        vi.advanceTimersByTime(100); // Advance past debounce
      });
      
      expect(result.current.width).toBe(500);
      expect(result.current.isMobile).toBe(true);
      expect(result.current.isDesktop).toBe(false);
    });

    it('should debounce resize events', () => {
      mockWindowDimensions(1200, 800);
      const { result } = renderHook(() => useViewport());
      
      // Multiple rapid resize events
      act(() => {
        mockResizeEvent(500, 800);
        mockResizeEvent(600, 800);
        mockResizeEvent(700, 800);
        // Don't advance timers yet
      });
      
      // Should still be at original size due to debouncing
      expect(result.current.width).toBe(1200);
      
      // Advance past debounce time
      act(() => {
        vi.advanceTimersByTime(100);
      });
      
      // Should now reflect the last resize event
      expect(result.current.width).toBe(700);
    });
  });

  describe('cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = renderHook(() => useViewport());
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });
  });
});

describe('useLayoutMode', () => {
  beforeEach(() => {
    mockWindowDimensions(1024, 768);
  });

  it('should return correct layout mode for mobile', () => {
    mockWindowDimensions(500, 800);
    const { result } = renderHook(() => useLayoutMode());
    expect(result.current).toBe('mobile');
  });

  it('should return correct layout mode for tablet', () => {
    mockWindowDimensions(900, 600);
    const { result } = renderHook(() => useLayoutMode());
    expect(result.current).toBe('tablet');
  });

  it('should return correct layout mode for desktop', () => {
    mockWindowDimensions(1200, 800);
    const { result } = renderHook(() => useLayoutMode());
    expect(result.current).toBe('desktop');
  });

  it('should return correct layout mode for large desktop', () => {
    mockWindowDimensions(1600, 1000);
    const { result } = renderHook(() => useLayoutMode());
    expect(result.current).toBe('large-desktop');
  });
});