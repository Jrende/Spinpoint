<script>
  import tinycolor from 'tinycolor2';
  import draft from '../../stores/Draft';
  import ui from '../../stores/UI';
  import downArrow from 'icons/down-arrow.svg';
  import upArrow from 'icons/up-arrow.svg';

  let isToggled = false;
  let color;
  $: {
    color = tinycolor.fromRatio($draft.yarn[$ui.selectedColor].color);
  }


  function setColor(index) {
    ui.update((value) => ({
      ...value,
      selectedColor: index
    }));
    isToggled = false;
  }

</script>

<div class="yarn-selector">
  <button
    class="color-display"
    on:click={() => isToggled = !isToggled}>
    <div
      class="color-marker"
      style={`background-color: ${color.toHexString()};`}
      >
    </div>
      <span
        class="arrow"
        style={`
        stroke: ${color.isDark() ? 'black' : 'white'};
        fill: ${color.isLight() ? 'black' : 'white'};
        `}>
        {#if isToggled === true}
          {@html upArrow}
        {:else}
          {@html downArrow}
        {/if}
      </span>
  </button>
  {#if isToggled === true}
    <ul>
      {#each $draft.yarn as yarn, i}
        <li style={`background-color: ${tinycolor.fromRatio(yarn.color).toHexString()}`} on:click={() => setColor(i)}></li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .yarn-selector {
    min-height: 2em;
    min-width: 2em;
    position: absolute;
    right: 2em;
    bottom: 2em;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    background-color: white;

    z-index: 10;
    border: 1px solid black;
  }

  .yarn-selector button {
    width: calc(100%);
    height: calc(100%);
    padding: 8px;
    margin: 0;
  }

  .yarn-selector ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .yarn-selector li {
    width: 2em;
    height: 2em;
  }

  .arrow {
    position: absolute;
    top: calc(2em - 8px);
    right: 0;
    width: 15px;
    height: 15px;
  }

  .arrow :global(svg) {
    stroke-width: 10px;
  }

  .color-marker {
    width: 12px;
    height: 12px;
    padding: 8px;
  }
</style>
