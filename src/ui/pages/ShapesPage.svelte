<script>
  import { figma } from '../utils/index.js';
  import settings from '../settings.svelte.js'; // Явное указание .svelte.js
  import session from '../session.svelte.js';   // Явное указание .svelte.js
  import { Toggle, NumberInput, Dropdown } from '../components/index.js';

  // Конфигурация выпадающего списка вариантов
  const shapeOptions = [
    { id: 'RECTANGLE', label: '■ Квадрат' },
    { id: 'ELLIPSE', label: '● Круг' },
    { id: 'STAR', label: '★ Звезда' }
  ];
</script>

<div class="form-panel">
  
  <!-- ВЕРТИКАЛЬНАЯ СТРОКА: Текст сверху, большой инпут снизу -->
  <label class="form-panel__vertical">
    <span>Название слоя (Сессия):</span>
    <input type="text" placeholder="Введите имя..." bind:value={session.layerName} />
  </label>

  <!-- ГОРИЗОНТАЛЬНАЯ СТРОКА: Текст слева, Dropdown аккуратно встанет справа -->
  <label>
    <span>Тип фигуры (Постоянно):</span>
    <Dropdown options={shapeOptions} bind:value={settings.selectedShape} />
  </label>

  <label>
    <span>Дополнительные параметры</span>
    <Toggle bind:checked={settings.showAdvancedSettings} />
  </label>

  <div class="form-divider"></div>

  {#if settings.showAdvancedSettings}
    <label>
      <span>Количество фигур (Постоянно):</span>
      <NumberInput bind:value={settings.count} min={1} max={20} />
    </label>

    <label>
      <span>Цвет заливки (Постоянно):</span>
      <input type="color" bind:value={settings.rectColor} />
    </label>
    
    <div class="form-divider"></div>
  {/if}

  <!-- Вызов универсального экшена бэкенда с флагом ответа ok -->
  <button style="width: 100%; margin-top: 4px;" onclick={() => figma.send('createShape', { count: settings.count, color: settings.rectColor, name: session.layerName, shapeType: settings.selectedShape })}>
    Создать элементы
  </button>

</div>
