import React, { useState, useCallback } from 'react';
import { createDesktopHoverEffect, createDesktopHoverActiveEffect } from '../effects/visualEffects';

/**
 * Props for EnhancedHoverButton component
 */
export interface EnhancedHoverButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  effectIntensity?: 'subtle' | 'moderate' | 'intense';
  baseStyle?: React.CSSProperties;
  className?: string;
  'data-testid'?: string;
}

/**
 * Enhanced hover button with desktop-optimized visual effects
 * Provides smooth hover animations and visual feedback for desktop interactions
 */
export const EnhancedHoverButton: React.FC<EnhancedHoverButtonProps> = ({
  children,
  onClick,
  disabled = false,
  effectIntensity = 'moderate',
  baseStyle = {},
  className,
  'data-testid': testId,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (!disabled) {
      setIsHovered(true);
    }
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsPressed(false);
  }, []);

  const handleMouseDown = useCallback(() => {
    if (!disabled) {
      setIsPressed(true);
    }
  }, [disabled]);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick();
    }
  }, [disabled, onClick]);

  // Get base hover effect styles (desktop-only)
  const hoverEffectStyles = createDesktopHoverEffect('desktop', effectIntensity);
  const activeEffectStyles = createDesktopHoverActiveEffect('desktop', effectIntensity);

  // Combine styles based on state
  const combinedStyles: React.CSSProperties = {
    ...baseStyle,
    ...hoverEffectStyles,
    ...(isHovered && !disabled ? activeEffectStyles : {}),
    ...(isPressed && !disabled ? { transform: 'translateY(-1px) scale(1.01)' } : {}),
    ...(disabled ? { 
      opacity: 0.5, 
      cursor: 'not-allowed',
      filter: 'grayscale(0.5)',
    } : {}),
  };

  return (
    <button
      style={combinedStyles}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      disabled={disabled}
      data-testid={testId}
    >
      {children}
    </button>
  );
};

export default EnhancedHoverButton;