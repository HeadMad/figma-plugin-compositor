figma.showUI(__html__, { width: 320, height: 515 });

figma.clientStorage.getAsync('smart_imposition_settings_v3')
  .then(savedData => {
    if (savedData) {
      figma.ui.postMessage({ type: 'load-settings', data: savedData });
    } else {
      figma.ui.postMessage({ type: 'load-settings', data: {
        unit: 'mm', ppi: 300, shapeW: 65, shapeH: 45, sheetW: 297, sheetH: 210, gap: 5, margin: 5, alignX: 'C', alignY: 'C', createComponent: true, genGuides: true, shapeColor: '#7B61FF'
      }});
    }
  })
  .catch(err => console.error("Figma storage load fail:", err));

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate-layout') {
    try {
      await figma.clientStorage.setAsync('smart_imposition_settings_v3', msg);
    } catch (e) {
      console.error("Figma storage save fail:", e);
    }

    const ppi = msg.ppi;
    const MM_TO_INCH = 25.4;

    function toPx(val) {
      return msg.unit === 'px' ? val : (val / MM_TO_INCH) * ppi;
    }

    // Вспомогательная функция парсинга HEX в нормализованный RGB для Figma
    function hexToRgb(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
      } : { r: 0.5, g: 0.5, b: 0.5 };
    }

    const shapeW = toPx(msg.shapeW), shapeH = toPx(msg.shapeH);
    const sheetW = toPx(msg.sheetW), sheetH = toPx(msg.sheetH);
    const gap = toPx(msg.gap), minMargin = toPx(msg.margin);

    if (shapeW <= 0 || shapeH <= 0 || sheetW <= 0 || sheetH <= 0) {
      figma.notify("Ошибка: Заданы некорректные размеры."); return;
    }

    let availW = sheetW - (minMargin * 2), availH = sheetH - (minMargin * 2);
    let cols = availW >= shapeW ? 1 + Math.floor((availW - shapeW) / (shapeW + gap)) : 0;
    let rows = availH >= shapeH ? 1 + Math.floor((availH - shapeH) / (shapeH + gap)) : 0;

    if (cols === 0 || rows === 0) {
      figma.notify("Форма слишком большая для этого листа."); return;
    }

    let contentW = cols * shapeW + (cols - 1) * gap;
    let contentH = rows * shapeH + (rows - 1) * gap;
    let finalGapX = gap, finalGapY = gap;
    let startX = minMargin, startY = minMargin;

    if (msg.alignX === 'SPACE') {
      if (cols > 1) finalGapX = (sheetW - (minMargin * 2) - (cols * shapeW)) / (cols - 1);
    } else {
      let remainW = sheetW - contentW;
      if (msg.alignX === 'L') startX = minMargin;
      else if (msg.alignX === 'R') startX = remainW - minMargin;
      else if (msg.alignX === 'C') startX = remainW / 2;
    }

    if (msg.alignY === 'SPACE') {
      if (rows > 1) finalGapY = (sheetH - (minMargin * 2) - (rows * shapeH)) / (rows - 1);
    } else {
      let remainH = sheetH - contentH;
      if (msg.alignY === 'T') startY = minMargin;
      else if (msg.alignY === 'B') startY = remainH - minMargin;
      else if (msg.alignY === 'C') startY = remainH / 2;
    }
    // Создаем печатный лист фреймом
    const sheetFrame = figma.createFrame();
    sheetFrame.name = `Printed Sheet (${msg.sheetW}x${msg.sheetH} ${msg.unit})`;
    sheetFrame.resize(sheetW, sheetH);
    sheetFrame.x = figma.viewport.center.x - sheetW / 2;
    sheetFrame.y = figma.viewport.center.y - sheetH / 2;

    let comp = null;
    const chosenColor = hexToRgb(msg.shapeColor || '#7B61FF');
    
    // Генерируем мастер-компонент, только если активен чекбокс
    if (msg.createComponent) {
      comp = figma.createComponent();
      comp.name = "Shape Master Source";
      comp.resize(shapeW, shapeH);
      
      const rect = figma.createRectangle();
      rect.resize(shapeW, shapeH);
      rect.fills = [{ type: 'SOLID', color: chosenColor }]; 
      rect.strokes = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 }, opacity: 0.4 }];
      comp.appendChild(rect);
      
      comp.x = sheetFrame.x - shapeW - 80;
      comp.y = sheetFrame.y;
    }

    // Настраиваем сетки с динамическим обходом ограничений Figma API
    if (msg.genGuides) {
      const grids = [];

      // Вертикальный Grid
      const colGrid = {
        pattern: 'COLUMNS',
        alignment: msg.alignX === 'SPACE' ? 'STRETCH' : 'MIN',
        gutterSize: msg.alignX === 'SPACE' ? finalGapX : gap,
        count: cols,
        offset: startX,
        visible: true,
        color: { r: 0, g: 0.5, b: 1, a: 0.12 }
      };
      // ИСПРАВЛЕНИЕ: Добавляем sectionSize только если режим отличный от STRETCH
      if (msg.alignX !== 'SPACE') {
        colGrid.sectionSize = shapeW;
      }
      grids.push(colGrid);

      // Горизонтальный Grid
      const rowGrid = {
        pattern: 'ROWS',
        alignment: msg.alignY === 'SPACE' ? 'STRETCH' : 'MIN',
        gutterSize: msg.alignY === 'SPACE' ? finalGapY : gap,
        count: rows,
        offset: startY,
        visible: true,
        color: { r: 1, g: 0, b: 0.3, a: 0.12 }
      };
      // ИСПРАВЛЕНИЕ: Добавляем sectionSize только если режим отличный от STRETCH
      if (msg.alignY !== 'SPACE') {
        rowGrid.sectionSize = shapeH;
      }
      grids.push(rowGrid);

      sheetFrame.layoutGrids = grids;
    }

    // Наполняем лист инстансами
    if (msg.createComponent && comp) {
      for (let r = 0; r < rows; r++) {
        let posY = startY + r * (shapeH + finalGapY);
        for (let c = 0; c < cols; c++) {
          let posX = startX + c * (shapeW + finalGapX);
          
          const instance = comp.createInstance();
          instance.x = posX;
          instance.y = posY;
          sheetFrame.appendChild(instance);
        }
      }
    }

    figma.currentPage.appendChild(sheetFrame);
    figma.viewport.scrollAndZoomIntoView([sheetFrame]);
    
    if (msg.createComponent) {
      figma.notify(`Успешно создано объектов: ${cols * rows}`);
    } else {
      figma.notify(`Сгенерирован чистый лист с Layout Grids: ${cols}x${rows}`);
    }
  }
};
