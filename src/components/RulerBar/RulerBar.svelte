<script>
  import ui from '../../stores/UI';
  import draft from '../../stores/Draft';

  export let width = 0;
  export let height = 0;
  export let position;
  export let stepCount;
  export let distance;

  let stepsContainerHeight;
  let stepsContainerWidth;
  let guideContainer;
  let steps = [];
  $: vertical = height > width;
  $: cellSize = $ui.cellSize;
  $: ch = cellSize / 2.0;
  $: containerPos = [position[0] * ch, position[1] * ch];

  $: scrollPos = $ui.scrollPos[vertical ? 1 : 0];
  $: transform = `translate${vertical ? 'Y' : 'X'}(${scrollPos / 2.0}px)`;
  $: shaftCount = $draft.shaftCount;
  $: treadleCount = $draft.treadleCount;
  $: cellSize = $ui.cellSize;

  $: {
    if (vertical) {
      stepsContainerHeight = height - ch * (shaftCount + 6) - 4;
      stepsContainerWidth = ch;
    } else {
      stepsContainerHeight = ch;
      stepsContainerWidth = width - ch * (treadleCount + 4) + 4;
    }
  }

  $: {
    steps = [];
    for (let i = 0; i < stepCount / distance; i++) {
      let step = i * distance;
      let right = `${(step * cellSize) / 2}px`;
      if (step > 10) {
        right += ` - ${Math.floor(Math.log10(step))}em / 2`;
      } else if (step > 0) {
        right += ` - 0.5ex`;
      }
      right = `calc(${right})`;

      steps.push([step, right]);
    }
  }
</script>

<div
  bind:this={guideContainer}
  class="steps-container"
  class:vertical
  style={`
  right: ${containerPos[0]}px;
  bottom: ${containerPos[1]}px;
  height: ${stepsContainerHeight}px;
  width: ${stepsContainerWidth}px
  `}
>
  <div
    class="steps"
    style={`
    height: ${ch}px;
    font-size: ${cellSize / 5}pt;
    transform: ${transform};
    `}
  >
    {#each steps as step}
      <span style={`${vertical ? 'bottom' : 'right'}: ${step[1]}`}
        >{step[0]}</span
      >
    {/each}
  </div>
</div>

<style>
  .steps-container {
    position: absolute;
    overflow: hidden;
  }

  .steps {
    display: flex;
    align-items: center;
    position: absolute;
    right: 0px;
    bottom: 4px;
  }

  .vertical {
    right: calc(1em - 8px);
    writing-mode: vertical-lr;
  }

  .vertical .steps {
    right: 0.6em;
    bottom: 0px;
  }

  .steps span {
    position: absolute;
    right: 0;
  }
</style>
