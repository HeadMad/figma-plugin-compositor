<script>
  import Popover from '../overlay/Popover.svelte';

  let { 
    options = [], 
    value = $bindable() 
  } = $props();

  let selectedLabel = $derived(
    options.find(opt => opt.id === value)?.label || 'Выберите...'
  );
</script>

<Popover>
  <button type="button" class="dropdown-trigger">
    <span class="dropdown-trigger__text">{selectedLabel}</span>
    <span class="dropdown-trigger__arrow">▾</span>
  </button>
  
  {#snippet content({ close })}
    <div class="dropdown-menu-list">
      {#each options as option}
        <button 
          type="button"
          class="menu-item" 
          class:is-selected={value === option.id}
          onclick={() => { value = option.id; close(); }}
        >
          {option.label}
        </button>
      {/each}
    </div>
  {/snippet}
</Popover>

<style>
  .dropdown-trigger {
    font-family: var(--font-stack);
    font-size: var(--font-size-default);
    background-color: var(--figma-color-bg-secondary, #f5f5f5) !important;
    color: var(--figma-color-text, #333333) !important;
    border: 1px solid var(--figma-color-border, #e6e6e6) !important;
    border-radius: var(--radius-medium, 6px) !important;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    height: 24px !important; 
    width: 110px !important;
    padding: 0 6px !important;
    font-weight: normal !important;
    cursor: pointer;
    transition: border-color 0.1s ease;
  }

  .dropdown-trigger:hover {
    border-color: var(--figma-color-border-strong, #b3b3b3) !important;
  }

  .dropdown-trigger__text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 4px;
  }

  .dropdown-trigger__arrow {
    color: var(--figma-color-text-tertiary, #b3b3b3);
    font-size: 10px;
  }

  .dropdown-menu-list {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  :global(.menu-item.is-selected) {
    font-weight: 600;
    color: var(--figma-color-text-brand, #0c8ce9) !important;
    background-color: var(--figma-color-bg-brand-secondary, rgba(12, 140, 233, 0.05)) !important;
  }
</style>
