import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: [
      'src/test/integration/**/*.test.{ts,tsx}',
      'src/test/visual/**/*.test.{ts,tsx}',
      'src/test/compatibility/**/*.test.{ts,tsx}',
      'src/test/accessibility/**/*.test.{ts,tsx}',
      'src/test/performance/**/*.test.{ts,tsx}',
      'src/test/comprehensive/**/*.test.{ts,tsx}'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/components/**/*.{ts,tsx}',
        'src/contexts/**/*.{ts,tsx}',
        'src/hooks/**/*.{ts,tsx}',
        'src/utils/**/*.{ts,tsx}',
        'src/config/**/*.{ts,tsx}'
      ],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/test/**/*'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    testTimeout: 10000, // 10 seconds for performance tests
    hookTimeout: 5000,  // 5 seconds for setup/teardown
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './test-results/responsive-test-results.json'
    }
  }
})