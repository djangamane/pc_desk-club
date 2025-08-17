import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ResponsiveQuiz, ResponsiveQuizProps } from '../ResponsiveQuiz';
import { QuizQuestion } from '../../data/quizQuestions';

// Mock the responsive context
vi.mock('../../contexts/ResponsiveContext', () => ({
  useResponsive: vi.fn(() => ({
    layoutMode: 'desktop',
    chessboardSize: 600,
    calculateDynamicSize: (size: number) => Math.min(size, 800),
    isLayoutMode: (mode: string) => mode === 'desktop',
    viewportInfo: {
      width: 1200,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isLargeDesktop: false,
    }
  }))
}));

// Mock the responsive styled components
vi.mock('../ResponsiveStyledComponents', () => ({
  ResponsiveButton: ({ children, onClick, style, disabled, ...props }: any) => (
    <button onClick={onClick} style={style} disabled={disabled} {...props}>
      {children}
    </button>
  ),
  ResponsivePanel: ({ children, style, ...props }: any) => (
    <div style={style} {...props}>
      {children}
    </div>
  ),
  ResponsiveText: ({ children, style, as: Component = 'div', ...props }: any) => (
    <Component style={style} {...props}>
      {children}
    </Component>
  ),
  ResponsiveFlex: ({ children, style, ...props }: any) => (
    <div style={{ display: 'flex', flexDirection: 'column', ...style }} {...props}>
      {children}
    </div>
  ),
}));

// Mock quiz question for testing
const mockQuestion: QuizQuestion = {
  id: 1,
  question: "What is the primary purpose of Planetary Chess?",
  options: [
    "Entertainment",
    "Education about systemic racism",
    "Chess improvement",
    "Social networking"
  ],
  correctAnswer: "Education about systemic racism",
  tauntCorrect: "Excellent! You understand the purpose.",
  tauntIncorrect: "Oh dear, you missed the point."
};

// Default props for testing
const defaultProps: ResponsiveQuizProps = {
  currentQuestion: mockQuestion,
  isVisible: true,
  isGameOver: false,
  questionNumber: 1,
  totalQuestions: 10,
  onQuizAnswer: vi.fn(),
  keyboardEnabled: true,
  animationDuration: 100, // Shorter for tests
};

describe('ResponsiveQuiz Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders quiz question and options when visible', () => {
      render(<ResponsiveQuiz {...defaultProps} />);
      
      expect(screen.getByText(mockQuestion.question)).toBeInTheDocument();
      mockQuestion.options.forEach(option => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
    });

    test('does not render when not visible', () => {
      render(<ResponsiveQuiz {...defaultProps} isVisible={false} />);
      
      expect(screen.queryByText(mockQuestion.question)).not.toBeInTheDocument();
    });

    test('does not render when game is over', () => {
      render(<ResponsiveQuiz {...defaultProps} isGameOver={true} />);
      
      expect(screen.queryByText(mockQuestion.question)).not.toBeInTheDocument();
    });

    test('displays question progress indicator', () => {
      render(<ResponsiveQuiz {...defaultProps} questionNumber={3} totalQuestions={10} />);
      
      expect(screen.getByText('QUANTUM INQUIRY 3 OF 10')).toBeInTheDocument();
    });

    test('renders with correct test id', () => {
      render(<ResponsiveQuiz {...defaultProps} data-testid="custom-quiz" />);
      
      expect(screen.getByTestId('custom-quiz')).toBeInTheDocument();
    });
  });

  describe('Answer Selection', () => {
    test('calls onQuizAnswer when answer button is clicked', async () => {
      const mockOnQuizAnswer = vi.fn();
      render(<ResponsiveQuiz {...defaultProps} onQuizAnswer={mockOnQuizAnswer} />);
      
      const firstOption = screen.getByText(mockQuestion.options[0]);
      fireEvent.click(firstOption);
      
      await waitFor(() => {
        expect(mockOnQuizAnswer).toHaveBeenCalledWith(mockQuestion.options[0]);
      });
    });

    test('shows visual feedback when answer is selected', async () => {
      render(<ResponsiveQuiz {...defaultProps} />);
      
      const firstOption = screen.getByTestId('quiz-answer-0');
      fireEvent.click(firstOption);
      
      // Should show loading spinner
      await waitFor(() => {
        expect(firstOption.querySelector('[style*="animation: spin"]')).toBeInTheDocument();
      });
    });

    test('prevents multiple answer selections', async () => {
      const mockOnQuizAnswer = vi.fn();
      render(<ResponsiveQuiz {...defaultProps} onQuizAnswer={mockOnQuizAnswer} />);
      
      const firstOption = screen.getByTestId('quiz-answer-0');
      const secondOption = screen.getByTestId('quiz-answer-1');
      
      fireEvent.click(firstOption);
      fireEvent.click(secondOption);
      
      await waitFor(() => {
        expect(mockOnQuizAnswer).toHaveBeenCalledTimes(1);
        expect(mockOnQuizAnswer).toHaveBeenCalledWith(mockQuestion.options[0]);
      });
    });
  });

  describe('Keyboard Navigation', () => {
    test('selects answer with number keys 1-4', async () => {
      const mockOnQuizAnswer = vi.fn();
      render(<ResponsiveQuiz {...defaultProps} onQuizAnswer={mockOnQuizAnswer} />);
      
      fireEvent.keyDown(window, { key: '2' });
      
      await waitFor(() => {
        expect(mockOnQuizAnswer).toHaveBeenCalledWith(mockQuestion.options[1]);
      });
    });

    test('selects answer with letter keys A-D', async () => {
      const mockOnQuizAnswer = vi.fn();
      render(<ResponsiveQuiz {...defaultProps} onQuizAnswer={mockOnQuizAnswer} />);
      
      fireEvent.keyDown(window, { key: 'c' });
      
      await waitFor(() => {
        expect(mockOnQuizAnswer).toHaveBeenCalledWith(mockQuestion.options[2]);
      });
    });

    test('disables keyboard navigation when keyboardEnabled is false', async () => {
      const mockOnQuizAnswer = vi.fn();
      render(<ResponsiveQuiz {...defaultProps} onQuizAnswer={mockOnQuizAnswer} keyboardEnabled={false} />);
      
      fireEvent.keyDown(window, { key: '1' });
      
      await waitFor(() => {
        expect(mockOnQuizAnswer).not.toHaveBeenCalled();
      });
    });
  });

  describe('Progress Indicator', () => {
    test('displays correct progress percentage', () => {
      render(<ResponsiveQuiz {...defaultProps} questionNumber={3} totalQuestions={10} />);
      
      const progressBar = screen.getByTestId('responsive-quiz').querySelector('[style*="width: 30%"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Answer Button Styling', () => {
    test('displays letter badges correctly', () => {
      render(<ResponsiveQuiz {...defaultProps} />);
      
      const buttons = screen.getAllByTestId(/quiz-answer-\d/);
      
      expect(buttons[0]).toHaveTextContent('A');
      expect(buttons[1]).toHaveTextContent('B');
      expect(buttons[2]).toHaveTextContent('C');
      expect(buttons[3]).toHaveTextContent('D');
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels and roles', () => {
      render(<ResponsiveQuiz {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);
      
      buttons.forEach((button, index) => {
        expect(button).toHaveTextContent(mockQuestion.options[index]);
      });
    });

    test('provides visual feedback for screen readers', () => {
      render(<ResponsiveQuiz {...defaultProps} />);
      
      const progressText = screen.getByText('QUANTUM INQUIRY 1 OF 10');
      expect(progressText).toBeInTheDocument();
      
      const questionText = screen.getByText(mockQuestion.question);
      expect(questionText).toBeInTheDocument();
    });
  });
});