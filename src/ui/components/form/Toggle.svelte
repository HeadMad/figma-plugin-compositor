<script>
  // Двустороннее связывание состояния checked в Svelte 5
  let { checked = $bindable(false) } = $props();
</script>

<div class="toggle-control">
  <input type="checkbox" bind:checked={checked} />
  <span class="slider"></span>
</div>

<style>
  .toggle-control {
    position: relative;
    display: inline-block;
    width: 24px;
    height: 12px;
    user-select: none;
  }

  input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }

  .slider {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: var(--figma-color-bg-brand-hover, #b3b3b3);
    border-radius: 6px;
    transition: background-color 0.15s ease;
  }

  .slider::before {
    content: "";
    position: absolute;
    height: 10px;
    width: 10px;
    left: 1px;
    bottom: 1px;
    background-color: #ffffff;
    border-radius: 50%;
    transition: transform 0.15s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  input:checked + .slider {
    background-color: var(--figma-color-bg-brand, #0c8ce9);
  }

  input:checked + .slider::before {
    transform: translateX(12px);
  }
</style>
