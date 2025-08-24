import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDesktop = mode === 'desktop'
  
  return {
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
    build: {
      rollupOptions: {
        input: isDesktop ? 'index.desktop.html' : 'index.html',
        external: isDesktop ? [
          '@capacitor/android',
          '@capacitor/cli',
          '@capacitor/core'
        ] : [],
        output: {
          manualChunks: isDesktop ? {
            // Desktop-optimized chunk splitting for better caching
            vendor: ['react', 'react-dom', 'react-router', 'react-router-dom'],
            chess: ['chess.js', 'react-chessboard'],
            ui: ['antd', '@ant-design/icons', '@mantine/core', '@mantine/hooks'],
            utils: ['lodash'],
            // Separate chunk for heavy components
            components: [
              './src/components/PerformanceDashboard',
              './src/components/AchievementSystem',
              './src/pages/UserProfilePage'
            ]
          } : undefined
        }
      },
      target: isDesktop ? 'esnext' : 'es2015',
      minify: isDesktop ? 'esbuild' : 'terser',
      sourcemap: !isDesktop,
      outDir: isDesktop ? 'dist-desktop' : 'dist',
      // Desktop-specific optimizations
      chunkSizeWarningLimit: isDesktop ? 1000 : 500, // Higher limit for desktop
      assetsInlineLimit: isDesktop ? 8192 : 4096, // Inline more assets for desktop
      cssCodeSplit: isDesktop, // Enable CSS code splitting for desktop
      reportCompressedSize: isDesktop // Enable size reporting for desktop builds
    },
    preview: {
      port: 4173,
      strictPort: true,
      host: true,
      input: isDesktop ? 'index.desktop.html' : 'index.html'
    },
    define: {
      __DESKTOP_MODE__: isDesktop,
      __MOBILE_MODE__: !isDesktop,
      // Desktop performance constants
      __PERFORMANCE_TARGET_FPS__: isDesktop ? 144 : 60,
      __PERFORMANCE_MIN_FPS__: isDesktop ? 60 : 30,
      __MEMORY_LIMIT_MB__: isDesktop ? 500 : 100
    },
    // Desktop-specific optimizations
    optimizeDeps: {
      include: isDesktop ? [
        'react',
        'react-dom',
        'antd',
        'chess.js',
        'react-chessboard'
      ] : undefined,
      exclude: isDesktop ? [
        '@capacitor/android',
        '@capacitor/cli', 
        '@capacitor/core'
      ] : undefined
    }
  }
})