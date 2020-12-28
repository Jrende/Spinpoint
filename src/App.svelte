<script>
  import {Grid, ThreadingForm, TreadlingForm, TieupForm, WeaveDisplay, RowColorPicker } from './components';
  import ui from './stores/UI';
  import draft from './stores/Draft';
</script>

<main style="
             grid-template-rows: {`auto ${$ui.canvasSize}px 1fr`};
             grid-template-columns: {`auto ${$ui.canvasSize}px 1fr`};
             ">
  <div class="tieup-container">
    <TieupForm />
  </div>
  <div class="warp-colors">
    <RowColorPicker length={$draft.warpCount} colors={$draft.warpColors} />
  </div>
  <div class="threading-container">
    <ThreadingForm />
  </div>
  <div class="weft-colors">
    <RowColorPicker length={$draft.pickCount} colors={$draft.weftColors} vertical={true} />
  </div>
  <div class="treadling-container">
    <TreadlingForm />
  </div>
  <div class="weave-display-container">
    <WeaveDisplay />
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }

  main {
    grid-gap: 16px;
    padding: 16px;
    display: grid;

    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .tieup-container {
    grid-row: 2;
    grid-column: 2;
  }

  .threading-container {
    grid-row: 2;
    grid-column: 3;
  }

  .treadling-container {
    grid-row: 3;
    grid-column: 2;
  }

  .weave-display-container {
    grid-row: 3;
    grid-column: 3;
  }

  .warp-colors {
    grid-row: 1;
    grid-column: 3;
  }

  .weft-colors {
    grid-row: 3;
    grid-column: 1;
  }

  main > div {
  }
</style>
