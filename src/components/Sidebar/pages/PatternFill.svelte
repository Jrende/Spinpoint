<script>
  import draft from '../../../stores/Draft';
  import draftUtil from '../../../util/DraftUtil';
  import ui from '../../../stores/UI';
  import Grid from '../../Grid/Grid.svelte';
  import gridIcon from 'icons/grid.svg';
  import { line } from '../../../util/MathUtil';

  let prevWarpOrWeft;

  let grid;
  let xCount = $draft.get('treadleCount');
  let yCount = $draft.get('shaftCount');
  let mirroredRepeat = true;
  let cellData = new Array(xCount);
  cellData = [0,1,2,3];
  let warpOrWeft = 'warp';

  let isDragging = false;
  let fromPos = undefined;
  let linePoints = [];

  $: {
    if(warpOrWeft !== prevWarpOrWeft) {
      let temp = xCount;
      xCount = yCount;
      yCount = temp;
      prevWarpOrWeft = warpOrWeft;
    }
  }


  function increment() {
    if(warpOrWeft === 'warp') {
      xCount++;
    } else if(warpOrWeft === 'weft') {
      yCount++;
    }
  }

  function decrement() {
    if(warpOrWeft === 'warp') {
      xCount--;
    } else if(warpOrWeft === 'weft') {
      yCount--;
    }
  }

  function apply() {
    let newPattern = draftUtil.applyPattern($draft, cellData, warpOrWeft, mirroredRepeat);
    draft.update(value => newPattern);
    $ui.selectedMenu = -1;
  }

  function onGridClick(i, j) {
    if(isDragging) {
      return;
    }
    if(warpOrWeft === 'warp') {
      cellData[i] = j;
    } else if(warpOrWeft === 'weft') {
      cellData[j] = i;
    }
    grid.drawForm(xCount, yCount, false);
  }

  function onGridMouseDown(i, j, event) {
    fromPos = [i, j]
    linePoints = [[i, j]];
  }

  function onGridMouseMove(i, j, event) {
    if(event.buttons === 0) {
      fromPos = undefined;
      isDragging = false;
      return;
    }
    if((event.buttons & 1) && ((event.movementX !== 0) || (event.movementY !== 0))) {
      isDragging = true;
    }
    let lp = line(...fromPos, i, j);
    linePoints = [];
    lp.forEach(p => {
      if(warpOrWeft === 'weft') {
        linePoints[p[1]] = p[0];
      } else if(warpOrWeft === 'warp') {
        linePoints[p[0]] = p[1];
      }
    });
    linePoints = addArrays(linePoints, cellData);
    grid.drawForm(xCount, yCount, false);
  }

  function onGridMouseUp(i, j, event) {
    if(isDragging) {
      cellData = addArrays(linePoints, cellData);
      fromPos = undefined;
      linePoints = undefined;
      isDragging = false;
      grid.drawForm(xCount, yCount, false);
    }
  }

  function addArrays(left, right) {
    let ret = [...right];
    for(let i = 0; i < left.length; i++) {
      if(left[i] !== undefined) {
        ret[i] = left[i];
      }
    }
    return ret;
  }

  function toggleCell(i, j) {
    let x, y;
    if(warpOrWeft === 'warp') {
      x = j;
      y = i;
    } else if(warpOrWeft === 'weft') {
      x = i;
      y = j;
    }

    if(isDragging) {
      return linePoints[x] === y;
    } else {
      return cellData[x] === y;
    }
  }

</script>
<div class="pattern-fill">
  <div class="button-group">
    <div class="warp">
      <input
        type="radio"
              id="warp"
              name="warp-or-weft"
              value="warp"
              class:notActive={warpOrWeft === undefined}
              bind:group={warpOrWeft}>
      <label for="warp">Warp {@html gridIcon}</label>
    </div>
    <div class="weft">
      <input
        type="radio"
              id="weft"
              name="warp-or-weft"
              value="weft"
              bind:group={warpOrWeft}>
      <label for="weft">Weft {@html gridIcon}</label>
    </div>
  </div>
  {#if warpOrWeft !== undefined}
    <div class={"canvas " + warpOrWeft}>
      <Grid
        bind:this={grid}
        xCount={xCount}
        yCount={yCount}
        toggleCell={toggleCell}
        onClick={onGridClick}
        onMouseDown={onGridMouseDown}
        onMouseUp={onGridMouseUp}
        onMouseMove={onGridMouseMove}
        disabled={warpOrWeft === undefined}
        />
        <button on:click={decrement}>-</button>
        <button on:click={increment}>+</button>
    </div>
    <div>
      <label for="mirrored-repeat">Mirrored repeat</label>
      <input type="checkbox" bind:checked={mirroredRepeat} name="mirrored-repeat" id="mirrored-repeat" />
    </div>
    <button on:click={apply}>Apply</button>
  {/if}
</div>
<style>
  .pattern-fill {
    display: flex;
    flex-direction: column;
  }

  .button-group :global(svg) {
    width: 50px;
    stroke: var(--color-1);
    fill: var(--color-1);
  }

  .button-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin: 12px 0px;
  }

  .button-group input {
    display: none;
  }

  .button-group label {
    padding: 4px;
    height: 50px;
    cursor: pointer;
    border: 3px solid var(--color-2);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-2);
    color: var(--color-1);
  }

  input:checked + label {
    background-color: var(--color-1);
    color: var(--color-2);
  }

  input:checked + label :global(svg) {
    stroke: var(--color-2);
    fill: var(--color-2);
  }

  .button-group div {
    flex-grow: 1;
    text-align: center;
    cursor: pointer;
    background-color: white;
  }

  .button-group div:first-child label {
    border-radius: 8px 0 0 8px;
    border-right: 2px solid rgba(0, 0, 0, 0.2);
  }

  .button-group div:last-child label {
    border-left: 0;
    border-radius: 0 8px 8px 0;
  }

  .weft :global(svg) {
    transform: rotateZ(90deg);
  }

  .warp label {
    flex-direction: column;
  }

  .canvas {
    display: flex;
  }

  .canvas button {
    margin: 0;
    background-color: gray;
    border: 1px solid black;
    min-width: 30px;
    min-height: 30px;
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
