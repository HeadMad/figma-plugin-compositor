<script>
  let { value = $bindable(), suffix = '', ...restProps } = $props();
</script>

<div class="input-wrap">
  <input bind:value {...restProps} />
  {#if suffix}
    <span class="unit-label">{suffix}</span>
  {/if}
</div>

<style>
  .input-wrap {
    display: flex;
    align-items: center;
    border: 1px solid var(--figma-color-border, #e6e6e6);
    border-radius: 4px;
    padding: 0 8px;
    height: 24px;
    background: var(--figma-color-bg-primary, #fff);
  }

  .input-wrap:focus-within {
    border-color: var(--figma-color-border-selected, #18a0fb);
  }

  input {
    border: none;
    outline: none;
    width: 100%;
    font-family: var(--font-stack);
    font-size: var(--font-size-default);
    background: transparent;
    color: var(--figma-color-text, #333);
    text-align: center;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .unit-label {
    color: var(--figma-color-text-tertiary, #b3b3b3);
    font-size: 10px;
    margin-left: 4px;
    white-space: nowrap;
  }
</style>
