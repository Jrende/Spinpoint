<script>
  import { onMount, onDestroy } from 'svelte';
  import { line } from '../../util/MathUtil';
  import tinycolor from 'tinycolor2';

  export let xCount;
  export let yCount;
  export let toggleCell = () => false;
  export let onClick = () => {};
  export let onMouseDown = () => {};
  export let onMouseUp = () => {};
  export let onMouseMove = () => {};
  export let disabled = false;

  let canvas;
  let ctx;
  let borderSize = 2.5;
  let cellSize = 25;
  let rect;
  let resizeObserver = new ResizeObserver(() => {
    rect = canvas.getBoundingClientRect();
  });

  $: {
    if (ctx) {
      syncCanvasDimensions(xCount, yCount);
    }
  }

  $: {
    if (ctx) {
      drawForm(xCount, yCount, disabled);
    }
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    rect = canvas.getBoundingClientRect();
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
    if (!disabled) {
      onMouseDown(event);
    }
  }

  function onCanvasMouseMove(event) {
    if (!disabled) {
      onMouseMove(event);
    }
  }

  function onCanvasMouseUp() {
    if (!disabled) {
      onMouseUp(event);
    }
  }

  function onCanvasClick() {
    if (!disabled) {
      onClick(event);
    }
  }

  export function getBoundingClientRect() {
    return canvas.getBoundingClientRect();
  }

  export function getCellsBetweenPoints(from, to) {
    let fromCell = this.getCellAtPos(from);
    let toCell = this.getCellAtPos(to);
    let linePoints = line(fromCell[0], fromCell[1], toCell[0], toCell[1]);
    return linePoints.filter(
      (p) => p[0] >= 0 && p[0] < xCount && p[1] >= 0 && p[1] < yCount
    );
  }

  export function getCellAtPos(pos) {
    let canvasSize = rect.width;
    let size = (canvasSize - borderSize) / xCount;
    let i = Math.floor(pos[0] / size);
    let j = Math.floor(pos[1] / size);
    return [i, j];
  }

  function fillBorders(width, height) {
    ctx.fillRect(0, 0, borderSize, height);
    ctx.fillRect(width, 0, borderSize, height);
    ctx.fillRect(0, 0, width, borderSize);
    ctx.fillRect(0, height, width + borderSize, borderSize);
  }

  export function drawForm(xCount, yCount, disabled) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (disabled) {
      ctx.fillStyle = 'gray';
    } else {
      ctx.fillStyle = 'black';
    }

    let width = cellSize * xCount + borderSize;
    let height = cellSize * yCount + borderSize;
    fillBorders(width, height);

    for (let i = 1; i < xCount; i++) {
      ctx.fillRect(i * cellSize + borderSize / 2.0, 0, borderSize, height);
    }
    for (let i = 1; i < yCount; i++) {
      ctx.fillRect(0, i * cellSize + borderSize / 2.0, width, borderSize);
    }

    let innerCellMargin = 10;
    for (let i = 0; i < xCount; i++) {
      for (let j = 0; j < yCount; j++) {
        let value = toggleCell(j, i);
        if (value) {
          if (value instanceof Object) {
            ctx.fillStyle = tinycolor.fromRatio(value).toHexString();
          } else {
            ctx.fillStyle = 'black';
          }
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
  class:disabled
/>

<style>
  canvas {
    image-rendering: crisp-edges;
  }

  canvas:not(.disabled) {
    cursor: pointer;
  }
</style>
