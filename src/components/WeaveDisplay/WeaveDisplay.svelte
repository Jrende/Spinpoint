<script>
  import { onMount } from 'svelte';

  import draft from '../../stores/Draft';
  import ui from '../../stores/UI';
  import { Renderer } from './gfx/Renderer';

  let renderer;
  let canvas;
  let tieup;

  $: {
    if(renderer) {
      renderer.updateValues(tieup, {
        xCount: $draft.treadleCount,
        yCount: $draft.shaftCount,
        ui: $ui
      });
      renderer.render();
    }
  }

  onMount(() => {
    syncCanvasDimensions();
    renderer = new Renderer(canvas);
    tieup = renderer.addRenderer(
      'grid',
      [3, 3],
      (i, j) => $draft.tieup[i][j] === 1,
      (i, j) => {
        draft.update(v => {
          let tieup = v.tieup;
          let tv = tieup[i][j];
          tieup[i][j] = tv === 1 ? 0 : 1;
          return {
            ...v,
            tieup
          };
        });
      }
    );
    renderer.resizeCanvas();
  });

  function syncCanvasDimensions() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

</script>
<canvas class="weave-display" bind:this={canvas} />
<style>
  .weave-display {
    image-rendering: crisp-edges;
  }
</style>
