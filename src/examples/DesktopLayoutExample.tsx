import React from 'react';

/**
 * Example component demonstrating desktop horizontal layout integration
 * This shows how the Game component can be refactored to use the new layout system
 */
const DesktopLayoutExample: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Desktop Layout Example (Disabled for Desktop-Only Build)</h2>
      <p>This example has been disabled as responsive components have been removed for the desktop-only build.</p>
    </div>
  );
};

export default DesktopLayoutExample;
