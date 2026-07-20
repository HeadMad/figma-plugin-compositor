<script>
  import { figma, initAutoResize } from './utils/index.js';
  import { Toast } from './components/index.js';
  import { CompositorPage } from './pages/index.js';

  let pluginContainer = $state(null);

  $effect(() => {
    if (pluginContainer) {
      const destroy = initAutoResize(pluginContainer);
      return () => destroy();
    }
  });
</script>

<main class="plugin-layout" bind:this={pluginContainer}>
  <Toast />
  <CompositorPage />
</main>

<style>
  .plugin-layout {
    display: flex;
    flex-direction: column;
    width: 280px;
    height: auto;
    padding: var(--spacing-lg, 16px);
    gap: var(--spacing-sm, 8px);
  }
</style>
