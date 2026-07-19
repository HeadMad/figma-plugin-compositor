<script>
  import { figma } from '../utils/index.js';
  import { showToast, showModal, Popover } from '../components/index.js';

  // Вызов функциональной модалки через объект конфигурации кнопок и коллбэков
  function openClearModal() {
    showModal({
      title: 'Удалить слои?',
      description: 'Это действие безвозвратно сотрет все выделенные элементы на текущей странице Figma.',
      buttons: [
        {
          label: 'Удалить',
          variant: 'destructive',
          onClick: async (close) => {
            const response = await figma.send('clearLayers');
            if (response && response.ok) {
              showToast('Выбранные слои успешно удалены', 'error');
              close(); // Системная функция close закрывает модалку изнутри
            } else {
              showToast(response?.error || 'Выделите слои для удаления', 'info');
            }
          }
        },
        {
          label: 'Отмена',
          variant: 'secondary',
          onClick: (close) => close()
        }
      ]
    });
  }
</script>

<div class="controls-flow">
  <button onclick={() => showToast('Параметры успешно применены! 🎉', 'success')}>
    Успешный тост (3с)
  </button>

  <label class="popover-row">
    <span>Быстрые опции плагина:</span>
    
    <!-- Компактный поповер на базе children и сниппета content -->
    <Popover>
      <button type="button" class="secondary" style="height: 24px; padding: 0 8px;">Опции ▾</button>
      
      {#snippet content({ close })}
        <button class="menu-item" onclick={() => { showToast('Выбран быстрый режим'); close(); }}>⚡ Быстрый режим</button>
        <button class="menu-item" onclick={() => { showToast('Выбран точный режим'); close(); }}>🎯 Точный режим</button>
        <div class="menu-divider"></div>
        <button class="menu-item" onclick={() => { showToast('Открыты настройки'); close(); }}>⚙️ Настройки...</button>
      {/snippet}
    </Popover>
  </label>

  <hr class="section-divider" />

  <button class="destructive" onclick={openClearModal}>
    Очистить макет (Modal)
  </button>
</div>

<style>
  .popover-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 28px;
  }

  .section-divider {
    border: none;
    border-top: 1px solid var(--figma-color-border, #e6e6e6);
    margin: 4px 0;
  }
</style>
