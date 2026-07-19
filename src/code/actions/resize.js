/**
 * Изменяет размеры окна плагина в интерфейсе Figma
 * @param {Object} params
 * @param {number} params.width - Ширина в пикселях
 * @param {number} params.height - Высота в пикселях
 * @returns {Object} Статус ok
 */
export default function resize({ width, height }) {
  figma.ui.resize(width, height);
  return { ok: true };
}
