import React from 'react';
import { createAIThinkingAnimation, animationUtils } from '../effects/visualEffects';

/**
 * Props for AIThinkingIndicator component
 */
export interface AIThinkingIndicatorProps {
  isThinking: boolean;
  size?: number;
  intensity?: 'low' | 'medium' | 'high';
  showProgressBar?: boolean;
  children?: React.ReactNode;
  'data-testid'?: string;
}

/**
 * AI thinking indicator with desktop-optimized animations
 * Provides enhanced visual feedback for AI processing states
 */
export const AIThinkingIndicator: React.FC<AIThinkingIndicatorProps> = ({
  isThinking,
  size = 100,
  intensity = 'medium', // eslint-disable-line @typescript-eslint/no-unused-vars
  showProgressBar = true,
  children,
  'data-testid': testId,
}) => {
  // Desktop-only sizing - no responsive calculation needed
  const finalSize = size * 1.5; // Desktop scaling factor
  const thinkingStyles = createAIThinkingAnimation('desktop', isThinking);
  
  // Desktop-only - always enhanced animations
  const isDesktop = true;
  
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: `${finalSize}px`,
    height: `${finalSize}px`,
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid rgba(0, 195, 255, 0.8)',
    background: 'radial-gradient(circle at center, #0c1b30 0%, #050c17 90%)',
    ...thinkingStyles,
  };

  const progressBarStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: '8px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60px',
    height: '4px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '2px',
    overflow: 'hidden',
    zIndex: 3,
    opacity: isThinking ? 1 : 0,
    transition: 'opacity 0.3s ease',
  };

  const progressFillStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '30%',
    background: 'linear-gradient(90deg, #054487, #00a2ff)',
    borderRadius: '2px',
    animation: isThinking && !animationUtils.prefersReducedMotion() 
      ? 'thinkingPulse 1.2s infinite' 
      : 'none',
  };

  const overlayStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, transparent 0%, rgba(5, 12, 23, 0.3) 90%)',
    borderRadius: '50%',
    zIndex: 2,
  };

  // Desktop-specific pulsing ring effect
  const pulsingRingStyles: React.CSSProperties = isDesktop && isThinking ? {
    position: 'absolute',
    top: '-10px',
    left: '-10px',
    right: '-10px',
    bottom: '-10px',
    borderRadius: '50%',
    border: '2px solid rgba(0, 195, 255, 0.3)',
    animation: animationUtils.prefersReducedMotion() 
      ? 'none' 
      : 'desktopHoverPulse 2s infinite ease-in-out',
    zIndex: 1,
  } : {};

  // Neural network pattern for desktop
  const neuralPatternStyles: React.CSSProperties = isDesktop && isThinking ? {
    position: 'absolute',
    top: '20%',
    left: '20%',
    right: '20%',
    bottom: '20%',
    background: `
      radial-gradient(circle at 30% 30%, rgba(0, 195, 255, 0.1) 2px, transparent 2px),
      radial-gradient(circle at 70% 30%, rgba(0, 195, 255, 0.1) 2px, transparent 2px),
      radial-gradient(circle at 50% 70%, rgba(0, 195, 255, 0.1) 2px, transparent 2px)
    `,
    backgroundSize: '20px 20px',
    borderRadius: '50%',
    opacity: isThinking ? 0.6 : 0,
    transition: 'opacity 0.5s ease',
    animation: animationUtils.prefersReducedMotion() 
      ? 'none' 
      : 'blink 1.5s infinite ease-in-out',
    zIndex: 2,
  } : {};

  return (
    <div style={containerStyles} data-testid={testId}>
      {/* Pulsing ring for desktop */}
      {isDesktop && <div style={pulsingRingStyles} />}
      
      {/* Neural network pattern for desktop */}
      {isDesktop && <div style={neuralPatternStyles} />}
      
      {/* Main content */}
      {children}
      
      {/* Overlay */}
      <div style={overlayStyles} />
      
      {/* Progress bar */}
      {showProgressBar && (
        <div style={progressBarStyles}>
          <div style={progressFillStyles} />
        </div>
      )}
      
      {/* Thinking text indicator for desktop */}
      {isDesktop && isThinking && (
        <div
          style={{
            position: 'absolute',
            bottom: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#7cb3e8',
            fontSize: '12px',
            fontFamily: '"Orbitron", sans-serif',
            letterSpacing: '1px',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            animation: animationUtils.prefersReducedMotion() 
              ? 'none' 
              : 'blink 1.2s infinite',
          }}
        >
          PROCESSING...
        </div>
      )}
    </div>
  );
};

export default AIThinkingIndicator;