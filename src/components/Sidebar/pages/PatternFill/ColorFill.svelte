<script>
  import draft from '../../../../stores/Draft';
  import draftUtil from '../../../../util/DraftUtil';
  import Grid from '../../../Grid/Grid.svelte';
  import tinycolor from 'tinycolor2';

  export let warpOrWeft;
  export let disabled;

  let length = 1;
  let width = 1;
  $: availableColors = $draft
    .get('yarn')
    .map((y) => y.get('color'))
    .toJS()
    .map((c) => tinycolor.fromRatio(c));

  let colors = [0];
  let grid;
  let selectedColor;

  let xCount;
  let yCount;

  $: {
    if (warpOrWeft === 'warp') {
      xCount = length;
      yCount = 1;
    } else {
      xCount = 1;
      yCount = length;
    }
  }

  function updateLength(newLength) {
    if (warpOrWeft === 'warp') {
      length = newLength;
    } else {
      width = newLength;
    }
    for (let i = 0; i < newLength; i++) {
      if (colors[i] === undefined) {
        colors[i] = 0;
      }
    }
    colors.splice(newLength, colors.length);
  }

  function getIndex(event) {
    let rect = grid.getBoundingClientRect();
    let pos = [event.clientX - rect.left, event.clientY - rect.top];
    let [i, j] = grid.getCellAtPos(pos);
    let index;
    if (warpOrWeft === 'warp') {
      index = i;
    } else {
      index = j;
    }
    return index;
  }

  function toggleCell(i, j) {
    let index = warpOrWeft === 'warp' ? j : i;
    let c = colors[index];
    let ret = $draft.getIn(['yarn', c, 'color']).toJS();
    return ret;
  }

  function onClick(event) {
    let index = getIndex(event);
    colors[index] = selectedColor;
    grid.drawForm(length, width, false);
  }

  export function apply() {
    let newPattern = draftUtil.applyColor($draft, colors, warpOrWeft);
    draft.set(newPattern);
  }
</script>

<div class="controls">
  <fieldset>
    <label for="length">length</label>
    <input
      type="number"
      id="length"
      value="1"
      size="2"
      on:input={(e) => updateLength(e.target.value)}
    />
  </fieldset>
</div>
<div class={'grid ' + warpOrWeft}>
  <Grid bind:this={grid} {xCount} {yCount} {toggleCell} {onClick} {disabled} />
</div>
<ul class="colors">
  {#each availableColors as color, i}
    <li>
      <button
        on:click={() => (selectedColor = i)}
        style={`background-color: ${color.toHexString()}`}
      />
    </li>
  {/each}
</ul>

<style>
  .grid {
    display: flex;
    justify-content: center;
    align-content: center;
    margin: auto;
  }

  .weft {
    flex-direction: column;
    max-width: 30px;
  }

  .warp {
    flex-direction: row;
    max-height: 30px;
  }

  .colors {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    margin: 0;
    padding: 0;
    justify-content: center;
  }

  .colors li button {
    height: 25px;
    width: 25px;
    margin: 2.5px;
  }
</style>
