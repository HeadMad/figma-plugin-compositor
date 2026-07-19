import { sendToUi } from './utils/sendToUi.js';

// Открываем нативный веб-интерфейс плагина в iframe
figma.showUI(__html__, { width: 280, height: 200, themeColors: true });

/**
 * Считывает текущее выделение на холсте и отправляет его количество в UI
 */
function sendSelectionCount() {
  sendToUi('selectionchange', { count: figma.currentPage.selection.length });
}

// Подписываемся на нативное событие изменения выделения в Figma
figma.on('selectionchange', sendSelectionCount);

// Синхронно отправляем стартовое количество выделенных объектов при открытии окна
sendSelectionCount();
