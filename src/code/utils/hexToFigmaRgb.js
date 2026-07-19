/**
 * Преобразует HEX-строку цвета в нативный формат RGB для Figma API
 * @param {string} hex - HEX-строка вида "#0C8CE9" или "0C8CE9"
 * @returns {{r: number, g: number, b: number}} Объект цвета Figma API
 */
export default function hexToFigmaRgb(hex) {
  const cleanHex = hex.replace('#', '');
  
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  return { r, g, b };
}
