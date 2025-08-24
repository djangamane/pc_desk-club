import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResponsiveProvider } from '../../contexts/ResponsiveContext'
import { LayoutManager } from '../../components/LayoutManager'
import Game from '../../components/Game'
import { BrowserRouter } from 'react-router-dom'

// Mock lodash shuffle to make quiz questions deterministic
vi.mock('lodash', () => ({
  shuffle: (array: any[]) => [...array], // Return array as-is without shuffling
}))

// Mock quiz questions for consistent snapshots
vi.mock('../../data/quizQuestions', () => {
  // Create a consistent set of 41 questions for testing
  const baseQuestion = {
    question: "What theoretical framework does Planetary Chess use to analyze the psychological mechanisms of racism?",
    options: ["Critical Race Theory", "Color Confrontation Theory", "Postcolonial Theory", "Intersectionality"],
    correctAnswer: "Color Confrontation Theory",
    tauntCorrect: "Hmm, a lucky guess. Even a broken clock is right twice a day.",
    tauntIncorrect: "Wrong! Your intellectual capacity rivals that of a decorative houseplant."
  };
  
  // Generate 41 identical questions for consistent testing
  const questions = Array(41).fill(null).map((_, index) => ({
    ...baseQuestion,
    question: `${baseQuestion.question} (Question ${index + 1})`,
  }));
  
  return { quizQuestions: questions };
})

// Mock window dimensions
const mockViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => {
      const width = window.innerWidth
      let matches = false
      
      if (query.includes('min-width: 1024px')) {
        matches = width >= 1024
      } else if (query.includes('min-width: 768px')) {
        matches = width >= 768
      } else if (query.includes('max-width: 767px')) {
        matches = width <= 767
      }
      
      return {
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }
    }),
  })
}

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ResponsiveProvider>
      <LayoutManager>
        {children}
      </LayoutManager>
    </ResponsiveProvider>
  </BrowserRouter>
)

describe('Visual Regression Tests - Screen Sizes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Mobile Viewports', () => {
    const mobileViewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'Samsung Galaxy S21', width: 360, height: 800 },
    ]

    mobileViewports.forEach(({ name, width, height }) => {
      it(`should render correctly on ${name} (${width}x${height})`, async () => {
        mockViewport(width, height)
        
        const { container } = render(
          <TestWrapper>
            <Game />
          </TestWrapper>
        )

        // Verify mobile layout is applied
        const gameContainer = screen.getByTestId('game-container')
        expect(gameContainer).toHaveClass('mobile-layout')
        
        // Verify chessboard size is appropriate for mobile
        const chessboard = screen.getByTestId('chessboard')
        const chessboardRect = chessboard.getBoundingClientRect()
        expect(chessboardRect.width).toBeLessThanOrEqual(380)
        
        // Verify no desktop sidebar
        expect(screen.queryByTestId('desktop-sidebar')).not.toBeInTheDocument()
        
        // Take snapshot for visual regression
        expect(container.firstChild).toMatchSnapshot(`mobile-${name.toLowerCase().replace(/\s+/g, '-')}-layout`)
      })
    })
  })

  describe('Tablet Viewports', () => {
    const tabletViewports = [
      { name: 'iPad', width: 768, height: 1024 },
      { name: 'iPad Pro', width: 1024, height: 1366 },
      { name: 'Surface Pro', width: 912, height: 1368 },
    ]

    tabletViewports.forEach(({ name, width, height }) => {
      it(`should render correctly on ${name} (${width}x${height})`, async () => {
        mockViewport(width, height)
        
        const { container } = render(
          <TestWrapper>
            <Game />
          </TestWrapper>
        )

        const gameContainer = screen.getByTestId('game-container')
        
        if (width >= 1024) {
          // Should use desktop layout for larger tablets
          expect(gameContainer).toHaveClass('desktop-layout')
          expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument()
        } else {
          // Should use mobile layout for smaller tablets
          expect(gameContainer).toHaveClass('mobile-layout')
        }
        
        // Verify chessboard size scales appropriately
        const chessboard = screen.getByTestId('chessboard')
        const chessboardRect = chessboard.getBoundingClientRect()
        expect(chessboardRect.width).toBeGreaterThan(380)
        expect(chessboardRect.width).toBeLessThanOrEqual(600)
        
        expect(container.firstChild).toMatchSnapshot(`tablet-${name.toLowerCase().replace(/\s+/g, '-')}-layout`)
      })
    })
  })

  describe('Desktop Viewports', () => {
    const desktopViewports = [
      { name: 'Laptop', width: 1366, height: 768 },
      { name: 'Desktop 1080p', width: 1920, height: 1080 },
      { name: 'Desktop 1440p', width: 2560, height: 1440 },
      { name: 'Desktop 4K', width: 3840, height: 2160 },
      { name: 'Ultrawide', width: 3440, height: 1440 },
    ]

    desktopViewports.forEach(({ name, width, height }) => {
      it(`should render correctly on ${name} (${width}x${height})`, async () => {
        mockViewport(width, height)
        
        const { container } = render(
          <TestWrapper>
            <Game />
          </TestWrapper>
        )

        // Verify desktop layout is applied
        const gameContainer = screen.getByTestId('game-container')
        expect(gameContainer).toHaveClass('desktop-layout')
        
        // Verify desktop sidebar is present
        expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument()
        
        // Verify chessboard size scales for desktop
        const chessboard = screen.getByTestId('chessboard')
        const chessboardRect = chessboard.getBoundingClientRect()
        expect(chessboardRect.width).toBeGreaterThan(500)
        
        // For very large screens, ensure maximum size constraints
        if (width >= 2560) {
          expect(chessboardRect.width).toBeLessThanOrEqual(900)
        }
        
        // Verify horizontal layout structure
        const chessboardContainer = screen.getByTestId('chessboard-container')
        const sidebar = screen.getByTestId('desktop-sidebar')
        
        const chessboardContainerRect = chessboardContainer.getBoundingClientRect()
        const sidebarRect = sidebar.getBoundingClientRect()
        
        // Chessboard should be on the left, sidebar on the right
        expect(chessboardContainerRect.left).toBeLessThan(sidebarRect.left)
        
        expect(container.firstChild).toMatchSnapshot(`desktop-${name.toLowerCase().replace(/\s+/g, '-')}-layout`)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle very narrow viewports gracefully', async () => {
      mockViewport(320, 568) // Very narrow mobile
      
      const { container } = render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      const gameContainer = screen.getByTestId('game-container')
      expect(gameContainer).toHaveClass('mobile-layout')
      
      // Should not break layout
      expect(container.firstChild).toMatchSnapshot('narrow-viewport-layout')
    })

    it('should handle very wide viewports gracefully', async () => {
      mockViewport(5120, 1440) // Ultra-wide monitor
      
      const { container } = render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      const gameContainer = screen.getByTestId('game-container')
      expect(gameContainer).toHaveClass('desktop-layout')
      
      // Should maintain maximum width constraints
      const chessboard = screen.getByTestId('chessboard')
      const chessboardRect = chessboard.getBoundingClientRect()
      expect(chessboardRect.width).toBeLessThanOrEqual(900)
      
      expect(container.firstChild).toMatchSnapshot('ultra-wide-viewport-layout')
    })

    it('should handle square viewports appropriately', async () => {
      mockViewport(1024, 1024) // Square viewport
      
      const { container } = render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      const gameContainer = screen.getByTestId('game-container')
      expect(gameContainer).toHaveClass('desktop-layout')
      
      expect(container.firstChild).toMatchSnapshot('square-viewport-layout')
    })
  })

  describe('Aspect Ratio Handling', () => {
    const aspectRatios = [
      { name: '16:9', width: 1920, height: 1080 },
      { name: '16:10', width: 1920, height: 1200 },
      { name: '21:9', width: 2560, height: 1080 },
      { name: '4:3', width: 1024, height: 768 },
    ]

    aspectRatios.forEach(({ name, width, height }) => {
      it(`should handle ${name} aspect ratio correctly`, async () => {
        mockViewport(width, height)
        
        const { container } = render(
          <TestWrapper>
            <Game />
          </TestWrapper>
        )

        const gameContainer = screen.getByTestId('game-container')
        expect(gameContainer).toBeInTheDocument()
        
        // Verify layout adapts to aspect ratio
        const chessboard = screen.getByTestId('chessboard')
        const chessboardRect = chessboard.getBoundingClientRect()
        
        // Chessboard should maintain square aspect ratio
        expect(Math.abs(chessboardRect.width - chessboardRect.height)).toBeLessThan(5)
        
        expect(container.firstChild).toMatchSnapshot(`aspect-ratio-${name.replace(':', '-')}-layout`)
      })
    })
  })
})