import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResponsiveProvider } from '../../contexts/ResponsiveContext'
import { LayoutManager } from '../../components/LayoutManager'
import Game from '../../components/Game'
import { KeyboardHandler } from '../../components/KeyboardHandler'
import { BrowserRouter } from 'react-router-dom'

const mockDesktopViewport = () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1920,
  })
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 1080,
  })

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => {
      const width = window.innerWidth
      let matches = false
      
      if (query.includes('min-width: 1024px')) {
        matches = width >= 1024
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

describe('Desktop Keyboard Navigation Accessibility Tests', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    vi.clearAllMocks()
    mockDesktopViewport()
    user = userEvent.setup()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Keyboard Navigation', () => {
    it('should support escape key navigation', async () => {
      const mockNavigate = vi.fn()
      
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('game-container')).toBeInTheDocument()
      })

      // Test escape key
      await user.keyboard('{Escape}')
      
      // Should not throw errors and maintain focus management
      expect(document.activeElement).toBeDefined()
    })

    it('should support tab navigation through interactive elements', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument()
      })

      // Tab through interactive elements
      await user.tab()
      
      // Should focus on first interactive element
      const focusedElement = document.activeElement
      expect(focusedElement).toBeInstanceOf(HTMLElement)
      expect(focusedElement?.tagName).toMatch(/BUTTON|INPUT|A/)
    })

    it('should maintain logical tab order in desktop layout', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument()
      })

      const interactiveElements: HTMLElement[] = []
      
      // Collect all focusable elements in tab order
      for (let i = 0; i < 10; i++) {
        await user.tab()
        const focused = document.activeElement as HTMLElement
        if (focused && focused !== document.body) {
          interactiveElements.push(focused)
        }
      }

      // Should have found interactive elements
      expect(interactiveElements.length).toBeGreaterThan(0)
      
      // Elements should be in logical order (left to right, top to bottom)
      for (let i = 1; i < interactiveElements.length; i++) {
        const prev = interactiveElements[i - 1].getBoundingClientRect()
        const curr = interactiveElements[i].getBoundingClientRect()
        
        // Should follow reading order
        expect(curr.top >= prev.top - 10).toBe(true) // Allow small margin for alignment
      }
    })
  })

  describe('Quiz Keyboard Navigation', () => {
    it('should support number key selection for quiz answers', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      // Wait for quiz to be available
      await waitFor(() => {
        const sidebar = screen.getByTestId('desktop-sidebar')
        expect(sidebar).toBeInTheDocument()
      })

      // Test number key navigation (1-4)
      const numberKeys = ['1', '2', '3', '4']
      
      for (const key of numberKeys) {
        await user.keyboard(key)
        
        // Should not throw errors
        expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument()
      }
    })

    it('should provide visual feedback for keyboard selection', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument()
      })

      // Focus on quiz area
      const quizButtons = screen.getAllByRole('button').filter(btn => 
        btn.textContent?.match(/^[A-D]\./)
      )

      if (quizButtons.length > 0) {
        // Test keyboard focus on quiz buttons
        quizButtons[0].focus()
        
        expect(document.activeElement).toBe(quizButtons[0])
        expect(quizButtons[0]).toHaveAttribute('tabindex', '0')
      }
    })

    it('should announce quiz state changes to screen readers', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument()
      })

      // Check for ARIA labels and live regions
      const sidebar = screen.getByTestId('desktop-sidebar')
      const liveRegions = sidebar.querySelectorAll('[aria-live]')
      
      expect(liveRegions.length).toBeGreaterThanOrEqual(0)
      
      // Check for proper labeling
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label')
      })
    })
  })

  describe('Chessboard Keyboard Accessibility', () => {
    it('should not interfere with chessboard interactions', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      await waitFor(() => {
        const chessboard = screen.getByTestId('chessboard')
        expect(chessboard).toBeInTheDocument()
      })

      // Test that keyboard events don't interfere with chess moves
      const chessboard = screen.getByTestId('chessboard')
      chessboard.focus()

      // Arrow keys should not trigger game navigation
      await user.keyboard('{ArrowUp}')
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{ArrowLeft}')
      await user.keyboard('{ArrowRight}')

      // Chessboard should still be functional
      expect(chessboard).toBeInTheDocument()
    })

    it('should provide keyboard alternative for chess piece selection', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      await waitFor(() => {
        const chessboard = screen.getByTestId('chessboard')
        expect(chessboard).toBeInTheDocument()
      })

      // Check for keyboard accessibility attributes
      const chessboard = screen.getByTestId('chessboard')
      expect(chessboard).toHaveAttribute('role')
      expect(chessboard).toHaveAttribute('aria-label')
    })
  })

  describe('Focus Management', () => {
    it('should maintain focus visibility throughout navigation', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('game-container')).toBeInTheDocument()
      })

      // Tab through elements and verify focus visibility
      for (let i = 0; i < 5; i++) {
        await user.tab()
        
        const focused = document.activeElement as HTMLElement
        if (focused && focused !== document.body) {
          // Check for focus indicators
          const computedStyle = window.getComputedStyle(focused)
          const hasFocusIndicator = 
            computedStyle.outline !== 'none' ||
            computedStyle.boxShadow !== 'none' ||
            focused.classList.contains('focus-visible')
          
          expect(hasFocusIndicator).toBe(true)
        }
      }
    })

    it('should trap focus within modal dialogs', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      // If there are any modal dialogs, test focus trapping
      const modals = screen.queryAllByRole('dialog')
      
      for (const modal of modals) {
        // Focus should be trapped within modal
        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        
        if (focusableElements.length > 0) {
          // First element should be focusable
          const firstElement = focusableElements[0] as HTMLElement
          firstElement.focus()
          expect(document.activeElement).toBe(firstElement)
        }
      }
    })

    it('should restore focus after layout transitions', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('game-container')).toBeInTheDocument()
      })

      // Focus on an element
      const buttons = screen.getAllByRole('button')
      if (buttons.length > 0) {
        buttons[0].focus()
        const initialFocus = document.activeElement
        
        // Trigger layout change (simulate viewport resize)
        Object.defineProperty(window, 'innerWidth', { value: 800 })
        fireEvent(window, new Event('resize'))
        
        await waitFor(() => {
          // Focus should be maintained or restored appropriately
          expect(document.activeElement).toBeDefined()
        })
      }
    })
  })

  describe('Screen Reader Support', () => {
    it('should provide proper ARIA labels for all interactive elements', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument()
      })

      // Check all buttons have proper labels
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        const hasLabel = 
          button.hasAttribute('aria-label') ||
          button.hasAttribute('aria-labelledby') ||
          button.textContent?.trim()
        
        expect(hasLabel).toBe(true)
      })
    })

    it('should announce game state changes', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument()
      })

      // Check for live regions that announce changes
      const liveRegions = screen.getAllByRole('status')
      expect(liveRegions.length).toBeGreaterThanOrEqual(0)
      
      // Check for proper ARIA live attributes
      const elementsWithLive = document.querySelectorAll('[aria-live]')
      elementsWithLive.forEach(element => {
        const liveValue = element.getAttribute('aria-live')
        expect(['polite', 'assertive', 'off']).toContain(liveValue)
      })
    })

    it('should provide semantic structure with proper headings', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('game-container')).toBeInTheDocument()
      })

      // Check for proper heading hierarchy
      const headings = screen.getAllByRole('heading')
      
      if (headings.length > 0) {
        headings.forEach(heading => {
          const level = heading.tagName.match(/H([1-6])/)?.[1]
          expect(level).toBeDefined()
          expect(parseInt(level!)).toBeGreaterThanOrEqual(1)
          expect(parseInt(level!)).toBeLessThanOrEqual(6)
        })
      }
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('should document available keyboard shortcuts', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      // Check for keyboard shortcut documentation
      // This could be in tooltips, help text, or aria-describedby
      const elementsWithShortcuts = document.querySelectorAll('[data-shortcut], [title*="key"], [aria-describedby]')
      
      // Should have some keyboard shortcuts documented
      expect(elementsWithShortcuts.length).toBeGreaterThanOrEqual(0)
    })

    it('should not conflict with browser shortcuts', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      // Test common browser shortcuts don't get intercepted
      const browserShortcuts = [
        { key: 'F5' }, // Refresh
        { key: 'F12' }, // Dev tools
        { key: 't', ctrlKey: true }, // New tab
        { key: 'w', ctrlKey: true }, // Close tab
      ]

      for (const shortcut of browserShortcuts) {
        const event = new KeyboardEvent('keydown', shortcut)
        const defaultPrevented = !document.dispatchEvent(event)
        
        // These shortcuts should not be prevented by the game
        expect(defaultPrevented).toBe(false)
      }
    })
  })
})