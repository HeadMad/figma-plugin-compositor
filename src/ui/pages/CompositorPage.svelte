<script>
  import { figma } from '../utils/index.js';
  import { InputWithSuffix } from '../components/index.js';
  import s from '../settings.svelte.js';

  const PRESETS_MM = [
    { id: 'A3', w: 420, h: 297 },
    { id: 'A4', w: 297, h: 210 },
    { id: 'A5', w: 210, h: 148 },
    { id: 'A6', w: 148, h: 105 },
    { id: 'custom', w: 0, h: 0 }
  ];

  const ALIGN_X_OPTIONS = [
    { id: 'L', label: 'Слева' },
    { id: 'C', label: 'По центру' },
    { id: 'R', label: 'Справа' },
    { id: 'SPACE', label: 'Равномерно' }
  ];

  const ALIGN_Y_OPTIONS = [
    { id: 'T', label: 'Сверху' },
    { id: 'C', label: 'По центру' },
    { id: 'B', label: 'Снизу' },
    { id: 'SPACE', label: 'Равномерно' }
  ];

  const ALIGN_CYCLES = [
    { x: 'L', y: 'T' },
    { x: 'R', y: 'T' },
    { x: 'R', y: 'B' },
    { x: 'L', y: 'B' },
    { x: 'C', y: 'C' },
    { x: 'SPACE', y: 'SPACE' }
  ];

  let previewBox = $state(null);
  let shapeCount = $state(0);
  let generationCount = $state(0);
  let baseY = $state(null);
  let lastSheetRight = $state(null);

  function cycleAlignment() {
    const idx = ALIGN_CYCLES.findIndex(a => a.x === s.alignX && a.y === s.alignY);
    const next = ALIGN_CYCLES[(idx + 1) % ALIGN_CYCLES.length];
    s.alignX = next.x;
    s.alignY = next.y;
  }

  function unitSuffix() {
    return s.unit === 'mm' ? 'мм' : 'px';
  }

  function mmToCurrent(valMm) {
    if (s.unit === 'mm') return valMm;
    return Math.round(valMm * (s.ppi / 25.4) * 10) / 10;
  }

  function toPx(val) {
    if (s.unit === 'mm') return Math.round(val * (s.ppi / 25.4));
    return val;
  }

  function convertValue(val, fromUnit, toUnit) {
    if (fromUnit === toUnit) return val;
    const factor = s.ppi / 25.4;
    if (fromUnit === 'mm' && toUnit === 'px') return Math.round(val * factor * 10) / 10;
    if (fromUnit === 'px' && toUnit === 'mm') return Math.round(val / factor * 10) / 10;
    return val;
  }

  function applyPreset() {
    const p = PRESETS_MM.find(p => p.id === s.selectedPreset);
    if (p && p.id !== 'custom') {
      s.sheetWidth = mmToCurrent(p.w);
      s.sheetHeight = mmToCurrent(p.h);
    }
  }

  function checkPresetMatch() {
    const swMm = convertValue(s.sheetWidth, s.unit, 'mm');
    const shMm = convertValue(s.sheetHeight, s.unit, 'mm');
    for (const p of PRESETS_MM) {
      if (p.id === 'custom') continue;
      if ((Math.abs(p.w - swMm) < 0.5 && Math.abs(p.h - shMm) < 0.5) ||
          (Math.abs(p.h - swMm) < 0.5 && Math.abs(p.w - shMm) < 0.5)) {
        s.selectedPreset = p.id;
        return;
      }
    }
    s.selectedPreset = 'custom';
  }

  function swapSheet() {
    const tmp = s.sheetWidth;
    s.sheetWidth = s.sheetHeight;
    s.sheetHeight = tmp;
    checkPresetMatch();
  }

  function swapShape() {
    const tmp = s.shapeWidth;
    s.shapeWidth = s.shapeHeight;
    s.shapeHeight = tmp;
  }

  function toggleUnits() {
    const newUnit = s.unit === 'mm' ? 'px' : 'mm';
    const factor = s.ppi / 25.4;
    const convert = s.unit === 'mm'
      ? (v) => Math.round(v * factor * 10) / 10
      : (v) => Math.round(v / factor * 10) / 10;

    s.sheetWidth = convert(s.sheetWidth);
    s.sheetHeight = convert(s.sheetHeight);
    s.padding = convert(s.padding);
    s.shapeWidth = convert(s.shapeWidth);
    s.shapeHeight = convert(s.shapeHeight);
    s.gap = convert(s.gap);
    s.unit = newUnit;
  }

  function calcLayout() {
    const sw = s.sheetWidth, sh = s.sheetHeight;
    const iw = s.shapeWidth, ih = s.shapeHeight;
    const g = s.gap, m = s.padding;

    if (iw <= 0 || ih <= 0 || sw <= 0 || sh <= 0) {
      shapeCount = 0;
      return { cols: 0, rows: 0, startX: 0, startY: 0, finalGapX: 0, finalGapY: 0 };
    }

    const availW = sw - m * 2;
    const availH = sh - m * 2;
    const cols = availW >= iw ? 1 + Math.floor((availW - iw) / (iw + g)) : 0;
    const rows = availH >= ih ? 1 + Math.floor((availH - ih) / (ih + g)) : 0;

    shapeCount = cols * rows;

    let startX = m, startY = m;
    let finalGapX = g, finalGapY = g;

    const contentW = cols * iw + (cols - 1) * g;
    const contentH = rows * ih + (rows - 1) * g;

    if (s.alignX === 'SPACE') {
      if (cols > 1) finalGapX = (sw - m * 2 - cols * iw) / (cols - 1);
    } else {
      const remainW = sw - contentW;
      if (s.alignX === 'L') startX = m;
      else if (s.alignX === 'R') startX = remainW - m;
      else if (s.alignX === 'C') startX = remainW / 2;
    }

    if (s.alignY === 'SPACE') {
      if (rows > 1) finalGapY = (sh - m * 2 - rows * ih) / (rows - 1);
    } else {
      const remainH = sh - contentH;
      if (s.alignY === 'T') startY = m;
      else if (s.alignY === 'B') startY = remainH - m;
      else if (s.alignY === 'C') startY = remainH / 2;
    }

    return { cols, rows, startX, startY, finalGapX, finalGapY };
  }

  function renderPreview() {
    if (!previewBox) return;
    const layout = calcLayout();
    const { cols, rows, startX, startY, finalGapX, finalGapY } = layout;

    previewBox.innerHTML = '';
    const sw = s.sheetWidth, sh = s.sheetHeight;
    const iw = s.shapeWidth, ih = s.shapeHeight;
    const m = s.padding;

    if (sw <= 0 || sh <= 0) return;

    const boxW = previewBox.clientWidth;
    const boxH = previewBox.clientHeight;
    const scale = Math.min((boxW - 8) / sw, (boxH - 8) / sh);
    const pW = sw * scale, pH = sh * scale;

    const page = document.createElement('div');
    page.style.cssText = `position:absolute; left:${(boxW - pW) / 2}px; top:${(boxH - pH) / 2}px; width:${pW}px; height:${pH}px; border:1px solid #aaa; background:#fff;`;
    previewBox.appendChild(page);

    if (cols <= 0 || rows <= 0) return;

    const piw = iw * scale, pih = ih * scale;
    const pgx = finalGapX * scale, pgy = finalGapY * scale;
    const psx = startX * scale, psy = startY * scale;

    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const card = document.createElement('div');
        card.className = 'preview-card';
        card.style.cssText = `width:${piw}px; height:${pih}px; left:${psx + col * (piw + pgx)}px; top:${psy + r * (pih + pgy)}px; background:${s.shapeColor};`;
        page.appendChild(card);
      }
    }
  }

  $effect(() => {
    const _ = s.sheetWidth + s.sheetHeight + s.shapeWidth + s.shapeHeight + s.gap + s.padding + s.alignX + s.alignY + s.shapeColor;
    const layout = calcLayout();
    shapeCount = layout.cols * layout.rows;
    requestAnimationFrame(() => renderPreview());
  });

  async function createAndPack() {
    const sheetW = toPx(s.sheetWidth);
    const sheetH = toPx(s.sheetHeight);
    const shapeWPx = toPx(s.shapeWidth);

    // Вычисляем абсолютный X: если есть предыдущий лист — ставим с отступом 500px
    let sheetX = null;
    if (lastSheetRight !== null) {
      if (s.createComponent) {
        // Компонент слева от листа: compX + shapeW + 80 = sheetX
        // compX = lastSheetRight + 500
        // sheetX = lastSheetRight + 500 + shapeW + 80
        sheetX = lastSheetRight + 500 + shapeWPx + 80;
      } else {
        // Без компонента: просто 500px от правого края предыдущего листа
        sheetX = lastSheetRight + 500;
      }
    }

    const sheetResult = await figma.send('createSheet', {
      width: sheetW,
      height: sheetH,
      name: `Sheet ${s.sheetWidth}x${s.sheetHeight} ${s.unit}`,
      x: sheetX,
      baseY: baseY
    });

    if (!sheetResult || !sheetResult.ok) return;

    if (baseY === null && sheetResult.sheetY !== undefined) {
      baseY = sheetResult.sheetY;
    }

    // Запоминаем правый край листа для следующей генерации
    lastSheetRight = sheetResult.sheetX + sheetW;

    // Всегда вызываем packShapes — он генерирует и компоненты, и layout guides
    await figma.send('packShapes', {
      sheetId: sheetResult.sheetId,
      shapeWidth: shapeWPx,
      shapeHeight: toPx(s.shapeHeight),
      gap: toPx(s.gap),
      color: s.shapeColor,
      createComponent: s.createComponent,
      padding: toPx(s.padding),
      alignX: s.alignX,
      alignY: s.alignY,
      genGuides: s.genGuides
    });

    generationCount++;
  }
</script>

<div class="compositor">
  <!-- PPI + Units -->
  <div class="top-row">
    <label class="field-label">PPI:</label>
    <div class="input-compact" style="margin-left: 0;">
      <InputWithSuffix bind:value={s.ppi} type="number" min={1} />
    </div>
    <label class="field-label">Единицы:</label>
    <button class="toggle-btn" onclick={toggleUnits}>
      {s.unit === 'mm' ? 'мм' : 'px'}
    </button>
  </div>

  <!-- Shape section -->
  <div class="section">
    <div class="section-header">
      <label class="checkbox-inline">
        <input type="checkbox" bind:checked={s.createComponent} />
        <span>Добавить формы</span>
      </label>
      <input type="color" bind:value={s.shapeColor} />
    </div>

    <div class="row">
      <div class="col">
        <label class="lbl-top">Ширина</label>
        <InputWithSuffix bind:value={s.shapeWidth} type="number" suffix={unitSuffix()} min={1} step="any" />
      </div>
      <button class="swap-btn" onclick={swapShape}>⇄</button>
      <div class="col">
        <label class="lbl-top">Высота</label>
        <InputWithSuffix bind:value={s.shapeHeight} type="number" suffix={unitSuffix()} min={1} step="any" />
      </div>
    </div>
  </div>

  <!-- Sheet section -->
  <div class="section">
    <div class="section-title">Настройки печатного листа и сетки</div>

    <div class="row">
      <div class="col col-3">
        <label class="lbl-top">Ширина</label>
        <InputWithSuffix bind:value={s.sheetWidth} type="number" suffix={unitSuffix()} min={1} step="any" />
      </div>
      <button class="swap-btn" onclick={swapSheet}>⇄</button>
      <div class="col col-3">
        <label class="lbl-top">Высота</label>
        <InputWithSuffix bind:value={s.sheetHeight} type="number" suffix={unitSuffix()} min={1} step="any" />
      </div>
      <div class="col col-2">
        <label class="lbl-top">Формат</label>
        <select bind:value={s.selectedPreset} onchange={applyPreset}>
          {#each PRESETS_MM as p}
            <option value={p.id}>{p.id === 'custom' ? '—' : p.id}</option>
          {/each}
        </select>
      </div>
    </div>

    <label class="row-label">
      <span>Отступ между формами:</span>
      <div class="input-compact">
        <InputWithSuffix bind:value={s.gap} type="number" suffix={unitSuffix()} min={0} step="any" />
      </div>
    </label>
    <label class="row-label">
      <span>Отступ от края:</span>
      <div class="input-compact">
        <InputWithSuffix bind:value={s.padding} type="number" suffix={unitSuffix()} min={0} step="any" />
      </div>
    </label>

    <!-- Alignment -->
    <div class="section-title">Выравнивание объектов</div>
    <div class="align-block">
      <div class="align-fields">
        <div>
          <label class="lbl-top">По горизонтали</label>
          <select bind:value={s.alignX}>
            {#each ALIGN_X_OPTIONS as opt}
              <option value={opt.id}>{opt.label}</option>
            {/each}
          </select>
        </div>
        <div>
          <label class="lbl-top">По вертикали</label>
          <select bind:value={s.alignY}>
            {#each ALIGN_Y_OPTIONS as opt}
              <option value={opt.id}>{opt.label}</option>
            {/each}
          </select>
        </div>
      </div>
      <div class="preview-box" bind:this={previewBox} onclick={cycleAlignment} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && cycleAlignment()}></div>
    </div>

    <div class="info-text">Форм на один лист: <span>{shapeCount}</span> шт.</div>
  </div>

  <!-- Layout guides -->
  <label class="checkbox-inline">
    <input type="checkbox" bind:checked={s.genGuides} />
    <span>Генерировать Layout Guides сетки</span>
  </label>

  <button class="submit-btn" onclick={createAndPack}>Сгенерировать раскладку</button>
</div>

<style>
  .compositor {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .top-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .field-label {
    color: #888;
    font-size: 10px;
    font-weight: 500;
  }

  .input-compact {
    width: 70px;
  }

  .toggle-btn {
    border: 1px solid var(--figma-color-border, #e6e6e6);
    background: var(--figma-color-bg-secondary, #f5f5f5);
    border-radius: 4px;
    padding: 0 10px;
    font-family: var(--font-stack);
    font-size: var(--font-size-default);
    font-weight: 500;
    cursor: pointer;
    height: 24px;
    white-space: nowrap;
    color: var(--figma-color-text, #333);
  }

  .toggle-btn:hover {
    background: var(--figma-color-bg-secondary-hover, #eee);
  }

  .section {
    border: 1px solid var(--figma-color-border, #e6e6e6);
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 8px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .section-title {
    font-weight: 600;
    font-size: 11px;
    color: var(--figma-color-text, #111);
    margin-bottom: 6px;
  }

  .row {
    display: flex;
    gap: 8px;
    margin-bottom: 6px;
    align-items: flex-end;
  }

  .col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .col-3 {
    flex: 3;
  }

  .col-2 {
    flex: 2;
  }

  .lbl-top {
    color: var(--figma-color-text-tertiary, #888);
    font-size: 10px;
    font-weight: 500;
    margin-bottom: 2px;
    display: block;
  }

  .row-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--font-size-default);
    color: var(--figma-color-text, #333);
    margin-bottom: 6px;
  }

  .row-label span {
    min-width: 110px;
    white-space: nowrap;
  }

  .input-compact {
    width: 70px;
    margin-left: auto;
  }

  select {
    border: 1px solid var(--figma-color-border, #e6e6e6);
    border-radius: 4px;
    height: 24px;
    padding: 0 4px;
    font-family: var(--font-stack);
    font-size: var(--font-size-default);
    outline: none;
    background: var(--figma-color-bg-primary, #fff);
    width: 100%;
    color: var(--figma-color-text, #333);
  }

  .swap-btn {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 14px;
    color: var(--figma-color-text-tertiary, #b3b3b3);
    padding: 0 2px;
    height: 24px;
    align-self: flex-end;
    margin-bottom: 2px;
  }

  .swap-btn:hover {
    color: var(--figma-color-text, #333);
  }

  .align-block {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-top: 4px;
  }

  .align-fields {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .preview-box {
    width: 110px;
    height: 80px;
    border: 1px solid var(--figma-color-border, #ccc);
    border-radius: 4px;
    background: var(--figma-color-bg-secondary, #fcfcfc);
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
    cursor: pointer;
  }

  :global(.preview-card) {
    position: absolute;
    opacity: 0.6;
    border-radius: 1px;
    transition: all 0.2s ease;
  }

  .checkbox-inline {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--font-size-default);
    color: var(--figma-color-text, #333);
    cursor: pointer;
    height: 24px;
    margin: 4px 0;
  }

  .info-text {
    font-size: 10px;
    color: var(--figma-color-text-tertiary, #666);
    margin-top: 4px;
  }

  .info-text span {
    color: var(--figma-color-bg-brand, #18a0fb);
    font-weight: 600;
  }

  .submit-btn {
    width: 100%;
    background: var(--figma-color-bg-brand, #18a0fb);
    color: white;
    border: none;
    border-radius: 6px;
    height: 32px;
    font-family: var(--font-stack);
    font-weight: 600;
    cursor: pointer;
    font-size: 12px;
  }

  .submit-btn:hover {
    opacity: 0.9;
  }
</style>
