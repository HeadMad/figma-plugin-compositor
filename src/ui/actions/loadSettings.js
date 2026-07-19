/**
 * Экшен, который выполнится, когда придет сообщение loadSettings от Figma
 * @param {Object} state - Объект реактивного стейта Svelte
 * @returns {Function} Функция-обработчик
 */
export function loadSettings(state) {
  return function ({ settings }) {
    if (settings.count !== undefined) state.count = settings.count;
    if (settings.rectColor !== undefined) state.rectColor = settings.rectColor;
    if (settings.showAdvancedSettings !== undefined) state.showAdvancedSettings = settings.showAdvancedSettings;
  };
}
