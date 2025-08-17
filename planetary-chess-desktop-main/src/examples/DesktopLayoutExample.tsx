import React from 'react';
import { ResponsiveProvider } from '../contexts/ResponsiveContext';
import { ResponsiveGameContainer } from '../components/ResponsiveContainer';
import { ResponsiveChessboardContainer } from '../components/ResponsiveChessboardContainer';
import { Chess } from 'chess.js';

/**
 * Example component demonstrating desktop horizontal layout integration
 * This shows how the Game component can be refactored to use the new layout system
 */
export const DesktopLayoutExample: React.FC = () => {
  const [game] = React.useState(new Chess());

  // Mock chessboard content
  const chessboardContent = (
    <ResponsiveChessboardContainer
      game={game}
      onPieceDrop={() => false}
    />
  );

  // Mock sidebar content (AI interaction, quiz, controls)
  const sidebarContent = (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1rem',
      height: '100%'
    }}>
      {/* AI Avatar Section */}
      <div style={{
        backgroundColor: 'rgba(0, 30, 60, 0.7)',
        borderRadius: '8px',
        padding: '1rem',
        border: '1px solid rgba(0, 195, 255, 0.3)',
        boxShadow: '0 0 10px rgba(0, 195, 255, 0.2)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 195, 255, 0.2)',
          margin: '0 auto 0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#e8f4ff',
          fontSize: '24px'
        }}>
          🤖
        </div>
        <p style={{ 
          color: '#e8f4ff', 
          margin: 0, 
          fontSize: '14px',
          fontStyle: 'italic'
        }}>
          "Your intellectual genealogy is as shallow as a colonial water basin."
        </p>
      </div>

      {/* Quiz Section */}
      <div style={{
        backgroundColor: 'rgba(0, 20, 40, 0.8)',
        borderRadius: '8px',
        padding: '1rem',
        border: '1px solid rgba(0, 195, 255, 0.2)',
        boxShadow: '0 0 10px rgba(0, 195, 255, 0.1)',
        flex: 1
      }}>
        <h3 style={{
          color: '#e8f4ff',
          marginTop: 0,
          marginBottom: '1rem',
          fontSize: '16px',
          fontFamily: '"Orbitron", sans-serif'
        }}>
          What is the most powerful piece in chess?
        </h3>
        
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {['Queen', 'King', 'Rook', 'Bishop'].map((option, index) => (
            <button
              key={option}
              style={{
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #054487 0%, #0A67B3 100%)',
                color: '#e8f4ff',
                borderRadius: '6px',
                fontSize: '14px',
                textAlign: 'left',
                cursor: 'pointer',
                border: '1px solid rgba(0, 195, 255, 0.3)',
                boxShadow: '0 0 5px rgba(0, 195, 255, 0.1)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'rgba(0, 195, 255, 0.2)',
                fontSize: '12px',
                fontWeight: 'bold',
                border: '1px solid rgba(0, 195, 255, 0.4)'
              }}>
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Game Controls */}
      <div style={{
        backgroundColor: 'rgba(0, 30, 60, 0.7)',
        borderRadius: '8px',
        padding: '1rem',
        border: '1px solid rgba(0, 195, 255, 0.3)',
        boxShadow: '0 0 10px rgba(0, 195, 255, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <span style={{ color: '#7cb3e8', fontSize: '12px' }}>QUANTUM INQUIRY</span>
          <span style={{ color: '#4aa8ff', fontSize: '12px' }}>1 OF 50</span>
        </div>
        
        <button style={{
          width: '100%',
          padding: '0.5rem',
          background: 'linear-gradient(135deg, #193366 0%, #2b4f8a 100%)',
          color: '#e8f4ff',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          border: '1px solid rgba(0, 195, 255, 0.3)',
          boxShadow: '0 0 5px rgba(0, 195, 255, 0.2)',
          transition: 'all 0.2s ease',
          fontFamily: '"Orbitron", sans-serif',
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>
          ← Return to Base
        </button>
      </div>
    </div>
  );

  // Header content
  const headerContent = (
    <div style={{
      textAlign: 'center',
      padding: '1rem',
      background: 'linear-gradient(135deg, #061224 0%, #0a1c34 100%)',
      borderBottom: '1px solid rgba(0, 195, 255, 0.2)'
    }}>
      <h1 style={{
        margin: 0,
        fontSize: '28px',
        fontWeight: '800',
        background: 'linear-gradient(180deg, #ffffff 0%, #7cbdff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 0 10px rgba(0, 195, 255, 0.3)',
        fontFamily: '"Orbitron", sans-serif',
        letterSpacing: '2px'
      }}>
        PLANETARY CHESS
      </h1>
    </div>
  );

  return (
    <ResponsiveProvider>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #061224 0%, #0a1c34 100%)',
        color: '#e8f4ff'
      }}>
        <ResponsiveGameContainer
          header={headerContent}
          chessboard={chessboardContent}
          sidebar={sidebarContent}
          strategy="auto"
        />
      </div>
    </ResponsiveProvider>
  );
};

export default DesktopLayoutExample;