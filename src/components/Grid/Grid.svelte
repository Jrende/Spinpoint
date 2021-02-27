<script>
  import { onMount, onDestroy } from 'svelte';
  import { line } from '../../util/MathUtil';
  import tinycolor from 'tinycolor2';
  import { vec2 } from 'gl-matrix';

  export let xCount;
  export let yCount;
  export let toggleCell = () => false;
  export let onClick = () => {};
  export let onMouseDown = () => {};
  export let onMouseUp = () => {};
  export let onMouseMove = () => {};
  export let disabled = false;
  export let resizeX = false;
  export let resizeY = false;

  let canvas;
  let ctx;
  let borderSize = 2.5;
  let cellSize = 25;
  let rect;
  let resizeObserver = new ResizeObserver(() => {
    rect = canvas.getBoundingClientRect();
  });
  let resizeStartPos;
  let isResizing = false;

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
    if (!disabled && !isResizing) {
      onMouseDown(event);
    }
  }

  function onCanvasMouseMove(event) {
    if (!disabled && !isResizing) {
      onMouseMove(event);
    }
  }

  function onCanvasMouseUp() {
    if (!disabled && !isResizing) {
      onMouseUp(event);
    }
  }

  function onCanvasClick() {
    if (!disabled && !isResizing) {
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
    ctx.fillStyle = disabled ? '#ababab' : 'white';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = disabled ? 'gray' : 'black';
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

  function onResizeMouseDown(e) {
    resizeStartPos = [e.pageX, e.pageY];
    isResizing = true;
    document.body.addEventListener('pointermove', onResizeMouseMove);
    document.body.addEventListener('pointerup', onBodyMouseUp);
    if (resizeX) {
      document.body.style.cursor = 'col-resize';
    } else if (resizeY) {
      document.body.style.cursor = 'row-resize';
    }
  }

  function onResizeMouseMove(e) {
    if (e.buttons === 0) {
      stopDrag();
      return;
    }
    let endPos = [e.pageX, e.pageY];
    let diff = vec2.sub(vec2.create(), endPos, resizeStartPos);
    let d = diff[resizeX ? 0 : 1] / cellSize;
    let numCells;
    if (d > 0.0) {
      numCells = Math.floor(d);
    } else {
      numCells = -Math.floor(Math.abs(d));
    }
    if (numCells !== 0) {
      if (resizeX && xCount + numCells > 0) {
        xCount += numCells;
        resizeStartPos = [
          resizeStartPos[0] + numCells * cellSize,
          resizeStartPos[1],
        ];
      } else if (resizeY && yCount + numCells > 0) {
        yCount += numCells;
        resizeStartPos = [
          resizeStartPos[0],
          resizeStartPos[1] + numCells * cellSize,
        ];
      }
    }
  }

  function onBodyMouseUp() {
    stopDrag();
  }

  function stopDrag() {
    document.body.removeEventListener('pointermove', onResizeMouseMove);
    document.body.removeEventListener('pointerup', onBodyMouseUp);
    document.body.style.cursor = '';
    isResizing = false;
  }
</script>

<div class:resizeX class:resizeY>
  <canvas
    on:click={onCanvasClick}
    on:pointerup={onCanvasMouseUp}
    on:pointerdown={onCanvasMouseDown}
    on:pointermove={onCanvasMouseMove}
    bind:this={canvas}
    style={`
    max-width: ${xCount * cellSize + 2.0 * borderSize}px;
    max-height: ${yCount * cellSize + 2.0 * borderSize}px;
    `}
    width="1"
    height="1"
    class:disabled
  />
  {#if !disabled && (resizeX === true || resizeY === true)}
    <button
      class="resize-btn"
      class:disabled
      class:resizeX
      class:resizeY
      on:pointerdown={onResizeMouseDown}
    />
  {/if}
</div>

<style>
  div {
    display: flex;
    align-items: stretch;
    background-color: black;
    margin: auto;
  }

  div.resizeY {
    flex-direction: column;
  }

  canvas {
    image-rendering: crisp-edges;
  }

  canvas:not(.disabled) {
    cursor: pointer;
  }

  .resize-btn {
    border-radius: 15px;
    border: 1px solid black;
    margin: 0;
    padding: 0;
    background-color: black;
    display: flex;
    align-items: stretch;
  }

  .resize-btn.resizeX {
    width: 8px;
    margin-right: 2px;
    cursor: col-resize;
  }

  .resize-btn.resizeY {
    height: 8px;
    margin: 2px;
    cursor: row-resize;
  }

  .resize-btn:after {
    content: '';
    display: block;
    background-color: white;
    border-radius: 12px;
    flex-grow: 1;
  }

  .resize-btn.resizeX:after {
  }

  .resize-btn.resizeY:after {
  }

  .disabled.resize-btn {
    background-color: #ababab;
  }
</style>
