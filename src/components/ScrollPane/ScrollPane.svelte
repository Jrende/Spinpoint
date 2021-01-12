<script>
  import draft from '../../stores/Draft';
  import ui from '../../stores/UI';

  let width = $draft.get('warpCount') * $ui.get('cellSize');
  let height = $draft.get('pickCount') * $ui.get('cellSize');

</script>
<div
      class="scrollpane"
      style={`width: ${width}px; height: ${height}px;`}
      >
</div>
<style>
  .scrollpane {
    background-color: #5959308f;
    pointer-events: none;
  }
</style>
