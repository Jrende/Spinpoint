<script>
  import { onMount, onDestroy } from 'svelte';
  import ui from '../../stores/UI';

  export let xCount;
  export let yCount;
  export let toggleCell = (x, y) => false;
  export let onClick = (x, y) => { };
  export let onMouseDown = (x, y) => { };
  export let onMouseUp = (x, y) => { };
  export let onMouseMove = (x, y) => { };
  export let disabled = false;

  let canvas;
  let ctx;
  let borderSize = 2.5;
  let cellSize = 25;
  let rect;
  let resizeObserver = new ResizeObserver(entries => {
    rect = canvas.getBoundingClientRect();
  });
  let dx = 0;
  let dy = 0;
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
    resizeObserver.observe(canvas);
  });
  
  onDestroy(() => {
    resizeObserver.unobserve(canvas);
  });

  function syncCanvasDimensions(xCount, yCount) {
      canvas.width = cellSize * xCount + 2.0 * borderSize;
      canvas.height = cellSize * yCount + 2.0 * borderSize;
  }

  function onCanvasMouseDown(event) {
    if(!disabled) {
      let indices = getIndices(event);
      onMouseDown(...indices, event);
    }
  }

  function onCanvasMouseMove(event) {
    if(!disabled) {
      let indices = getIndices(event);
      onMouseMove(...indices, event);
    }
  }

  function onCanvasMouseUp() {
    if(!disabled) {
      let indices = getIndices(event);
      onMouseUp(...indices, event);
    }
  }

  function onCanvasClick() {
    if(!disabled) {
      let indices = getIndices(event);
      onClick(...indices, event);
    }
  }

  function getIndices(event) {
    let canvasSize = rect.width;
    let size = (canvasSize - borderSize) / xCount;
    let i = Math.floor(event.offsetX / size);
    let j = Math.floor(event.offsetY / size);
    return [i, j];
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

<canvas
  on:click={onCanvasClick}
  on:pointerup={onCanvasMouseUp}
  on:pointerdown={onCanvasMouseDown}
  on:pointermove={onCanvasMouseMove}
  bind:this={canvas}
  width="1"
  height="1"
  class:disabled={disabled}
  />

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
