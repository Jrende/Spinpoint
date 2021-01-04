<script>
  import { onMount } from 'svelte';
  import ui from '../../stores/UI';

  export let xCellCount;
  export let yCellCount;
  export let toggleCell = (x, y) => false;
  export let onClick = (x, y) => { };

  let canvas;
  let parent;
  let ctx;
  let borderSize = $ui.borderSize;
  let cellSize = $ui.cellSize / 2.0;
  $: {
    if(ctx) {
      drawForm(xCellCount, yCellCount);
    }
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    syncCanvasDimensions();
  });


  function syncCanvasDimensions() {
      canvas.width = cellSize * xCellCount + 2.0 * borderSize;
      canvas.height = cellSize * yCellCount + 2.0 * borderSize;
  }

  function onCanvasClick() {
    let rect = canvas.getBoundingClientRect();
    let canvasSize = rect.width;
    let size = (canvasSize - borderSize) / xCellCount;
    let i = Math.floor(event.offsetX / size);
    let j = Math.floor(event.offsetY / size);
    onClick(j, i);
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

  export function drawForm(xCellCount, yCellCount) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = 'black';

    let cw = ctx.canvas.width;
    let ch = ctx.canvas.height;
    let size = (cellSize - borderSize / 4.0);
    let bluppSize = size / 2.0;

    let width = cellSize * xCellCount + borderSize;
    let height = cellSize * yCellCount + borderSize;
    fillBorders(width, height);

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
