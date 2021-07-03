<script context="module">
  /* eslint import/no-duplicates: "off" */
  import { waitLocale } from 'svelte-i18n';

  export async function preload() {
    return waitLocale();
  }
</script>

<script>
  import { Router, Route } from 'svelte-navigator';
  import { isLoading } from 'svelte-i18n';
  import ColorPickerDialog from './pages/Editor/ColorPickerDialog/ColorPickerDialog.svelte';
  import Editor from './pages/Editor/Editor.svelte';
  import Help from './pages/Help.svelte';

  export let url;
</script>

{#if !$isLoading}
  <Router {url} basepath="/weaver">
    <div class="application">
      <Route path="/" component={Editor} />
      <Route path="/about" component={Help} />
    </div>
  </Router>
{/if}
<ColorPickerDialog />

<style>
  .application {
    flex-grow: 1;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto 1fr;
  }
</style>
