<script>
  import { getContext } from 'svelte';

  export let tabId;
  export let open = false;

  let context = getContext('tabs');

  let {
    selectedId,
    toggle
  } = getContext('tabs')

  function onClick() {
    toggle(tabId);
  }

  $: if(open) {
    toggle(tabId);
  }
  $: selected = $selectedId === tabId;
</script>
<button class:active={selected} on:click={onClick}><slot /></button>
<style>

</style>

