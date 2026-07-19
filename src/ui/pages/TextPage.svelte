<script>
  import { figma } from '../utils/index.js';
  import session from '../session.svelte.js'; // Явное указание .svelte.js
  import { showToast } from '../components/index.js';

  let statusText = $state('');
  let isError = $state(false);

  // Безопасное обновление текста с автоматической подгрузкой шрифтов на бэкенде
  async function applyTextUpdate() {
    if (!session.textValue.trim()) {
      showToast('Введите текст для отправки', 'info');
      return;
    }

    statusText = 'Загрузка шрифта слоев...';
    isError = false;

    // Шлем асинхронный RPC-запрос на бэкенд
    const response = await figma.send('updateTextLayer', { newText: session.textValue });

    if (response && response.ok) {
      statusText = 'Текст на холсте обновлен! 🎉';
      showToast('Текст обновлен', 'success');
    } else {
      isError = true;
      statusText = response?.error || 'Произошла ошибка';
      showToast(statusText, 'error');
    }
  }
</script>

<div class="form-panel">
  <p class="text-muted">Выделите один текстовый слой на холсте Figma, введите новое значение и примените изменения:</p>
  
  <label class="form-panel__vertical">
    <span>Текст для отправки (Сессия):</span>
    <input type="text" placeholder="Введите текст..." bind:value={session.textValue} />
  </label>

  <button onclick={applyTextUpdate}>
    Обновить текст
  </button>

  {#if statusText}
    <div class="status-alert" class:is-error={isError}>
      {statusText}
    </div>
  {/if}
</div>

<style>
  .status-alert {
    font-size: var(--font-size-small, 11px);
    color: var(--figma-color-text-success, #14ae5c);
    text-align: center;
    margin-top: 4px;
  }

  .status-alert.is-error {
    color: var(--figma-color-text-danger, #f24822);
  }
</style>
