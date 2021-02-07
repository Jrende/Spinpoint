<script>
  import { getContext } from 'svelte';

  export let tabId;
  let { selectedId } = getContext('tabs');

  $: selected = $selectedId === tabId;
</script>

{#if selected}
  <slot />
{/if}

<style>
</style>
