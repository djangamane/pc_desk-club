import React from 'react';
import { Chess } from 'chess.js';
import { useViewport } from '../hooks/useViewport';
import { getLayoutMode } from '../config/responsive';
import { calculateResponsiveChessboardSize } from '../utils/responsiveUtils';
import { EnhancedChessboard } from './EnhancedChessboard';

interface ResponsiveChessboardContainerProps {
  game: Chess;
  onPieceDrop: (sourceSquare: string, targetSquare: string) => boolean;
  boardOrientation?: 'white' | 'black';
  customDarkSquareStyle?: React.CSSProperties;
  customLightSquareStyle?: React.CSSProperties;
  customBoardStyle?: React.CSSProperties;
  maxSize?: number;
  minSize?: number;
}

/**
 * ResponsiveChessboardContainer component with dynamic sizing logic
 * Calculates chessboard size based on viewport and layout mode
 */
export const ResponsiveChessboardContainer: React.FC<ResponsiveChessboardContainerProps> = ({
  game,
  onPieceDrop,
  boardOrientation = 'black',
  customDarkSquareStyle,
  customLightSquareStyle,
  customBoardStyle,
  maxSize,
  minSize,
}) => {
  const viewportInfo = useViewport();
  const layoutMode = getLayoutMode(viewportInfo.width);
  
  // Calculate responsive chessboard size with constraints
  const finalSize = calculateResponsiveChessboardSize(
    viewportInfo.width, 
    layoutMode,
    { min: minSize, max: maxSize }
  );

  // Default square styles with futuristic theme
  const defaultDarkSquareStyle: Record<string, string> = {
    backgroundColor: '#193f6e',
    boxShadow: 'inset 0 0 3px rgba(0, 195, 255, 0.3)',
    ...(customDarkSquareStyle as Record<string, string>),
  };

  const defaultLightSquareStyle: Record<string, string> = {
    backgroundColor: '#236ab0',
    boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.2)',
    ...(customLightSquareStyle as Record<string, string>),
  };

  // Responsive container styling
  const containerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: `${finalSize}px`,
    margin: '0 auto',
    position: 'relative',
    borderRadius: '10px',
    padding: layoutMode === 'mobile' ? '10px' : '15px',
    background: 'linear-gradient(135deg, #081b33 0%, #0e2a4c 100%)',
    boxShadow: '0 0 25px rgba(0, 195, 255, 0.2), 0 0 10px rgba(0, 0, 0, 0.5) inset',
    border: '1px solid rgba(0, 195, 255, 0.2)',
    transition: 'all 0.3s ease',
  };

  // Enhanced board styling for desktop
  const boardStyle: Record<string, string | number> = {
    borderRadius: '8px',
    boxShadow: layoutMode === 'desktop' || layoutMode === 'large-desktop' 
      ? '0 0 20px rgba(0, 195, 255, 0.3)' 
      : '0 0 15px rgba(0, 195, 255, 0.2)',
    ...(customBoardStyle as Record<string, string | number>),
  };

  return (
    <div style={containerStyle} data-testid="chessboard">
      <EnhancedChessboard
        game={game}
        onPieceDrop={onPieceDrop}
        boardOrientation={boardOrientation}
        customDarkSquareStyle={defaultDarkSquareStyle}
        customLightSquareStyle={defaultLightSquareStyle}
        boardWidth={finalSize}
        customBoardStyle={boardStyle}
        data-testid="responsive-chessboard"
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
          boxShadow: layoutMode === 'desktop' || layoutMode === 'large-desktop'
            ? '0 0 20px rgba(0, 195, 255, 0.15) inset'
            : '0 0 15px rgba(0, 195, 255, 0.1) inset', 
          pointerEvents: 'none', 
          zIndex: 10,
          transition: 'box-shadow 0.3s ease',
        }}
      />
      
      {/* Debug info for development (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'absolute',
          top: '-25px',
          right: '0',
          fontSize: '10px',
          color: '#7cb3e8',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '2px 6px',
          borderRadius: '3px',
          fontFamily: 'monospace',
        }}>
          {layoutMode} | {finalSize}px | {viewportInfo.width}x{viewportInfo.height}
        </div>
      )}
    </div>
  );
};

export default ResponsiveChessboardContainer;