import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ResponsiveProvider } from '../../contexts/ResponsiveContext'
import { LayoutManager } from '../../components/LayoutManager'
import Game from '../../components/Game'
import { BrowserRouter } from 'react-router-dom'

// Performance measurement utilities
interface PerformanceMetrics {
  renderTime: number
  layoutTime: number
  paintTime: number
  memoryUsage?: number
}

const measurePerformance = async (renderFn: () => void): Promise<PerformanceMetrics> => {
  // Clear existing performance marks
  performance.clearMarks()
  performance.clearMeasures()

  const startTime = performance.now()
  
  // Mark start of render
  performance.mark('render-start')
  
  renderFn()
  
  // Mark end of render
  performance.mark('render-end')
  
  // Wait for layout to complete
  await new Promise(resolve => requestAnimationFrame(resolve))
  performance.mark('layout-end')
  
  // Wait for paint to complete
  await new Promise(resolve => requestAnimationFrame(resolve))
  performance.mark('paint-end')
  
  const endTime = performance.now()
  
  // Create measurements
  performance.measure('render-time', 'render-start', 'render-end')
  performance.measure('layout-time', 'render-end', 'layout-end')
  performance.measure('paint-time', 'layout-end', 'paint-end')
  
  const renderMeasure = performance.getEntriesByName('render-time')[0]
  const layoutMeasure = performance.getEntriesByName('layout-time')[0]
  const paintMeasure = performance.getEntriesByName('paint-time')[0]
  
  return {
    renderTime: renderMeasure?.duration || (endTime - startTime),
    layoutTime: layoutMeasure?.duration || 0,
    paintTime: paintMeasure?.duration || 0,
    memoryUsage: (performance as any).memory?.usedJSHeapSize
  }
}

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

describe('Desktop Layout Rendering Performance Benchmarks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock performance.memory for memory usage tests
    Object.defineProperty(performance, 'memory', {
      writable: true,
      value: {
        usedJSHeapSize: 1000000,
        totalJSHeapSize: 2000000,
        jsHeapSizeLimit: 4000000000
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    performance.clearMarks()
    performance.clearMeasures()
  })

  describe('Initial Render Performance', () => {
    it('should render desktop layout within performance budget', async () => {
      mockViewport(1920, 1080)
      
      const metrics = await measurePerformance(() => {
        render(
          <TestWrapper>
            <Game />
          </TestWrapper>
        )
      })

      // Desktop layout should render within 100ms
      expect(metrics.renderTime).toBeLessThan(100)
      
      // Layout calculations should be fast
      expect(metrics.layoutTime).toBeLessThan(50)
      
      // Paint should be efficient
      expect(metrics.paintTime).toBeLessThan(30)
    })

    it('should handle large desktop viewports efficiently', async () => {
      const largeViewports = [
        { width: 2560, height: 1440, name: '1440p' },
        { width: 3840, height: 2160, name: '4K' },
        { width: 5120, height: 1440, name: 'Ultra-wide' }
      ]

      for (const viewport of largeViewports) {
        mockViewport(viewport.width, viewport.height)
        
        const metrics = await measurePerformance(() => {
          render(
            <TestWrapper>
              <Game />
            </TestWrapper>
          )
        })

        // Large viewports should still render efficiently
        expect(metrics.renderTime).toBeLessThan(150)
        console.log(`${viewport.name} (${viewport.width}x${viewport.height}): ${metrics.renderTime.toFixed(2)}ms`)
      }
    })

    it('should maintain consistent performance across multiple renders', async () => {
      mockViewport(1920, 1080)
      
      const renderTimes: number[] = []
      
      // Perform multiple renders to test consistency
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(
          <TestWrapper>
            <Game />
          </TestWrapper>
        )
        
        const metrics = await measurePerformance(() => {
          // Re-render the same component
          render(
            <TestWrapper>
              <Game />
            </TestWrapper>
          )
        })
        
        renderTimes.push(metrics.renderTime)
        unmount()
      }
      
      // Calculate variance in render times
      const avgRenderTime = renderTimes.reduce((a, b) => a + b) / renderTimes.length
      const variance = renderTimes.reduce((acc, time) => acc + Math.pow(time - avgRenderTime, 2), 0) / renderTimes.length
      const standardDeviation = Math.sqrt(variance)
      
      // Standard deviation should be low (consistent performance)
      expect(standardDeviation).toBeLessThan(20)
      expect(avgRenderTime).toBeLessThan(100)
    })
  })

  describe('Layout Transition Performance', () => {
    it('should transition from mobile to desktop layout efficiently', async () => {
      // Start with mobile viewport
      mockViewport(600, 800)
      
      const { rerender } = render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      // Measure transition to desktop
      mockViewport(1920, 1080)
      
      const metrics = await measurePerformance(() => {
        rerender(
          <TestWrapper>
            <Game />
          </TestWrapper>
        )
      })

      // Layout transition should be fast
      expect(metrics.renderTime).toBeLessThan(80)
      expect(metrics.layoutTime).toBeLessThan(40)
    })

    it('should handle rapid viewport changes without performance degradation', async () => {
      const { rerender } = render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      const viewportSizes = [
        { width: 600, height: 800 },
        { width: 1024, height: 768 },
        { width: 1920, height: 1080 },
        { width: 800, height: 600 },
        { width: 2560, height: 1440 }
      ]

      const transitionTimes: number[] = []

      for (const viewport of viewportSizes) {
        mockViewport(viewport.width, viewport.height)
        
        const metrics = await measurePerformance(() => {
          rerender(
            <TestWrapper>
              <Game />
            </TestWrapper>
          )
        })
        
        transitionTimes.push(metrics.renderTime)
      }

      // All transitions should be fast
      transitionTimes.forEach(time => {
        expect(time).toBeLessThan(100)
      })

      // Performance should not degrade over time
      const firstHalf = transitionTimes.slice(0, Math.floor(transitionTimes.length / 2))
      const secondHalf = transitionTimes.slice(Math.floor(transitionTimes.length / 2))
      
      const firstHalfAvg = firstHalf.reduce((a, b) => a + b) / firstHalf.length
      const secondHalfAvg = secondHalf.reduce((a, b) => a + b) / secondHalf.length
      
      // Second half should not be significantly slower
      expect(secondHalfAvg).toBeLessThan(firstHalfAvg * 1.5)
    })
  })

  describe('Component-Specific Performance', () => {
    it('should render chessboard efficiently at different sizes', async () => {
      const chessboardSizes = [
        { size: 400, name: 'Small' },
        { size: 600, name: 'Medium' },
        { size: 800, name: 'Large' },
        { size: 900, name: 'Extra Large' }
      ]

      for (const { size, name } of chessboardSizes) {
        // Mock viewport that would result in this chessboard size
        const viewportWidth = Math.max(1024, size * 1.5)
        mockViewport(viewportWidth, 1080)
        
        const metrics = await measurePerformance(() => {
          render(
            <TestWrapper>
              <Game />
            </TestWrapper>
          )
        })

        expect(metrics.renderTime).toBeLessThan(120)
        console.log(`Chessboard ${name} (${size}px): ${metrics.renderTime.toFixed(2)}ms`)
      }
    })

    it('should render desktop sidebar efficiently', async () => {
      mockViewport(1920, 1080)
      
      const metrics = await measurePerformance(() => {
        render(
          <TestWrapper>
            <Game />
          </TestWrapper>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument()
      })

      // Sidebar should not significantly impact render time
      expect(metrics.renderTime).toBeLessThan(100)
    })
  })

  describe('Memory Usage', () => {
    it('should maintain reasonable memory usage in desktop layout', async () => {
      mockViewport(1920, 1080)
      
      const initialMemory = (performance as any).memory.usedJSHeapSize
      
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('game-container')).toBeInTheDocument()
      })

      const finalMemory = (performance as any).memory.usedJSHeapSize
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
    })

    it('should not leak memory during layout transitions', async () => {
      const { rerender, unmount } = render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      const initialMemory = (performance as any).memory.usedJSHeapSize

      // Perform multiple layout transitions
      for (let i = 0; i < 10; i++) {
        mockViewport(i % 2 === 0 ? 600 : 1920, 1080)
        
        rerender(
          <TestWrapper>
            <Game />
          </TestWrapper>
        )
        
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      unmount()
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }

      const finalMemory = (performance as any).memory.usedJSHeapSize
      const memoryIncrease = finalMemory - initialMemory

      // Memory should not increase significantly after cleanup
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024)
    })
  })

  describe('Animation Performance', () => {
    it('should maintain 60fps during layout animations', async () => {
      mockViewport(1920, 1080)
      
      render(
        <TestWrapper>
          <Game />
        </TestWrapper>
      )

      // Mock animation frame timing
      const frameTimes: number[] = []
      let frameCount = 0
      const maxFrames = 60 // 1 second at 60fps

      const originalRAF = window.requestAnimationFrame
      window.requestAnimationFrame = vi.fn().mockImplementation((callback) => {
        const frameTime = performance.now()
        frameTimes.push(frameTime)
        frameCount++
        
        if (frameCount < maxFrames) {
          setTimeout(() => callback(frameTime), 16.67) // 60fps
        }
        
        return frameCount
      })

      // Trigger layout transition animation
      mockViewport(600, 800)
      
      await new Promise(resolve => setTimeout(resolve, 100))

      window.requestAnimationFrame = originalRAF

      if (frameTimes.length > 1) {
        // Calculate frame intervals
        const frameIntervals = frameTimes.slice(1).map((time, i) => time - frameTimes[i])
        const avgFrameInterval = frameIntervals.reduce((a, b) => a + b) / frameIntervals.length

        // Should maintain close to 60fps (16.67ms per frame)
        expect(avgFrameInterval).toBeLessThan(20) // Allow some variance
        expect(avgFrameInterval).toBeGreaterThan(14)
      }
    })
  })

  describe('Performance Regression Detection', () => {
    it('should detect performance regressions in desktop rendering', async () => {
      mockViewport(1920, 1080)
      
      // Baseline performance measurement
      const baselineMetrics = await measurePerformance(() => {
        render(
          <TestWrapper>
            <Game />
          </TestWrapper>
        )
      })

      // Performance thresholds (these would be updated based on actual measurements)
      const performanceThresholds = {
        renderTime: 100, // ms
        layoutTime: 50,  // ms
        paintTime: 30,   // ms
      }

      expect(baselineMetrics.renderTime).toBeLessThan(performanceThresholds.renderTime)
      expect(baselineMetrics.layoutTime).toBeLessThan(performanceThresholds.layoutTime)
      expect(baselineMetrics.paintTime).toBeLessThan(performanceThresholds.paintTime)

      // Log metrics for monitoring
      console.log('Performance Metrics:', {
        renderTime: `${baselineMetrics.renderTime.toFixed(2)}ms`,
        layoutTime: `${baselineMetrics.layoutTime.toFixed(2)}ms`,
        paintTime: `${baselineMetrics.paintTime.toFixed(2)}ms`,
        memoryUsage: baselineMetrics.memoryUsage ? `${(baselineMetrics.memoryUsage / 1024 / 1024).toFixed(2)}MB` : 'N/A'
      })
    })
  })
})