const pendingRequests = new Map();
const eventListeners = new Map();

// Безопасный кэш в оперативной памяти (Замена sessionStorage для data: URLs) [2.1]
const inMemorySessionCache = new Map();

export const figma = {
  /**
   * Отправляет команду на бэкенд и асинхронно ждет Promise с ответом
   * @param {string} action
   * @param {Object} [params={}]
   * @returns {Promise<Object>}
   */
  send(action, params = {}) {
    return new Promise((resolve, reject) => {
      const requestId = Math.random().toString(36).substring(2, 9);
      pendingRequests.set(requestId, { resolve, reject });
      parent.postMessage({ pluginMessage: { action, params, requestId } }, '*');
    });
  },

  /**
   * Подписывает UI на фоновые события холста Figma
   * @param {string} event
   * @param {Function} callback
   * @returns {Function} Функция автоматической отписки
   */
  addEventListener(event, callback) {
    if (!eventListeners.has(event)) eventListeners.set(event, new Set());
    eventListeners.get(event).add(callback);
    return () => eventListeners.get(event)?.delete(callback);
  },

  /**
   * Принудительно очищает всех фоновых слушателей
   */
  removeEventListeners() {
    eventListeners.clear();
  },

  /**
   * Синхронное сессионное хранилище в оперативной памяти (Безопасно для iframe) [2.1]
   * @param {string} key
   * @param {Object} [state={}]
   * @returns {Proxy}
   */
  getSessionStorage(key, state = {}) {
    if (inMemorySessionCache.has(key)) {
      state = inMemorySessionCache.get(key);
    } else {
      inMemorySessionCache.set(key, state);
    }

    return new Proxy({}, {
      get(_, prop) {
        return state[prop];
      },
      set(_, prop, value) {
        state[prop] = value;
        inMemorySessionCache.set(key, state);
        return true;
      }
    });
  },

  /**
   * Внутренняя асинхронная фабрика для хранилищ Figma API
   * @private
   */
  getFigmaStorage(storageType, key, state = {}) {
    this.send('manageStorage', { operation: 'load', storageType, storageKey: key }).then((saved) => {
      if (saved) {
        Object.assign(state, saved);
      }
    });

    return new Proxy({}, {
      get(_, prop) {
        return state[prop];
      },
      set(_, prop, value) {
        state[prop] = value;
        figma.send('manageStorage', { operation: 'save', storageType, storageKey: key, data: { ...state } });
        return true;
      }
    });
  },

  /**
   * Клиентское хранилище (figma.clientStorage)
   * @param {string} key
   * @param {Object} [state={}]
   * @returns {Proxy}
   */
  getClientStorage(key, state = {}) {
    return this.getFigmaStorage('client', key, state);
  },

  /**
   * Документ-хранилище (figma.root.setPluginData)
   * @param {string} key
   * @param {Object} [state={}]
   * @returns {Proxy}
   */
  getDocumentStorage(key, state = {}) {
    return this.getFigmaStorage('document', key, state);
  }
};

// Системный авто-слушатель входящих сообщений из Figma бэкенда
window.addEventListener('message', (event) => {
  const message = event.data?.pluginMessage;
  if (!message) return;

  const { action, params, requestId } = message;

  if (requestId && pendingRequests.has(requestId)) {
    pendingRequests.get(requestId).resolve(params);
    pendingRequests.delete(requestId);
    return;
  }

  const listeners = eventListeners.get(action);
  if (listeners) {
    listeners.forEach((callback) => callback(params));
  }
});

export default figma;
