<script>
  import { onMount } from 'svelte';

  import draft from '../../stores/Draft';
  import ui from '../../stores/UI';
  import { Renderer } from './gfx/Renderer';
  import ScrollPane from '../ScrollPane/ScrollPane.svelte';

  let renderer;
  let canvas;
  let tieup;
  let treadling;
  let threading;
  let weave;
  let warpColor;
  let weftColor;

  $: {
    if(renderer) {
      renderer.update($draft, $ui);
      renderer.setRendererPosition($draft);
      try {
        renderer.render();
      } catch (e) {
        console.error(e);
      }
    }
  }

  onMount(() => {
    syncCanvasDimensions();
    renderer = new Renderer(canvas);
    renderer.resizeCanvas();
    renderer.onTieupClick((x, y) => {
      draft.update(v => {
        let tieup = v.tieup;
        let tv = tieup[x][y];
        tieup[x][y] = tv === 1 ? 0 : 1;
        return {
          ...v,
          tieup
        };
      });
    });
  });

  function setWeftColor(x) {
    draft.update(value => ({
      ...value,
      weftColors: value.weftColors.map((c, i) => i === x ? $ui.selectedColor : c)
    }));
  }

  function setWarpColor(x) {
    draft.update(value => ({
      ...value,
      warpColors: value.warpColors.map((c, i) => i === x ? $ui.selectedColor : c)
    }));
  }

  function syncCanvasDimensions() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

</script>
<div class="container">
  <canvas class="weave-display" bind:this={canvas} />
</div>
<style>
  .container {
    height: 100%;
  }

  .weave-display {
    image-rendering: crisp-edges;
    width: 100%;
    height: 100%;
  }
</style>
