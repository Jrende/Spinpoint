<script>
  import draft from '../../../stores/Draft';
  import ui from '../../../stores/UI';
  import Grid from '../../Grid/Grid.svelte';
</script>
<div class="pattern-fill">
  <div class="button-group">
    <div>
      <input type="radio" id="warp" name="warp-or-weft" value="warp">
      <label for="warp">Warp</label>
    </div>
    <div>
      <input type="radio" id="weft" name="warp-or-weft" value="weft">
      <label for="weft">Weft</label>
    </div>
  </div>
  <Grid xCellCount={4} yCellCount={4} />
</div>
<style>
  .pattern-fill {
    display: flex;
    flex-direction: column;
  }

  .button-group {
    display: flex;
  }

</style>
