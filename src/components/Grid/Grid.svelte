<script>
  import { onMount } from 'svelte';

  export let xCellCount;
  export let yCellCount;
  export let vertical;
  export let borderSize;
  export let toggleCell = (x, y) => false;
  export let onClick = (x, y) => { };

  let canvas;
  let parent;
  let ctx;

  onMount(() => {
    ctx = canvas.getContext('2d');
    syncCanvasDimensions();
  });


  function syncCanvasDimensions() {
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
  }

  function onCanvasClick() {
    let rect = canvas.getBoundingClientRect();
    let canvasSize = vertical ? rect.width : rect.height;
    let size = (canvasSize - borderSize) / xCellCount;
    let i = Math.floor(event.offsetX / size);
    let j = Math.floor(event.offsetY / size);
    if(vertical) {
      onClick(j, i);
    } else {
      onClick(i, j);
    }
  }

  export function drawForm() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = 'black';

    let cw = ctx.canvas.width;
    let ch = ctx.canvas.height;
    let size = ((vertical ? cw : ch) - borderSize * 2.0) / xCellCount;
    let bluppSize = size / 2.0;

    if(vertical) {
      for(let i = 0; i < xCellCount + 1; i++) {
        ctx.fillRect(i * (size + borderSize/xCellCount), 0, borderSize, ch);
      }
      for(let i = 0; i < yCellCount + 1; i++) {
        ctx.fillRect(0, i * (size + borderSize/yCellCount), cw, borderSize);
      }

      for(let i = 0; i < xCellCount; i++) {
        for(let j = 0; j < yCellCount; j++) {
          if(toggleCell(j, i)) {
            let tileX = i * (size + borderSize/xCellCount) + size / 2.0;
            let tileY = j * (size + borderSize/yCellCount) + size / 2.0;
            ctx.fillRect(
              tileX - bluppSize / 2.0,
              tileY - bluppSize / 2.0,
              bluppSize,
              bluppSize
            );
          }
        }
      }
    } else {
      for(let i = 0; i < xCellCount + 1; i++) {
        ctx.fillRect(0, i * (size + borderSize/yCellCount), cw, borderSize);
      }
      for(let i = 0; i < yCellCount + 1; i++) {
        ctx.fillRect(i * (size + borderSize/xCellCount), 0, borderSize, ch);
      }

      for(let i = 0; i < yCellCount; i++) {
        for(let j = 0; j < xCellCount; j++) {
          if(toggleCell(i, j)) {
            let tileX = i * (size + borderSize/xCellCount) + size / 2.0;
            let tileY = j * (size + borderSize/yCellCount) + size / 2.0;
            ctx.fillRect(
              tileX - bluppSize / 2.0,
              tileY - bluppSize / 2.0,
              bluppSize,
              bluppSize
            );
          }
        }
      }
    }
  }
</script>

<div bind:this={parent} class="grid">
  <canvas on:click={onCanvasClick} bind:this={canvas} width="1" height="1" />
</div>

<style>
  .grid {
    height: 100%;
    width: 100%;
  }

  .grid canvas {
    image-rendering: crisp-edges;
  }
</style>
