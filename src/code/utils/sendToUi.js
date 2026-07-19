import * as actions from '../actions/index.js';

/**
 * Отправляет низкоуровневое сообщение в iframe интерфейса плагина
 * @param {string} action - Имя события или экшена на стороне UI
 * @param {Object} params - Данные для отправки
 * @param {string} [requestId] - Системный ID для резолва Promise на фронтенде
 */
export function sendToUi(action, params = {}, requestId = undefined) {
  figma.ui.postMessage({ action, params, requestId });
}

// САМОИНИЦИАЛИЗАЦИЯ: Ловит асинхронные RPC-запросы figma.send() из UI
figma.ui.onmessage = async ({ action, params, requestId }) => {
  // Проверяем, существует ли такой атомарный обработчик в нашей папке actions/
  if (typeof actions[action] === 'function') {
    try {
      // Выполняем экшен (он может быть как синхронным, так и асинхронным async/await)
      const result = await actions[action](params);

      // Если фронтенд ждал ответ (пришел requestId) — возвращаем результат с тем же ID
      if (requestId && result !== undefined) {
        sendToUi(action, result, requestId);
      }
    } catch (error) {
      console.error(`[Backend Error] Исключение в экшене [${action}]:`, error);
      if (requestId) {
        sendToUi(action, { ok: false, error: error.message }, requestId);
      }
    }
  } else {
    console.warn(`[Backend Warning] Экшен [${action}] не найден в папке actions/`);
  }
};

export default sendToUi;
