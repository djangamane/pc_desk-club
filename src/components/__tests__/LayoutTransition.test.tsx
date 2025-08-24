import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { LayoutTransition, useLayoutTransition } from '../LayoutTransition';
import { LayoutMode } from '../../types/responsive';

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

// Test component to test the hook
const TestHookComponent: React.FC<{ layoutMode: LayoutMode }> = ({ layoutMode }) => {
  const { previousLayoutMode, isTransitioning, handleTransitionComplete } = useLayoutTransition(layoutMode);
  
  return (
    <div data-testid="hook-test">
      <span data-testid="current-mode">{layoutMode}</span>
      <span data-testid="previous-mode">{previousLayoutMode || 'none'}</span>
      <span data-testid="is-transitioning">{isTransitioning.toString()}</span>
      <button onClick={handleTransitionComplete} data-testid="complete-transition">
        Complete
      </button>
    </div>
  );
};

describe('LayoutTransition', () => {
  beforeEach(() => {
    mockMatchMedia(false); // Enable animations by default
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should render children without transition when no previous mode', () => {
    render(
      <LayoutTransition currentLayoutMode="desktop" data-testid="no-transition">
        <div data-testid="child-content">Test Content</div>
      </LayoutTransition>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByTestId('no-transition')).toHaveAttribute('data-layout-mode', 'desktop');
    expect(screen.getByTestId('no-transition')).toHaveAttribute('data-transitioning', 'false');
  });

  it('should apply transition styles when layout mode changes', async () => {
    const { rerender } = render(
      <LayoutTransition currentLayoutMode="mobile" previousLayoutMode="mobile" data-testid="transition-test">
        <div>Content</div>
      </LayoutTransition>
    );

    // Change layout mode
    rerender(
      <LayoutTransition currentLayoutMode="desktop" previousLayoutMode="mobile" data-testid="transition-test">
        <div>Content</div>
      </LayoutTransition>
    );

    const container = screen.getByTestId('transition-test');
    expect(container).toHaveAttribute('data-transitioning', 'true');
    expect(container).toHaveStyle('opacity: 0.8');
    expect(container).toHaveStyle('transform: scale(0.98)');
  });

  it('should complete transition after specified duration', async () => {
    const mockOnComplete = jest.fn();
    
    render(
      <LayoutTransition 
        currentLayoutMode="desktop" 
        previousLayoutMode="mobile" 
        transitionDuration={300}
        onTransitionComplete={mockOnComplete}
        data-testid="duration-test"
      >
        <div>Content</div>
      </LayoutTransition>
    );

    // Fast-forward through the transition
    vi.advanceTimersByTime(150); // Half duration for layout change
    vi.advanceTimersByTime(300); // Full duration for completion

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  it('should handle major layout transitions with fade animation', () => {
    render(
      <LayoutTransition 
        currentLayoutMode="desktop" 
        previousLayoutMode="mobile" 
        data-testid="major-transition"
      >
        <div>Content</div>
      </LayoutTransition>
    );

    const container = screen.getByTestId('major-transition');
    expect(container).toHaveStyle('animation: layoutTransitionFade 300ms ease-in-out');
  });

  it('should not apply major transition animation for minor changes', () => {
    render(
      <LayoutTransition 
        currentLayoutMode="large-desktop" 
        previousLayoutMode="desktop" 
        data-testid="minor-transition"
      >
        <div>Content</div>
      </LayoutTransition>
    );

    const container = screen.getByTestId('minor-transition');
    expect(container).not.toHaveStyle('animation: layoutTransitionFade 300ms ease-in-out');
  });

  it('should respect reduced motion preferences', () => {
    mockMatchMedia(true); // Enable reduced motion

    render(
      <LayoutTransition 
        currentLayoutMode="desktop" 
        previousLayoutMode="mobile" 
        data-testid="reduced-motion"
      >
        <div>Content</div>
      </LayoutTransition>
    );

    const container = screen.getByTestId('reduced-motion');
    expect(container).toHaveStyle('animation: none');
  });

  it('should handle same layout mode gracefully', () => {
    render(
      <LayoutTransition 
        currentLayoutMode="desktop" 
        previousLayoutMode="desktop" 
        data-testid="same-mode"
      >
        <div>Content</div>
      </LayoutTransition>
    );

    const container = screen.getByTestId('same-mode');
    expect(container).toHaveAttribute('data-transitioning', 'false');
    expect(container).toHaveAttribute('data-layout-mode', 'desktop');
  });

  it('should clean up timeouts on unmount', () => {
    const { unmount } = render(
      <LayoutTransition 
        currentLayoutMode="desktop" 
        previousLayoutMode="mobile"
      >
        <div>Content</div>
      </LayoutTransition>
    );

    // Unmount before transition completes
    unmount();
    
    // Should not throw errors when timers fire
    vi.advanceTimersByTime(1000);
  });

  it('should handle custom transition duration', () => {
    render(
      <LayoutTransition 
        currentLayoutMode="desktop" 
        previousLayoutMode="mobile" 
        transitionDuration={500}
        data-testid="custom-duration"
      >
        <div>Content</div>
      </LayoutTransition>
    );

    const container = screen.getByTestId('custom-duration');
    expect(container).toHaveStyle('transition: all 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)');
  });

  it('should disable pointer events during transition', () => {
    render(
      <LayoutTransition 
        currentLayoutMode="desktop" 
        previousLayoutMode="mobile" 
        data-testid="pointer-events"
      >
        <div>Content</div>
      </LayoutTransition>
    );

    const container = screen.getByTestId('pointer-events');
    expect(container).toHaveStyle('pointer-events: none');
  });
});

describe('useLayoutTransition hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with current layout mode', () => {
    render(<TestHookComponent layoutMode="desktop" />);

    expect(screen.getByTestId('current-mode')).toHaveTextContent('desktop');
    expect(screen.getByTestId('previous-mode')).toHaveTextContent('desktop');
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false');
  });

  it('should detect layout mode changes', () => {
    const { rerender } = render(<TestHookComponent layoutMode="mobile" />);

    // Change layout mode
    rerender(<TestHookComponent layoutMode="desktop" />);

    expect(screen.getByTestId('current-mode')).toHaveTextContent('desktop');
    expect(screen.getByTestId('previous-mode')).toHaveTextContent('mobile');
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('true');
  });

  it('should handle transition completion', () => {
    const { rerender } = render(<TestHookComponent layoutMode="mobile" />);

    // Change layout mode
    rerender(<TestHookComponent layoutMode="desktop" />);
    
    // Complete transition
    const completeButton = screen.getByTestId('complete-transition');
    completeButton.click();

    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false');
    expect(screen.getByTestId('previous-mode')).toHaveTextContent('desktop');
  });

  it('should not trigger transition for same layout mode', () => {
    const { rerender } = render(<TestHookComponent layoutMode="desktop" />);

    // "Change" to same layout mode
    rerender(<TestHookComponent layoutMode="desktop" />);

    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false');
  });

  it('should handle rapid layout mode changes', () => {
    const { rerender } = render(<TestHookComponent layoutMode="mobile" />);

    // Rapid changes
    rerender(<TestHookComponent layoutMode="tablet" />);
    rerender(<TestHookComponent layoutMode="desktop" />);
    rerender(<TestHookComponent layoutMode="large-desktop" />);

    expect(screen.getByTestId('current-mode')).toHaveTextContent('large-desktop');
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('true');
  });
});

describe('LayoutTransition Edge Cases', () => {
  beforeEach(() => {
    mockMatchMedia(false);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should handle undefined previous layout mode', () => {
    render(
      <LayoutTransition 
        currentLayoutMode="desktop" 
        previousLayoutMode={undefined}
        data-testid="undefined-previous"
      >
        <div>Content</div>
      </LayoutTransition>
    );

    const container = screen.getByTestId('undefined-previous');
    expect(container).toHaveAttribute('data-transitioning', 'false');
  });

  it('should handle zero transition duration', () => {
    const mockOnComplete = jest.fn();
    
    render(
      <LayoutTransition 
        currentLayoutMode="desktop" 
        previousLayoutMode="mobile" 
        transitionDuration={0}
        onTransitionComplete={mockOnComplete}
      >
        <div>Content</div>
      </LayoutTransition>
    );

    // Should complete immediately with zero duration
    vi.advanceTimersByTime(0);
    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('should handle negative transition duration', () => {
    render(
      <LayoutTransition 
        currentLayoutMode="desktop" 
        previousLayoutMode="mobile" 
        transitionDuration={-100}
        data-testid="negative-duration"
      >
        <div>Content</div>
      </LayoutTransition>
    );

    // Should still work (CSS will handle negative values)
    const container = screen.getByTestId('negative-duration');
    expect(container).toBeInTheDocument();
  });

  it('should handle all layout mode combinations', () => {
    const modes: LayoutMode[] = ['mobile', 'tablet', 'desktop', 'large-desktop'];
    
    modes.forEach(from => {
      modes.forEach(to => {
        if (from !== to) {
          const { unmount } = render(
            <LayoutTransition 
              currentLayoutMode={to} 
              previousLayoutMode={from}
              data-testid={`transition-${from}-${to}`}
            >
              <div>Content</div>
            </LayoutTransition>
          );
          
          const container = screen.getByTestId(`transition-${from}-${to}`);
          expect(container).toBeInTheDocument();
          
          unmount();
        }
      });
    });
  });
});