import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { viteStaticCopy } from 'vite-plugin-static-copy'; // 1. Импортируем копировщик

export default defineConfig({
  // Задаем корень сборки фронтенда внутри src/ui [2.1]
  root: 'src/ui',
  
  plugins: [
    svelte(),
    viteSingleFile(), // Сжимает HTML-файл целиком в монолит ui.html
    
    // 2. НАСТРАИВАЕМ АВТОМАТИЧЕСКОЕ КОПИРОВАНИЕ МАНИФЕСТА
    viteStaticCopy({
      targets: [
        {
          // Поднимаемся из src/ui/ наружу в src/ и берем manifest.json
          src: '../manifest.json',
          // Складываем его в корень папки outDir (то есть прямо в dist/)
          dest: './dist/'
        }
      ]
    })
  ],
  build: {
    emptyOutDir: false,
    // Выталкиваем бандл наружу — в глобальный корень dist/
    outDir: '../../dist',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    rollupOptions: {
      input: {
        ui: 'ui.html'
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  }
});
