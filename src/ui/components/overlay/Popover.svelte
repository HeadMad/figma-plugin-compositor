<script>
  import { clickOutside } from '../../utils/index.js';

  let { children, content } = $props();
  let isOpen = $state(false);

  function close() {
    isOpen = false;
  }
  
  function toggle(e) {
    e.stopPropagation(); // Не дает клику по триггеру считаться кликом "снаружи"
    isOpen = !isOpen;
  }
</script>

<div class="popover-anchor">
  <div class="popover-trigger" onclick={toggle} role="presentation">
    {@render children?.()}
  </div>

  {#if isOpen}
    <!-- Твоё пуленепробиваемое решение: вешаем аттачмент строго на само меню -->
    <div class="popover-menu" {@attach clickOutside(close)}>
      {@render content?.({ close })}
    </div>
  {/if}
</div>

<style>
  .popover-anchor {
    position: relative;
    display: inline-block;
    width: auto;
  }

  .popover-trigger {
    display: inline-block;
    width: auto;
  }

  .popover-menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    background: var(--figma-color-bg-primary, #ffffff);
    border: 1px solid var(--figma-color-border, #e6e6e6);
    border-radius: var(--radius-large, 8px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.04);
    padding: var(--spacing-xs, 4px);
    min-width: 140px;
    max-width: 200px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    animation: fadeIn 0.1s ease-out forwards;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
