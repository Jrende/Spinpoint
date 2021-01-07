<script>
  import { Router, Link, Route } from "svelte-navigator";
  import {
    Sidebar
  } from './components';
  import Editor from './pages/Editor.svelte';
  import Help from './pages/Help.svelte';
  import ui from './stores/UI';
  import draft from './stores/Draft';

  export let url;
</script>

<Router url="{url}">
  <div class="application">
    <Sidebar />
    <Route path="about" component="{Help}" />
    <Route path="/" component="{Editor}" />
  </div>
</Router>

<style>
  .application {
    flex-grow: 1;
    display: grid;
    grid-template-columns: auto 1fr;
  }

  main {
    grid-gap: 16px;
    padding: 16px;
    display: grid;
  }

  .tieup-container {
    grid-row: 2;
    grid-column: 2;
  }

  .threading-container {
    grid-row: 2;
    grid-column: 3;
  }

  .treadling-container {
    grid-row: 3;
    grid-column: 2;
  }

  .weave-display-container {
    grid-row: 3;
    grid-column: 3;
  }

  .warp-colors {
    grid-row: 1;
    grid-column: 3;
  }

  .weft-colors {
    grid-row: 3;
    grid-column: 1;
  }

</style>
