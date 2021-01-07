<script>
  import { onMount, onDestroy } from 'svelte';
  import ui from '../stores/UI';
  import draft from '../stores/Draft';
  import { useFocus } from "svelte-navigator";
  import WeaveDisplay from '../components/WeaveDisplay/WeaveDisplay.svelte';
  import YarnSelector from '../components/YarnSelector/YarnSelector.svelte';
  import ScrollPane from '../components/ScrollPane/ScrollPane.svelte';

  const registerFocus = useFocus();

  let containerElm;
  let canvasContainer;

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
    //let x = ($draft.warpCount * $ui.cellSize + xOffset) - window.scrollX;
    let yOffset = 0;
    //let y = ($draft.pickCount * $ui.cellSize + yOffset) - window.scrollY;
    let canvasRect = canvasContainer.getBoundingClientRect();
    let rect = containerElm.getBoundingClientRect();
    let x = rect.width - window.scrollX - canvasRect.width;
    let y = rect.height - window.scrollY - canvasRect.height;
    
    ui.update((value) => ({
      ...value,
      pos: [x, y]
    }));
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
</style>
