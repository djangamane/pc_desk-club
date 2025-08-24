import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Game from '../Game';
import * as ResponsiveContext from '../../contexts/ResponsiveContext';

// Mock dependencies following the same pattern as Game.responsive.test.tsx
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

vi.mock('../../data/quizQuestions', () => ({
  quizQuestions: [
    {
      question: 'Test question 1?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      tauntCorrect: 'Correct taunt',
      tauntIncorrect: 'Incorrect taunt'
    },
    {
      question: 'Test question 2?',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: 'Option 1',
      tauntCorrect: 'Good job',
      tauntIncorrect: 'Wrong answer'
    }
  ]
}));

// Mock Stockfish worker
const mockWorker = {
  postMessage: vi.fn(),
  addEventListener: vi.fn(),
  terminate: vi.fn()
};

// Mock Worker constructor
global.Worker = vi.fn(() => mockWorker) as any;

// Mock navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Create mock responsive context for desktop layout
const createDesktopMockContext = () => ({
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
    chessboardContainer: {
      width: '60%',
      maxWidth: '800px',
      height: 'auto'
    },
    sidebar: {
      width: '40%',
      maxWidth: '500px',
      position: 'right' as const
    },
    spacing: {
      padding: '1rem',
      gap: '1rem'
    }
  },
  chessboardSize: 700,
  calculateDynamicSize: vi.fn((baseSize: number) => Math.round(baseSize * 1.5)),
  isLayoutMode: vi.fn((mode: string) => mode === 'desktop')
});

describe('Game Keyboard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    // Mock the responsive context for desktop layout
    const mockContext = createDesktopMockContext();
    vi.spyOn(ResponsiveContext, 'useResponsive').mockReturnValue(mockContext);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderGame = () => {
    return render(
      <BrowserRouter>
        <Game />
      </BrowserRouter>
    );
  };

  describe('Keyboard Handler Integration', () => {
    it('renders game with keyboard handler on desktop layout', async () => {
      renderGame();

      // Wait for the game to load and keyboard handler to be present
      await waitFor(() => {
        expect(screen.getByTestId('game-keyboard-handler')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('keyboard handler is properly integrated with game state', async () => {
      renderGame();

      await waitFor(() => {
        expect(screen.getByTestId('game-keyboard-handler')).toBeInTheDocument();
      }, { timeout: 5000 });

      // The keyboard handler should be present and properly integrated
      const keyboardHandler = screen.getByTestId('game-keyboard-handler');
      expect(keyboardHandler).toBeInTheDocument();
      expect(keyboardHandler).toHaveStyle({ display: 'none' });
      expect(keyboardHandler).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Navigation Keyboard Shortcuts Integration', () => {
    it('handles escape key navigation in game context', async () => {
      renderGame();

      await waitFor(() => {
        expect(screen.getByTestId('game-keyboard-handler')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Press Escape key
      fireEvent.keyDown(document, { key: 'Escape' });

      // Should navigate back to home
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('handles home key navigation in game context', async () => {
      renderGame();

      await waitFor(() => {
        expect(screen.getByTestId('game-keyboard-handler')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Press Home key
      fireEvent.keyDown(document, { key: 'Home' });

      // Should navigate to home
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('handles h key navigation in game context', async () => {
      renderGame();

      await waitFor(() => {
        expect(screen.getByTestId('game-keyboard-handler')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Press 'h' key
      fireEvent.keyDown(document, { key: 'h' });

      // Should navigate to home
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Quiz Answer Keyboard Integration', () => {
    it('integrates quiz answer keyboard shortcuts with game state', async () => {
      renderGame();

      await waitFor(() => {
        expect(screen.getByTestId('game-keyboard-handler')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Simulate pressing '1' key for first answer
      fireEvent.keyDown(document, { key: '1' });

      // Verify the keyboard handler is still active and integrated
      await waitFor(() => {
        expect(screen.getByTestId('game-keyboard-handler')).toBeInTheDocument();
      });
    });

    it('handles multiple quiz answer keys in sequence', async () => {
      renderGame();

      await waitFor(() => {
        expect(screen.getByTestId('game-keyboard-handler')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Test multiple answer keys
      const answerKeys = ['1', '2', '3', '4'];
      
      for (const key of answerKeys) {
        fireEvent.keyDown(document, { key });
        
        // Verify the keyboard handler remains active
        await waitFor(() => {
          expect(screen.getByTestId('game-keyboard-handler')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Game Control Integration', () => {
    it('integrates game control shortcuts with console logging', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      renderGame();

      await waitFor(() => {
        expect(screen.getByTestId('game-keyboard-handler')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Press 'p' key for pause
      fireEvent.keyDown(document, { key: 'p' });

      // Should log pause request
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Game pause requested via keyboard');
      });

      // Press 'r' key for reset
      fireEvent.keyDown(document, { key: 'r' });

      // Should log reset request
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Game reset requested via keyboard');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Layout Integration', () => {
    it('keyboard handler integrates with responsive layout system', async () => {
      renderGame();

      await waitFor(() => {
        expect(screen.getByTestId('game-keyboard-handler')).toBeInTheDocument();
        expect(screen.getByTestId('game-layout-transition')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Both keyboard handler and layout transition should be present
      expect(screen.getByTestId('game-keyboard-handler')).toBeInTheDocument();
      expect(screen.getByTestId('game-layout-transition')).toBeInTheDocument();
    });
  });
});