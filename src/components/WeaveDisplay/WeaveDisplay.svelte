<script>
  import { onMount } from 'svelte';

  import draft from '../../stores/Draft';
  import ui from '../../stores/UI';
  import { Renderer } from './gfx/Renderer';

  let renderer;
  let canvas;
  let tieup;
  let treadling;
  let threading;
  let weave;

  $: {
    if(renderer) {
      renderer.updateValues(tieup, {
        pos: [3, 3],
        xCount: $draft.treadleCount,
        yCount: $draft.shaftCount,
        ui: $ui
      });
      renderer.updateValues(threading, {
        pos: [$draft.treadleCount + 4, 3],
        xCount: $draft.warpCount,
        yCount: $draft.shaftCount,
        ui: $ui
      });
      renderer.updateValues(treadling, {
        pos: [3, $draft.shaftCount + 4],
        xCount: $draft.treadleCount,
        yCount: $draft.pickCount,
        ui: $ui
      });
      renderer.updateValues(weave, {
        pos: [$draft.treadleCount + 4, $draft.shaftCount + 4],
        xCount: $draft.warpCount,
        yCount: $draft.pickCount,
        ui: $ui
      });
      renderer.render();
    }
  }

  onMount(() => {
    syncCanvasDimensions();
    renderer = new Renderer(canvas);
    tieup = renderer.addGrid(
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
    threading = renderer.addGrid(
      (i, j) => $draft.threading[i] === j,
      (x, y) => {
        let t = $draft.threading;
        if(t[x] === y) {
          t[x] = undefined;
        } else {
          t[x] = y;
        }
        draft.update((value) => ({
          ...value,
          threading: t
        }));
      }
    );
    treadling = renderer.addGrid(
      (i, j) => $draft.treadling[j] === i,
      (x, y) => {
        let t = $draft.treadling;
        if(t[y] === x) {
          t[y] = undefined;
        } else {
          t[y] = x;
        }
        draft.update((value) => ({
          ...value,
          treadling: t
        }));
      }
    );

    weave = renderer.addWeave();
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
