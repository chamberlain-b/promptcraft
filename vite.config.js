import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/promptcraft/',
  plugins: [react()],
  server: {
    open: true,
  },
  build: {
    outDir: 'dist',
  },
}); 