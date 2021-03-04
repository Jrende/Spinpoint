<script>
  import tinycolor from 'tinycolor2';
  import draft from '../../stores/Draft';
  import ui from '../../stores/UI';
  import downArrow from 'icons/down-arrow.svg';
  import upArrow from 'icons/up-arrow.svg';

  let isToggled = false;
  let color = tinycolor('black');
  $: {
    let selectedColor = $ui.get('selectedColor');
    let c = $draft.getIn(['yarn', selectedColor, 'color']).toJS();
    color = tinycolor.fromRatio(c);
  }

  function setColor(index) {
    ui.update((u) => u.set('selectedColor', index));
    isToggled = false;
  }
</script>

<div class="yarn-selector">
  <button
    class="color-display"
    on:click={() => (isToggled = !isToggled)}
    style={`background-color: ${color.toHexString()};`}
  >
    <span
      class="arrow"
      style={`
        stroke: ${color.isDark() ? 'black' : 'white'};
        fill: ${color.isLight() ? 'black' : 'white'};
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
      {#each $draft.get('yarn').toJS() as yarn, i}
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
  }

  .yarn-selector :global(svg) {
    width: 12px;
  }
</style>
