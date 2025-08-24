import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DesktopSidebar, DesktopSidebarProps } from '../DesktopSidebar';
import { ResponsiveProvider } from '../../contexts/ResponsiveContext';
import { QuizQuestion } from '../../data/quizQuestions';

// Mock the useViewport hook
vi.mock('../../hooks/useViewport', () => ({
  useViewport: vi.fn(() => ({
    width: 1200,
    height: 800,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLargeDesktop: false,
  })),
}));

// Mock quiz question for testing
const mockQuizQuestion: QuizQuestion = {
  id: 1,
  question: "What is the primary purpose of Planetary Chess?",
  options: [
    "Entertainment",
    "Education about systemic racism",
    "Chess training",
    "Social networking"
  ],
  correctAnswer: "Education about systemic racism",
  tauntCorrect: "Excellent! You understand the purpose!",
  tauntIncorrect: "Oh dear, you missed the point entirely."
};

// Default props for testing
const defaultProps: DesktopSidebarProps = {
  currentQuestion: mockQuizQuestion,
  isThinking: false,
  currentTaunt: "Welcome to Planetary Chess, you intellectual peasant.",
  isQuizVisible: true,
  isGameOver: false,
  questionNumber: 1,
  totalQuestions: 40,
  onQuizAnswer: vi.fn(),
  onNavigate: vi.fn(),
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ResponsiveProvider>
    {children}
  </ResponsiveProvider>
);

describe('DesktopSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering and Layout', () => {
    it('renders the sidebar with all main sections', () => {
      render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} />
        </TestWrapper>
      );

      // Check for main title
      expect(screen.getByText('PLANETARY CHESS')).toBeInTheDocument();
      
      // Check for AI taunt
      expect(screen.getByText(defaultProps.currentTaunt)).toBeInTheDocument();
      
      // Check for quiz question
      expect(screen.getByText(mockQuizQuestion.question)).toBeInTheDocument();
      
      // Check for question counter
      expect(screen.getByText('QUANTUM INQUIRY')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('OF')).toBeInTheDocument();
      expect(screen.getByText('40')).toBeInTheDocument();
      
      // Check for navigation button
      expect(screen.getByText('← Return to Base')).toBeInTheDocument();
    });

    it('renders Stewie avatar with correct styling', () => {
      render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} />
        </TestWrapper>
      );

      const avatar = screen.getByAltText('AI Stewie');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', '/assets/stewie.png');
    });

    it('displays quiz options with correct labels', () => {
      render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} />
        </TestWrapper>
      );

      mockQuizQuestion.options.forEach((option, index) => {
        expect(screen.getByText(option)).toBeInTheDocument();
        expect(screen.getByText(String.fromCharCode(65 + index))).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('does not render on mobile layout', () => {
      const { container } = render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} layoutMode="mobile" />
        </TestWrapper>
      );

      expect(container.firstChild).toBeNull();
    });

    it('does not render on tablet layout', () => {
      const { container } = render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} layoutMode="tablet" />
        </TestWrapper>
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders on desktop layout', () => {
      render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} layoutMode="desktop" />
        </TestWrapper>
      );

      expect(screen.getByText('PLANETARY CHESS')).toBeInTheDocument();
    });

    it('renders with larger dimensions on large desktop', () => {
      render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} layoutMode="large-desktop" />
        </TestWrapper>
      );

      // Component should render (we can't easily test exact dimensions without DOM measurements)
      expect(screen.getByText('PLANETARY CHESS')).toBeInTheDocument();
    });
  });

  describe('AI Thinking State', () => {
    it('displays thinking animation when AI is thinking', () => {
      render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} isThinking={true} />
        </TestWrapper>
      );

      expect(screen.getByText(/Processing neural pathways/)).toBeInTheDocument();
    });

    it('displays current taunt when AI is not thinking', () => {
      render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} isThinking={false} />
        </TestWrapper>
      );

      expect(screen.getByText(defaultProps.currentTaunt)).toBeInTheDocument();
    });

    it('applies glow animation to avatar when thinking', () => {
      render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} isThinking={true} />
        </TestWrapper>
      );

      const avatar = screen.getByAltText('AI Stewie');
      const avatarContainer = avatar.parentElement;
      
      // Check if the thinking pulse element is present
      const thinkingPulse = avatarContainer?.querySelector('[style*="thinkingPulse"]');
      expect(thinkingPulse).toBeInTheDocument();
    });
  });

  describe('Quiz Interaction', () => {
    it('calls onQuizAnswer when an option is clicked', () => {
      const mockOnQuizAnswer = vi.fn();
      
      render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} onQuizAnswer={mockOnQuizAnswer} />
        </TestWrapper>
      );

      const firstOption = screen.getByText(mockQuizQuestion.options[0]);
      fireEvent.click(firstOption);

      expect(mockOnQuizAnswer).toHaveBeenCalledWith(mockQuizQuestion.options[0]);
    });

    it('does not display quiz when isQuizVisible is false', () => {
      render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} isQuizVisible={false} />
        </TestWrapper>
      );

      expect(screen.queryByText(mockQuizQuestion.question)).not.toBeInTheDocument();
    });

    it('does not display quiz when game is over', () => {
      render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} isGameOver={true} />
        </TestWrapper>
      );

      expect(screen.queryByText(mockQuizQuestion.question)).not.toBeInTheDocument();
    });

    it('applies hover effects to quiz buttons', async () => {
      render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} />
        </TestWrapper>
      );

      const firstOption = screen.getByText(mockQuizQuestion.options[0]);
      const button = firstOption.closest('button');
      
      expect(button).toBeInTheDocument();
      
      // Test hover enter
      fireEvent.mouseEnter(button!);
      
      // Test hover leave
      fireEvent.mouseLeave(button!);
      
      // No errors should occur during hover interactions
    });
  });

  describe('Navigation', () => {
    it('calls onNavigate when return button is clicked', () => {
      const mockOnNavigate = vi.fn();
      
      render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} onNavigate={mockOnNavigate} />
        </TestWrapper>
      );

      const returnButton = screen.getByText('← Return to Base');
      fireEvent.click(returnButton);

      expect(mockOnNavigate).toHaveBeenCalledWith('/');
    });

    it('applies hover effects to navigation button', () => {
      render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} />
        </TestWrapper>
      );

      const returnButton = screen.getByText('← Return to Base');
      
      // Test hover interactions
      fireEvent.mouseEnter(returnButton);
      fireEvent.mouseLeave(returnButton);
      
      // No errors should occur during hover interactions
    });
  });

  describe('Question Counter', () => {
    it('displays correct question numbers', () => {
      render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} questionNumber={5} totalQuestions={40} />
        </TestWrapper>
      );

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('40')).toBeInTheDocument();
    });

    it('updates question counter dynamically', () => {
      const { rerender } = render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} questionNumber={1} totalQuestions={40} />
        </TestWrapper>
      );

      expect(screen.getByText('1')).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} questionNumber={10} totalQuestions={40} />
        </TestWrapper>
      );

      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper alt text for avatar image', () => {
      render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} />
        </TestWrapper>
      );

      const avatar = screen.getByAltText('AI Stewie');
      expect(avatar).toBeInTheDocument();
    });

    it('has clickable buttons with proper text content', () => {
      render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} />
        </TestWrapper>
      );

      // Quiz option buttons
      mockQuizQuestion.options.forEach((option) => {
        const button = screen.getByRole('button', { name: new RegExp(option) });
        expect(button).toBeInTheDocument();
      });

      // Navigation button
      const navButton = screen.getByRole('button', { name: /Return to Base/ });
      expect(navButton).toBeInTheDocument();
    });
  });

  describe('Styling and Animations', () => {
    it('includes required CSS animations', () => {
      render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} />
        </TestWrapper>
      );

      // Check if style element with animations is present
      const styleElements = document.querySelectorAll('style');
      const hasAnimations = Array.from(styleElements).some(style => 
        style.textContent?.includes('@keyframes thinkingPulse') &&
        style.textContent?.includes('@keyframes blink') &&
        style.textContent?.includes('@keyframes glow')
      );
      
      expect(hasAnimations).toBe(true);
    });

    it('applies correct background gradients', () => {
      render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} />
        </TestWrapper>
      );

      // The component should render without errors (detailed style testing would require DOM inspection)
      expect(screen.getByText('PLANETARY CHESS')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty quiz options gracefully', () => {
      const emptyQuizQuestion: QuizQuestion = {
        ...mockQuizQuestion,
        options: [],
      };

      render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} currentQuestion={emptyQuizQuestion} />
        </TestWrapper>
      );

      // Should render without crashing
      expect(screen.getByText(emptyQuizQuestion.question)).toBeInTheDocument();
    });

    it('handles very long taunt text', () => {
      const longTaunt = "This is a very long taunt message that should wrap properly within the container and not break the layout or cause any visual issues with the sidebar component design.";

      render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} currentTaunt={longTaunt} />
        </TestWrapper>
      );

      expect(screen.getByText(longTaunt)).toBeInTheDocument();
    });

    it('handles very long question text', () => {
      const longQuestion: QuizQuestion = {
        ...mockQuizQuestion,
        question: "This is an extremely long question that tests how the component handles text wrapping and layout when the question content exceeds the normal expected length for quiz questions in the Planetary Chess application?",
      };

      render(
        <TestWrapper>
          <DesktopSidebar {...defaultProps} currentQuestion={longQuestion} />
        </TestWrapper>
      );

      expect(screen.getByText(longQuestion.question)).toBeInTheDocument();
    });
  });
});