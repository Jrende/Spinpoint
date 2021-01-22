<script>
  import { onMount } from 'svelte';
  import ui from '../../stores/UI';

  export let xCount;
  export let yCount;
  export let toggleCell = (x, y) => false;
  export let onClick = (x, y) => { };
  export let disabled = false;
  export let data;

  let canvas;
  let ctx;
  let borderSize = 2.5;
  let cellSize = 25;
  $: {
    if(ctx) {
      syncCanvasDimensions(xCount, yCount);
    }
  }

  $: {
    if(ctx) {
      drawForm(xCount, yCount, disabled);
    }
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
  });

  function syncCanvasDimensions(xCount, yCount) {
      canvas.width = cellSize * xCount + 2.0 * borderSize;
      canvas.height = cellSize * yCount + 2.0 * borderSize;
  }

  function onCanvasClick() {
    if(!disabled) {
      let rect = canvas.getBoundingClientRect();
      let canvasSize = rect.width;
      let size = (canvasSize - borderSize) / xCount;
      let i = Math.floor(event.offsetX / size);
      let j = Math.floor(event.offsetY / size);
      onClick(j, i);
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
      width + borderSize,
      borderSize
    );
  }

  export function drawForm(xCount, yCount, disabled) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if(disabled) {
      ctx.fillStyle = 'gray';
    } else {
      ctx.fillStyle = 'black';
    }

    let cw = ctx.canvas.width;
    let ch = ctx.canvas.height;
    let size = (cellSize - borderSize / 4.0);
    let bluppSize = size / 2.0;

    let width = cellSize * xCount + borderSize;
    let height = cellSize * yCount + borderSize;
    fillBorders(width, height);

    for(let i = 1; i < xCount; i++) {
      ctx.fillRect(i * cellSize + borderSize / 2.0, 0, borderSize, height);
    }
    for(let i = 1; i < yCount; i++) {
      ctx.fillRect(0, i * cellSize + borderSize / 2.0, width, borderSize);
    }

    let innerCellMargin = 10;
    for(let i = 0; i < xCount; i++) {
      for(let j = 0; j < yCount; j++) {
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
<canvas on:click={onCanvasClick} bind:this={canvas} width="1" height="1" class:disabled={disabled} />

<style>
  .grid {
    min-height: 100px;
    min-width: 100px;
    height: 100%;
    width: 100%;
  }

  canvas {
    image-rendering: crisp-edges;
  }

  canvas:not(.disabled) {
    cursor: pointer;
  }


</style>
