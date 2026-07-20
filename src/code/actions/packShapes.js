import hexToFigmaRgb from '../utils/hexToFigmaRgb.js';

export default function packShapes({
  sheetId,
  shapeWidth,
  shapeHeight,
  gap = 0,
  color,
  createComponent = false,
  padding = 0,
  alignX = 'C',
  alignY = 'C',
  genGuides = true
}) {
  const sheet = figma.getNodeById(sheetId);
  if (!sheet || sheet.type !== 'FRAME') {
    return { ok: false, error: 'Sheet not found' };
  }

  if (shapeWidth <= 0 || shapeHeight <= 0) {
    return { ok: false, error: 'Invalid shape dimensions' };
  }

  const sheetW = sheet.width;
  const sheetH = sheet.height;
  const minMargin = padding;

  const availW = sheetW - minMargin * 2;
  const availH = sheetH - minMargin * 2;

  const cols = availW >= shapeWidth ? 1 + Math.floor((availW - shapeWidth) / (shapeWidth + gap)) : 0;
  const rows = availH >= shapeHeight ? 1 + Math.floor((availH - shapeHeight) / (shapeHeight + gap)) : 0;

  if (cols === 0 || rows === 0) {
    return { ok: false, error: 'Shape is too large for the sheet' };
  }

  const contentW = cols * shapeWidth + (cols - 1) * gap;
  const contentH = rows * shapeHeight + (rows - 1) * gap;

  let startX = minMargin, startY = minMargin;
  let finalGapX = gap, finalGapY = gap;

  if (alignX === 'SPACE') {
    if (cols > 1) finalGapX = (sheetW - minMargin * 2 - cols * shapeWidth) / (cols - 1);
  } else {
    const remainW = sheetW - contentW;
    if (alignX === 'L') startX = minMargin;
    else if (alignX === 'R') startX = remainW - minMargin;
    else if (alignX === 'C') startX = remainW / 2;
  }

  if (alignY === 'SPACE') {
    if (rows > 1) finalGapY = (sheetH - minMargin * 2 - rows * shapeHeight) / (rows - 1);
  } else {
    const remainH = sheetH - contentH;
    if (alignY === 'T') startY = minMargin;
    else if (alignY === 'B') startY = remainH - minMargin;
    else if (alignY === 'C') startY = remainH / 2;
  }

  const chosenColor = hexToFigmaRgb(color);
  let comp = null;

  if (createComponent) {
    comp = figma.createComponent();
    comp.name = 'Shape Master Source';
    comp.resize(shapeWidth, shapeHeight);

    const rect = figma.createRectangle();
    rect.resize(shapeWidth, shapeHeight);
    rect.fills = [{ type: 'SOLID', color: chosenColor }];
    rect.strokes = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 }, opacity: 0.4 }];
    comp.appendChild(rect);

    comp.x = sheet.x - shapeWidth - 80;
    comp.y = sheet.y;
  }

  if (genGuides) {
    const grids = [];

    const colGrid = {
      pattern: 'COLUMNS',
      alignment: alignX === 'SPACE' ? 'STRETCH' : 'MIN',
      gutterSize: alignX === 'SPACE' ? finalGapX : gap,
      count: cols,
      offset: startX,
      visible: true,
      color: { r: 0, g: 0.5, b: 1, a: 0.12 }
    };
    if (alignX !== 'SPACE') colGrid.sectionSize = shapeWidth;
    grids.push(colGrid);

    const rowGrid = {
      pattern: 'ROWS',
      alignment: alignY === 'SPACE' ? 'STRETCH' : 'MIN',
      gutterSize: alignY === 'SPACE' ? finalGapY : gap,
      count: rows,
      offset: startY,
      visible: true,
      color: { r: 1, g: 0, b: 0.3, a: 0.12 }
    };
    if (alignY !== 'SPACE') rowGrid.sectionSize = shapeHeight;
    grids.push(rowGrid);

    sheet.layoutGrids = grids;
  }

  if (createComponent && comp) {
    for (let r = 0; r < rows; r++) {
      const posY = startY + r * (shapeHeight + finalGapY);
      for (let c = 0; c < cols; c++) {
        const posX = startX + c * (shapeWidth + finalGapX);
        const instance = comp.createInstance();
        instance.x = posX;
        instance.y = posY;
        sheet.appendChild(instance);
      }
    }
  }

  figma.currentPage.selection = [sheet];
  figma.viewport.scrollAndZoomIntoView([sheet]);

  return {
    ok: true,
    count: cols * rows,
    cols, rows,
    compX: comp ? comp.x : null,
    compWidth: comp ? shapeWidth : null,
    sheetRight: sheet.x + sheetW
  };
}
