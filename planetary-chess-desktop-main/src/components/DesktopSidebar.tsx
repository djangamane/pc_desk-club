import React from 'react';
import { QuizQuestion } from '../data/quizQuestions';
import { useResponsive } from '../contexts/ResponsiveContext';
import { AIThinkingIndicator } from './AIThinkingIndicator';
import { ResponsiveQuiz } from './ResponsiveQuiz';
import { 
  ResponsiveButton, 
  ResponsivePanel, 
  ResponsiveText,
  ResponsiveFlex 
} from './ResponsiveStyledComponents';
import { 
  FUTURISTIC_THEME,
  getResponsiveSpacing 
} from '../styles/responsiveStyles';

/**
 * Props for DesktopSidebar component
 */
export interface DesktopSidebarProps {
  /** Current quiz question */
  currentQuestion: QuizQuestion;
  /** Whether AI is currently thinking */
  isThinking: boolean;
  /** Current AI taunt/message */
  currentTaunt: string;
  /** Whether quiz is visible */
  isQuizVisible: boolean;
  /** Whether game is over */
  isGameOver: boolean;
  /** Current question number */
  questionNumber: number;
  /** Total number of questions */
  totalQuestions: number;
  /** Callback for quiz answer selection */
  onQuizAnswer: (answer: string) => void;
  /** Callback for navigation */
  onNavigate: (path: string) => void;
  /** Optional layout mode override for testing */
  layoutMode?: 'mobile' | 'tablet' | 'desktop' | 'large-desktop';
}

/**
 * Desktop sidebar component for AI interaction, quiz, and controls
 * Displays in a vertical layout optimized for desktop screens
 */
export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentQuestion,
  isThinking,
  currentTaunt,
  isQuizVisible,
  isGameOver,
  questionNumber,
  totalQuestions,
  onQuizAnswer,
  onNavigate,
  layoutMode: layoutModeProp,
}) => {
  const responsive = useResponsive();
  const { calculateDynamicSize } = responsive;
  const layoutMode = layoutModeProp || responsive.layoutMode;

  // Don't render sidebar on mobile/tablet
  if (layoutMode === 'mobile' || layoutMode === 'tablet') {
    return null;
  }

  const sidebarWidth = calculateDynamicSize(350);
  const avatarSize = calculateDynamicSize(100);

  /**
   * Stewie avatar component with enhanced thinking animation
   */
  const StewieAvatar = () => (
    <AIThinkingIndicator
      isThinking={isThinking}
      size={avatarSize}
      intensity="medium"
      showProgressBar={true}
      data-testid="stewie-avatar"
    >
      <img
        src="/assets/stewie.png"
        alt="AI Stewie"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'drop-shadow(0 0 8px rgba(0, 195, 255, 0.7))',
        }}
      />
    </AIThinkingIndicator>
  );

  /**
   * AI taunt/message display component
   */
  const TauntDisplay = () => (
    <ResponsivePanel
      variant="overlay"
      withGlow={true}
      style={{
        marginBottom: `${getResponsiveSpacing('lg', layoutMode)}px`,
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-10px',
          left: '30px',
          width: '0',
          height: '0',
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderBottom: `10px solid ${FUTURISTIC_THEME.colors.background.overlay}`,
        }}
      />
      <ResponsiveText
        variant="body"
        size="sm"
        as="p"
        style={{
          margin: 0,
          fontStyle: 'italic',
        }}
      >
        {isThinking ? (
          <span>
            Processing neural pathways
            <span style={{ display: 'inline-block', animation: 'responsiveBlink 1.2s infinite' }}>...</span>
          </span>
        ) : (
          currentTaunt
        )}
      </ResponsiveText>
    </ResponsivePanel>
  );

  /**
   * Enhanced quiz display using ResponsiveQuiz component
   */
  const QuizDisplay = () => {
    return (
      <ResponsiveQuiz
        currentQuestion={currentQuestion}
        isVisible={isQuizVisible}
        isGameOver={isGameOver}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        onQuizAnswer={onQuizAnswer}
        keyboardEnabled={true}
        layoutMode={layoutMode}
        data-testid="desktop-sidebar-quiz"
      />
    );
  };

  /**
   * Game statistics and controls component
   */
  const GameControls = () => (
    <ResponsivePanel
      variant="overlay"
      withGlow={false}
    >
      <ResponsiveText
        variant="caption"
        size="xs"
        style={{
          marginBottom: `${getResponsiveSpacing('base', layoutMode)}px`,
          textAlign: 'center',
        }}
      >
        <span style={{ color: FUTURISTIC_THEME.colors.text.secondary }}>QUANTUM INQUIRY</span>{' '}
        <span style={{ color: FUTURISTIC_THEME.colors.secondary }}>{questionNumber}</span>{' '}
        <span style={{ color: FUTURISTIC_THEME.colors.text.secondary }}>OF</span>{' '}
        <span style={{ color: FUTURISTIC_THEME.colors.secondary }}>{totalQuestions}</span>
      </ResponsiveText>

      <ResponsiveButton
        onClick={() => onNavigate('/')}
        variant="secondary"
        size="base"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
        data-testid="return-to-base-button"
      >
        ← Return to Base
      </ResponsiveButton>
    </ResponsivePanel>
  );

  return (
    <div
      data-testid="desktop-sidebar"
      style={{
        width: `${sidebarWidth}px`,
        height: '100vh',
        background: FUTURISTIC_THEME.gradients.background,
        borderLeft: `1px solid ${FUTURISTIC_THEME.colors.border}`,
        boxShadow: '-5px 0 15px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        padding: `${getResponsiveSpacing('lg', layoutMode)}px`,
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      {/* Header Section */}
      <ResponsiveFlex
        direction={{ mobile: 'column', tablet: 'column', desktop: 'column', 'large-desktop': 'column' }}
        align="center"
        justify="center"
        gap="lg"
        style={{ textAlign: 'center' }}
      >
        <ResponsiveText
          variant="heading"
          size="xl"
          as="h1"
          style={{
            margin: 0,
            textShadow: FUTURISTIC_THEME.effects.glow.subtle,
          }}
        >
          PLANETARY CHESS
        </ResponsiveText>
        <StewieAvatar />
      </ResponsiveFlex>

      {/* AI Taunt Section */}
      <TauntDisplay />

      {/* Quiz Section */}
      <div style={{ flex: 1 }}>
        <QuizDisplay />
      </div>

      {/* Controls Section */}
      <GameControls />
    </div>
  );
};

export default DesktopSidebar;