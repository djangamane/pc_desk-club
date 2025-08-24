import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResponsiveProvider } from '../../contexts/ResponsiveContext';
import { ResponsiveGameContainer } from '../ResponsiveContainer';
import { DesktopLayout, LeftPanel, RightPanel } from '../DesktopLayout';
import { GridLayout, GridItem } from '../GridLayout';

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

describe('Layout Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Desktop Layout Switching', () => {
    const chessboardContent = <div data-testid="chessboard">Chessboard Component</div>;
    const sidebarContent = <div data-testid="sidebar">Sidebar Component</div>;

    it('switches from mobile to desktop layout when viewport changes', () => {
      const { rerender } = render(
        <TestWrapper width={600}>
          <ResponsiveGameContainer
            chessboard={chessboardContent}
            sidebar={sidebarContent}
          />
        </TestWrapper>
      );

      // Initially mobile - should have mobile layout classes
      expect(screen.getByTestId('chessboard')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      
      const mobileChessboard = screen.getByTestId('chessboard').closest('.mobile-chessboard-section');
      const mobileSidebar = screen.getByTestId('sidebar').closest('.mobile-sidebar-section');
      
      expect(mobileChessboard).toBeInTheDocument();
      expect(mobileSidebar).toBeInTheDocument();

      // Switch to desktop
      rerender(
        <TestWrapper width={1200}>
          <ResponsiveGameContainer
            chessboard={chessboardContent}
            sidebar={sidebarContent}
          />
        </TestWrapper>
      );

      // Should now have desktop grid layout
      const desktopChessboard = screen.getByTestId('chessboard').closest('[data-grid-area="chessboard"]');
      const desktopSidebar = screen.getByTestId('sidebar').closest('[data-grid-area="sidebar"]');
      
      expect(desktopChessboard).toBeInTheDocument();
      expect(desktopSidebar).toBeInTheDocument();
      
      // Mobile layout should be gone
      expect(screen.queryByTestId('chessboard').closest('.mobile-chessboard-section')).not.toBeInTheDocument();
      expect(screen.queryByTestId('sidebar').closest('.mobile-sidebar-section')).not.toBeInTheDocument();
    });

    it('uses flexbox layout when strategy is set to flexbox', () => {
      render(
        <TestWrapper width={1200}>
          <ResponsiveGameContainer
            chessboard={chessboardContent}
            sidebar={sidebarContent}
            strategy="flexbox"
          />
        </TestWrapper>
      );

      // Should use desktop flexbox layout (LeftPanel/RightPanel)
      const leftPanel = screen.getByTestId('chessboard').closest('[data-panel="left"]');
      const rightPanel = screen.getByTestId('sidebar').closest('[data-panel="right"]');
      
      expect(leftPanel).toBeInTheDocument();
      expect(rightPanel).toBeInTheDocument();
      
      // Should not use grid layout
      expect(screen.queryByTestId('chessboard').closest('[data-grid-area="chessboard"]')).not.toBeInTheDocument();
    });

    it('uses grid layout when strategy is set to grid', () => {
      render(
        <TestWrapper width={1200}>
          <ResponsiveGameContainer
            chessboard={chessboardContent}
            sidebar={sidebarContent}
            strategy="grid"
          />
        </TestWrapper>
      );

      // Should use grid layout
      const gridChessboard = screen.getByTestId('chessboard').closest('[data-grid-area="chessboard"]');
      const gridSidebar = screen.getByTestId('sidebar').closest('[data-grid-area="sidebar"]');
      
      expect(gridChessboard).toBeInTheDocument();
      expect(gridSidebar).toBeInTheDocument();
      
      // Should not use flexbox panels
      expect(screen.queryByTestId('chessboard').closest('[data-panel="left"]')).not.toBeInTheDocument();
    });
  });

  describe('Direct Component Integration', () => {
    it('integrates DesktopLayout with LeftPanel and RightPanel correctly', () => {
      render(
        <TestWrapper width={1200}>
          <DesktopLayout>
            <LeftPanel>
              <div data-testid="left-content">Left Panel Content</div>
            </LeftPanel>
            <RightPanel>
              <div data-testid="right-content">Right Panel Content</div>
            </RightPanel>
          </DesktopLayout>
        </TestWrapper>
      );

      expect(screen.getByTestId('left-content')).toBeInTheDocument();
      expect(screen.getByTestId('right-content')).toBeInTheDocument();
      
      const leftPanel = screen.getByTestId('left-content').closest('[data-panel="left"]');
      const rightPanel = screen.getByTestId('right-content').closest('[data-panel="right"]');
      const container = screen.getByTestId('left-content').closest('.desktop-layout-container');
      
      expect(leftPanel).toBeInTheDocument();
      expect(rightPanel).toBeInTheDocument();
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('desktop-grid-layout');
    });

    it('integrates GridLayout with GridItems correctly', () => {
      render(
        <TestWrapper width={1200}>
          <GridLayout template="default">
            <GridItem area="chessboard">
              <div data-testid="grid-chessboard">Grid Chessboard</div>
            </GridItem>
            <GridItem area="sidebar">
              <div data-testid="grid-sidebar">Grid Sidebar</div>
            </GridItem>
          </GridLayout>
        </TestWrapper>
      );

      expect(screen.getByTestId('grid-chessboard')).toBeInTheDocument();
      expect(screen.getByTestId('grid-sidebar')).toBeInTheDocument();
      
      const chessboardItem = screen.getByTestId('grid-chessboard').closest('[data-grid-area="chessboard"]');
      const sidebarItem = screen.getByTestId('grid-sidebar').closest('[data-grid-area="sidebar"]');
      const container = screen.getByTestId('grid-chessboard').closest('.grid-layout-container');
      
      expect(chessboardItem).toBeInTheDocument();
      expect(sidebarItem).toBeInTheDocument();
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('grid-template-default');
    });
  });

  describe('Responsive Behavior', () => {
    it('maintains consistent content across layout switches', () => {
      const chessboard = <div data-testid="chessboard">Chessboard Content</div>;
      const sidebar = <div data-testid="sidebar">Sidebar Content</div>;
      
      const { rerender } = render(
        <TestWrapper width={600}>
          <ResponsiveGameContainer
            chessboard={chessboard}
            sidebar={sidebar}
          />
        </TestWrapper>
      );

      // Verify content is present in mobile
      expect(screen.getByText('Chessboard Content')).toBeInTheDocument();
      expect(screen.getByText('Sidebar Content')).toBeInTheDocument();

      // Switch to desktop
      rerender(
        <TestWrapper width={1200}>
          <ResponsiveGameContainer
            chessboard={chessboard}
            sidebar={sidebar}
          />
        </TestWrapper>
      );

      // Verify same content is still present in desktop
      expect(screen.getByText('Chessboard Content')).toBeInTheDocument();
      expect(screen.getByText('Sidebar Content')).toBeInTheDocument();
    });

    it('applies correct layout mode classes across different viewport sizes', () => {
      const content = <div data-testid="test-content">Test Content</div>;
      
      const { rerender } = render(
        <TestWrapper width={600}>
          <DesktopLayout>
            {content}
          </DesktopLayout>
        </TestWrapper>
      );

      let container = screen.getByTestId('test-content').closest('.desktop-layout-container');
      expect(container).toHaveClass('layout-mode-mobile');
      expect(container).toHaveClass('mobile-flex-layout');

      // Tablet
      rerender(
        <TestWrapper width={800}>
          <DesktopLayout>
            {content}
          </DesktopLayout>
        </TestWrapper>
      );

      container = screen.getByTestId('test-content').closest('.desktop-layout-container');
      expect(container).toHaveClass('layout-mode-tablet');

      // Desktop
      rerender(
        <TestWrapper width={1200}>
          <DesktopLayout>
            {content}
          </DesktopLayout>
        </TestWrapper>
      );

      container = screen.getByTestId('test-content').closest('.desktop-layout-container');
      expect(container).toHaveClass('layout-mode-desktop');
      expect(container).toHaveClass('desktop-grid-layout');

      // Large Desktop
      rerender(
        <TestWrapper width={1500}>
          <DesktopLayout>
            {content}
          </DesktopLayout>
        </TestWrapper>
      );

      container = screen.getByTestId('test-content').closest('.desktop-layout-container');
      expect(container).toHaveClass('layout-mode-large-desktop');
    });
  });
});