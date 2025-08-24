import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    // Some libs that can run in both Web and Node.js environments
    // need to be shipped with their Node.js compatible version.
    alias: {
      '@': resolve(__dirname, 'src'),
      '@electron': resolve(__dirname, 'electron'),
    }
  },
  build: {
    outDir: 'dist-electron',
    lib: {
      entry: {
        main: 'electron/main.ts',
        preload: 'electron/preload.ts',
      },
      formats: ['cjs'],
    },
    rollupOptions: {
      external: [
        'electron',
        'path',
        'fs',
        'url',
        'crypto',
        'stream',
        'assert',
        'http',
        'https',
        'os',
        'net',
        'child_process',
        'worker_threads',
        'cluster',
        'readline',
        'zlib',
        'buffer',
        'querystring',
        'dns',
        'tls',
        'util',
        'events',
      ],
      output: {
        entryFileNames: '[name].js',
      },
    },
    emptyOutDir: true,
    copyPublicDir: false,
  },
});