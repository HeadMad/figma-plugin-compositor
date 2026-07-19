<script module>
  // Глобальный реактивный массив тостов
  let toastQueue = $state([]);

  /**
   * Вызывает нативный тост
   * @param {string} message - Текст уведомления
   * @param {'info' | 'success' | 'error'} [type='info'] - Внешний вид
   * @param {number} [duration=3000] - Время показа в миллисекундах (дефолт 3 секунды)
   */
  export function showToast(message, type = 'info', duration = 3000) {
    const id = Math.random().toString(36).substring(2, 9);
    
    // Запускаем таймер автоматического скрытия
    const timer = setTimeout(() => {
      closeToast(id);
    }, duration);

    // Сохраняем тост и ссылку на его таймер в стейт
    toastQueue.push({ id, message, type, timer });
  }

  /**
   * Принудительно закрывает тост по ID
   * @param {string} id
   */
  function closeToast(id) {
    const target = toastQueue.find(t => t.id === id);
    if (target) {
      clearTimeout(target.timer); // Сбрасываем таймер
      toastQueue = toastQueue.filter(t => t.id !== id);
    }
  }
</script>

<div class="toast-provider">
  {#each toastQueue as toast (toast.id)}
    <div class="toast toast--{toast.type}">
      <span class="toast__message">{toast.message}</span>
      
      <!-- Кнопка-крестик принудительного закрытия тоста -->
      <button class="toast__close-btn" onclick={() => closeToast(toast.id)} aria-label="Закрыть">
        ×
      </button>
    </div>
  {/each}
</div>

<style>
  .toast-provider {
    position: fixed;
    top: 12px;
    left: 16px;
    right: 16px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 6px;
    pointer-events: none; /* Пропускаем клики сквозь контейнер, кроме кнопок */
  }

  .toast {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-radius: var(--radius-medium, 6px);
    font-size: var(--font-size-small, 11px);
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    pointer-events: auto; /* Возвращаем кликабельность элементам тоста */
    animation: slideIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .toast--info { background-color: var(--figma-color-bg-brand, #0c8ce9); }
  .toast--success { background-color: var(--figma-color-bg-success, #14ae5c); }
  .toast--error { background-color: var(--figma-color-bg-danger, #f24822); }

  .toast__message {
    flex-grow: 1;
    line-height: 14px;
    padding-right: 8px;
  }

  .toast__close-btn {
    background: transparent !important;
    border: none !important;
    color: rgba(255, 255, 255, 0.7) !important;
    font-size: 16px !important;
    line-height: 12px !important;
    height: 16px !important;
    width: 16px !important;
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer;
    transition: color 0.1s ease;
  }

  .toast__close-btn:hover {
    color: #ffffff !important;
  }

  @keyframes slideIn {
    from { transform: translateY(-8px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
</style>
