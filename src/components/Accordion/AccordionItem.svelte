<script>
  let isToggled = false;
  function toggle() {
    isToggled = !isToggled;
  }
</script>

<button on:click={toggle}>
  {#if isToggled}
    <span>▲</span>
  {:else}
    <span>▼</span>
  {/if}
  <slot name="title" />
</button>
{#if isToggled}
  <slot />
{/if}

<style>
  button {
    display: flex;
  }

  span {
    margin-right: 4px;
  }
</style>
