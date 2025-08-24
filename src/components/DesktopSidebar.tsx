import React from 'react';
import { QuizQuestion } from '../data/quizQuestions';
import { AIThinkingIndicator } from './AIThinkingIndicator';

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
}) => {
  const avatarSize = 100;

  /**
   * Stewie avatar component with enhanced thinking animation
   * Represents the embodiment of systemic racism
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
        alt="Stewie - The Embodiment of Systemic Racism"
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
    <div
      style={{
        marginBottom: '24px',
        position: 'relative',
        background: 'rgba(0, 20, 40, 0.7)',
        backdropFilter: 'blur(5px)',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 0 20px rgba(0, 195, 255, 0.3)',
        border: '1px solid rgba(0, 195, 255, 0.2)',
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
          borderBottom: '10px solid rgba(0, 20, 40, 0.7)',
        }}
      />
      <p
        style={{
          margin: 0,
          fontStyle: 'italic',
          color: '#e8f4ff',
          fontSize: '14px',
          lineHeight: '1.4',
        }}
      >
        {isThinking ? (
          <span>
            Stewie (Systemic Racism) is calculating...
            <span style={{ display: 'inline-block', animation: 'blink 1.2s infinite' }}>...</span>
          </span>
        ) : (
          currentTaunt
        )}
      </p>
    </div>
  );

  /**
   * Quiz display component
   */
  const QuizDisplay = () => {
    if (!isQuizVisible || isGameOver) {
      return null;
    }

    return (
      <div
        style={{
          background: 'rgba(0, 20, 40, 0.7)',
          backdropFilter: 'blur(5px)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 0 20px rgba(0, 195, 255, 0.3)',
          border: '1px solid rgba(0, 195, 255, 0.2)',
          marginBottom: '24px',
        }}
        data-testid="desktop-sidebar-quiz"
      >
        <h3
          style={{
            color: '#7cb3e8',
            fontSize: '16px',
            fontFamily: '"Orbitron", sans-serif',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          {currentQuestion.question}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onQuizAnswer(option)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #193366 0%, #2b4f8a 100%)',
                color: '#e8f4ff',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                border: '1px solid rgba(0, 195, 255, 0.3)',
                boxShadow: '0 0 10px rgba(0, 195, 255, 0.2)',
                transition: 'all 0.2s ease',
                fontFamily: '"Orbitron", sans-serif',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 195, 255, 0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 195, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {String.fromCharCode(65 + index)}. {option}
            </button>
          ))}
        </div>
        
        <p style={{
          marginTop: '16px',
          fontSize: '12px',
          color: '#7cb3e8',
          fontStyle: 'italic',
          textAlign: 'center'
        }}>
          Correct answers weaken Stewie's grip on systemic oppression!
          Incorrect answers strengthen his power with grandmaster moves.
        </p>
      </div>
    );
  };

  /**
   * Game statistics and controls component
   */
  const GameControls = () => (
    <div
      style={{
        background: 'rgba(0, 20, 40, 0.7)',
        backdropFilter: 'blur(5px)',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 0 15px rgba(0, 195, 255, 0.2)',
        border: '1px solid rgba(0, 195, 255, 0.1)',
      }}
    >
      <p
        style={{
          marginBottom: '16px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#7cb3e8',
        }}
      >
        <span style={{ color: '#7cb3e8' }}>KNOWLEDGE WEAPONS DEPLOYED</span>{' '}
        <span style={{ color: '#4aa8ff' }}>{questionNumber}</span>{' '}
        <span style={{ color: '#7cb3e8' }}>OF</span>{' '}
        <span style={{ color: '#4aa8ff' }}>{totalQuestions}</span>
      </p>

      <button
        onClick={() => onNavigate('/')}
        style={{
          width: '100%',
          padding: '12px',
          background: 'linear-gradient(135deg, #193366 0%, #2b4f8a 100%)',
          color: '#e8f4ff',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          border: '1px solid rgba(0, 195, 255, 0.3)',
          boxShadow: '0 0 10px rgba(0, 195, 255, 0.2)',
          transition: 'all 0.2s ease',
          fontFamily: '"Orbitron", sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
        data-testid="return-to-base-button"
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 195, 255, 0.4)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 195, 255, 0.2)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        ← Return to Base
      </button>
    </div>
  );

  return (
    <div
      data-testid="desktop-sidebar"
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #061224 0%, #0a1c34 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '24px',
        }}
      >
        <h1
          style={{
            margin: '0 0 20px 0',
            fontSize: '24px',
            fontWeight: '800',
            background: 'linear-gradient(180deg, #ffffff 0%, #7cbdff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 15px rgba(0, 195, 255, 0.7)',
            fontFamily: '"Orbitron", sans-serif',
            letterSpacing: '2px',
          }}
        >
          PLANETARY CHESS
        </h1>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <p style={{ 
            margin: '0', 
            fontSize: '12px', 
            color: '#7cb3e8',
            fontStyle: 'italic'
          }}>
            Stewie - The Embodiment of Systemic Racism
          </p>
        </div>
        <StewieAvatar />
      </div>

      {/* AI Taunt Section */}
      <TauntDisplay />

      {/* Quiz Section */}
      <div style={{ flex: 1 }}>
        <QuizDisplay />
      </div>

      {/* Controls Section */}
      <GameControls />
      
      <style>
        {`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

export default DesktopSidebar;