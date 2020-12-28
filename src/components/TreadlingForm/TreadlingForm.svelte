<script>
  import Grid from '../Grid/Grid.svelte';
  import draft from '../../stores/Draft';
  import ui from '../../stores/UI';

  let grid;
  $: if(grid !== undefined) {
    $draft.treadling;
    grid.drawForm();
  }

  function onClick(x, y) {
    let t = $draft.treadling;
    if(t[x] === y) {
      t[x] = undefined;
    } else {
      t[x] = y;
    }
    draft.update((value) => ({
      ...value,
      treadling: t
    }));
  }

</script>

<Grid
  bind:this={grid}
  xCellCount={$draft.treadleCount}
  yCellCount={$draft.pickCount}
  borderSize={$ui.borderSize}
  cellSize={$ui.cellSize}
  vertical={true}
  toggleCell={(x, y) => {
    return $draft.treadling[x] === y;
  }}
  onClick={onClick}
/>

<style></style>
