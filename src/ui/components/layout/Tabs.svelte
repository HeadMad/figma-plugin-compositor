<script module>
  import { Super, SuperContent } from 'svelte-super';
  export const Tab = SuperContent;
</script>

<script>
  let { children: content } = $props();
</script>

<Super>
  {#snippet children({ select, open, close, toggle, isActive, controls })}
    <div class="tabs-container">
      {#each controls as { id, active }}
        <button 
          type="button" 
          class="tab-button" 
          class:active 
          onclick={() => select(id)}
        >
          {id}
        </button>
      {/each}
    </div>
    {@render content?.({ select, open, close, toggle, isActive, controls })}
  {/snippet}
</Super>

<style>
  .tabs-container {
    display: flex;
    width: 100%;
    height: 32px;
    background-color: var(--figma-color-bg-secondary, #f5f5f5);
    border-radius: var(--radius-medium, 6px);
    padding: 2px;
    gap: 2px;
    border: 1px solid var(--figma-color-border, #e6e6e6);
  }

  .tab-button {
    flex: 1;
    height: 100%;
    background: transparent !important;
    border: none !important;
    border-radius: calc(var(--radius-medium, 6px) - 2px) !important;
    color: var(--figma-color-text-tertiary, #b3b3b3) !important;
    font-family: var(--font-stack);
    font-size: var(--font-size-default);
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 !important;
    transition: all 0.1s ease;
  }

  .tab-button:hover {
    background-color: var(--figma-color-bg-secondary-hover, #e6e6e6) !important;
    color: var(--figma-color-text, #333333) !important;
  }

  .tab-button.active {
    background-color: var(--figma-color-bg-primary, #ffffff) !important;
    color: var(--figma-color-text, #333333) !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
</style>
