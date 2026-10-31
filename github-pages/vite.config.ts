import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: process.env.PAGES_BASE_PATH || '/hong-kong-poster-archive/',
  publicDir: fileURLToPath(new URL('../public', import.meta.url)),
  plugins: [react()],
  css: {postcss: {plugins: []}},
  build: {outDir: fileURLToPath(new URL('../docs', import.meta.url)), emptyOutDir: true},
});
