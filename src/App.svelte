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
  $: {
    console.log("url: ", url);
  }
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
    display: flex;
    flex-direction: row;

    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
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
