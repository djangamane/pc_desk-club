import React, { useEffect, useCallback, useRef } from 'react';

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcuts {
  /** Quiz answer keys (1-4) */
  quizAnswers: string[];
  /** Navigation keys */
  navigation: {
    back: string[];
    home: string[];
    confirm: string[];
  };
  /** Game control keys */
  gameControls: {
    pause: string[];
    reset: string[];
  };
}

/**
 * Props for KeyboardHandler component
 */
export interface KeyboardHandlerProps {
  /** Callback for quiz answer selection (0-3 index) */
  onQuizAnswer?: (answerIndex: number) => void;
  /** Callback for navigation actions */
  onNavigate?: (action: 'back' | 'home') => void;
  /** Callback for game control actions */
  onGameControl?: (action: 'pause' | 'reset') => void;
  /** Whether quiz is currently active and should accept answer keys */
  isQuizActive?: boolean;
  /** Whether game is over (disables most shortcuts) */
  isGameOver?: boolean;
  /** Whether keyboard handling is enabled */
  enabled?: boolean;
  /** Custom keyboard shortcuts configuration */
  shortcuts?: Partial<KeyboardShortcuts>;
  /** Whether to prevent default browser behavior for handled keys */
  preventDefault?: boolean;
  /** Whether to stop event propagation for handled keys */
  stopPropagation?: boolean;
  /** Test ID for testing purposes */
  'data-testid'?: string;
}

/**
 * Default keyboard shortcuts configuration
 */
const DEFAULT_SHORTCUTS: KeyboardShortcuts = {
  quizAnswers: ['1', '2', '3', '4'],
  navigation: {
    back: ['Escape', 'Backspace'],
    home: ['Home', 'h', 'H'],
    confirm: [' ', 'Enter'], // Space and Enter
  },
  gameControls: {
    pause: ['p', 'P', 'Pause'],
    reset: ['r', 'R'],
  },
};

/**
 * KeyboardHandler component for desktop keyboard shortcuts
 * Manages keyboard interactions for quiz answers, navigation, and game controls
 * Only active on desktop layouts to avoid conflicts with mobile interactions
 */
export const KeyboardHandler: React.FC<KeyboardHandlerProps> = ({
  onQuizAnswer,
  onNavigate,
  onGameControl,
  isQuizActive = false,
  isGameOver = false,
  enabled = true,
  shortcuts: customShortcuts,
  preventDefault = true,
  stopPropagation = true,
  'data-testid': testId,
}) => {
  const activeKeysRef = useRef<Set<string>>(new Set());
  const lastKeyTimeRef = useRef<number>(0);
  
  // Merge custom shortcuts with defaults
  const shortcuts: KeyboardShortcuts = {
    quizAnswers: customShortcuts?.quizAnswers || DEFAULT_SHORTCUTS.quizAnswers,
    navigation: {
      ...DEFAULT_SHORTCUTS.navigation,
      ...customShortcuts?.navigation,
    },
    gameControls: {
      ...DEFAULT_SHORTCUTS.gameControls,
      ...customShortcuts?.gameControls,
    },
  };

  /**
   * Handle keyboard events with debouncing and conflict prevention
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't handle if disabled
    if (!enabled) {
      return;
    }

    // Don't handle if typing in an input field
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const key = event.key;
    const now = Date.now();
    
    // Debounce rapid key presses (prevent accidental double-presses)
    if (now - lastKeyTimeRef.current < 100 && activeKeysRef.current.has(key)) {
      return;
    }
    
    lastKeyTimeRef.current = now;
    activeKeysRef.current.add(key);

    let handled = false;

    // Handle quiz answer keys (1-4) - only when quiz is active and game not over
    if (isQuizActive && !isGameOver && onQuizAnswer) {
      const answerIndex = shortcuts.quizAnswers.indexOf(key);
      if (answerIndex !== -1) {
        onQuizAnswer(answerIndex);
        handled = true;
      }
    }

    // Handle navigation keys - available unless game is over
    if (!isGameOver && onNavigate) {
      if (shortcuts.navigation.back.includes(key)) {
        onNavigate('back');
        handled = true;
      } else if (shortcuts.navigation.home.includes(key)) {
        onNavigate('home');
        handled = true;
      }
    }

    // Handle game control keys - available unless game is over
    if (!isGameOver && onGameControl) {
      if (shortcuts.gameControls.pause.includes(key)) {
        onGameControl('pause');
        handled = true;
      } else if (shortcuts.gameControls.reset.includes(key)) {
        onGameControl('reset');
        handled = true;
      }
    }

    // Prevent default behavior and stop propagation if key was handled
    if (handled) {
      if (preventDefault) {
        event.preventDefault();
      }
      if (stopPropagation) {
        event.stopPropagation();
      }
    }
  }, [
    enabled,
    isQuizActive,
    isGameOver,
    onQuizAnswer,
    onNavigate,
    onGameControl,
    shortcuts,
    preventDefault,
    stopPropagation,
  ]);

  /**
   * Handle key up events to clean up active keys tracking
   */
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    activeKeysRef.current.delete(event.key);
  }, []);

  /**
   * Set up keyboard event listeners with proper cleanup
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Add event listeners to document to capture all keyboard events
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('keyup', handleKeyUp, { capture: true });

    // Cleanup function to remove event listeners
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('keyup', handleKeyUp, { capture: true });
      // Clear active keys on cleanup
      activeKeysRef.current.clear();
    };
  }, [handleKeyDown, handleKeyUp, enabled]);

  /**
   * Clear active keys when component becomes disabled or quiz state changes
   */
  useEffect(() => {
    if (!enabled || isGameOver) {
      activeKeysRef.current.clear();
    }
  }, [enabled, isGameOver, isQuizActive]);

  // This component doesn't render anything visible
  return (
    <div 
      data-testid={testId}
      style={{ display: 'none' }}
      aria-hidden="true"
    />
  );
};

export default KeyboardHandler;