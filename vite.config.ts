import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// GitHub Pages project site: https://greatestbharat.github.io/manospring-site/
const pagesBase = process.env.VITE_BASE || '/manospring-site/';
const isStatic = process.env.VITE_STATIC === 'true';

export default defineConfig({
  base: isStatic ? pagesBase : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist/client',
    emptyOutDir: true
  }
});
