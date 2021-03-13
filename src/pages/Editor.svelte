<script>
  import { onMount, onDestroy } from 'svelte';
  import { List } from 'immutable';
  import ui from '../stores/UI';
  import draft from '../stores/Draft';
  import WeaveDisplay from '../components/WeaveDisplay/WeaveDisplay.svelte';
  import RulerBar from '../components/RulerBar/RulerBar.svelte';
  import YarnSelector from '../components/YarnSelector/YarnSelector.svelte';
  import InfoBar from '../components/InfoBar/InfoBar.svelte';

  let scrollContainer;
  let canvasContainer;
  let canvasWidth;
  let canvasHeight;
  let newCellSize = $ui.get('cellSize');

  let scrollbarWidth = 15;
  let weaveDisplay;

  let resizeObserver;

  $: warpCount = $draft.get('warpCount');
  $: pickCount = $draft.get('pickCount');
  $: cellSize = $ui.get('cellSize');
  $: width = warpCount * cellSize;
  $: height = pickCount * cellSize;

  function reducePrecision(num) {
    return Math.floor(num / 2) * 2;
  }

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

    let rect = canvasContainer.getBoundingClientRect();
    canvasWidth = rect.width;
    canvasHeight = rect.height;
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
    let x = reducePrecision(scrollLeftMax - scrollContainer.scrollLeft);
    let y = reducePrecision(scrollTopMax - scrollContainer.scrollTop);

    ui.update((u) => {
      return u.set('scrollPos', List([x, y]));
    });
  }

  function changeCellSize() {
    ui.update((u) => u.set('cellSize', reducePrecision(newCellSize)));
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
    bind:this={canvasContainer}
    class="fixed"
    style={`
    right: ${scrollbarWidth}px;
    bottom: ${scrollbarWidth}px
    `}
  >
    <div class="tool-bar">
      <YarnSelector />
      <div class="ok-zoomer">
        <input
          type="range"
          min="5"
          max="70"
          on:input={changeCellSize}
          bind:value={newCellSize}
        />
      </div>
    </div>
    <div class="weave-container">
      <WeaveDisplay bind:this={weaveDisplay} />
      <RulerBar
        width={canvasWidth}
        stepCount={$draft.get('warpCount')}
        distance={$ui.get('xStepDistance')}
        position={[$draft.get('treadleCount') + 4, 2]}
      />
      <RulerBar
        height={canvasHeight}
        stepCount={$draft.get('pickCount')}
        distance={$ui.get('yStepDistance')}
        position={[2, $draft.get('shaftCount') + 4]}
      />
    </div>
    <InfoBar />
  </div>
</div>

<style>
  .container {
    overflow: auto;
  }

  .tool-bar {
    justify-content: space-around;
    display: flex;
    min-height: 20px;
    width: 100%;
    background-color: white;
    pointer-events: all;
    z-index: 5;
  }

  .tool-bar {
    border-bottom: 1px solid black;
  }

  .fixed {
    display: flex;
    justify-content: stretch;
    align-items: stretch;
    flex-direction: column;

    position: absolute;
    right: 0;
    left: 90px;
    bottom: 0;
    top: 0;

    pointer-events: none;
  }

  .ok-zoomer {
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

  .weave-container {
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>
