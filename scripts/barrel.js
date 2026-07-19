import fs from 'fs';
import path from 'path';

// Список корневых директорий для сборки реэкспортов
const WATCHED_DIRS = [
  'src/code/actions',
  'src/code/utils',
  'src/ui/utils',
  // 'src/ui/components', // Теперь можно указать просто корень, скрипт сам найдет form/, layout/ и т.д.
  'src/ui/pages'
];

/**
 * Рекурсивно сканирует директорию и собирает пути ко всем файлам
 * @param {string} baseDir - Корневая папка (где будет лежать index.js)
 * @param {string} currentDir - Текущая сканируемая папка (для рекурсии)
 * @param {string[]} exportLines - Массив, куда собираются строки экспорта
 */
function scanDirectory(baseDir, currentDir, exportLines) {
  const files = fs.readdirSync(currentDir);

  files.forEach((file) => {
    const fullPath = path.join(currentDir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Рекурсивный заход во вложенную папку
      scanDirectory(baseDir, fullPath, exportLines);
    } else if (stat.isFile() && file !== 'index.js' && (file.endsWith('.js') || file.endsWith('.svelte'))) {
      const ext = path.extname(file);
      const name = path.basename(file, ext);
      
      // Вычисляем относительный путь от корня baseDir до этого файла
      let relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      
      // Добавляем префикс ./ если его нет
      if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath;
      }

      exportLines.push(`export { default as ${name} } from '${relativePath}';`);
    }
  });
}

/**
 * Генерирует index.js (Barrel export) для конкретной папки с учетом подпапок
 * @param {string} dir - Относительный путь к корневой папке
 */
function generateBarrel(dir) {
  const absolutePath = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(absolutePath)) return;

  const exportLines = [];
  
  try {
    // Запускаем рекурсивное сканирование
    scanDirectory(absolutePath, absolutePath, exportLines);

    // Сортируем строки для красоты и порядка в файле
    exportLines.sort();

    const fileContent = exportLines.join('\n') + '\n';
    const indexPath = path.join(absolutePath, 'index.js');

    // Записываем только если контент реально изменился
    if (!fs.existsSync(indexPath) || fs.readFileSync(indexPath, 'utf-8') !== fileContent) {
      fs.writeFileSync(indexPath, fileContent, 'utf-8');
      console.log(`[Barrel] Сгенерирован плоский реэкспорт: ${dir}/index.js (${exportLines.length} элементов)`);
    }
  } catch (error) {
    console.error(`[Barrel Error] Ошибка при обработке директории ${dir}:`, error);
  }
}

/**
 * Запуск генерации для всех папок
 */
function buildAll() {
  WATCHED_DIRS.forEach(generateBarrel);
}

// Проверяем флаги запуска
const isWatchMode = process.argv.includes('--watch');

if (isWatchMode) {
  console.log('[Barrel] Запущен рекурсивный режим отслеживания изменений...');
  buildAll(); // Стартовый проход

  WATCHED_DIRS.forEach((dir) => {
    const absolutePath = path.resolve(process.cwd(), dir);
    if (!fs.existsSync(absolutePath)) return;

    // Вешаем нативный вотчер Node.js с флагом recursive: true
    // Это заставит Node.js ловить добавление файлов в подпапках (например, в components/form/)
    fs.watch(absolutePath, { recursive: true }, (eventType, filename) => {
      // Игнорируем изменения самих индексных файлов
      if (filename && !filename.endsWith('index.js')) {
        // Дебаунс, чтобы дождаться окончания записи файла операционной системой
        setTimeout(() => generateBarrel(dir), 100);
      }
    });
  });
} else {
  // Однократный проход для pre-build
  buildAll();
}
