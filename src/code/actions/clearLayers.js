/**
 * Удаляет выделенные объекты на текущей странице Figma
 * @returns {Object} Объект ответа со статусом ok
 */
export default function clearLayers() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    return { ok: false, error: 'Пожалуйста, выберите слои для удаления' };
  }

  try {
    for (const node of selection) {
      if (!node.removed) {
        node.remove();
      }
    }
    
    figma.currentPage.selection = [];
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || 'Не удалось удалить слои' };
  }
}
