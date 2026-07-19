import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteSingleFile } from 'vite-plugin-singlefile'; // 1. Импортируем инлайнер
import { autoBarrelPlugin } from './vite-plugin-auto-barrel.js';

export default defineConfig({
  plugins: [
    svelte(),
    
    // Автоматически генерирует index.js реэкспорты перед сборкой
    autoBarrelPlugin([
      'src/code/actions',
      'src/code/utils',
      'src/ui/utils'
    ]),

    // 2. УПАКОВКА В ОДИН ФАЙЛ: Вшивает весь CSS и JS внутрь ui.html для Figma
    viteSingleFile()
  ],
  build: {
    // Тонкие настройки сборки для Figma плагина
    cssCodeSplit: false,
    assetsInlineLimit: 100000000, // Инлайним даже мелкие иконки/картинки в Base64
    rollupOptions: {
      input: {
        // Указываем Vite две точки входа: бэкенд (code) и фронтенд (ui)
        code: 'src/code/main.js',
        ui: 'src/ui/index.html' // Файл ui.html, который монтирует Svelte
      },
      output: {
        // Задаем понятные имена для бандла в папке dist/
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  }
});
