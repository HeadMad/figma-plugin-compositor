export default function getSelectedLayerName() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    return { name: 'Ничего не выбрано' };
  }

  return { name: selection[0].name };
}
