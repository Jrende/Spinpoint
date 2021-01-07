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
      {
        click: (x, y) => {
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
      }
    );

    threading = renderer.addGrid(
      (x, y) => $draft.threading[x] === y,
      {
        click: (x, y) => {
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
      }
    );

    treadling = renderer.addGrid(
      (x, y) => $draft.treadling[y] === x,
      {
        click: (x, y) => {
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
      }
    );
    warpColor = renderer.addGrid(
      (x, y) => {
        return $draft.yarn[$draft.warpColors[x]].color;
      },
      {
        click: (x, y) => {setWarpColor(x)},
      },
      {
        innerCellMargin: 10
      }
    );
    weftColor = renderer.addGrid(
      (x, y) => {
        return $draft.yarn[$draft.weftColors[y]].color;
      },
      {
        click: (x, y) => {setWeftColor(y)},
      },
      {
        innerCellMargin: 10
      }
    );
    weave = renderer.addWeave();
    renderer.resizeCanvas();
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
