<script>
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store'

  let selectedId = writable({});
  setContext('tabs', {
    selectedId,
    toggle: (id) => {
      $selectedId = id;
    }
  });
</script>
  <div class="button-group">
    <slot></slot>
  </div>
  <slot name="content"></slot>
<style>
  .button-group {
  }
</style>

