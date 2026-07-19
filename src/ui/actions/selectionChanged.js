/**
 * Экшен, который выполнится, когда придет сообщение selectionChanged от Figma
 * @param {Object} state - Объект реактивного стейта Svelte
 * @returns {Function} Функция-обработчик
 */
export function selectionChanged(state) {
  return function ({ count }) {
    state.selectedCount = count;
  };
}
