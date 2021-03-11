<script>
  import tinycolor from 'tinycolor2';
  import draft from '../../stores/Draft';
  import ui from '../../stores/UI';
  import downArrow from 'icons/down-arrow.svg';
  import upArrow from 'icons/up-arrow.svg';

  let isToggled = false;

  $: selectedColorIndex = $ui.get('selectedColor');
  $: selectedColor = tinycolor.fromRatio(
    $draft.getIn(['yarn', selectedColorIndex, 'color']).toJS()
  );
  $: yarns = $draft.get('yarn').toJS();

  function setColor(index) {
    ui.update((u) => u.set('selectedColor', index));
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
    <ul>
      {#each yarns as yarn, i}
        <li
          style={`background-color: ${tinycolor
            .fromRatio(yarn.color)
            .toHexString()}`}
          on:click={() => setColor(i)}
        />
      {/each}
    </ul>
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
    width: 2em;
    margin: 0;
    height: 100%;
  }

  ul {
    background-color: white;
  }

  li {
    width: 20px;
  }
</style>
