<script>
  let { 
    value = $bindable(1), 
    min = 1, 
    max = 100, 
    step = 1 
  } = $props();

  function increment() {
    if (value + step <= max) value += step;
  }

  function decrement() {
    if (value - step >= min) value -= step;
  }

  function handleInput(e) {
    let parsed = parseInt(e.target.value, 10);
    if (isNaN(parsed)) return;
    
    if (parsed < min) value = min;
    else if (parsed > max) value = max;
    else value = parsed;
  }
</script>

<div class="stepper-control">
  <button type="button" class="stepper-btn" onclick={decrement} disabled={value <= min}>−</button>
  <input type="text" value={value} oninput={handleInput} />
  <button type="button" class="stepper-btn" onclick={increment} disabled={value >= max}>+</button>
</div>

<style>
  .stepper-control {
    display: inline-flex;
    align-items: center;
    background-color: var(--figma-color-bg-secondary, #f5f5f5);
    border: 1px solid var(--figma-color-border, #e6e6e6);
    border-radius: var(--radius-medium, 6px);
    overflow: hidden;
    height: 24px; 
    width: 90px;  
  }

  .stepper-control:focus-within {
    border-color: var(--figma-color-border-selected, #0c8ce9);
    background-color: var(--figma-color-bg-primary, #ffffff);
  }

  input {
    flex-grow: 1;
    width: 34px; 
    height: 100%;
    border: none !important;
    background: transparent !important;
    color: var(--figma-color-text, #333333);
    font-family: var(--font-stack);
    font-size: var(--font-size-default);
    text-align: center;
    outline: none;
    padding: 0 !important;
  }

  .stepper-btn {
    width: 28px;
    height: 100%;
    background: transparent !important;
    color: var(--figma-color-text, #333333);
    border: none;
    border-radius: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: normal;
    padding: 0;
    transition: background-color 0.1s ease;
  }

  .stepper-btn:hover:not(:disabled) {
    background-color: var(--figma-color-bg-secondary-hover, #e6e6e6) !important;
  }

  .stepper-btn:disabled {
    color: var(--figma-color-text-disabled, #b3b3b3);
    cursor: not-allowed;
  }
</style>
