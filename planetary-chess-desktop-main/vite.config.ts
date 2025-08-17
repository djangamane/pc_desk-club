import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
            // Optimize chunks for desktop
            vendor: ['react', 'react-dom'],
            chess: ['chess.js', 'react-chessboard'],
            ui: ['@mantine/core', '@mantine/hooks']
          } : undefined
        }
      },
      target: isDesktop ? 'esnext' : 'es2015',
      minify: isDesktop ? 'esbuild' : 'terser',
      sourcemap: !isDesktop,
      outDir: isDesktop ? 'dist-desktop' : 'dist'
    },
    define: {
      __DESKTOP_MODE__: isDesktop,
      __MOBILE_MODE__: !isDesktop
    }
  }
})