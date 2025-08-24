import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LayoutManager, LayoutSection, withResponsiveLayout } from '../LayoutManager';

// Mock the useViewport hook
vi.mock('../../hooks/useViewport', () => ({
  useViewport: vi.fn(() => ({
    width: 1024,
    height: 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLargeDesktop: false,
  })),
}));

describe('LayoutManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('LayoutManager component', () => {
    it('renders children within responsive layout', () => {
      render(
        <LayoutManager>
          <div data-testid="test-child">Test Content</div>
        </LayoutManager>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByTestId('test-child')).toHaveTextContent('Test Content');
    });

    it('applies correct layout mode class', () => {
      const { container } = render(
        <LayoutManager>
          <div>Test Content</div>
        </LayoutManager>
      );

      const layoutContainer = container.querySelector('.layout-manager');
      expect(layoutContainer).toHaveClass('layout-desktop');
      expect(layoutContainer).toHaveAttribute('data-layout-mode', 'desktop');
    });

    it('applies custom className and styles', () => {
      const customStyle = { backgroundColor: 'red' };
      const { container } = render(
        <LayoutManager className="custom-class" style={customStyle}>
          <div>Test Content</div>
        </LayoutManager>
      );

      const layoutContainer = container.querySelector('.layout-manager');
      expect(layoutContainer).toHaveClass('custom-class');
      expect(layoutContainer).toHaveStyle('background-color: rgb(255, 0, 0)');
    });

    it('calls onLayoutChange when layout mode changes', async () => {
      const onLayoutChange = vi.fn();
      const { useViewport } = await import('../../hooks/useViewport');
      
      // Initial render with desktop
      const { rerender } = render(
        <LayoutManager onLayoutChange={onLayoutChange}>
          <div>Test Content</div>
        </LayoutManager>
      );

      // Change to mobile viewport
      vi.mocked(useViewport).mockReturnValue({
        width: 375,
        height: 667,
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: false,
      });

      rerender(
        <LayoutManager onLayoutChange={onLayoutChange}>
          <div>Test Content</div>
        </LayoutManager>
      );

      expect(onLayoutChange).toHaveBeenCalledWith('mobile');
    });

    it('sets viewport data attributes', () => {
      const { container } = render(
        <LayoutManager>
          <div>Test Content</div>
        </LayoutManager>
      );

      const layoutContainer = container.querySelector('.layout-manager');
      expect(layoutContainer).toHaveAttribute('data-viewport-width', '1024');
      expect(layoutContainer).toHaveAttribute('data-viewport-height', '768');
    });
  });

  describe('LayoutSection component', () => {
    const renderLayoutSection = (section: 'chessboard' | 'sidebar' | 'header' | 'footer') => {
      return render(
        <LayoutManager>
          <LayoutSection section={section}>
            <div data-testid={`${section}-content`}>Section Content</div>
          </LayoutSection>
        </LayoutManager>
      );
    };

    it('renders chessboard section with correct styles', () => {
      const { container } = renderLayoutSection('chessboard');
      
      const section = container.querySelector('.layout-section-chessboard');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('data-section', 'chessboard');
      expect(section).toHaveClass('layout-section-chessboard-desktop');
      
      // Check for chessboard-specific styles
      expect(section).toHaveStyle('display: flex');
      expect(section).toHaveStyle('justify-content: center');
      expect(section).toHaveStyle('align-items: center');
    });

    it('renders sidebar section with correct styles', () => {
      const { container } = renderLayoutSection('sidebar');
      
      const section = container.querySelector('.layout-section-sidebar');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('data-section', 'sidebar');
      expect(section).toHaveClass('layout-section-sidebar-desktop');
      
      // Check for sidebar-specific styles
      expect(section).toHaveStyle('display: flex');
      expect(section).toHaveStyle('flex-direction: column');
    });

    it('renders header section with correct styles', () => {
      const { container } = renderLayoutSection('header');
      
      const section = container.querySelector('.layout-section-header');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('data-section', 'header');
      expect(section).toHaveStyle('width: 100%');
      expect(section).toHaveStyle('flex-shrink: 0');
    });

    it('renders footer section with correct styles', () => {
      const { container } = renderLayoutSection('footer');
      
      const section = container.querySelector('.layout-section-footer');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('data-section', 'footer');
      expect(section).toHaveStyle('width: 100%');
      expect(section).toHaveStyle('flex-shrink: 0');
    });

    it('applies custom className and styles to sections', () => {
      const customStyle = { border: '1px solid blue' };
      render(
        <LayoutManager>
          <LayoutSection section="chessboard" className="custom-section" style={customStyle}>
            <div>Section Content</div>
          </LayoutSection>
        </LayoutManager>
      );

      const section = document.querySelector('.layout-section-chessboard');
      expect(section).toHaveClass('custom-section');
      expect(section).toHaveStyle('border: 1px solid blue');
    });
  });

  describe('withResponsiveLayout HOC', () => {
    const TestComponent = ({ message }: { message: string }) => (
      <div data-testid="wrapped-component">{message}</div>
    );

    it('wraps component with LayoutManager', () => {
      const WrappedComponent = withResponsiveLayout(TestComponent);
      
      render(<WrappedComponent message="Hello World" />);
      
      expect(screen.getByTestId('wrapped-component')).toBeInTheDocument();
      expect(screen.getByTestId('wrapped-component')).toHaveTextContent('Hello World');
    });

    it('passes layoutManagerProps to LayoutManager', () => {
      const WrappedComponent = withResponsiveLayout(TestComponent);
      const onLayoutChange = vi.fn();
      
      const { container } = render(
        <WrappedComponent 
          message="Hello World" 
          layoutManagerProps={{ 
            className: 'hoc-layout',
            onLayoutChange 
          }} 
        />
      );
      
      const layoutContainer = container.querySelector('.layout-manager');
      expect(layoutContainer).toHaveClass('hoc-layout');
    });
  });

  describe('Responsive behavior', () => {
    it('adapts layout for mobile viewport', async () => {
      const { useViewport } = await import('../../hooks/useViewport');
      vi.mocked(useViewport).mockReturnValue({
        width: 375,
        height: 667,
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: false,
      });

      const { container } = render(
        <LayoutManager>
          <LayoutSection section="chessboard">
            <div>Chessboard</div>
          </LayoutSection>
          <LayoutSection section="sidebar">
            <div>Sidebar</div>
          </LayoutSection>
        </LayoutManager>
      );

      const layoutContainer = container.querySelector('.layout-manager');
      expect(layoutContainer).toHaveClass('layout-mobile');
      expect(layoutContainer).toHaveStyle('flex-direction: column');
      
      const chessboardSection = container.querySelector('.layout-section-chessboard-mobile');
      const sidebarSection = container.querySelector('.layout-section-sidebar-mobile');
      
      expect(chessboardSection).toBeInTheDocument();
      expect(sidebarSection).toBeInTheDocument();
    });

    it('adapts layout for large desktop viewport', async () => {
      const { useViewport } = await import('../../hooks/useViewport');
      vi.mocked(useViewport).mockReturnValue({
        width: 1920,
        height: 1080,
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: true,
      });

      const { container } = render(
        <LayoutManager>
          <LayoutSection section="chessboard">
            <div>Chessboard</div>
          </LayoutSection>
          <LayoutSection section="sidebar">
            <div>Sidebar</div>
          </LayoutSection>
        </LayoutManager>
      );

      const layoutContainer = container.querySelector('.layout-manager');
      expect(layoutContainer).toHaveClass('layout-large-desktop');
      expect(layoutContainer).toHaveStyle('flex-direction: row');
      
      const chessboardSection = container.querySelector('.layout-section-chessboard-large-desktop');
      const sidebarSection = container.querySelector('.layout-section-sidebar-large-desktop');
      
      expect(chessboardSection).toBeInTheDocument();
      expect(sidebarSection).toBeInTheDocument();
    });
  });

  describe('Layout transitions', () => {
    it('applies transition styles for smooth layout changes', () => {
      const { container } = render(
        <LayoutManager>
          <LayoutSection section="chessboard">
            <div>Content</div>
          </LayoutSection>
        </LayoutManager>
      );

      const layoutContainer = container.querySelector('.layout-manager');
      const section = container.querySelector('.layout-section');
      
      expect(layoutContainer).toHaveStyle('transition: all 0.3s ease-in-out');
      expect(section).toHaveStyle('transition: all 0.3s ease-in-out');
    });
  });
});