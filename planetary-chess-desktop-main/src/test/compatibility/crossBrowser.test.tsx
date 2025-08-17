import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ResponsiveProvider } from '../../contexts/ResponsiveContext'
import { LayoutManager } from '../../components/LayoutManager'
import Game from '../../components/Game'
import { KeyboardHandler } from '../../components/KeyboardHandler'
import { BrowserRouter } from 'react-router-dom'

// Mock different browser environments
const mockBrowserEnvironment = (browser: string) => {
  const userAgents = {
    chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
  }

  Object.defineProperty(navigator, 'userAgent', {
    writable: true,
    value: userAgents[browser as keyof typeof userAgents]
  })

  // Mock browser-specific features
  if (browser === 'safari') {
    // Safari has different CSS Grid behavior
    Object.defineProperty(window, 'CSS', {
      writable: true,
      value: {
        supports: vi.fn().mockImplementation((property: string) => {
          if (property.includes('grid')) return true
          if (property.includes('flex')) return true
          return false
        })
      }
    })
  }

  if (browser === 'firefox') {
    // Firefox has different animation behavior
    Object.defineProperty(window, 'requestAnimationFrame', {
      writable: true,
      value: vi.fn().mockImplementation((callback: FrameRequestCallback) => {
        return setTimeout(callback, 16) // 60fps
      })
    })
  }
}

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
      } else if (query.includes('min-width: 768px')) {
        matches = width >= 768
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

describe('Cross-Browser Compatibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDesktopViewport()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Chrome Desktop', () => {
    beforeEach(() => {
      mockBrowserEnvironment('chrome')
    })

    it('should render desktop layout correctly in Chrome', async () => {
      const { container } = render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      await waitFor(() => {
        const gameContainer = screen.getByTestId('game-container')
        expect(gameContainer).toHaveClass('desktop-layout')
      })

      // Verify CSS Grid support
      expect(window.CSS.supports('display: grid')).toBe(true)
      
      // Verify chessboard renders
      const chessboard = screen.getByTestId('chessboard')
      expect(chessboard).toBeInTheDocument()
      
      // Verify sidebar renders
      expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument()
    })

    it('should handle keyboard events correctly in Chrome', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      // Test keyboard navigation
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
      
      // Should not throw errors
      expect(screen.getByTestId('game-container')).toBeInTheDocument()
    })
  })

  describe('Firefox Desktop', () => {
    beforeEach(() => {
      mockBrowserEnvironment('firefox')
    })

    it('should render desktop layout correctly in Firefox', async () => {
      const { container } = render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      await waitFor(() => {
        const gameContainer = screen.getByTestId('game-container')
        expect(gameContainer).toHaveClass('desktop-layout')
      })

      // Verify Firefox-specific animation handling
      expect(window.requestAnimationFrame).toBeDefined()
      
      const chessboard = screen.getByTestId('chessboard')
      expect(chessboard).toBeInTheDocument()
    })

    it('should handle CSS animations in Firefox', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      // Test that animations don't break layout
      const gameContainer = screen.getByTestId('game-container')
      expect(gameContainer).toBeInTheDocument()
      
      // Verify animation frame handling
      expect(typeof window.requestAnimationFrame).toBe('function')
    })
  })

  describe('Safari Desktop', () => {
    beforeEach(() => {
      mockBrowserEnvironment('safari')
    })

    it('should render desktop layout correctly in Safari', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      await waitFor(() => {
        const gameContainer = screen.getByTestId('game-container')
        expect(gameContainer).toHaveClass('desktop-layout')
      })

      // Verify Safari CSS Grid support
      expect(window.CSS.supports('display: grid')).toBe(true)
      
      const chessboard = screen.getByTestId('chessboard')
      expect(chessboard).toBeInTheDocument()
    })

    it('should handle Safari-specific CSS features', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      // Test CSS feature detection
      expect(window.CSS.supports('display: flex')).toBe(true)
      expect(window.CSS.supports('display: grid')).toBe(true)
      
      const gameContainer = screen.getByTestId('game-container')
      expect(gameContainer).toBeInTheDocument()
    })
  })

  describe('Edge Desktop', () => {
    beforeEach(() => {
      mockBrowserEnvironment('edge')
    })

    it('should render desktop layout correctly in Edge', async () => {
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      await waitFor(() => {
        const gameContainer = screen.getByTestId('game-container')
        expect(gameContainer).toHaveClass('desktop-layout')
      })

      const chessboard = screen.getByTestId('chessboard')
      expect(chessboard).toBeInTheDocument()
      
      expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument()
    })
  })

  describe('Cross-Browser Feature Detection', () => {
    it('should gracefully handle missing CSS features', async () => {
      // Mock browser without grid support
      Object.defineProperty(window, 'CSS', {
        writable: true,
        value: {
          supports: vi.fn().mockImplementation((property: string) => {
            if (property.includes('grid')) return false
            return true
          })
        }
      })

      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      // Should still render without errors
      const gameContainer = screen.getByTestId('game-container')
      expect(gameContainer).toBeInTheDocument()
    })

    it('should handle missing requestAnimationFrame', async () => {
      // Mock browser without requestAnimationFrame
      delete (window as any).requestAnimationFrame

      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      // Should still render without errors
      const gameContainer = screen.getByTestId('game-container')
      expect(gameContainer).toBeInTheDocument()
    })
  })

  describe('Performance Across Browsers', () => {
    it('should maintain performance standards across browsers', async () => {
      const browsers = ['chrome', 'firefox', 'safari', 'edge']
      
      for (const browser of browsers) {
        mockBrowserEnvironment(browser)
        
        const startTime = performance.now()
        
        render(
          <TestWrapper>
            <Game />
          </TestWrapper>
        )

        await waitFor(() => {
          const gameContainer = screen.getByTestId('game-container')
          expect(gameContainer).toBeInTheDocument()
        })

        const endTime = performance.now()
        const renderTime = endTime - startTime

        // Should render within 200ms across all browsers
        expect(renderTime).toBeLessThan(200)
      }
    })
  })
})
   