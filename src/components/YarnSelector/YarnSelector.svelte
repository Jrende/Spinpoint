<script>
  import tinycolor from 'tinycolor2';
  import draft from '../../stores/Draft';
  import ui from '../../stores/UI';
  import downArrow from 'icons/down-arrow.svg';
  import upArrow from 'icons/up-arrow.svg';

  let isToggled = false;

  $: selectedColorIndex = $ui.selectedColor;
  let selectedColor;
  $: selectedColor = tinycolor.fromRatio($draft.yarn[selectedColorIndex].color);
  $: selectedColorBorder = selectedColor.isDark() ? 'white' : 'black';
  $: yarns = $draft.yarn;

  function setColor(index) {
    ui.update((draft) => {
      draft.selectedColor = index;
    });
    isToggled = false;
  }
</script>

<div class="yarn-selector">
  <button
    class="color-display"
    on:click={() => (isToggled = !isToggled)}
    style={`background-color: ${selectedColor.toHexString()};`}
  >
    <span
      class="arrow"
      style={`
        stroke: ${selectedColor.isDark() ? 'black' : 'white'};
        fill: ${selectedColor.isLight() ? 'black' : 'white'};
        `}
    >
      {#if isToggled === true}
        {@html upArrow}
      {:else}
        {@html downArrow}
      {/if}
    </span>
  </button>
  {#if isToggled === true}
    <div class="color-dropdown">
      {#each yarns as yarn, i}
        <button
          class:selected={selectedColorIndex === i}
          class="item"
          style={`background-color: ${tinycolor
            .fromRatio(yarn.color)
            .toHexString()};
          `}
          on:click={() => setColor(i)}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .yarn-selector {
    padding: 4px;
    border: 1px solid black;
    position: relative;
  }

  .arrow {
    position: absolute;
    bottom: 2px;
    right: 6px;
  }

  .yarn-selector :global(svg) {
    width: 12px;
  }

  .color-display {
    width: 2rem;
    margin: 0;
    height: 100%;
  }

  .color-dropdown {
    position: absolute;
    left: 0;
    right: 0;

    z-index: 5;
    background-color: white;
    margin: 0;
    padding: 4px;
    border: 1px solid black;

    display: flex;
    align-items: center;
    flex-direction: column;
  }

  .item:not(:first-child) {
    margin-top: 4px;
  }

  .item {
    display: block;
    margin: 0;
    padding: 0;
    margin-top: 4px;
    border: 1px solid black;
    height: 1.5rem;
    width: 1.5rem;
  }

  .item.selected {
    margin: 0.25rem;
    margin-top: calc(0.25rem + 4px);
    height: 1.25rem;
    width: 1.25rem;
  }
</style>
