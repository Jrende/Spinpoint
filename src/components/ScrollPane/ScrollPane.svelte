<script>
  import draft from '../../stores/Draft';
  import ui from '../../stores/UI';
  import { onMount } from 'svelte';


  onMount(() => {
  });

  let width = $draft.warpCount * $ui.cellSize;
  let height = $draft.pickCount * $ui.cellSize;

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
