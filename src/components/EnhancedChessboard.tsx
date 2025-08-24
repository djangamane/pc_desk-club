import React, { useState, useCallback, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { createChessPieceInteractionEffect, animationUtils } from '../effects/visualEffects';

/**
 * Props for EnhancedChessboard component
 */
export interface EnhancedChessboardProps {
  game: Chess;
  onPieceDrop: (sourceSquare: string, targetSquare: string) => boolean;
  boardOrientation?: 'white' | 'black';
  customDarkSquareStyle?: React.CSSProperties;
  customLightSquareStyle?: React.CSSProperties;
  customBoardStyle?: React.CSSProperties;
  boardWidth?: number;
  disabled?: boolean;
  'data-testid'?: string;
}

/**
 * Enhanced chessboard with desktop-specific visual feedback
 * Provides enhanced hover effects and drag-and-drop interactions for desktop users
 */
export const EnhancedChessboard: React.FC<EnhancedChessboardProps> = ({
  game,
  onPieceDrop,
  boardOrientation = 'black',
  customDarkSquareStyle,
  customLightSquareStyle,
  customBoardStyle,
  boardWidth,
  disabled = false,
  'data-testid': testId,
}) => {
  const [hoveredSquare, setHoveredSquare] = useState<string | null>(null);
  const [draggedPiece, setDraggedPiece] = useState<string | null>(null);
  const [interactionState, setInteractionState] = useState<'idle' | 'hover' | 'dragging' | 'dropping'>('idle');
  const boardRef = useRef<HTMLDivElement>(null);

  // Always true for desktop-only version
  const isDesktop = true;

  // Enhanced square styles with desktop effects
  const getEnhancedSquareStyles = useCallback((square: string, isLight: boolean) => {
    const baseStyles = isLight ? customLightSquareStyle : customDarkSquareStyle;
    const isHovered = hoveredSquare === square;
    const hasPiece = game.get(square as any) !== null;

    let enhancedStyles: React.CSSProperties = { ...baseStyles };

    if (isDesktop && isHovered && hasPiece && !disabled) {
      enhancedStyles = {
        ...enhancedStyles,
        boxShadow: `${baseStyles?.boxShadow || ''}, 0 0 15px rgba(0, 195, 255, 0.6)`,
        transform: 'scale(1.02)',
        transition: 'all 150ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        zIndex: 10,
      };
    }

    return enhancedStyles;
  }, [hoveredSquare, game, customDarkSquareStyle, customLightSquareStyle, isDesktop, disabled]);

  // Enhanced piece interaction handlers
  const handlePieceMouseEnter = useCallback((square: string) => {
    if (disabled) return;
    
    setHoveredSquare(square);
    setInteractionState('hover');
  }, [disabled]);

  const handlePieceMouseLeave = useCallback(() => {
    if (disabled) return;
    
    setHoveredSquare(null);
    if (interactionState !== 'dragging') {
      setInteractionState('idle');
    }
  }, [disabled, interactionState]);

  const handlePieceDragStart = useCallback((_piece: string, sourceSquare: string) => {
    if (disabled) return false;
    
    setDraggedPiece(sourceSquare);
    setInteractionState('dragging');
    return true;
  }, [disabled]);

  const handlePieceDragEnd = useCallback(() => {
    if (disabled) return;
    
    setDraggedPiece(null);
    setInteractionState('idle');
  }, [disabled]);

  const handlePieceDrop = useCallback((sourceSquare: string, targetSquare: string) => {
    if (disabled) return false;
    
    setInteractionState('dropping');
    
    // Add visual feedback for successful drop
    const success = onPieceDrop(sourceSquare, targetSquare);
    
    if (success && isDesktop) {
      // Brief animation for successful move
      setTimeout(() => {
        setInteractionState('idle');
      }, 300);
    } else {
      setInteractionState('idle');
    }
    
    return success;
  }, [disabled, onPieceDrop, isDesktop]);

  // Get piece interaction styles (desktop-only)
  const pieceInteractionStyles = createChessPieceInteractionEffect('desktop', interactionState);

  // Enhanced board container styles
  const boardContainerStyles: React.CSSProperties = {
    position: 'relative',
    borderRadius: '10px',
    padding: isDesktop ? '15px' : '10px',
    background: 'linear-gradient(135deg, #081b33 0%, #0e2a4c 100%)',
    boxShadow: isDesktop 
      ? '0 0 25px rgba(0, 195, 255, 0.2), 0 0 10px rgba(0, 0, 0, 0.5) inset'
      : '0 0 15px rgba(0, 195, 255, 0.2), 0 0 5px rgba(0, 0, 0, 0.3) inset',
    border: '1px solid rgba(0, 195, 255, 0.2)',
    transition: 'all 0.3s ease',
    ...(disabled ? { opacity: 0.6, pointerEvents: 'none' } : {}),
  };

  // Enhanced board styles
  const enhancedBoardStyles: React.CSSProperties = {
    borderRadius: '8px',
    boxShadow: isDesktop 
      ? '0 0 20px rgba(0, 195, 255, 0.3)' 
      : '0 0 15px rgba(0, 195, 255, 0.2)',
    ...customBoardStyle,
    ...pieceInteractionStyles,
  };

  // Custom piece render function for enhanced effects
  const customPieces = isDesktop ? ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'].reduce((acc, piece) => {
    acc[piece] = ({ squareWidth }: { squareWidth: number }) => (
      <div
        style={{
          width: squareWidth,
          height: squareWidth,
          backgroundImage: `url(/assets/pieces/${piece}.png)`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          transition: animationUtils.prefersReducedMotion() 
            ? 'none' 
            : 'all 150ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          filter: interactionState === 'hover' && isDesktop 
            ? 'brightness(1.2) drop-shadow(0 0 8px rgba(0, 195, 255, 0.6))'
            : 'brightness(1)',
        }}
      />
    );
    return acc;
  }, {} as Record<string, React.ComponentType<{ squareWidth: number }>>) : undefined;

  return (
    <div ref={boardRef} style={boardContainerStyles} data-testid={testId}>
      <Chessboard
        id="EnhancedChessboard"
        position={game.fen()}
        onPieceDrop={handlePieceDrop}
        onPieceDragBegin={handlePieceDragStart}
        onPieceDragEnd={handlePieceDragEnd}
        boardOrientation={boardOrientation}
        customDarkSquareStyle={getEnhancedSquareStyles('a1', false) as Record<string, string>}
        customLightSquareStyle={getEnhancedSquareStyles('a1', true) as Record<string, string>}
        customBoardStyle={enhancedBoardStyles as Record<string, string | number>}
        boardWidth={boardWidth}
        customPieces={customPieces}
        arePiecesDraggable={!disabled}
        onSquareClick={isDesktop ? (square) => {
          handlePieceMouseEnter(square);
          setTimeout(() => handlePieceMouseLeave(), 200);
        } : undefined}
      />
      
      {/* Enhanced glowing border effect for desktop */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          borderRadius: '10px', 
          boxShadow: isDesktop && interactionState !== 'idle'
            ? '0 0 30px rgba(0, 195, 255, 0.4) inset'
            : '0 0 15px rgba(0, 195, 255, 0.1) inset', 
          pointerEvents: 'none', 
          zIndex: 10,
          transition: 'box-shadow 0.3s ease',
        }}
      />
      
      {/* Interaction state indicator for desktop */}
      {isDesktop && interactionState !== 'idle' && (
        <div
          style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: 'rgba(0, 195, 255, 0.8)',
            boxShadow: '0 0 10px rgba(0, 195, 255, 0.6)',
            animation: animationUtils.prefersReducedMotion() 
              ? 'none' 
              : 'desktopGlow 1s infinite ease-in-out',
            zIndex: 20,
          }}
        />
      )}
      
      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'absolute',
          bottom: '-25px',
          left: '0',
          fontSize: '10px',
          color: '#7cb3e8',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '2px 6px',
          borderRadius: '3px',
          fontFamily: 'monospace',
        }}>
          State: {interactionState} | Hover: {hoveredSquare || 'none'} | Drag: {draggedPiece || 'none'}
        </div>
      )}
    </div>
  );
};

export default EnhancedChessboard;