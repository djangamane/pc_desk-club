import React, { useState, useEffect, useCallback } from 'react';
import { QuizQuestion } from '../data/quizQuestions';
import { useResponsive } from '../contexts/ResponsiveContext';
import { 
  ResponsiveButton, 
  ResponsivePanel, 
  ResponsiveText,
  ResponsiveFlex 
} from './ResponsiveStyledComponents';
import { 
  FUTURISTIC_THEME,
  getResponsiveFontSize,
  getResponsiveSpacing 
} from '../styles/responsiveStyles';

/**
 * Animation states for quiz transitions
 */
type AnimationState = 'entering' | 'visible' | 'exiting' | 'hidden';

/**
 * Props for ResponsiveQuiz component
 */
export interface ResponsiveQuizProps {
  /** Current quiz question */
  currentQuestion: QuizQuestion;
  /** Whether quiz is visible */
  isVisible: boolean;
  /** Whether game is over */
  isGameOver?: boolean;
  /** Current question number */
  questionNumber: number;
  /** Total number of questions */
  totalQuestions: number;
  /** Callback for quiz answer selection */
  onQuizAnswer: (answer: string) => void;
  /** Whether keyboard navigation is enabled */
  keyboardEnabled?: boolean;
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Layout mode override for testing */
  layoutMode?: 'mobile' | 'tablet' | 'desktop' | 'large-desktop';
  /** Test ID for testing */
  'data-testid'?: string;
}
 
/**

 * ResponsiveQuiz component that adapts to different screen sizes and provides
 * enhanced interactions for desktop users while maintaining mobile compatibility
 */
export const ResponsiveQuiz: React.FC<ResponsiveQuizProps> = ({
  currentQuestion,
  isVisible,
  isGameOver = false,
  questionNumber,
  totalQuestions,
  onQuizAnswer,
  keyboardEnabled = true,
  animationDuration = 300,
  layoutMode: layoutModeProp,
  'data-testid': testId = 'responsive-quiz',
}) => {
  const responsive = useResponsive();
  const { calculateDynamicSize } = responsive;
  const layoutMode = layoutModeProp || responsive.layoutMode;
  
  // Animation state management
  const [animationState, setAnimationState] = useState<AnimationState>('hidden');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);

  // Handle visibility changes with animations
  useEffect(() => {
    if (isVisible && !isGameOver) {
      setAnimationState('entering');
      const timer = setTimeout(() => {
        setAnimationState('visible');
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setAnimationState('exiting');
      const timer = setTimeout(() => {
        setAnimationState('hidden');
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isGameOver, animationDuration]);

  // Reset selected answer when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswering(false);
  }, [currentQuestion.id]);

  /**
   * Handle answer selection with enhanced feedback
   */
  const handleAnswerSelection = useCallback((answer: string, index: number) => {
    if (isAnswering || !isVisible || isGameOver) return;

    setSelectedAnswer(answer);
    setIsAnswering(true);

    // Add visual feedback delay for desktop users
    const feedbackDelay = layoutMode === 'desktop' || layoutMode === 'large-desktop' ? 150 : 50;
    
    setTimeout(() => {
      onQuizAnswer(answer);
      setIsAnswering(false);
    }, feedbackDelay);
  }, [isAnswering, isVisible, isGameOver, layoutMode, onQuizAnswer]);

  /**
   * Handle keyboard navigation for quiz answers
   */
  useEffect(() => {
    if (!keyboardEnabled || !isVisible || isGameOver || isAnswering) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;
      const numKey = parseInt(key);
      
      // Handle number keys 1-4 for answer selection
      if (numKey >= 1 && numKey <= 4 && numKey <= currentQuestion.options.length) {
        event.preventDefault();
        const answerIndex = numKey - 1;
        handleAnswerSelection(currentQuestion.options[answerIndex], answerIndex);
      }
      
      // Handle letter keys A-D for answer selection
      const letterKeys = ['a', 'b', 'c', 'd'];
      const letterIndex = letterKeys.indexOf(key.toLowerCase());
      if (letterIndex !== -1 && letterIndex < currentQuestion.options.length) {
        event.preventDefault();
        handleAnswerSelection(currentQuestion.options[letterIndex], letterIndex);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [keyboardEnabled, isVisible, isGameOver, isAnswering, currentQuestion, handleAnswerSelection]);

  // Don't render if hidden
  if (animationState === 'hidden') {
    return null;
  }

  // Responsive sizing calculations
  const isDesktop = layoutMode === 'desktop' || layoutMode === 'large-desktop';
  const isMobile = layoutMode === 'mobile';
  const buttonSize = isDesktop ? 'lg' : isMobile ? 'base' : 'base';
  const panelPadding = getResponsiveSpacing(isDesktop ? 'xl' : 'lg', layoutMode);
  const buttonSpacing = getResponsiveSpacing(isDesktop ? 'base' : 'sm', layoutMode);

  // Animation styles
  const getAnimationStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      transition: `all ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    };

    switch (animationState) {
      case 'entering':
        return {
          ...baseStyles,
          opacity: 0,
          transform: isDesktop ? 'translateX(20px) scale(0.95)' : 'translateY(20px) scale(0.95)',
        };
      case 'visible':
        return {
          ...baseStyles,
          opacity: 1,
          transform: 'translateX(0) translateY(0) scale(1)',
        };
      case 'exiting':
        return {
          ...baseStyles,
          opacity: 0,
          transform: isDesktop ? 'translateX(-20px) scale(0.95)' : 'translateY(-20px) scale(0.95)',
        };
      default:
        return baseStyles;
    }
  };

  /**
   * Enhanced answer button component with desktop-specific interactions
   */
  const AnswerButton: React.FC<{ option: string; index: number }> = ({ option, index }) => {
    const isSelected = selectedAnswer === option;
    const isHovered = false; // Will be managed by CSS hover states
    
    const buttonStyles: React.CSSProperties = {
      width: '100%',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      cursor: isAnswering ? 'not-allowed' : 'pointer',
      opacity: isAnswering && !isSelected ? 0.6 : 1,
      transform: isSelected && isAnswering ? 'scale(1.02)' : 'scale(1)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      // Enhanced desktop hover effects
      ...(isDesktop && {
        '&:hover': {
          transform: 'translateX(4px) scale(1.01)',
          boxShadow: `0 8px 25px rgba(0, 195, 255, 0.3), inset 0 0 20px rgba(0, 195, 255, 0.1)`,
        },
      }),
    };

    const letterBadgeStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: isDesktop ? '32px' : '24px',
      height: isDesktop ? '32px' : '24px',
      borderRadius: '50%',
      background: isSelected 
        ? FUTURISTIC_THEME.gradients.button 
        : 'rgba(0, 195, 255, 0.2)',
      marginRight: isDesktop ? '16px' : '12px',
      fontSize: `${getResponsiveFontSize(isDesktop ? 'base' : 'sm', layoutMode)}px`,
      fontWeight: 'bold',
      color: FUTURISTIC_THEME.colors.text.primary,
      border: `1px solid ${isSelected ? FUTURISTIC_THEME.colors.primary : FUTURISTIC_THEME.colors.border}`,
      fontFamily: '"Orbitron", sans-serif',
      flexShrink: 0,
      transition: 'all 0.2s ease',
      boxShadow: isSelected ? FUTURISTIC_THEME.effects.glow.moderate : 'none',
    };

    return (
      <ResponsiveButton
        onClick={() => handleAnswerSelection(option, index)}
        variant="primary"
        size={buttonSize}
        style={buttonStyles}
        disabled={isAnswering}
        data-testid={`quiz-answer-${index}`}
        className="quiz-answer-button"
      >
        <span style={letterBadgeStyles}>
          {String.fromCharCode(65 + index)}
        </span>
        <span style={{ flex: 1, fontSize: `${getResponsiveFontSize('base', layoutMode)}px` }}>
          {option}
        </span>
        {isSelected && isAnswering && (
          <div style={{
            position: 'absolute',
            right: '16px',
            width: '20px',
            height: '20px',
            border: `2px solid ${FUTURISTIC_THEME.colors.primary}`,
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        )}
      </ResponsiveButton>
    );
  };

  return (
    <div
      style={getAnimationStyles()}
      data-testid={testId}
      className="responsive-quiz"
    >
      <ResponsivePanel
        variant="secondary"
        withGlow={true}
        style={{
          marginBottom: `${getResponsiveSpacing('lg', layoutMode)}px`,
          padding: `${panelPadding}px`,
          position: 'relative',
          // Enhanced desktop styling
          ...(isDesktop && {
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            background: `linear-gradient(135deg, ${FUTURISTIC_THEME.colors.background.secondary}dd, ${FUTURISTIC_THEME.colors.background.overlay}dd)`,
          }),
        }}
      >
        {/* Question progress indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: `${getResponsiveSpacing('base', layoutMode)}px`,
        }}>
          <ResponsiveText
            variant="caption"
            size="xs"
            style={{
              color: FUTURISTIC_THEME.colors.text.secondary,
              fontFamily: '"Orbitron", sans-serif',
            }}
          >
            QUANTUM INQUIRY {questionNumber} OF {totalQuestions}
          </ResponsiveText>
          
          {/* Progress bar */}
          <div style={{
            width: isDesktop ? '120px' : '80px',
            height: '4px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${(questionNumber / totalQuestions) * 100}%`,
              height: '100%',
              background: FUTURISTIC_THEME.gradients.button,
              borderRadius: '2px',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Question text */}
        <ResponsiveText
          variant="heading"
          size={isDesktop ? 'xl' : 'lg'}
          as="h3"
          style={{
            marginTop: 0,
            marginBottom: `${getResponsiveSpacing('lg', layoutMode)}px`,
            textAlign: 'left',
            lineHeight: isDesktop ? 1.4 : 1.3,
            color: FUTURISTIC_THEME.colors.text.primary,
          }}
        >
          {currentQuestion.question}
        </ResponsiveText>

        {/* Answer options */}
        <ResponsiveFlex
          direction={{ mobile: 'column', tablet: 'column', desktop: 'column', 'large-desktop': 'column' }}
          gap={isDesktop ? 'base' : 'sm'}
        >
          {currentQuestion.options.map((option: string, index: number) => (
            <AnswerButton key={`${currentQuestion.id}-${index}`} option={option} index={index} />
          ))}
        </ResponsiveFlex>

        {/* Keyboard hint for desktop users */}
        {isDesktop && keyboardEnabled && (
          <ResponsiveText
            variant="caption"
            size="xs"
            style={{
              marginTop: `${getResponsiveSpacing('base', layoutMode)}px`,
              textAlign: 'center',
              color: FUTURISTIC_THEME.colors.text.secondary,
              fontStyle: 'italic',
              opacity: 0.8,
            }}
          >
            Use keys 1-4 or A-D to select answers
          </ResponsiveText>
        )}
      </ResponsivePanel>

      {/* Custom CSS for enhanced hover effects */}
      <style>{`
        .quiz-answer-button:hover {
          transform: ${isDesktop ? 'translateX(4px) scale(1.01)' : 'scale(1.02)'} !important;
          box-shadow: 0 8px 25px rgba(0, 195, 255, 0.3), inset 0 0 20px rgba(0, 195, 255, 0.1) !important;
        }
        
        .quiz-answer-button:active {
          transform: scale(0.98) !important;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .responsive-quiz {
          --animation-duration: ${animationDuration}ms;
        }
      `}</style>
    </div>
  );
};

export default ResponsiveQuiz;