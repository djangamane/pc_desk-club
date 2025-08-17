import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResponsiveProvider } from '../../contexts/ResponsiveContext';
import { ResponsiveStyleProvider } from '../../components/ResponsiveStyleProvider';
import { ResponsiveButton } from '../../components/ResponsiveStyledComponents';

/**
 * Integration test for the responsive styling system
 * Tests that all components work together properly
 */
describe('Responsive Styling Integration', () => {
  it('should render responsive components with proper styling', () => {
    render(
      <ResponsiveProvider>
        <ResponsiveStyleProvider>
          <ResponsiveButton data-testid="test-button">
            Test Button
          </ResponsiveButton>
        </ResponsiveStyleProvider>
      </ResponsiveProvider>
    );

    const button = screen.getByTestId('test-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Test Button');
  });

  it('should inject global styles', () => {
    render(
      <ResponsiveProvider>
        <ResponsiveStyleProvider>
          <div>Test Content</div>
        </ResponsiveStyleProvider>
      </ResponsiveProvider>
    );

    const styleElement = document.getElementById('responsive-global-styles');
    expect(styleElement).toBeInTheDocument();
  });

  it('should set CSS custom properties', () => {
    render(
      <ResponsiveProvider>
        <ResponsiveStyleProvider>
          <div>Test Content</div>
        </ResponsiveStyleProvider>
      </ResponsiveProvider>
    );

    const root = document.documentElement;
    const layoutMode = root.style.getPropertyValue('--layout-mode');
    expect(layoutMode).toBeTruthy();
  });
});