<script>
  import Grid from '../Grid/Grid.svelte';
  import draft from '../../stores/Draft';
  import ui from '../../stores/UI';

  let grid;
  $: if(grid !== undefined) {
    $draft.threading;
    grid.drawForm();
  }

  function onClick(x, y) {
    let t = $draft.threading;
    if(t[x] === y) {
      t[x] = undefined;
    } else {
      t[x] = y;
    }
    draft.update((value) => ({
      ...value,
      threading: t
    }));
  }

</script>
<Grid
  bind:this={grid}
  xCellCount={$draft.shaftCount}
  yCellCount={$draft.warpCount}
  borderSize={$ui.borderSize}
  vertical={false}
  toggleCell={(x, y) => {
    return $draft.threading[x] === y;
  }}
  onClick={onClick}
  />

<style></style>
