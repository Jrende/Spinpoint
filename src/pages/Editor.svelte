<script>
  import { onMount, onDestroy } from 'svelte';
  import { Map, List } from 'immutable';
  import ui from '../stores/UI';
  import draft from '../stores/Draft';
  import { useFocus } from "svelte-navigator";
  import WeaveDisplay from '../components/WeaveDisplay/WeaveDisplay.svelte';
  import YarnSelector from '../components/YarnSelector/YarnSelector.svelte';
  import ScrollPane from '../components/ScrollPane/ScrollPane.svelte';

  const registerFocus = useFocus();

  let containerElm;
  let canvasContainer;
  let newCellSize = $ui.get('cellSize');

  onMount(() => {
    window.scrollTo(
      document.body.scrollWidth,
      document.body.scrollHeight
    );
    document.addEventListener('scroll', updatePosition);
  });

  onDestroy(() => {
    document.removeEventListener('scroll', updatePosition);
  });

  function updatePosition(event) {
    let xOffset = 0;
    let yOffset = 0;
    let canvasRect = canvasContainer.getBoundingClientRect();
    let rect = containerElm.getBoundingClientRect();
    let x = rect.width - window.scrollX - canvasRect.width;
    let y = rect.height - window.scrollY - canvasRect.height;
    
    ui.update(u => {
      return u.set('pos', List([x, y]))
    });
  }

  function changeCellSize() {
    ui.update(u => u.set('cellSize', newCellSize));
  }

</script>

<div class="container-container" bind:this={containerElm} >
  <div class="container">
    <div class="fixed" bind:this={canvasContainer}>
      <YarnSelector />
      <WeaveDisplay />
    </div>
  </div>
  <ScrollPane />
  <div class="ok-zoomer">
    <input type="range" min="10" max="70" on:input={changeCellSize} bind:value={newCellSize} />
  </div>
</div>

<style>

  .container-container {
    position: relative;
  }

  .container {
    overflow: auto;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
  
  .fixed {
    position: fixed;
    height: 100%;
  }

  .ok-zoomer {
    position: fixed;
    bottom: -15px;
    right: 10px;
  }

</style>
