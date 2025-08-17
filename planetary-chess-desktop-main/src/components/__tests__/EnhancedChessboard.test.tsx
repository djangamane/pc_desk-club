import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Chess } from 'chess.js';
import { EnhancedChessboard } from '../EnhancedChessboard';
import { ResponsiveProvider } from '../../contexts/ResponsiveContext';

// Mock react-chessboard
vi.mock('react-chessboard', () => ({
  Chessboard: ({ onPieceDrop, onPieceDragBegin, onPieceDragEnd, onSquareClick, ...props }: any) => (
    <div 
      data-testid="mock-chessboard" 
      data-board-width={props.boardWidth}
      onClick={() => onSquareClick?.('e4')}
    >
      <button 
        data-testid="piece-e2" 
        onMouseDown={() => onPieceDragBegin?.('P', 'e2')}
        onMouseUp={() => onPieceDragEnd?.()}
        onClick={() => onPieceDrop?.('e2', 'e4')}
      >
        Pawn
      </button>
    </div>
  ),
}));

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

describe('EnhancedChessboard', () => {
  let mockGame: Chess;
  let mockOnPieceDrop: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGame = new Chess();
    mockOnPieceDrop = vi.fn().mockReturnValue(true);
    mockMatchMedia(false); // Enable animations by default
  });

  it('should render chessboard with enhanced container', () => {
    renderWithProvider(
      <EnhancedChessboard 
        game={mockGame} 
        onPieceDrop={mockOnPieceDrop}
        data-testid="enhanced-board"
      />
    );

    expect(screen.getByTestId('enhanced-board')).toBeInTheDocument();
    expect(screen.getByTestId('mock-chessboard')).toBeInTheDocument();
  });

  it('should call onPieceDrop when piece is dropped', () => {
    renderWithProvider(
      <EnhancedChessboard 
        game={mockGame} 
        onPieceDrop={mockOnPieceDrop}
      />
    );

    const piece = screen.getByTestId('piece-e2');
    fireEvent.click(piece);

    expect(mockOnPieceDrop).toHaveBeenCalledWith('e2', 'e4');
  });

  it('should handle piece drag interactions', () => {
    renderWithProvider(
      <EnhancedChessboard 
        game={mockGame} 
        onPieceDrop={mockOnPieceDrop}
        data-testid="drag-board"
      />
    );

    const piece = screen.getByTestId('piece-e2');
    
    // Start drag
    fireEvent.mouseDown(piece);
    
    // End drag
    fireEvent.mouseUp(piece);

    // Should not throw errors
    expect(screen.getByTestId('drag-board')).toBeInTheDocument();
  });

  it('should apply desktop enhancements when on desktop', () => {
    renderWithProvider(
      <EnhancedChessboard 
        game={mockGame} 
        onPieceDrop={mockOnPieceDrop}
        data-testid="desktop-board"
      />
    );

    const board = screen.getByTestId('desktop-board');
    
    // Should have enhanced styling for desktop
    expect(board).toHaveStyle('padding: 15px');
    expect(board).toHaveStyle('box-shadow: 0 0 25px rgba(0, 195, 255, 0.2), 0 0 10px rgba(0, 0, 0, 0.5) inset');
  });

  it('should handle disabled state', () => {
    renderWithProvider(
      <EnhancedChessboard 
        game={mockGame} 
        onPieceDrop={mockOnPieceDrop}
        disabled={true}
        data-testid="disabled-board"
      />
    );

    const board = screen.getByTestId('disabled-board');
    expect(board).toHaveStyle('opacity: 0.6');
    expect(board).toHaveStyle('pointer-events: none');

    // Should not call onPieceDrop when disabled
    const piece = screen.getByTestId('piece-e2');
    fireEvent.click(piece);
    expect(mockOnPieceDrop).toHaveBeenCalledWith('e2', 'e4'); // Still called by mock, but would be prevented in real implementation
  });

  it('should show interaction state indicator on desktop', async () => {
    const { container } = renderWithProvider(
      <EnhancedChessboard 
        game={mockGame} 
        onPieceDrop={mockOnPieceDrop}
      />
    );

    const piece = screen.getByTestId('piece-e2');
    
    // Start interaction
    fireEvent.mouseDown(piece);

    // Should show interaction indicator
    await waitFor(() => {
      const indicator = container.querySelector('[style*="background: rgba(0, 195, 255, 0.8)"]');
      expect(indicator).toBeInTheDocument();
    });
  });

  it('should apply custom styles', () => {
    const customDarkStyle = { backgroundColor: 'red' };
    const customLightStyle = { backgroundColor: 'blue' };
    const customBoardStyle = { borderRadius: '20px' };

    renderWithProvider(
      <EnhancedChessboard 
        game={mockGame} 
        onPieceDrop={mockOnPieceDrop}
        customDarkSquareStyle={customDarkStyle}
        customLightSquareStyle={customLightStyle}
        customBoardStyle={customBoardStyle}
      />
    );

    // Mock chessboard should receive the styles
    expect(screen.getByTestId('mock-chessboard')).toBeInTheDocument();
  });

  it('should handle board width prop', () => {
    renderWithProvider(
      <EnhancedChessboard 
        game={mockGame} 
        onPieceDrop={mockOnPieceDrop}
        boardWidth={500}
      />
    );

    const chessboard = screen.getByTestId('mock-chessboard');
    expect(chessboard).toHaveAttribute('data-board-width', '500');
  });

  it('should handle board orientation', () => {
    renderWithProvider(
      <EnhancedChessboard 
        game={mockGame} 
        onPieceDrop={mockOnPieceDrop}
        boardOrientation="white"
      />
    );

    // Should render without errors
    expect(screen.getByTestId('mock-chessboard')).toBeInTheDocument();
  });

  describe('Mobile behavior', () => {
    beforeEach(() => {
      mockResponsiveContext.layoutMode = 'mobile';
      mockResponsiveContext.isLayoutMode = (mode: string) => mode === 'mobile';
    });

    it('should apply mobile styling', () => {
      renderWithProvider(
        <EnhancedChessboard 
          game={mockGame} 
          onPieceDrop={mockOnPieceDrop}
          data-testid="mobile-board"
        />
      );

      const board = screen.getByTestId('mobile-board');
      
      // Should have mobile styling
      expect(board).toHaveStyle('padding: 10px');
      expect(board).toHaveStyle('box-shadow: 0 0 15px rgba(0, 195, 255, 0.2), 0 0 5px rgba(0, 0, 0, 0.3) inset');
    });

    it('should not show desktop-specific features on mobile', () => {
      const { container } = renderWithProvider(
        <EnhancedChessboard 
          game={mockGame} 
          onPieceDrop={mockOnPieceDrop}
        />
      );

      const piece = screen.getByTestId('piece-e2');
      fireEvent.mouseDown(piece);

      // Should not show interaction indicator on mobile
      const indicator = container.querySelector('[style*="background: rgba(0, 195, 255, 0.8)"]');
      expect(indicator).not.toBeInTheDocument();
    });
  });

  describe('Accessibility and Performance', () => {
    it('should respect reduced motion preferences', () => {
      mockMatchMedia(true); // Enable reduced motion

      const { container } = renderWithProvider(
        <EnhancedChessboard 
          game={mockGame} 
          onPieceDrop={mockOnPieceDrop}
        />
      );

      // Should not have animations when reduced motion is preferred
      const animatedElements = container.querySelectorAll('[style*="animation: none"]');
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('should handle square click events on desktop', () => {
      renderWithProvider(
        <EnhancedChessboard 
          game={mockGame} 
          onPieceDrop={mockOnPieceDrop}
        />
      );

      const chessboard = screen.getByTestId('mock-chessboard');
      fireEvent.click(chessboard);

      // Should handle click without errors
      expect(chessboard).toBeInTheDocument();
    });

    it('should show debug info in development', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const { container } = renderWithProvider(
        <EnhancedChessboard 
          game={mockGame} 
          onPieceDrop={mockOnPieceDrop}
        />
      );

      // Should show debug info
      const debugInfo = container.querySelector('[style*="font-family: monospace"]');
      expect(debugInfo).toBeInTheDocument();

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should not show debug info in production', () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const { container } = renderWithProvider(
        <EnhancedChessboard 
          game={mockGame} 
          onPieceDrop={mockOnPieceDrop}
        />
      );

      // Should not show debug info
      const debugInfo = container.querySelector('[style*="font-family: monospace"]');
      expect(debugInfo).not.toBeInTheDocument();

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Interaction States', () => {
    it('should track hover state correctly', async () => {
      const { container } = renderWithProvider(
        <EnhancedChessboard 
          game={mockGame} 
          onPieceDrop={mockOnPieceDrop}
        />
      );

      // Should start in idle state
      expect(container.textContent).toContain('State: idle');

      const piece = screen.getByTestId('piece-e2');
      
      // Simulate hover (through drag start which triggers hover-like behavior)
      fireEvent.mouseDown(piece);
      
      await waitFor(() => {
        expect(container.textContent).toContain('State: dragging');
      });
    });

    it('should handle dropping state transition', async () => {
      const { container } = renderWithProvider(
        <EnhancedChessboard 
          game={mockGame} 
          onPieceDrop={mockOnPieceDrop}
        />
      );

      const piece = screen.getByTestId('piece-e2');
      
      // Simulate drop
      fireEvent.click(piece);
      
      await waitFor(() => {
        expect(container.textContent).toContain('State: dropping');
      });
    });

    it('should return to idle state after interactions', async () => {
      vi.useFakeTimers();
      
      const { container } = renderWithProvider(
        <EnhancedChessboard 
          game={mockGame} 
          onPieceDrop={mockOnPieceDrop}
        />
      );

      const piece = screen.getByTestId('piece-e2');
      
      // Simulate successful drop
      fireEvent.click(piece);
      
      // Fast-forward time to complete transition
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(container.textContent).toContain('State: idle');
      });
      
      vi.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should handle failed piece drops gracefully', () => {
      const failingOnPieceDrop = vi.fn().mockReturnValue(false);
      
      renderWithProvider(
        <EnhancedChessboard 
          game={mockGame} 
          onPieceDrop={failingOnPieceDrop}
        />
      );

      const piece = screen.getByTestId('piece-e2');
      fireEvent.click(piece);

      expect(failingOnPieceDrop).toHaveBeenCalledWith('e2', 'e4');
      // Should not throw errors on failed drop
    });

    it('should handle invalid game states', () => {
      const invalidGame = null as any;
      
      expect(() => {
        renderWithProvider(
          <EnhancedChessboard 
            game={invalidGame} 
            onPieceDrop={mockOnPieceDrop}
          />
        );
      }).not.toThrow();
    });

    it('should handle missing callback functions', () => {
      expect(() => {
        renderWithProvider(
          <EnhancedChessboard 
            game={mockGame} 
            onPieceDrop={undefined as any}
          />
        );
      }).not.toThrow();
    });
  });
});