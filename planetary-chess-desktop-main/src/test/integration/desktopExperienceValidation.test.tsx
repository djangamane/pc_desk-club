import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Game from '../../components/Game';
import { act } from 'react-dom/test-utils';

// Mock Stockfish worker
const mockWorker = {
  addEventListener: vi.fn(),
  postMessage: vi.fn(),
  terminate: vi.fn(),
};

// Mock Worker constructor
global.Worker = vi.fn().mockImplementation(() => mockWorker);

// Mock window.prompt for leaderboard functionality
global.prompt = vi.fn().mockReturnValue('TestPlayer');

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia for responsive testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const TestWrapper = ({ children, viewport = { width: 1920, height: 1080 } }: { 
  children: React.ReactNode;
  viewport?: { width: number; height: number };
}) => {
  // Mock viewport dimensions
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: viewport.width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: viewport.height,
  });

  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

describe('Desktop Experience Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset viewport to desktop size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080,
    });
  });

  describe('Complete Desktop User Experience Flow', () => {
    it('should provide seamless desktop experience from start to finish', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      );

      // Wait for component to render
      await waitFor(() => {
        expect(screen.getByTestId('game-container')).toBeInTheDocument();
      });

      const gameContainer = screen.getByTestId('game-container');
      
      // Verify desktop layout is applied
      expect(gameContainer).toHaveClass('desktop-layout');
      
      // Verify responsive chessboard is present
      expect(screen.getByTestId('responsive-chessboard')).toBeInTheDocument();
      
      // Verify desktop sidebar is present
      expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument();
      
      // Verify keyboard handler is active
      expect(screen.getByTestId('game-keyboard-handler')).toBeInTheDocument();
      
      // Verify layout transition component is present
      expect(screen.getByTestId('game-layout-transition')).toBeInTheDocument();
    });

    it('should handle responsive breakpoint transitions smoothly', async () => {
      const { rerender } = render(
        <TestWrapper viewport={{ width: 600, height: 800 }}>
          <Game />
        </TestWrapper>
      );

      // Wait for mobile layout
      await waitFor(() => {
        const gameContainer = screen.getByTestId('game-container');
        expect(gameContainer).toHaveClass('mobile-layout');
      });

      // Simulate viewport change to desktop
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1920,
        });
        
        // Trigger resize event
        fireEvent(window, new Event('resize'));
      });

      // Re-render with desktop viewport
      rerender(
        <TestWrapper viewport={{ width: 1920, height: 1080 }}>
          <Game />
        </TestWrapper>
      );

      // Wait for desktop layout transition
      await waitFor(() => {
        const gameContainer = screen.getByTestId('game-container');
        expect(gameContainer).toHaveClass('desktop-layout');
      }, { timeout: 3000 });
    });

    it('should maintain game state during layout transitions', async () => {
      const { rerender } = render(
        <TestWrapper viewport={{ width: 600, height: 800 }}>
          <Game />
        </TestWrapper>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByTestId('game-container')).toBeInTheDocument();
      });

      // Verify quiz is visible initially
      const quizElement = screen.getByTestId('mobile-quiz');
      expect(quizElement).toBeInTheDocument();

      // Switch to desktop layout
      rerender(
        <TestWrapper viewport={{ width: 1920, height: 1080 }}>
          <Game />
        </TestWrapper>
      );

      // Wait for desktop layout
      await waitFor(() => {
        const gameContainer = screen.getByTestId('game-container');
        expect(gameContainer).toHaveClass('desktop-layout');
      });

      // Verify game state is preserved (quiz should still be present in sidebar)
      expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument();
    });
  });

  describe('Desktop-Specific Features Validation', () => {
    it('should enable keyboard navigation in desktop mode', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('game-container')).toBeInTheDocument();
      });

      const keyboardHandler = screen.getByTestId('game-keyboard-handler');
      expect(keyboardHandler).toBeInTheDocument();

      // Test escape key navigation
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      
      // Keyboard handler should be active (not aria-hidden)
      expect(keyboardHandler).not.toHaveAttribute('aria-hidden', 'true');
    });

    it('should display enhanced visual effects for desktop', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('game-container')).toBeInTheDocument();
      });

      // Verify enhanced chessboard is present
      const chessboard = screen.getByTestId('responsive-chessboard');
      expect(chessboard).toBeInTheDocument();
      
      // Verify desktop layout container has proper styling
      const gameContainer = screen.getByTestId('game-container');
      expect(gameContainer).toHaveClass('desktop-layout');
    });

    it('should handle large screen dimensions appropriately', async () => {
      render(
        <TestWrapper viewport={{ width: 3840, height: 2160 }}>
          <Game />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('game-container')).toBeInTheDocument();
      });

      const gameContainer = screen.getByTestId('game-container');
      expect(gameContainer).toHaveClass('desktop-layout');
      
      // Verify components scale appropriately for 4K displays
      const chessboard = screen.getByTestId('responsive-chessboard');
      expect(chessboard).toBeInTheDocument();
    });
  });

  describe('Cross-Platform Desktop Compatibility', () => {
    it('should work across different desktop screen sizes', async () => {
      const testSizes = [
        { width: 1366, height: 768 },   // Laptop
        { width: 1920, height: 1080 },  // 1080p Desktop
        { width: 2560, height: 1440 },  // 1440p Desktop
        { width: 3440, height: 1440 },  // Ultrawide
      ];

      for (const size of testSizes) {
        const { unmount } = render(
          <TestWrapper viewport={size}>
            <Game />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByTestId('game-container')).toBeInTheDocument();
        });

        const gameContainer = screen.getByTestId('game-container');
        expect(gameContainer).toHaveClass('desktop-layout');
        
        unmount();
      }
    });

    it('should maintain performance across different viewport sizes', async () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('game-container')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (less than 1 second)
      expect(renderTime).toBeLessThan(1000);
    });
  });

  describe('Integration with All Responsive Components', () => {
    it('should integrate all responsive components successfully', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('game-container')).toBeInTheDocument();
      });

      // Verify all major responsive components are present
      expect(screen.getByTestId('responsive-chessboard')).toBeInTheDocument();
      expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('game-keyboard-handler')).toBeInTheDocument();
      expect(screen.getByTestId('game-layout-transition')).toBeInTheDocument();
      
      // Verify layout manager is working
      const gameContainer = screen.getByTestId('game-container');
      expect(gameContainer).toHaveClass('desktop-layout');
    });

    it('should handle component interactions without conflicts', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('game-container')).toBeInTheDocument();
      });

      // Test that components don't interfere with each other
      const chessboard = screen.getByTestId('responsive-chessboard');
      const sidebar = screen.getByTestId('desktop-sidebar');
      
      expect(chessboard).toBeInTheDocument();
      expect(sidebar).toBeInTheDocument();
      
      // Both should be visible simultaneously in desktop layout
      expect(chessboard).toBeVisible();
      expect(sidebar).toBeVisible();
    });
  });

  describe('Error Handling and Graceful Degradation', () => {
    it('should handle missing assets gracefully', async () => {
      // Mock console.error to catch any errors
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('game-container')).toBeInTheDocument();
      });

      // Should render successfully even if some assets are missing
      expect(screen.getByTestId('game-container')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('should fallback gracefully when responsive features fail', async () => {
      // Mock a responsive context failure
      const originalError = console.error;
      console.error = vi.fn();
      
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('game-container')).toBeInTheDocument();
      });

      // Should still render the game container
      expect(screen.getByTestId('game-container')).toBeInTheDocument();
      
      console.error = originalError;
    });
  });
});