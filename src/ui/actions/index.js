import { selectionChanged } from './selectionChanged.js';
import { loadSettings } from './loadSettings.js';

/**
 * Создает плоский объект экшенов интерфейса, привязанный к стейту
 * @param {Object} state - Объект реактивного стейта Svelte ($state)
 * @returns {Object} Плоский объект { actionName: handlerFunction }
 */
export function initUiActions(state) {
  return {
    selectionChanged: selectionChanged(state),
    loadSettings: loadSettings(state)
  };
}
