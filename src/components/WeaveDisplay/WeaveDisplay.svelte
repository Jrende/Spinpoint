<script>
  import { onMount } from 'svelte';

  import draft from '../../stores/Draft';
  import ui from '../../stores/UI';
  import { Renderer } from './gfx/Renderer';

  let renderer;
  let canvas;
  let parent;

  $: {
    if(renderer) {
      renderer.render($draft, $ui);
    }
  }

  onMount(() => {
    syncCanvasDimensions();
    renderer = new Renderer(canvas, $draft);
    renderer.resizeCanvas();
    renderer.render($draft, $ui);
  });

  function syncCanvasDimensions() {
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
  }

</script>
<div bind:this={parent} class="weave-display">
  <canvas
    bind:this={canvas}
  />
</div>
<style>
  .weave-display {
    display: flex;
    height: 100%;
    width: 100%;
  }

  .weave-display canvas {
    image-rendering: crisp-edges;
  }
</style>
