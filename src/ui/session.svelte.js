import { figma } from './utils/index.js';

const data = $state({
  layerName: 'New Asset',
  textValue: 'Привет, Figma!'
});

// Инициализируем безопасное In-Memory Proxy-хранилище (защита от SecurityError в iframe)
const session = figma.getSessionStorage('plugin-session-cache', data);

export default session;
