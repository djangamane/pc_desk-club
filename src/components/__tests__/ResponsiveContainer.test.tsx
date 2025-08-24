import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResponsiveContainer } from '../ResponsiveContainer';
import { ResponsiveProvider } from '../../contexts/ResponsiveContext';

// Mock the useViewport hook
vi.mock('../../hooks/useViewport', () => ({
  useViewport: vi.fn(),
}));

const mockUseViewport = vi.mocked(await import('../../hooks/useViewport')).useViewport;

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; width?: number }> = ({ 
  children, 
  width = 1200 
}) => {
  mockUseViewport.mockReturnValue({
    width,
    height: 800,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024 && width < 1440,
    isLargeDesktop: width >= 1440,
  });

  return (
    <ResponsiveProvider>
      {children}
    </ResponsiveProvider>
  );
};

describe('ResponsiveContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <TestWrapper>
        <ResponsiveContainer>
          <div data-testid="container-content">Container Content</div>
        </ResponsiveContainer>
      </TestWrapper>
    );

    expect(screen.getByTestId('container-content')).toBeInTheDocument();
    expect(screen.getByText('Container Content')).toBeInTheDocument();
  });

  it('applies correct CSS classes for desktop mode', () => {
    render(
      <TestWrapper width={1200}>
        <ResponsiveContainer className="custom-class">
          <div>Content</div>
        </ResponsiveContainer>
      </TestWrapper>
    );

    const container = screen.getByText('Content').parentElement;
    expect(container).toHaveClass('responsive-container');
    expect(container).toHaveClass('strategy-grid');
    expect(container).toHaveClass('layout-mode-desktop');
    expect(container).toHaveClass('desktop-mode');
    expect(container).toHaveClass('custom-class');
    expect(container).toHaveAttribute('data-strategy', 'grid');
  });
});