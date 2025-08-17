import React from 'react';
import { LayoutManager, LayoutSection } from '../components/LayoutManager';
import { useResponsive } from '../contexts/ResponsiveContext';

/**
 * Example component demonstrating responsive layout usage
 */
const ResponsiveLayoutExample: React.FC = () => {
  return (
    <LayoutManager 
      onLayoutChange={(mode) => console.log('Layout changed to:', mode)}
      className="example-layout"
    >
      <LayoutSection section="header">
        <ExampleHeader />
      </LayoutSection>
      
      <LayoutSection section="chessboard">
        <ExampleChessboard />
      </LayoutSection>
      
      <LayoutSection section="sidebar">
        <ExampleSidebar />
      </LayoutSection>
      
      <LayoutSection section="footer">
        <ExampleFooter />
      </LayoutSection>
    </LayoutManager>
  );
};

/**
 * Example header component
 */
const ExampleHeader: React.FC = () => {
  const { layoutMode, viewportInfo } = useResponsive();
  
  return (
    <div style={{ 
      padding: '1rem', 
      backgroundColor: '#1a1a2e', 
      color: '#eee',
      textAlign: 'center',
      borderRadius: '8px',
      marginBottom: '1rem'
    }}>
      <h1>Planetary Chess - {layoutMode.charAt(0).toUpperCase() + layoutMode.slice(1)} Mode</h1>
      <p>Viewport: {viewportInfo.width} × {viewportInfo.height}</p>
    </div>
  );
};

/**
 * Example chessboard component
 */
const ExampleChessboard: React.FC = () => {
  const { chessboardSize, layoutConfig, calculateDynamicSize } = useResponsive();
  
  return (
    <div style={{
      width: chessboardSize,
      height: chessboardSize,
      backgroundColor: '#16213e',
      border: '2px solid #0f3460',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#eee',
      fontSize: calculateDynamicSize(16),
      margin: '0 auto'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div>🏁 Chessboard Placeholder</div>
        <div style={{ fontSize: calculateDynamicSize(12), marginTop: '8px' }}>
          Size: {chessboardSize}px
        </div>
        <div style={{ fontSize: calculateDynamicSize(10), marginTop: '4px' }}>
          Layout: {layoutConfig.direction}
        </div>
      </div>
    </div>
  );
};

/**
 * Example sidebar component
 */
const ExampleSidebar: React.FC = () => {
  const { layoutMode, calculateDynamicSize, isLayoutMode } = useResponsive();
  
  const sidebarStyle: React.CSSProperties = {
    backgroundColor: '#0f3460',
    borderRadius: '8px',
    padding: calculateDynamicSize(16),
    color: '#eee',
    minHeight: isLayoutMode('mobile') || isLayoutMode('tablet') ? 'auto' : '400px',
  };
  
  return (
    <div style={sidebarStyle}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: calculateDynamicSize(18) }}>
        Game Controls
      </h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ fontSize: calculateDynamicSize(14), margin: '0 0 0.5rem 0' }}>
          AI Status
        </h4>
        <div style={{ 
          padding: calculateDynamicSize(8), 
          backgroundColor: '#1a1a2e', 
          borderRadius: '4px',
          fontSize: calculateDynamicSize(12)
        }}>
          🤖 AI is thinking...
        </div>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ fontSize: calculateDynamicSize(14), margin: '0 0 0.5rem 0' }}>
          Quiz Question
        </h4>
        <div style={{ 
          padding: calculateDynamicSize(8), 
          backgroundColor: '#1a1a2e', 
          borderRadius: '4px',
          fontSize: calculateDynamicSize(12)
        }}>
          What's the best opening move?
        </div>
        <div style={{ marginTop: calculateDynamicSize(8) }}>
          {['1. e4', '1. d4', '1. Nf3', '1. c4'].map((move, index) => (
            <button
              key={index}
              style={{
                display: 'block',
                width: '100%',
                margin: `${calculateDynamicSize(4)}px 0`,
                padding: calculateDynamicSize(8),
                backgroundColor: '#16213e',
                color: '#eee',
                border: '1px solid #0f3460',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: calculateDynamicSize(11)
              }}
            >
              {move}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <h4 style={{ fontSize: calculateDynamicSize(14), margin: '0 0 0.5rem 0' }}>
          Layout Info
        </h4>
        <div style={{ 
          fontSize: calculateDynamicSize(10), 
          color: '#aaa' 
        }}>
          Current mode: {layoutMode}
        </div>
      </div>
    </div>
  );
};

/**
 * Example footer component
 */
const ExampleFooter: React.FC = () => {
  const { calculateDynamicSize, layoutMode } = useResponsive();
  
  return (
    <div style={{
      padding: calculateDynamicSize(12),
      backgroundColor: '#1a1a2e',
      color: '#aaa',
      textAlign: 'center',
      borderRadius: '8px',
      marginTop: '1rem',
      fontSize: calculateDynamicSize(12)
    }}>
      <p style={{ margin: 0 }}>
        Responsive Layout System - Currently in {layoutMode} mode
      </p>
    </div>
  );
};

export default ResponsiveLayoutExample;