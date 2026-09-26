import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    include: ['pdfjs-dist'],
  },

  build: {
    // Raise warning threshold — pdfjs is inherently large
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // PDF.js — isolated heavy chunk
          if (id.includes('pdfjs-dist')) return 'pdfjs';
          // Firebase SDK — auth/app only, split from app logic
          if (id.includes('firebase')) return 'firebase';
          // React ecosystem
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react-vendor';
          // Framer Motion — animation library
          if (id.includes('framer-motion')) return 'framer';
        },
      },
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
});
