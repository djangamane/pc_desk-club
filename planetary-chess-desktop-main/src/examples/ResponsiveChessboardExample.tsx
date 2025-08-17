import React, { useState } from 'react';
import { Chess } from 'chess.js';
import { ResponsiveChessboardContainer } from '../components/ResponsiveChessboardContainer';
import { useViewport } from '../hooks/useViewport';
import { getLayoutMode } from '../config/responsive';

/**
 * Example component demonstrating the ResponsiveChessboardContainer
 * Shows how the chessboard adapts to different screen sizes
 */
export const ResponsiveChessboardExample: React.FC = () => {
  const [game] = useState(new Chess());
  const viewportInfo = useViewport();
  const layoutMode = getLayoutMode(viewportInfo.width);

  const handlePieceDrop = (sourceSquare: string, targetSquare: string): boolean => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q', // Always promote to queen for simplicity
      });
      return move !== null;
    } catch (error) {
      return false; // Invalid move
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #061224 0%, #0a1c34 100%)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
    }}>
      <h1 style={{
        color: '#e8f4ff',
        fontFamily: '"Orbitron", sans-serif',
        textAlign: 'center',
        margin: 0,
      }}>
        Responsive Chessboard Example
      </h1>
      
      {/* Viewport Info Display */}
      <div style={{
        backgroundColor: 'rgba(0, 30, 60, 0.7)',
        borderRadius: '8px',
        padding: '15px',
        border: '1px solid rgba(0, 195, 255, 0.3)',
        color: '#e8f4ff',
        fontFamily: 'monospace',
        fontSize: '14px',
      }}>
        <div>Viewport: {viewportInfo.width} x {viewportInfo.height}</div>
        <div>Layout Mode: {layoutMode}</div>
        <div>
          Breakpoints: Mobile ({viewportInfo.isMobile ? '✓' : '✗'}) | 
          Tablet ({viewportInfo.isTablet ? '✓' : '✗'}) | 
          Desktop ({viewportInfo.isDesktop ? '✓' : '✗'}) | 
          Large Desktop ({viewportInfo.isLargeDesktop ? '✓' : '✗'})
        </div>
      </div>

      {/* Responsive Chessboard */}
      <ResponsiveChessboardContainer
        game={game}
        onPieceDrop={handlePieceDrop}
        boardOrientation="white"
      />

      {/* Layout Instructions */}
      <div style={{
        backgroundColor: 'rgba(0, 30, 60, 0.7)',
        borderRadius: '8px',
        padding: '15px',
        border: '1px solid rgba(0, 195, 255, 0.3)',
        color: '#e8f4ff',
        maxWidth: '600px',
        textAlign: 'center',
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#7cb3e8' }}>
          Responsive Behavior
        </h3>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>Mobile (&lt; 768px):</strong> Compact size with minimal padding
        </p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>Tablet (768px - 1024px):</strong> Medium size with moderate padding
        </p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>Desktop (1024px - 1440px):</strong> Large size with enhanced effects
        </p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>Large Desktop (&gt; 1440px):</strong> Maximum size with premium effects
        </p>
        <p style={{ margin: '10px 0 0 0', fontSize: '12px', fontStyle: 'italic' }}>
          Resize your browser window to see the responsive behavior in action!
        </p>
      </div>

      {/* Custom Styling Examples */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: layoutMode === 'mobile' ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        width: '100%',
        maxWidth: '1200px',
      }}>
        {/* Example with custom constraints */}
        <div style={{
          backgroundColor: 'rgba(0, 30, 60, 0.7)',
          borderRadius: '8px',
          padding: '15px',
          border: '1px solid rgba(0, 195, 255, 0.3)',
        }}>
          <h4 style={{ color: '#7cb3e8', margin: '0 0 10px 0' }}>
            With Size Constraints
          </h4>
          <ResponsiveChessboardContainer
            game={game}
            onPieceDrop={handlePieceDrop}
            minSize={200}
            maxSize={300}
            boardOrientation="white"
          />
        </div>

        {/* Example with custom styling */}
        <div style={{
          backgroundColor: 'rgba(0, 30, 60, 0.7)',
          borderRadius: '8px',
          padding: '15px',
          border: '1px solid rgba(0, 195, 255, 0.3)',
        }}>
          <h4 style={{ color: '#7cb3e8', margin: '0 0 10px 0' }}>
            With Custom Styling
          </h4>
          <ResponsiveChessboardContainer
            game={game}
            onPieceDrop={handlePieceDrop}
            customDarkSquareStyle={{ backgroundColor: '#4a0e4e' }}
            customLightSquareStyle={{ backgroundColor: '#8e44ad' }}
            customBoardStyle={{ borderRadius: '15px' }}
            boardOrientation="white"
          />
        </div>
      </div>
    </div>
  );
};

export default ResponsiveChessboardExample;