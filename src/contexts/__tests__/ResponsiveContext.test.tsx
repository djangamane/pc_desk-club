import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ResponsiveProvider, useResponsive, useCurrentLayoutMode, useResponsiveUtils } from '../ResponsiveContext';
import { RESPONSIVE_CONFIG } from '../../config/responsive';

// Mock the useViewport hook
vi.mock('../../hooks/useViewport', () => ({
  useViewport: vi.fn(() => ({
    width: 1024,
    height: 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLargeDesktop: false,
  })),
}));

// Test component that uses the responsive context
const TestComponent = () => {
  const {
    viewportInfo,
    layoutMode,
    layoutConfig,
    chessboardSize,
    calculateDynamicSize,
    isLayoutMode,
  } = useResponsive();

  return (
    <div>
      <div data-testid="viewport-width">{viewportInfo.width}</div>
      <div data-testid="viewport-height">{viewportInfo.height}</div>
      <div data-testid="layout-mode">{layoutMode}</div>
      <div data-testid="layout-direction">{layoutConfig.direction}</div>
      <div data-testid="chessboard-size">{chessboardSize}</div>
      <div data-testid="dynamic-size">{calculateDynamicSize(100)}</div>
      <div data-testid="is-desktop">{isLayoutMode('desktop').toString()}</div>
      <div data-testid="is-mobile">{isLayoutMode('mobile').toString()}</div>
    </div>
  );
};

const TestLayoutModeComponent = () => {
  const layoutMode = useCurrentLayoutMode();
  return <div data-testid="current-layout-mode">{layoutMode}</div>;
};

const TestUtilsComponent = () => {
  const { calculateDynamicSize, isLayoutMode, layoutMode } = useResponsiveUtils();
  return (
    <div>
      <div data-testid="utils-layout-mode">{layoutMode}</div>
      <div data-testid="utils-dynamic-size">{calculateDynamicSize(50, 2)}</div>
      <div data-testid="utils-is-desktop">{isLayoutMode('desktop').toString()}</div>
    </div>
  );
};

describe('ResponsiveContext', () => {
  beforeEach(() => {
    // Reset viewport mock before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ResponsiveProvider', () => {
    it('provides responsive context to child components', () => {
      render(
        <ResponsiveProvider>
          <TestComponent />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('viewport-width')).toHaveTextContent('1024');
      expect(screen.getByTestId('viewport-height')).toHaveTextContent('768');
      expect(screen.getByTestId('layout-mode')).toHaveTextContent('desktop');
      expect(screen.getByTestId('layout-direction')).toHaveTextContent('row');
    });

    it('calculates chessboard size correctly for desktop layout', () => {
      render(
        <ResponsiveProvider>
          <TestComponent />
        </ResponsiveProvider>
      );

      const chessboardSize = screen.getByTestId('chessboard-size');
      const size = parseInt(chessboardSize.textContent || '0');
      
      // Should be within desktop range (600-800px)
      expect(size).toBeGreaterThanOrEqual(RESPONSIVE_CONFIG.chessboard.desktop.min);
      expect(size).toBeLessThanOrEqual(RESPONSIVE_CONFIG.chessboard.desktop.max);
    });

    it('provides calculateDynamicSize function', () => {
      render(
        <ResponsiveProvider>
          <TestComponent />
        </ResponsiveProvider>
      );

      const dynamicSize = screen.getByTestId('dynamic-size');
      // Desktop multiplier is 1.5, so 100 * 1.5 = 150
      expect(dynamicSize).toHaveTextContent('150');
    });

    it('provides isLayoutMode function', () => {
      render(
        <ResponsiveProvider>
          <TestComponent />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('is-desktop')).toHaveTextContent('true');
      expect(screen.getByTestId('is-mobile')).toHaveTextContent('false');
    });
  });

  describe('useCurrentLayoutMode hook', () => {
    it('returns current layout mode', () => {
      render(
        <ResponsiveProvider>
          <TestLayoutModeComponent />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('current-layout-mode')).toHaveTextContent('desktop');
    });
  });

  describe('useResponsiveUtils hook', () => {
    it('provides utility functions', () => {
      render(
        <ResponsiveProvider>
          <TestUtilsComponent />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('utils-layout-mode')).toHaveTextContent('desktop');
      expect(screen.getByTestId('utils-dynamic-size')).toHaveTextContent('150'); // 50 * 1.5 * 2
      expect(screen.getByTestId('utils-is-desktop')).toHaveTextContent('true');
    });
  });

  describe('Error handling', () => {
    it('throws error when useResponsive is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useResponsive must be used within a ResponsiveProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Different viewport sizes', () => {
    it('handles mobile viewport correctly', async () => {
      const { useViewport } = await import('../../hooks/useViewport');
      vi.mocked(useViewport).mockReturnValue({
        width: 375,
        height: 667,
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: false,
      });

      render(
        <ResponsiveProvider>
          <TestComponent />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('layout-mode')).toHaveTextContent('mobile');
      expect(screen.getByTestId('layout-direction')).toHaveTextContent('column');
      expect(screen.getByTestId('dynamic-size')).toHaveTextContent('100'); // Mobile multiplier is 1
    });

    it('handles tablet viewport correctly', async () => {
      const { useViewport } = await import('../../hooks/useViewport');
      vi.mocked(useViewport).mockReturnValue({
        width: 768,
        height: 1024,
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        isLargeDesktop: false,
      });

      render(
        <ResponsiveProvider>
          <TestComponent />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('layout-mode')).toHaveTextContent('tablet');
      expect(screen.getByTestId('layout-direction')).toHaveTextContent('column');
      expect(screen.getByTestId('dynamic-size')).toHaveTextContent('120'); // Tablet multiplier is 1.2
    });

    it('handles large desktop viewport correctly', async () => {
      const { useViewport } = await import('../../hooks/useViewport');
      vi.mocked(useViewport).mockReturnValue({
        width: 1920,
        height: 1080,
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: true,
      });

      render(
        <ResponsiveProvider>
          <TestComponent />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('layout-mode')).toHaveTextContent('large-desktop');
      expect(screen.getByTestId('layout-direction')).toHaveTextContent('row');
      expect(screen.getByTestId('dynamic-size')).toHaveTextContent('180'); // Large desktop multiplier is 1.8
    });
  });

  describe('Dynamic size calculations', () => {
    it('calculates dynamic sizes with custom scale factors', () => {
      const TestDynamicSizeComponent = () => {
        const { calculateDynamicSize } = useResponsive();
        return (
          <div>
            <div data-testid="size-no-scale">{calculateDynamicSize(100)}</div>
            <div data-testid="size-half-scale">{calculateDynamicSize(100, 0.5)}</div>
            <div data-testid="size-double-scale">{calculateDynamicSize(100, 2)}</div>
          </div>
        );
      };

      render(
        <ResponsiveProvider>
          <TestDynamicSizeComponent />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('size-no-scale')).toHaveTextContent('150'); // 100 * 1.5
      expect(screen.getByTestId('size-half-scale')).toHaveTextContent('75'); // 100 * 1.5 * 0.5
      expect(screen.getByTestId('size-double-scale')).toHaveTextContent('300'); // 100 * 1.5 * 2
    });
  });
});