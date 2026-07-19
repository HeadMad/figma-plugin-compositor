import { figma } from './figma.js';

/**
 * Отслеживает точные размеры DOM-элемента и плавно меняет размер окна Figma
 * @param {HTMLElement} node - Корневой элемент интерфейса плагина (<main>)
 * @returns {Function} Функция ручного отключения слежки
 */
export function initAutoResize(node) {
  if (!node) return;

  const resizeObserver = new ResizeObserver(() => {
    const rect = node.getBoundingClientRect();
    
    const integerWidth = Math.ceil(rect.width);
    // Добавляем 6 пикселей запаса, чтобы нижний футер никогда не резался
    const integerHeight = Math.ceil(rect.height) + 6; 
    
    figma.send('resize', { 
      width: integerWidth,
      height: integerHeight 
    });
  });

  resizeObserver.observe(node);

  return () => {
    resizeObserver.disconnect();
  };
}

export default initAutoResize;
