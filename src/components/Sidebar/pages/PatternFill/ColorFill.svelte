<script>
  import draft from '../../../../stores/Draft';
  import draftUtil from '../../../../util/DraftUtil';
  import Grid from '../../../Grid/Grid.svelte';
  import tinycolor from 'tinycolor2';

  export let warpOrWeft;
  export let disabled;

  $: availableColors = $draft.yarn
    .map((y) => y.color)
    .map((c) => tinycolor.fromRatio(c));

  let colors = [0];
  let grid;
  let selectedColor;

  let xCount = 1;
  let yCount = 1;
  let oldWarpOfWeft;
  let oldLength;

  $: {
    if (oldWarpOfWeft !== warpOrWeft) {
      [xCount, yCount] = [yCount, xCount];
      oldWarpOfWeft = warpOrWeft;
    }
  }

  $: {
    let length = warpOrWeft === 'warp' ? xCount : yCount;
    if (oldLength !== length) {
      for (let i = 0; i < length; i++) {
        if (colors[i] === undefined) {
          colors[i] = 0;
        }
      }
      colors.splice(length, colors.length);
      oldLength = length;
    }
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
    let ret = $draft.yarn[c].color;
    return ret;
  }

  function onClick(event) {
    let index = getIndex(event);
    colors[index] = selectedColor;
    let length = warpOrWeft === 'warp' ? xCount : yCount;
    grid.drawForm(length, 1, false);
  }

  export function apply() {
    let newPattern = draftUtil.applyColor($draft, colors, warpOrWeft);
    draft.set(newPattern);
  }
</script>

<div class={'grid ' + warpOrWeft}>
  <Grid
    bind:this={grid}
    bind:xCount
    bind:yCount
    resizeX={warpOrWeft === 'warp'}
    resizeY={warpOrWeft === 'weft'}
    {toggleCell}
    {onClick}
    {disabled}
  />
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
