import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DesktopLayout, LeftPanel, RightPanel, ResponsiveLayoutWrapper } from '../DesktopLayout';
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

describe('DesktopLayout Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('LeftPanel', () => {
    it('renders children correctly', () => {
      render(
        <TestWrapper>
          <LeftPanel>
            <div data-testid="left-content">Left Panel Content</div>
          </LeftPanel>
        </TestWrapper>
      );

      expect(screen.getByTestId('left-content')).toBeInTheDocument();
      expect(screen.getByText('Left Panel Content')).toBeInTheDocument();
    });

    it('applies correct CSS classes and data attributes', () => {
      render(
        <TestWrapper>
          <LeftPanel className="custom-class">
            <div>Content</div>
          </LeftPanel>
        </TestWrapper>
      );

      const panel = screen.getByText('Content').parentElement;
      expect(panel).toHaveClass('desktop-layout-left-panel');
      expect(panel).toHaveClass('layout-mode-desktop');
      expect(panel).toHaveClass('custom-class');
      expect(panel).toHaveAttribute('data-panel', 'left');
      expect(panel).toHaveAttribute('data-layout-mode', 'desktop');
    });

    it('applies responsive styles based on layout mode', () => {
      render(
        <TestWrapper width={1200}>
          <LeftPanel>
            <div>Content</div>
          </LeftPanel>
        </TestWrapper>
      );

      const panel = screen.getByText('Content').parentElement;
      expect(panel).toHaveStyle({
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      });
    });
  });

  describe('RightPanel', () => {
    it('renders children correctly', () => {
      render(
        <TestWrapper>
          <RightPanel>
            <div data-testid="right-content">Right Panel Content</div>
          </RightPanel>
        </TestWrapper>
      );

      expect(screen.getByTestId('right-content')).toBeInTheDocument();
      expect(screen.getByText('Right Panel Content')).toBeInTheDocument();
    });

    it('applies correct CSS classes and data attributes', () => {
      render(
        <TestWrapper>
          <RightPanel className="custom-class">
            <div>Content</div>
          </RightPanel>
        </TestWrapper>
      );

      const panel = screen.getByText('Content').parentElement;
      expect(panel).toHaveClass('desktop-layout-right-panel');
      expect(panel).toHaveClass('layout-mode-desktop');
      expect(panel).toHaveClass('custom-class');
      expect(panel).toHaveAttribute('data-panel', 'right');
      expect(panel).toHaveAttribute('data-layout-mode', 'desktop');
    });

    it('applies sidebar-specific styles', () => {
      render(
        <TestWrapper>
          <RightPanel>
            <div>Content</div>
          </RightPanel>
        </TestWrapper>
      );

      const panel = screen.getByText('Content').parentElement;
      expect(panel).toHaveStyle({
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      });
    });
  });

  describe('DesktopLayout', () => {
    it('renders children in desktop mode', () => {
      render(
        <TestWrapper width={1200}>
          <DesktopLayout>
            <div data-testid="desktop-content">Desktop Layout Content</div>
          </DesktopLayout>
        </TestWrapper>
      );

      expect(screen.getByTestId('desktop-content')).toBeInTheDocument();
    });

    it('uses CSS Grid for desktop layout', () => {
      render(
        <TestWrapper width={1200}>
          <DesktopLayout>
            <div>Content</div>
          </DesktopLayout>
        </TestWrapper>
      );

      const container = screen.getByText('Content').parentElement;
      expect(container).toHaveClass('desktop-grid-layout');
      expect(container).toHaveAttribute('data-is-desktop', 'true');
      expect(container).toHaveStyle({
        display: 'grid',
      });
    });

    it('uses Flexbox for mobile layout', () => {
      render(
        <TestWrapper width={600}>
          <DesktopLayout>
            <div>Content</div>
          </DesktopLayout>
        </TestWrapper>
      );

      const container = screen.getByText('Content').parentElement;
      expect(container).toHaveClass('mobile-flex-layout');
      expect(container).toHaveAttribute('data-is-desktop', 'false');
      expect(container).toHaveStyle({
        display: 'flex',
        flexDirection: 'column',
      });
    });

    it('applies correct grid template columns for desktop', () => {
      render(
        <TestWrapper width={1200}>
          <DesktopLayout>
            <div>Content</div>
          </DesktopLayout>
        </TestWrapper>
      );

      const container = screen.getByText('Content').parentElement;
      expect(container).toHaveStyle({
        gridTemplateColumns: '65% 35%',
        gridTemplateRows: '1fr',
      });
    });

    it('applies different styles for large desktop', () => {
      render(
        <TestWrapper width={1500}>
          <DesktopLayout>
            <div>Content</div>
          </DesktopLayout>
        </TestWrapper>
      );

      const container = screen.getByText('Content').parentElement;
      expect(container).toHaveClass('layout-mode-large-desktop');
      expect(container).toHaveStyle({
        gridTemplateColumns: '70% 30%',
      });
    });
  });

  describe('ResponsiveLayoutWrapper', () => {
    const leftContent = <div data-testid="left-content">Chessboard</div>;
    const rightContent = <div data-testid="right-content">Sidebar</div>;
    const mobileContent = <div data-testid="mobile-content">Mobile Layout</div>;

    it('renders desktop layout for desktop viewport', () => {
      render(
        <TestWrapper width={1200}>
          <ResponsiveLayoutWrapper
            leftPanelContent={leftContent}
            rightPanelContent={rightContent}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('left-content')).toBeInTheDocument();
      expect(screen.getByTestId('right-content')).toBeInTheDocument();
      
      const leftPanel = screen.getByTestId('left-content').closest('[data-panel="left"]');
      const rightPanel = screen.getByTestId('right-content').closest('[data-panel="right"]');
      
      expect(leftPanel).toBeInTheDocument();
      expect(rightPanel).toBeInTheDocument();
    });

    it('renders mobile layout for mobile viewport', () => {
      render(
        <TestWrapper width={600}>
          <ResponsiveLayoutWrapper
            leftPanelContent={leftContent}
            rightPanelContent={rightContent}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('left-content')).toBeInTheDocument();
      expect(screen.getByTestId('right-content')).toBeInTheDocument();
      
      const wrapper = screen.getByTestId('left-content').closest('.mobile-layout-wrapper');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveAttribute('data-layout-mode', 'mobile');
    });

    it('uses custom mobile content when provided', () => {
      render(
        <TestWrapper width={600}>
          <ResponsiveLayoutWrapper
            leftPanelContent={leftContent}
            rightPanelContent={rightContent}
            mobileContent={mobileContent}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('mobile-content')).toBeInTheDocument();
      expect(screen.queryByTestId('left-content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('right-content')).not.toBeInTheDocument();
    });

    it('switches layout when viewport changes', () => {
      const { rerender } = render(
        <TestWrapper width={600}>
          <ResponsiveLayoutWrapper
            leftPanelContent={leftContent}
            rightPanelContent={rightContent}
          />
        </TestWrapper>
      );

      // Initially mobile
      expect(screen.getByTestId('left-content').closest('.mobile-layout-wrapper')).toBeInTheDocument();

      // Switch to desktop
      rerender(
        <TestWrapper width={1200}>
          <ResponsiveLayoutWrapper
            leftPanelContent={leftContent}
            rightPanelContent={rightContent}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('left-content').closest('[data-panel="left"]')).toBeInTheDocument();
      expect(screen.queryByTestId('left-content').closest('.mobile-layout-wrapper')).not.toBeInTheDocument();
    });
  });

  describe('Layout Transitions', () => {
    it('applies transition styles to all layout components', () => {
      render(
        <TestWrapper>
          <DesktopLayout>
            <LeftPanel>
              <div>Left</div>
            </LeftPanel>
            <RightPanel>
              <div>Right</div>
            </RightPanel>
          </DesktopLayout>
        </TestWrapper>
      );

      const container = screen.getByText('Left').closest('.desktop-layout-container');
      const leftPanel = screen.getByText('Left').parentElement;
      const rightPanel = screen.getByText('Right').parentElement;

      expect(container).toHaveStyle('transition: all 0.3s ease-in-out');
      expect(leftPanel).toHaveStyle('transition: all 0.3s ease-in-out');
      expect(rightPanel).toHaveStyle('transition: all 0.3s ease-in-out');
    });
  });
});