<script>
  import draft from '../../stores/Draft';
  import ui from '../../stores/UI';

  let width = $draft.get('warpCount') * $ui.get('cellSize');
  let height = $draft.get('pickCount') * $ui.get('cellSize');

</script>
<div
      class="scrollpane"
      style={`left: ${width}px; top: ${height}px;`}
      >
</div>
<style>
  .scrollpane {
    background-color: #5959308f;
    pointer-events: none;
    position: relative;
    width: 10px;
    height: 10px;
  }
</style>
