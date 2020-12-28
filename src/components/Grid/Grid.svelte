<script>
  import { onMount } from 'svelte';

  export let xCellCount;
  export let yCellCount;
  export let vertical;
  export let cellSize;
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
    if(vertical) {
      canvas.width = cellSize * xCellCount + 2.0 * borderSize;
      canvas.height = cellSize * yCellCount + 2.0 * borderSize;
    } else {
      canvas.width = cellSize * yCellCount + 2.0 * borderSize;
      canvas.height = cellSize * xCellCount + 2.0 * borderSize;
    }
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

  function fillBorders(width, height) {
      ctx.fillRect(
        0,
        0,
        borderSize,
        height
      );
      ctx.fillRect(
        width,
        0,
        borderSize,
        height
      );
      ctx.fillRect(
        0,
        0,
        width,
        borderSize
      );
      ctx.fillRect(
        0,
        height,
        width,
        borderSize
      );
  }

  export function drawForm() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = 'black';

    let cw = ctx.canvas.width;
    let ch = ctx.canvas.height;
    //let size = ((vertical ? cw : ch) - borderSize * 2.0) / xCellCount;
    let size = (cellSize - borderSize / 4.0);
    let bluppSize = size / 2.0;

    if(vertical) {
      let width = cellSize * xCellCount + borderSize;
      let height = cellSize * yCellCount + borderSize;
      fillBorders(width, height);
      //ctx.fillRect(borderSize);

      for(let i = 1; i < xCellCount; i++) {
        ctx.fillRect(i * cellSize + borderSize / 2.0, 0, borderSize, height);
      }
      for(let i = 1; i < yCellCount; i++) {
        ctx.fillRect(0, i * cellSize + borderSize / 2.0, width, borderSize);
      }

      let innerCellMargin = 10;
      for(let i = 0; i < xCellCount; i++) {
        for(let j = 0; j < yCellCount; j++) {
          if(toggleCell(j, i)) {
            ctx.fillRect(
              i * cellSize + innerCellMargin / 2.0 + borderSize,
              j * cellSize + innerCellMargin / 2.0 + borderSize,
              cellSize - innerCellMargin,
              cellSize - innerCellMargin
            );
          }
        }
      }
    } else {
      let width = cellSize * yCellCount + borderSize;
      let height = cellSize * xCellCount + borderSize;
      fillBorders(width, height);

      for(let i = 1; i < xCellCount; i++) {
        ctx.fillRect(0, i * cellSize + borderSize / 2.0, width, borderSize);
      }
      for(let i = 1; i < yCellCount; i++) {
        ctx.fillRect(i * cellSize + borderSize / 2.0, 0, borderSize, height);
      }

      let innerCellMargin = 10;
      for(let i = 0; i < yCellCount; i++) {
        for(let j = 0; j < xCellCount; j++) {
          if(toggleCell(i, j)) {
            ctx.fillRect(
              i * cellSize + innerCellMargin / 2.0 + borderSize,
              j * cellSize + innerCellMargin / 2.0 + borderSize,
              cellSize - innerCellMargin,
              cellSize - innerCellMargin
            );
          }
        }
      }
      /*
      for(let i = 0; i < xCellCount + 1; i++) {
        ctx.fillRect(0, i * size, cw, borderSize);
      }
      for(let i = 0; i < yCellCount + 1; i++) {
        ctx.fillRect(i * size, 0, borderSize, ch);
      }
      for(let i = 0; i < yCellCount; i++) {
        for(let j = 0; j < xCellCount; j++) {
          if(toggleCell(i, j)) {
            let tileX = i * (size)
            let tileY = j * (size)
            ctx.fillRect(
              tileX + bluppSize / 2.0,
              tileY + bluppSize / 2.0,
              bluppSize,
              bluppSize
            );
          }
        }
      }
      */
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
