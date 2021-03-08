<script>
  import { afterUpdate } from 'svelte';
  import { vec2 } from 'gl-matrix';
  import ui from './stores/UI';
  import ColorPicker from '../ColorPicker/ColorPicker.svelte';
  import { colorPickerStore } from './ColorPickerStore';
  let elm;
  let realX;
  let realY;

  let position = colorPickerStore.position;
  let isVisible = colorPickerStore.isVisible;

  afterUpdate(() => {
    let pos = $position;
    if ($isVisible) {
      setPosition(pos[0], pos[1]);
    }
  });

  function setPosition(x, y) {
    if (elm !== undefined && elm !== null) {
      let rect = elm.getBoundingClientRect();
      if (x + rect.width > window.innerWidth) {
        realX = x - rect.width - 10;
      } else {
        realX = x - rect.width / 2.0;
      }
      if (y + rect.height > window.innerHeight) {
        realY = y - rect.height - 10;
      } else {
        realY = y;
      }
    }
  }

  function bodyMouseMove(event) {
    if ($isVisible) {
      let rect = elm.getBoundingClientRect();
      let centerX = rect.x + rect.width / 2;
      let centerY = rect.y + rect.height / 2;
      let distToCenter = vec2.sub(
        vec2.create(),
        [event.clientX, event.clientY],
        [centerX, centerY]
      );
      if (Math.abs(distToCenter[0]) > 220 || Math.abs(distToCenter[1]) > 220) {
        $isVisible = false;
      }
    }
  }

  function bodyMouseDown(event) {
    if ($isVisible) {
      let container = elm.parentElement;
      if (!container.contains(event.target)) {
        $isVisible = false;
      }
    }
  }

  function onColorChange(newColor) {
    colorPickerStore.emit(newColor);
  }
</script>

<svelte:body on:mousemove={bodyMouseMove} on:mousedown={bodyMouseDown} />
{#if $isVisible}
  <div
    bind:this={elm}
    class="dialog"
    style={`left: ${realX}px; top: ${realY}px`}
  >
    <ColorPicker value={$ui.get('colorPickerColor')} onChange={onColorChange} />
  </div>
{/if}

<style>
  .dialog {
    position: absolute;
    padding: 12px;
    background-color: var(--color-2);
    border: 1px solid var(--color-4);
    z-index: 10;
  }
</style>
