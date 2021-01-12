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
      draft.update(d => d.updateIn(['tieup', x, y], i => i === 1 ? 0 : 1));
    });

    renderer.onThreadingClick((x, y) => {
      draft.update(d => d.updateIn(['threading', x], (v) => {
        if(v === y) {
          return undefined;
        } else {
          return y;
        }
      }))
    });

    renderer.onTreadlingClick((x, y) => {
      draft.update(d => 
        d.updateIn(['treadling', y], (v) => {
          if(v === x) {
            return undefined;
          } else {
            return x;
          }
        }))
    });

    renderer.onWarpColorClick((x, y) => {
      draft.update(d => d.setIn(['warpColors', x], $ui.get('selectedColor')));
    });

    renderer.onWeftColorClick((x, y) => {
      draft.update(d => d.setIn(['weftColors', y], $ui.get('selectedColor')));
    });
  });

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
