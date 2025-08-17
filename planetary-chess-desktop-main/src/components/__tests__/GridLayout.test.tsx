import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GridLayout, GridItem, useGridTemplate } from '../GridLayout';
import { ResponsiveProvider } from '../../contexts/ResponsiveContext';
import { renderHook } from '@testing-library/react';

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

describe('GridLayout Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GridItem', () => {
    it('renders children correctly', () => {
      render(
        <TestWrapper>
          <GridItem area="chessboard">
            <div data-testid="grid-content">Grid Item Content</div>
          </GridItem>
        </TestWrapper>
      );

      expect(screen.getByTestId('grid-content')).toBeInTheDocument();
      expect(screen.getByText('Grid Item Content')).toBeInTheDocument();
    });

    it('applies correct grid area and CSS classes', () => {
      render(
        <TestWrapper>
          <GridItem area="sidebar" className="custom-class">
            <div>Content</div>
          </GridItem>
        </TestWrapper>
      );

      const item = screen.getByText('Content').parentElement;
      expect(item).toHaveClass('grid-item');
      expect(item).toHaveClass('grid-item-sidebar');
      expect(item).toHaveClass('layout-mode-desktop');
      expect(item).toHaveClass('custom-class');
      expect(item).toHaveAttribute('data-grid-area', 'sidebar');
      expect(item).toHaveStyle({ gridArea: 'sidebar' });
    });

    it('applies different styles for different areas', () => {
      const { rerender } = render(
        <TestWrapper>
          <GridItem area="chessboard">
            <div data-testid="chessboard-content">Chessboard</div>
          </GridItem>
        </TestWrapper>
      );

      const chessboardItem = screen.getByTestId('chessboard-content').parentElement;
      expect(chessboardItem).toHaveStyle({
        alignItems: 'center',
        justifyContent: 'center',
      });

      rerender(
        <TestWrapper>
          <GridItem area="sidebar">
            <div data-testid="sidebar-content">Sidebar</div>
          </GridItem>
        </TestWrapper>
      );

      const sidebarItem = screen.getByTestId('sidebar-content').parentElement;
      expect(sidebarItem).toHaveStyle({
        flexDirection: 'column',
      });
    });

    it('applies correct padding for header and footer areas', () => {
      render(
        <TestWrapper>
          <GridItem area="header">
            <div data-testid="header-content">Header</div>
          </GridItem>
        </TestWrapper>
      );

      const headerItem = screen.getByTestId('header-content').parentElement;
      expect(headerItem).toHaveStyle({ padding: '0.5rem' });
    });
  });

  describe('GridLayout', () => {
    it('renders children correctly', () => {
      render(
        <TestWrapper>
          <GridLayout>
            <GridItem area="chessboard">
              <div data-testid="chessboard">Chessboard</div>
            </GridItem>
            <GridItem area="sidebar">
              <div data-testid="sidebar">Sidebar</div>
            </GridItem>
          </GridLayout>
        </TestWrapper>
      );

      expect(screen.getByTestId('chessboard')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('applies correct CSS Grid properties for desktop default template', () => {
      render(
        <TestWrapper width={1200}>
          <GridLayout template="default">
            <div>Content</div>
          </GridLayout>
        </TestWrapper>
      );

      const container = screen.getByText('Content').parentElement;
      expect(container).toHaveClass('grid-layout-container');
      expect(container).toHaveClass('grid-template-default');
      expect(container).toHaveClass('layout-mode-desktop');
      expect(container).toHaveAttribute('data-template', 'default');
      expect(container).toHaveStyle({
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gridTemplateRows: '1fr',
      });
    });

    it('applies correct grid template for large desktop', () => {
      render(
        <TestWrapper width={1500}>
          <GridLayout template="default">
            <div>Content</div>
          </GridLayout>
        </TestWrapper>
      );

      const container = screen.getByText('Content').parentElement;
      expect(container).toHaveStyle({
        gridTemplateColumns: '3fr 2fr',
      });
    });

    it('applies with-header template correctly', () => {
      render(
        <TestWrapper width={1200}>
          <GridLayout template="with-header">
            <div>Content</div>
          </GridLayout>
        </TestWrapper>
      );

      const container = screen.getByText('Content').parentElement;
      expect(container).toHaveStyle({
        gridTemplateColumns: '2fr 1fr',
        gridTemplateRows: 'auto 1fr',
      });
    });

    it('applies full-layout template correctly', () => {
      render(
        <TestWrapper width={1200}>
          <GridLayout template="full-layout">
            <div>Content</div>
          </GridLayout>
        </TestWrapper>
      );

      const container = screen.getByText('Content').parentElement;
      expect(container).toHaveStyle({
        gridTemplateColumns: '2fr 1fr',
        gridTemplateRows: 'auto 1fr auto',
      });
    });

    it('falls back to mobile layout for mobile viewport', () => {
      render(
        <TestWrapper width={600}>
          <GridLayout template="default">
            <div>Content</div>
          </GridLayout>
        </TestWrapper>
      );

      const container = screen.getByText('Content').parentElement;
      expect(container).toHaveClass('layout-mode-mobile');
      expect(container).toHaveStyle({
        gridTemplateColumns: '1fr',
        gridTemplateRows: 'auto 1fr auto',
      });
    });

    it('uses custom template when provided', () => {
      const customTemplate = {
        columns: '1fr 1fr 1fr',
        rows: '100px 1fr',
        areas: '"header header header" "left center right"',
      };

      render(
        <TestWrapper>
          <GridLayout customTemplate={customTemplate}>
            <div>Content</div>
          </GridLayout>
        </TestWrapper>
      );

      const container = screen.getByText('Content').parentElement;
      expect(container).toHaveStyle({
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '100px 1fr',
        gridTemplateAreas: '"header header header" "left center right"',
      });
    });

    it('applies responsive max-width for desktop', () => {
      render(
        <TestWrapper width={1200}>
          <GridLayout>
            <div>Content</div>
          </GridLayout>
        </TestWrapper>
      );

      const container = screen.getByText('Content').parentElement;
      expect(container).toHaveStyle({
        maxWidth: '1400px',
        margin: '0 auto',
      });
    });
  });

  describe('useGridTemplate hook', () => {
    it('returns correct template for desktop default', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TestWrapper width={1200}>{children}</TestWrapper>
      );

      const { result } = renderHook(() => useGridTemplate('default'), { wrapper });

      expect(result.current.layoutMode).toBe('desktop');
      expect(result.current.isDesktopGrid).toBe(true);
      expect(result.current.template.columns).toBe('2fr 1fr');
      expect(result.current.template.rows).toBe('1fr');
    });

    it('returns correct template for mobile', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TestWrapper width={600}>{children}</TestWrapper>
      );

      const { result } = renderHook(() => useGridTemplate('default'), { wrapper });

      expect(result.current.layoutMode).toBe('mobile');
      expect(result.current.isDesktopGrid).toBe(false);
      expect(result.current.template.columns).toBe('1fr');
    });

    it('returns correct template for with-header', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TestWrapper width={1200}>{children}</TestWrapper>
      );

      const { result } = renderHook(() => useGridTemplate('with-header'), { wrapper });

      expect(result.current.template.rows).toBe('auto 1fr');
    });
  });

  describe('Layout Responsiveness', () => {
    it('switches grid templates when viewport changes', () => {
      const { rerender } = render(
        <TestWrapper width={600}>
          <GridLayout template="default">
            <div data-testid="content">Content</div>
          </GridLayout>
        </TestWrapper>
      );

      // Initially mobile
      let container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('layout-mode-mobile');
      expect(container).toHaveStyle({ gridTemplateColumns: '1fr' });

      // Switch to desktop
      rerender(
        <TestWrapper width={1200}>
          <GridLayout template="default">
            <div data-testid="content">Content</div>
          </GridLayout>
        </TestWrapper>
      );

      container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('layout-mode-desktop');
      expect(container).toHaveStyle({ gridTemplateColumns: '2fr 1fr' });
    });

    it('applies transition styles for smooth layout changes', () => {
      render(
        <TestWrapper>
          <GridLayout>
            <GridItem area="chessboard">
              <div>Chessboard</div>
            </GridItem>
          </GridLayout>
        </TestWrapper>
      );

      const container = screen.getByText('Chessboard').closest('.grid-layout-container');
      const item = screen.getByText('Chessboard').parentElement;

      expect(container).toHaveStyle('transition: all 0.3s ease-in-out');
      expect(item).toHaveStyle('transition: all 0.3s ease-in-out');
    });
  });
});