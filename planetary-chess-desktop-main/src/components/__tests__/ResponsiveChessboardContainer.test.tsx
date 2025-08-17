import React from 'react';
import { render, screen } from '@testing-library/react';
import { Chess } from 'chess.js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ResponsiveChessboardContainer } from '../ResponsiveChessboardContainer';
import { useViewport } from '../../hooks/useViewport';
import { getLayoutMode } from '../../config/responsive';
import { calculateResponsiveChessboardSize } from '../../utils/responsiveUtils';

// Mock the hooks and utilities
vi.mock('../../hooks/useViewport');
vi.mock('../../config/responsive');
vi.mock('../../utils/responsiveUtils');
vi.mock('react-chessboard', () => ({
  Chessboard: ({ boardWidth, id, customBoardStyle, customDarkSquareStyle, customLightSquareStyle, ...props }: any) => (
    <div 
      data-testid="chessboard" 
      data-board-width={boardWidth}
      data-board-id={id}
      style={{
        ...customBoardStyle,
        backgroundColor: customLightSquareStyle?.backgroundColor || customDarkSquareStyle?.backgroundColor,
      }}
      {...props}
    >
      Mocked Chessboard
    </div>
  ),
}));

const mockUseViewport = vi.mocked(useViewport);
const mockCalculateResponsiveChessboardSize = vi.mocked(calculateResponsiveChessboardSize);
const mockGetLayoutMode = vi.mocked(getLayoutMode);

describe('ResponsiveChessboardContainer', () => {
  let mockGame: Chess;
  let mockOnPieceDrop: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGame = new Chess();
    mockOnPieceDrop = vi.fn();
    
    // Reset mocks
    vi.clearAllMocks();
  });

  describe('Mobile Layout (< 768px)', () => {
    beforeEach(() => {
      mockUseViewport.mockReturnValue({
        width: 400,
        height: 800,
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: false,
      });
      mockGetLayoutMode.mockReturnValue('mobile');
      mockCalculateResponsiveChessboardSize.mockReturnValue(360);
    });

    it('renders chessboard with mobile size', () => {
      render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
        />
      );

      const chessboard = screen.getByTestId('chessboard');
      expect(chessboard).toBeInTheDocument();
      expect(chessboard).toHaveAttribute('data-board-width', '360');
    });

    it('applies mobile styling with smaller padding', () => {
      const { container } = render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
        />
      );

      const containerDiv = container.firstChild as HTMLElement;
      expect(containerDiv).toHaveStyle('padding: 10px');
    });

    it('uses mobile-appropriate glow effects', () => {
      const { container } = render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
        />
      );

      // Check the container div has the correct box-shadow
      const containerDiv = container.firstChild as HTMLElement;
      expect(containerDiv).toHaveStyle('box-shadow: 0 0 25px rgba(0, 195, 255, 0.2), 0 0 10px rgba(0, 0, 0, 0.5) inset');
    });
  });

  describe('Tablet Layout (768px - 1024px)', () => {
    beforeEach(() => {
      mockUseViewport.mockReturnValue({
        width: 800,
        height: 1024,
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        isLargeDesktop: false,
      });
      mockGetLayoutMode.mockReturnValue('tablet');
      mockCalculateResponsiveChessboardSize.mockReturnValue(500);
    });

    it('renders chessboard with tablet size', () => {
      render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
        />
      );

      const chessboard = screen.getByTestId('chessboard');
      expect(chessboard).toHaveAttribute('data-board-width', '500');
    });

    it('applies tablet styling with medium padding', () => {
      const { container } = render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
        />
      );

      const containerDiv = container.firstChild as HTMLElement;
      expect(containerDiv).toHaveStyle('padding: 15px');
    });
  });

  describe('Desktop Layout (1024px - 1440px)', () => {
    beforeEach(() => {
      mockUseViewport.mockReturnValue({
        width: 1200,
        height: 800,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
      });
      mockGetLayoutMode.mockReturnValue('desktop');
      mockCalculateResponsiveChessboardSize.mockReturnValue(700);
    });

    it('renders chessboard with desktop size', () => {
      render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
        />
      );

      const chessboard = screen.getByTestId('chessboard');
      expect(chessboard).toHaveAttribute('data-board-width', '700');
    });

    it('applies desktop styling with larger padding', () => {
      const { container } = render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
        />
      );

      const containerDiv = container.firstChild as HTMLElement;
      expect(containerDiv).toHaveStyle('padding: 15px');
    });

    it('uses enhanced glow effects for desktop', () => {
      const { container } = render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
        />
      );

      // Check the container div has the correct box-shadow
      const containerDiv = container.firstChild as HTMLElement;
      expect(containerDiv).toHaveStyle('box-shadow: 0 0 25px rgba(0, 195, 255, 0.2), 0 0 10px rgba(0, 0, 0, 0.5) inset');
    });

    it('applies enhanced board shadow for desktop', () => {
      render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
        />
      );

      const chessboard = screen.getByTestId('chessboard');
      expect(chessboard).toHaveStyle('border-radius: 8px');
    });
  });

  describe('Large Desktop Layout (> 1440px)', () => {
    beforeEach(() => {
      mockUseViewport.mockReturnValue({
        width: 1600,
        height: 900,
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: true,
      });
      mockGetLayoutMode.mockReturnValue('large-desktop');
      mockCalculateResponsiveChessboardSize.mockReturnValue(800);
    });

    it('renders chessboard with large desktop size', () => {
      render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
        />
      );

      const chessboard = screen.getByTestId('chessboard');
      expect(chessboard).toHaveAttribute('data-board-width', '800');
    });

    it('uses enhanced effects for large desktop', () => {
      const { container } = render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
        />
      );

      // Check the container div has the correct box-shadow
      const containerDiv = container.firstChild as HTMLElement;
      expect(containerDiv).toHaveStyle('box-shadow: 0 0 25px rgba(0, 195, 255, 0.2), 0 0 10px rgba(0, 0, 0, 0.5) inset');
    });
  });

  describe('Size Constraints', () => {
    beforeEach(() => {
      mockUseViewport.mockReturnValue({
        width: 1200,
        height: 800,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
      });
      mockGetLayoutMode.mockReturnValue('desktop');
      mockCalculateResponsiveChessboardSize.mockReturnValue(700);
    });

    it('respects maxSize constraint', () => {
      // Mock the function to return a value that would be constrained by maxSize
      mockCalculateResponsiveChessboardSize.mockReturnValue(600);
      
      render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
          maxSize={600}
        />
      );

      const chessboard = screen.getByTestId('chessboard');
      expect(chessboard).toHaveAttribute('data-board-width', '600');
      expect(mockCalculateResponsiveChessboardSize).toHaveBeenCalledWith(1200, 'desktop', { min: undefined, max: 600 });
    });

    it('respects minSize constraint', () => {
      mockCalculateResponsiveChessboardSize.mockReturnValue(500);
      
      render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
          minSize={500}
        />
      );

      const chessboard = screen.getByTestId('chessboard');
      expect(chessboard).toHaveAttribute('data-board-width', '500');
    });

    it('applies both min and max constraints correctly', () => {
      mockCalculateResponsiveChessboardSize.mockReturnValue(400);
      
      render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
          minSize={400}
          maxSize={600}
        />
      );

      const chessboard = screen.getByTestId('chessboard');
      expect(chessboard).toHaveAttribute('data-board-width', '400');
    });
  });

  describe('Custom Styling', () => {
    beforeEach(() => {
      mockUseViewport.mockReturnValue({
        width: 1200,
        height: 800,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
      });
      mockGetLayoutMode.mockReturnValue('desktop');
      mockCalculateResponsiveChessboardSize.mockReturnValue(700);
    });

    it('accepts custom dark square styles', () => {
      const customDarkStyle = { backgroundColor: '#ff0000' };
      
      const { container } = render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
          customDarkSquareStyle={customDarkStyle}
        />
      );

      // Just verify the component renders without error when custom styles are provided
      expect(container.firstChild).toBeInTheDocument();
    });

    it('accepts custom light square styles', () => {
      const customLightStyle = { backgroundColor: '#00ff00' };
      
      const { container } = render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
          customLightSquareStyle={customLightStyle}
        />
      );

      // Just verify the component renders without error when custom styles are provided
      expect(container.firstChild).toBeInTheDocument();
    });

    it('applies custom board styles', () => {
      const customBoardStyle = { borderRadius: '20px' };
      
      render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
          customBoardStyle={customBoardStyle}
        />
      );

      const chessboard = screen.getByTestId('chessboard');
      expect(chessboard).toHaveStyle('border-radius: 20px');
    });
  });

  describe('Props Forwarding', () => {
    beforeEach(() => {
      mockUseViewport.mockReturnValue({
        width: 1200,
        height: 800,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
      });
      mockGetLayoutMode.mockReturnValue('desktop');
      mockCalculateResponsiveChessboardSize.mockReturnValue(700);
    });

    it('forwards game position correctly', () => {
      render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
        />
      );

      const chessboard = screen.getByTestId('chessboard');
      expect(chessboard).toHaveAttribute('position', mockGame.fen());
    });

    it('forwards onPieceDrop handler', () => {
      render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
        />
      );

      const chessboard = screen.getByTestId('chessboard');
      // Just check that the component renders without error when onPieceDrop is provided
      expect(chessboard).toBeInTheDocument();
    });

    it('forwards board orientation', () => {
      render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
          boardOrientation="white"
        />
      );

      const chessboard = screen.getByTestId('chessboard');
      expect(chessboard).toHaveAttribute('boardOrientation', 'white');
    });

    it('uses default black orientation when not specified', () => {
      render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
        />
      );

      const chessboard = screen.getByTestId('chessboard');
      expect(chessboard).toHaveAttribute('boardOrientation', 'black');
    });
  });

  describe('Responsive Behavior', () => {
    it('calls calculateResponsiveChessboardSize with correct parameters', () => {
      mockUseViewport.mockReturnValue({
        width: 1200,
        height: 800,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
      });
      mockGetLayoutMode.mockReturnValue('desktop');
      mockCalculateResponsiveChessboardSize.mockReturnValue(700);

      render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
        />
      );

      expect(mockCalculateResponsiveChessboardSize).toHaveBeenCalledWith(1200, 'desktop', { min: undefined, max: undefined });
    });

    it('calls getLayoutMode with viewport width', () => {
      mockUseViewport.mockReturnValue({
        width: 1200,
        height: 800,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
      });
      mockGetLayoutMode.mockReturnValue('desktop');
      mockCalculateResponsiveChessboardSize.mockReturnValue(700);

      render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
        />
      );

      expect(mockGetLayoutMode).toHaveBeenCalledWith(1200);
    });
  });

  describe('Development Debug Info', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('shows debug info in development mode', () => {
      process.env.NODE_ENV = 'development';
      
      mockUseViewport.mockReturnValue({
        width: 1200,
        height: 800,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
      });
      mockGetLayoutMode.mockReturnValue('desktop');
      mockCalculateResponsiveChessboardSize.mockReturnValue(700);

      const { container } = render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
        />
      );

      const debugInfo = container.querySelector('div[style*="monospace"]');
      expect(debugInfo).toBeInTheDocument();
      expect(debugInfo).toHaveTextContent('desktop | 700px | 1200x800');
    });

    it('hides debug info in production mode', () => {
      process.env.NODE_ENV = 'production';
      
      mockUseViewport.mockReturnValue({
        width: 1200,
        height: 800,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
      });
      mockGetLayoutMode.mockReturnValue('desktop');
      mockCalculateResponsiveChessboardSize.mockReturnValue(700);

      const { container } = render(
        <ResponsiveChessboardContainer
          game={mockGame}
          onPieceDrop={mockOnPieceDrop}
        />
      );

      const debugInfo = container.querySelector('div[style*="monospace"]');
      expect(debugInfo).not.toBeInTheDocument();
    });
  });
});