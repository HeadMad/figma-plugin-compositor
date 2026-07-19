import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: false,
    outDir: 'dist',
    rollupOptions: {
      input: {
        code: 'src/code/main.js'
      },
      output: {
        entryFileNames: '[name].js',
        format: 'es'
      }
    }
  }
});
