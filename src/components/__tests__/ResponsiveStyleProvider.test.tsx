import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ResponsiveProvider } from '../../contexts/ResponsiveContext';
import { ResponsiveStyleProvider, useResponsiveClasses, useResponsiveStyles } from '../ResponsiveStyleProvider';

// Mock the responsive context
const mockResponsiveContext = {
  layoutMode: 'desktop' as const,
  viewportInfo: {
    width: 1200,
    height: 800,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLargeDesktop: false,
  },
  layoutConfig: {
    direction: 'row' as const,
    chessboardContainer: { width: '65%', maxWidth: '800px' },
    sidebar: { width: '35%', maxWidth: '400px', position: 'right' as const },
    spacing: { padding: '2rem', gap: '2rem' },
  },
  chessboardSize: 600,
  calculateDynamicSize: (baseSize: number) => baseSize * 1.5,
  isLayoutMode: (mode: string) => mode === 'desktop',
};

// Mock useResponsive hook
vi.mock('../../contexts/ResponsiveContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useResponsive: () => mockResponsiveContext,
  };
});

// Test component that uses responsive classes
const TestComponentWithClasses: React.FC = () => {
  const classes = useResponsiveClasses();
  
  return (
    <div data-testid="test-container" className={classes.container}>
      <div className={classes.panel}>Panel</div>
      <button className={classes.buttonPrimary}>Button</button>
      <span className={classes.textHeading}>Heading</span>
      <div className={classes.hideDesktop}>Hidden on Desktop</div>
      <div className={classes.showDesktop}>Shown on Desktop</div>
    </div>
  );
};

// Test component that uses responsive styles
const TestComponentWithStyles: React.FC = () => {
  const styles = useResponsiveStyles();
  
  return (
    <div data-testid="styles-container">
      <div>Layout Mode: {styles.layoutMode}</div>
      <div>Viewport: {styles.viewportInfo.width}x{styles.viewportInfo.height}</div>
    </div>
  );
};

describe('ResponsiveStyleProvider', () => {
  beforeEach(() => {
    // Clear any existing styles
    const existingStyle = document.getElementById('responsive-global-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
  });

  afterEach(() => {
    // Clean up styles after each test
    const existingStyle = document.getElementById('responsive-global-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
  });

  describe('Style Injection', () => {
    it('should inject global CSS styles', () => {
      render(
        <ResponsiveProvider>
          <ResponsiveStyleProvider>
            <div>Test Content</div>
          </ResponsiveStyleProvider>
        </ResponsiveProvider>
      );

      const styleElement = document.getElementById('responsive-global-styles');
      expect(styleElement).toBeInTheDocument();
      expect(styleElement?.textContent).toContain('responsive-container');
      expect(styleElement?.textContent).toContain('responsive-panel');
      expect(styleElement?.textContent).toContain('responsive-button');
    });

    it('should inject CSS custom properties', () => {
      render(
        <ResponsiveProvider>
          <ResponsiveStyleProvider>
            <div>Test Content</div>
          </ResponsiveStyleProvider>
        </ResponsiveProvider>
      );

      const root = document.documentElement;
      const layoutDirection = root.style.getPropertyValue('--layout-direction');
      const layoutMode = root.style.getPropertyValue('--layout-mode');
      
      expect(layoutDirection).toBe('row');
      expect(layoutMode).toBe('desktop');
    });

    it('should inject animations when enabled', () => {
      render(
        <ResponsiveProvider>
          <ResponsiveStyleProvider includeAnimations={true}>
            <div>Test Content</div>
          </ResponsiveStyleProvider>
        </ResponsiveProvider>
      );

      const styleElement = document.getElementById('responsive-global-styles');
      expect(styleElement?.textContent).toContain('@keyframes responsiveGlow');
      expect(styleElement?.textContent).toContain('@keyframes responsivePulse');
    });

    it('should not inject animations when disabled', () => {
      render(
        <ResponsiveProvider>
          <ResponsiveStyleProvider includeAnimations={false}>
            <div>Test Content</div>
          </ResponsiveStyleProvider>
        </ResponsiveProvider>
      );

      const styleElement = document.getElementById('responsive-global-styles');
      expect(styleElement?.textContent).not.toContain('@keyframes responsiveGlow');
    });

    it('should inject additional CSS when provided', () => {
      const additionalCSS = '.custom-class { color: red; }';
      
      render(
        <ResponsiveProvider>
          <ResponsiveStyleProvider additionalCSS={additionalCSS}>
            <div>Test Content</div>
          </ResponsiveStyleProvider>
        </ResponsiveProvider>
      );

      const styleElement = document.getElementById('responsive-global-styles');
      expect(styleElement?.textContent).toContain('.custom-class { color: red; }');
    });

    it('should not create duplicate style elements', () => {
      const { rerender } = render(
        <ResponsiveProvider>
          <ResponsiveStyleProvider>
            <div>Test Content</div>
          </ResponsiveStyleProvider>
        </ResponsiveProvider>
      );

      // Rerender the component
      rerender(
        <ResponsiveProvider>
          <ResponsiveStyleProvider>
            <div>Updated Content</div>
          </ResponsiveStyleProvider>
        </ResponsiveProvider>
      );

      const styleElements = document.querySelectorAll('#responsive-global-styles');
      expect(styleElements).toHaveLength(1);
    });
  });

  describe('CSS Custom Properties', () => {
    it('should set futuristic theme variables', () => {
      render(
        <ResponsiveProvider>
          <ResponsiveStyleProvider>
            <div>Test Content</div>
          </ResponsiveStyleProvider>
        </ResponsiveProvider>
      );

      const styleElement = document.getElementById('responsive-global-styles');
      expect(styleElement?.textContent).toContain('--futuristic-primary: #00c3ff');
      expect(styleElement?.textContent).toContain('--futuristic-bg-primary: #061224');
      expect(styleElement?.textContent).toContain('--futuristic-text-primary: #e8f4ff');
    });

    it('should update custom properties when layout mode changes', () => {
      const { rerender } = render(
        <ResponsiveProvider>
          <ResponsiveStyleProvider>
            <div>Test Content</div>
          </ResponsiveStyleProvider>
        </ResponsiveProvider>
      );

      // Check initial values
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--layout-mode')).toBe('desktop');

      // Mock layout mode change
      const mockMobileContext = {
        ...mockResponsiveContext,
        layoutMode: 'mobile' as const,
        viewportInfo: { ...mockResponsiveContext.viewportInfo, width: 400, isMobile: true, isDesktop: false },
      };

      vi.mocked(vi.importActual('../../contexts/ResponsiveContext')).useResponsive = vi.fn().mockReturnValue(mockMobileContext);

      rerender(
        <ResponsiveProvider>
          <ResponsiveStyleProvider>
            <div>Test Content</div>
          </ResponsiveStyleProvider>
        </ResponsiveProvider>
      );

      expect(root.style.getPropertyValue('--layout-mode')).toBe('mobile');
    });
  });

  describe('Responsive Classes', () => {
    it('should provide responsive class names', () => {
      render(
        <ResponsiveProvider>
          <ResponsiveStyleProvider>
            <TestComponentWithClasses />
          </ResponsiveStyleProvider>
        </ResponsiveProvider>
      );

      const container = screen.getByTestId('test-container');
      expect(container).toHaveClass('responsive-container');
    });

    it('should include layout mode class', () => {
      const TestComponent = () => {
        const classes = useResponsiveClasses();
        return <div data-testid="layout-mode" className={classes.layoutMode}>Content</div>;
      };

      render(
        <ResponsiveProvider>
          <ResponsiveStyleProvider>
            <TestComponent />
          </ResponsiveStyleProvider>
        </ResponsiveProvider>
      );

      const element = screen.getByTestId('layout-mode');
      expect(element).toHaveClass('layout-desktop');
    });
  });

  describe('Responsive Styles Hook', () => {
    it('should provide responsive utilities', () => {
      render(
        <ResponsiveProvider>
          <ResponsiveStyleProvider>
            <TestComponentWithStyles />
          </ResponsiveStyleProvider>
        </ResponsiveProvider>
      );

      expect(screen.getByText('Layout Mode: desktop')).toBeInTheDocument();
      expect(screen.getByText('Viewport: 1200x800')).toBeInTheDocument();
    });

    it('should provide style generator functions', async () => {
      const TestComponent = () => {
        const styles = useResponsiveStyles();
        const [buttonStyles, setButtonStyles] = React.useState<any>(null);

        React.useEffect(() => {
          styles.getButtonStyles('primary', 'base').then(setButtonStyles);
        }, [styles]);

        return (
          <div data-testid="button-styles">
            {buttonStyles ? 'Styles loaded' : 'Loading...'}
          </div>
        );
      };

      render(
        <ResponsiveProvider>
          <ResponsiveStyleProvider>
            <TestComponent />
          </ResponsiveStyleProvider>
        </ResponsiveProvider>
      );

      // Wait for async style loading
      await screen.findByText('Styles loaded');
    });
  });

  describe('Breakpoint Utilities', () => {
    it('should include responsive breakpoint classes', () => {
      render(
        <ResponsiveProvider>
          <ResponsiveStyleProvider>
            <div>Test Content</div>
          </ResponsiveStyleProvider>
        </ResponsiveProvider>
      );

      const styleElement = document.getElementById('responsive-global-styles');
      expect(styleElement?.textContent).toContain('@media (max-width: 767px)');
      expect(styleElement?.textContent).toContain('.hide-mobile');
      expect(styleElement?.textContent).toContain('.show-desktop');
    });

    it('should include hover effects for desktop', () => {
      render(
        <ResponsiveProvider>
          <ResponsiveStyleProvider>
            <div>Test Content</div>
          </ResponsiveStyleProvider>
        </ResponsiveProvider>
      );

      const styleElement = document.getElementById('responsive-global-styles');
      expect(styleElement?.textContent).toContain('@media (min-width: 1024px)');
      expect(styleElement?.textContent).toContain('.responsive-button:hover');
    });
  });

  describe('Cleanup', () => {
    it('should clean up CSS custom properties on unmount', () => {
      const { unmount } = render(
        <ResponsiveProvider>
          <ResponsiveStyleProvider>
            <div>Test Content</div>
          </ResponsiveStyleProvider>
        </ResponsiveProvider>
      );

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--layout-mode')).toBe('desktop');

      unmount();

      expect(root.style.getPropertyValue('--layout-mode')).toBe('');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing responsive context gracefully', () => {
      // Mock useResponsive to throw error
      const mockUseResponsive = vi.fn().mockImplementation(() => {
        throw new Error('useResponsive must be used within a ResponsiveProvider');
      });
      
      vi.doMock('../../contexts/ResponsiveContext', () => ({
        useResponsive: mockUseResponsive,
      }));

      expect(() => {
        render(
          <ResponsiveStyleProvider>
            <div>Test Content</div>
          </ResponsiveStyleProvider>
        );
      }).toThrow('useResponsive must be used within a ResponsiveProvider');
    });
  });
});