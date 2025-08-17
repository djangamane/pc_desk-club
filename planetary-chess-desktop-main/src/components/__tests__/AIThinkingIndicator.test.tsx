import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { AIThinkingIndicator } from '../AIThinkingIndicator';
import { ResponsiveProvider } from '../../contexts/ResponsiveContext';

// Mock the responsive context
const mockResponsiveContext = {
  viewportInfo: { width: 1200, height: 800, isMobile: false, isTablet: false, isDesktop: true, isLargeDesktop: false },
  layoutMode: 'desktop' as const,
  layoutConfig: {} as any,
  chessboardSize: 600,
  calculateDynamicSize: (size: number) => size * 1.5,
  isLayoutMode: (mode: string) => mode === 'desktop',
};

vi.mock('../../contexts/ResponsiveContext', async () => {
  const actual = await vi.importActual('../../contexts/ResponsiveContext');
  return {
    ...actual,
    useResponsive: () => mockResponsiveContext,
  };
});

// Mock window.matchMedia for animation tests
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <ResponsiveProvider>
      {component}
    </ResponsiveProvider>
  );
};

describe('AIThinkingIndicator', () => {
  beforeEach(() => {
    mockMatchMedia(false); // Enable animations by default
  });

  it('should render with default props', () => {
    renderWithProvider(
      <AIThinkingIndicator isThinking={false} data-testid="ai-indicator" />
    );

    const indicator = screen.getByTestId('ai-indicator');
    expect(indicator).toBeInTheDocument();
  });

  it('should render children when provided', () => {
    renderWithProvider(
      <AIThinkingIndicator isThinking={false}>
        <img src="/test.png" alt="Test Avatar" />
      </AIThinkingIndicator>
    );

    expect(screen.getByAltText('Test Avatar')).toBeInTheDocument();
  });

  it('should apply thinking animation when isThinking is true', () => {
    renderWithProvider(
      <AIThinkingIndicator isThinking={true} data-testid="thinking-indicator" />
    );

    const indicator = screen.getByTestId('thinking-indicator');
    expect(indicator).toHaveStyle('animation: desktopThinkingGlow 1500ms infinite ease-in-out');
  });

  it('should not apply thinking animation when isThinking is false', () => {
    renderWithProvider(
      <AIThinkingIndicator isThinking={false} data-testid="idle-indicator" />
    );

    const indicator = screen.getByTestId('idle-indicator');
    expect(indicator).not.toHaveStyle('animation: desktopThinkingGlow 1500ms infinite ease-in-out');
  });

  it('should scale size based on responsive context', () => {
    renderWithProvider(
      <AIThinkingIndicator isThinking={false} size={100} data-testid="sized-indicator" />
    );

    const indicator = screen.getByTestId('sized-indicator');
    // calculateDynamicSize multiplies by 1.5 in our mock
    expect(indicator).toHaveStyle('width: 150px');
    expect(indicator).toHaveStyle('height: 150px');
  });

  it('should show progress bar when showProgressBar is true and thinking', () => {
    const { container } = renderWithProvider(
      <AIThinkingIndicator isThinking={true} showProgressBar={true} />
    );

    // Progress bar should be visible (opacity: 1)
    const progressBar = container.querySelector('[style*="opacity: 1"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('should hide progress bar when not thinking', () => {
    const { container } = renderWithProvider(
      <AIThinkingIndicator isThinking={false} showProgressBar={true} />
    );

    // Progress bar should be hidden (opacity: 0)
    const progressBar = container.querySelector('[style*="opacity: 0"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('should not show progress bar when showProgressBar is false', () => {
    const { container } = renderWithProvider(
      <AIThinkingIndicator isThinking={true} showProgressBar={false} />
    );

    // Should not find progress bar elements
    const progressElements = container.querySelectorAll('[style*="background: rgba(0, 0, 0, 0.3)"]');
    expect(progressElements).toHaveLength(0);
  });

  describe('Desktop-specific features', () => {
    beforeEach(() => {
      mockResponsiveContext.layoutMode = 'desktop';
    });

    it('should show pulsing ring effect on desktop when thinking', () => {
      const { container } = renderWithProvider(
        <AIThinkingIndicator isThinking={true} />
      );

      // Look for pulsing ring (element with negative positioning and border)
      const pulsingRing = container.querySelector('[style*="top: -10px"]');
      expect(pulsingRing).toBeInTheDocument();
    });

    it('should show neural network pattern on desktop when thinking', () => {
      const { container } = renderWithProvider(
        <AIThinkingIndicator isThinking={true} />
      );

      // Look for neural pattern (element with radial-gradient background)
      const neuralPattern = container.querySelector('[style*="radial-gradient"]');
      expect(neuralPattern).toBeInTheDocument();
    });

    it('should show processing text on desktop when thinking', () => {
      renderWithProvider(
        <AIThinkingIndicator isThinking={true} />
      );

      expect(screen.getByText('PROCESSING...')).toBeInTheDocument();
    });

    it('should not show desktop features when not thinking', () => {
      const { container } = renderWithProvider(
        <AIThinkingIndicator isThinking={false} />
      );

      expect(screen.queryByText('PROCESSING...')).not.toBeInTheDocument();
      
      // Neural pattern should be hidden (opacity: 0)
      const neuralPattern = container.querySelector('[style*="opacity: 0"]');
      expect(neuralPattern).toBeInTheDocument();
    });
  });

  describe('Mobile behavior', () => {
    beforeEach(() => {
      mockResponsiveContext.layoutMode = 'mobile';
      mockResponsiveContext.isLayoutMode = (mode: string) => mode === 'mobile';
    });

    it('should not show desktop-specific features on mobile', () => {
      renderWithProvider(
        <AIThinkingIndicator isThinking={true} />
      );

      expect(screen.queryByText('PROCESSING...')).not.toBeInTheDocument();
    });

    it('should use smaller progress bar on mobile', () => {
      const { container } = renderWithProvider(
        <AIThinkingIndicator isThinking={true} showProgressBar={true} />
      );

      // Mobile progress bar should be 40px wide vs 60px on desktop
      const progressBar = container.querySelector('[style*="width: 40px"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Accessibility and Performance', () => {
    it('should respect reduced motion preferences', () => {
      mockMatchMedia(true); // Enable reduced motion

      const { container } = renderWithProvider(
        <AIThinkingIndicator isThinking={true} />
      );

      // Animations should be disabled
      const animatedElements = container.querySelectorAll('[style*="animation: none"]');
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('should handle different intensity levels', () => {
      const { rerender } = renderWithProvider(
        <AIThinkingIndicator isThinking={true} intensity="low" data-testid="low-intensity" />
      );

      let indicator = screen.getByTestId('low-intensity');
      expect(indicator).toBeInTheDocument();

      rerender(
        <ResponsiveProvider>
          <AIThinkingIndicator isThinking={true} intensity="high" data-testid="high-intensity" />
        </ResponsiveProvider>
      );

      indicator = screen.getByTestId('high-intensity');
      expect(indicator).toBeInTheDocument();
    });

    it('should maintain proper z-index layering', () => {
      const { container } = renderWithProvider(
        <AIThinkingIndicator isThinking={true} showProgressBar={true}>
          <div data-testid="child-content">Child</div>
        </AIThinkingIndicator>
      );

      // Check that elements have proper z-index values
      const overlay = container.querySelector('[style*="z-index: 2"]');
      const progressBar = container.querySelector('[style*="z-index: 3"]');
      
      expect(overlay).toBeInTheDocument();
      expect(progressBar).toBeInTheDocument();
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle zero size gracefully', () => {
      renderWithProvider(
        <AIThinkingIndicator isThinking={false} size={0} data-testid="zero-size" />
      );

      const indicator = screen.getByTestId('zero-size');
      expect(indicator).toHaveStyle('width: 0px');
      expect(indicator).toHaveStyle('height: 0px');
    });

    it('should handle very large sizes', () => {
      renderWithProvider(
        <AIThinkingIndicator isThinking={false} size={1000} data-testid="large-size" />
      );

      const indicator = screen.getByTestId('large-size');
      // calculateDynamicSize multiplies by 1.5
      expect(indicator).toHaveStyle('width: 1500px');
      expect(indicator).toHaveStyle('height: 1500px');
    });

    it('should handle rapid thinking state changes', () => {
      const { rerender } = renderWithProvider(
        <AIThinkingIndicator isThinking={true} data-testid="rapid-change" />
      );

      let indicator = screen.getByTestId('rapid-change');
      expect(indicator).toHaveStyle('animation: desktopThinkingGlow 1500ms infinite ease-in-out');

      rerender(
        <ResponsiveProvider>
          <AIThinkingIndicator isThinking={false} data-testid="rapid-change" />
        </ResponsiveProvider>
      );

      indicator = screen.getByTestId('rapid-change');
      expect(indicator).not.toHaveStyle('animation: desktopThinkingGlow 1500ms infinite ease-in-out');
    });
  });
});