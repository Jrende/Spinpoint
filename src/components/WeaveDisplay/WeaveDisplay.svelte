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
  let warpColor;
  let weftColor;

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
        pos: [
          $draft.treadleCount + 4,
          $draft.shaftCount + 4
        ],
        xCount: $draft.warpCount,
        yCount: $draft.pickCount,
        draft: $draft,
        ui: $ui
      });
      renderer.updateValues(warpColor, {
        pos: [$draft.treadleCount + 4, 1],
        xCount: $draft.warpCount,
        yCount: 1,
        ui: $ui
      });
      renderer.updateValues(weftColor, {
        pos: [1, $draft.shaftCount + 4],
        xCount: 1,
        yCount: $draft.pickCount,
        ui: $ui
      });
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
    tieup = renderer.addGrid(
      (x, y) => $draft.tieup[x][y] === 1,
      (x, y) => {
        draft.update(v => {
          let tieup = v.tieup;
          let tv = tieup[x][y];
          tieup[x][y] = tv === 1 ? 0 : 1;
          return {
            ...v,
            tieup
          };
        });
      }
    );
    threading = renderer.addGrid(
      (x, y) => $draft.threading[x] === y,
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
      (x, y) => $draft.treadling[y] === x,
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
    warpColor = renderer.addGrid(
      (x, y) => true,
      (x, y) => {console.log("Change warp color", x)},
      (x, y) => {
        return $draft.yarn[$draft.warpColors[x]].color;
      }
    );
    weftColor = renderer.addGrid(
      (x, y) => true,
      (x, y) => {console.log("Change weft color", x)},
      (x, y) => {
        return $draft.yarn[$draft.weftColors[x]].color;
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
