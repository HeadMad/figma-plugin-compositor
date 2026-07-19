import { figma } from './utils/index.js';

// Объявляем реактивный стейт с дефолтными значениями через руну
const data = $state({
  count: 1,
  rectColor: '#0C8CE9',
  showAdvancedSettings: false,
  selectedShape: 'RECTANGLE'
});

// Передаем реактивную ссылку в Proxy-обертку клиентской памяти Figma.
// При старте дефолтные значения затрутся кэшем из figma.clientStorage.
const settings = figma.getClientStorage('plugin-persistent-config', data);

export default settings;
