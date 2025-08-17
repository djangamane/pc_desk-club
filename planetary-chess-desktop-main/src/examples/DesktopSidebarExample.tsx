import React, { useState } from 'react';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { ResponsiveProvider } from '../contexts/ResponsiveContext';
import { quizQuestions } from '../data/quizQuestions';

/**
 * Example component demonstrating DesktopSidebar usage
 * Shows how to integrate the sidebar with game state and interactions
 */
export const DesktopSidebarExample: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [currentTaunt, setCurrentTaunt] = useState("Welcome to Planetary Chess, you intellectual peasant.");
  const [isQuizVisible, setIsQuizVisible] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentQuestion = quizQuestions[currentQuestionIndex];

  /**
   * Handle quiz answer selection
   */
  const handleQuizAnswer = (selectedAnswer: string) => {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    // Update taunt based on answer
    setCurrentTaunt(isCorrect ? currentQuestion.tauntCorrect : currentQuestion.tauntIncorrect);
    
    // Hide quiz and show thinking state
    setIsQuizVisible(false);
    setIsThinking(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      setIsThinking(false);
      
      // Move to next question or end game
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsQuizVisible(true);
        setCurrentTaunt("Let's see if you can handle the next challenge...");
      } else {
        setIsGameOver(true);
        setCurrentTaunt("Game complete! Your intellectual journey ends here.");
      }
    }, 2000);
  };

  /**
   * Handle navigation
   */
  const handleNavigate = (path: string) => {
    console.log(`Navigating to: ${path}`);
    // In a real app, this would use React Router
    alert(`Would navigate to: ${path}`);
  };

  /**
   * Reset the example to initial state
   */
  const resetExample = () => {
    setCurrentQuestionIndex(0);
    setIsThinking(false);
    setCurrentTaunt("Welcome to Planetary Chess, you intellectual peasant.");
    setIsQuizVisible(true);
    setIsGameOver(false);
  };

  return (
    <ResponsiveProvider>
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #061224 0%, #0a1c34 100%)',
        }}
      >
        {/* Main content area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            color: '#e8f4ff',
          }}
        >
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              background: 'linear-gradient(180deg, #ffffff 0%, #7cbdff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 10px rgba(0, 195, 255, 0.3)',
              fontFamily: '"Orbitron", sans-serif',
              letterSpacing: '2px',
              marginBottom: '2rem',
            }}
          >
            Desktop Sidebar Example
          </h1>

          <div
            style={{
              backgroundColor: 'rgba(0, 30, 60, 0.8)',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '600px',
              border: '1px solid rgba(0, 195, 255, 0.3)',
              boxShadow: '0 0 20px rgba(0, 195, 255, 0.2)',
              textAlign: 'center',
            }}
          >
            <h2 style={{ marginTop: 0, color: '#7cbdff' }}>
              Chessboard Area
            </h2>
            <p style={{ lineHeight: '1.6', marginBottom: '2rem' }}>
              This is where the chessboard would be displayed in the actual game.
              The sidebar on the right contains the AI interaction, quiz questions,
              and game controls.
            </p>

            <div
              style={{
                width: '300px',
                height: '300px',
                margin: '0 auto 2rem',
                background: 'linear-gradient(45deg, #193f6e 25%, #236ab0 25%, #236ab0 50%, #193f6e 50%, #193f6e 75%, #236ab0 75%)',
                backgroundSize: '40px 40px',
                border: '2px solid rgba(0, 195, 255, 0.4)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e8f4ff',
                fontSize: '1.2rem',
                fontWeight: 'bold',
              }}
            >
              Chessboard Placeholder
            </div>

            <button
              onClick={resetExample}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #193366 0%, #2b4f8a 100%)',
                color: '#e8f4ff',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                border: '1px solid rgba(0, 195, 255, 0.3)',
                boxShadow: '0 0 10px rgba(0, 195, 255, 0.2)',
                transition: 'all 0.2s ease',
                fontFamily: '"Orbitron", sans-serif',
                letterSpacing: '1px',
                textTransform: 'uppercase',
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
              Reset Example
            </button>
          </div>

          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: 'rgba(0, 15, 30, 0.7)',
              borderRadius: '8px',
              border: '1px solid rgba(0, 195, 255, 0.2)',
              maxWidth: '600px',
            }}
          >
            <h3 style={{ marginTop: 0, color: '#7cbdff', fontSize: '1.2rem' }}>
              Example Features:
            </h3>
            <ul style={{ textAlign: 'left', lineHeight: '1.6' }}>
              <li>Interactive quiz questions with AI taunts</li>
              <li>Thinking animation when AI is processing</li>
              <li>Responsive sizing based on screen size</li>
              <li>Smooth hover effects and transitions</li>
              <li>Question counter and navigation controls</li>
              <li>Proper accessibility with keyboard support</li>
            </ul>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <DesktopSidebar
          currentQuestion={currentQuestion}
          isThinking={isThinking}
          currentTaunt={currentTaunt}
          isQuizVisible={isQuizVisible}
          isGameOver={isGameOver}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={quizQuestions.length}
          onQuizAnswer={handleQuizAnswer}
          onNavigate={handleNavigate}
        />
      </div>
    </ResponsiveProvider>
  );
};

export default DesktopSidebarExample;