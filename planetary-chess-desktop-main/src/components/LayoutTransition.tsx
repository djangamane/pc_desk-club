import React, { useEffect, useState, useRef } from 'react';
import { LayoutMode } from '../types/responsive';
import { createLayoutTransitionEffect, animationUtils } from '../effects/visualEffects';

/**
 * Props for LayoutTransition component
 */
export interface LayoutTransitionProps {
  children: React.ReactNode;
  currentLayoutMode: LayoutMode;
  previousLayoutMode?: LayoutMode;
  transitionDuration?: number;
  onTransitionComplete?: () => void;
  'data-testid'?: string;
}

/**
 * Layout transition component with smooth animations
 * Handles transitions between different responsive layout modes
 */
export const LayoutTransition: React.FC<LayoutTransitionProps> = ({
  children,
  currentLayoutMode,
  previousLayoutMode,
  transitionDuration = 300,
  onTransitionComplete,
  'data-testid': testId,
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayMode, setDisplayMode] = useState(currentLayoutMode);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only transition if layout mode actually changed
    if (previousLayoutMode && previousLayoutMode !== currentLayoutMode) {
      setIsTransitioning(true);
      
      // Start transition
      const actualDuration = animationUtils.getAnimationDuration(transitionDuration);
      
      if (actualDuration > 0) {
        // Delay layout mode change to allow for smooth transition
        timeoutRef.current = setTimeout(() => {
          setDisplayMode(currentLayoutMode);
          
          // Complete transition after animation
          timeoutRef.current = setTimeout(() => {
            setIsTransitioning(false);
            onTransitionComplete?.();
          }, actualDuration);
        }, actualDuration / 2);
      } else {
        // No animation - immediate change
        setDisplayMode(currentLayoutMode);
        setIsTransitioning(false);
        onTransitionComplete?.();
      }
    } else {
      // No transition needed
      setDisplayMode(currentLayoutMode);
      setIsTransitioning(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentLayoutMode, previousLayoutMode, transitionDuration, onTransitionComplete]);

  // Get transition styles
  const transitionStyles = previousLayoutMode 
    ? createLayoutTransitionEffect(previousLayoutMode, currentLayoutMode)
    : {};

  const containerStyles: React.CSSProperties = {
    ...transitionStyles,
    opacity: isTransitioning ? 0.8 : 1,
    transform: isTransitioning ? 'scale(0.98)' : 'scale(1)',
    filter: isTransitioning ? 'blur(1px)' : 'blur(0px)',
    pointerEvents: isTransitioning ? 'none' : 'auto',
  };

  // Add fade animation for major layout changes
  const isMajorTransition = previousLayoutMode && (
    (previousLayoutMode === 'mobile' && currentLayoutMode === 'desktop') ||
    (previousLayoutMode === 'desktop' && currentLayoutMode === 'mobile') ||
    (previousLayoutMode === 'tablet' && currentLayoutMode === 'desktop') ||
    (previousLayoutMode === 'desktop' && currentLayoutMode === 'tablet')
  );

  if (isMajorTransition && isTransitioning) {
    containerStyles.animation = animationUtils.prefersReducedMotion() 
      ? 'none' 
      : `layoutTransitionFade ${transitionDuration}ms ease-in-out`;
  }

  return (
    <div 
      ref={containerRef}
      style={containerStyles} 
      data-testid={testId}
      data-layout-mode={displayMode}
      data-transitioning={isTransitioning}
    >
      {children}
    </div>
  );
};

/**
 * Hook for managing layout transitions
 */
export const useLayoutTransition = (currentLayoutMode: LayoutMode) => {
  const [previousLayoutMode, setPreviousLayoutMode] = useState<LayoutMode>();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setPreviousLayoutMode(prev => {
      if (prev && prev !== currentLayoutMode) {
        setIsTransitioning(true);
        return prev;
      }
      return currentLayoutMode;
    });
  }, [currentLayoutMode]);

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
    setPreviousLayoutMode(currentLayoutMode);
  };

  return {
    previousLayoutMode,
    isTransitioning,
    handleTransitionComplete,
  };
};

export default LayoutTransition;