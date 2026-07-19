<script>
  import { figma, initAutoResize } from './utils/index.js';
  import { Tabs, Tab, Toast, Modal } from './components/index.js';
  
  // Импортируем изолированные экраны из плоского хаба страниц
  import { ShapesPage, OverlaysPage, TextPage } from './pages/index.js';

  let pluginContainer = $state(null);
  let selectedCount = $state(0);

  // СЛУШАЕМ СОБЫТИЯ: Синхронизируем счетчик выделения с холстом Figma
  $effect(() => {
    const removeSelectionListener = figma.addEventListener('selectionchange', (data) => {
      if (data && typeof data.count === 'number') {
        selectedCount = data.count;
      }
    });
    return () => removeSelectionListener();
  });

  // АВТОРЕСАЙЗ: Плавно меняет высоту окна Figma при переключении табов разной высоты
  $effect(() => {
    if (pluginContainer) {
      const destroy = initAutoResize(pluginContainer);
      return () => destroy();
    }
  });
</script>

<main class="plugin-layout" bind:this={pluginContainer}>
  <!-- Глобальные провайдеры уведомлений и функциональных модалок -->
  <Toast />
  <Modal />

  <header class="status-bar">
    Выбрано объектов в Figma: <strong>{selectedCount}</strong>
  </header>

  <!-- Многостраничный роутер на базе svelte-super и ваших сниппетов -->
  <Tabs>
    {#snippet children()}
      
      <Tab id="Фигуры" opened>
        <ShapesPage />
      </Tab>
      
      <Tab id="Модалки">
        <OverlaysPage />
      </Tab>

      <Tab id="Текст">
        <TextPage />
      </Tab>

    {/snippet} 
  </Tabs>

  <footer class="actions-panel">
    <button class="secondary" onclick={() => figma.send('closePlugin')}>Закрыть</button>
  </footer>
</main>

<style>
  /* Внешний жесткий каркас плагина с симметричным воздухом */
  .plugin-layout {
    display: flex;
    flex-direction: column;
    width: 280px;
    height: auto;
    padding: var(--spacing-lg, 16px); 
    gap: var(--spacing-lg, 16px);     
  }

  /* Статус бар в верхней части */
  .status-bar {
    font-size: var(--font-size-small, 11px);
    color: var(--figma-color-text, #333333);
    border-bottom: 1px solid var(--figma-color-border, #e6e6e6);
    padding-bottom: var(--spacing-sm, 8px);
  }

  .actions-panel {
    display: flex;
    margin-top: auto;
  }

  .actions-panel button {
    width: 100%;
  }

  /* Глобальный класс потока элементов для вложенных компонентов страниц */
  :global(.controls-flow) {
    display: flex;
    flex-direction: column;
    gap: 12px;     
    padding: var(--spacing-xs, 4px) 0;
  }
</style>
