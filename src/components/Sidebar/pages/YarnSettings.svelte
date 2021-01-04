<script>
  import tinycolor from 'tinycolor2';
  import draft from '../../../stores/Draft';
  import ui from '../../../stores/UI';
  import ColorPicker from '../../ColorPicker/ColorPicker.svelte';

  import add from 'icons/add.svg';

  let colors;
  $: {
    colors = $draft.yarn.map(y => tinycolor.fromRatio(y.color));
  }
  let color = {r: 1.0, g: 0.0, b: 0.0};

  let newYarnName = "";
  let newYarnColor = color;
  let yarnUnderModification = -1;

  let yarnsElm;
  let settingsElm;

  function focus(elm){
    elm.focus()
  }

  function createNewYarn(event) {
    event.preventDefault();
    draft.update((value) => ({
      ...value,
      yarn: [
        ...value.yarn,
        {
          name: newYarnName,
          color: newYarnColor
        }
      ]
    }));
    newYarnName = "";
    newYarnColor = color;
  }

  function selectYarnForModification(event, i) {
    yarnUnderModification = i;
    if(i !== $draft.yarn.length) {
      newYarnColor = $draft.yarn[i].color;
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
    let newYarn = {
      ...yarn,
      color: newYarnColor
    };
    draft.update((value) => {
      value.yarn.splice(index, 1, newYarn);
      return value;
    });
    yarnUnderModification = -1;
  }

  function deleteColor(index) {
    draft.update((value) => {
      value.yarn.splice(index, 1);
      return value;
    });
    yarnUnderModification = -1;
  }

</script>
<div class="settings" on:click={maybeCancel} bind:this={settingsElm}>
  <div class="yarns" bind:this={yarnsElm}>
    {#each $draft.yarn as yarn, i}
      {#if yarnUnderModification === i}
        <form class="yarn" on:submit={() => updateYarn(event, i, yarn)}>
          <div class="top-row">
            <div>
              <label for="newYarnName">Name</label>
              <input type="text" id="newYarnName" bind:value={yarn.name} use:focus />
            </div>
            <button class="delete" on:click={() => deleteColor(i)}>Delete</button>
          </div>
          <ColorPicker onChange={(value) => newYarnColor = value} value={yarn.color} />
          <button class="primary">Save</button>
        </form>
      {:else}
        <div class="yarn">
          <button
            class="color"
            style={`
            background-color: ${colors[i].toHexString()};
            border-color: ${colors[i].isLight() ? 'black' : 'white'};
            color: ${colors[i].isLight() ? 'black' : 'white'}
            `}
            on:click={(e) => selectYarnForModification(e, i)}
            >
            {yarn.name}
          </button>
        </div>
      {/if}
    {/each}
    {#if yarnUnderModification === $draft.yarn.length}
      <form class="yarn" on:submit={createNewYarn}>
        <label for="newYarnName">Name</label>
        <input type="text" id="newYarnName" bind:value={newYarnName} use:focus />
        <ColorPicker onChange={(value) => newYarnColor = value} value={color} />
        <button class="primary">Save</button>
      </form>
    {:else}
      <button on:click={(e) => selectYarnForModification(e, $draft.yarn.length)}>
        <div class="icon">{@html add}</div>
        <span>Add new yarn</span>
      </button>
    {/if}
  </div>
</div>
<style>
  .yarns {
    padding: 10px;
    background-color: lightgray;
  }

  .yarns .yarn {
    display: flex;
    flex-direction: column;
  }

  .yarns .yarn:not(:first-child):before {
    content: "";
    height: 1.5px;
    background-color: rgba(0, 0, 0, 0.2);
    margin: 10px 0;
    position: relative;
    left: -10px;
    width: calc(100% + 20px);
  }

  .color {
    border: 1px solid black;
  }

  button {
    background-color: white;
    display: flex;
    align-items: baseline;
    width: 100%;
  }

  input {
    width: 100%;
    background-color: white;
  }

  .icon {
    width: 14px;
    height: 14px;
    margin-right: 8px;
  }

  .settings {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    min-width: 300px;
    height: 100%;
  }

  button.delete {
    width: initial;
    margin: 4px;
    background-color: red;
    color: white;
    background-color: #d91b1b;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 8px;
    margin-right: 0;
  }

  .top-row {
    display: flex;
  }

</style>
