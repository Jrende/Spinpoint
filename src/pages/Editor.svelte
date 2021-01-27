<script>
  import { onMount, onDestroy, afterUpdate } from 'svelte';
  import { Map, List } from 'immutable';
  import ui from '../stores/UI';
  import draft from '../stores/Draft';
  import { useFocus } from "svelte-navigator";
  import WeaveDisplay from '../components/WeaveDisplay/WeaveDisplay.svelte';
  import YarnSelector from '../components/YarnSelector/YarnSelector.svelte';
  import ScrollPane from '../components/ScrollPane/ScrollPane.svelte';

  const registerFocus = useFocus();

  let scrollContainer;
  let canvasContainer;
  let newCellSize = $ui.get('cellSize');

  let scrollbarWidth = 15; //Works for chrome and firefox
  let weaveDisplay;

  let resizeObserver;

  onMount(() => {
    scrollbarWidth = scrollContainer.offsetWidth - scrollContainer.clientWidth;
    scrollContainer.addEventListener('scroll', updatePosition);
    let scrollLeftMax = scrollContainer.scrollWidth - scrollContainer.clientWidth
    let scrollTopMax = scrollContainer.scrollHeight - scrollContainer.clientHeight
    scrollContainer.scrollTo(
      scrollLeftMax,
      scrollTopMax
    );
    resizeObserver = new ResizeObserver(entries => {
      weaveDisplay.syncCanvasDimensions();
    });
    resizeObserver.observe(canvasContainer);

    scrollContainer.addEventListener('pointermove', e => {
      let evt = createMouseEvent('pointermove', e);
      weaveDisplay.dispatchEvent(evt);
    });
    scrollContainer.addEventListener('pointerup', e => {
      let evt = createMouseEvent('pointerup', e);
      weaveDisplay.dispatchEvent(evt);
    });
    scrollContainer.addEventListener('pointerdown', e => {
      let evt = createMouseEvent('pointerdown', e);
      weaveDisplay.dispatchEvent(evt);
    });
    scrollContainer.addEventListener('click', e => {
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
      movementY: e.movementY
    });
  }

  onDestroy(() => {
    scrollContainer.removeEventListener('scroll', updatePosition);
  });

  function updatePosition(event) {
    let xOffset = 0;
    let yOffset = 0;
    let canvasRect = canvasContainer.getBoundingClientRect();
    let rect = scrollContainer.getBoundingClientRect();
    let scrollLeftMax = scrollContainer.scrollWidth - scrollContainer.clientWidth
    let scrollTopMax = scrollContainer.scrollHeight - scrollContainer.clientHeight
    let x = scrollLeftMax - scrollContainer.scrollLeft;
    let y = scrollTopMax - scrollContainer.scrollTop;
    
    ui.update(u => {
      return u.set('scrollPos', List([x, y]))
    });
  }

  function changeCellSize() {
    ui.update(u => u.set('cellSize', newCellSize));
  }

</script>
<div on:scroll={updatePosition} bind:this={scrollContainer} class="container" tabindex="0">
  <YarnSelector />
  <ScrollPane />
  <div bind:this={canvasContainer} class="fixed" style={`
                                   right: ${scrollbarWidth}px;
                                   bottom: ${scrollbarWidth}px
                                   `}>
    <WeaveDisplay bind:this={weaveDisplay} />
  </div>
</div>
<div class="ok-zoomer">
  <input type="range" min="5" max="70" on:input={changeCellSize} bind:value={newCellSize} />
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

  .scrollbar-measure {
    width: 100px;
    height: 100px;
    overflow: scroll;
    position: absolute;
    top: -9999px;
  }

</style>
