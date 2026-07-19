import hexToFigmaRgb from '../utils/hexToFigmaRgb.js';

/**
 * Создает геометрические фигуры на холсте Figma
 * @param {Object} params
 * @param {number} params.count - Количество фигур
 * @param {string} params.color - HEX-цвет заливки
 * @param {string} params.name - Кастомное имя слоя
 * @param {'RECTANGLE' | 'ELLIPSE' | 'STAR'} params.shapeType - Тип геометрии
 * @returns {Object} Объект ответа со статусом ok
 */
export default function createShape({ count, color, name, shapeType }) {
  const nodes = [];
  const rgbColor = hexToFigmaRgb(color);

  for (let i = 0; i < count; i++) {
    let node;

    switch (shapeType) {
      case 'ELLIPSE':
        node = figma.createEllipse();
        break;
      case 'STAR':
        node = figma.createStar();
        break;
      case 'RECTANGLE':
      default:
        node = figma.createRectangle();
        break;
    }

    // Выставляем размеры, имя и позиционируем со смещением вправо
    node.resize(100, 100);
    node.x = figma.viewport.center.x + (i * 150) - (100 / 2);
    node.y = figma.viewport.center.y - (100 / 2);
    
    if (name && name.trim()) {
      node.name = name;
    }

    // Накладываем нативную SOLID заливку
    node.fills = [{ type: 'SOLID', color: rgbColor }];
    
    figma.currentPage.appendChild(node);
    nodes.push(node);
  }

  // Фокусируем камеру Figma на созданных объектах и выделяем их
  figma.currentPage.selection = nodes;
  figma.viewport.scrollAndZoomIntoView(nodes);

  return { ok: true };
}
