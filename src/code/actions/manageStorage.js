/**
 * Универсальный экшен для чтения и записи постоянной памяти Figma
 * @param {Object} params
 * @param {'load' | 'save'} params.operation - Тип операции
 * @param {'client' | 'document'} params.storageType - Тип хранилища Figma API
 * @param {string} params.storageKey - Уникальный ключ записи
 * @param {Object} [params.data] - Данные для сохранения (только для операции 'save')
 * @returns {Promise<Object|null>} Объект сохраненных данных или статус ok
 */
export default async function manageStorage({ operation, storageType, storageKey, data }) {
  
  // 1. ЛОГИКА ЧТЕНИЯ (load)
  if (operation === 'load') {
    if (storageType === 'document') {
      const raw = figma.root.getPluginData(storageKey);
      return raw ? JSON.parse(raw) : null;
    }
    // Чтение из локального clientStorage
    const saved = await figma.clientStorage.getAsync(storageKey);
    return saved || null;
  }

  // 2. ЛОГИКА ЗАПИСИ (save)
  if (operation === 'save') {
    if (storageType === 'document') {
      figma.root.setPluginData(storageKey, JSON.stringify(data));
      return { ok: true };
    }
    // Запись в локальный clientStorage
    await figma.clientStorage.setAsync(storageKey, data);
    return { ok: true };
  }

  return { ok: false, error: 'Неизвестная операция хранилища' };
}
