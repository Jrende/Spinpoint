<script>
  import { onMount, onDestroy } from 'svelte';
  import { List } from 'immutable';
  import ui from '../stores/UI';
  import draft from '../stores/Draft';
  import WeaveDisplay from '../components/WeaveDisplay/WeaveDisplay.svelte';
  import YarnSelector from '../components/YarnSelector/YarnSelector.svelte';

  let scrollContainer;
  let canvasContainer;
  let newCellSize = $ui.get('cellSize');

  let scrollbarWidth = 15;
  let weaveDisplay;

  let resizeObserver;

  let width = $draft.get('warpCount') * $ui.get('cellSize');
  let height = $draft.get('pickCount') * $ui.get('cellSize');

  onMount(() => {
    scrollbarWidth = scrollContainer.offsetWidth - scrollContainer.clientWidth;
    scrollContainer.addEventListener('scroll', updatePosition);
    let scrollLeftMax =
      scrollContainer.scrollWidth - scrollContainer.clientWidth;
    let scrollTopMax =
      scrollContainer.scrollHeight - scrollContainer.clientHeight;
    scrollContainer.scrollTo(scrollLeftMax, scrollTopMax);
    resizeObserver = new ResizeObserver(() => {
      if (weaveDisplay !== undefined && weaveDisplay !== null) {
        weaveDisplay.syncCanvasDimensions();
      }
    });
    resizeObserver.observe(canvasContainer);

    scrollContainer.addEventListener('pointermove', (e) => {
      let evt = createMouseEvent('pointermove', e);
      weaveDisplay.dispatchEvent(evt);
    });
    scrollContainer.addEventListener('pointerup', (e) => {
      let evt = createMouseEvent('pointerup', e);
      weaveDisplay.dispatchEvent(evt);
    });
    scrollContainer.addEventListener('pointerdown', (e) => {
      let evt = createMouseEvent('pointerdown', e);
      weaveDisplay.dispatchEvent(evt);
    });
    scrollContainer.addEventListener('click', (e) => {
      let evt = createMouseEvent('click', e);
      weaveDisplay.dispatchEvent(evt);
    });
  });

  function createMouseEvent(name, e) {
    return new MouseEvent(name, {
      clientX: e.clientX,
      clientY: e.clientY,
      buttons: e.buttons,
      movementX: e.movementX,
      movementY: e.movementY,
    });
  }

  onDestroy(() => {
    scrollContainer.removeEventListener('scroll', updatePosition);
  });

  function updatePosition() {
    let scrollLeftMax =
      scrollContainer.scrollWidth - scrollContainer.clientWidth;
    let scrollTopMax =
      scrollContainer.scrollHeight - scrollContainer.clientHeight;
    let x = scrollLeftMax - scrollContainer.scrollLeft;
    let y = scrollTopMax - scrollContainer.scrollTop;

    ui.update((u) => {
      return u.set('scrollPos', List([x, y]));
    });
  }

  function changeCellSize() {
    // let scroll = $ui.get('scrollPos');
    ui.update((u) => u.set('cellSize', newCellSize));
  }
</script>

<div
  on:scroll={updatePosition}
  bind:this={scrollContainer}
  class="container"
  tabindex="0"
>
  <YarnSelector />
  <div class="scrollpane" style={`left: ${width}px; top: ${height}px;`} />
  <div
    bind:this={canvasContainer}
    class="fixed"
    style={`
    right: ${scrollbarWidth}px;
    bottom: ${scrollbarWidth}px
    `}
  >
    <WeaveDisplay bind:this={weaveDisplay} />
  </div>
</div>
<div class="ok-zoomer">
  <input
    type="range"
    min="5"
    max="70"
    on:input={changeCellSize}
    bind:value={newCellSize}
  />
</div>

<style>
  .container {
    overflow: auto;
  }

  .fixed {
    display: flex;
    justify-content: stretch;
    align-items: stretch;

    position: absolute;
    right: 0;
    left: 90px;
    bottom: 0;
    top: 0;

    pointer-events: none;
  }

  .ok-zoomer {
    position: fixed;
    bottom: 0;
    right: 20px;
    z-index: 1000;
  }

  .scrollpane {
    background-color: #5959308f;
    pointer-events: none;
    position: relative;
    width: 10px;
    height: 10px;
  }
</style>
