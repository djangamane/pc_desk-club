import { describe, it, expect } from 'vitest';
import {
  calculateResponsiveFontSize,
  calculateResponsiveSpacing,
  calculateComponentSize,
  calculateGridColumns,
  calculateSidebarWidth,
  calculateChessboardContainerSize,
  calculateResponsiveChessboardSize,
  generateResponsiveCSSProperties,
  isLandscapeOrientation,
  calculateOptimalAspectRatio,
} from '../responsiveUtils';
import { ViewportInfo, LayoutMode } from '../../types/responsive';

describe('responsiveUtils', () => {
  const mockViewportInfo: ViewportInfo = {
    width: 1024,
    height: 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLargeDesktop: false,
  };

  describe('calculateResponsiveFontSize', () => {
    it('calculates font size for mobile', () => {
      const result = calculateResponsiveFontSize(16, 'mobile');
      expect(result).toBe(16); // 16 * 1 = 16
    });

    it('calculates font size for tablet', () => {
      const result = calculateResponsiveFontSize(16, 'tablet');
      expect(result).toBe(18); // 16 * 1.1 = 17.6, rounded to 18
    });

    it('calculates font size for desktop', () => {
      const result = calculateResponsiveFontSize(16, 'desktop');
      expect(result).toBe(19); // 16 * 1.2 = 19.2, rounded to 19
    });

    it('calculates font size for large desktop', () => {
      const result = calculateResponsiveFontSize(16, 'large-desktop');
      expect(result).toBe(21); // 16 * 1.3 = 20.8, rounded to 21
    });
  });

  describe('calculateResponsiveSpacing', () => {
    it('calculates spacing for different layout modes', () => {
      expect(calculateResponsiveSpacing(10, 'mobile')).toBe(10); // 10 * 1
      expect(calculateResponsiveSpacing(10, 'tablet')).toBe(13); // 10 * 1.25 = 12.5, rounded to 13
      expect(calculateResponsiveSpacing(10, 'desktop')).toBe(15); // 10 * 1.5
      expect(calculateResponsiveSpacing(10, 'large-desktop')).toBe(20); // 10 * 2
    });
  });

  describe('calculateComponentSize', () => {
    it('calculates component size within constraints', () => {
      const result = calculateComponentSize(mockViewportInfo, 200, 800, 0.5);
      // Math.min(1024, 768) * 0.5 = 384
      // Constrained between 200 and 800
      expect(result).toBe(384);
    });

    it('respects minimum size constraint', () => {
      const smallViewport: ViewportInfo = {
        ...mockViewportInfo,
        width: 300,
        height: 200,
      };
      const result = calculateComponentSize(smallViewport, 500, 800, 0.9);
      // Math.min(300, 200) * 0.9 = 180, but min is 500
      expect(result).toBe(500);
    });

    it('respects maximum size constraint', () => {
      const largeViewport: ViewportInfo = {
        ...mockViewportInfo,
        width: 2000,
        height: 1500,
      };
      const result = calculateComponentSize(largeViewport, 200, 800, 0.9);
      // Math.min(2000, 1500) * 0.9 = 1350, but max is 800
      expect(result).toBe(800);
    });

    it('uses default viewport percentage when not provided', () => {
      const result = calculateComponentSize(mockViewportInfo, 200, 800);
      // Math.min(1024, 768) * 0.9 = 691.2
      expect(result).toBe(691.2);
    });
  });

  describe('calculateGridColumns', () => {
    it('calculates grid columns based on viewport width', () => {
      expect(calculateGridColumns(1200, 300, 4)).toBe(4); // 1200 / 300 = 4
      expect(calculateGridColumns(900, 300, 4)).toBe(3); // 900 / 300 = 3
      expect(calculateGridColumns(500, 300, 4)).toBe(1); // 500 / 300 = 1.67, floored to 1
    });

    it('respects maximum columns constraint', () => {
      expect(calculateGridColumns(2000, 200, 3)).toBe(3); // Would be 10, but max is 3
    });

    it('ensures minimum of 1 column', () => {
      expect(calculateGridColumns(100, 300, 4)).toBe(1); // Would be 0, but min is 1
    });

    it('uses default values when not provided', () => {
      expect(calculateGridColumns(1200)).toBe(4); // 1200 / 300 = 4, max 4
    });
  });

  describe('calculateSidebarWidth', () => {
    it('returns full width for mobile and tablet', () => {
      expect(calculateSidebarWidth(375, 'mobile')).toBe(375);
      expect(calculateSidebarWidth(768, 'tablet')).toBe(768);
    });

    it('calculates percentage-based width for desktop', () => {
      const result = calculateSidebarWidth(1000, 'desktop');
      // 35% of 1000 = 350, max is 400px
      expect(result).toBe(350);
    });

    it('respects maximum width constraint for desktop', () => {
      const result = calculateSidebarWidth(2000, 'desktop');
      // 35% of 2000 = 700, but max is 400px
      expect(result).toBe(400);
    });

    it('handles large desktop layout mode', () => {
      const result = calculateSidebarWidth(1500, 'large-desktop');
      // 30% of 1500 = 450, max is 450px
      expect(result).toBe(450);
    });
  });

  describe('calculateChessboardContainerSize', () => {
    it('calculates square dimensions for mobile', () => {
      const mobileViewport: ViewportInfo = {
        ...mockViewportInfo,
        width: 375,
        height: 667,
        isMobile: true,
        isDesktop: false,
      };
      
      const result = calculateChessboardContainerSize(mobileViewport, 'mobile');
      // 375 * 0.9 = 337.5, max is 400px, so 338
      expect(result.width).toBe(338);
      expect(result.height).toBe(338); // Square aspect ratio
    });

    it('calculates dimensions for desktop with viewport constraints', () => {
      const result = calculateChessboardContainerSize(mockViewportInfo, 'desktop');
      // 65% of 1024 = 665.6, max is 800px, so 666
      // Height is min of width and 80% of viewport height: min(666, 768 * 0.8) = min(666, 614.4) = 614
      expect(result.width).toBe(666);
      expect(result.height).toBe(614);
    });

    it('respects maximum width constraint', () => {
      const largeViewport: ViewportInfo = {
        ...mockViewportInfo,
        width: 2000,
        height: 1200,
      };
      
      const result = calculateChessboardContainerSize(largeViewport, 'desktop');
      // 65% of 2000 = 1300, but max is 800px
      expect(result.width).toBe(800);
      expect(result.height).toBe(800); // min(800, 1200 * 0.8) = min(800, 960) = 800
    });
  });

  describe('calculateResponsiveChessboardSize', () => {
    it('calculates mobile chessboard size', () => {
      const result = calculateResponsiveChessboardSize(375, 'mobile');
      // 375 * 0.85 = 318.75, rounded to 319
      // Constrained between 320 (min) and 380 (max) from config
      expect(result).toBe(320); // Hits minimum constraint
    });

    it('calculates tablet chessboard size', () => {
      const result = calculateResponsiveChessboardSize(800, 'tablet');
      // 800 * 0.7 = 560, but max is 550 from config
      expect(result).toBe(550);
    });

    it('calculates desktop chessboard size', () => {
      const result = calculateResponsiveChessboardSize(1200, 'desktop');
      // 1200 * 0.4 = 480, but min is 600 from config
      expect(result).toBe(600);
    });

    it('calculates large desktop chessboard size', () => {
      const result = calculateResponsiveChessboardSize(1600, 'large-desktop');
      // 1600 * 0.4 = 640, constrained between 700 (min) and 900 (max)
      expect(result).toBe(700); // Hits minimum constraint
    });

    it('respects custom minimum constraint', () => {
      const result = calculateResponsiveChessboardSize(1200, 'desktop', { min: 750 });
      // 1200 * 0.4 = 480, but custom min is 750
      expect(result).toBe(750);
    });

    it('respects custom maximum constraint', () => {
      const result = calculateResponsiveChessboardSize(2000, 'desktop', { max: 650 });
      // 2000 * 0.4 = 800, but custom max is 650
      expect(result).toBe(650);
    });

    it('applies both custom min and max constraints', () => {
      const result = calculateResponsiveChessboardSize(1000, 'mobile', { min: 400, max: 500 });
      // 1000 * 0.85 = 850, but custom max is 500
      expect(result).toBe(500);
    });

    it('handles edge case where calculated size is within constraints', () => {
      const result = calculateResponsiveChessboardSize(900, 'tablet');
      // 900 * 0.7 = 630, within tablet constraints (450-550), so uses max
      expect(result).toBe(550);
    });

    it('returns rounded values', () => {
      const result = calculateResponsiveChessboardSize(777, 'tablet');
      // 777 * 0.7 = 543.9, rounded to 544
      expect(result).toBe(544);
    });
  });

  describe('generateResponsiveCSSProperties', () => {
    it('generates CSS custom properties for desktop layout', () => {
      const result = generateResponsiveCSSProperties('desktop', mockViewportInfo);
      
      expect(result).toEqual({
        '--layout-direction': 'row',
        '--layout-gap': '2rem',
        '--layout-padding': '2rem',
        '--chessboard-width': '65%',
        '--chessboard-max-width': '800px',
        '--sidebar-width': '35%',
        '--sidebar-max-width': '400px',
        '--viewport-width': '1024px',
        '--viewport-height': '768px',
        '--layout-mode': 'desktop',
      });
    });

    it('generates CSS custom properties for mobile layout', () => {
      const mobileViewport: ViewportInfo = {
        ...mockViewportInfo,
        width: 375,
        height: 667,
        isMobile: true,
        isDesktop: false,
      };
      
      const result = generateResponsiveCSSProperties('mobile', mobileViewport);
      
      expect(result).toEqual({
        '--layout-direction': 'column',
        '--layout-gap': '1rem',
        '--layout-padding': '1rem',
        '--chessboard-width': '100%',
        '--chessboard-max-width': '400px',
        '--sidebar-width': '100%',
        '--sidebar-max-width': '400px',
        '--viewport-width': '375px',
        '--viewport-height': '667px',
        '--layout-mode': 'mobile',
      });
    });
  });

  describe('isLandscapeOrientation', () => {
    it('returns true for landscape orientation', () => {
      expect(isLandscapeOrientation(mockViewportInfo)).toBe(true); // 1024 > 768
    });

    it('returns false for portrait orientation', () => {
      const portraitViewport: ViewportInfo = {
        ...mockViewportInfo,
        width: 375,
        height: 667,
      };
      expect(isLandscapeOrientation(portraitViewport)).toBe(false); // 375 < 667
    });

    it('returns true for square viewport', () => {
      const squareViewport: ViewportInfo = {
        ...mockViewportInfo,
        width: 800,
        height: 800,
      };
      expect(isLandscapeOrientation(squareViewport)).toBe(false); // 800 = 800, not greater
    });
  });

  describe('calculateOptimalAspectRatio', () => {
    it('returns preferred ratio for normal landscape viewport', () => {
      const result = calculateOptimalAspectRatio(mockViewportInfo, 1.5);
      expect(result).toBe(1.5); // Normal case, no adjustment needed
    });

    it('adjusts ratio for portrait viewport with landscape preference', () => {
      const portraitViewport: ViewportInfo = {
        ...mockViewportInfo,
        width: 375,
        height: 667,
      };
      const result = calculateOptimalAspectRatio(portraitViewport, 2);
      // Viewport ratio: 375/667 ≈ 0.56
      // Adjusted: min(2, 0.56 * 1.5) = min(2, 0.84) = 0.84
      expect(result).toBeCloseTo(0.84, 2);
    });

    it('adjusts ratio for very wide viewport', () => {
      const wideViewport: ViewportInfo = {
        ...mockViewportInfo,
        width: 2560,
        height: 1080,
      };
      const result = calculateOptimalAspectRatio(wideViewport, 1);
      // Viewport ratio: 2560/1080 ≈ 2.37 > 2
      // Preferred ratio 1 < 1.5, so adjust to max(1, 1.5) = 1.5
      expect(result).toBe(1.5);
    });

    it('uses default preferred ratio when not provided', () => {
      const result = calculateOptimalAspectRatio(mockViewportInfo);
      expect(result).toBe(1); // Default preferred ratio
    });
  });
});