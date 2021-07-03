<script>
  import { onMount } from 'svelte';
  import draft from '../../../../../stores/Draft';
  import draftUtil from '../../../../../util/DraftUtil';
  import Grid from '../../../../../components/Grid/Grid.svelte';
  import { _ } from 'svelte-i18n';

  export let warpOrWeft;
  export let disabled = false;

  let grid;
  let mirroredRepeat = true;
  let oldWarpOfWeft;

  let isDragging = false;
  let startPos = undefined;
  let linePoints = [];

  let xCount = 0;
  let yCount = 0;
  let cellData = [];

  $: treadleCount = $draft.treadleCount;
  $: shaftCount = $draft.shaftCount;

  onMount(() => {
    xCount = shaftCount;
    yCount = treadleCount;
  });

  $: {
    if (oldWarpOfWeft !== warpOrWeft) {
      [xCount, yCount] = [yCount, xCount];
      oldWarpOfWeft = warpOrWeft;
      normalizeCellData();
    }
  }

  function normalizeCellData() {
    //cellData.splice(yCount, cellData.length);
    cellData = cellData.map((v) => (v > xCount - 1 ? undefined : v));
  }

  export function apply() {
    draft.update((temp) => {
      let length = warpOrWeft === 'warp' ? xCount : yCount;
      let cellDataSlice = [...cellData];
      cellDataSlice.splice(length, cellData.length);
      draftUtil.applyPattern(temp, cellDataSlice, warpOrWeft, mirroredRepeat);
    });
  }

  function onGridMouseMove(event) {
    event.stopPropagation();
    if (event.buttons === 0) {
      startPos = undefined;
      isDragging = false;
      return;
    }
    let rect = grid.getBoundingClientRect();
    let pos = [event.clientX - rect.left, event.clientY - rect.top];
    if (
      isDragging === false &&
      event.buttons & 1 &&
      (event.movementX !== 0 || event.movementY !== 0)
    ) {
      isDragging = true;
      startPos = pos;
    }
    if (isDragging) {
      let lp = grid.getCellsBetweenPoints(startPos, pos);
      linePoints = [];
      lp.forEach((p) => {
        if (warpOrWeft === 'weft') {
          linePoints[p[1]] = p[0];
        } else if (warpOrWeft === 'warp') {
          linePoints[p[0]] = p[1];
        }
      });
      linePoints = addArrays(linePoints, cellData);
      grid.drawForm(xCount, yCount, false);
    }
  }

  function onGridMouseUp(event) {
    if (isDragging) {
      cellData = addArrays(linePoints, cellData);
      startPos = undefined;
      linePoints = undefined;
      isDragging = false;
      document.body.removeEventListener('mousemove', onGridMouseMove);
    } else {
      let rect = grid.getBoundingClientRect();
      let pos = [event.clientX - rect.left, event.clientY - rect.top];
      let [i, j] = grid.getCellAtPos(pos);
      if (warpOrWeft === 'warp') {
        cellData[i] = cellData[i] === j ? undefined : j;
      } else if (warpOrWeft === 'weft') {
        cellData[j] = cellData[j] === i ? undefined : i;
      }
    }
    grid.drawForm(xCount, yCount, false);
  }

  function addArrays(left, right) {
    let ret = [...right];
    for (let i = 0; i < left.length; i++) {
      if (left[i] !== undefined) {
        ret[i] = left[i];
      }
    }
    return ret;
  }

  function toggleCell(i, j) {
    let x, y;
    if (warpOrWeft === 'warp') {
      x = j;
      y = i;
    } else if (warpOrWeft === 'weft') {
      x = i;
      y = j;
    }

    if (isDragging) {
      return linePoints[x] === y;
    } else {
      return cellData[x] === y;
    }
  }

  function onGridMouseDown() {
    document.body.addEventListener('mousemove', onGridMouseMove);
  }
</script>

<div class="pattern-fill">
  {#if warpOrWeft !== undefined}
    <div class={'canvas ' + warpOrWeft}>
      <Grid
        bind:this={grid}
        bind:xCount
        bind:yCount
        resizeX={warpOrWeft === 'warp'}
        resizeY={warpOrWeft === 'weft'}
        {toggleCell}
        onMouseDown={onGridMouseDown}
        onMouseUp={onGridMouseUp}
        {disabled}
      />
    </div>
    <div class="controls">
      <fieldset>
        <label for="mirrored-repeat"
          >{$_('page.pattern_fill.mirrored_repeat')}</label
        >
        <input
          type="checkbox"
          bind:checked={mirroredRepeat}
          name="mirrored-repeat"
          id="mirrored-repeat"
        />
      </fieldset>
    </div>
  {/if}
</div>

<style>
  .pattern-fill {
    display: flex;
    flex-direction: column;
  }
  .canvas {
    display: flex;
  }

  .canvas.weft {
    flex-direction: column;
  }

  .canvas.warp {
    flex-direction: row;
  }

  .canvas :global(canvas) {
    flex-grow: 1;
  }
</style>
