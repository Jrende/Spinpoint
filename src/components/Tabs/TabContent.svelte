<script>
  import { getContext } from 'svelte';

  export let tabId;
  let {
    selectedId,
    newId,
    toggle
  } = getContext('tabs')

  $: selected = $selectedId === tabId;
</script>
{#if selected}
<slot></slot>
{/if}
<style>
</style>

