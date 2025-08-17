import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Game from '../Game';

// Mock Supabase
vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      insert: vi.fn(() => Promise.resolve({ error: null }))
    }))
  }
}));

// Mock chess.js
vi.mock('chess.js', () => ({
  Chess: vi.fn(() => ({
    fen: vi.fn(() => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),
    move: vi.fn(() => ({ from: 'e2', to: 'e4' })),
    history: vi.fn(() => []),
    isGameOver: vi.fn(() => false),
    isCheckmate: vi.fn(() => false),
    isDraw: vi.fn(() => false),
    isStalemate: vi.fn(() => false),
    isInsufficientMaterial: vi.fn(() => false),
    isThreefoldRepetition: vi.fn(() => false),
    turn: vi.fn(() => 'w')
  }))
}));

// Mock react-chessboard
vi.mock('react-chessboard', () => ({
  Chessboard: ({ onPieceDrop }: { onPieceDrop: Function }) => (
    <div 
      data-testid="chessboard"
      onClick={() => onPieceDrop && onPieceDrop('e2', 'e4')}
    >
      Mocked Chessboard
    </div>
  )
}));

// Mock Stockfish worker
const mockWorker = {
  postMessage: vi.fn(),
  addEventListener: vi.fn(),
  terminate: vi.fn()
};

// @ts-ignore
global.Worker = vi.fn(() => mockWorker);

// Mock the responsive context with desktop layout
const mockResponsiveContext = {
  viewportInfo: { 
    width: 1200, 
    height: 800, 
    isMobile: false, 
    isTablet: false, 
    isDesktop: true, 
    isLargeDesktop: false 
  },
  layoutMode: 'desktop' as const,
  layoutConfig: {
    direction: 'row' as const,
    chessboardContainer: { width: '60%', maxWidth: '800px' },
    sidebar: { width: '40%', maxWidth: '400px', position: 'right' as const },
    spacing: { padding: '20px', gap: '20px' }
  },
  chessboardSize: 600,
  calculateDynamicSize: (baseSize: number) => baseSize * 1.5,
  isLayoutMode: (mode: string) => mode === 'desktop',
};

vi.mock('../../contexts/ResponsiveContext', () => ({
  ResponsiveProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useResponsive: () => mockResponsiveContext,
}));

// Mock layout transition hook
vi.mock('../LayoutTransition', () => ({
  LayoutTransition: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useLayoutTransition: () => ({
    previousLayoutMode: 'mobile',
    isTransitioning: false,
    handleTransitionComplete: vi.fn()
  })
}));

describe('Game Keyboard Integration', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNavigate = vi.fn();
    
    // Mock useNavigate hook
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
        BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
      };
    });

    // Clear any existing event listeners
    document.removeEventListener('keydown', vi.fn());
    document.removeEventListener('keyup', vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderGameWithRouter = () => {
    return render(
      <BrowserRouter>
        <Game />
      </BrowserRouter>
    );
  };

  describe('Quiz Answer Keyboard Shortcuts', () => {
    it('handles number keys 1-4 for quiz answers when quiz is visible', async () => {
      renderGameWithRouter();

      // Wait for the game to load and quiz to be visible
      await waitFor(() => {
        expect(screen.getByTestId('game-keyboard-handler')).toBeInTheDocument();
      });

      // Find quiz options (should be visible initially)
      const quizOptions = screen.getAllByTestId(/desktop-quiz-option-/);
      expect(quizOptions.length).toBeGreaterThan(0);

      // Simulate pressing '1' key
      fireEvent.keyDown(document, { key: '1' });

      // The quiz should process the answer and potentially hide
      await waitFor(() => {
        // Check that the keyboard event was processed
        // (The exact behavior depends on whether the answer was correct)
        expect(mockWorker.postMessage).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('does not handle quiz answer keys when quiz is not visible', async () => {
      renderGameWithRouter();

      // Wait for game to load
      await waitFor(() => {
        expect(screen.getByTestId('game-keyboard-handler')).toBeInTheDocument();
      });

      // Make a chess move to potentially hide the quiz
      const chessboard = screen.getByTestId('chessboard');
      fireEvent.click(chessboard);

      // Try to use keyboard shortcuts when quiz might not be visible
      fireEvent.keyDown(document, { key: '1' });

      // Should not cause any errors or unexpected behavior
      await waitFor(() => {
        expect(screen.getByTestId('game-keyboard-handler')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Keyboard Shortcuts', () => {
    it('handles Escape key for navigation back', async () => {
      renderGameWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('game-keyboard-handler')).toBeInTheDocument();
      });

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('handles Home key for navigation', async () => {
      renderGameWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('game-keyboard-handler')).toBeInTheDocument();
      });

      fireEvent.keyDown(document, { key: 'Home' });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Keyboard Handler Integration', () => {
    it('renders KeyboardHandler component with correct props', async () => {
      renderGameWithRouter();

      await waitFor(() => {
        const keyboardHandler = screen.getByTestId('game-keyboard-handler');
        expect(keyboardHandler).toBeInTheDocument();
        expect(keyboardHandler).toHaveAttribute('aria-hidden', 'true');
        expect(keyboardHandler).toHaveStyle({ display: 'none' });
      });
    });

    it('keyboard handler is enabled by default', async () => {
      renderGameWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('game-keyboard-handler')).toBeInTheDocument();
      });

      // Test that keyboard events are processed
      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });
});