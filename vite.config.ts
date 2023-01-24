import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: './client',
  logLevel: 'info',
  publicDir: '../public',
  build: {
    outDir: '../build/client',
  },
  server: {
    port: 3000,
    hmr: {
      port: 3001,
    },
  },
});
