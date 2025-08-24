import React from 'react';
import { Chess } from 'chess.js';
import { EnhancedChessboard } from './EnhancedChessboard';

interface DesktopChessboardProps {
  game: Chess;
  onPieceDrop: (sourceSquare: string, targetSquare: string) => boolean;
  boardOrientation?: 'white' | 'black';
  customDarkSquareStyle?: React.CSSProperties;
  customLightSquareStyle?: React.CSSProperties;
  customBoardStyle?: React.CSSProperties;
}

/**
 * DesktopChessboard component optimized for desktop experience
 * Provides enhanced chessboard with visual effects for desktop users
 * The player represents the Black side in the metaphorical battle against systemic racism
 */
export const DesktopChessboard: React.FC<DesktopChessboardProps> = ({
  game,
  onPieceDrop,
  boardOrientation = 'black',
  customDarkSquareStyle,
  customLightSquareStyle,
  customBoardStyle,
}) => {
  // Fixed size for desktop (can be adjusted as needed)
  const boardSize = 480;

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

  // Container styling for desktop
  const containerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: `${boardSize}px`,
    margin: '0 auto',
    position: 'relative',
    borderRadius: '10px',
    padding: '15px',
    background: 'linear-gradient(135deg, #081b33 0%, #0e2a4c 100%)',
    boxShadow: '0 0 25px rgba(0, 195, 255, 0.2), 0 0 10px rgba(0, 0, 0, 0.5) inset',
    border: '1px solid rgba(0, 195, 255, 0.2)',
    transition: 'all 0.3s ease',
  };

  // Board styling for desktop
  const boardStyle: Record<string, string | number> = {
    borderRadius: '8px',
    boxShadow: '0 0 20px rgba(0, 195, 255, 0.3)',
    ...(customBoardStyle as Record<string, string | number>),
  };

  return (
    <div style={containerStyle} data-testid="desktop-chessboard">
      {/* Player identification */}
      <div style={{
        textAlign: 'center',
        marginBottom: '10px',
        fontSize: '14px',
        color: '#7cb3e8',
        fontStyle: 'italic'
      }}>
        You are playing as Black - Resisting Systemic Racism
      </div>
      
      <EnhancedChessboard
        game={game}
        onPieceDrop={onPieceDrop}
        boardOrientation={boardOrientation}
        customDarkSquareStyle={defaultDarkSquareStyle}
        customLightSquareStyle={defaultLightSquareStyle}
        boardWidth={boardSize}
        customBoardStyle={boardStyle}
        data-testid="enhanced-chessboard"
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
          boxShadow: '0 0 20px rgba(0, 195, 255, 0.15) inset',
          pointerEvents: 'none', 
          zIndex: 10,
          transition: 'box-shadow 0.3s ease',
        }}
      />
      
      {/* Revolutionary message */}
      <div style={{
        textAlign: 'center',
        marginTop: '10px',
        fontSize: '12px',
        color: '#7cb3e8',
        fontStyle: 'italic'
      }}>
        Answer knowledge questions correctly to weaken Stewie's grip on systemic oppression
      </div>
    </div>
  );
};

export default DesktopChessboard;