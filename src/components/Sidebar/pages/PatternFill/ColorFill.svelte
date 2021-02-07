<script>
  import draft from '../../../../stores/Draft';
  import draftUtil from '../../../../util/DraftUtil';
  import ui from '../../../../stores/UI';
  import Grid from '../../../Grid/Grid.svelte';
  import gridIcon from 'icons/grid.svg';
  import { line } from '../../../../util/MathUtil';
  import { _ } from 'svelte-i18n'

  let length = 1;
  let width = 1;
  let warpOrWeft = 'warp'
  $: availableColors = $draft.get('yarn')
    .map(y => y.get('color'))
    .toJS()
    .map(c => tinycolor.fromRatio(c));

  let colors = [0];
  let grid;
  let selectedColor;

  function switchDirection() {
    if(warpOrWeft === 'warp') {
      warpOrWeft = 'weft';
    } else {
      warpOrWeft = 'warp';
    }
    [length, width] = [width, length];
  }

  function inc() {
    if(warpOrWeft === 'warp') {
      length++;
      colors.push(0);
    } else {
      width++;
      colors.push(0);
    }
  }

  function dec() {
    if(warpOrWeft === 'warp') {
      length--;
    } else {
      width--;
    }
  }

  function updateLength(newLength) {
    if(warpOrWeft === 'warp') {
      length = newLength;
    } else {
      width = newLength;
    }
    for(let i = 0; i < newLength; i++) {
      if(colors[i] === undefined) {
        colors[i] = 0;
      }
    }
    colors.splice(newLength, colors.length);
  }

  function getIndex(event) {
    let rect = grid.getBoundingClientRect();
    let pos = [
      event.clientX - rect.left,
      event.clientY - rect.top
    ]
    let [i, j] = grid.getCellAtPos(pos);
    let index;
    if(warpOrWeft === 'warp') {
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


  function apply() {
    let newPattern = draftUtil.applyColor($draft, colors, warpOrWeft);
    draft.update(value => newPattern);
  }

</script>
<button on:click={switchDirection} >Switch warp/weft</button>
<div class="controls">
  <fieldset>
    <label for="length">length</label>
    <input
      type="number"
      id="length"
      value=1
      size=2
      on:input={(e) => updateLength(e.target.value)}
      />
  </fieldset>
</div>
<div class={'grid ' + warpOrWeft}>
  <Grid
    bind:this={grid}
    xCount={length}
    yCount={width}
    toggleCell={toggleCell}
    onClick={onClick}
    />
</div>
<ul class="colors">
  {#each availableColors as color, i}
    <li>
      <button
        on:click={() => selectedColor = i}
        style={`background-color: ${color.toHexString()}`}>
      </button>
    </li>
  {/each}
</ul>
<button on:click={apply}>Apply</button>
<style>

  .grid {
    display: flex;
    justify-content: center;
    align-content: center;
    margin: auto;
  }

  .grid button {
    margin: 0;
    width: 30px;
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
    margin: 2.5px
  }

</style>
