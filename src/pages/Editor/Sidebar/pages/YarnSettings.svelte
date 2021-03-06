<script>
  import tinycolor from 'tinycolor2';
  import draft from '../../../../stores/Draft';
  import ui from '../../../../stores/UI';
  import { _ } from 'svelte-i18n';
  import { onMount, onDestroy } from 'svelte';
  import { colorPickerStore } from '../../ColorPickerDialog/ColorPickerStore.js';

  let colors;
  $: {
    colors = $draft.yarn.map((y) => y.color).map((c) => tinycolor.fromRatio(c));
  }
  let color = { r: 1.0, g: 0.0, b: 0.0 };

  let newYarnColor = color;
  let yarnUnderModification = -1;
  let colorListener;

  $: selectedYarn = $draft.yarn[yarnUnderModification];
  $: selectedColor = tinycolor.fromRatio(selectedYarn?.color);

  function focus(elm) {
    elm.focus();
  }

  onMount(() => {
    colorListener = colorPickerStore.onColorChange((color) => {
      if (yarnUnderModification !== -1) {
        draft.update((temp) => {
          temp.yarn[yarnUnderModification].color = color;
        });
      }
    });
  });

  onDestroy(() => {
    colorPickerStore.removeListener(colorListener);
  });

  function createNewYarn(event) {
    event.preventDefault();
    draft.update((temp) => {
      temp.yarn.push({ name: 'Yarn', color: { r: 1.0, g: 1.0, b: 1.0 } });
    });
    yarnUnderModification = $draft.yarn.size - 1;
  }

  function selectYarnForModification(event, i) {
    yarnUnderModification = i;
    ui.update((temp) => {
      temp.selectedColor = yarnUnderModification;
    });
    if (i !== $draft.yarn.size) {
      newYarnColor = $draft.yarn[i].color;
    }
  }

  function changeName(newName, yarnId) {
    draft.update((temp) => {
      temp.yarn[yarnId].name = newName;
    });
  }

  function deleteColor(index) {
    draft.update((temp) => {
      temp.yarn.splice(index, 1);
    });
    yarnUnderModification = index - 1;
  }

  function showColorPicker(event) {
    event.preventDefault();
    colorPickerStore.showColorPicker(
      event.pageX,
      event.pageY,
      selectedYarn.color
    );
  }
</script>

<div class="yarn-settings">
  <div class="container">
    <div class="add-or-remove">
      <button class="add" on:click={createNewYarn}>+</button>
      <button class="remove" on:click={() => deleteColor(yarnUnderModification)}
        >-</button
      >
    </div>
    <div class="yarns">
      {#each $draft.yarn as yarn, i}
        <button
          class:selected={yarnUnderModification === i}
          class="yarn"
          on:click={(e) => selectYarnForModification(e, i)}
        >
          <div
            class="color"
            style={`background-color: ${colors[i].toHexString()};`}
          />
          <div class="name">{yarn.name}</div>
        </button>
      {/each}
    </div>
  </div>
  {#if yarnUnderModification !== -1}
    <div class="controls">
      <fieldset>
        <label for="newYarnName">{$_('page.yarn_settings.name')}</label>
        <input
          type="text"
          id="newYarnName"
          value={selectedYarn.name}
          on:input={(e) => changeName(e.target.value, yarnUnderModification)}
          use:focus
        />
      </fieldset>
      <fieldset>
        <label for="newYarnColor">{$_('terms.color')}</label>
        <button
          class="yarn-color-change"
          style={`background-color: ${selectedColor.toHexString()};`}
          on:click={showColorPicker}
        />
      </fieldset>
    </div>
  {/if}
</div>

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
