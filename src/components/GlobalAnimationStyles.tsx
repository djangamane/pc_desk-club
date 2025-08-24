import React from 'react';
import { DESKTOP_ANIMATIONS } from '../effects/visualEffects';

/**
 * Global animation styles component
 * Injects CSS keyframes and animations into the document head
 */
export const GlobalAnimationStyles: React.FC = () => {
  return (
    <style>
      {`
        @keyframes desktopThinkingGlow {
          0%, 100% { box-shadow: 0 0 25px rgba(0, 195, 255, 0.8); }
          50% { box-shadow: 0 0 35px rgba(0, 195, 255, 1.0); }
        }
        
        @keyframes desktopGlow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1.0; }
        }
        
        @keyframes chessPieceDrop {
          0% { transform: scale(1.1) translateY(-5px); }
          50% { transform: scale(0.95) translateY(2px); }
          100% { transform: scale(1) translateY(0); }
        }
      `}
    </style>
  );
};

export default GlobalAnimationStyles;