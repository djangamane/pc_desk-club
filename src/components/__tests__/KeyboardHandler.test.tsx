import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KeyboardHandler, useKeyboardShortcuts } from '../KeyboardHandler';
import { ResponsiveProvider } from '../../contexts/ResponsiveContext';

// Mock the responsive context
const mockResponsiveContext = {
  viewportInfo: { width: 1200, height: 800, isMobile: false, isTablet: false, isDesktop: true, isLargeDesktop: false },
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

// Mock component for testing the hook
const TestHookComponent: React.FC<{
  onQuizAnswer?: (index: number) => void;
  onNavigate?: (action: 'back' | 'home') => void;
  onGameControl?: (action: 'pause' | 'reset') => void;
  isQuizActive?: boolean;
  isGameOver?: boolean;
  enabled?: boolean;
}> = (props) => {
  const { isDesktop, keyboardEnabled } = useKeyboardShortcuts(
    {
      onQuizAnswer: props.onQuizAnswer,
      onNavigate: props.onNavigate,
      onGameControl: props.onGameControl,
    },
    {
      isQuizActive: props.isQuizActive,
      isGameOver: props.isGameOver,
      enabled: props.enabled,
    }
  );

  return (
    <div>
      <div data-testid="is-desktop">{isDesktop.toString()}</div>
      <div data-testid="keyboard-enabled">{keyboardEnabled.toString()}</div>
    </div>
  );
};

describe('KeyboardHandler', () => {
  let mockOnQuizAnswer: ReturnType<typeof vi.fn>;
  let mockOnNavigate: ReturnType<typeof vi.fn>;
  let mockOnGameControl: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnQuizAnswer = vi.fn();
    mockOnNavigate = vi.fn();
    mockOnGameControl = vi.fn();
    
    // Clear any existing event listeners
    document.removeEventListener('keydown', vi.fn());
    document.removeEventListener('keyup', vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      render(
        <ResponsiveProvider>
          <KeyboardHandler
            onQuizAnswer={mockOnQuizAnswer}
            onNavigate={mockOnNavigate}
            onGameControl={mockOnGameControl}
            data-testid="keyboard-handler"
          />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('keyboard-handler')).toBeInTheDocument();
    });

    it('renders as hidden element', () => {
      render(
        <ResponsiveProvider>
          <KeyboardHandler data-testid="keyboard-handler" />
        </ResponsiveProvider>
      );

      const element = screen.getByTestId('keyboard-handler');
      expect(element).toHaveStyle({ display: 'none' });
      expect(element).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Quiz Answer Keyboard Shortcuts', () => {
    it('handles quiz answer keys 1-4 when quiz is active', async () => {
      render(
        <ResponsiveProvider>
          <KeyboardHandler
            onQuizAnswer={mockOnQuizAnswer}
            isQuizActive={true}
            isGameOver={false}
            enabled={true}
            data-testid="keyboard-handler"
          />
        </ResponsiveProvider>
      );

      // Test each quiz answer key
      fireEvent.keyDown(document, { key: '1' });
      await waitFor(() => {
        expect(mockOnQuizAnswer).toHaveBeenCalledWith(0);
      });

      fireEvent.keyDown(document, { key: '2' });
      await waitFor(() => {
        expect(mockOnQuizAnswer).toHaveBeenCalledWith(1);
      });

      fireEvent.keyDown(document, { key: '3' });
      await waitFor(() => {
        expect(mockOnQuizAnswer).toHaveBeenCalledWith(2);
      });

      fireEvent.keyDown(document, { key: '4' });
      await waitFor(() => {
        expect(mockOnQuizAnswer).toHaveBeenCalledWith(3);
      });

      expect(mockOnQuizAnswer).toHaveBeenCalledTimes(4);
    });

    it('does not handle quiz answer keys when quiz is not active', async () => {
      render(
        <ResponsiveProvider>
          <KeyboardHandler
            onQuizAnswer={mockOnQuizAnswer}
            isQuizActive={false}
            isGameOver={false}
            enabled={true}
            data-testid="keyboard-handler"
          />
        </ResponsiveProvider>
      );

      fireEvent.keyDown(document, { key: '1' });
      fireEvent.keyDown(document, { key: '2' });
      
      await waitFor(() => {
        expect(mockOnQuizAnswer).not.toHaveBeenCalled();
      });
    });

    it('does not handle quiz answer keys when game is over', async () => {
      render(
        <ResponsiveProvider>
          <KeyboardHandler
            onQuizAnswer={mockOnQuizAnswer}
            isQuizActive={true}
            isGameOver={true}
            enabled={true}
            data-testid="keyboard-handler"
          />
        </ResponsiveProvider>
      );

      fireEvent.keyDown(document, { key: '1' });
      
      await waitFor(() => {
        expect(mockOnQuizAnswer).not.toHaveBeenCalled();
      });
    });
  });

  describe('Navigation Keyboard Shortcuts', () => {
    it('handles escape key for back navigation', async () => {
      render(
        <ResponsiveProvider>
          <KeyboardHandler
            onNavigate={mockOnNavigate}
            isGameOver={false}
            enabled={true}
            data-testid="keyboard-handler"
          />
        </ResponsiveProvider>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      
      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalledWith('back');
      });
    });

    it('handles backspace key for back navigation', async () => {
      render(
        <ResponsiveProvider>
          <KeyboardHandler
            onNavigate={mockOnNavigate}
            isGameOver={false}
            enabled={true}
            data-testid="keyboard-handler"
          />
        </ResponsiveProvider>
      );

      fireEvent.keyDown(document, { key: 'Backspace' });
      
      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalledWith('back');
      });
    });

    it('handles home key for home navigation', async () => {
      render(
        <ResponsiveProvider>
          <KeyboardHandler
            onNavigate={mockOnNavigate}
            isGameOver={false}
            enabled={true}
            data-testid="keyboard-handler"
          />
        </ResponsiveProvider>
      );

      fireEvent.keyDown(document, { key: 'Home' });
      
      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalledWith('home');
      });
    });

    it('handles h key for home navigation', async () => {
      render(
        <ResponsiveProvider>
          <KeyboardHandler
            onNavigate={mockOnNavigate}
            isGameOver={false}
            enabled={true}
            data-testid="keyboard-handler"
          />
        </ResponsiveProvider>
      );

      fireEvent.keyDown(document, { key: 'h' });
      
      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalledWith('home');
      });
    });

    it('does not handle navigation keys when game is over', async () => {
      render(
        <ResponsiveProvider>
          <KeyboardHandler
            onNavigate={mockOnNavigate}
            isGameOver={true}
            enabled={true}
            data-testid="keyboard-handler"
          />
        </ResponsiveProvider>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      fireEvent.keyDown(document, { key: 'Home' });
      
      await waitFor(() => {
        expect(mockOnNavigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('Game Control Keyboard Shortcuts', () => {
    it('handles pause key', async () => {
      render(
        <ResponsiveProvider>
          <KeyboardHandler
            onGameControl={mockOnGameControl}
            isGameOver={false}
            enabled={true}
            data-testid="keyboard-handler"
          />
        </ResponsiveProvider>
      );

      fireEvent.keyDown(document, { key: 'p' });
      
      await waitFor(() => {
        expect(mockOnGameControl).toHaveBeenCalledWith('pause');
      });
    });

    it('handles reset key', async () => {
      render(
        <ResponsiveProvider>
          <KeyboardHandler
            onGameControl={mockOnGameControl}
            isGameOver={false}
            enabled={true}
            data-testid="keyboard-handler"
          />
        </ResponsiveProvider>
      );

      fireEvent.keyDown(document, { key: 'r' });
      
      await waitFor(() => {
        expect(mockOnGameControl).toHaveBeenCalledWith('reset');
      });
    });

    it('does not handle game control keys when game is over', async () => {
      render(
        <ResponsiveProvider>
          <KeyboardHandler
            onGameControl={mockOnGameControl}
            isGameOver={true}
            enabled={true}
            data-testid="keyboard-handler"
          />
        </ResponsiveProvider>
      );

      fireEvent.keyDown(document, { key: 'p' });
      fireEvent.keyDown(document, { key: 'r' });
      
      await waitFor(() => {
        expect(mockOnGameControl).not.toHaveBeenCalled();
      });
    });
  });

  describe('Event Prevention and Propagation', () => {
    it('prevents default behavior when preventDefault is true', async () => {
      render(
        <ResponsiveProvider>
          <KeyboardHandler
            onQuizAnswer={mockOnQuizAnswer}
            isQuizActive={true}
            preventDefault={true}
            data-testid="keyboard-handler"
          />
        </ResponsiveProvider>
      );

      const event = new KeyboardEvent('keydown', { key: '1' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      
      fireEvent(document, event);
      
      await waitFor(() => {
        expect(preventDefaultSpy).toHaveBeenCalled();
      });
    });

    it('stops propagation when stopPropagation is true', async () => {
      render(
        <ResponsiveProvider>
          <KeyboardHandler
            onQuizAnswer={mockOnQuizAnswer}
            isQuizActive={true}
            stopPropagation={true}
            data-testid="keyboard-handler"
          />
        </ResponsiveProvider>
      );

      const event = new KeyboardEvent('keydown', { key: '1' });
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');
      
      fireEvent(document, event);
      
      await waitFor(() => {
        expect(stopPropagationSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Input Field Handling', () => {
    it('does not handle keys when typing in input fields', async () => {
      const { container } = render(
        <ResponsiveProvider>
          <input data-testid="text-input" />
          <KeyboardHandler
            onQuizAnswer={mockOnQuizAnswer}
            isQuizActive={true}
            data-testid="keyboard-handler"
          />
        </ResponsiveProvider>
      );

      const input = screen.getByTestId('text-input');
      input.focus();
      
      fireEvent.keyDown(input, { key: '1' });
      
      await waitFor(() => {
        expect(mockOnQuizAnswer).not.toHaveBeenCalled();
      });
    });

    it('does not handle keys when typing in textarea', async () => {
      render(
        <ResponsiveProvider>
          <textarea data-testid="text-area" />
          <KeyboardHandler
            onQuizAnswer={mockOnQuizAnswer}
            isQuizActive={true}
            data-testid="keyboard-handler"
          />
        </ResponsiveProvider>
      );

      const textarea = screen.getByTestId('text-area');
      textarea.focus();
      
      fireEvent.keyDown(textarea, { key: '1' });
      
      await waitFor(() => {
        expect(mockOnQuizAnswer).not.toHaveBeenCalled();
      });
    });
  });

  describe('Enabled/Disabled State', () => {
    it('does not handle keys when disabled', async () => {
      render(
        <ResponsiveProvider>
          <KeyboardHandler
            onQuizAnswer={mockOnQuizAnswer}
            isQuizActive={true}
            enabled={false}
            data-testid="keyboard-handler"
          />
        </ResponsiveProvider>
      );

      fireEvent.keyDown(document, { key: '1' });
      
      await waitFor(() => {
        expect(mockOnQuizAnswer).not.toHaveBeenCalled();
      });
    });

    it('handles keys when enabled', async () => {
      render(
        <ResponsiveProvider>
          <KeyboardHandler
            onQuizAnswer={mockOnQuizAnswer}
            isQuizActive={true}
            enabled={true}
            data-testid="keyboard-handler"
          />
        </ResponsiveProvider>
      );

      fireEvent.keyDown(document, { key: '1' });
      
      await waitFor(() => {
        expect(mockOnQuizAnswer).toHaveBeenCalledWith(0);
      });
    });
  });

  describe('Custom Shortcuts', () => {
    it('uses custom quiz answer keys', async () => {
      const customShortcuts = {
        quizAnswers: ['a', 'b', 'c', 'd'],
      };

      render(
        <ResponsiveProvider>
          <KeyboardHandler
            onQuizAnswer={mockOnQuizAnswer}
            isQuizActive={true}
            shortcuts={customShortcuts}
            data-testid="keyboard-handler"
          />
        </ResponsiveProvider>
      );

      fireEvent.keyDown(document, { key: 'a' });
      
      await waitFor(() => {
        expect(mockOnQuizAnswer).toHaveBeenCalledWith(0);
      });

      fireEvent.keyDown(document, { key: '1' });
      
      await waitFor(() => {
        expect(mockOnQuizAnswer).toHaveBeenCalledTimes(1); // Should not respond to '1'
      });
    });

    it('uses custom navigation keys', async () => {
      const customShortcuts = {
        navigation: {
          back: ['q'],
          home: ['w'],
        },
      };

      render(
        <ResponsiveProvider>
          <KeyboardHandler
            onNavigate={mockOnNavigate}
            shortcuts={customShortcuts}
            data-testid="keyboard-handler"
          />
        </ResponsiveProvider>
      );

      fireEvent.keyDown(document, { key: 'q' });
      
      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalledWith('back');
      });

      fireEvent.keyDown(document, { key: 'w' });
      
      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalledWith('home');
      });
    });
  });

  describe('Layout Mode Handling', () => {
    it('only handles keys on desktop layouts', async () => {
      // This test verifies that keyboard handling is layout-aware
      // The KeyboardHandler component checks isLayoutMode('desktop') internally
      render(
        <ResponsiveProvider>
          <KeyboardHandler
            onQuizAnswer={mockOnQuizAnswer}
            isQuizActive={true}
            data-testid="keyboard-handler"
          />
        </ResponsiveProvider>
      );

      fireEvent.keyDown(document, { key: '1' });
      
      // On desktop layout (mocked), this should work
      await waitFor(() => {
        expect(mockOnQuizAnswer).toHaveBeenCalledWith(0);
      });
    });
  });
});

describe('useKeyboardShortcuts Hook', () => {
  it('returns correct desktop status', () => {
    render(
      <ResponsiveProvider>
        <TestHookComponent />
      </ResponsiveProvider>
    );

    expect(screen.getByTestId('is-desktop')).toHaveTextContent('true');
    expect(screen.getByTestId('keyboard-enabled')).toHaveTextContent('true');
  });

  it('returns correct values for desktop layouts', () => {
    // Test the hook with the mocked desktop context
    render(
      <ResponsiveProvider>
        <TestHookComponent />
      </ResponsiveProvider>
    );

    expect(screen.getByTestId('is-desktop')).toHaveTextContent('true');
    expect(screen.getByTestId('keyboard-enabled')).toHaveTextContent('true');
  });

  it('respects enabled option', () => {
    render(
      <ResponsiveProvider>
        <TestHookComponent enabled={false} />
      </ResponsiveProvider>
    );

    expect(screen.getByTestId('is-desktop')).toHaveTextContent('true');
    expect(screen.getByTestId('keyboard-enabled')).toHaveTextContent('false');
  });
});