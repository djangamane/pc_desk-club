import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { ResponsiveProvider } from '../../contexts/ResponsiveContext'
import { LayoutManager } from '../../components/LayoutManager'
import Game from '../../components/Game'
import { BrowserRouter } from 'react-router-dom'

// Mock window.matchMedia
const mockMatchMedia = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
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

describe('Responsive Layout Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Layout Switching', () => {
    it('should switch from mobile to desktop layout when viewport exceeds 1024px', async () => {
      // Start with mobile viewport
      mockMatchMedia(600)
      
      const { rerender } = render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      // Should show mobile layout initially
      await waitFor(() => {
        const container = screen.getByTestId('game-container')
        expect(container).toHaveClass('mobile-layout')
      })

      // Switch to desktop viewport
      act(() => {
        mockMatchMedia(1200)
        window.dispatchEvent(new Event('resize'))
      })

      rerender(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      // Should switch to desktop layout
      await waitFor(() => {
        const container = screen.getByTestId('game-container')
        expect(container).toHaveClass('desktop-layout')
      })
    })

    it('should maintain layout state during rapid viewport changes', async () => {
      mockMatchMedia(1200)
      
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      // Rapidly change viewport sizes
      const viewportSizes = [800, 1200, 600, 1400, 900, 1100]
      
      for (const size of viewportSizes) {
        act(() => {
          mockMatchMedia(size)
          window.dispatchEvent(new Event('resize'))
        })
      }

      // Should settle on final layout without errors
      await waitFor(() => {
        const container = screen.getByTestId('game-container')
        expect(container).toBeInTheDocument()
      })
    })

    it('should preserve game state during layout transitions', async () => {
      mockMatchMedia(600)
      
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      // Make a move in mobile layout
      const chessboard = screen.getByTestId('chessboard')
      expect(chessboard).toBeInTheDocument()

      // Switch to desktop layout
      act(() => {
        mockMatchMedia(1200)
        window.dispatchEvent(new Event('resize'))
      })

      // Game state should be preserved
      await waitFor(() => {
        const desktopChessboard = screen.getByTestId('chessboard')
        expect(desktopChessboard).toBeInTheDocument()
      })
    })
  })

  describe('Component Responsiveness', () => {
    it('should resize chessboard appropriately for different viewports', async () => {
      const testCases = [
        { width: 400, expectedSize: 'small' },
        { width: 800, expectedSize: 'medium' },
        { width: 1200, expectedSize: 'large' },
        { width: 1600, expectedSize: 'extra-large' }
      ]

      for (const { width, expectedSize } of testCases) {
        mockMatchMedia(width)
        
        render(
          <TestWrapper>
            <Game />
          </TestWrapper>
        )

        await waitFor(() => {
          const chessboard = screen.getByTestId('chessboard')
          expect(chessboard).toHaveAttribute('data-size', expectedSize)
        })
      }
    })

    it('should show/hide sidebar based on layout mode', async () => {
      // Mobile layout - no sidebar
      mockMatchMedia(600)
      
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      expect(screen.queryByTestId('desktop-sidebar')).not.toBeInTheDocument()

      // Desktop layout - sidebar visible
      act(() => {
        mockMatchMedia(1200)
        window.dispatchEvent(new Event('resize'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument()
      })
    })
  })

  describe('Performance During Layout Changes', () => {
    it('should complete layout transitions within performance budget', async () => {
      const startTime = performance.now()
      
      mockMatchMedia(600)
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      act(() => {
        mockMatchMedia(1200)
        window.dispatchEvent(new Event('resize'))
      })

      await waitFor(() => {
        const container = screen.getByTestId('game-container')
        expect(container).toHaveClass('desktop-layout')
      })

      const endTime = performance.now()
      const transitionTime = endTime - startTime

      // Layout transition should complete within 100ms
      expect(transitionTime).toBeLessThan(100)
    })
  })
})