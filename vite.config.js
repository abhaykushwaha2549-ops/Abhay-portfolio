import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures paths are relative for local review and static server deploys
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    sourcemap: false
  }
});
