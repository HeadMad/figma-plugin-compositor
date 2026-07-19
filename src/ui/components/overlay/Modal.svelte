<script module>
  let activeModal = $state(null);

  /**
   * Вызывает универсальное модальное окно
   * @param {Object} config
   * @param {string} config.title - Заголовок модалки
   * @param {string} [config.description] - Обычный текст описания
   * @param {import('svelte').Snippet} [config.snippet] - Сниппет Svelte 5
   * @param {import('svelte').Component} [config.component] - Изолированный Svelte-компонент
   * @param {Object} [config.componentProps] - Пропсы для компонента
   * @param {Array<{label: string, variant?: string, onClick: (close: Function) => void}>} config.buttons - Массив кнопок
   */
  export function showModal(config) {
    activeModal = {
      id: Math.random().toString(36).substring(2, 9),
      ...config
    };
  }

  export function closeModal() {
    activeModal = null;
  }
</script>

{#if activeModal}
  <div class="modal-backdrop" onclick={closeModal} role="presentation">
    <div class="modal-window" onclick={(e) => e.stopPropagation()} role="presentation">
      <h3 class="modal-window__title">{activeModal.title}</h3>
      
      <div class="modal-window__content">
        {#if activeModal.description}
          <p class="modal-window__desc text-muted">{activeModal.description}</p>
        {/if}

        {#if activeModal.snippet}
          {@render activeModal.snippet(closeModal)}
        {/if}

        <!-- ИСПРАВЛЕНО: В Svelte 5 компоненты динамические по умолчанию, рендерим как обычный тег! -->
        {#if activeModal.component}
          <activeModal.component 
            close={closeModal} 
            {...activeModal.componentProps} 
          />
        {/if}
      </div>
      
      <div class="modal-window__actions">
        {#each activeModal.buttons as btn}
          <button 
            type="button"
            class={btn.variant || 'secondary'} 
            onclick={() => btn.onClick(closeModal)}
          >
            {btn.label}
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 16px;
  }
  .modal-window {
    background: var(--figma-color-bg-primary, #ffffff);
    border-radius: var(--radius-large, 8px);
    padding: 16px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    animation: scaleUp 0.12s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .modal-window__title { font-size: var(--font-size-large); font-weight: 600; }
  .modal-window__content { display: flex; flex-direction: column; width: 100%; }
  .modal-window__desc { line-height: 14px; }
  .modal-window__actions { display: flex; gap: 8px; margin-top: 4px; }
  .modal-window__actions button { flex: 1; }

  @keyframes scaleUp {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
</style>
