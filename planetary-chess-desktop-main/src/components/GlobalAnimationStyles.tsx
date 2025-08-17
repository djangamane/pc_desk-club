import React from 'react';
import { DESKTOP_KEYFRAMES } from '../effects/visualEffects';

/**
 * Global animation styles component
 * Injects CSS keyframes and animations into the document head
 */
export const GlobalAnimationStyles: React.FC = () => {
  return (
    <style>
      {DESKTOP_KEYFRAMES}
    </style>
  );
};

export default GlobalAnimationStyles;