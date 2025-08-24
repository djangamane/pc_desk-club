import React, { useEffect, useState } from 'react';
import Game from '../components/Game';

export const GamePage: React.FC = () => {
  return (
    <div style={{ 
      height: '100%', 
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #061224 0%, #0a1c34 100%)',
    }}>
      <Game />
    </div>
  );
};

export default GamePage;
