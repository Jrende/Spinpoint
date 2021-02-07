<script>
  import draft from '../../../../stores/Draft';
  import draftUtil from '../../../../util/DraftUtil';
  import Grid from '../../../Grid/Grid.svelte';
  import gridIcon from 'icons/grid.svg';
  import { _ } from 'svelte-i18n';

  let grid;
  let mirroredRepeat = true;
  let warpOrWeft = 'warp';

  let isDragging = false;
  let startPos = undefined;
  let linePoints = [];

  let xCount;
  let yCount;
  let cellData = [];

  $: {
    let treadleCount = $draft.get('treadleCount');
    let shaftCount = $draft.get('shaftCount');
    if (warpOrWeft === 'warp') {
      xCount = shaftCount;
      yCount = shaftCount;
    } else {
      xCount = treadleCount;
      yCount = treadleCount;
    }

    normalizeCellData();
  }

  function normalizeCellData() {
    cellData.splice(yCount, cellData.length);
    cellData = cellData.map((v) => (v > xCount - 1 ? undefined : v));
  }

  function increment() {
    if (warpOrWeft === 'warp') {
      xCount++;
    } else if (warpOrWeft === 'weft') {
      yCount++;
    }
  }

  function decrement() {
    if (warpOrWeft === 'warp') {
      xCount--;
    } else if (warpOrWeft === 'weft') {
      yCount--;
    }
  }

  function apply() {
    let c;
    if (warpOrWeft === 'warp') {
      c = xCount;
    } else if (warpOrWeft === 'weft') {
      c = yCount;
    }
    let newPattern = draftUtil.applyPattern(
      $draft,
      cellData.map((v) => c - 1 - v),
      warpOrWeft,
      mirroredRepeat
    );
    draft.set(newPattern);
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
  <div class="button-group">
    <div class="warp">
      <input
        type="radio"
        id="warp"
        name="warp-or-weft"
        value="warp"
        class:notActive={warpOrWeft === undefined}
        bind:group={warpOrWeft}
      />
      <label for="warp">{@html gridIcon}</label>
    </div>
    <div class="weft">
      <input
        type="radio"
        id="weft"
        name="warp-or-weft"
        value="weft"
        bind:group={warpOrWeft}
      />
      <label for="weft">{@html gridIcon}</label>
    </div>
  </div>
  {#if warpOrWeft !== undefined}
    <div class={'canvas ' + warpOrWeft}>
      <Grid
        bind:this={grid}
        {xCount}
        {yCount}
        {toggleCell}
        onMouseDown={onGridMouseDown}
        onMouseUp={onGridMouseUp}
        disabled={warpOrWeft === undefined}
      />
      <button on:click={decrement}>-</button>
      <button on:click={increment}>+</button>
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
    <button on:click={apply}>{$_('page.pattern_fill.apply')}</button>
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
    border: 1px solid var(--color-2);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-2);
    color: var(--color-1);
  }

  .button-group input:checked + label {
    background-color: var(--color-1);
    color: var(--color-2);
  }

  .button-group input:checked + label :global(svg) {
    stroke: var(--color-2);
    fill: var(--color-2);
  }

  .button-group div {
    border-radius: 8px;
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

  .warp :global(svg) {
    width: 75px;
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
