<script>
  import tinycolor from 'tinycolor2';
  import { fromJS } from 'immutable';
  import draft from '../../../stores/Draft';
  import ui from '../../../stores/UI';
  import ColorPicker from '../../ColorPicker/ColorPicker.svelte';
  import { _ } from 'svelte-i18n'

  import add from 'icons/add.svg';

  let colors;
  $: {
    colors = $draft.get('yarn').map(y => y.get('color')).toJS().map(c => tinycolor.fromRatio(c));
  }
  let color = {r: 1.0, g: 0.0, b: 0.0};

  let newYarnName = "";
  let newYarnColor = color;
  let yarnUnderModification = 0;

  let colorPickerVisible = false;
  let colorPickerX;
  let colorPickerY;

  $: selectedYarn = $draft.getIn(['yarn', yarnUnderModification]).toJS();
  $: selectedColor = tinycolor.fromRatio(selectedYarn.color);

  function focus(elm){
    elm.focus()
  }

  function createNewYarn(event) {
    event.preventDefault();
    draft.update((value) =>
      value.update('yarn', y =>
        y.push(fromJS({ name: 'Yarn', color: { r: 1.0, g: 1.0, b: 1.0 } }))));
    yarnUnderModification = $draft.get('yarn').size - 1;
  }

  function selectYarnForModification(event, i) {
    yarnUnderModification = i;
    if(i !== $draft.get('yarn').size) {
      newYarnColor = $draft.getIn(['yarn', i, 'color']).toJS();
    }
  }

  function maybeCancel(event) {
    if(event.target === settingsElm) {
      yarnUnderModification = -1;
      event.stopPropagation();
    }
  }

  function updateYarn(event, index, yarn) {
    event.preventDefault();
    draft.update(d => d.updateIn(['yarn', index], y => fromJS({
      name: yarn.name,
      color: fromJS(newYarnColor)
    })));
    yarnUnderModification = -1;
  }

  function changeName(newName, yarnId) {
    draft.update(d => d.setIn(['yarn', yarnId, 'name'], newName));
  }

  function changeColor(newColor, yarnId) {
    draft.update(d => d.setIn(['yarn', yarnId, 'color'], fromJS(newColor)));
  }

  function deleteColor(index) {
    draft.update((value) => {
      return value.update('yarn', list => list.splice(index, 1));
    });
    yarnUnderModification = index - 1;
  }

  function showColorPicker(event) {
    event.preventDefault();
    colorPickerVisible = true;
    colorPickerX = event.clientX;
    colorPickerY = event.clientY;
  }

</script>
<div class="yarn-settings">
  <div class="container">
    <div class="add-or-remove">
      <button class="add" on:click={createNewYarn}>+</button>
      <button class="remove" on:click={() => deleteColor(yarnUnderModification)}>-</button>
    </div>
    <div class="yarns">
      {#each $draft.get('yarn').toJS() as yarn, i}
        <button
          class:selected={yarnUnderModification === i}
          class="yarn"
          on:click={(e) => selectYarnForModification(e, i)}>
          <div class="color" style={`background-color: ${colors[i].toHexString()};`}></div> 
          <div class="name">{yarn.name}</div>
        </button>
      {/each}
    </div>
  </div>
  <div class="controls">
    <fieldset>
      <label for="newYarnName">{$_('page.yarn_settings.name')}</label>
      <input type="text" id="newYarnName" value={selectedYarn.name} on:input={(e) => changeName(e.target.value, yarnUnderModification)} use:focus />
    </fieldset>
    <fieldset>
      <label for="newYarnColor">{$_('terms.color')}</label>
      <button class="yarn-color-change" style={`background-color: ${selectedColor.toHexString()};`} on:click={showColorPicker}></button>
    </fieldset>
  </div>
</div>
{#if colorPickerVisible === true}
  <ColorPicker onChange={(value) => changeColor(value, yarnUnderModification)} value={selectedYarn.color} x={colorPickerX} y={colorPickerY} onBlur={() => colorPickerVisible = false}/>
{/if}
<style>
  .container {
    display: flex;
    align-items: start;
  }

  .add-or-remove {
    margin-right: 5px;
    text-align: center;
    background-color: var(--color-2);
    padding: 4px;
    color: white;
    border-radius: 4px;
    border: 1px solid #535353;

    display: flex;
    flex-direction: column;
  }

  .add-or-remove button {
    color: var(--color-1);
    background: none;
    border: none;
    margin: 0;
    padding: 0;
  }

  .yarn {
    background: none;
    border: none;

    display: flex;
    color: var(--color-1);
    margin: 4px;
    padding: 4px 0;
    border-radius: 4px;
  }

  .yarn.selected {
    color: var(--color-2);
    background-color: var(--color-1);
  }

  .yarn:not(:first-child):before {
  }

  .name {
    margin-left: 4px;
  }

  .color {
    margin-left: 4px;
    width: 1em;
    border: 1px solid var(--color-2);
  }

  .yarns {
    background-color: var(--color-2);
    min-width: 10em;
    border-radius: 4px;
    border: 1px solid #535353;

    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .yarn-color-change {
    width: 100%;
    margin: 0;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid var(--color-2);
  }

  .controls input {
    margin: 0;
    padding: 8px;
  }

</style>
