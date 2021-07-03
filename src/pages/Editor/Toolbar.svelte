<script>
  import { onMount, afterUpdate } from 'svelte';
  import ui from '../../stores/UI';
  import YarnSelector from '../../components/YarnSelector/YarnSelector.svelte';

  export let height = 0;
  export let scrollContainer;
  export let sidebarOpen;
  let cellSizeInput = $ui.cellSize;
  let toolbarContainer;
  let hasChangedCellSize;
  let scrollPercentage = [];

  onMount(() => {
    height = toolbarContainer.clientHeight;
  });

  afterUpdate(() => {
    if (hasChangedCellSize) {
      hasChangedCellSize = false;
      let [scrollLeftMax, scrollTopMax] = getBounds();
      let x = (1.0 - scrollPercentage[0]) * scrollLeftMax;
      let y = (1.0 - scrollPercentage[1]) * scrollTopMax;
      scrollContainer.scrollTo(x, y);
    }
  });

  function getBounds() {
    let scrollLeftMax =
      scrollContainer.scrollWidth - scrollContainer.clientWidth;
    let scrollTopMax =
      scrollContainer.scrollHeight - scrollContainer.clientHeight;
    return [scrollLeftMax, scrollTopMax];
  }

  function reducePrecision(num) {
    return Math.floor(num / 2) * 2;
  }

  function getPosition() {
    let [scrollLeftMax, scrollTopMax] = getBounds();
    let x = reducePrecision(scrollLeftMax - scrollContainer.scrollLeft);
    let y = reducePrecision(scrollTopMax - scrollContainer.scrollTop);
    return [x, y];
  }

  function changeCellSize() {
    let newCellSize = reducePrecision(cellSizeInput);
    let oldCellSize = $ui.cellSize;
    if (newCellSize !== oldCellSize) {
      hasChangedCellSize = true;
      let [x, y] = getPosition();
      let [scrollLeftMax, scrollTopMax] = getBounds();
      scrollPercentage = [x / scrollLeftMax, y / scrollTopMax];
      ui.update((draft) => {
        draft.cellSize = newCellSize;
      });
    }
  }
</script>

<div class="tool-bar" bind:this={toolbarContainer}>
  <button class="hamberder" on:click={() => (sidebarOpen = !sidebarOpen)}
    >{#if !sidebarOpen}≡{:else}x{/if}</button
  >
  <YarnSelector />
  <div class="ok-zoomer">
    <input
      type="range"
      min="5"
      max="70"
      on:input={changeCellSize}
      bind:value={cellSizeInput}
    />
  </div>
</div>

<style>
  .tool-bar {
    justify-content: space-between;
    display: flex;
    min-height: 20px;
    background-color: var(--color-1);
    pointer-events: all;

    grid-column: span 2;
  }

  .ok-zoomer {
    right: 20px;
    z-index: 1000;
  }

  .ok-zoomer input {
    padding: 0;
  }

  .hamberder {
    height: 100%;
    min-width: 2em;
  }
</style>
