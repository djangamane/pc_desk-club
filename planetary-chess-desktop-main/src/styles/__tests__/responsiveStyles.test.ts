import {
  FUTURISTIC_THEME,
  RESPONSIVE_TYPOGRAPHY,
  RESPONSIVE_SPACING,
  getResponsiveFontSize,
  getResponsiveSpacing,
  createResponsiveStyles,
  createResponsiveButtonStyles,
  createResponsivePanelStyles,
  createResponsiveTextStyles,
  createResponsiveAvatarStyles,
  createResponsiveChessboardStyles,
  createResponsiveLayoutStyles,
  generateResponsiveAnimationCSS,
} from '../responsiveStyles';
import { LayoutMode, ViewportInfo } from '../../types/responsive';

describe('Responsive Styles', () => {
  const mockViewportInfo: ViewportInfo = {
    width: 1200,
    height: 800,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLargeDesktop: false,
  };

  describe('FUTURISTIC_THEME', () => {
    it('should have all required color properties', () => {
      expect(FUTURISTIC_THEME.colors.primary).toBe('#00c3ff');
      expect(FUTURISTIC_THEME.colors.primaryDark).toBe('#054487');
      expect(FUTURISTIC_THEME.colors.background.primary).toBe('#061224');
      expect(FUTURISTIC_THEME.colors.text.primary).toBe('#e8f4ff');
    });

    it('should have gradient definitions', () => {
      expect(FUTURISTIC_THEME.gradients.background).toContain('linear-gradient');
      expect(FUTURISTIC_THEME.gradients.button).toContain('linear-gradient');
    });

    it('should have effect definitions', () => {
      expect(FUTURISTIC_THEME.effects.boxShadow.subtle).toContain('rgba');
      expect(FUTURISTIC_THEME.effects.glow.moderate).toContain('rgba');
    });
  });

  describe('RESPONSIVE_TYPOGRAPHY', () => {
    it('should have font sizes for all layout modes', () => {
      const fontSizes = RESPONSIVE_TYPOGRAPHY.fontSizes.base;
      expect(fontSizes.mobile).toBe(14);
      expect(fontSizes.tablet).toBe(15);
      expect(fontSizes.desktop).toBe(16);
      expect(fontSizes['large-desktop']).toBe(18);
    });

    it('should have consistent scaling across sizes', () => {
      const small = RESPONSIVE_TYPOGRAPHY.fontSizes.sm.desktop;
      const base = RESPONSIVE_TYPOGRAPHY.fontSizes.base.desktop;
      const large = RESPONSIVE_TYPOGRAPHY.fontSizes.lg.desktop;
      
      expect(small).toBeLessThan(base);
      expect(base).toBeLessThan(large);
    });
  });

  describe('RESPONSIVE_SPACING', () => {
    it('should have spacing values for all layout modes', () => {
      const spacing = RESPONSIVE_SPACING.base;
      expect(spacing.mobile).toBe(12);
      expect(spacing.tablet).toBe(15);
      expect(spacing.desktop).toBe(20);
      expect(spacing['large-desktop']).toBe(24);
    });

    it('should scale appropriately across layout modes', () => {
      const spacing = RESPONSIVE_SPACING.lg;
      expect(spacing.mobile).toBeLessThan(spacing.tablet);
      expect(spacing.tablet).toBeLessThan(spacing.desktop);
      expect(spacing.desktop).toBeLessThan(spacing['large-desktop']);
    });
  });

  describe('getResponsiveFontSize', () => {
    it('should return correct font size for layout mode', () => {
      expect(getResponsiveFontSize('base', 'mobile')).toBe(14);
      expect(getResponsiveFontSize('base', 'desktop')).toBe(16);
      expect(getResponsiveFontSize('lg', 'large-desktop')).toBe(22);
    });

    it('should handle all size keys', () => {
      const sizeKeys: (keyof typeof RESPONSIVE_TYPOGRAPHY.fontSizes)[] = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'];
      
      sizeKeys.forEach(sizeKey => {
        expect(() => getResponsiveFontSize(sizeKey, 'desktop')).not.toThrow();
        expect(typeof getResponsiveFontSize(sizeKey, 'desktop')).toBe('number');
      });
    });
  });

  describe('getResponsiveSpacing', () => {
    it('should return correct spacing for layout mode', () => {
      expect(getResponsiveSpacing('base', 'mobile')).toBe(12);
      expect(getResponsiveSpacing('base', 'desktop')).toBe(20);
      expect(getResponsiveSpacing('xl', 'large-desktop')).toBe(40);
    });

    it('should handle all spacing keys', () => {
      const spacingKeys: (keyof typeof RESPONSIVE_SPACING)[] = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'];
      
      spacingKeys.forEach(spacingKey => {
        expect(() => getResponsiveSpacing(spacingKey, 'desktop')).not.toThrow();
        expect(typeof getResponsiveSpacing(spacingKey, 'desktop')).toBe('number');
      });
    });
  });

  describe('createResponsiveStyles', () => {
    it('should generate CSS custom properties', () => {
      const styles = createResponsiveStyles('desktop', mockViewportInfo);
      
      expect(styles['--layout-direction']).toBe('row');
      expect(styles['--viewport-width']).toBe('1200px');
      expect(styles['--layout-mode']).toBe('desktop');
      expect(styles['--base-font-size']).toBe('16px');
    });

    it('should adapt to different layout modes', () => {
      const mobileStyles = createResponsiveStyles('mobile', { ...mockViewportInfo, width: 400 });
      const desktopStyles = createResponsiveStyles('desktop', mockViewportInfo);
      
      expect(mobileStyles['--layout-direction']).toBe('column');
      expect(desktopStyles['--layout-direction']).toBe('row');
    });
  });

  describe('createResponsiveButtonStyles', () => {
    it('should create button styles with correct properties', () => {
      const styles = createResponsiveButtonStyles('desktop', 'primary', 'base');
      
      expect(styles.fontSize).toBe('16px');
      expect(styles.fontFamily).toBe('"Orbitron", sans-serif');
      expect(styles.cursor).toBe('pointer');
      expect(styles.borderRadius).toBe('8px');
    });

    it('should vary styles by variant', () => {
      const primaryStyles = createResponsiveButtonStyles('desktop', 'primary');
      const secondaryStyles = createResponsiveButtonStyles('desktop', 'secondary');
      const subtleStyles = createResponsiveButtonStyles('desktop', 'subtle');
      
      expect(primaryStyles.background).not.toBe(secondaryStyles.background);
      expect(secondaryStyles.background).not.toBe(subtleStyles.background);
    });

    it('should vary styles by size', () => {
      const smallStyles = createResponsiveButtonStyles('desktop', 'primary', 'sm');
      const baseStyles = createResponsiveButtonStyles('desktop', 'primary', 'base');
      const largeStyles = createResponsiveButtonStyles('desktop', 'primary', 'lg');
      
      expect(parseInt(smallStyles.fontSize as string)).toBeLessThan(parseInt(baseStyles.fontSize as string));
      expect(parseInt(baseStyles.fontSize as string)).toBeLessThan(parseInt(largeStyles.fontSize as string));
    });

    it('should adapt to layout mode', () => {
      const mobileStyles = createResponsiveButtonStyles('mobile', 'primary');
      const desktopStyles = createResponsiveButtonStyles('desktop', 'primary');
      
      expect(mobileStyles.borderRadius).toBe('6px');
      expect(desktopStyles.borderRadius).toBe('8px');
    });
  });

  describe('createResponsivePanelStyles', () => {
    it('should create panel styles with correct properties', () => {
      const styles = createResponsivePanelStyles('desktop', 'primary', true);
      
      expect(styles.borderRadius).toBe('12px');
      expect(styles.backdropFilter).toBe('blur(5px)');
      expect(styles.position).toBe('relative');
    });

    it('should vary styles by variant', () => {
      const primaryStyles = createResponsivePanelStyles('desktop', 'primary');
      const secondaryStyles = createResponsivePanelStyles('desktop', 'secondary');
      const overlayStyles = createResponsivePanelStyles('desktop', 'overlay');
      
      expect(primaryStyles.background).not.toBe(secondaryStyles.background);
      expect(secondaryStyles.background).not.toBe(overlayStyles.background);
    });

    it('should handle glow option', () => {
      const withGlow = createResponsivePanelStyles('desktop', 'primary', true);
      const withoutGlow = createResponsivePanelStyles('desktop', 'primary', false);
      
      expect(withGlow.boxShadow).not.toBe(withoutGlow.boxShadow);
    });
  });

  describe('createResponsiveTextStyles', () => {
    it('should create text styles with correct properties', () => {
      const styles = createResponsiveTextStyles('desktop', 'heading', 'xl');
      
      expect(styles.fontSize).toBe('24px');
      expect(styles.fontFamily).toBe('"Orbitron", sans-serif');
      expect(styles.fontWeight).toBe('800');
    });

    it('should vary styles by variant', () => {
      const headingStyles = createResponsiveTextStyles('desktop', 'heading');
      const bodyStyles = createResponsiveTextStyles('desktop', 'body');
      const captionStyles = createResponsiveTextStyles('desktop', 'caption');
      
      expect(headingStyles.fontFamily).toBe('"Orbitron", sans-serif');
      expect(bodyStyles.fontFamily).toBe('system-ui, sans-serif');
      expect(captionStyles.fontFamily).toBe('"Orbitron", sans-serif');
    });
  });

  describe('createResponsiveAvatarStyles', () => {
    it('should create avatar styles with correct dimensions', () => {
      const size = 100;
      const styles = createResponsiveAvatarStyles('desktop', size, true);
      
      expect(styles.width).toBe('100px');
      expect(styles.height).toBe('100px');
      expect(styles.borderRadius).toBe('50%');
      expect(styles.overflow).toBe('hidden');
    });

    it('should handle glow option', () => {
      const withGlow = createResponsiveAvatarStyles('desktop', 100, true);
      const withoutGlow = createResponsiveAvatarStyles('desktop', 100, false);
      
      expect(withGlow.boxShadow).toContain('rgba(0, 195, 255');
      expect(withoutGlow.boxShadow).toContain('rgba(0, 195, 255, 0.1)'); // Still has subtle glow
      expect(withGlow.boxShadow).not.toBe(withoutGlow.boxShadow); // But they should be different
    });
  });

  describe('createResponsiveChessboardStyles', () => {
    it('should create chessboard container styles', () => {
      const size = 600;
      const styles = createResponsiveChessboardStyles('desktop', size);
      
      expect(styles.maxWidth).toBe('600px');
      expect(styles.borderRadius).toBe('10px');
      expect(styles.position).toBe('relative');
    });

    it('should adapt to layout mode', () => {
      const mobileStyles = createResponsiveChessboardStyles('mobile', 400);
      const desktopStyles = createResponsiveChessboardStyles('desktop', 600);
      
      expect(mobileStyles.borderRadius).toBe('8px');
      expect(desktopStyles.borderRadius).toBe('10px');
    });
  });

  describe('createResponsiveLayoutStyles', () => {
    it('should create layout container styles', () => {
      const styles = createResponsiveLayoutStyles('desktop', mockViewportInfo);
      
      expect(styles.display).toBe('flex');
      expect(styles.flexDirection).toBe('row');
      expect(styles.minHeight).toBe('100vh');
      expect(styles.position).toBe('relative');
    });

    it('should adapt to layout mode', () => {
      const mobileViewport = { ...mockViewportInfo, width: 400, isMobile: true, isDesktop: false };
      const mobileStyles = createResponsiveLayoutStyles('mobile', mobileViewport);
      const desktopStyles = createResponsiveLayoutStyles('desktop', mockViewportInfo);
      
      expect(mobileStyles.flexDirection).toBe('column');
      expect(desktopStyles.flexDirection).toBe('row');
    });
  });

  describe('generateResponsiveAnimationCSS', () => {
    it('should generate CSS animation keyframes', () => {
      const css = generateResponsiveAnimationCSS();
      
      expect(css).toContain('@keyframes responsiveGlow');
      expect(css).toContain('@keyframes responsivePulse');
      expect(css).toContain('@keyframes responsiveThinkingBar');
      expect(css).toContain('@keyframes responsiveBlink');
    });

    it('should be valid CSS syntax', () => {
      const css = generateResponsiveAnimationCSS();
      
      // Check for proper keyframe syntax
      expect(css).toMatch(/@keyframes\s+\w+\s*{/);
      expect(css).toMatch(/0%\s*{[^}]*}/);
      expect(css).toMatch(/100%\s*{[^}]*}/);
    });
  });

  describe('Integration Tests', () => {
    it('should work together for complete component styling', () => {
      const layoutMode: LayoutMode = 'desktop';
      
      // Test that all style functions work with the same layout mode
      const buttonStyles = createResponsiveButtonStyles(layoutMode, 'primary', 'base');
      const panelStyles = createResponsivePanelStyles(layoutMode, 'primary', true);
      const textStyles = createResponsiveTextStyles(layoutMode, 'heading', 'xl');
      const layoutStyles = createResponsiveLayoutStyles(layoutMode, mockViewportInfo);
      
      expect(buttonStyles.fontSize).toBe('16px');
      expect(panelStyles.borderRadius).toBe('12px');
      expect(textStyles.fontSize).toBe('24px');
      expect(layoutStyles.flexDirection).toBe('row');
    });

    it('should maintain consistent theming across components', () => {
      const buttonStyles = createResponsiveButtonStyles('desktop', 'primary');
      const panelStyles = createResponsivePanelStyles('desktop', 'primary');
      
      // Both should use the same border color
      expect(buttonStyles.border).toContain('rgba(0, 195, 255, 0.3)');
      expect(panelStyles.border).toContain('rgba(0, 195, 255, 0.3)');
    });

    it('should scale consistently across layout modes', () => {
      const modes: LayoutMode[] = ['mobile', 'tablet', 'desktop', 'large-desktop'];
      
      modes.forEach((mode, index) => {
        const fontSize = getResponsiveFontSize('base', mode);
        const spacing = getResponsiveSpacing('base', mode);
        
        if (index > 0) {
          const prevMode = modes[index - 1];
          const prevFontSize = getResponsiveFontSize('base', prevMode);
          const prevSpacing = getResponsiveSpacing('base', prevMode);
          
          expect(fontSize).toBeGreaterThanOrEqual(prevFontSize);
          expect(spacing).toBeGreaterThanOrEqual(prevSpacing);
        }
      });
    });
  });
});