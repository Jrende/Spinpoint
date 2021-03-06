<script context="module">
  import { waitLocale } from 'svelte-i18n';

  export async function preload() {
    return waitLocale();
  }
</script>

<script>
  import { Router, Route } from 'svelte-navigator';
  import { isLoading } from 'svelte-i18n';
  import { Sidebar } from './components';
  import ColorPickerDialog from './components/ColorPickerDialog/ColorPickerDialog.svelte';
  import Editor from './pages/Editor.svelte';
  import Help from './pages/Help.svelte';

  export let url;
</script>

{#if !$isLoading}
  <Router {url} basepath="/weaver">
    <div class="application">
      <Sidebar />
      <Route path="about" component={Help} />
      <Route path="/" component={Editor} />
    </div>
  </Router>
{/if}
<ColorPickerDialog />

<style>
  .application {
    flex-grow: 1;
    display: grid;
    grid-template-columns: auto 1fr;
  }
</style>
