<script>
  import ui from 'stores/UI';
  $: from = $ui.selectFrom;
  $: to = $ui.selectTo;
  $: length = to - from + 1;
  $: isDragging = $ui.isDragging;
  $: hoverCell = $ui.hoverCell;
</script>

<div class="info-bar">
  {#if isDragging}
    <span>{`${from} → ${to} (${length})`}</span>
  {:else}
    <span>{`${hoverCell[0]}, ${hoverCell[1]}`}</span>
  {/if}
</div>

<style>
  .info-bar {
    display: flex;
    justify-content: end;
    min-height: 20px;
    width: 100%;
    background-color: white;
    pointer-events: all;
    z-index: 5;
    border-top: 1px solid black;
    font-size: 125%;
  }

  .info-bar span {
    margin-left: 1em;
  }
</style>
