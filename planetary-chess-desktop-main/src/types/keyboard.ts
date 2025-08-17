/**
 * Keyboard event handler types for desktop input handling
 */

/**
 * Quiz answer selection callback type
 */
export type QuizAnswerHandler = (answerIndex: number) => void;

/**
 * Navigation action types
 */
export type NavigationAction = 'back' | 'home';

/**
 * Navigation callback type
 */
export type NavigationHandler = (action: NavigationAction) => void;

/**
 * Game control action types
 */
export type GameControlAction = 'pause' | 'reset';

/**
 * Game control callback type
 */
export type GameControlHandler = (action: GameControlAction) => void;

/**
 * Keyboard event context for game state
 */
export interface KeyboardEventContext {
  /** Whether quiz is currently active */
  isQuizActive: boolean;
  /** Whether game is over */
  isGameOver: boolean;
  /** Whether AI is currently thinking */
  isThinking: boolean;
  /** Current layout mode */
  layoutMode: 'mobile' | 'tablet' | 'desktop' | 'large-desktop';
}

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  /** Keys that trigger this shortcut */
  keys: string[];
  /** Description of what this shortcut does */
  description: string;
  /** Whether this shortcut is enabled */
  enabled: boolean;
  /** Conditions under which this shortcut is available */
  conditions?: {
    quizActive?: boolean;
    gameOver?: boolean;
    layoutMode?: ('mobile' | 'tablet' | 'desktop' | 'large-desktop')[];
  };
}

/**
 * Complete keyboard shortcuts configuration
 */
export interface KeyboardShortcutsConfig {
  /** Quiz answer shortcuts (1-4) */
  quizAnswers: KeyboardShortcut[];
  /** Navigation shortcuts */
  navigation: {
    back: KeyboardShortcut;
    home: KeyboardShortcut;
    confirm: KeyboardShortcut;
  };
  /** Game control shortcuts */
  gameControls: {
    pause: KeyboardShortcut;
    reset: KeyboardShortcut;
  };
}

/**
 * Keyboard handler options
 */
export interface KeyboardHandlerOptions {
  /** Whether to prevent default browser behavior */
  preventDefault: boolean;
  /** Whether to stop event propagation */
  stopPropagation: boolean;
  /** Debounce delay in milliseconds */
  debounceDelay: number;
  /** Whether to handle events during capture phase */
  useCapture: boolean;
}