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

  let isDragging = false;
  let linePoints = [0, 1, 2, 3, 3, 2, 2, 1, 2, 3, 0];

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
    renderer = new Renderer(canvas);
    syncCanvasDimensions();
    renderer.tieup.onClick((x, y) => {
      draft.update(d => d.updateIn(['tieup', x, y], i => i === 1 ? 0 : 1));
    });

    renderer.threading.onClick((x, y) => {
      draft.update(d => d.updateIn(['threading', x], (v) => v === y ? undefined : y))
    });

    renderer.treadling.onClick((x, y) => {
      draft.update(d => d.updateIn(['treadling', y], (v) => v === x ? undefined : x))
    });

    renderer.treadling.onPointerMove((x, y) => {
    });

    renderer.warpColor.onClick((x, y) => {
      draft.update(d => d.setIn(['warpColors', x], $ui.get('selectedColor')));
    });

    renderer.weftColor.onClick((x, y) => {
      draft.update(d => d.setIn(['weftColors', y], $ui.get('selectedColor')));
    });
  });

  export function syncCanvasDimensions() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    renderer.resizeCanvas();
    renderer.render();
  }

</script>
<canvas class="weave-display" bind:this={canvas} />
<style>
  .weave-display {
    image-rendering: crisp-edges;
    width: 100%;
    height: 100%;
  }
</style>
