import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { EnhancedHoverButton } from '../EnhancedHoverButton';
import { ResponsiveProvider } from '../../contexts/ResponsiveContext';

// Mock the responsive context
const mockResponsiveContext = {
  viewportInfo: { width: 1200, height: 800, isMobile: false, isTablet: false, isDesktop: true, isLargeDesktop: false },
  layoutMode: 'desktop' as const,
  layoutConfig: {} as any,
  chessboardSize: 600,
  calculateDynamicSize: (size: number) => size * 1.5,
  isLayoutMode: (mode: string) => mode === 'desktop',
};

vi.mock('../../contexts/ResponsiveContext', async () => {
  const actual = await vi.importActual('../../contexts/ResponsiveContext');
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

describe('EnhancedHoverButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('should render children correctly', () => {
    renderWithProvider(
      <EnhancedHoverButton onClick={mockOnClick}>
        Test Button
      </EnhancedHoverButton>
    );

    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    renderWithProvider(
      <EnhancedHoverButton onClick={mockOnClick}>
        Test Button
      </EnhancedHoverButton>
    );

    fireEvent.click(screen.getByText('Test Button'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', () => {
    renderWithProvider(
      <EnhancedHoverButton onClick={mockOnClick} disabled>
        Test Button
      </EnhancedHoverButton>
    );

    fireEvent.click(screen.getByText('Test Button'));
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('should apply hover effects on mouse enter/leave', async () => {
    renderWithProvider(
      <EnhancedHoverButton onClick={mockOnClick} data-testid="hover-button">
        Test Button
      </EnhancedHoverButton>
    );

    const button = screen.getByTestId('hover-button');
    
    // Initial state
    expect(button).toHaveStyle('transform: translateY(0px) scale(1)');

    // Hover state
    fireEvent.mouseEnter(button);
    await waitFor(() => {
      expect(button).toHaveStyle('transform: translateY(-2px) scale(1.02)');
    });

    // Leave hover state
    fireEvent.mouseLeave(button);
    await waitFor(() => {
      expect(button).toHaveStyle('transform: translateY(0px) scale(1)');
    });
  });

  it('should apply pressed effect on mouse down/up', async () => {
    renderWithProvider(
      <EnhancedHoverButton onClick={mockOnClick} data-testid="press-button">
        Test Button
      </EnhancedHoverButton>
    );

    const button = screen.getByTestId('press-button');
    
    fireEvent.mouseDown(button);
    await waitFor(() => {
      expect(button).toHaveStyle('transform: translateY(-1px) scale(1.01)');
    });

    fireEvent.mouseUp(button);
    await waitFor(() => {
      expect(button).not.toHaveStyle('transform: translateY(-1px) scale(1.01)');
    });
  });

  it('should not apply hover effects when disabled', () => {
    renderWithProvider(
      <EnhancedHoverButton onClick={mockOnClick} disabled data-testid="disabled-button">
        Test Button
      </EnhancedHoverButton>
    );

    const button = screen.getByTestId('disabled-button');
    
    fireEvent.mouseEnter(button);
    expect(button).toHaveStyle('opacity: 0.5');
    expect(button).toHaveStyle('cursor: not-allowed');
  });

  it('should apply different effect intensities', () => {
    const { rerender } = renderWithProvider(
      <EnhancedHoverButton effectIntensity="subtle" data-testid="subtle-button">
        Subtle
      </EnhancedHoverButton>
    );

    let button = screen.getByTestId('subtle-button');
    expect(button).toHaveStyle('box-shadow: 0 0 10px rgba(0, 195, 255, 0.3)');

    rerender(
      <ResponsiveProvider>
        <EnhancedHoverButton effectIntensity="intense" data-testid="intense-button">
          Intense
        </EnhancedHoverButton>
      </ResponsiveProvider>
    );

    button = screen.getByTestId('intense-button');
    expect(button).toHaveStyle('box-shadow: 0 0 25px rgba(0, 195, 255, 1.0)');
  });

  it('should merge base styles with effect styles', () => {
    const baseStyle = {
      backgroundColor: 'red',
      padding: '10px',
    };

    renderWithProvider(
      <EnhancedHoverButton baseStyle={baseStyle} data-testid="styled-button">
        Styled Button
      </EnhancedHoverButton>
    );

    const button = screen.getByTestId('styled-button');
    expect(button).toHaveStyle('background-color: red');
    expect(button).toHaveStyle('padding: 10px');
  });

  it('should handle className prop', () => {
    renderWithProvider(
      <EnhancedHoverButton className="custom-class" data-testid="class-button">
        Class Button
      </EnhancedHoverButton>
    );

    const button = screen.getByTestId('class-button');
    expect(button).toHaveClass('custom-class');
  });

  it('should reset pressed state on mouse leave', async () => {
    renderWithProvider(
      <EnhancedHoverButton onClick={mockOnClick} data-testid="reset-button">
        Reset Button
      </EnhancedHoverButton>
    );

    const button = screen.getByTestId('reset-button');
    
    fireEvent.mouseDown(button);
    fireEvent.mouseLeave(button);
    
    await waitFor(() => {
      expect(button).not.toHaveStyle('transform: translateY(-1px) scale(1.01)');
    });
  });
});

describe('EnhancedHoverButton Mobile Behavior', () => {
  beforeEach(() => {
    // Mock mobile context
    mockResponsiveContext.layoutMode = 'mobile';
    mockResponsiveContext.viewportInfo.width = 400;
    mockResponsiveContext.isLayoutMode = (mode: string) => mode === 'mobile';
  });

  it('should not apply desktop effects on mobile', () => {
    renderWithProvider(
      <EnhancedHoverButton data-testid="mobile-button">
        Mobile Button
      </EnhancedHoverButton>
    );

    const button = screen.getByTestId('mobile-button');
    
    // Should not have desktop-specific styles
    expect(button).not.toHaveStyle('box-shadow: 0 0 15px rgba(0, 195, 255, 0.6)');
    
    fireEvent.mouseEnter(button);
    // Should still be clickable but without enhanced effects
    expect(button).toHaveStyle('cursor: pointer');
  });
});

describe('EnhancedHoverButton Accessibility', () => {
  it('should be keyboard accessible', () => {
    const mockOnClick = vi.fn();
    renderWithProvider(
      <EnhancedHoverButton onClick={mockOnClick} data-testid="keyboard-button">
        Keyboard Button
      </EnhancedHoverButton>
    );

    const button = screen.getByTestId('keyboard-button');
    
    // Should be focusable
    button.focus();
    expect(button).toHaveFocus();
    
    // Should respond to Enter key
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    // Note: onClick is triggered by the browser's default button behavior
  });

  it('should have proper disabled state for screen readers', () => {
    renderWithProvider(
      <EnhancedHoverButton disabled data-testid="disabled-a11y-button">
        Disabled Button
      </EnhancedHoverButton>
    );

    const button = screen.getByTestId('disabled-a11y-button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('disabled');
  });
});