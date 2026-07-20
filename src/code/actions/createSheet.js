export default function createSheet({ width, height, name = 'Sheet', x = null, baseY = null }) {
  if (!width || !height || width <= 0 || height <= 0) {
    return { ok: false, error: 'Invalid sheet dimensions' };
  }

  const frame = figma.createFrame();
  frame.name = name;
  frame.resize(width, height);

  const centerY = figma.viewport.center.y - height / 2;
  frame.y = baseY !== null ? baseY : centerY;
  frame.x = x !== null ? x : figma.viewport.center.x - width / 2;

  frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

  figma.currentPage.selection = [frame];
  figma.viewport.scrollAndZoomIntoView([frame]);

  return { ok: true, sheetId: frame.id, sheetX: frame.x, sheetY: frame.y, sheetHeight: height };
}
