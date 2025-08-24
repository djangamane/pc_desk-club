import React, { useState } from 'react';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { quizQuestions } from '../data/quizQuestions';

/**
 * Example component demonstrating DesktopSidebar usage
 * Shows how to integrate the sidebar with game state and interactions
 */
const DesktopSidebarExample: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Desktop Sidebar Example (Disabled for Desktop-Only Build)</h2>
      <p>This example has been disabled as responsive components have been removed for the desktop-only build.</p>
    </div>
  );
};

export default DesktopSidebarExample;
