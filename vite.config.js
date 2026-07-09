import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/', // Base absolute path is best for routing and subdirectories
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html')
      }
    }
  }
});

