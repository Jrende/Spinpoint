<script>
  import Grid from '../Grid/Grid.svelte';
  import draft from '../../stores/Draft';
  import ui from '../../stores/UI';

  let grid;

  $: if(grid !== undefined) {
    $draft.tieup;
    grid.drawForm();
  }

  function onClick(x, y) {
    let t = $draft.tieup;
    t[x][y] = t[x][y] === 1 ? 0 : 1;
    draft.update(value => ({
      ...value,
      tieup: t
    }));
  }
</script>

<Grid
  bind:this={grid}
  xCellCount={$draft.shaftCount}
  yCellCount={$draft.treadleCount}
  borderSize={$ui.borderSize}
  cellSize={$ui.cellSize}
  vertical={false}
  toggleCell={(x, y) => {
    return $draft.tieup[x][y] === 1;
  }}
  onClick={onClick}
  />

<style></style>
