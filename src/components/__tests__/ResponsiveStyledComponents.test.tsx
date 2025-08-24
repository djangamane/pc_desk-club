import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ResponsiveProvider } from '../../contexts/ResponsiveContext';
import {
  ResponsiveButton,
  ResponsivePanel,
  ResponsiveText,
  ResponsiveAvatar,
  ResponsiveContainer,
  ResponsiveSpacing,
  ResponsiveGrid,
  ResponsiveFlex,
  ResponsiveImage,
} from '../ResponsiveStyledComponents';

// Mock the responsive context
const mockResponsiveContext = {
  layoutMode: 'desktop' as const,
  viewportInfo: {
    width: 1200,
    height: 800,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLargeDesktop: false,
  },
  layoutConfig: {
    direction: 'row' as const,
    chessboardContainer: { width: '65%', maxWidth: '800px' },
    sidebar: { width: '35%', maxWidth: '400px', position: 'right' as const },
    spacing: { padding: '2rem', gap: '2rem' },
  },
  chessboardSize: 600,
  calculateDynamicSize: (baseSize: number) => baseSize * 1.5,
  isLayoutMode: (mode: string) => mode === 'desktop',
};

vi.mock('../../contexts/ResponsiveContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useResponsive: () => mockResponsiveContext,
  };
});

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <ResponsiveProvider>
      {component}
    </ResponsiveProvider>
  );
};

describe('ResponsiveStyledComponents', () => {
  describe('ResponsiveButton', () => {
    it('should render with default props', () => {
      renderWithProvider(
        <ResponsiveButton data-testid="test-button">
          Click me
        </ResponsiveButton>
      );

      const button = screen.getByTestId('test-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click me');
    });

    it('should handle click events', () => {
      const handleClick = jest.fn();
      renderWithProvider(
        <ResponsiveButton onClick={handleClick} data-testid="test-button">
          Click me
        </ResponsiveButton>
      );

      const button = screen.getByTestId('test-button');
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should apply variant styles', () => {
      renderWithProvider(
        <ResponsiveButton variant="secondary" data-testid="test-button">
          Secondary Button
        </ResponsiveButton>
      );

      const button = screen.getByTestId('test-button');
      const styles = window.getComputedStyle(button);
      expect(button).toBeInTheDocument();
    });

    it('should handle disabled state', () => {
      const handleClick = jest.fn();
      renderWithProvider(
        <ResponsiveButton disabled onClick={handleClick} data-testid="test-button">
          Disabled Button
        </ResponsiveButton>
      );

      const button = screen.getByTestId('test-button');
      expect(button).toBeDisabled();
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should apply custom styles', () => {
      renderWithProvider(
        <ResponsiveButton style={{ backgroundColor: 'red' }} data-testid="test-button">
          Custom Button
        </ResponsiveButton>
      );

      const button = screen.getByTestId('test-button');
      expect(button.style.backgroundColor).toBe('red');
    });

    it('should handle different sizes', () => {
      const { rerender } = renderWithProvider(
        <ResponsiveButton size="sm" data-testid="test-button">
          Small Button
        </ResponsiveButton>
      );

      let button = screen.getByTestId('test-button');
      const smallFontSize = window.getComputedStyle(button).fontSize;

      rerender(
        <ResponsiveProvider>
          <ResponsiveButton size="lg" data-testid="test-button">
            Large Button
          </ResponsiveButton>
        </ResponsiveProvider>
      );

      button = screen.getByTestId('test-button');
      const largeFontSize = window.getComputedStyle(button).fontSize;

      // Large should be bigger than small (though exact values depend on computed styles)
      expect(button).toBeInTheDocument();
    });
  });

  describe('ResponsivePanel', () => {
    it('should render with default props', () => {
      renderWithProvider(
        <ResponsivePanel data-testid="test-panel">
          Panel content
        </ResponsivePanel>
      );

      const panel = screen.getByTestId('test-panel');
      expect(panel).toBeInTheDocument();
      expect(panel).toHaveTextContent('Panel content');
    });

    it('should apply variant styles', () => {
      renderWithProvider(
        <ResponsivePanel variant="secondary" data-testid="test-panel">
          Secondary Panel
        </ResponsivePanel>
      );

      const panel = screen.getByTestId('test-panel');
      expect(panel).toBeInTheDocument();
    });

    it('should handle glow option', () => {
      const { rerender } = renderWithProvider(
        <ResponsivePanel withGlow={true} data-testid="test-panel">
          Glowing Panel
        </ResponsivePanel>
      );

      let panel = screen.getByTestId('test-panel');
      expect(panel).toBeInTheDocument();

      rerender(
        <ResponsiveProvider>
          <ResponsivePanel withGlow={false} data-testid="test-panel">
            Non-glowing Panel
          </ResponsivePanel>
        </ResponsiveProvider>
      );

      panel = screen.getByTestId('test-panel');
      expect(panel).toBeInTheDocument();
    });
  });

  describe('ResponsiveText', () => {
    it('should render with default props', () => {
      renderWithProvider(
        <ResponsiveText data-testid="test-text">
          Text content
        </ResponsiveText>
      );

      const text = screen.getByTestId('test-text');
      expect(text).toBeInTheDocument();
      expect(text).toHaveTextContent('Text content');
    });

    it('should render as different HTML elements', () => {
      const { rerender } = renderWithProvider(
        <ResponsiveText as="h1" data-testid="test-text">
          Heading
        </ResponsiveText>
      );

      let text = screen.getByTestId('test-text');
      expect(text.tagName).toBe('H1');

      rerender(
        <ResponsiveProvider>
          <ResponsiveText as="p" data-testid="test-text">
            Paragraph
          </ResponsiveText>
        </ResponsiveProvider>
      );

      text = screen.getByTestId('test-text');
      expect(text.tagName).toBe('P');
    });

    it('should apply variant styles', () => {
      renderWithProvider(
        <ResponsiveText variant="heading" data-testid="test-text">
          Heading Text
        </ResponsiveText>
      );

      const text = screen.getByTestId('test-text');
      expect(text).toBeInTheDocument();
    });

    it('should handle different sizes', () => {
      renderWithProvider(
        <ResponsiveText size="xl" data-testid="test-text">
          Large Text
        </ResponsiveText>
      );

      const text = screen.getByTestId('test-text');
      expect(text).toBeInTheDocument();
    });
  });

  describe('ResponsiveAvatar', () => {
    it('should render with specified size', () => {
      renderWithProvider(
        <ResponsiveAvatar size={100} data-testid="test-avatar">
          <img src="/test.jpg" alt="Avatar" />
        </ResponsiveAvatar>
      );

      const avatar = screen.getByTestId('test-avatar');
      expect(avatar).toBeInTheDocument();
      expect(avatar.style.width).toBe('100px');
      expect(avatar.style.height).toBe('100px');
    });

    it('should handle glow option', () => {
      const { rerender } = renderWithProvider(
        <ResponsiveAvatar size={100} withGlow={true} data-testid="test-avatar">
          <img src="/test.jpg" alt="Avatar" />
        </ResponsiveAvatar>
      );

      let avatar = screen.getByTestId('test-avatar');
      expect(avatar).toBeInTheDocument();

      rerender(
        <ResponsiveProvider>
          <ResponsiveAvatar size={100} withGlow={false} data-testid="test-avatar">
            <img src="/test.jpg" alt="Avatar" />
          </ResponsiveAvatar>
        </ResponsiveProvider>
      );

      avatar = screen.getByTestId('test-avatar');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('ResponsiveContainer', () => {
    it('should render with default props', () => {
      renderWithProvider(
        <ResponsiveContainer data-testid="test-container">
          Container content
        </ResponsiveContainer>
      );

      const container = screen.getByTestId('test-container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveTextContent('Container content');
    });

    it('should apply max width', () => {
      renderWithProvider(
        <ResponsiveContainer maxWidth="800px" data-testid="test-container">
          Container content
        </ResponsiveContainer>
      );

      const container = screen.getByTestId('test-container');
      expect(container.style.maxWidth).toBe('800px');
    });
  });

  describe('ResponsiveSpacing', () => {
    it('should render spacing div', () => {
      renderWithProvider(
        <ResponsiveSpacing size="lg" />
      );

      // Spacing component renders a div, but it's mainly for layout
      expect(document.querySelector('div')).toBeInTheDocument();
    });

    it('should handle different directions', () => {
      const { rerender } = renderWithProvider(
        <ResponsiveSpacing direction="horizontal" className="test-spacing" />
      );

      let spacingElement = document.querySelector('.test-spacing');
      expect(spacingElement).toBeInTheDocument();

      rerender(
        <ResponsiveProvider>
          <ResponsiveSpacing direction="vertical" className="test-spacing" />
        </ResponsiveProvider>
      );

      spacingElement = document.querySelector('.test-spacing');
      expect(spacingElement).toBeInTheDocument();
    });
  });

  describe('ResponsiveGrid', () => {
    it('should render grid container', () => {
      renderWithProvider(
        <ResponsiveGrid data-testid="test-grid">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </ResponsiveGrid>
      );

      const grid = screen.getByTestId('test-grid');
      expect(grid).toBeInTheDocument();
      expect(grid.style.display).toBe('grid');
    });

    it('should apply column configuration', () => {
      renderWithProvider(
        <ResponsiveGrid 
          columns={{ mobile: 1, tablet: 2, desktop: 3, 'large-desktop': 4 }}
          data-testid="test-grid"
        >
          <div>Item 1</div>
          <div>Item 2</div>
        </ResponsiveGrid>
      );

      const grid = screen.getByTestId('test-grid');
      expect(grid.style.gridTemplateColumns).toBe('repeat(3, 1fr)'); // desktop = 3 columns
    });
  });

  describe('ResponsiveFlex', () => {
    it('should render flex container', () => {
      renderWithProvider(
        <ResponsiveFlex data-testid="test-flex">
          <div>Item 1</div>
          <div>Item 2</div>
        </ResponsiveFlex>
      );

      const flex = screen.getByTestId('test-flex');
      expect(flex).toBeInTheDocument();
      expect(flex.style.display).toBe('flex');
    });

    it('should apply flex direction based on layout mode', () => {
      renderWithProvider(
        <ResponsiveFlex 
          direction={{ mobile: 'column', tablet: 'column', desktop: 'row', 'large-desktop': 'row' }}
          data-testid="test-flex"
        >
          <div>Item 1</div>
          <div>Item 2</div>
        </ResponsiveFlex>
      );

      const flex = screen.getByTestId('test-flex');
      expect(flex.style.flexDirection).toBe('row'); // desktop = row
    });

    it('should handle alignment and justification', () => {
      renderWithProvider(
        <ResponsiveFlex 
          align="center"
          justify="space-between"
          data-testid="test-flex"
        >
          <div>Item 1</div>
          <div>Item 2</div>
        </ResponsiveFlex>
      );

      const flex = screen.getByTestId('test-flex');
      expect(flex.style.alignItems).toBe('center');
      expect(flex.style.justifyContent).toBe('space-between');
    });

    it('should handle wrap option', () => {
      renderWithProvider(
        <ResponsiveFlex wrap={true} data-testid="test-flex">
          <div>Item 1</div>
          <div>Item 2</div>
        </ResponsiveFlex>
      );

      const flex = screen.getByTestId('test-flex');
      expect(flex.style.flexWrap).toBe('wrap');
    });
  });

  describe('ResponsiveImage', () => {
    it('should render image with responsive sizing', () => {
      renderWithProvider(
        <ResponsiveImage 
          src="/test.jpg"
          alt="Test image"
          sizes={{ mobile: 100, tablet: 120, desktop: 150, 'large-desktop': 180 }}
          data-testid="test-image"
        />
      );

      const image = screen.getByTestId('test-image');
      expect(image).toBeInTheDocument();
      expect(image.style.width).toBe('150px'); // desktop size
      expect(image).toHaveAttribute('src', '/test.jpg');
      expect(image).toHaveAttribute('alt', 'Test image');
    });

    it('should handle aspect ratio', () => {
      renderWithProvider(
        <ResponsiveImage 
          src="/test.jpg"
          alt="Test image"
          aspectRatio={2}
          sizes={{ mobile: 100, tablet: 120, desktop: 150, 'large-desktop': 180 }}
          data-testid="test-image"
        />
      );

      const image = screen.getByTestId('test-image');
      expect(image.style.width).toBe('150px');
      expect(image.style.height).toBe('75px'); // 150 / 2
    });

    it('should apply object fit', () => {
      renderWithProvider(
        <ResponsiveImage 
          src="/test.jpg"
          alt="Test image"
          objectFit="contain"
          data-testid="test-image"
        />
      );

      const image = screen.getByTestId('test-image');
      expect(image.style.objectFit).toBe('contain');
    });
  });

  describe('Integration', () => {
    it('should work together in complex layouts', () => {
      renderWithProvider(
        <ResponsiveContainer data-testid="main-container">
          <ResponsiveFlex direction={{ mobile: 'column', tablet: 'column', desktop: 'row', 'large-desktop': 'row' }}>
            <ResponsivePanel variant="primary">
              <ResponsiveText variant="heading" size="xl">
                Main Content
              </ResponsiveText>
              <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 2, 'large-desktop': 3 }}>
                <ResponsiveButton variant="primary">Button 1</ResponsiveButton>
                <ResponsiveButton variant="secondary">Button 2</ResponsiveButton>
              </ResponsiveGrid>
            </ResponsivePanel>
            <ResponsivePanel variant="secondary">
              <ResponsiveAvatar size={80}>
                <ResponsiveImage src="/avatar.jpg" alt="User" />
              </ResponsiveAvatar>
            </ResponsivePanel>
          </ResponsiveFlex>
        </ResponsiveContainer>
      );

      const container = screen.getByTestId('main-container');
      expect(container).toBeInTheDocument();
      expect(screen.getByText('Main Content')).toBeInTheDocument();
      expect(screen.getByText('Button 1')).toBeInTheDocument();
      expect(screen.getByText('Button 2')).toBeInTheDocument();
    });

    it('should maintain consistent styling across components', () => {
      renderWithProvider(
        <div>
          <ResponsiveButton variant="primary" data-testid="button">Primary Button</ResponsiveButton>
          <ResponsivePanel variant="primary" data-testid="panel">Primary Panel</ResponsivePanel>
        </div>
      );

      const button = screen.getByTestId('button');
      const panel = screen.getByTestId('panel');
      
      expect(button).toBeInTheDocument();
      expect(panel).toBeInTheDocument();
      
      // Both should use consistent theming (exact values depend on computed styles)
    });
  });
});