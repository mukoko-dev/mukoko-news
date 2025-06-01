import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['@heroicons/react']
        },
        // Optimize asset names for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js'
      },
    },
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2018',
    // Optimize for smaller bundle sizes
    cssCodeSplit: true,
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 600,
    // Enable compression
    reportCompressedSize: false,
    // Optimize assets
    assetsInlineLimit: 4096 // Inline small assets as base64
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 4173
  },
  // Optimize dependencies for faster loading
  optimizeDeps: {
    include: ['react', 'react-dom', '@heroicons/react/24/outline'],
    exclude: []
  }
})