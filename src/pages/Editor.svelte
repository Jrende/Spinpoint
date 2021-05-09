<script>
  import { onMount, afterUpdate } from 'svelte';
  import ui from '../stores/UI';
  import draft from '../stores/Draft';
  import WeaveDisplay from '../components/WeaveDisplay/WeaveDisplay.svelte';
  import RulerBar from '../components/RulerBar/RulerBar.svelte';
  import YarnSelector from '../components/YarnSelector/YarnSelector.svelte';
  import InfoBar from '../components/InfoBar/InfoBar.svelte';

  let infobarContainer;
  let toolbarContainer;
  let scrollContainer;
  let canvasContainer;
  let canvasWidth;
  let canvasHeight;
  let cellSizeInput = $ui.cellSize;
  let hasChangedCellSize;
  let scrollPercentage = [];

  let infobarHeight = 0;
  let toolbarHeight = 0;
  let scrollbarWidth = 15;
  let scrollbarHeight = 15;
  let weaveDisplay;

  let resizeObserver;

  $: warpCount = $draft.warpCount;
  $: pickCount = $draft.pickCount;
  $: cellSize = $ui.cellSize;
  $: width = warpCount * cellSize;
  $: height = pickCount * cellSize;

  function reducePrecision(num) {
    return Math.floor(num / 2) * 2;
  }

  afterUpdate(() => {
    if (hasChangedCellSize) {
      hasChangedCellSize = false;
      let [scrollLeftMax, scrollTopMax] = getBounds();
      let x = (1.0 - scrollPercentage[0]) * scrollLeftMax;
      let y = (1.0 - scrollPercentage[1]) * scrollTopMax;
      scrollContainer.scrollTo(x, y);
    }
  });

  onMount(() => {
    scrollbarWidth = scrollContainer.offsetWidth - scrollContainer.clientWidth;
    scrollbarHeight =
      scrollContainer.offsetHeight - scrollContainer.clientHeight;
    toolbarHeight = toolbarContainer.clientHeight;
    infobarHeight = infobarContainer.clientHeight;

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

    scrollContainer.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    scrollContainer.addEventListener('wheel', (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
        cellSizeInput += event.deltaY * -0.03;
        cellSizeInput = Math.max(5, Math.min(70, cellSizeInput));
        changeCellSize();
      }
    });

    [
      'mousemove',
      'mouseup',
      'mousedown',
      'pointermove',
      'pointerup',
      'pointerdown',
      'click',
    ].forEach((eventName) => {
      scrollContainer.addEventListener(eventName, (e) => {
        if (e.target === scrollContainer) {
          let evt = createMouseEvent(eventName, e);
          weaveDisplay.dispatchEvent(evt);
        }
      });
    });

    let rect = canvasContainer.getBoundingClientRect();
    canvasWidth = rect.width;
    canvasHeight = rect.height;
  });

  function createMouseEvent(name, e) {
    return new MouseEvent(name, {
      clientX: e.clientX,
      clientY: e.clientY,
      buttons: e.buttons,
      button: e.button,
      movementX: e.movementX,
      movementY: e.movementY,
    });
  }

  function getBounds() {
    let scrollLeftMax =
      scrollContainer.scrollWidth - scrollContainer.clientWidth;
    let scrollTopMax =
      scrollContainer.scrollHeight - scrollContainer.clientHeight;
    return [scrollLeftMax, scrollTopMax];
  }

  function getPosition() {
    let [scrollLeftMax, scrollTopMax] = getBounds();
    let x = reducePrecision(scrollLeftMax - scrollContainer.scrollLeft);
    let y = reducePrecision(scrollTopMax - scrollContainer.scrollTop);
    return [x, y];
  }

  function updatePosition() {
    let pos = getPosition();
    ui.update((draft) => {
      draft.scrollPos = pos;
    });
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

<div
  on:scroll={updatePosition}
  bind:this={scrollContainer}
  class="container"
  tabindex="0"
>
  <div class="scrollpane" style={`left: ${width}px; top: ${height}px;`} />
  <div
    class="tool-bar"
    bind:this={toolbarContainer}
    style={`right: ${scrollbarWidth}px`}
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
  <div
    bind:this={canvasContainer}
    class="fixed"
    style={`
    top: ${toolbarHeight}px;
    right: ${scrollbarWidth}px;
    bottom: ${scrollbarWidth + infobarHeight}px
    `}
  >
    <div class="weave-container">
      <WeaveDisplay bind:this={weaveDisplay} />
      <RulerBar
        width={canvasWidth}
        stepCount={$draft.warpCount}
        distance={$ui.xStepDistance}
        position={[$draft.treadleCount + 4, 2]}
      />
      <RulerBar
        height={canvasHeight}
        stepCount={$draft.pickCount}
        distance={$ui.yStepDistance}
        position={[2, $draft.shaftCount + 4]}
      />
    </div>
  </div>
  <div
    class="infobarContainer-container"
    bind:this={infobarContainer}
    style={`bottom: ${scrollbarHeight}px; right: ${scrollbarWidth}px`}
  >
    <InfoBar
      bind:this={infobarContainer}
      style="background-color: black !important"
    />
  </div>
</div>

<style>
  .container {
    overflow: auto;
    --left-menu-width: 90px;
  }

  .infobarContainer-container {
    position: absolute;
    bottom: 0;
    left: var(--left-menu-width);
  }

  .tool-bar {
    position: absolute;
    top: 0;
    left: var(--left-menu-width);

    justify-content: space-around;
    display: flex;
    min-height: 20px;
    width: 100%;
    background-color: white;
    pointer-events: all;
    z-index: 5;
    border-bottom: 1px solid black;
  }

  .fixed {
    display: flex;
    justify-content: stretch;
    align-items: stretch;
    flex-direction: column;

    position: absolute;
    right: 0;
    left: var(--left-menu-width);
    bottom: 0;
    top: 0;

    pointer-events: none;
  }

  .ok-zoomer {
    right: 20px;
    z-index: 1000;
  }

  .ok-zoomer input {
    padding: 0;
  }

  .scrollpane {
    background-color: #5959308f;
    pointer-events: none;
    position: relative;
    width: 10px;
    height: 10px;
  }

  .weave-container {
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>
